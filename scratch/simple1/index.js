// // const { polygon } = Fig.tools.g2;
const { Figure, tools, range } = Fig;
const figure = new Figure({
  color: [1, 0, 0, 1],
  // backgroundColor: tools.color.HexToArray('#f6f7f7'),
});

figure.add({
  make: 'equation',
  elements: {
    div: {symbol: 'division', bendWidth: 0.05, sides: 10, lineWidth: 0.01},
  },
  forms: {
    0: {
      box: {
        content: {scale:[['a'], 1]},
        symbol: 'div',
        leftSpace: 0.02,
        bottomSpace: 0,
        topSpace: 0.02,
        rightSpace: 0.02,
      },
    },
  },
});

// figure.add({
//   make: 'equation',
//   elements: {
//     d: { symbol: 'division', bendWidth: 0.05 },
//   },
//   forms: {
//     form1: { box: ['abc', 'd'] },
//   },
// });

// // Define inline simple one use
// figure.add({
//   make: 'equation',
//   forms: {
//     form1: { box: ['abc', 'division'] },
//   },
// });

// // Define inline with reuse
// const eqn = figure.add({
//   make: 'equation',
//   forms: {
//     form1: { box: ['abc', 'd1_division'] },
//     form2: { box: [['abc', 'd'], 'd1'] },
//   },
// });
// eqn.animations.new()
//   .goToForm({ delay: 1, target: 'form2', animate: 'move' })
//   .start();

// // Define inline with customization
// figure.add({
//   make: 'equation',
//   forms: {
//     form1: { box: ['abc', { division: { lineWidth: 0.005 } }] },
//   },
// });