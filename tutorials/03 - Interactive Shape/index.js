// Create figure and make it able to be touched
const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

// Add circle to figure
figure.add(
  {
    name: 'circle',
    method: 'polygon',
    options: {
      sides: 100,
      radius: 0.2,
      touchBorder: 0.2,
    },
    mods: {
      isMovable: true,
      move: {
        bounds: 'figure',
      },
    },
  },
);
