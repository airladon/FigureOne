/* globals Fig */

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [0, 0, 0, 1],
});

const { rand } = Fig.tools.math;

const img1 = new Image();
img1.src = './logo.png';
const img2 = new Image();
img2.src = './question.png';

// const testImg = new Image();
// testImg.src = './morph.test.png';

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

function loaded() {
  const [image1, colors] = Fig.tools.morph.imageToPoints({
    image: img1,
    filter: c => c[3] > 0,
    xAlign: 'center',
    yAlign: 'middle',
    align: 'filteredImage',
    height: 3,
    dither: 0.01,
    pointSize: 0.015,
    offset: [0, 0],
  });

  const n = image1.length / 2 / 6;
  const [image2, colors2] = Fig.tools.morph.imageToPoints({
    image: img2,
    maxPoints: n,
    filter: c => c[3] > 0,
    xAlign: 'center',
    yAlign: 'middle',
    align: 'filteredImage',
    height: 1,
    // distribution: 'raster',
  });

  const [square] = Fig.tools.morph.lineToPoints({
    line: [[1, 1], [-1, 1], [-1, -1], [1, -1]],
    maxPoints: n,
    close: true,
  });
  // const square = lineToPoints([[1, 1], [-1, 1], [-1, -1], [1, -1]], n, true);
  const [circle] = Fig.tools.morph.lineToPoints({
    line: Fig.tools.morph.getPolygonVertices({ radius: 0.9, sides: 100, rotation: Math.PI / 2 }),
    maxPoints: n,
    close: true,
  });

  const [sine] = Fig.tools.morph.lineToPoints({
    line: Fig.tools.math.range(-2, 2, 0.02).map(x => [x, Math.sin(10 * (x || 0.00001)) / (10 * (x || 0.00001))]),
    maxPoints: n,
    pointSize: 0.02,
    // close: true,
  });

  const [line] = Fig.tools.morph.lineToPoints({
    line: [[-2, 0], [2, 0]],
    maxPoints: n,
  });

  const [sine1] = Fig.tools.morph.lineToPoints({
    line: Fig.tools.math.range(-2, 2, 0.02).map(x => [x, Math.sin(Math.PI * 4 * ((x - 1) || 0.00001)) / (Math.PI * 4 * ((x - 1) || 0.00001))]),
    maxPoints: n,
    // close: true,
  });

  const poly = Fig.tools.morph.rectangleFillPoints({
    maxPoints: n,
    width: 8,
    height: 8,
  });

  // const circle = makePolygon(0.9, 20, n);
  // console.log(square)
  // console.log(circle)
  // console.log(imagePoints)

  const points1 = [];
  const colors1 = [];
  // const colors2 = [];
  const colors3 = [];
  for (let i = 0; i < n; i += 1) {
    const center1 = [rand(-2, 2), rand(-2, 2)];
    points1.push(...makeShape(center1, 0.01));
    colors1.push(...makeColors([1, 0, 0, 1]));
    // colors2.push(...makeColors([0, 1, 0, 1]));
    colors3.push(...makeColors([47 / 255, 111 / 255, 227 / 255, 1]));
  }
  // console.log(points1)

  const m = figure.add({
    make: 'morph',
    names: ['rand', 'circle', 'square', 'image1', 'image2', 'sine', 'poly'],
    points: [points1, circle, square, image1, image2, sine, poly],
    color: [colors1, colors3, colors3, colors, colors2, colors3, colors3],
  });

  m.animations.new()
    // .delay(1)
    // .morph({
    //   start: 'rand', target: 'image1', duration: 3, progression: 'easeinout',
    // })
    // .delay(1)
    // .morph({
    //   start: 'image1', target: 'image2', duration: 1, progression: 'easeinout',
    // })
    // .delay(1)
    // .morph({
    //   start: 'image2', target: 'square', duration: 1, progression: 'easeinout',
    // })
    // .delay(1)
    // .morph({
    //   start: 'square', target: 'circle', duration: 1, progression: 'easeinout',
    // })
    // .delay(1)
    // .morph({
    //   start: 'circle', target: 'sine', duration: 4, progression: 'easeinout',
    // })
    // .delay(1)
    .morph({
      start: 'poly', target: 'sine', duration: 4, progression: 'easeinout',
    })
    .delay(1)
    .morph({
      start: 'sine', target: 'image1', duration: 4, progression: 'easeinout',
    })
    .delay(1)
    .morph({
      start: 'image1', target: 'image2', duration: 4, progression: 'easeinout',
    })
    .delay(1)
    // .morph({
    //   start: 'rand', target: 'image2', duration: 4, progression: 'easeinout',
    // })
    // .delay(1)
    // .morph({
    //   start: 'sine1', target: 'rand', duration: 4, progression: 'easeinout',
    // })
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