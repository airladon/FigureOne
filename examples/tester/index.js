const figure = new Fig.Figure({ limits: [-2, -1, 4, 2], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

// const figure = new Fig.Figure({ limits: [-8, -8, 16, 16], color: [1, 0, 0, 1]});
// figure.add([
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
//       color: [0.9, 0.9, 0.9, 1],
//       line: { width: 0.004 },
//     },
//   },
//   {
//     name: 'gridMajor',
//     method: 'grid',
//     options: {
//       bounds: [-3, -3, 6, 6],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.7, 0.7, 0.7, 1],
//       line: { width: 0.004 }
//     },
//   },
// ]);

figure.add([
  {
    name: 'x',
    method: 'line',
    options: {
      length: 3,
      position: [-1.5, 0],
      width: 0.005,
      color: [0.7, 0.7, 0.7, 1],
    },
  },
  {
    name: 'y',
    method: 'line',
    options: {
      length: 3,
      position: [-1.5, 0],
      width: 0.005,
      color: [0.7, 0.7, 0.7, 1],
    },
  },
]);