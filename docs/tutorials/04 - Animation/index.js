const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

// Add a simple shape to the figure
figure.add([
  {
    name: 'hexagon',
    method: 'polygon',
    options: {
      sides: 6,
      radius: 0.2,
    },
  },
]);

// Start a new animation
figure.getElement('hexagon').animations.new()
  .position({ target: [-0.4, -0.4], velocity: 0.3 })
  .rotation({ delta: Math.PI / 2, duration: 1 })
  .position({ target: [0, 0], velocity: 0.3 })
  .pulse({ duration: 1 })
  .rotation({ delta: Math.PI / 2, duration: 1 })
  .dissolveOut({ duration: 1 })
  .dissolveIn({ duration: 1 })
  .position({ target: [-0.5, 0.5], velocity: 0.3 })
  .position({ target: [0, 0], velocity: 0.3 })
  .start();
