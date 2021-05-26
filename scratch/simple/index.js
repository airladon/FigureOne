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


function loaded() {
  const [image1, colors] = Fig.tools.morph.imageToShapes({
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

  const [image2, colors2] = Fig.tools.morph.imageToShapes({
    image: img2,
    maxPoints: n,
    filter: c => c[3] > 0,
    xAlign: 'center',
    yAlign: 'middle',
    align: 'filteredImage',
    height: 1,
  });

  const randPoints = Fig.tools.morph.rectangleCloudShapes({
    width: 2,
    height: 2,
    maxPoints: n,
  });

  const m = figure.add({
    make: 'morph',
    names: ['rand', 'image1', 'image2'],
    points: [randPoints, image1, image2],
    color: [colors, colors, colors2],
  });

  m.animations.new()
    .delay(1)
    .morph({
      start: 'rand', target: 'image1', duration: 4, progression: 'easeinout',
    })
    .delay(1)
    .morph({
      start: 'image1', target: 'image2', duration: 4, progression: 'easeinout',
    })
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