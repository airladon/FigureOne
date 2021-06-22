/* globals Fig */
const { sphere, lathe, polygon, cone, rod, getLathePoints, surface } = Fig.tools.g2;
const { getTransform } = Fig;
const { m3 } = Fig.tools;
const figure = new Fig.Figure({ limits: [-1, -1, 2, 2], backgroundColor: [1, 0.9, 0.9, 1] });

const col = (c, numVertices) => {
  let out = [];
  for (let i = 0; i < numVertices; i += 1) {
    out = [...out, ...c];
  }
  return out;
};

const screenGrid = figure.add({
  make: 'grid',
  bounds: [-2, -1, 4, 2],
  xStep: 0.5,
  yStep: 0.5,
  line: { width: 0.005 },
  color: [0.5, 0.5, 1, 1],
  position: [0, 0, -3],
  xAlign: 'center',
});
screenGrid.scene = new Fig.Scene();
screenGrid.scene.setPerspective({ style: '2D', left: -2, right: 2, bottom: -1, top: 1 });
const screenMinorGrid = figure.add({
  make: 'grid',
  bounds: [-2, -1, 4, 2],
  xStep: 0.1,
  yStep: 0.1,
  line: { width: 0.005 },
  color: [0.85, 0.85, 1, 1],
  position: [0, 0, -3],
  xAlign: 'center',
});
screenMinorGrid.scene = screenGrid.scene;

figure.add({
  make: 'grid',
  bounds: [-1, -1, 2, 2],
  xStep: 0.1,
  yStep: 0.1,
  line: { width: 0.005 },
  color: [0.8, 0.8, 0.8, 1],
  position: [0, 0, 0],
  xAlign: 'center',
});

figure.add({
  make: 'grid',
  bounds: [-1, -1, 2, 2],
  xStep: 0.5,
  yStep: 0.5,
  line: { width: 0.007 },
  color: [0.5, 0.5, 0.5, 1],
  position: [0, 0, 0],
  xAlign: 'center',
});

const vertexShader = {
  dimension: 3,
  normals: true,
  light: 'directional',
};
const fragShader = {
  light: 'directional',
};
// const makeAxis = (name, color, rx, ry, rz, position) => {
//   const [vertices, normals] = makeRod(1, 0.01, 20, rx, ry, rz);
//   const a = figure.add({
//     name,
//     make: 'gl',
//     vertexShader,
//     fragShader,
//     vertices3: { data: vertices },figure2DPoint
//     normals: { data: normals },
//     color,
//     position,
//   });
//   a.setTouchable();
// };
// makeAxis('x', [1, 0, 0, 1], 0, Math.PI / 2, 0, [-0.5, 0, 0]);
// makeAxis('y', [0, 1, 0, 1], -Math.PI / 2, 0, 0, [0, -0.5, 0]);
// makeAxis('z', [0, 0, 1, 1], 0, 0, 0, [0, 0, -0.5]);

const addAxis = (name, direction, color, includeArrow = false) => {
  const [p, n] = rod({ radius: 0.03, sides: 10, line: [[0, 0, 0], direction] });
  let cn = [];
  let cnNormals = [];
  if (includeArrow) {
    [cn, cnNormals] = cone({
      radius: 0.06,
      sides: 10,
      line: { p1: direction, direction, length: 0.15 },
    });
  }
  const r = figure.add({
    name,
    make: 'gl',
    vertexShader,
    fragShader,
    vertices3: { data: [...p, ...cn] },
    normals: { data: [...n, ...cnNormals] },
    color,
    // transform: [['rd', ...direction]],
  });
  r.setTouchable();
  return r;
};
addAxis('xPosAxis', [0.7, 0, 0], [1, 0, 0, 1], true);
addAxis('xNegAxis', [-0.7, 0, 0], [1, 0, 0, 1]);
addAxis('yPosAxis', [0, 0.7, 0], [0, 1, 0, 1], true);
addAxis('yNegAxis', [0, -0.7, 0], [0, 1, 0, 1]);
addAxis('zPosAxis', [0, 0, 0.7], [0, 0, 1, 1], true);
addAxis('zNegAxis', [0, 0, -0.7], [0, 0, 1, 1]);


/* Test Rod */

// const tr = addAxis('tr', [1, 0, 0], [1, 0, 0, 1], false);
// tr.setPosition(0.5, 0, 0.5);
// tr.setRotation(['dir', [0, 0, -1]]);
const [pTr, nTr] = rod({ radius: 0.03, sides: 10, line: [[0, 0, 0], [1, 0, 0]] });
const r = figure.add({
  name: 'tr',
  make: 'gl',
  vertexShader,
  fragShader,
  vertices3: { data: [...pTr] },
  normals: { data: [...nTr] },
  color: [1, 0, 0, 1],
  // transform: [['rd', ...direction]],
});
r.setTouchable();
r.setPosition(0.5, 0.5, 0);
r.setRotation(['dir', [0, 0, -1]]);
/* */
const addSphere = (name, position, color) => {
  const [sx, sn] = sphere({ radius: 0.05, sides: 10, normals: 'curve' });
  const s = figure.add({
    name,
    make: 'gl',
    vertexShader,
    fragShader,
    vertices3: { data: sx },
    normals: { data: sn },
    color,
    position,
  });
  s.setTouchable();
};

