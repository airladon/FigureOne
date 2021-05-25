// Create a figure
const figure = new Fig.Figure();

// Add a triangle
const triangle = figure.add(
  {
    make: 'morph',
    points: [
      [0, 0, 1, 0, 1, 1],
      [0, 0, 1, 0, 0, 1],
    ],
    // color: [
    //   [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    //   [0, 0, 1, 1],
    // ],
    color: [1, 0, 0, 1],
  },
);

triangle.animations.new()
  .morph({ start: 0, target: 1, duration: 2 })
  .start();

console.log('asdf')
