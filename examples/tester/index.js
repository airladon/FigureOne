const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1], lineWidth: 0.01 });

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
//   // axis: 'y',
//   length: 2,
//   // start: -1,
//   // stop: 1,
//   ticks: true,
//   // labels: null,
//   // ticks: { length: 0.1 },
//   // // grid: { step: 0.5, length: 2, width: 0.002 },
//   // labels: { text: null, precision: 1, },
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

const sin = (offset = 0) => {
  const xValues = Fig.tools.math.range(-1, 1, 1 / 100);
  const points = [];
  xValues.forEach((x) => {
    points.push([x, 0.5 * Math.sin(x / 1 * Math.PI * 2 + offset)]);
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

// diagram.addElement({
//   name: 'plot',
//   method: 'advanced.plot',
//   options: {
//     width: 3,
//     height: 2,
//     title: 'Hello',
//     position: [-1, -1],
//     // xAxis: { title: { lines: ['hello'] } },
//     xAxis: { title: 'There' },
//     // plotArea: [0.8, 0.8, 1, 1],
//     // xAxis: { labels: null, line: null, ticks: null },
//     // xAxis: { start: -2, stop: 2 },
//     // yAxis: { },
//     yAxis: { title: 'Hello' },
//     // xAxis: { color: [1, 0, 0, 1] },
//     // xAxis: { length: 1, start: -10, stop: 0, ticks: { step: 2.5 }, grid: { length: 1, step: 2.5, width: 0.005 } },
//     // yAxis: { length: 1, start: -10, stop: 0, ticks: { step: 2.5 } },
//     // axes: [
//     //   { axis: 'y', length: 2, start: -10, stop: -6, ticks: { step: 0.2 }, position: [1, 0] },
//     // ],
//     // grid: { dash: [0.01, 0.01] },
//     // font: { size: 0.2 },
//     grid: true,
//     legend: {
//       fontColorIsLineColor: true,
//       // position: [3.2, 1.8],
//       position: [0.2, -0.7],
//       // frame: { space: 0.1, fill: [0.8, 0.8, 0.8, 1] },
//       // frame: true,
//       // frame: {
//       //   fill: [1, 1, 1, 1],
//       // },
//       offset: [1, 0],
//       // custom: {
//       //   a: {
//       //     font: { size: 0.1 },
//       //     position: [0, -0.5],
//       //   },
//       // }
//       // position: [2, 1],
//       length: 0.5,
//       lineTextSpace: 0.2,
//     },
//     // frame: { space: 0.2, line: { width: 0.004, dash: [0.1, 0.1] } },
//     traces: [
//       {
//         points: sin(),
//         // line: {linePrimitives: true, lineNum: 1},
//         line: { cornerStyle: 'none' },
//         name: 'a',
//         markers: { sides: 3, radius: 0.05, rotation: Math.PI / 2, },
//         // line: null,
//         // xSampleDistance: 0.1,
//         // ySampleDistance: 0.1,
//       },
//       {
//         points: sin(1),
//         name: 'b',
//         color: [0, 0, 1, 1],
//       },
//       {
//         points: sin(2),
//         name: 'c',
//         color: [0, 0.7, 0, 1],
//         line: { dash: [0.1, 0.1] },
//       },
//     ]
//   },
// });

// diagram.addElement({
//   name: 'rect',
//   method: 'advanced.rectangle',
//   options: {
//     width: 2,
//     height: 1,
//     position: [-1, -1],
//     fill: [1, 0, 0, 0.5],
//     corner: {
//       radius: 0.2,
//       sides: 10,
//     },
//     line: { width: 0.02, color: [0, 0, 0, 1], widthIs: 'outside', dash: [0.05, 0.01] },
//   },
// })

// // diagram.elements._rect.surround(diagram.elements._plot, 0.1)
// diagram.elements._rect.animations.new()
//   .surround({ target: diagram.elements._plot, duration: 4 })
//   .start();




// By default an axis is an 'x' axis
diagram.addElement({
  name: 'x',
  method: 'advanced.axis',
  options: {
    length: 2,
    ticks: true,
    // line: false,
    grid: true,
  },
});

