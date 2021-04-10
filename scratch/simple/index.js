const figure = new Fig.Figure({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });
// const figure = new Fig.Figure();

// Figure has two rectangles and a slide navigator
figure.add([
  {
    name: 'rect1',
    method: 'equation',
    options: {
      forms: {
        0: [
          'a', '_ = ', 'n',
          { offset: ['for a > 0', [0.3, 0]] },
        ],
      },
    },
  },
]);
