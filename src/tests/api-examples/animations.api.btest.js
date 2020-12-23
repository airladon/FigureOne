const { tester } = require('./tester.js');

tester(
  `${__dirname}/../../js/figure/Animation/AnimationManager.js`,
  `
  figure.add(
    {
      name: 'p',
      method: 'polygon',
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
