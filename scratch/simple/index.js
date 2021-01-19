const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

// Define inline with reuse
const [eqn] = figure.add({
  method: 'equation',
  options: {
    forms: {
      form1: { frac: ['a', 'v1_vinculum', { frac: ['c', 'v2_vinculum', 'b'] }] },
      form2: { frac: [['a', 'ef'], 'v1', { frac: ['c', 'v2', 'd'] }] },
    },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();