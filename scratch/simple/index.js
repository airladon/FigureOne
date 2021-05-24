/* globals Fig */

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [0, 0, 0, 1],
});

const { rand } = Fig.tools.math;

const img1 = new Image();
img1.src = './question.png';
const img2 = new Image();
img2.src = './esclamation.png';

const testImg = new Image();
testImg.src = './morph.test.png';

// const r = 0.015;
const makeShape = (center, r = 0.015) => [
  center[0] - r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] + r / 2,
  center[0] - r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] + r / 2,
  center[0] - r / 2, center[1] + r / 2,
];
const makeColors = c => [...c, ...c, ...c, ...c, ...c, ...c];

/**
 */
// function getImage(options: {
//   image: Image,
//   maxPoints: number | null,
//   xAlign: TypeHAlign,
//   yAlign: TypeVAlign,
//   alignFrom: 'image' | 'filter',
//   distribution: 'raster' | 'random',
//   filter: 'none' | Array<number>,
//   offset: TypeParsablePoint,
//   dither: number,
//   width: number | null,
//   height: number | null,
//   pointSize: number,
// }) {
/**
 * @property {Image} [image]
 * @property {number | null} [maxPoints]
 * @property {TypeHAlign} [xAlign]
 * @property {TypeVAlign} [yAlign]
 * @property {'image' | 'filter'} [alignFrom]
 * @property {'raster' | 'random'} [distribution]
 * @property {'none' | Array<number>} [filter]
 * @property {TypeParsablePoint} [offset]
 * @property {number} [dither]
 * @property {number | null} [width]
 * @property {number | null} [height]
 * @property {number} [pointSize]
 */
function getImage(options = {}) {
  const defaultOptions = {
    maxPoints: null,
    xAlign: 'center',
    yAlign: 'middle',
    // alignFrom: 'filter',
    distribution: 'random',
    filter: 'none',
    offset: [0, 0],
    dither: 0,
    width: null,
    height: null,
    pointSize: 0.01,
  };
  const o = Fig.tools.misc.joinObjectsWithOptions({ except: 'image' }, {}, defaultOptions, options);
  const { image } = options;
  const imageWidth = image.width;
  const imageHeight = image.height;
  const canvas = document.createElement('canvas');
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, imageWidth, imageHeight);
  const pixels = [];
  const pixelColors = [];
  let filter = [0, 0, 0, 0];
  if (Array.isArray(o.filter)) {
    filter = o.filter;
  }
  let min = [imageWidth, imageHeight];
  let max = [0, 0];
  for (let h = 0; h < imageHeight; h += 1) {
    for (let w = 0; w < imageWidth; w += 1) {
      const pixelIndex = h * imageWidth * 4 + w * 4;
      const pixelColor = [
        data[pixelIndex],
        data[pixelIndex + 1],
        data[pixelIndex + 2],
        data[pixelIndex + 3],
      ];
      if (
        filter[0] <= pixelColor[0]
        && filter[1] <= pixelColor[1]
        && filter[2] <= pixelColor[2]
        && filter[3] <= pixelColor[3]
      ) {
        pixels.push([w, h]);
        pixelColors.push(pixelColor);
        min[0] = w < min[0] ? w : min[0];
        min[1] = h < min[1] ? h : min[1];
        max[0] = w > max[0] ? w : max[0];
        max[1] = h > max[1] ? h : max[1];
      }
    }
  }
  let maxPoints = pixels.length;
  if (o.maxPoints != null) {
    maxPoints = o.maxPoints;
  }
  if (o.distribution === 'raster') {
    min = [0, 0];
    max = [imageWidth, imageHeight];
  }

  let height;
  let width;
  // let bottom;
  // let left;
  if (o.height == null && o.width == null) {
    height = 1;
    width = height / imageHeight * imageWidth;
  } else if (o.height != null) {
    width = o.height / imageHeight * imageWidth;
    height = o.height;
  } else if (o.width != null) {
    height = o.width / imageWidth * imageHeight;
    width = o.width;
  } else if (o.width != null && o.height != null) {
    width = o.width;
    height = o.height;
  }
  const offset = Fig.tools.g2.getPoint(o.offset);
  const { xAlign, yAlign } = o;
  // const bounds = this.getBoundingRect(space, border, children, shownOnly);
  // p is Bottom left corner
  const p = new Fig.Point(0, 0);
  if (xAlign === 'left') {
    p.x = offset.x;
  } else if (xAlign === 'right') {
    p.x = offset.x - width;
  } else if (xAlign === 'center') {
    p.x = offset.x - width / 2;
  } else if (typeof xAlign === 'number') {
    p.x = offset.x + width * xAlign;
  } else if (xAlign != null && xAlign.slice(-1)[0] === 'o') {
    p.x = offset.x + parseFloat(xAlign);
  }
  if (yAlign === 'top') {
    p.y = offset.y + height;
  } else if (yAlign === 'bottom') {
    p.y = offset.y;
  } else if (yAlign === 'middle') {
    p.y = offset.y + height / 2;
  } else if (typeof yAlign === 'number') {
    p.y = offset.y + height * yAlign;
  } else if (yAlign != null && yAlign.slice(-1)[0] === 'o') {
    p.y = offset.y + parseFloat(yAlign);
  }

  const points = [];
  const colors = [];
  const pixelIndeces = Array(pixels.length);
  for (let i = 0; i < pixels.length; i += 1) {
    pixelIndeces[i] = i;
  }
  let indeces = pixelIndeces.slice();
  console.log(indeces)
  for (let i = 0; i < maxPoints; i += 1) {
    if (indeces.length === 0) {
      indeces = pixelIndeces.slice();
    }
    let index;
    if (o.distribution === 'raster') {
      index = indeces[i];
    } else if (o.distribution === 'random') {
      index = indeces[Fig.tools.math.randInt(0, indeces.length - 1)];
    }
    const pixel = pixels[index];
    const color = pixelColors[index];
    const point = [
      p.x + pixel[0] / imageWidth * width + rand(-o.dither, o.dither),
      p.y + height - pixel[1] / imageHeight * height + rand(-o.dither, o.dither),
    ];
    // TODO need to remove index from indeces
    indeces = indeces.splice(index, 1);

    // console.log(i)
    // if (i < 10) {
    //   console.log(point)
    //   console.log(color)
    // }
    points.push(...makeShape(point, o.pointSize));
    colors.push(...makeColors(color));
  }
  console.log(indeces)
  return [points, colors];
}

