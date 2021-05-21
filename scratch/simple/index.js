/* globals Fig */

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [0, 0, 0, 1],
});

const { rand } = Fig.tools.math;

const img = new Image();
img.src = './logo.png';

img.addEventListener('load', () => {
  // console.log(img.data);
  const canvas = document.createElement('canvas');
  const res = 256;
  canvas.width = res;
  canvas.height = res;
  const context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  const imgData = context.getImageData(0, 0, res, res).data;
  // console.log(imgData)
  const points1 = [];
  const points2 = [];
  const points3 = [];
  const points4 = [];
  const colors1 = [];
  const colors2 = [];
  const colors3 = [];
  const colors4 = [];
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
  const n = res * res;
  const s = 1;
  for (let i = 0; i < n; i += 1) {
    const x = -Math.PI * 0.9 + Math.PI * 2 * 0.9 / n * i;
    const center1 = [rand(-2, 2), rand(-2, 2)];
    points1.push(...makeShape(center1));
    const center2 = [
      0.9 * Math.cos(Math.PI * 2 / n * i + Math.PI / 4),
      0.9 * Math.sin(Math.PI * 2 / n * i + Math.PI / 4),
    ];
    points2.push(...makeShape(center2));
    let center3;
    if (i < n / 4) {
      center3 = [s / 2 - s / (n / 4) * i, s / 2];
    } else if (i < n / 2) {
      center3 = [-s / 2, s / 2 - s / (n / 4) * (i % (n / 4))];
    } else if (i < n / 4 * 3) {
      center3 = [-s / 2 + s / (n / 4) * (i % (n / 4)), -s / 2];
    } else {
      center3 = [s / 2, -s / 2 + s / (n / 4) * (i % (n / 4))];
    }
    points3.push(...makeShape(center3));
    const p4 = [-2.5 + (i % res) / res * 5 + rand(-0.01, 0.01), 2.5 - (Math.floor(i / res) / res * 5) + rand(-0.01, 0.01)];
    // console.log(p4)
    // points4.push(...makeShape([p4.x, p4.y]));
    points4.push(...makeShape(p4));
    colors1.push(...makeColors([1, 0, 0, 1]));
    colors2.push(...makeColors([0, 1, 0, 1]));
    // colors4.push(...makeColors([1, 1, 0, 1]));
    // colors3.push(...makeColors([imgData[i] / 255, imgData[n][1] / 255, imgData[n][2] / 255, 1]));
    colors3.push(...makeColors([1, 1, 0, 1]));
    // colors4.push(...makeColors([0, 0, 1, 1]));

    // colors4.push(...makeColors([imgData[i * 4] / 255, imgData[i * 4 + 1] / 255, imgData[i * 4 + 2] / 255, 1]))
    let pixel = [imgData[i * 4], imgData[i * 4 + 1], imgData[i * 4 + 2], 1];
    // let pixel = context.getImageData(i % res, Math.floor(i / res), 1, 1).data;
    // if (pixel[2] < 100) {
    //   pixel = [0, 0, 0, 0];
    // }
    colors4.push(...makeColors([pixel[0] / 255, pixel[1] / 255, pixel[2] / 255, 1]))
  }
  console.log(context.getImageData(50, 50, 1, 1).data);
  console.log(context.canvas.width, context.canvas.height)
  console.log(colors4)
  // console.log(colors1)
  // console.log(colors4)
  // console.log(imgData)

  const m = figure.add({
    make: 'morph',
    names: ['step0', 'step1', 'step2', 'step3'],
    points: [points1, points2, points3, points4],
    color: [colors4, colors4, colors3, colors4],
    // color: [1, 0, 0, 1],
  });

  m.animations.new()
    .delay(2)
    .morph({ start: 'step0', target: 'step3', duration: 3, progression: 'easeinout' })
    .delay(2)
    .morph({ start: 'step3', target: 'step1', duration: 3 })
    .morph({ start: 'step1', target: 'step2', duration: 1 })
    .morph({ start: 'step2', target: 'step0', duration: 4 })
    // .delay(2)
    // .morph({ start: 'step3', target: 'step0', duration: 2 })
    .start();
}, false);

figure.addFrameRate(10, { font: { color: [1, 1, 1, 1] } });
