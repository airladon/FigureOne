/* globals Fig */

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [0, 0, 0, 1],
});

const { rand } = Fig.tools.math;

const img = new Image();
img.src = './logo.png';

const r = 0.015;
const makeShape = center => [
  center[0] - r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] + r / 2,
  center[0] - r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] + r / 2,
  center[0] - r / 2, center[1] + r / 2,
];
const makeColors = c => [...c, ...c, ...c, ...c, ...c, ...c];

function getImagePointsAndColors(
  image, xBottom, yBottom, xWidth, yHeight, xDither = 0, yDither = 0,
) {
  const { width, height } = img;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  const imgData = context.getImageData(0, 0, width, height).data;
  const points = [];
  const colors = [];
  for (let h = 0; h < width; h += 1) {
    for (let w = 0; w < height; w += 1) {
      points.push(...makeShape([
        xBottom + w / width * xWidth + rand(-xDither, xDither),
        yBottom + yHeight - h / height * yHeight + rand(-yDither, yDither),
      ]));
      const pixelIndex = h * width * 4 + w * 4;
      const pixel = [
        imgData[pixelIndex] / 255,
        imgData[pixelIndex + 1] / 255,
        imgData[pixelIndex + 2] / 255,
        imgData[pixelIndex + 3] / 255,
      ];
      colors.push(...makeColors(pixel));
    }
  }
  return [points, colors];
}

function pointsToVertices(points) {
  const vertices = [];
  for (let i = 0; i < points.length; i += 1) {
    vertices.push(...makeShape(points[i]));
  }
  return vertices;
}

function lineToPoints(
  linePoints, // : Array<[number, number]>,
  numPoints, // : number,
  close = false, // : boolean = false,
) {
  let cumDistance = 0;
  const distances = Array(linePoints.length).fill(0);
  const cumDistances = Array(linePoints.length).fill(0); 
  for (let i = 1; i < linePoints.length; i += 1) {
    const p = [linePoints[i][0], linePoints[i][1]];
    const q = [linePoints[i - 1][0], linePoints[i - 1][1]];
    const distance = Math.sqrt(((p[0] - q[0]) ** 2) + ((p[1] - q[1]) ** 2));
    cumDistance += distance;
    distances[i] = distance;
    cumDistances[i] = cumDistance;
  }
  if (close) {
    const p = [linePoints[0][0], linePoints[0][1]];
    const q = [linePoints[linePoints.length - 1][0], linePoints[linePoints.length - 1][1]];
    const distance = Math.sqrt(((p[0] - q[0]) ** 2) + ((p[1] - q[1]) ** 2));
    cumDistance += distance;
    distances[0] = distance;
    cumDistances[0] = cumDistance;
  }
  const distanceStep = cumDistance / (numPoints - 1);
  const points = Array(numPoints);
  let nextLinePointIndex = 1;
  let currLinePointIndex = 0;
  for (let i = 0; i < numPoints; i += 1) {
    const currentCumDist = i * distanceStep;
    if (i === 0) {
      points[i] = linePoints[i];
      // eslint-disable-next-line no-continue
      continue;
    }
    while (cumDistances[nextLinePointIndex] < currentCumDist) {
      if (nextLinePointIndex === linePoints.length - 1) {
        nextLinePointIndex = 0;
      } else {
        nextLinePointIndex += 1;
      }
      currLinePointIndex += 1;
    }
    const remainingDistance = cumDistances[nextLinePointIndex] - currentCumDist;
    const remainingPercent = 1 - remainingDistance / distances[nextLinePointIndex];
    const q = linePoints[currLinePointIndex];
    const p = linePoints[nextLinePointIndex];
    points[i] = [
      (p[0] - q[0]) * remainingPercent + q[0],
      (p[1] - q[1]) * remainingPercent + q[1],
    ];
  }
  return pointsToVertices(points);
}

const makePolygon = (radius, sides, numPoints) => {
  const points = [];
  const dAngle = Math.PI * 2 / sides;
  for (let i = 0; i < sides; i += 1) {
    points.push([
      radius * Math.cos(dAngle * i),
      radius * Math.sin(dAngle * i),
    ]);
  }
  return lineToPoints(points, numPoints, true);
};

img.addEventListener('load', () => {
  const [imagePoints, colors] = getImagePointsAndColors(img, -2, -2, 4, 4, 0.01, 0.01);
  const n = imagePoints.length / 2 / 6;
  const square = lineToPoints([[1, 1], [-1, 1], [-1, -1], [1, -1]], n, true);
  const circle = makePolygon(0.9, 20, n);
  // console.log(square)
  // console.log(circle)
  // console.log(imagePoints)

  const points1 = [];
  const colors1 = [];
  const colors2 = [];
  const colors3 = [];
  for (let i = 0; i < n; i += 1) {
    const center1 = [rand(-2, 2), rand(-2, 2)];
    points1.push(...makeShape(center1));
    colors1.push(...makeColors([1, 0, 0, 1]));
    colors2.push(...makeColors([0, 1, 0, 1]));
    colors3.push(...makeColors([1, 1, 0, 1]));
  }
  // console.log(points1)

  const m = figure.add({
    make: 'morph',
    names: ['rand', 'circle', 'square', 'image'],
    points: [points1, circle, square, imagePoints],
    color: [colors, colors, colors, colors],
  });

  m.animations.new()
    .delay(1)
    .morph({
      start: 'rand', target: 'image', duration: 3, progression: 'easeinout',
    })
    .delay(1)
    .morph({ start: 'image', target: 'square', duration: 3 })
    .morph({ start: 'square', target: 'circle', duration: 1 })
    .morph({ start: 'circle', target: 'rand', duration: 4 })
    // .delay(2)
    // .morph({ start: 'step3', target: 'step0', duration: 2 })
    .start();
}, false);

figure.addFrameRate(10, { font: { color: [1, 1, 1, 1] } });