// getImage();

function processImage(
  image, maxPoints, xBottom, yBottom, xWidth, xDither = 0, rad = 0.015,
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
  const pixels = [];
  const pixelColors = [];
  for (let h = 0; h < height; h += 1) {
    linePixelCount.push(0);
    for (let w = 0; w < width; w += 1) {
      const pixelIndex = h * width * 4 + w * 4;
      const transparency = imgData[pixelIndex + 3];
      if (transparency > 1) {
        linePixelCount[h] += 1;
        // totalPixelCount += 1;
        pixels.push([w, h]);
        pixelColors.push([
          imgData[pixelIndex] / 255,
          imgData[pixelIndex + 1] / 255,
          imgData[pixelIndex + 2] / 255,
          imgData[pixelIndex + 3] / 255,
        ]);
      }
    }
  }
  // const pointsPerPixel = maxPoints / totalPixelCount;
  const points = [];
  const colors = [];
  const pixelIndeces = Array(pixels.length);
  for (let i = 0; i < pixels.length; i += 1) {
    pixelIndeces[i] = i;
  }
  let indeces = pixelIndeces.slice();
  for (let i = 0; i < maxPoints; i += 1) {
    if (indeces.length === 0) {
      indeces = pixelIndeces.slice();
    }
    const index = Fig.tools.math.randInt(0, indeces.length);
    const pixel = pixels[index];
    const color = pixelColors[index];
    const point = [
      xBottom + pixel[0] / width * xWidth + rand(-xDither, xDither),
      yBottom + yHeight - pixel[1] / height * yHeight + rand(-yDither, yDither),
    ];
    points.push(...makeShape(point, rad));
    colors.push(...makeColors(color));
  }

  // /*
  // - If pointsPerPixel = 1, then each pixel defines a point
  // - If pointsPerPixel < 1, then align first point with first pixel,
  //   and then keep a points counter and pixel counter. For each pixel, catch up the number of points that are needed to until the pointsCount/pixelCounter ratio > pointsPerPixel
  // */
  // // let remainingPoints = maxPoints;
  // // let remainingPixels = totalPixelCount;
  // let pointsCounter = 0;
  // let pixelCounter = 0;
  // for (let h = 0; h < height; h += 1) {
  //   // const pointsPerPixel = remainingPoints / remainingPixels;
  //   // let pointsForLine = Fig.math.round(linePixelCount[h] * pointsPerPixel);
  //   // if (pointsForLine > remainingPoints) {
  //   //   pointsForLine = remainingPoints;
  //   // }
  //   // let remainingLinePixels = 0;
  //   // let cumLinePoints = 0;
  //   for (let w = 0; w < width; w += 1) {
  //     const pixelIndex = h * width * 4 + w * 4;
  //     const transparency = imgData[pixelIndex + 3];
  //     if (transparency > 1) {
  //       const pixel = [
  //         // imgData[pixelIndex] / 255,
  //         // imgData[pixelIndex + 1] / 255,
  //         // imgData[pixelIndex + 2] / 255,
  //         // transparency,
  //         1, 0, 0, transparency,
  //       ];
  //       pixelCounter += 1;
  //       const point = [
  //         xBottom + w / width * xWidth + rand(-xDither, xDither),
  //         yBottom + yHeight - h / height * yHeight + rand(-yDither, yDither),
  //       ];
  //       // if (transparency < 100) {
  //       //   if (pointsCounter / pixelCounter < maxPoints / totalPixelCount) {
  //       //     pointsCounter += 1;
  //       //     points.push(...makeShape(point));
  //       //     colors.push(...makeColors(pixel));
  //       //   }
  //       // } else {
  //       while (pointsCounter / pixelCounter < maxPoints / totalPixelCount) {
  //         pointsCounter += 1;
  //         points.push(...makeShape(point));
  //         colors.push(...makeColors(pixel));
  //       }
  //       // }
  //     }
  //   }
  // }
  // console.log(pointsCounter, maxPoints)
  // console.log(points);

  return [points, colors];
}

