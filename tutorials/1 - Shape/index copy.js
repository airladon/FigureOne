// Create a diagram
const diagram = new Fig.Diagram();

// Add red circle to diagram
diagram.addElement(
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

