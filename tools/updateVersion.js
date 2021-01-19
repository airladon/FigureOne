/**
Usage:
`node tools/updateVersion.js 0.1.1`
 */
// const Path = require('path');
const fs = require('fs');
const { getFiles } = require('./getFiles');
const pjson = require('../package.json');


const files = getFiles(
  ['./src', './scratch'],
  /(html$|md$|js$)/,
);

for (let i = 0; i < files.length; i += 1) {
  const file = files[i];
  const data = fs.readFileSync(file, 'UTF-8');
  const lines = data.split(/\r?\n/);
  for (let l = 0; l < lines.length; l += 1) {
    const line = lines[l];
    if (line.match(/figureone@/)) {
      const newLine = line.replace(/figureone@[^"]*/, `figureone@${pjson.version}`);
      lines[l] = newLine;
    }
    fs.writeFileSync(file, lines.join('\n'), 'UTF-8');
  }
}
