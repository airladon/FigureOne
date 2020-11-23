// Create figure and make it able to be touched
const figure = new Fig.Figure();
figure.setTouchable();

// Add circle to figure
figure.addElement(
  {
    name: 'circle',
    method: 'polygon',
    options: {
      sides: 100,
      radius: 0.2,
      fill: true,
      color: [1, 0, 0, 1],
    },
    mods: {
      isTouchable: true,
      isMovable: true,
      move: {
        bounds: 'figure',
      },
    },
  },
);

// Initialize figure
figure.initialize();
