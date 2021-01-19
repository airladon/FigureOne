const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

// Two lines animating to 1
figure.add({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      equals1: ' = ',
      equals2: ' = ',
    },
    forms: {
      0: {
        lines: {
          content: [
            {
              content: ['a_1', 'equals1', 'b', '_ + ', 'c'],
              justify: 'equals1',
            },
            {
              content: ['d', '_ - ', 'e', 'equals2', 'a_2'],
              justify: 'equals2',
            },
            { frac: ['a', 'vinculum', 'b'] },
          ],
          space: 0.08,
          justify: 'element',
        },
      },
      1: ['d', '_ - ', 'e', 'equals1', 'b', '_ + ', 'c'],
    },
  },
});

figure.getElement('eqn').showForm(0);
figure.getElement('eqn').animations.new()
  .goToForm({
    delay: 1, target: '1', duration: 1, animate: 'move',
  })
  .start();