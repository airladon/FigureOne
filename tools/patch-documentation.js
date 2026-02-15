#!/usr/bin/env node

// Patches documentation.js v14 for two bugs:
//
// 1. ts_doctrine.js: TSLiteralType with UnaryExpression (e.g. -1 in a union type)
//    produces an unhandled "UnaryExpressionType". Fix: convert to NumericLiteralType.
//
// 2. formatters.js: remark-html v15 sanitizes HTML by default, which strips the
//    highlighted <pre class='hljs'> blocks injected by the highlighter. Fix: pass
//    sanitize: false to remark-html.

const fs = require('fs');
const path = require('path');

const docRoot = path.join(__dirname, '..', 'node_modules', 'documentation', 'src');

function patch(filePath, find, replace, label) {
  const fullPath = path.join(docRoot, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`  SKIP: ${fullPath} not found`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes(replace)) {
    console.log(`  OK: ${label} (already applied)`);
    return;
  }
  if (!content.includes(find)) {
    console.error(`  ERROR: ${label} - could not find target string in ${filePath}`);
    process.exit(1);
  }
  fs.writeFileSync(fullPath, content.replace(find, replace), 'utf8');
  console.log(`  OK: ${label}`);
}

console.log('Patching documentation.js...');

// Patch 1: Handle UnaryExpression in TSLiteralType (e.g. type Foo = -1 | 0 | 1)
patch(
  'ts_doctrine.js',
  `case 'TSLiteralType':
      return {
        type: \`\${type.literal.type}Type\`,
        value: type.literal.value
      };`,
  `case 'TSLiteralType':
      if (type.literal.type === 'UnaryExpression') {
        return {
          type: 'NumericLiteralType',
          value: type.literal.operator === '-' ? -type.literal.argument.value : type.literal.argument.value
        };
      }
      return {
        type: \`\${type.literal.type}Type\`,
        value: type.literal.value
      };`,
  'ts_doctrine: handle UnaryExpression in TSLiteralType'
);

// Patch 2: Preserve highlighted code blocks in tutorial markdown
patch(
  'output/util/formatters.js',
  '.use(html)',
  '.use(html, { sanitize: false })',
  'formatters: disable remark-html sanitization'
);

console.log('Done.');
