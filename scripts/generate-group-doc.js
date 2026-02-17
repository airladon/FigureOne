#!/usr/bin/env node
/**
 * Generates a comprehensive markdown document from JSDoc comments
 * for all types in a given @group.
 *
 * Usage: node scripts/generate-group-doc.js "2D Shape Primitives"
 */

const fs = require('fs');
const path = require('path');

const groupName = process.argv[2];
if (!groupName) {
  console.error('Usage: node scripts/generate-group-doc.js "<group name>"');
  process.exit(1);
}

// Find all .ts files with the given @group tag
const srcDir = path.join(__dirname, '..', 'src');

// MDN links for built-in types
const MDN_TYPES = {
  number: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number',
  string: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String',
  boolean: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
  Array: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array',
  Object: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object',
  Function: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function',
};

// Build a map of all documented type names to their TypeDoc page paths.
// TypeDoc generates pages at predictable paths based on module and type name.
// We'll build this from the generated output if available, otherwise use
// a simpler anchor-based approach for types within the same document.
let typeLinks = {};

function buildTypeLinks(apiTypedocDir) {
  // Scan interfaces/ and types/ directories for html files
  for (const subdir of ['interfaces', 'types', 'classes', 'functions']) {
    const dir = path.join(apiTypedocDir, subdir);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.html')) continue;
      // Extract type name from filename: module_name.TypeName.html
      const m = file.match(/\.(\w+)\.html$/);
      if (m) {
        const typeName = m[1];
        // Use relative path from documents/ directory
        typeLinks[typeName] = `../${subdir}/${file}`;
      }
    }
  }
}

const apiTypedocDir = path.join(__dirname, '..', 'docs', 'api-typedoc');
if (fs.existsSync(apiTypedocDir)) {
  buildTypeLinks(apiTypedocDir);
}

