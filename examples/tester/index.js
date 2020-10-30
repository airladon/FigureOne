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
      1: { topComment: ['radius', 'r = 1'] },
    },
  },
});
diagram.elements._eqn.showForm('1');


// // Some different bar examples
// diagram.addElement({
//   name: 'eqn',
//   method: 'equation',
//   options: {
//     elements: {
//       bBkt: { symbol: 'bracket', side: 'bottom' },
//       tBrc: { symbol: 'brace', side: 'top' },
//       bSqr: { symbol: 'squareBracket', side: 'bottom' },
//     },
//     forms: {
//       // Array equation
//       1: { topComment: ['a \u00d7 b \u00d7 c', 'b = 1, c = 1', 'tBrc'] },
//       // Object definition
//       2: {
//         bottomComment: {
//           content: 'a \u00d7 b \u00d7 c',
//           symbol: 'bBkt',
//           comment: 'b = 1, c = 1',
//         },
//       },
//       // Additional options for layout
//       3: {
//         bottomComment: {
//           content: 'a \u00d7 b \u00d7 c',
//           symbol: 'bSqr',
//           comment: 'b = 1, c = 1',
//           contentSpace: 0.1,
//           commentSpace: 0.1,
//           scale: 0.7,
//         },
//       },
//       // Just comment
//       4: {
//         bottomComment: {
//           content: 'a \u00d7 b \u00d7 c',
//           comment: 'for a > 3',
//         },
//       },
//     },
//     formSeries: ['1', '2', '3', '4']
//   },
// });
// const eqn = diagram.elements._eqn;
// eqn.onClick = () => eqn.nextForm();
// eqn.setTouchableRect(0.5);
// eqn.showForm('1');