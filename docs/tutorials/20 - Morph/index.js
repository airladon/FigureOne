/* globals Fig */
const figure = new Fig.Figure();

const { polylineToShapes, getPolygonCorners } = Fig.tools.morph;
const { range } = Fig.tools.math;

// Number of shapes that make up the lines
const n = 300;

// Generate a line of points along a sinc function
const sinc = (xIn, a, b) => {
  const x = xIn === 0 ? 0.00001 : xIn;
  return a * Math.sin(b * x) / (b * x);
};

// Generate line of shapes along a sinc function
const xValues = range(-0.8, 0.8, 0.01);
const [sincPoints] = polylineToShapes({
  points: xValues.map(x => [x, sinc(x, 0.6, 20)]),
  num: n,
  size: 0.04,
  shape: 15,
});

// Generate a line of shapes along a square
const [squarePoints] = polylineToShapes({
  points: [[0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]],
  num: n,
  size: 0.04,
  close: true,
  shape: 15,
});

// Generate a line of shapes along a circle
const [circlePoints] = polylineToShapes({
  points: getPolygonCorners({ radius: 0.5, sides: 50, rotation: Math.PI / 4 }),
  num: n,
  size: 0.04,
  close: true,
  shape: 15,
});

const morpher = figure.add({
  make: 'morph',
  names: ['sinc', 'square', 'circle'],
  points: [sincPoints, squarePoints, circlePoints],
  color: [1, 0, 0, 1],
});

// Animate morph
morpher.animations.new()
  .delay(1)
  .morph({ start: 'sinc', target: 'square', duration: 2 })
  .morph({ start: 'square', target: 'circle', duration: 2 })
  .morph({ start: 'circle', target: 'sinc', duration: 2 })
  .start();

// figure.addFrameRate(10);
