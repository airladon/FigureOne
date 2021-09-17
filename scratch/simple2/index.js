

// const figure = new Fig.Figure();
// figure.scene.setProjection({ style: 'orthographic' });
// figure.scene.setCamera({ position: [2, 1, 1], up: [0, 1, 0] });
// figure.scene.setLight({ directional: [0.1, 0.3, 1], ambient: 0.1 });

// figure.add([
//   // {
//   //   make: 'cylinder',
//   //   radius: 0.01,
//   //   color: [1, 0, 0, 1],
//   //   line: [[-1, 0, 0], [1, 0, 0]],
//   // },
//   // {
//   //   make: 'cylinder',
//   //   radius: 0.01,
//   //   color: [0, 1, 0, 1],
//   //   line: [[0, -1, 0], [0, 1, 0]],
//   // },
//   // {
//   //   make: 'cylinder',
//   //   radius: 0.01,
//   //   color: [0, 0, 1, 1],
//   //   line: [[0, 0, -1], [0, 0, 1]],
//   // },
//   // {
//   //   make: 'grid',
//   //   bounds: [-0.8, -0.8, 1.6, 1.6],
//   //   xStep: 0.05,
//   //   yStep: 0.05,
//   //   line: { width: 0.002 },
//   //   color: [0.7, 0.7, 0.7, 1],
//   //   transform: ['r', Math.PI / 2, 1, 0, 0],
//   // },
// ]);


// // const figure = new Fig.Figure({
// //   scene: {
// //     style: 'orthographic',
// //     left: -2,
// //     right: 2,
// //     bottom: -1,
// //     top: 1,
// //     camera: {
// //       position: [2, 1, 1],
// //       up: [0, 1, 0],
// //     },
// //     light: {
// //       directional: [1, 0.5, -0.1],
// //     },
// //   },
// // });

// // const figure = new Fig.Figure();
// // figure.scene.setProjection({ style: 'orthographic' });
// // figure.scene.setCamera({ position: [2, 1, 1], up: [0, 1, 0] });
// // // Setup the direction of directional light. Note, this vector describes where
// // // the light is coming from.
// // figure.scene.setLight({ directional: [1, 0.5, -0.1] });
// // const points = Fig.tools.g2.surfaceGrid({
// //   x: [-0.8, 0.7, 0.03],
// //   y: [-0.8, 0.7, 0.03],
// //   z: x => 0.2 * Math.cos(x * 2 * Math.PI),
// // });
// // figure.scene.setCamera({ up: [0, 0, 1] });
// figure.add({
//   make: 'revolve',
//   profile: [[0, 0.3], [0.5, 0.2], [1, 0.3], [1, 0.29], [0.5, 0.19], [0, 0.29], [0, 0.3]],
//   color: [1, 0, 0, 1],
//   sides: 30,
// });

// figure.add([
//   {
//     make: 'cameraControl',
//   },
// ]);

// //  const t1 = new Fig.Transform().scale(2).rotate(Math.PI / 2).translate(1, 1);
// // const t2 = new Fig.Transform([['s', 2], ['r', Math.PI / 2], ['t', 1, 1]]);
// // const t3 = Fig.getTransform([['s', 2], ['r', Math.PI / 2], ['t', 1, 1]]);
// // console.log(t1.isEqualTo(t2))
// // console.log(t1.isEqualTo(t3))

// const figure = new Fig.Figure({ scene: [0, 0, 6, 3]});
// const figure = new Fig.Figure({ scene: { style: 'orthographic' } });
// // figure.add(
// //   {
// //     make: 'polygon',
// //     sides: 8,
// //     radius: 0.2,
// //     // create a touch border that is a rectangle around the border
// //     // with a buffer of 0.1 on the left and right, and 0.3 on bottom
// //     // and top
// //     touchBorder: [0.1, 0.3],
// //     color: [1, 0, 0, 1],
// //   },
// // );
// // figure.showTouchBorders();

// figure.add(
//   {
//     name: 'c',
//     make: 'collection',
//     elements: [
//       {
//         name: 'cube',
//         make: 'cube',
//         color: [1, 1, 0, 1],
//         side: 0.4,
//       },
//       {
//         name: 'sphere',
//         make: 'sphere',
//         position: [0.8, 0, 0],
//         color: [1, 1, 0, 1],
//         radius: 0.2,
//       },
//     ],
//     touch: {
//       onClick: () => console.log('a'),
//     },
//     touchScale: 2,
//   },
// );
// figure.showTouchable();

const figure = new Fig.Figure()
const hex = figure.add({
  make: 'polygon',
  sides: 6,
  color: [1, 0, 0, 1],
  touch: true,
});
hex.notifications.add('onClick', () => console.log('Touched!'));