function getImagePointsAndColors(
  image, xBottom, yBottom, xWidth, yHeight, xDither = 0, rad = 0.015,
) {
  const { width, height } = image;
  const yDither = xDither;
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
      ], rad));
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

function pointsToVertices(points, rad = 0.015) {
  const vertices = [];
  for (let i = 0; i < points.length; i += 1) {
    vertices.push(...makeShape(points[i], rad));
  }
  return vertices;
}

function lineToPoints(
  linePoints, // : Array<[number, number]>,
  numPoints, // : number,
  close = false, // : boolean = false,
  rad = 0.015,
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
    while (cumDistances[nextLinePointIndex] < currentCumDist && nextLinePointIndex > 0) {
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
  return pointsToVertices(points, rad);
}

const makePolygon = (radius, sides, numPoints, rad = 0.015) => {
  const points = [];
  const dAngle = Math.PI * 2 / sides;
  for (let i = 0; i < sides; i += 1) {
    points.push([
      radius * Math.cos(dAngle * i),
      radius * Math.sin(dAngle * i),
    ]);
  }
  return lineToPoints(points, numPoints, true, rad);
};


function loaded() {
  // const [image1, colors] = getImagePointsAndColors(img1, -2, -2, 4, 4, 0.005, 0.015);
  // const n = image1.length / 2 / 6;
  // const n = 1000;
  // const [image1, colors] = processImage(img1, n, -1, -1, 1, 0.01, 0.01);
  // const [image1, colors] = getImage({
  //   image: img1,
  //   // maxPoints: n,
  //   width: 1,
  //   pointSize: 0.01,
  //   filter: [0, 0, 0, 1],
  //   // distribution: 'raster',
  // });
  // const n = 5000;
  console.log('asdf')
  const [image1, colors] = Fig.tools.morph.getImage({
    image: img1,
    // maxPoints: n,
    width: 1,
    // pointSize: 0.005,
    filter: c => c[3] > 0,
    // xAlign: 'center',
    // yAlign: 'middle',
    // dither: 0.01,
    alignFrom: 'filter',
    offset: [0, 0],
    // distribution: 'raster',
  });
  // const [image2, colors2] = Fig.tools.morph.getImage({
  //   image: img2,
  //   width: 1,
  //   pointSize: 0.01,
  //   filter: [0, 0, 0, 1],
  //   xAlign: 'center',
  //   yAlign: 'middle',
  //   distribution: 'raster',
  // });
  console.log(colors)
  const n = image1.length / 2 / 6;
  const [image2, colors2] = processImage(img2, n, -1, -1, 1, 0.01, 0.01);
  // console.log('asdf2')
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
    points1.push(...makeShape(center1, 0.005));
    colors1.push(...makeColors([1, 0, 0, 1]));
    // colors2.push(...makeColors([0, 1, 0, 1]));
    colors3.push(...makeColors([1, 0, 1, 1]));
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
    .delay(4)
    .morph({
      start: 'image1', target: 'image2', duration: 1, progression: 'easeinout',
    })
    .delay(1)
    .morph({
      start: 'image2', target: 'square', duration: 1, progression: 'easeinout',
    })
    .delay(1)
    .morph({
      start: 'square', target: 'circle', duration: 1, progression: 'easeinout',
    })
    .delay(1)
    .morph({
      start: 'circle', target: 'rand', duration: 4, progression: 'easeinout',
    })
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

// image = testImg
// const imageWidth = image.width;
// const imageHeight = image.height;
// const canvas = document.createElement('canvas');
// canvas.width = imageWidth;
// canvas.height = imageHeight;
// const context = canvas.getContext('2d');
// context.drawImage(image, 0, 0);
// const { data } = context.getImageData(0, 0, imageWidth, imageHeight);