const { tester } = require('./tester');

tester(
  'animations',
  `${__dirname}/../../js/figure/Animation`,
  `
figure.add(
  {
    name: 'p',
    make: 'polygon',
    options: {
      sides: 4,
      radius: 0.5,
      position: [0, 0],
    },
  },
);
const p = figure.getElement('p');
`,
);
