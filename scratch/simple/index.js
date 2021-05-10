// const figure = new Fig.Figure();

// Add two squares to the figure
const figure = new Fig.Figure({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });
figure.add({
  make: 'equation',
  forms: {
    base: ['a', '_ = ', { frac: ['b', 'vinculum', 'c'] }],
  },
});