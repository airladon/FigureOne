// Initialize the figure with a default color
const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

figure.add(
  {
    name: 'c',
    method: 'collection',
    elements: [        // Add two elements to the collection
      {
        name: 'tri',
        method: 'triangle',
        options: {
          height: 0.4,
          width: 0.4,
        },
      },
      {
        name: 'text',
        method: 'text',
        options: {
          text: 'triangle',
          position: [0, -0.4],
          xAlign: 'center',
        },
      },
    ],
  },
);

// When a collection rotates, then so does all its elements
figure.getElement('c').animations.new()
  .rotation({ target: Math.PI * 1.999, direction: 1, duration: 5 })
  .start();
