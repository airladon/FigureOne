const figure = new Fig.Figure();
const { pointsToShapes } = Fig.tools.morph;

const xValues = Fig.tools.math.range(-0.8, 0.8, 0.001);
const sinc = (xIn, a, b, c) => {
  const x = (xIn + c) === 0 ? 0.00001 : xIn + c;
  return a * Math.sin(b * x) / (b * x);
};

const [trace1] = pointsToShapes({
  points: xValues.map(x => [x, sinc(x, 0.5, 20, 0)]),
  shape: 'hex',
});

const [trace2] = pointsToShapes({
  points: xValues.map(x => [x, 0.4 * Math.sin(x * 2 * Math.PI / 0.5)]),
  shape: 'hex',
});

const m = figure.add({
  make: 'morph',
  points: [trace1, trace2],
  color: [1, 0, 0, 1],
});

m.animations.new()
  .morph({ start: 0, target: 1, duration: 2 })
  .start();

console.log(figure.getRemainingAnimationTime())