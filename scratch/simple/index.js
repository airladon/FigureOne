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
//       sigma: { symbol: 'sum' },
//     },
//     forms: {
//       form1: { sumOf: ['sigma', 'a', 'a = 0', 'n'] },
//     },
//   },
// });

// // Define inline simple one use
// figure.add({
//   method: 'equation',
//   options: {
//     forms: {
//       form1: { sumOf: ['sum', 'a', 'a = 0', 'n'] },
//     },
//   },
// });

// // Define inline with reuse
// const [eqn] = figure.add({
//   method: 'equation',
//   options: {
//     forms: {
//       form1: { sumOf: ['sum', 'a', 'a = 0', 'n'] },
//       form2: { sumOf: ['sum', 'a', 'a = 0', 'm'] },
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
      form1: { sumOf: [{ sum: { lineWidth: 0.01 } }, 'a', 'a = 0', 'n'] },
    },
  },
});
