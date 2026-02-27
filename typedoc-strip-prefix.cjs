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

  // Phase 2: Preserve @property-documented members from excludeNotDocumented.
  //
  // Type aliases with @interface and @property JSDoc tags have their properties
  // created as child reflections without comments. TypeDoc's excludeNotDocumented
  // then removes them before the @property descriptions are applied (which happens
  // during resolution). Fix: when a property child is created, check if the parent
  // has a matching @property tag and set the comment immediately.
  app.converter.on(td.Converter.EVENT_CREATE_DECLARATION, (_context, reflection) => {
    if (reflection.kind !== td.ReflectionKind.Property) return;
    const parent = reflection.parent;
    if (!parent || !parent.comment) return;

    const propTags = (parent.comment.blockTags || []).filter(t => t.tag === '@property');
    const match = propTags.find(t => t.name === reflection.name);
    if (match && !reflection.comment) {
      reflection.comment = new td.Comment(match.content);
    }
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
  app.converter.on(td.Converter.EVENT_RESOLVE_BEGIN, (context) => {
    const project = context.project;

    // Map: simple name → "ModuleName.ExportName" qualified path
    const qualifiedMap = new Map();

    function register(simpleName, qualifiedName) {
      if (!qualifiedMap.has(simpleName)) {
        qualifiedMap.set(simpleName, qualifiedName);
      }
    }

    /**
     * For default exports, TypeDoc may store the name as "default" rather than
     * the original class name. Try to recover the original name from:
     * 1. The reflection's escapedName (works when exported via a separate statement)
     * 2. The source file declaration line (works for inline `export default class X`)
     */
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

    // Walk all modules and build the simple-name → qualified-path map
    for (const mod of project.children || []) {
      if (mod.kind !== td.ReflectionKind.Module) continue;

      for (const child of mod.children || []) {
        if (child.name === 'default') {
          const originalName = getOriginalClassName(child);
          const inferredName = mod.name.split('/').pop();

          // Collect all name aliases for this default export
          const names = new Set();
          if (originalName) names.add(originalName);
          if (inferredName) names.add(inferredName);

          // Register bare class name → module.default
          for (const name of names) {
            register(name, `${mod.name}.default`);
          }

          // Register ClassName.member paths
          for (const member of child.children || []) {
            for (const name of names) {
              register(
                `${name}.${member.name}`,
                `${mod.name}.default.${member.name}`,
              );
            }
          }
        } else {
          // Named export: register by its declared name
          register(child.name, `${mod.name}.${child.name}`);

          // Register ClassName.member paths
          for (const member of child.children || []) {
            register(
              `${child.name}.${member.name}`,
              `${mod.name}.${child.name}.${member.name}`,
            );
          }
        }
      }
    }

    // Rewrite {@link} text in all document reflections
    const docs = project.getReflectionsByKind(td.ReflectionKind.Document);
    for (const id of Object.keys(docs)) {
      const doc = docs[id];
      if (!doc.content || !Array.isArray(doc.content)) continue;

      for (const part of doc.content) {
        if (part.kind !== 'inline-tag' || part.tag !== '@link') continue;

        // Parse the raw text: " TargetName" or " TargetName | display text"
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
          // Rewrite to qualified form, preserving or defaulting display text
          const display = displayText || targetName;
          part.text = ` ${qualified} | ${display}`;
        }
      }
    }
  });
};
