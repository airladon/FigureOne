const { sphere, cone, rod } = Fig.tools.g2;

// const figure = new Fig.Figure({
//   // scene: { camera: { position: [0, 0, 2] } },
// });
function xmur3(str) {
  for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
    h = h << 13 | h >>> 19;
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

var seed = xmur3("figureone");
Math.random = mulberry32(seed());

// ********************************
let sleepTime = 0;
const figure = new Fig.Figure({
  scene: {
    left: -3, bottom: -2.25, right: 3, top: 2.25,
  },
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

figure.add([
  {
    name: '__minorGrid',
    make: 'primitives.grid',
    options: {
      position: [0, 0],
      color: [0.9, 0.9, 0.9, 1],
      line: { width: 0.002 },
      xStep: 0.1,
      yStep: 0.1,
      bounds: new Fig.getRect([-3, -2.25, 6, 4.5]),
    },
  },
  {
    name: '__majorGrid',
    make: 'primitives.grid',
    options: {
      position: [0, 0],
      color: [0.9, 0.9, 0.9, 1],
      line: { width: 0.005 },
      xStep: 0.5,
      yStep: 0.5,
      bounds: new Fig.getRect([-3, -2.25, 6, 4.5]),
    },
  },
  {
    name: '__origin',
    make: 'primitives.polygon',
    options: {
      color: [0.9, 0.9, 0.9, 1],
      radius: 0.025,
      sides: 10,
    },
  },
]);

const { imageToShapes } = Fig.tools.morph;

     const micImage = new Image();
     micImage.src = './mic.png';
     const headphonesImage = new Image();
     headphonesImage.src = './headphones.png';

     let index = 0;
     const loaded = () => {
       index += 1;
       if (index < 2) {
         return;
       }

       const [mic, micColors] = imageToShapes({
         image: micImage,
         width: 0.7,
         filter: c => c[3] > 0,
       });

       const [headphones, headphoneColors] = imageToShapes({
         image: headphonesImage,
         width: 0.7,
         filter: c => c[3] > 0,
         num: mic.length / 6 / 2,
       });

       const m = figure.add({
         make: 'morph',
         points: [mic, headphones],
         color: [micColors, headphoneColors],
       });

       m.animations.new()
         .delay(1)
         .morph({ start: 0, target: 1, duration: 2 })
         .start();
     };

     micImage.onload = loaded.bind(this);
     headphonesImage.onload = loaded.bind(this);