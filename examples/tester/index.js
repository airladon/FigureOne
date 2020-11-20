const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

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

// const sin = (offset = 0) => {
//   const xValues = Fig.tools.math.range(-1, 1, 1 / 100);
//   const points = [];
//   xValues.forEach((x) => {
//     points.push([x, 0.5 * Math.sin(x / 1 * Math.PI * 2 + offset)]);
//   })
//   return points;
// }
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

// // Simple rectangle
// diagram.addElement({
//   name: 'rect',
//   method: 'advanced.rectangle',
//   options: {
//     width: 2,
//     height: 1,
//   },
// });


// // Round corner rectangle with fill and outside line
// const rect = diagram.advanced.rectangle({
//   width: 2,
//   height: 1,
//   line: {
//     width: 0.02,
//     widthIs: 'outside',
//     dash: [0.1, 0.02],
//   },
//   corner: {
//     radius: 0.2,
//     sides: 10,
//   },
//   fill: [0.7, 0.7, 1, 1],
// });
// diagram.add('rect', rect);


// // Rectangle surrounds elements of an equation
// diagram.addElements([
//   {
//     name: 'rect',
//     method: 'advanced.rectangle',
//     options: {
//       color: [0.3, 0.3, 1, 1],
//       line: { width: 0.01 },
//     },
//   },
//   {
//     name: 'eqn',
//     method: 'equation',
//     options: {
//       forms: { 0: [{ frac: ['a', 'vinculum', 'b'] }, ' ', 'c'] },
//       position: [1, 0],
//       scale: 1.5,
//     },
//   }
// ]);

// const rect = diagram.getElement('rect');
// const eqn = diagram.getElement('eqn');

// rect.surround(eqn._a, 0.03);
// rect.animations.new()
//   .pulse({ delay: 1, scale: 1.5 })
//   .surround({ target: eqn._b, space: 0.03, duration: 1 })
//   .pulse({ delay: 1, scale: 1.5 })
//   .surround({ target: eqn._c, space: 0.03, duration: 1 })
//   .pulse({ delay: 1, scale: 1.5 })
//   .start();


diagram.addElement({
  name: 'asdf',
  method: 'advanced.line',
  options: {
    angle: 1,
    length: 2,
  },
});

diagram.elements._asdf.animations.new()
  .length({ target: 1, duration: 1 })
  .length({ target: 2, duration: 1 })
  .length({ target: 1, duration: 1 })
  .start();





// const gl = document.getElementById('figureOneContainer').getElementsByClassName('figureone__gl')[0]
// console.log(gl)

// const png = gl.toDataURL('image/png', 0.5);
// // console.log(png)
// var w=window.open('about:blank','image from canvas');
// w.document.write("<img src='"+png+"' alt='from canvas'/>");