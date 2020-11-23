// Create a figure
const figure = new Fig.Figure();

// Add red circle to figure
figure.addElement(
  {
    name: 'circle',
    method: 'polygon',
    options: {
      sides: 100,
      radius: 0.2,
      color: [1, 0, 0, 1],
    },
  },
);

