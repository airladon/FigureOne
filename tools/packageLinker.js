const Path = require('path');
const fs = require('fs');
const { getFiles } = require('./getFiles');
const pjson = require('../package.json');

const to = 'remote';

const files = getFiles('./docs/', /html$/, /test.html$/);

const remote = `https://cdn.jsdelivr.net/npm/figureone@${pjson.version}/figureone.min.js`;
for (let i = 0; i < files.length; i += 1) {
  const file = files[i];
  const figOne = {
    dev: Path.relative(file, './package/index.js'),
    prod: Path.relative(file, './package/figureone.min.js'),
    remote,
  };

  const data = fs.readFileSync(file, 'UTF-8');
  const lines = data.split(/\r?\n/);
  for (let l = 0; l < lines.length; l += 1) {
    const line = lines[l];
    if (line.match(/^ *<script.*figureone.min.js/) || line.match(/^ *<script.*package\/index.js/)) {
      const leadingSpaces = line.match(/[^ ]/).index;
      const newLine = `${Array(leadingSpaces).join(' ')}<script type="text/javascript" src="${figOne[to]}"></script>\n`;
      lines[l] = newLine;
    }
  }
}
//   //   let lastInterfaceName = '';
//   //   const file = files[i];
//   //   const data = fs.readFileSync(file, 'UTF-8');
//   //   const lines = data.split(/\r?\n/);
//   //   const uniqueFileId = file.match(/\/src\/.*/)[0]
//   //     .replace(/\/src\/js\//, '').replace(/\//g, '.');
//   //   let inExample = false;
//   //   let currentExample = [];
//   //   let unnamedExamples = {};
//   //   let interfaceName = '';
//   //   let readInterfaceName = false;
//   //   const addExample = (e, c) => {
//   //     const code = c.join('\n');
//   //     const hash = crypto.createHash('sha1').update(code).digest('hex').slice(0, 8);
//   //     e[hash] = code;
//   //   };
//   //   lines.forEach((line) => {
//   //     if (line.match(/^ *\/\*/)) {
//   //       interfaceName = '';
//   //     }
//   //     if (line.match(/^ *\* *@example/)) {
//   //       if (inExample) {
//   //         addExample(unnamedExamples, currentExample);
//   //         currentExample = [];
//   //       }
//   //       inExample = true;
//   //       return;
//   //     }
//   //     if (inExample && line.match(/^ *\*\//)) {
//   //       inExample = false;
//   //       addExample(unnamedExamples, currentExample);
//   //       currentExample = [];
//   //       readInterfaceName = true;
//   //       return;
//   //     }
//   //     if (inExample) {
//   //       currentExample.push(line.slice().replace(/^ *\*/, ''));
//   //     }
//   //     if (readInterfaceName && !line.match(/^ *\/\//) && !line.match(/^ *\/\*/)) {
//   //       let updateName = true;
//   //       let nameFound = true;
//   //       if (line.match(/^ *export type/)) {
//   //         [, interfaceName] = line.match(/export type ([^ ]*)/);
//   //       } else if (line.match(/^ *class/)) {
//   //         [, interfaceName] = line.match(/class ([^ ]*)/);
//   //       } else if (line.match(/function/)) {
//   //         [, interfaceName] = line.match(/function ([^(]*)/);
//   //       } else if (line.match(/^ *export default class/)) {
//   //         [, interfaceName] = line.match(/class ([^ ]*)/);
//   //       } else if (line.match(/^ *export class/)) {
//   //         [, interfaceName] = line.match(/class ([^ ]*)/);
//   //       } else if (line.match(/^ *type/)) {
//   //         [, interfaceName] = line.match(/type ([^ ]*)/);
//   //       } else if (line != null && line !== '') {
//   //         [, interfaceName] = line.match(/^ *([^(]*)/);
//   //         updateName = false;
//   //       } else {
//   //         nameFound = false;
//   //       }
//   //       if (!nameFound) {
//   //         return;
//   //       }
//   //       if (updateName) {
//   //         lastInterfaceName = interfaceName;
//   //       } else {
//   //         interfaceName = `${lastInterfaceName}.${interfaceName}`;
//   //       }
//   //       readInterfaceName = false;
//   //       Object.keys(unnamedExamples).forEach((hash) => {
//   //         const id = `${uniqueFileId}.${interfaceName}.${hash}`;
//   //         examples[id] = unnamedExamples[hash];
//   //       });
//   //       unnamedExamples = {};
//   //     }
//   //   });
//   // }
//   // return examples;
// }
// getHTMLFiles();
// // module.exports = {
// //   getExamples,
// // };
