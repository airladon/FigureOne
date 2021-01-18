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
//       int: { symbol: 'int' },
//     },
//     forms: {
//       form1: { int: ['int', 'x dx', 'a', 'b'] },
//     },
//   },
// });

// // Triple Integral
// figure.add({
//   method: 'equation',
//   options: {
//     elements: {
//       int: { symbol: 'int', num: 3 },
//     },
//     forms: {
//       form1: { int: ['int', 'dx dy dz'] },
//     },
//   },
// });

// // Line Integral
// figure.add({
//   method: 'equation',
//   options: {
//     elements: {
//       int: { symbol: 'int', type: 'line' },
//     },
//     forms: {
//       form1: { int: ['int', 'r dr'] },
//     },
//   },
// });

// // Define inline simple one use
// figure.add({
//   method: 'equation',
//   options: {
//     forms: {
//       form1: { int: ['int', 'x dx', 'a', 'b'] },
//     },
//   },
// });

// // Define inline with reuse
// const [eqn] = figure.add({
//   method: 'equation',
//   options: {
//     forms: {
//       form1: { int: ['int', 'x dx', 'a', 'b'] },
//       form2: { int: ['int', 'y dy', 'a', 'b'] },
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
      form1: { int: [{ int: { serif: false } }, 'x dx', 'a', 'b'] },
    },
  },
});
