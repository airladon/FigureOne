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

//Simple
diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    forms: {
      1: { int: ['int', 'x dx', 'a', 'b'] },
    },
  },
});
diagram.elements._eqn.showForm('1');

// Example showing different integral options
diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      i: { symbol: 'int' },
      // ic: { symbol: 'int', num: 1, type: 'line' },
    },
    formDefaults: { alignment: { fixTo: 'x' } },
    forms: {
      // Root object form
      1: {
        int: {
          symbol: 'i',
          content: ['x', ' ', 'dx'],
          from: 'a',
          to: 'b',
        },
      },
      // Root array form
      2: { int: ['i', ['x', '  ', '+', ' ', '_1', ' ', 'dx'], 'a', 'b'] },
      // Indefinite tripple integral
      3: { int: ['i', ['x', '  ', '+', ' ', '_1', ' ', 'dx']] },
      // Custom spacing
      4: {
        int: {
          symbol: 'i',
          content: ['x', '  ', '+', ' ', '_1', ' ', 'dx'],
          to: 'b',
          from: { frac: ['a', 'vinculum', 'd + 2'] },
          topSpace: 0.2,
          bottomSpace: 0.2,
          limitsAroundContent: false,
        },
      },
    },
    formSeries: ['1', '2', '3', '4'],
  },
});
const eqn = diagram.elements._eqn;
eqn.onClick = () => eqn.nextForm();
eqn.setTouchableRect(0.5);
eqn.showForm('1');


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