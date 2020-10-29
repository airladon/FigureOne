const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});

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

// diagram.addElement(
//   {
//     name: 'equation',
//     method: 'equation',
//     options: {
//       color: [1, 0, 0, 1],
//       font: { size: 0.4 },
//       elements: {
//         a: 'a',
//         b: 'b',
//         c: 'c',
//         v: { symbol: 'vinculum'},
//         equals: ' = ',
//         times: ' \u00D7 ',  // unicode times symbol
//       },
//       forms: {
//         a: ['a', 'equals', 'b', 'times', 'c'],
//         b: ['b', 'equals', { frac: ['a', 'v', 'c'] }],
//         bCurve: {
//           content: ['b', 'equals', { frac: ['a', 'v', 'c'] }],
//           animation: {
//             translation: {
//               a: { style: 'curve', direction: 'up', mag: 0.8 },
//               b: { style: 'curve', direction: 'down', mag: 1.2 },
//             },
//           },
//         },
//       },
//     },
//   },
// );
// const equation = diagram.getElement('equation')
// equation.showForm('a');

// equation.showForm('b')
// equation._c.makeTouchable();
// equation._c.onClick = () => { console.log('c was touched') }


diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    forms: {
      1: [
        'length',
        {
          container: {
            content: 'width',
            width: 0.5,
          },
        },
        'height',
      ],
      2: [
        'length',
        {
          container: {
            content: 'w',
            width: 0.5,
          },
        },
        'height',
      ],
      3: ['length', 'w', 'height']
    },
  },
});
const eqn = diagram.elements._eqn;
diagram.elements.animations.new()
  .trigger({
    callback: () => { eqn.showForm('1') },
    duration: 1,
  })
  .trigger({
    callback: () => { eqn.goToForm({ form: '2', animate: 'move' }); },
    duration: 1,
  })
  .trigger({
    callback: () => { eqn.goToForm({ form: '3', animate: 'move' }); },
    duration: 1,
  })
  .start();
