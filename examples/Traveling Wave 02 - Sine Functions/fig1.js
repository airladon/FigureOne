// const { Point } = Fig;
// const { round, range } = Fig.tools.math;

// fig1 = new Fig.Figure({ limits: [-2 * 0.9, -1.5 * 0.9, 4 * 0.9, 3 * 0.9], htmlId: 'figureOneContainer1' });

// const r = 1;
// fig1.add([
//   {
//     name: 'xAxis',
//     method: 'line',
//     options: {
//       length: r * 2,
//       position: [-r, 0],
//       width: 0.005,
//       color: [0.7, 0.7, 0.7, 1],
//     }
//   },
//   {
//     name: 'yAxis',
//     method: 'line',
//     options: {
//       length: r * 2,
//       position: [0, -r],
//       width: 0.005,
//       angle: Math.PI / 2,
//       color: [0.7, 0.7, 0.7, 1],
//     },
//   },
//   {
//     name: 'circle',
//     method: 'polygon',
//     options: {
//       radius: r,
//       sides: 200,
//       line: { width: 0.005 },
//       color: [0.7, 0.7, 0.7, 1],
//     },
//   },
//   {
//     name: 'theta',
//     method: 'collections.angle',
//     options: {
//       curve: { radius: 0.3 },
//       label: { text: '\u03b8' },
//     },
//   },
//   {
//     name: 'alpha',
//     method: 'collections.angle',
//     options: {
//       curve: { radius: 0.1 },
//       label: { text: 'a' },
//     },
//   },
//   {
//     name: 'rightAngle',
//     method: 'collections.angle',
//     options: {
//       curve: { radius: 0.1, autoRightAngle: true },
//     },
//   },
//   {
//     name: 'hypotenuse',
//     method: 'collections.line',
//     options: {
//       length: r,
//       width: 0.015,
//       touchBorder: 0.3,
//     },
//     mods: {
//       isMovable: true,
//       move: { type: 'rotation' },
//     },
//   },
  
//   // {
//   //   name: 'triangle',
//   //   method: 'collections.polyline',
//   //   options: {
//   //     width: 0,
//   //     close: true,
//   //     cornerStyle: 'fill',
//   //     angle: {
//   //       curve: {
//   //         radius: 0.1,
//   //         autoRightAngle: true,
//   //       },
//   //       1: { label: '' },
//   //       2: { label: 'a' },
//   //       show: [0, 2],
//   //     },
//   //   },
//   // },
//   // {
//   //   name: 'horizontal',
//   //   method: 'collections.line',
//   //   options: {
//   //     length: r,
//   //     width: 0.015,
//   //   },
//   // },
//   {
//     name: 'vertical',
//     method: 'collections.line',
//     options: {
//       length: r,
//       width: 0.005,
//       dash: [0.05, 0.01],
//     },
//   },
// ]);

// const vertical = fig1.getElement('vertical');
// const alpha = fig1.getElement('alpha');
// const right = fig1.getElement('rightAngle');
// // const horizontal = fig1.getElement('horizontal');
// // const triangle = fig1.getElement('triangle');
// const hypotenuse = fig1.getElement('hypotenuse');
// const theta = fig1.getElement('theta');
// hypotenuse.subscriptions.add('setTransform', () => {
//   const piOn2 = Math.PI / 2;
//   const angle = hypotenuse.getRotation('0to360');
//   const endX = r * Math.cos(angle);
//   const endY = r * Math.sin(angle);
//   vertical.setEndPoints([endX, 0], [endX, endY]);
//   // horizontal.setEndPoints([0, 0], [endX, 0]);
//   theta.setAngle({ angle });
//   const quadrant = Math.floor(angle / (Math.PI / 2));
//   if (quadrant === 0) {
//     right.setAngle({ position: [endX, 0], angle: piOn2, startAngle: piOn2 });
//     alpha.setAngle({ position: [0, 0], angle, startAngle: 0 });
//   } else if (quadrant === 1) {
//     right.setAngle({ position: [endX, 0], angle: piOn2, startAngle: 0 });
//     alpha.setAngle({ position: [0, 0], angle: angle - Math.PI, startAngle: angle });
//   } else if (quadrant === 2) {
//     right.setAngle({ position: [endX, 0], angle: piOn2, startAngle: -piOn2 });
//     alpha.setAngle({ position: [0, 0], angle: angle - Math.PI, startAngle: Math.PI });
//   } else {
//     right.setAngle({ position: [endX, 0], angle: piOn2, startAngle: Math.PI });
//     alpha.setAngle({ position: [0, 0], angle: piOn2 * 4 - angle, startAngle: angle });
//   }
//   // rightAngle.setAngle({ 
//   //   position: [endX, 0],
//   //   angle: Math.PI / 2,
//   //   startAngle: Math.PI / 2 - quadrant * Math.PI / 2,
//   // });
//   // alpha.setAngle({ 
//   //   position: [0, 0],
//   //   angle: quadrant % 2 === 0 ? angle - quadrant * Math.PI / 2 : quadrant * Math.PI - angle,
//   //   startAngle: quadrant % 2 === 0 ? quadrant * Math.PI / 2 : angle,
//   // });
//   // if (Math.tan(angle) < 0) {
//   //   triangle.updatePoints([[0, 0], [endX, 0], [endX, endY]]);
//   // } else {
//   //   triangle.updatePoints([[0, 0], [endX, endY], [endX, 0]]);
//   // }
// })
// hypotenuse.setRotation(1);