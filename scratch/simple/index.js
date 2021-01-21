const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

// Add name and element
const [p] = figure.add({
  method: 'equation',
  options: {
    forms: {
      0: [{ frac: ['t', 'vinculum', 'a'] }],
    },
  },
  mods: {
    scenarios: {
      default: { position: [0, 0] },
      left: { position: [1, 0] },
    },
  },
});

p.animations.new()
  .inParallel([
    // p.animations.position({ target: [1, 0], delay: 1, duration: 1 }),
    p.animations.scenario({ target: 'left', delay: 1, duration: 1 }),
    p.animations.rotation({ target: 1, delay: 1, duration: 1 }),
  ])
  .start();
// const [eqn] = figure.add(
//   {
//     name: 'eqn',
//     method: 'equation',
//     options: {
//       forms: {
//         test: ['at_1'],
//       },
//     },
//   },
// );
// eqn.showForm('test')
// console.log(eqn._at_1.lastDrawTransform.order)