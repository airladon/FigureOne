// @ts-check
const td = require('typedoc');
const fs = require('fs');

/** @param {td.Application} app */
exports.load = function(app) {
  // Phase 1: Strip the first path component from module names.
  // With entryPointStrategy "expand", TypeDoc generates module names like
  // "js/figure/Element" — this strips them to "Element".
  app.converter.on(td.Converter.EVENT_CREATE_DECLARATION, (_context, reflection) => {
    if (reflection.kind === td.ReflectionKind.Module) {
      const idx = reflection.name.indexOf('/');
      if (idx !== -1) {
        reflection.name = reflection.name.substring(idx + 1);
      }
    }
  });

  // Phase 2: Render @property tags as a formatted inline list.
  //
  // Type aliases with @interface use @property JSDoc tags to document their
  // members. TypeDoc creates child property reflections but excludeNotDocumented
  // removes them (they have no inline comments). The @property descriptions
  // would be applied during resolution — too late.
  //
  // Instead of fighting the exclusion, we collect property info (name, type,
  // description) during creation and later render it as a compact list in the
  // parent's comment summary. This gives a readable format without needing to
  // click into each property.

  // Store property info: parentId → [{ name, typeStr, typeParts, content }]
  const propertyInfo = new Map();

  /**
   * Convert a TypeDoc Type to an array of display parts.
   * ReferenceTypes become {@link} tags; everything else becomes code.
   */
  function typeToParts(type) {
    if (!type) return [{ kind: 'code', text: '`unknown`' }];

    if (type.constructor.name === 'ReferenceType') {
      return [{ kind: 'inline-tag', tag: '@link', text: ` ${type.name}` }];
    }

    if (type.constructor.name === 'UnionType' && type.types) {
      // Filter out 'undefined' — optional properties imply it via default values
      const filtered = type.types.filter(
        t => !(t.constructor.name === 'IntrinsicType' && t.name === 'undefined'),
      );
      const members = filtered.length > 0 ? filtered : type.types;
      if (members.length === 1) return typeToParts(members[0]);
      const parts = [];
      for (let i = 0; i < members.length; i++) {
        if (i > 0) parts.push({ kind: 'text', text: ' \\| ' });
        parts.push(...typeToParts(members[i]));
      }
      return parts;
    }

    if (type.constructor.name === 'ArrayType' && type.elementType) {
      return [...typeToParts(type.elementType), { kind: 'text', text: '[]' }];
    }

    if (type.constructor.name === 'LiteralType') {
      return [{ kind: 'code', text: `\`${String(type.value)}\`` }];
    }

    // IntrinsicType and everything else: render as code
    return [{ kind: 'code', text: `\`${type.toString()}\`` }];
  }

  app.converter.on(td.Converter.EVENT_CREATE_DECLARATION, (_context, reflection) => {
    if (reflection.kind !== td.ReflectionKind.Property) return;
    const parent = reflection.parent;
    if (!parent || !parent.comment) return;

    const propTags = (parent.comment.blockTags || []).filter(t => t.tag === '@property');
    const match = propTags.find(t => t.name === reflection.name);
    if (!match) return;

    if (!propertyInfo.has(parent.id)) {
      propertyInfo.set(parent.id, []);
    }

    propertyInfo.get(parent.id).push({
      name: reflection.name,
      typeParts: typeToParts(reflection.type),
      content: match.content,
    });
  });

  // Phase 3: Before TypeDoc resolves {@link} tags, rewrite simple symbol names
  // in project documents to their module-qualified forms so resolution succeeds.
  //
  // Project documents have no module context, so {@link Transform} fails because
  // TypeDoc can't find "Transform" at the project level — it only finds modules.
  // The qualified form {@link geometry/Transform.Transform} resolves because
  // TypeDoc navigates: module "geometry/Transform" → export "Transform".
  //
  // This phase builds a lookup from simple names (and ClassName.member paths) to
  // their qualified module paths, then rewrites the {@link} text in all project
  // documents so TypeDoc's built-in resolver can find them.
  //
  // It also injects the property lists collected in Phase 2 into parent comments
  // and removes the @property blockTags (which TypeDoc would otherwise render
  // separately or ignore).
  app.converter.on(td.Converter.EVENT_RESOLVE_BEGIN, (context) => {
    const project = context.project;

    // --- Build qualified name map for {@link} resolution ---
    // This must happen first so we can qualify links in injected property lists.
    const qualifiedMap = new Map();

    function register(simpleName, qualifiedName) {
      if (!qualifiedMap.has(simpleName)) {
        qualifiedMap.set(simpleName, qualifiedName);
      }
    }

    function getOriginalClassName(child) {
      if (child.escapedName && child.escapedName !== 'default') {
        return child.escapedName;
      }
      if (child.sources && child.sources.length > 0) {
        const src = child.sources[0];
        try {
          const content = fs.readFileSync(src.fullFileName, 'utf8');
          const lines = content.split('\n');
          const line = lines[src.line - 1] || '';
          const match = line.match(/export\s+default\s+class\s+(\w+)/);
          if (match) return match[1];
        } catch (_e) {
          // If we can't read the source, fall through
        }
      }
      return null;
    }

    for (const mod of project.children || []) {
      if (mod.kind !== td.ReflectionKind.Module) continue;

      for (const child of mod.children || []) {
        if (child.name === 'default') {
          const originalName = getOriginalClassName(child);
          const inferredName = mod.name.split('/').pop();

          const names = new Set();
          if (originalName) names.add(originalName);
          if (inferredName) names.add(inferredName);

          for (const name of names) {
            register(name, `${mod.name}.default`);
          }

          for (const member of child.children || []) {
            for (const name of names) {
              register(
                `${name}.${member.name}`,
                `${mod.name}.default.${member.name}`,
              );
            }
          }
        } else {
          register(child.name, `${mod.name}.${child.name}`);

          for (const member of child.children || []) {
            register(
              `${child.name}.${member.name}`,
              `${mod.name}.${child.name}.${member.name}`,
            );
          }
        }
      }
    }

    /**
     * Rewrite an {@link} inline tag's text to use a qualified module path
     * so TypeDoc's resolver can find the target. Returns a new part object
     * if rewritten, or the original part if no match in qualifiedMap.
     */
    function qualifyLinkPart(part) {
      if (part.kind !== 'inline-tag' || part.tag !== '@link') return part;

      const trimmed = part.text.trim();
      const pipeIdx = trimmed.indexOf('|');
      let targetName, displayText;
      if (pipeIdx !== -1) {
        targetName = trimmed.substring(0, pipeIdx).trim();
        displayText = trimmed.substring(pipeIdx + 1).trim();
      } else {
        targetName = trimmed;
        displayText = null;
      }

      const qualified = qualifiedMap.get(targetName);
      if (qualified) {
        const display = displayText || targetName;
        return { kind: 'inline-tag', tag: '@link', text: ` ${qualified} | ${display}` };
      }
      return part;
    }

    // --- Inject property lists into parent comments ---
    function injectPropertyLists(reflection) {
      const props = propertyInfo.get(reflection.id);
      if (props && reflection.comment) {
        const listParts = [];
        listParts.push({ kind: 'text', text: '\n\n' });

        for (const prop of props) {
          listParts.push({ kind: 'text', text: '- ' });
          listParts.push({ kind: 'code', text: `\`${prop.name}\`` });
          listParts.push({ kind: 'text', text: ' ' });

          // Type parts: qualify {@link} tags, fall back to code if not found
          for (const part of prop.typeParts) {
            if (part.kind === 'inline-tag' && part.tag === '@link') {
              const resolved = qualifyLinkPart(part);
              if (resolved === part) {
                // No qualified path found — render as code instead
                const name = part.text.trim();
                listParts.push({ kind: 'code', text: `\`${name}\`` });
              } else {
                listParts.push(resolved);
              }
            } else {
              listParts.push(part);
            }
          }

          // Description: qualify {@link} tags in @property content
          if (prop.content && prop.content.length > 0) {
            listParts.push({ kind: 'text', text: ' — ' });
            for (const part of prop.content) {
              listParts.push(qualifyLinkPart(part));
            }
          }
          listParts.push({ kind: 'text', text: '\n' });
        }

        reflection.comment.summary.push(...listParts);

        if (reflection.comment.blockTags) {
          reflection.comment.blockTags = reflection.comment.blockTags.filter(
            t => t.tag !== '@property',
          );
        }
      }

      for (const child of reflection.children || []) {
        injectPropertyLists(child);
      }
    }
    injectPropertyLists(project);

    // Rewrite {@link} text in all reflection comments (summary + blockTags)
    function qualifyPartsArray(parts) {
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].kind !== 'inline-tag' || parts[i].tag !== '@link') continue;
        const rewritten = qualifyLinkPart(parts[i]);
        if (rewritten !== parts[i]) {
          parts[i] = rewritten;
        }
      }
    }

    function qualifyComment(comment) {
      if (!comment) return;
      if (comment.summary) qualifyPartsArray(comment.summary);
      if (comment.blockTags) {
        for (const tag of comment.blockTags) {
          if (tag.content) qualifyPartsArray(tag.content);
        }
      }
    }

    function qualifyCommentLinks(reflection) {
      qualifyComment(reflection.comment);
      // Process method/function signatures
      if (reflection.signatures) {
        for (const sig of reflection.signatures) {
          qualifyComment(sig.comment);
        }
      }
      // Process getter/setter signatures
      if (reflection.getSignature) qualifyComment(reflection.getSignature.comment);
      if (reflection.setSignature) qualifyComment(reflection.setSignature.comment);
      for (const child of reflection.children || []) {
        qualifyCommentLinks(child);
      }
    }
    qualifyCommentLinks(project);

    // Rewrite {@link} text in all document reflections
    const docs = project.getReflectionsByKind(td.ReflectionKind.Document);
    for (const id of Object.keys(docs)) {
      const doc = docs[id];
      if (!doc.content || !Array.isArray(doc.content)) continue;

      for (const part of doc.content) {
        if (part.kind !== 'inline-tag' || part.tag !== '@link') continue;
        const rewritten = qualifyLinkPart(part);
        if (rewritten !== part) {
          part.text = rewritten.text;
        }
      }
    }
  });
};
