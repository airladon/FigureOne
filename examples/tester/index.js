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

// // Simple
// diagram.addElement({
//   name: 'eqn',
//   method: 'equation',
//   options: {
//     forms: {
//       1: { prodOf: ['prod', 'x', 'b', 'a'] },
//     },
//   },
// });
// diagram.elements._eqn.showForm('1');

// // Example showing different options
// diagram.addElement({
//   name: 'eqn',
//   method: 'equation',
//   options: {
//     elements: {
//       p: { symbol: 'prod', draw: 'dynamic' },
//       inf: '\u221e',
//     },
//     forms: {
//       // Object form
//       1: {
//         prodOf: {
//           symbol: 'p',
//           content: [{ sup: ['x', 'n'] }],
//           from: ['n_1', ' ', '=', ' ', '_0'],
//           to: '_10',
//         },
//       },
//       // Array form
//       2: { prodOf: ['p', [{ sup: ['x', 'm'] }], 'm_1', null]},
//       // Styling with options
//       3: {
//         prodOf: {
//           symbol: 'p',
//           content: { frac: [['x', ' ', '+', ' ', 'm'], 'vinculum', 'a'] },
//           from: ['m_1', ' ', '=', ' ', '_0'],
//           to: 'inf',
//           fromScale: 0.8,
//           toScale: 0.8,
//         },
//       },
//     },
//     formSeries: ['1', '2', '3'],
//   },
// });
// const eqn = diagram.elements._eqn;
// eqn.onClick = () => eqn.nextForm();
// eqn.setTouchableRect(0.5);
// eqn.showForm('1');


// Simple
diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    forms: {
      1: { box: ['a', 'box', true, 0.1] },
    },
  },
});
diagram.elements._eqn.showForm('1');

// // Some different bracket examples
// diagram.addElement({
//   name: 'eqn',
//   method: 'equation',
//   options: {
//     elements: {
//       box: { symbol: 'box' },
//     },
//     forms: {
//       // Array equation
//       1: ['a', { box: ['b', 'box'] }, 'c'],
//       // Object definition
//       2: {
//         box: {
//           content: ['a', 'b', 'c'],
//           symbol: 'box',
//         },
//       },
//       // Additional options for layout
//       3: {
//         box: {
//           content: ['a', 'b', 'c'],
//           symbol: 'box',
//           space: 0.2,
//         },
//       },
//       // Box is included in the layout spacing
//       4: [
//         'a',
//         {
//           box: {
//             content: 'b',
//             symbol: 'box',
//             space: 0.2,
//             inSize: true,
//           },
//         },
//         'c'
//       ],
//     },
//     formSeries: ['1', '2', '3', '4']
//   },
// });
// const eqn = diagram.elements._eqn;
// eqn.onClick = () => eqn.nextForm();
// eqn.setTouchableRect(0.5);
// eqn.showForm('1');