function linkifyType(typeStr) {
  // Convert a type string into HTML with links using TypeDoc classes
  // Handle compound types: Array<Foo>, Foo | Bar, etc.
  // We replace known type names with links
  return typeStr.replace(/\b([A-Z]\w+)\b/g, (match) => {
    if (MDN_TYPES[match]) {
      return `<a href="${MDN_TYPES[match]}" class="tsd-signature-type">${match}</a>`;
    }
    if (typeLinks[match]) {
      return `<a href="${typeLinks[match]}" class="tsd-signature-type">${match}</a>`;
    }
    return match;
  }).replace(/\b(number|string|boolean)\b/g, (match) => {
    return `<a href="${MDN_TYPES[match]}" class="tsd-signature-type">${match}</a>`;
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function findFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '__mocks__') {
      results = results.concat(findFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

function extractJSDocBlocks(source) {
  const blocks = [];
  const regex = /\/\*\*[\s\S]*?\*\//g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    blocks.push({ text: match[0], end: match.index + match[0].length });
  }
  return blocks;
}

function getExportName(source, position) {
  // Look at the code right after the JSDoc block
  const after = source.substring(position).trimStart();
  // Match export or non-export type/interface/class/function name
  const m = after.match(/^(?:\/\*[^*].*?\*\/\s*)*(?:export\s+)?(?:default\s+)?(?:type|interface|class|function)\s+(\w+)/s);
  if (m) return m[1];
  return null;
}

function extractFunctionSignature(source, position) {
  const after = source.substring(position).trimStart();
  // Must be a function declaration (with optional export/default and generics)
  const funcMatch = after.match(/^(?:export\s+)?(?:default\s+)?function\s+\w+/);
  if (!funcMatch) return null;

  // Find the opening parenthesis of the parameter list (skip generic <...>)
  let i = funcMatch[0].length;
  // Skip generic type parameters <...> with balanced bracket matching
  if (i < after.length && after[i] === '<') {
    let depth = 1;
    i++;
    while (i < after.length && depth > 0) {
      if (after[i] === '<') depth++;
      else if (after[i] === '>') depth--;
      i++;
    }
  }

  // Skip whitespace to find '('
  while (i < after.length && /\s/.test(after[i])) i++;
  if (i >= after.length || after[i] !== '(') return null;

  // Balanced-paren matching to find the full parameter list
  let depth = 1;
  const paramStart = i + 1;
  i++;
  while (i < after.length && depth > 0) {
    if (after[i] === '(') depth++;
    else if (after[i] === ')') depth--;
    else if (after[i] === '\'' || after[i] === '"') {
      // Skip string literals
      const quote = after[i];
      i++;
      while (i < after.length && after[i] !== quote) {
        if (after[i] === '\\') i++;
        i++;
      }
    }
    if (depth > 0) i++;
  }
  const paramEnd = i; // position of closing ')'
  const paramStr = after.substring(paramStart, paramEnd).trim();

  // Extract return type: after ')' look for ': type' before '{'
  let returnType = null;
  let j = paramEnd + 1;
  // Skip whitespace and look for ':'
  while (j < after.length && /\s/.test(after[j])) j++;
  if (j < after.length && after[j] === ':') {
    j++; // skip ':'
    // Collect return type until we hit '{' at depth 0 (handling nested braces in object types)
    let retStart = j;
    let braceDepth = 0;
    while (j < after.length) {
      if (after[j] === '{') {
        if (braceDepth === 0 && after.substring(retStart, j).trim().length > 0) {
          // There's a type before '{' (e.g. "number {") — that's the return type, '{' is function body
          break;
        }
        braceDepth++;
      } else if (after[j] === '}') {
        braceDepth--;
        if (braceDepth === 0) {
          // End of object type in return position; next '{' is the function body
          j++;
          break;
        }
      }
      j++;
    }
    const retRaw = after.substring(retStart, j).trim().replace(/\s+/g, ' ');
    if (retRaw.length > 0) {
      returnType = retRaw;
    }
  }

  // Parse individual parameters from paramStr
  if (paramStr.length === 0) return { params: [], returnType };

  // Split on top-level commas (respecting nested <>, (), {}, and string literals)
  const paramParts = [];
  let current = '';
  let parenD = 0, angleD = 0, braceD = 0, bracketD = 0;
  for (let k = 0; k < paramStr.length; k++) {
    const ch = paramStr[k];
    if (ch === '\'' || ch === '"') {
      current += ch;
      k++;
      while (k < paramStr.length && paramStr[k] !== ch) {
        if (paramStr[k] === '\\') { current += paramStr[k]; k++; }
        current += paramStr[k];
        k++;
      }
      if (k < paramStr.length) current += paramStr[k];
      continue;
    }
    if (ch === '(') parenD++;
    else if (ch === ')') parenD--;
    else if (ch === '<') angleD++;
    else if (ch === '>') angleD--;
    else if (ch === '{') braceD++;
    else if (ch === '}') braceD--;
    else if (ch === '[') bracketD++;
    else if (ch === ']') bracketD--;
    else if (ch === ',' && parenD === 0 && angleD === 0 && braceD === 0 && bracketD === 0) {
      paramParts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) paramParts.push(current.trim());

  const params = [];
  for (const part of paramParts) {
    // Pattern: name: type = default  or  name?: type = default
    // Split on first ':' that's not inside angle brackets
    let colonIdx = -1;
    let aD = 0;
    for (let k = 0; k < part.length; k++) {
      if (part[k] === '<') aD++;
      else if (part[k] === '>') aD--;
      else if (part[k] === ':' && aD === 0) { colonIdx = k; break; }
    }

    let name = colonIdx >= 0 ? part.substring(0, colonIdx).trim() : part.trim();
    let typeAndDefault = colonIdx >= 0 ? part.substring(colonIdx + 1).trim() : '';

    const optional = name.endsWith('?');
    if (optional) name = name.slice(0, -1);

    // Split type from default value at top-level '='
    let type = typeAndDefault;
    let defaultVal = '';
    // Find '=' not inside nested constructs
    let eqIdx = -1;
    let pD2 = 0, aD2 = 0, bD2 = 0;
    let inStr = false, strCh = '';
    for (let k = 0; k < typeAndDefault.length; k++) {
      const c = typeAndDefault[k];
      if (inStr) {
        if (c === '\\') { k++; continue; }
        if (c === strCh) inStr = false;
        continue;
      }
      if (c === '\'' || c === '"') { inStr = true; strCh = c; continue; }
      if (c === '(') pD2++;
      else if (c === ')') pD2--;
      else if (c === '<') aD2++;
      else if (c === '>') aD2--;
      else if (c === '{') bD2++;
      else if (c === '}') bD2--;
      else if (c === '=' && pD2 === 0 && aD2 === 0 && bD2 === 0) {
        eqIdx = k;
        break;
      }
    }

    if (eqIdx >= 0) {
      type = typeAndDefault.substring(0, eqIdx).trim();
      defaultVal = typeAndDefault.substring(eqIdx + 1).trim();
    }

    // Clean up multiline types — collapse whitespace
    type = type.replace(/\s+/g, ' ');

    params.push({ name, type, defaultVal, optional: optional || defaultVal !== '' });
  }

  return { params, returnType };
}

function formatSignatureParam(paramObj) {
  const { name, type, defaultVal, optional } = paramObj;
  let html = '<li><span>';
  html += `<span class="tsd-kind-parameter">${escapeHtml(name)}</span>`;
  if (type) {
    const displayType = type + (optional && !defaultVal ? ' | undefined' : '');
    html += `: <span class="tsd-signature-type">${linkifyType(displayType)}</span>`;
  }
  if (defaultVal) {
    const cleanDefault = defaultVal.replace(/`/g, '');
    html += ` <span class="tsd-signature-symbol">= ${escapeHtml(cleanDefault)}</span>`;
  }
  html += '</span></li>';
  return html;
}

function parseJSDocBlock(text) {
  // Strip comment markers
  const lines = text
    .replace(/^\/\*\*\s*/, '')
    .replace(/\s*\*\/$/, '')
    .split('\n')
    .map(line => line.replace(/^\s*\*\s?/, ''));

  const description = [];
  const properties = [];
  const params = [];
  const returns = [];
  const examples = [];
  const sees = [];
  let extends_ = null;
  let currentTag = null;
  let currentContent = [];

  function flushTag() {
    if (currentTag === 'property') {
      properties.push(currentContent.join('\n'));
    } else if (currentTag === 'param') {
      params.push(currentContent.join('\n'));
    } else if (currentTag === 'return') {
      returns.push(currentContent.join('\n'));
    } else if (currentTag === 'example') {
      examples.push(currentContent.join('\n'));
    } else if (currentTag === 'see') {
      sees.push(currentContent.join('\n'));
    }
    currentTag = null;
    currentContent = [];
  }

  for (const line of lines) {
    // Check for tag starts
    const tagMatch = line.match(/^@(\w+)\s*(.*)/);
    if (tagMatch) {
      const tag = tagMatch[1];
      const rest = tagMatch[2];

      if (['property', 'param', 'return', 'returns', 'example', 'see', 'extends', 'interface', 'group', 'method'].includes(tag)) {
        flushTag();

        if (tag === 'interface' || tag === 'group' || tag === 'method') {
          continue; // skip these
        } else if (tag === 'extends') {
          extends_ = rest.trim();
          continue;
        } else if (tag === 'returns' || tag === 'return') {
          currentTag = 'return';
          if (rest.trim()) currentContent.push(rest);
          continue;
        } else {
          currentTag = tag;
          if (rest.trim()) currentContent.push(rest);
          continue;
        }
      }
    }

    if (currentTag) {
      currentContent.push(line);
    } else {
      description.push(line);
    }
  }
  flushTag();

  return {
    description: description.join('\n').trim(),
    properties,
    params,
    returns,
    examples,
    sees,
    extends: extends_,
  };
}

function formatProperty(propStr) {
  // Parse: {Type} [name] description (default)
  // or: {Type} name description
  const m = propStr.match(/^\{([^}]+)\}\s+(\[?\w+\]?)\s*([\s\S]*)/);
  if (!m) return `<li><span>${escapeHtml(propStr)}</span></li>`;

  const type = m[1];
  let name = m[2];
  let desc = m[3].trim();

  const optional = name.startsWith('[');
  name = name.replace(/[\[\]]/g, '');

  // Extract default value from end of description (value)
  let defaultVal = '';
  const defaultMatch = desc.match(/\(([^()]*)\)\s*$/);
  if (defaultMatch) {
    defaultVal = defaultMatch[1];
    desc = desc.substring(0, desc.length - defaultMatch[0].length).trim();
  }

  // Clean up description: remove trailing/leading commas, whitespace
  desc = desc.replace(/^[,\s]+|[,\s]+$/g, '');

  // Build TypeDoc-style HTML
  let html = '<li><span>';
  html += `<span class="tsd-kind-parameter">${escapeHtml(name)}</span>`;
  html += `: <span class="tsd-signature-type">${linkifyType(type)}${optional ? ' | undefined' : ''}</span>`;
  if (defaultVal) {
    const cleanDefault = defaultVal.replace(/`/g, '');
    html += ` <span class="tsd-signature-symbol">= ${escapeHtml(cleanDefault)}</span>`;
  }
  html += '</span>';

  if (desc) {
    const descHtml = escapeHtml(desc).replace(/`([^`]+)`/g, '<code>$1</code>');
    html += `<div class="tsd-comment tsd-typography"><p>${descHtml}</p></div>`;
  }

  html += '</li>';
  return html;
}

function formatParam(paramStr) {
  // Parse: {Type} name - description
  // or:   name - description (no type)
  const mTyped = paramStr.match(/^\{([^}]+)\}\s+(\[?\w+\]?)\s*[-–]?\s*([\s\S]*)/);
  if (mTyped) {
    const type = mTyped[1];
    let name = mTyped[2];
    let desc = mTyped[3].trim();
    const optional = name.startsWith('[');
    name = name.replace(/[\[\]]/g, '');

    let html = '<li><span>';
    html += `<span class="tsd-kind-parameter">${escapeHtml(name)}</span>`;
    html += `: <span class="tsd-signature-type">${linkifyType(type)}${optional ? ' | undefined' : ''}</span>`;
    html += '</span>';
    if (desc) {
      const descHtml = escapeHtml(desc).replace(/`([^`]+)`/g, '<code>$1</code>');
      html += `<div class="tsd-comment tsd-typography"><p>${descHtml}</p></div>`;
    }
    html += '</li>';
    return html;
  }

  // No type: name - description
  const mUntyped = paramStr.match(/^(\w+)\s*[-–]\s*([\s\S]*)/);
  if (mUntyped) {
    const name = mUntyped[1];
    const desc = mUntyped[2].trim();
    let html = '<li><span>';
    html += `<span class="tsd-kind-parameter">${escapeHtml(name)}</span>`;
    html += '</span>';
    if (desc) {
      const descHtml = escapeHtml(desc).replace(/`([^`]+)`/g, '<code>$1</code>');
      html += `<div class="tsd-comment tsd-typography"><p>${descHtml}</p></div>`;
    }
    html += '</li>';
    return html;
  }

  return `<li><span>${escapeHtml(paramStr)}</span></li>`;
}

function formatReturn(retStr) {
  // Parse: {Type} description
  const m = retStr.match(/^\{([^}]+)\}\s*([\s\S]*)/);
  if (m) {
    const type = m[1];
    const desc = m[2].trim();
    let html = `<span class="tsd-signature-type">${linkifyType(type)}</span>`;
    if (desc) {
      const descHtml = escapeHtml(desc).replace(/`([^`]+)`/g, '<code>$1</code>');
      html += ` — ${descHtml}`;
    }
    return html;
  }
  return escapeHtml(retStr);
}

// Main
const allFiles = findFiles(srcDir);
const entries = [];

for (const file of allFiles) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(`@group ${groupName}`)) continue;

  const blocks = extractJSDocBlocks(source);
  for (const block of blocks) {
    if (!block.text.includes(`@group ${groupName}`)) continue;
    const name = getExportName(source, block.end);
    if (!name) continue;
    const parsed = parseJSDocBlock(block.text);
    const sig = extractFunctionSignature(source, block.end);
    entries.push({
      name,
      ...parsed,
      signatureParams: sig ? sig.params : null,
      signatureReturn: sig ? sig.returnType : null,
    });
  }
}

if (entries.length === 0) {
  console.error(`No entries found for group "${groupName}"`);
  process.exit(1);
}

// Generate markdown
let md = '';

md += `---\ntitle: ${groupName} API\ngroup: ${groupName}\n---\n\n`;
md += `# ${groupName} API Reference\n\n`;

// Table of contents
md += '## Contents\n\n';
for (const entry of entries) {
  md += `- [${entry.name}](#${entry.name.toLowerCase()})\n`;
}
md += '\n---\n\n';

for (const entry of entries) {
  md += `## ${entry.name}\n\n`;

  if (entry.extends) {
    md += `*Extends {@link ${entry.extends}}*\n\n`;
  }

  md += entry.description + '\n\n';

  if (entry.properties.length > 0) {
    md += '### Properties\n\n';
    md += '<ul class="tsd-parameter-list">\n';
    for (const prop of entry.properties) {
      md += formatProperty(prop) + '\n';
    }
    md += '</ul>\n\n';
  }

  if (entry.params.length > 0) {
    md += '### Parameters\n\n';
    md += '<ul class="tsd-parameter-list">\n';
    for (const param of entry.params) {
      md += formatParam(param) + '\n';
    }
    md += '</ul>\n\n';
  } else if (entry.signatureParams && entry.signatureParams.length > 0) {
    md += '### Parameters\n\n';
    md += '<ul class="tsd-parameter-list">\n';
    for (const param of entry.signatureParams) {
      md += formatSignatureParam(param) + '\n';
    }
    md += '</ul>\n\n';
  }

  if (entry.returns.length > 0) {
    md += '### Returns\n\n';
    for (const ret of entry.returns) {
      md += formatReturn(ret) + '\n\n';
    }
  } else if (entry.signatureReturn) {
    md += '### Returns\n\n';
    md += `<span class="tsd-signature-type">${linkifyType(entry.signatureReturn)}</span>\n\n`;
  }

  for (let i = 0; i < entry.examples.length; i++) {
    const ex = entry.examples[i];
    // First line is often a comment describing the example
    const exLines = ex.split('\n');
    let title = `Example ${i + 1}`;
    let code = ex;
    if (exLines[0].trim().startsWith('//')) {
      title = exLines[0].trim().replace(/^\/\/\s*/, '');
      code = exLines.slice(1).join('\n');
    }
    md += `#### ${title}\n\n`;
    md += '```js\n' + code.trim() + '\n```\n\n';
  }

  if (entry.sees.length > 0) {
    for (const see of entry.sees) {
      md += `> ${see}\n\n`;
    }
  }

  md += '---\n\n';
}

// Rewrite image paths: source files use ./apiassets/ relative to themselves,
// but the output markdown lives in docs/api/tutorials/ so needs ../apiassets/
md = md.replace(/\.\/apiassets\//g, '../apiassets/');

// Write output
const outFile = path.join(__dirname, '..', 'docs', 'api', 'tutorials', `${groupName.toLowerCase().replace(/\s+/g, '-')}-api.md`);
fs.writeFileSync(outFile, md);
console.log(`Generated: ${outFile}`);
console.log(`Entries: ${entries.length}`);
console.log(`Type links found: ${Object.keys(typeLinks).length}`);
