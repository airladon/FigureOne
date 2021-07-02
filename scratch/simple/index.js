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
const pow = (pow = 2, stop = 10, step = 0.05) => {
  const xValues = Fig.tools.math.range(0, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** pow));
}
figure.add({
       name: 'plot',
       make: 'collections.plot',
       width: 2,
       height: 2,
       trace: pow(3),
       xAxis: { show: false },
       yAxis: { show: false },
       plotArea: [0.93, 0.93, 0.93, 1],
       frame: {
         line: { width: 0.005, color: [0.5, 0.5, 0.5, 1] },
         corner: { radius: 0.1, sides: 10 },
         space: 0.15,
       },
       title: {
         text: [
           'Velocity over Time',
           { text: 'For object A', lineSpace: 0.13, font: { size: 0.08 } },
         ],
         offset: [0, 0],
       }
     });
// figure.elements.elements.primitive_000000000.elements.label.setPosition([0, 0, 0]);
// figure.elements.elements.primitive_000000000.elements.label.setRotation(0);

// const m = figure.add({
//   make: 'text',
//   text: 'M',
// });
// figure.add({
//   make: 'polygon',
//   color: [0, 1, 0, 1],
//   radius: 0.5,
// });

// const figure = new Fig.Figure({
//   scene: {
//     style: 'perspective',
//     fieldOfView: 0.8,
//     aspectRatio: 1,
//     camera: {
//       position: [3, 3, 3],
//       lookAt: [0, 0, 0],
//       up: [0, 1, 0],
//     },
//     near: Math.sqrt(3),
//     far: Math.sqrt(3) * 5,
//   },
// });


// const screenGrid = figure.add({
//   make: 'grid',
//   bounds: [-2, -2, 4, 4],
//   xStep: 1,
//   yStep: 1,
//   line: { width: 0.005 },
//   color: [0.5, 0.5, 1, 1],
//   position: [0, 0, -4.5],
//   xAlign: 'center',
// });
// screenGrid.scene = new Fig.Scene();
// screenGrid.scene.setProjection({ style: '2D', left: -2, right: 2, bottom: -2, top: 2 });
// const screenMinorGrid = figure.add({
//   make: 'grid',
//   bounds: [-2, -2, 4, 4],
//   xStep: 0.2,
//   yStep: 0.2,
//   line: { width: 0.005 },
//   color: [0.85, 0.85, 1, 1],
//   position: [0, 0, -4.5],
//   xAlign: 'center',
// });
// screenMinorGrid.scene = screenGrid.scene;

// figure.add({
//   make: 'grid',
//   bounds: [-2, -2, 4, 4],
//   xStep: 0.2,
//   yStep: 0.2,
//   line: { width: 0.005 },
//   color: [0.8, 0.8, 0.8, 1],
//   position: [0, 0, 1],
//   xAlign: 'center',
// });

// figure.add({
//   make: 'grid',
//   bounds: [-2, -2, 4, 4],
//   xStep: 1,
//   yStep: 1,
//   line: { width: 0.007 },
//   color: [0.5, 0.5, 0.5, 1],
//   position: [0, 0, 1],
//   xAlign: 'center',
// });

// const vertexShader = {
//   dimension: 3,
//   normals: true,
//   light: 'directional',
// };
// const fragShader = {
//   light: 'directional',
// };

// const addAxis = (name, direction, color, includeArrow = false) => {
//   const [p, n] = rod({ radius: 0.03, sides: 10, line: [[0, 0, 0], direction] });
//   let cn = [];
//   let cnNormals = [];
//   if (includeArrow) {
//     [cn, cnNormals] = cone({
//       radius: 0.06,
//       sides: 10,
//       line: { p1: direction, direction, length: 0.15 },
//     });
//   }
//   const r = figure.add({
//     name,
//     make: 'gl',
//     vertexShader,
//     fragShader,
//     vertices3: { data: [...p, ...cn] },
//     normals: { data: [...n, ...cnNormals] },
//     color,
//     // transform: [['rd', ...direction]],
//   });
//   r.setTouchable();
//   return r;
// };
// addAxis('xPosAxis', [2, 0, 0], [1, 0, 0, 1], true);
// addAxis('xNegAxis', [-2, 0, 0], [1, 0, 0, 1]);
// addAxis('yPosAxis', [0, 2, 0], [0, 1, 0, 1], true);
// addAxis('yNegAxis', [0, -2, 0], [0, 1, 0, 1]);
// addAxis('zPosAxis', [0, 0, 2], [0, 0, 1, 1], true);
// addAxis('zNegAxis', [0, 0, -2], [0, 0, 1, 1]);

// const addSphere = (name, position, color) => {
//   const [sx, sn] = sphere({ radius: 0.2, sides: 10, normals: 'curve' });
//   const s = figure.add({
//     name,
//     make: 'gl',
//     vertexShader,
//     fragShader,
//     vertices3: { data: sx },
//     normals: { data: sn },
//     color,
//     position,
//   });
//   s.setTouchable();
// };

// addSphere('xPos', [-2.1, -2.1, -2.1], [1, 0.5, 0.5, 1]);

