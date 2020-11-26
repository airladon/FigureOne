// const figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });
const figure = new Fig.Figure({ limits: [-4, -3, 8, 6], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

// // const figure = new Fig.Figure({ limits: [-8, -8, 16, 16], color: [1, 0, 0, 1]});
// // figure.add([
// //   {
// //     name: 'origin',
// //     method: 'polygon',
// //     options: {
// //       radius: 0.01,
// //       line: { width: 0.01 },
// //       sides: 10,
// //       color: [0.7, 0.7, 0.7, 1]
// //     },
// //   },
// //   {
// //     name: 'grid',
// //     method: 'grid',
// //     options: {
// //       bounds: [-3, -3, 6, 6],
// //       yStep: 0.1,
// //       xStep: 0.1,
// //       color: [0.9, 0.9, 0.9, 1],
// //       line: { width: 0.004 },
// //     },
// //   },
// //   {
// //     name: 'gridMajor',
// //     method: 'grid',
// //     options: {
// //       bounds: [-3, -3, 6, 6],
// //       yStep: 0.5,
// //       xStep: 0.5,
// //       color: [0.7, 0.7, 0.7, 1],
// //       line: { width: 0.004 }
// //     },
// //   },
// // ]);
// const figure = new Fig.Figure();

// Create the shape
figure.add(
  {
    name: 'tri',
    method: 'triangle',
    options: {
      width: 1,
      height: 1,
      color: [1, 0, 0, 1],
    },
  },
);

// Animate the shape
figure.getElement('tri').animations.new()
  .delay(2)
  .position({ target: [1, 0], duration: 1 })
  .rotation({ target: Math.PI, duration: 2 })
  .position({ target: [0, 0], duration: 1 })
  .start();