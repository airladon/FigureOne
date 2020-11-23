const figure = new Fig.Figure();

// Add a collection with a circle and triangle in it to the figure
figure.addElement(
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
figure.getElement('shapes').setScale(0.5),

figure.initialize();
