/* globals Fig */
const figure = new Fig.Figure();

// Helper functions that can create point fields
const { imageToPoints, lineToPoints } = Fig.tools.morph;
const { range } = Fig.tools.math;

// Load an image file
const logoImage = new Image();
logoImage.src = './logo.png';

logoImage.onload = () => {
  const n = 12000;

  // Generate a line of points along a sinc function
  const sinc = (xIn, a, b) => {
    const x = xIn === 0 ? 0.00001 : xIn;
    return a * Math.sin(b * x) / (b * x);
  };
  const [sincPoints] = lineToPoints({
    line: range(-0.8, 0.8, 0.02).map(x => [x, sinc(x, 0.5, 20)]),
    maxPoints: n,
    pointSize: 0.008,
  });

  // Generate randomly distributed points aligned with pixels of
  // 'logo.png'.
  const [logoPoints, cols] = imageToPoints({
    image: logoImage,
    filter: c => c[3] > 0,
    height: 1,
    dither: 0.003,
    pointSize: 0.008,
    offset: [0, 0],
    maxPoints: n,
  });

  // Add the morpher figure element primitive, and define the points it should
  // morph between
  const morpher = figure.add({
    make: 'morph',
    names: ['sincPoints', 'logo'],
    points: [sincPoints, logoPoints],
    color: [cols, cols],
  });

  // Animate morph
  morpher.animations.new()
    .delay(1)
    .morph({ start: 'sinc', target: 'logo', duration: 5 })
    .start();
};