addSphere('xPos', [1, 0, 0], [1, 0.5, 0.5, 1]);
addSphere('xNeg', [-1, 0, 0], [1, 0, 0, 1]);
addSphere('yPos', [0, 1, 0], [0, 1, 0, 1]);
addSphere('yNeg', [0, -1, 0], [0, 0.5, 0, 1]);
addSphere('zPos', [0, 0, 1], [0.5, 0.5, 1, 1]);
addSphere('zNeg', [0, 0, -1], [0, 0, 1, 1]);

const r1 = 0.01;
const r2 = 0.02;

const xAxis = figure.getElement('xPosAxis');
xAxis.move.type = 'rotation';
xAxis.setMovable();
// const [lv, ln] = lathe({
//   // profile: [[0, 0.02, 0], [0.399, 0.099, 0], [0.4, 0.1, 0], [0.499, 0.05, 0], [0.5, 0.05, 0], [0.5, 0.0499, 0], [0.5, 0, 0]],
//   // profile: [[0, 0.001, 0], [0.399, 0.1, 0], [0.4, 0.1, 0], [0.4, 0.099, 0], [0.4, 0, 0]],
//   // profile: [[0, 0, 0], [0.4, r1, 0], [0.4, 0, 0]],
//   // profile: [[0, 0], [0, r1], [0.5, r1], [0.5, r2], [0.6, 0]],
//   // profile: [[0, 0.5], [0, 0.6], [0.1, 0.6], [0.1, 0.5], [0, 0.5]],
//   profile: polygon({ radius: 0.1, center: [0, 0.5], sides: 12, direction: -1 }),
//   // profile: [[0, 0, 0], [0.5, 0.3, 0], [0.7, 0, 0]],
//   sides: 12,
//   normals: 'flat',
//   // rotation: ['dir', 1, -1, 0.5],
// });

// figure.add({
//   make: 'gl',
//   vertexShader,
//   fragShader,
//   vertices3: { data: lv },
//   normals: { data: ln },
//   color: [1, 0, 0, 1],
//   position: [0, 0, 0],
// });


const [rv, rn] = Fig.tools.g2.cube({
  side: 0.2,
  position: [0, 0, 0],
  // rotation: ['sph', Math.PI / 4, 0],
});

const cube = figure.add({
  name: 'cube',
  make: 'gl',
  vertexShader,
  fragShader,
  vertices3: { data: rv },
  normals: { data: rn },
  color: [0, 1, 1, 1],
  // position: [0.5, 0, 0],
});
cube.setMovable();
cube.move.type = 'translation';
// cube.move.plane = Fig.tools.g2.getPlane([[0.5, 0, 0], [1, 0, 0]]);


figure.add({
  make: 'text',
  text: 'a',
  position: [0.5, 0, 0],
  xAlign: 'center',
});

figure.add({
  make: 'polygon',
  radius: 0.5,
  sides: 5,
  color: [1, 1, 0, 0.7],
  xAlign: 'center',
});

const k = figure.add({
  make: 'text',
  text: 'a',
  position: [0.5, 0, 0],
  xAlign: 'center',
});
k.scene = new Fig.Scene({ left: -2, right: 2, bottom: -1, top: 1 });

figure.scene.light.directional = [0.7, 0.5, 1];
figure.scene.light.ambient = 0;
figure.scene.light.point = [0.3, 0.1, 1];


figure.scene.setCamera({ position: [1, 1, 3] });

figure.scene.setProjection({ style: 'perspective', near: 1, far: 10, aspectRatio: 2, fieldOfView: Math.PI * 0.2 });

// figure.scene.setProjection({
//   style: 'orthographic', near: 1, far: 5, left: -2, right: 2, bottom: -1, top: 1,
// });
// console.log('asdf')

// figure.elements.animations.new()
//   .rotation({ target: [0.5, 0.5, 0], duration: 5 })
//   .start()

// figure.animations.new()
//   .camera({ target: { position: [0.5, 0.5, 1.1] }, duration: 5 })
//   .camera({ target: { position: [1, 1, 1.1] }, duration: 5 })
//   .start();

// figure.elements.animations.new()
//   .custom({
//     callback: (p) => {
//       figure.elements.transform = getTransform([['c', ...m3.rotationMatrixVectorToVector([1, 0, 0], [1 - p, p, p])]]);
//     },
//     duration: 10,
//   })
//   // .custom({
//   //   callback: (p) => {
//   //     figure.elements.transform = getTransform([['c', ...m3.rotationMatrixAxisAngle([1, 1, 0], p * 2)]]);
//   //   },
//   //   duration: 10,
//   // })
//   // .rotation({ target: [1, 1, 1], duration: 10 })
//   .start();



// const surfacePoints = getLathePoints({
//   // profile: Fig.getPoints([[0, 0], [0.2, 0.2], [0.6, 0.2], [0.8, 0]]),
//   profile: Fig.getPoints(polygon({ radius: 0.1, center: [0, 0.5], sides: 12, direction: -1 })),
//   sides: 12,
//   rotation: 0,
//   position: new Fig.Point(0, 0, 0),
//   matrix: new Fig.Transform().matrix(),
//   axis: 1,
// });
// const lines = surface.getLines(surfacePoints);
// console.log(surfacePoints)
// figure.add({
//   make: 'gl',
//   glPrimitive: 'LINES',
//   vertexShader: { dimension: 3 },
//   // fragShader,
//   vertices3: { data: lines },
//   // normals: { data: ln },
//   color: [0, 0, 0, 1],
//   position: [0, 0, 0],
// });