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

// diagram.addElement({
//   name: 'eqn',
//   method: 'equation',
//   options: {
//     elements: {
//       a: 'a',
//       v1: { symbol: 'vinculum' },
//       v2: { symbol: 'vinculum' },
//       plus: '  +  ',
//     },
//     formDefaults: {
//       alignment: {
//         // fixTo: 'a',
//         xAlign: 'center',
//         yAlign: 'middle',
//       },
//     },
//     forms: {
//       // Fraction object form
//       1: {
//         frac: {
//           numerator: 'a',
//           denominator: 'b',
//           symbol: 'v1',
//         },
//       },
//       // Fraction array form
//       2: { frac: ['a', 'v1', 'd'] },
//       // Nested
//       3: {
//         frac: {
//           numerator: [{ frac: ['a', 'v1', 'd', 0.7] }, 'plus', '_1'],
//           symbol: 'v2',
//           denominator: 'b',
//         }
//       },
//     },
//     formSeries: ['1', '2', '3'],
//   },
// });
// const eqn = diagram.elements._eqn;

// eqn.setTouchableRect(0.5);
// eqn.onClick = () => eqn.nextForm();
// eqn.showForm('without');

diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    forms: {
      1: { frac: ['a', 'vinculum', 'b'] },
    },
  },
});
diagram.elements._eqn.showForm('1');

// // Create equation object then add to diagram
// const eqn = diagram.create.equation({
//   elements: {
//     r: { symbol: 'radical' },
//     plus: '  +  ',
//   },
//   formDefaults: {
//     alignment: { fixTo: 'd' },
//   },
//   forms: {
//     1: {
//       root: {
//         symbol: 'r',
//         content: ['a', 'plus', 'd'],
//       },
//     },
//     2: { root: ['r', 'd'] },
//     3: { root: { content: 'd', symbol: 'r', root: '_3' } },
//   },
//   formSeries: ['1', '2', '3'],
// });
// diagram.add('eqn', eqn);
// eqn.onClick = () => eqn.nextForm();
// eqn.setTouchableRect(0.5);
// eqn.showForm('1');