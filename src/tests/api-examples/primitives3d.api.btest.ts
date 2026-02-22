const { tester } = require('./tester');

tester(
  'primitives3D',
  `${__dirname}/../../js/figure/FigurePrimitives/FigurePrimitiveTypes3D.ts`,
  `
figure.scene.setProjection({ style: 'orthographic' });
figure.scene.setCamera({ position: [2, 1, 1], up: [0, 1, 0] });
figure.scene.setLight({ directional: [0.7, 0.5, 1] });
`,
);
