/* globals Fig */
const figure = new Fig.Figure();

// Create the shape
const [tri] = figure.add(
  {
    method: 'triangle',
    options: {
      color: [1, 0, 0, 1],
    },
  },
);

// Animate the shape
tri.animations.new()
  .position({ target: [0.5, 0], duration: 1 })
  .rotation({ target: Math.PI, duration: 2 })
  .position({ target: [0, 0], duration: 1 })
  .start();
