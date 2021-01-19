const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

figure.add({ method: 'polygon', options: { radius: 0.01 } });
figure.add({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      equals1: ' = ',
      equals2: ' = ',
    },
    formDefaults: { alignment: { fixTo: 'equals1', yAlign: -1.5 } },
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
          ],
          space: 0.08,
          justify: 'element',
          yAlign: 'bottom',
        },
      },
    },
  },
});
