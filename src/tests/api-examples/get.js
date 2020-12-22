
const Path = require('path');
const fs = require('fs');
const readline = require('readline');

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

const examples = [];
for (let i = 0; i < files.length; i += 1) {
  const file = files[i];
  const data = fs.readFileSync(file, 'UTF-8');
  const lines = data.split(/\r?\n/);
  const uniqueFileId = file.match(/\/src\/.*/)[0].replace(/\//g, '.');
  console.log(uniqueFileId);
  let exampleCount = 0;

  // print all lines
  let inExample = false;
  let currentExample = [];
  lines.forEach((line) => {
    if (line.match(/^ *\* *@example/)) {
      exampleCount += 1;
      // console.log(file, line)
      if (inExample) {
        examples.push(currentExample.join('\n'));
        currentExample = [];
      }
      inExample = true;
      return;
    }
    if (inExample && line.match(/^ *\*\//)) {
      inExample = false;
      examples.push(currentExample.join('\n'));
      currentExample = [];
      return;
    }
    if (inExample) {
      currentExample.push(line.slice().replace(/^ *\*/, ''));
    }
  });

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

console.log(examples.slice(0,3));

