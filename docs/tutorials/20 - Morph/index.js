/* globals Fig */
const figure = new Fig.Figure();

// Helper functions that can create point fields
const { polylineToShapes, getPolygonCorners, pointsToShapes, polyline } = Fig.tools.morph;

// Helper function to make a range of values
const { range } = Fig.tools.math;

// Number of points - each point will define a square of six vertices
const n = 500;

// Generate a line of points along a sinc function
const sinc = (xIn, a, b) => {
  const x = xIn === 0 ? 0.00001 : xIn;
  return a * Math.sin(b * x) / (b * x);
};

// Generate sinc trace
const xValues = range(-0.8, 0.8, 0.01);
// const [sincPoints] = polylineToShapes({
//   points: xValues.map(x => [x, sinc(x, 0.6, 20)]),
//   num: n,
//   size: 0.04,
//   shape: 15,
// });

// // Generate a line of points along a square
// const [squarePoints] = polylineToShapes({
//   points: [[0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]],
//   num: n,
//   size: 0.04,
//   close: true,
//   shape: 15,
// });

// // Generate a line of points along a circle
// const [circlePoints] = polylineToShapes({
//   points: getPolygonCorners({ radius: 0.5, sides: 50, rotation: Math.PI / 4 }),
//   num: n,
//   size: 0.04,
//   close: true,
//   shape: 15,
// });
const sincPoints = polyline({
  points: xValues.map(x => [x, sinc(x, 0.6, 20)]),
  // points: [
  //   [-0.8, 0], [-0.6, 0.4], [-0.4, 0], [-0.2, 0.4], [0, 0],
  //   [0.2, 0.4], [0.4, 0], [0.6, 0.4], [0.8, 0],
  // ],
  close: true,
  width: 0.03,
  simple: true,
  num: 999,
});
// console.log(sincPoints)
// const [squarePoints] = polyline({
//   points: xValues.map(x => [x, 0.4 * Math.sin(x * Math.PI * 2 / 1)]),
//   // points: [
//   //   [-0.8, 0], [-0.6, 0.4], [-0.4, 0], [-0.2, 0.4], [0, 0],
//   //   [0.2, 0.4], [0.4, 0], [0.6, 0.4], [0.8, 0],
//   // ],
//   // close: true,
//   width: 0.01,
//   simple: true,
//   num: 999,
// });

// const [circlePoints] = polyline({
//   points: xValues.map(x => [x, 0.4 * Math.sin(x * Math.PI * 2 / 2)]),
//   // points: [
//   //   [-0.8, 0], [-0.6, 0.4], [-0.4, 0], [-0.2, 0.4], [0, 0],
//   //   [0.2, 0.4], [0.4, 0], [0.6, 0.4], [0.8, 0],
//   // ],
//   // close: true,
//   width: 0.01,
//   simple: true,
//   num: 999,
// });

const squarePoints = polyline({
  // points: xValues.map(x => [x, sinc(x, 0.3, 20)]),
  points: getPolygonCorners({ radius: 0.5, sides: 50 }),
  width: 0.03,
  num: 999,
  close: true,
  simple: true,
});
// console.log(squarePoints)

const circlePoints = polyline({
  // points: xValues.map(x => [x, sinc(x, 0.8, 20)]),
  // width: 0.03,
  // nu1:,
  points: getPolygonCorners({ radius: 0.5, sides: 4 }),
  width: 0.03,
  num: 999,
  close: true,
  simple: true,
});

const morpher = figure.add({
  make: 'morph',
  names: ['sinc', 'square', 'circle'],
  points: [sincPoints, squarePoints, circlePoints],
  color: [1, 0, 0, 1],
  position: [0, 0],
});

// Animate morph
morpher.animations.new()
  .delay(1)
  .morph({ start: 'sinc', target: 'square', duration: 5 })
  .morph({ start: 'square', target: 'circle', duration: 2 })
  .start();

figure.addFrameRate(10);
