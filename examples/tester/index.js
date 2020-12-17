const figure = new Fig.Figure({ limits: [-4.5, -4.5, 9, 9], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });
// const figure = new Fig.Figure({ limits: [-3, -2.25, 6, 4.5], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

// // const figure = new Fig.Figure({ limits: [-8, -8, 16, 16], color: [1, 0, 0, 1]});
// figure.add([
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
//       bounds: [-4.5, -4.5, 9, 9],
//       yStep: 0.1,
//       xStep: 0.1,
//       color: [0.9, 0.9, 0.9, 1],
//       line: { width: 0.004 },
//     },
//   },
//   {
//     name: 'gridMajor',
//     method: 'grid',
//     options: {
//       bounds: [-4.5, -4.5, 9, 9],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.7, 0.7, 0.7, 1],
//       line: { width: 0.004 }
//     },
//   },
// ]);

// figure.add({
//   name: 'eqn',
//   method: 'equation',
//   options: {
//     elements: {
//       a: 'a',
//       b: { color: [0, 0, 1, 1] },
//       c: 'c',
//       equals: ' = ',
//       plus: ' + ',
//     },
//     forms: {
//       1: ['a', 'equals', 'b', 'plus', 'c'],
//       2: ['a', 'equals', 'c', 'plus', 'd'],
//     },
//   },
// });
figure.add({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      a: {
        mods: {
          isTouchable: true, touchBorder: 0.1, onClick: () => console.log('a'),
        },
      },
      b: {
        isTouchable: true, touchBorder: 0.1, onClick: () => console.log('b'),
      },
      c: {
        isTouchable: true, touchBorder: 0.1, onClick: () => console.log('c'),
      },
      times: ' \u00d7 ',
      equals: ' = ',
    },
    forms: {
      1: ['a', 'equals', 'b', 'times', 'c'],
    },
  },
});
// figure.elements._eqn.showForm('1');
// const eqn = figure.elements._eqn;
// eqn.onClick = () => eqn.nextForm();
// eqn.setTouchableRect(0.5);
// eqn.showForm('1');