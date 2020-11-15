const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1]});

// diagram.addElements([
//   {
//     name: 'origin',
//     method: 'polygon',
//     options: {
//       radius: 0.01,
//       line: { width: 0.01 },
//       sides: 10,
//       color: [0.7, 0.7, 0.7, 1]
//     },
//   },
//   {
//     name: 'grid',
//     method: 'grid',
//     options: {
//       bounds: [-3, -3, 6, 6],
//       yStep: 0.1,
//       xStep: 0.1,
//       color: [0.7, 0.7, 0.7, 1],
//       line: { width: 0.001 },
//     },
//   },
//   {
//     name: 'gridMajor',
//     method: 'grid',
//     options: {
//       bounds: [-3, -3, 6, 6],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.8, 0.8, 0.8, 1],
//       line: { width: 0.004 }
//     },
//   },
// ]);

// // Polyline with angle annotations
// diagram.addElement({
//   name: 'p',
//   method: 'advanced.polyline',
//   options: {
//     points: [[1, 0], [0, 0], [0.5, 1], [1.5, 1]],
//     arrow: 'triangle',
//     angle: {
//       label: null,
//       curve: {
//         radius: 0.3,
//       },
//     },
//   }
// });

// // Triangle with unknown angle
// diagram.addElement({
//   name: 'p',
//   method: 'advanced.polyline',
//   options: {
//     points: [[1, 1], [1, 0], [0, 0]],
//     close: true,
//     side: {
//       label: null,
//     },
//     angle: {
//       label: {
//         text: '?',
//         offset: 0.05,
//       },
//       curve: {
//         radius: 0.4,
//       },
//       show: [1],
//     },
//   }
// });

// // Dimensioned square
// diagram.addElement({
//   name: 'p',
//   method: 'advanced.polyline',
//   options: {
//     points: [[0, 1], [1, 1], [1, 0], [0, 0]],
//     close: true,
//     side: {
//       showLine: true,
//       offset: 0.2,
//       color: [0, 0, 1, 1],
//       arrow: 'barb',
//       width: 0.01,
//       label: null,
//       dash: [0.05, 0.02],
//       0: { label: { text: 'a' } },    // Customize side 0
//     },
//     angle: {
//       curve: {
//         autoRightAngle: true,
//         radius: 0.3,
//       },
//     },
//   }
// });

// // User adjustable polyline
// diagram.addElement({
//   name: 'p',
//   method: 'advanced.polyline',
//   options: {
//     points: [[-0.5, 1], [1, 1], [0, 0], [1, -0.5]],
//     dash: [0.05, 0.02],
//     pad: {
//       radius: 0.2,
//       color: [1, 0, 0, 0.5],    // make alpha 0 to hide pad
//       isMovable: true,
//     },
//   },
// });


// // Annotations that automatically update as user changes triangle
// diagram.addElement({
//   name: 'p',
//   method: 'advanced.polyline',
//   options: {
//     points: [[-1, 1], [1, 1], [0, 0]],
//     close: true,
//     makeValid: {
//       shape: 'triangle',
//       hide: {
//         minAngle: Math.PI / 8,
//       },
//     },
//     side: {
//       showLine: true,
//       offset: 0.2,
//       color: [0.3, 0.6, 1, 1],
//       arrow: 'barb',
//       width: 0.01,
//       label: {
//         text: null,
//       },
//     },
//     angle: {
//       label: null,
//       curve: { radius: 0.25 },
//     },
//     pad: {
//       radius: 0.4,
//       color: [1, 0, 0, 0.005],
//       isMovable: true,
//     },
//   },
// });


