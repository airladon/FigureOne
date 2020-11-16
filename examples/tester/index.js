const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1]});

diagram.addElements([
  {
    name: 'origin',
    method: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1]
    },
  },
  {
    name: 'grid',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.001 },
    },
  },
  {
    name: 'gridMajor',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.8, 0.8, 0.8, 1],
      line: { width: 0.004 }
    },
  },
]);


const xAxis = diagram.advanced.axis({
  // position: [-1, -1],
  length: 2,
  axis: 'x',
  start: -1,
  stop: 0.95,
  line: { width: 0.01 },
  ticks: { step: 0.5, length: 0.1 },
  grid: { step: 0.5, length: 2, width: 0.002 },
  labels: { text: null, precision: 1, },
})
diagram.add('xAxis', xAxis);

const yAxis = diagram.advanced.axis({
  // position: [-1, -1],
  length: 2,
  axis: 'y',
  start: -1,
  stop: 1,
  line: { width: 0.01 },
  ticks: [ { step: 0.5, length: 0.1 }],
  grid: [ { step: 0.5, length: 2, width: 0.002 }],
  labels: { text: null, precision: 1, },
})
diagram.add('xAxis', xAxis);
diagram.add('yAxis', yAxis);

const sin = () => {
  const xValues = Fig.tools.math.range(-1, 1, 0.05);
  const points = [];
  xValues.forEach((x) => {
    points.push([x, 0.5 * Math.sin(x * Math.PI * 2)]);
  })
  return points;
}
const trace = diagram.advanced.trace({
  points: sin(),
  markers: { radius: 0.03, sides: 4, line: { width: 0.005 }, rotation: Math.PI / 6 + Math.PI,  copy: { along: 'rotation', num: 1, step: Math.PI / 4 } },
  xAxis,
  yAxis,
});
diagram.add('trace', trace);

const trace1 = diagram.advanced.trace({
  points: [[-2, 0], [2, 2], [0.1, 0], [1, 0]],
  line: { width: 0.04 },
  markers: { radius: 0.1, sides: 3, rotation: Math.PI / 6 + Math.PI, color: [0, 1, 0, 1], copy: { along: 'rotation', num: 1, step: Math.PI / 3 }, },
  color: [0, 0, 1, 1],
  xAxis,
  yAxis,
})
diagram.add('trace1', trace1);
// diagram.addElement({
//   name: 'axis',
//   method: 'advanced.axis',
//   options: {
//     position: [-1, -1],
//     length: 3,
//     axis: 'x',
//     start: -2,
//     stop: 1,
//     line: {
//       width: 0.01,
//       // arrow: { end: 'triangle' },
//       // dash: [0.1, 0.1],
//     },
//     ticks: [
//       {
//         step: 0.5,
//         length: 0.1,
//         // stop: 1,
//       },
//       {
//         step: 0.05,
//         width: 0.008,
//         length: 0.06,
//         // stop: 1,
//         // offset: 0,
//       }
//     ],
//     grid: [
//       {
//         step: 0.5,
//         length: 1,
//         // stop: 1,
//         width: 0.007,
//       },
//       {
//         step: 0.1,
//         length: 1,
//         // stop: 1,
//         width: 0.007,
//         color: [0.5, 0.5, 0.5, 1],
//         dash: [0.01, 0.01],
//       },
//     ],
//     labels: [
//       {
//         font: { size: 0.1 },
//         precision: 2,
//         hide: 4,
//       },
//       {
//         values: [0],
//         font: { size: 0.2 },
//         offset: [-0.01, -0.2],
//         text: 'O',
//       },
//     ],
//     title: {
//       lines: [
//         {
//           line: 'hello',
//           lineSpace: -0.1,
//         },
//         {
//           font: { size: 0.1 },
//           line: 'there',
//         },
//       ],
//       font: { color: [0, 1, 0, 1] },
//       offset: [-0.1, 0],
//     },
//   },
// });