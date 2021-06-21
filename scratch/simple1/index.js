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

// const makeRod = (length, radius, sides, rx, ry, rz) => {
//   const corners = Fig.tools.morph.getPolygonCorners({ radius, sides });
//   const cornersZ = corners.map(c => c.add(0, 0, length));
//   const t = new Fig.Transform().rotate('xyz', rx, ry, rz);
//   const tc = corners.map(c => c.transformBy(t.mat));
//   const tcZ = cornersZ.map(c => c.transformBy(t.mat));
//   const frontNormal = new Fig.Point(0, 0, -1).transformBy(t.mat);
//   const backNormal = new Fig.Point(0, 0, 1).transformBy(t.mat);
//   const sideNormals = [];
//   const delta = Math.PI * 2 / sides / 2;
//   for (let i = 0; i < sides; i += 1) {
//     const angle = delta + i * delta * 2;
//     const normal = Fig.tools.g2.polarToRect(1, angle);
//     sideNormals.push(normal.transformBy(t.mat));
//   }
//   const points = [];
//   const normals = [];
//   for (let i = 0; i < sides; i += 1) {
//     const next = i === corners.length - 1 ? 0 : i + 1;
//     points.push(new Fig.Point(0, 0, 0).transformBy(t.mat));
//     points.push(tc[i]._dup());
//     points.push(tc[next]._dup());
//     normals.push(frontNormal._dup());
//     normals.push(frontNormal._dup());
//     normals.push(frontNormal._dup());
//   }
//   for (let i = 0; i < corners.length; i += 1) {
//     const next = i === corners.length - 1 ? 0 : i + 1;
//     points.push(tc[i]._dup(), tcZ[i]._dup(), tcZ[next]._dup());
//     points.push(tc[i]._dup(), tcZ[next]._dup(), tc[next]._dup());
//     normals.push(sideNormals[i]._dup());
//     normals.push(sideNormals[i]._dup());
//     normals.push(sideNormals[i]._dup());
//     normals.push(sideNormals[i]._dup());
//     normals.push(sideNormals[i]._dup());
//     normals.push(sideNormals[i]._dup());
//   }
//   for (let i = 0; i < sides; i += 1) {
//     const next = i === corners.length - 1 ? 0 : i + 1;
//     points.push(new Fig.Point(0, 0, length).transformBy(t.mat));
//     points.push(tcZ[i]);
//     points.push(tcZ[next]);
//     normals.push(backNormal._dup());
//     normals.push(backNormal._dup());
//     normals.push(backNormal._dup());
//   }
//   const vertices = [];
//   const norms = [];
//   for (let i = 0; i < points.length; i += 1) {
//     vertices.push(points[i].x);
//     vertices.push(points[i].y);
//     vertices.push(points[i].z);
//     norms.push(normals[i].x);
//     norms.push(normals[i].y);
//     norms.push(normals[i].z);
//   }
//   return [vertices, norms];
// };
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
      line: [[0.7, 0, 0], [0.85, 0, 0]],
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
};
addAxis('xPosAxis', [0.7, 0, 0], [1, 0, 0, 1], true);
addAxis('xNegAxis', [-0.7, 0.0000001, 0], [1, 0, 0, 1]);
// addAxis('yPosAxis', [0, 0.7, 0], [0, 1, 0, 1], true);
// addAxis('yNegAxis', [0, -0.7, 0], [0, 1, 0, 1]);
// addAxis('zPosAxis', [0, 0, 0.7], [0, 0, 1, 1], true);
// addAxis('zNegAxis', [0, 0, -0.7], [0, 0, 1, 1]);

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

addSphere('xPos', [0.95, 0, 0], [1, 0.5, 0.5, 1]);
addSphere('xNeg', [-0.95, 0, 0], [1, 0, 0, 1]);
addSphere('yPos', [0, 0.95, 0], [0, 1, 0, 1]);
addSphere('yNeg', [0, -0.95, 0], [0, 0.5, 0, 1]);
addSphere('zPos', [0, 0, 0.95], [0.5, 0.5, 1, 1]);
addSphere('zNeg', [0, 0, -0.95], [0, 0, 1, 1]);

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
  position: [0.5, 0, 0],
});
cube.setMovable();
cube.move.plane = Fig.tools.g2.getPlane([[0.5, 0, 0], [1, 0, 0]]);


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


// figure.scene.setCamera({ position: [0.2, 0.2, 2] });
// figure.scene.setProjection({ style: 'perspective', near: 1.03, far: 3, aspectRatio: 2, fieldOfView: Math.PI * 0.4 });

figure.scene.setCamera({ position: [0.5, 0.5, 1.1] });

figure.scene.setProjection({
  style: 'orthographic', near: 0.1, far: 4, left: -2, right: 2, bottom: -1, top: 1,
});
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