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
screenGrid.scene.setProjection({ style: '2D', left: -2, right: 2, bottom: -1, top: 1 });
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
const fragmentShader = {
  light: 'directional',
};


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
    fragmentShader,
    vertices: { data: [...p, ...cn], size: 3 },
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


const addSphere = (name, position, color) => {
  const [sx, sn] = sphere({ radius: 0.05, sides: 10, normals: 'curve' });
  const s = figure.add({
    name,
    make: 'gl',
    vertexShader,
    fragmentShader,
    vertices: { data: sx, size: 3 },
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
// xAxis.setNotTouchable();
xAxis.move.type = 'rotation';
xAxis.transform.updateRotation(['axis', 0, 1, 0, 0])
xAxis.move.plane = new Fig.tools.g2.Plane([[0, 0, 0], [0, 1, 0]]);
xAxis.setMovable();
xAxis.setTouchable([1, 2, 2]);
// xAxis.onClick = () => console.log('asdfasdf')
xAxis.move.bounds = new Fig.RangeBounds({
  min: -Math.PI / 2,
  max: Math.PI / 2,
});

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
//   fragmentShader,
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
  fragmentShader,
  vertices3: { data: rv },
  normals: { data: rn },
  color: [0, 1, 1, 1],
  position: [0, 0.5, 0],
  // transform: [['s', 1, 1, 1], ['axis', [0, 1, 0], 1], ['t', 0, 0, 0]],
  move: {
    type: 'rotation',
    plane: [[0, 0.5, 0], [1, 1, 0]],
    // bounds: { min: 0.5, max: 10}
    // bounds: { p1: [0, 0, 1], p2: [0, 0, -1] },
    // bounds: { left: 0.5, bottom: 0.5, right: 0.5, rightDirection: [0, 0, -1] },
  },
});
// cube.setMovable();
// cube.setTouchable();
// cube.move.type = 'translation';
// // cube.move.plane = 
// cube.move.plane = Fig.tools.g2.getPlane([[0, 0, 0], [1, 0, 0]]);
// cube.move.bounds = new Fig.LineBounds({
//   p1: [0, 0, 1],
//   p2: [0, 0, -1],
// });
// cube.move.bounds = new Fig.RectBounds({
//   normal: [1, 0, 0],
//   rightDirection: [0, 0, -1],
//   left: 0.5,
//   right: 1,
//   top: 1,
//   bottom: 0.5,
// });
figure.add({
  make: 'polygon',
  line: { width: 0.01 },
  radius: 0.5,
  position: [0, 0, 0.2],
}).pulse({
  duration: 3, scale: 1.2, min: 0.8, num: 5,
});
figure.add({
  make: 'text',
  text: 'a',
  position: [0.5, 0, 0],
  xAlign: 'center',
});
figure.add({
  make: 'arc',
  radius: 1,
            angle: Math.PI,
            sides: 4,
            drawBorderBuffer: 0.1,
            line: { width: 0.1, widthIs: 'inside' },
})

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


figure.scene.setCamera({ position: [2, 2, 2] });
figure.scene.setProjection({ style: 'orthographic', near: 1, far: 10, left: -2, right: 2, bottom: -1, top: 1 });

// figure.scene.setCamera({ position: [2, 2, 2] });
// figure.scene.setProjection({ style: 'perspective', near: 1, far: 7, aspectRatio: 2, fieldOfView: Math.PI * 0.2 });


// const c = new Fig.Point(-0.15, -1, 0).transformBy(figure.scene.viewMatrix);
// const cameraZ = c.z;
// const cameraX = c.x;
// const cameraY = c.y;
// const matrix0 = figure.scene.projectionMatrix[0];
// const matrix5 = figure.scene.projectionMatrix[5];
// const matrix10 = figure.scene.projectionMatrix[10];
// const matrix11 = -1;
// const matrix14 = figure.scene.projectionMatrix[11];
// const clipY = cameraY * matrix5 / cameraZ * matrix11;
// const clipX = cameraX * matrix0 / cameraZ * matrix11;
// const clipZ = (matrix10 * cameraZ + matrix14) / (cameraZ * matrix11)

// const q = m3.transformVector(figure.scene.viewProjectionMatrix, [-0.15, -1, 0, 1])
// const qClip = q.map(n => n/ q[3]);
// console.log(qClip);
// const r = m3.transformVector(figure.scene.viewProjectionMatrix, [1, 0.6, 0, 1])
// const rClip = r.map(n => n/ r[3])
// // console.log(rClip);
// // console.log(Fig.getPoint(rClip.slice(0, 3)).transformBy(m3.inverse(figure.scene.viewProjectionMatrix)))
// // console.log(Fig.getPoint(qClip.slice(0, 3)).transformBy(m3.inverse(figure.scene.viewProjectionMatrix)))

// const cz = matrix14 / (matrix11 * rClip[2] - matrix10);
// const cx = rClip[0] * cz / matrix11 / matrix0;
// const cy = rClip[1] * cz / matrix11 / matrix5;
// console.log(m3.transform(figure.scene.cameraMatrix, cx, cy, cz))

// const cz1 = matrix14 / (matrix11 * qClip[2] - matrix10);
// const cx1 = qClip[0] * cz1 / matrix11 / matrix0;
// const cy1 = qClip[1] * cz1 / matrix11 / matrix5;
// console.log(m3.transform(figure.scene.cameraMatrix, cx1, cy1, cz1))

// const a = figure.scene.figureToGL([1, 0.6, 0])
// const b = figure.scene.figureToGL([-0.15, -1, 0])
// const a1 = figure.scene.glToFigure(a);
// const b1 = figure.scene.glToFigure(b);
// console.log(a1)
// console.log(a)
// console.log(b1)
// console.log(b)
