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


const sin = (offset = 0, step = 0.01, start = -1, stop = 1) => {
  const xValues = Fig.tools.math.range(start, stop, step);
  return xValues.map(x => new Fig.Point(x, Math.sin(x * 2 * Math.PI + offset)))
}

const pow = (pow = 2, stop = 10, step = 0.05) => {
  const xValues = Fig.tools.math.range(0, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** pow));
}

// // Plot of single trace with auto axis scaling
// diagram.addElement({
//   name: 'plot',
//   method: 'advanced.plot',
//   options: {
//     trace: pow(),
//     position: [-1, -1],
//   },
// });

// Multiple traces with a legend
// Some traces are customized beyond the defaul color to include dashes and
// markers
diagram.addElement({
  name: 'plot',
  method: 'advanced.plot',
  options: {
    width: 2,                                    // Plot width in diagram
    height: 2,                                   // Plot height in diagram
    yAxis: { start: 0, stop: 100 },              // Customize y axis limits
    trace: [
      { points: pow(1.5), name: 'Power 1.5' },   // Trace names are for legend
      {                                           // Trace with only markers
        points: pow(2, 10, 0.5),
        name: 'Power 2',
        markers: { sides: 4, radius: 0.03 },
      },
      {                                           // Trace with markers and
        points: pow(3, 10, 0.5),                  // dashed line
        name: 'Power 3',
        markers: { radius: 0.03, sides: 10, line: { width: 0.005 } },
        line: { dash: [0.04, 0.01] },
      },
    ],
    legend: true,
  },
});

// // Multiple grids and simple titles
// diagram.addElement({
//   name: 'plot',
//   method: 'advanced.plot',
//   options: {
//     width: 2,
//     height: 2,
//     yAxis: {
//       start: 0,
//       stop: 100,
//       grid: [
//         { step: 20, width: 0.005, dash: [], color: [0.7, 0.7, 1, 1] },
//         { step: 5, width: 0.005, dash: [0.01, 0.01], color: [1, 0.7, 0.7, 1] },
//       ],
//       title: 'velocity (m/s)',
//     },
//     xAxis: {
//       grid: [
//         { step: 2, width: 0.005, dash: [], color: [0.7, 0.7, 1, 1] },
//         { step: 0.5, width: 0.005, dash: [0.01, 0.01], color: [1, 0.7, 0.7, 1] },
//       ],
//       title: 'time (s)',
//     },
//     trace: pow(3),
//     title: 'Velocity over Time'
//   },
// });

// // Hide axes
// // Use plot frame and plot area
// // Title has a subtitle
// diagram.addElement({
//   name: 'plot',
//   method: 'advanced.plot',
//   options: {
//     width: 2,
//     height: 2,
//     trace: pow(3),
//     xAxis: { show: false },
//     yAxis: { show: false },
//     plotArea: [0.93, 0.93, 0.93, 1],
//     frame: {
//       line: { width: 0.005, color: [0.5, 0.5, 0.5, 1] },
//       corner: { radius: 0.1, sides: 10 },
//       space: 0.15,
//     },
//     title: {
//       text: [
//         'Velocity over Time',
//         { text: 'For object A', lineSpace: 0.13, font: { size: 0.08 } },
//       ],
//       offset: [0, 0],
//     }
//   },
// });

// // Secondary y axis
// diagram.addElement({
//   name: 'plot',
//   method: 'advanced.plot',
//   options: {
//     width: 2,
//     height: 2,
//     trace: pow(2),
//     yAxis: {
//       title: {
//         text: 'velocity (m/s)',
//         rotation: 0,
//         xAlign: 'right',
//       },
//     },
//     xAxis: { title: 'time (s)' },
//     axes: [
//       {
//         axis: 'y',
//         start: 0,
//         stop: 900,
//         color: [1, 0, 0, 1],
//         position: [2, 0],
//         ticks: {
//           step: 300,
//           offset: 0,
//           length: 0.05,
//         },
//         labels: {
//           offset: [0.2, 0],
//           precision: 0,
//           xAlign: 'left',
//         },
//         title: {
//           offset: [0.4, 0],
//           xAlign: 'left',
//           text: 'displacment (m)',
//           rotation: 0,
//         }
//       },
//     ],
//     position: [-1, -1],
//   },
// });

// // Cartesian axes crossing at the zero point
// // Automatic layout doesn't support this, but axes, ticks, labels and titles
// // can all be customized to create it.
// diagram.addElement({
//   name: 'plot',
//   method: 'advanced.plot',
//   options: {
//     width: 3,
//     height: 3,
//     trace: pow(2, 20),
//     font: { size: 0.1 },
//     xAxis: {
//       start: -25,
//       stop: 25,
//       ticks: {
//         start: -20,
//         stop: 20,
//         step: 5,
//         length: 0.1,
//         offset: -0.05
//       },
//       line: { arrow: 'barb' },
//       position: [0, 1.5],
//       labels: [
//         {
//           hide: 4,
//           precision: 0,
//           space: 0.1,
//         },
//         {
//           values: 0,
//           text: 'O',
//           offset: [0, 0.165],
//         },
//       ],
//       title: {
//         text: 'x',
//         offset: [1.65, 0.3],
//         font: {
//           style: 'italic',
//           family: 'Times New Roman',
//           size: 0.15,
//         },
//       },
//     },
//     yAxis: {
//       start: -500,
//       stop: 500,
//       line: { arrow: 'barb' },
//       ticks: {
//         start: -400,
//         stop: 400,
//         step: 100,
//         length: 0.1,
//         offset: -0.05,
//       },
//       position: [1.5, 0],
//       labels: {
//         hide: 4,
//         precision: 0,
//         space: 0.03,
//       },
//       title: {
//         text: 'y',
//         offset: [0.35, 1.6],
//         font: {
//           style: 'italic',
//           family: 'Times New Roman',
//           size: 0.15,
//         },
//         rotation: 0,
//       },
//     },
//     grid: false,
//     position: [-1, -1],
//   },
// });
