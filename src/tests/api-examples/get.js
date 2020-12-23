
const Path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const files = [];

function ThroughDirectory(directory) {
  fs.readdirSync(directory).forEach((file) => {
    const absolutePath = Path.join(directory, file);
    if (fs.statSync(absolutePath).isDirectory()) {
      return ThroughDirectory(absolutePath);
    }
    if (
      absolutePath.endsWith('js')
      && !absolutePath.endsWith('test.js')
    ) {
      files.push(absolutePath);
    }
  });
}

ThroughDirectory(`${__dirname}/../../js`);

const examples = {};
for (let i = 0; i < files.length; i += 1) {
  let lastInterfaceName = ''
  const file = files[i];
  const data = fs.readFileSync(file, 'UTF-8');
  const lines = data.split(/\r?\n/);
  const uniqueFileId = file.match(/\/src\/.*/)[0].replace(/\/src\/js\//, '').replace(/\//g, '.');
  // console.log(uniqueFileId);
  // let exampleCount = 0;

  // print all lines
  let inExample = false;
  let currentExample = [];
  let unnamedExamples = {};
  let interfaceName = '';
  let readInterfaceName = false;
  const addExample = () => {
    const code = currentExample.join('\n');
    const hash = crypto.createHash('sha1').update(code).digest('hex');
    unnamedExamples[hash] = code;
    currentExample = [];
    // inExample = false;
  };
  lines.forEach((line) => {
    if (line.match(/^ *\/\*/)) {
      interfaceName = '';
    }
    if (line.match(/^ *\* *@example/)) {
      // exampleCount += 1;
      // console.log(file, line)
      if (inExample) {
        // examples.push(currentExample.join('\n'));
        // currentExample = [];
        addExample();
      }
      inExample = true;
      return;
    }
    if (inExample && line.match(/^ *\*\//)) {
      inExample = false;
      // examples.push(currentExample.join('\n'));
      // currentExample = [];
      addExample();
      readInterfaceName = true;
      return;
    }
    if (inExample) {
      currentExample.push(line.slice().replace(/^ *\*/, ''));
    }
    if (readInterfaceName && !line.match(/^ *\/\//) && !line.match(/^ *\/\*/)) {
      let updateName = true;
      let nameFound = true;
      if (line.match(/^ *export type/)) {
        [, interfaceName] = line.match(/export type ([^ ]*)/);
      } else if (line.match(/^ *class/)) {
        [, interfaceName] = line.match(/class ([^ ]*)/);
      } else if (line.match(/function/)) {
        [, interfaceName] = line.match(/function ([^(]*)/);
      } else if (line.match(/^ *export default class/)) {
        [, interfaceName] = line.match(/class ([^ ]*)/);
      } else if (line.match(/^ *export class/)) {
        [, interfaceName] = line.match(/class ([^ ]*)/);
      } else if (line.match(/^ *type/)) {
        [, interfaceName] = line.match(/type ([^ ]*)/);
      } else if (line != null && line != '') {
        [, interfaceName] = line.match(/^ *([^(]*)/);
        updateName = false;
      } else {
        nameFound = false;
      }
      if (!nameFound) {
        return;
      }
      if (updateName) {
        lastInterfaceName = interfaceName;
      } else {
        interfaceName = `${lastInterfaceName}.${interfaceName}`;
      }
      readInterfaceName = false;
      // console.log(interfaceName, '::', crypto.createHash('sha1').update(interfaceName).digest('hex'))
      Object.keys(unnamedExamples).forEach((hash) => {
        const id = `${uniqueFileId}.${interfaceName}.${hash}`;
        // console.log(id)
        examples[id] = unnamedExamples[hash];
      });
      unnamedExamples = {};
    }
  });

  console.log(Object.keys(examples))
  
  // let inExample = false;
  // let currentExample = [];
  // rl.on('line', (line) => {
  //   if (line.match(/^ *\* *@example/)) {
  //     // console.log(file, line)
  //     if (inExample) {
  //       examples.push(currentExample);
  //       currentExample = [];
  //     }
  //     inExample = true;
  //     return;
  //   }
  //   if (inExample && line.match(/^ *\*\//)) {
  //     inExample = false;
  //     examples.push(currentExample);
  //     currentExample = [];
  //     return;
  //   }
  //   if (inExample) {
  //     currentExample.push(line.slice());
  //   }
  // });
}

// console.log(examples.slice(0,3));

