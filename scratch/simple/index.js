const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

// figure.add({ method: 'polygon', options: { radius: 0.01 } });
const [eqn] = figure.add({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      lb: { symbol: 'bracket', side: 'left' },
      rb: { symbol: 'bracket', side: 'right' },
    },
    formDefaults: {
      alignment: { fixTo: 'lb' },
    },
    forms: {
      0: [
        { container: { content: 'a_1', inSize: false } },
        'a', '_ \u00d7 ',
        {
          brac: ['lb', ['b', '_ + ', 'c'], 'rb'],
        },
      ],
      1: [
        { container: { content: 'a_1', inSize: false } },
        'a', '_ \u00d7 ',
        {
          brac: [
            'lb',
            [
              { container: [' ', 0.17] },
              'b', '_ + ',
              { container: [' ', 0.17] }, 'c'],
            'rb',
          ],
        },
      ],
      2: {
        content: {
          brac: ['lb', ['a', '_ \u00d7 _1 ', 'b', '_ + ', 'a_1', '_ \u00d7 _2', 'c'], 'rb'],
        },
        translation: {
          // a: { style: 'curve', direction: 'up', mag: 2 },
          a_1: { style: 'curve', direction: 'up', mag: 1 },
        },
      },
    },
  },
});

eqn.animations.new()
  .goToForm({ target: 1, animate: 'move', delay: 1 })
  .goToForm({ target: 2, animate: 'move', delay: 1, duration: 2 })
  .start();