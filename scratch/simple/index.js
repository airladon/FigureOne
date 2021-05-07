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
  .position(0.5, 0.5)
  .rotation(Math.PI)
  .position(0, 0)
  .start();
