// Initialize the figure with a default color
const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

const c = figure.add(
  {
    method: 'collection',
    // Add two elements to the collection
    elements: [
      {
        method: 'triangle',
        height: 0.4,
        width: 0.4,
      },
      {
        method: 'text',
        text: 'triangle',
        position: [0, -0.4],
        xAlign: 'center',
      },
    ],
  },
);

// When a collection rotates, then so does all its elements
c.animations.new()
  .rotation({ target: Math.PI * 1.999, direction: 1, duration: 5 })
  .start();
