const { tester } = require('./tester');

tester(
  'morphtools',
  `${__dirname}/../../js/tools/morph.js`,
  '',
  0,
  `
if (typeof image !== 'undefined') {
  sleepTime = 1000;
}
`,
);
