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




// const xAxis = diagram.advanced.axis({
//   // position: [-1, -1],
//   length: 2,
//   axis: 'x',
//   start: -1,
//   stop: 1,
//   line: { width: 0.01 },
//   ticks: { step: 0.5, length: 0.1 },
//   grid: { step: 0.5, length: 2, width: 0.002 },
//   labels: { text: null, precision: 1, },
// })
// diagram.add('xAxis', xAxis);

// const yAxis = diagram.advanced.axis({
//   // position: [-1, -1],
//   length: 2,
//   axis: 'y',
//   start: -1,
//   stop: 1,
//   line: { width: 0.01 },
//   ticks: [ { step: 0.5, length: 0.1 }],
//   grid: [ { step: 0.5, length: 2, width: 0.002, offset: -1 }],
//   labels: { text: null, precision: 1, },
//   position: [1, 0],
// })
// diagram.add('xAxis', xAxis);
// diagram.add('yAxis', yAxis);

const sin = () => {
  const xValues = Fig.tools.math.range(-1.1, -1.09, 2 / 1000);
  const points = [];
  xValues.forEach((x) => {
    points.push([x, 0.5 * Math.sin(x * Math.PI * 2)]);
  })
  return points;
}
// const trace = diagram.advanced.trace({
//   points: sin(),
//   markers: { radius: 0.03, sides: 4, line: { width: 0.005 }, rotation: Math.PI / 6 + Math.PI,  copy: { along: 'rotation', num: 1, step: Math.PI / 4 } },
//   xAxis,
//   yAxis,
// });
// diagram.add('trace', trace);

// const trace1 = diagram.advanced.trace({
//   points: [[-2, 0], [2, 2], [0.1, 0], [1, 0]],
//   line: { width: 0.04 },
//   markers: { radius: 0.1, sides: 5, innerRadius: 0.03, rotation: Math.PI / 2, color: [0, 1, 0, 1] },
//   color: [0, 0, 1, 1],
//   xAxis,
//   yAxis,
// })
// diagram.add('trace1', trace1);

diagram.addElement({
  name: 'plot',
  method: 'advanced.plot',
  options: {
    // xAxis: { length: 1, start: -10, stop: 0, ticks: { step: 2.5 }, grid: { length: 1, step: 2.5, width: 0.005 } },
    // yAxis: { length: 1, start: -10, stop: 0, ticks: { step: 2.5 } },
    // axes: [
    //   { axis: 'y', length: 2, start: -10, stop: -6, ticks: { step: 0.2 }, position: [1, 0] },
    // ],
    traces: [{
      points: sin(),
      // line: {linePrimitives: true, lineNum: 1},
      line: { cornerStyle: 'none' },
      // markers: { sides: 3 },
      // line: null,
      // xSampleDistance: 0.1,
      // ySampleDistance: 0.1,
    },
    ]
  },
});