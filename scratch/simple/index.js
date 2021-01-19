const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

// // Define in element
// figure.add({
//   method: 'equation',
//   options: {
//     elements: {
//       r: { symbol: 'radical' },
//     },
//     forms: {
//       form1: { root: ['r', 'a', false, 0.05] },
//     },
//   },
// });

// // Define inline simple one use
// figure.add({
//   method: 'equation',
//   options: {
//     forms: {
//       form1: { root: ['radical', 'a', false, 0.05] },
//     },
//   },
// });

// // Define inline with reuse
// const [eqn] = figure.add({
//   method: 'equation',
//   options: {
//     forms: {
//       form1: { root: ['r1_radical', 'a', false, 0.05] },
//       form2: { root: ['r1', ['a', 'b'], false, 0.05] },
//     },
//   },
// });
// eqn.animations.new()
//   .goToForm({ delay: 1, target: 'form2', animate: 'move' })
//   .start();

// Define inline with customization
figure.add({
  method: 'equation',
  options: {
    forms: {
      form1: { root: [{ radical: { lineWidth: 0.005 } }, 'a', false, 0.05] },
    },
  },
});
