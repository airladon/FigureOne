/* globals Fig */
const figure = new Fig.Figure();

// Helper functions that can create point fields
const { lineToPoints, getPolygonCorners } = Fig.tools.morph;

// Helper function to make a range of values
const { range } = Fig.tools.math;

// Number of points - each point will define a square of six vertices
const n = 10000;

// Generate a line of points along a sinc function
const sinc = (xIn, a, b) => {
  const x = xIn === 0 ? 0.00001 : xIn;
  return a * Math.sin(b * x) / (b * x);
};
const [sincPoints] = lineToPoints({
  line: range(-0.8, 0.8, 0.02).map(x => [x, sinc(x, 0.5, 20)]),
  maxPoints: n,
  pointSize: 0.01,
});

// Generate a line of points along a square
const [squarePoints] = lineToPoints({
  line: [[0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]],
  maxPoints: n,
  pointSize: 0.01,
  close: true,
});

// Generate a line of points along a circle
const [circlePoints] = lineToPoints({
  line: getPolygonCorners({ radius: 0.5, sides: 50, rotation: Math.PI / 4 }),
  maxPoints: n,
  pointSize: 0.01,
  close: true,
});


// Add 20 morpher figure elements, and animate each one to morph between the
// three point arrays
for (let i = 0; i < 20; i += 1) {
  const morpher = figure.add({
    make: 'morph',
    names: ['sincPoints', 'square', 'circle'],
    points: [sincPoints, squarePoints, circlePoints],
    color: [1, 0, 0, 1],
    position: [-0.25 + i / 40, -0.25 + i / 40],
  });

  // Animate morph
  morpher.animations.new()
    .delay(1)
    .morph({ start: 'sinc', target: 'square', duration: 5 })
    .morph({ start: 'square', target: 'circle', duration: 2 })
    .start();
}

figure.addFrameRate(10);