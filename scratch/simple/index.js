/* globals Fig */

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [0, 0, 0, 1],
});

const { rand } = Fig.tools.math;

const img1 = new Image();
img1.src = './text.png';
const img2 = new Image();
img2.src = './text1.png';

const r = 0.007;
const makeShape = center => [
  center[0] - r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] + r / 2,
  center[0] - r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] + r / 2,
  center[0] - r / 2, center[1] + r / 2,
];
const makeColors = c => [...c, ...c, ...c, ...c, ...c, ...c];


function processImage(
  image, maxPoints, xBottom, yBottom, xWidth, xDither = 0,
) {
  const { width, height } = image;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  const imgData = context.getImageData(0, 0, width, height).data;
  const yHeight = xWidth / width * height;
  const yDither = xDither;
  // First scan through horizontal lines and get line length and total length
  // of pixels that are not transparent
  const linePixelCount = [];
  let totalPixelCount = 0;
  for (let h = 0; h < height; h += 1) {
    linePixelCount.push(0);
    for (let w = 0; w < width; w += 1) {
      const pixelIndex = h * width * 4 + w * 4;
      const transparency = imgData[pixelIndex + 3];
      if (transparency > 1) {
        linePixelCount[h] += 1;
        totalPixelCount += 1;
      }
    }
  }
  console.log(totalPixelCount)
  // const pointsPerPixel = maxPoints / totalPixelCount;
  const points = [];
  const colors = [];
  /*
  - If pointsPerPixel = 1, then each pixel defines a point
  - If pointsPerPixel < 1, then align first point with first pixel,
    and then keep a points counter and pixel counter. For each pixel, catch up the number of points that are needed to until the pointsCount/pixelCounter ratio > pointsPerPixel
  */
  // let remainingPoints = maxPoints;
  // let remainingPixels = totalPixelCount;
  let pointsCounter = 0;
  let pixelCounter = 0;
  for (let h = 0; h < height; h += 1) {
    // const pointsPerPixel = remainingPoints / remainingPixels;
    // let pointsForLine = Fig.math.round(linePixelCount[h] * pointsPerPixel);
    // if (pointsForLine > remainingPoints) {
    //   pointsForLine = remainingPoints;
    // }
    // let remainingLinePixels = 0;
    // let cumLinePoints = 0;
    for (let w = 0; w < width; w += 1) {
      const pixelIndex = h * width * 4 + w * 4;
      const transparency = imgData[pixelIndex + 3];
      if (transparency > 1) {
        const pixel = [
          // imgData[pixelIndex] / 255,
          // imgData[pixelIndex + 1] / 255,
          // imgData[pixelIndex + 2] / 255,
          // transparency,
          1, 0, 0, transparency,
        ];
        pixelCounter += 1;
        const point = [
          xBottom + w / width * xWidth + rand(-xDither, xDither),
          yBottom + yHeight - h / height * yHeight + rand(-yDither, yDither),
        ];
        // if (transparency < 100) {
        //   if (pointsCounter / pixelCounter < maxPoints / totalPixelCount) {
        //     pointsCounter += 1;
        //     points.push(...makeShape(point));
        //     colors.push(...makeColors(pixel));
        //   }
        // } else {
        while (pointsCounter / pixelCounter < maxPoints / totalPixelCount) {
          pointsCounter += 1;
          points.push(...makeShape(point));
          colors.push(...makeColors(pixel));
        }
        // }
      }
    }
  }
  console.log(pointsCounter, maxPoints)
  // console.log(points);

  return [points, colors];
}

function getImagePointsAndColors(
  image, xBottom, yBottom, xWidth, yHeight, xDither = 0, yDither = 0,
) {
  const { width, height } = image;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
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


function loaded() {
  // const [image1, colors] = getImagePointsAndColors(img1, -2, -2, 4, 4, 0.01, 0.01);
  const [image1, colors] = processImage(img1, 40000, -1.5, -0.5, 3, 0.01, 0.01);
  const n = image1.length / 2 / 6;
  const [image2, colors2] = processImage(img2, n, -1.5, -0.5, 3, 0.01, 0.01);
  // console.log(testImage)
  // const [image2, colors2] = getImagePointsAndColors(img2, -2, -2, 4, 4, 0.01, 0.01);
  const square = lineToPoints([[1, 1], [-1, 1], [-1, -1], [1, -1]], n, true);
  const circle = makePolygon(0.9, 20, n);
  // console.log(square)
  // console.log(circle)
  // console.log(imagePoints)

  const points1 = [];
  const colors1 = [];
  // const colors2 = [];
  const colors3 = [];
  for (let i = 0; i < n; i += 1) {
    const center1 = [rand(-2, 2), rand(-2, 2)];
    points1.push(...makeShape(center1));
    colors1.push(...makeColors([1, 0, 0, 1]));
    // colors2.push(...makeColors([0, 1, 0, 1]));
    colors3.push(...makeColors([1, 1, 0, 1]));
  }
  // console.log(points1)

  const m = figure.add({
    make: 'morph',
    names: ['rand', 'circle', 'square', 'image1', 'image2'],
    points: [points1, circle, square, image1, image2],
    color: [colors1, colors3, colors3, colors, colors2],
  });

  m.animations.new()
    .delay(1)
    .morph({
      start: 'rand', target: 'image1', duration: 3, progression: 'easeinout',
    })
    .delay(1)
    .morph({ start: 'image1', target: 'image2', duration: 1 })
    .delay(1)
    // .morph({ start: 'image2', target: 'square', duration: 1 })
    // .delay(1)
    // .morph({ start: 'square', target: 'circle', duration: 1 })
    // .morph({ start: 'circle', target: 'rand', duration: 4 })
    .start();
}

let counter = 0;

img1.addEventListener('load', () => {
  counter += 1;
  if (counter === 2) {
    loaded();
  }
}, false);

img2.addEventListener('load', () => {
  counter += 1;
  if (counter === 2) {
    loaded();
  }
}, false);


figure.addFrameRate(10, { font: { color: [1, 1, 1, 1] } });
