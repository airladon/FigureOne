// Create diagram and make it able to be touched
const diagram = new Fig.Diagram();
diagram.setTouchable();

// Add circle to diagram
diagram.addElement(
  {
    name: 'shapes',
    method: 'collection',
    addElements: [
      {
        name: 'circle',
        method: 'polygon',
        options: {
          sides: 100,
          radius: 0.2,
          fill: true,
          color: [1, 0, 0, 1],
          position: [-0.5, 0],
        },
      },
      {
        name: 'triangle',
        method: 'polygon',
        options: {
          sides: 3,
          radius: 0.2,
          fill: true,
          color: [1, 0, 0, 1],
          position: [0.5, 0],
        },
      }
    ],
  },
);

// Scale the shapes collection
// This will reduce the size of both the circle and triangle
diagram.getElement('shapes').setScale(0.5),

// Initialize diagram
diagram.initialize();
