// const figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });
// const figure = new Fig.Figure({ limits: [-4.5, -3.5, 9, 7], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

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
const figure = new Fig.Figure({ limits: [0, 0, 6, 4 ]});

const label = figure.primitives.text({
  text: 'Line 1',
  position: [1, 0.1],
  font: { color: [0, 0, 1, 1] },
  xAlign: 'center',
});
const line = figure.primitives.line({
  p1: [0, 0],
  p2: [2, 0],
  width: 0.01,
  color: [0, 0, 1, 1],
});

const labeledLine = figure.collections.collection({
  position: [3, 2],
  touchBorder: 0.3,
});
figure.elements.add('labeledLine', labeledLine);
labeledLine.add('line', line);
labeledLine.add('label', label);
labeledLine.move.type = 'rotation';
labeledLine.setMovable();