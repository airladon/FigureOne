
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

for (let i = 0; i < files.length; i += 1) {
  const file = files[i];
  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', (line) => {
    if (line.startsWith(' * @example >')) {
      console.log(file, line)
    }
  });
}

