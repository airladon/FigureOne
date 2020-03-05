// Create diagram and make it touchable
const diagram = new Fig.Diagram();
diagram.setTouchable();

// Add elements to the diagram
diagram.addElements([
  {
    name: 'pentagon',
    method: 'polygon',
    options: {
      sides: 5,
      radius: 0.2,
      fill: true,
      color: [1, 0, 0, 1],
    },
  },
]);

// Start a new animation
diagram.getElement('pentagon').animations.new()
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

// Initialize diagram
diagram.initialize();