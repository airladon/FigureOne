/* eslint-disable no-console */
const { getExamples } = require('./getExamples');

const examples = getExamples(`${__dirname}/../../js`);

const hash = process.argv.slice(2)[0];

const keys = Object.keys(examples);
for (let i = 0; i < keys.length; i += 1) {
  const key = keys[i];
  if (key.slice(-8) === hash) {
    const { index } = key.match(/\.js\./);
    const path = key.slice(0, index + 3).replace(/\./g, '/').replace(/\/js/, '.js');
    const id = key.slice(index + 3);
    console.log(`src/js/${path} ${id.slice(1)}`);
    console.log('');
    console.log(examples[key]);
    i = keys.length + 1;
  }
}
