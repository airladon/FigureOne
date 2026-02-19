const { tester } = require('./tester');

tester(
  'morphtools',
  `${__dirname}/../../js/tools/morph.ts`,
  '',
  0,
  `
if (typeof image !== 'undefined') {
  sleepTime = 4000;
}
`,
);
