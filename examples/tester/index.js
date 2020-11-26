// const figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });
const figure = new Fig.Figure({ limits: [-4.5, -3.5, 9, 7], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

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



// Movable angle
figure.add({
  name: 'a',
  method: 'collections.angle',
  options: {
    angle: Math.PI / 4 * 3,
    label: {
      location: 'outside',
      orientation: 'horizontal',  // Label should be horizontal
      offset: 0.1,    // Offset of label from curve
      update: true,   // Auto update angle to be horizontal as rotation changes
      sides: 200,     // Curve is a polygon with 200 sides, so looks circular
    },
    curve: {          // Curve of angle
      radius: 0.3,
    },
    corner: {         // Straight lines of angle
      width: 0.02,
      length: 1,
      color: [0, 0.5, 1, 1],
    },
  }
});

// Angle collection has a specific setMovable function that allows for
// customizing how each arm of the angle changes the angle
figure.elements._a.setMovable({
  startArm: 'rotation',
  endArm: 'angle',
  movePadRadius: 0.3,
});