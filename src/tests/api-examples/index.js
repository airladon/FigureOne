
// Replace Math.random with something deterministic
// ********************************
// From: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
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


  figure.primitives.equationScale = 2;
  
figure.timeKeeper.setManualFrames();
figure.timeKeeper.frame(0);
figure.animateNextFrame();
