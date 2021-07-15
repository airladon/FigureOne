// Create figure
const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

// Add circle to figure
figure.add(
  {
    make: 'polygon',
    sides: 100,
    radius: 0.2,
    move: {
      bounds: {
        left: 0.8, bottom: 0.8, right: 0.8, top: 0.8,
      },
      freely: { deceleration: 0.5 },
    },
  },
);
