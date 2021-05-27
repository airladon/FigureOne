
const figure = new Fig.Figure();
const { imageToShapes, circleCloudShapes, polylineToShapes } = Fig.tools.morph;
const { range } = Fig.tools.math;

const image = new Image();
image.src = './logocolored.png';
image.onload = () => {
  const [logo, logoColors] = imageToShapes({
    image,
    width: 2,
    height: 2,
    dither: 0.003,
  });

  const n = logo.length / 2 / 6;
  const cloud = circleCloudShapes({
    radius: 3,
    num: n,
    size: 0.005,
  });

  // Generate a line of shapes along a circle
  const xValues = range(-0.8, 0.8, 0.001);
  const [sine] = polylineToShapes({
    points: xValues.map(x => [x, 0.3 * Math.sin(x * 2 * Math.PI / 0.4)]),
    num: n,
    size: 0.01,
  });

  const m = figure.add({
    make: 'morph',
    points: [cloud, logo, sine],
    names: ['cloud', 'logo', 'sine'],
    color: [logoColors, logoColors, [0, 0, 1, 1]],
  });

  m.setPoints('sine');
  m.animations.new()
    .delay(1)
    .morph({ start: 'sine', target: 'cloud', duration: 2 })
    .morph({ start: 'cloud', target: 'logo', duration: 2 })
    .start();
};
