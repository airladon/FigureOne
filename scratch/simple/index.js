const { sphere, cone, rod } = Fig.tools.g2;

const figure = new Fig.Figure({
  scene: {
    style: 'orthographic',
    left: -2,
    right: 2,
    bottom: -2,
    top: 2,
    camera: {
      position: [3, 3, 3],
      lookAt: [0, 0, 0],
      up: [0, 1, 0],
    },
    near: Math.sqrt(3),
    far: Math.sqrt(3) * 5,
  },
});


const screenGrid = figure.add({
  make: 'grid',
  bounds: [-2, -2, 4, 4],
  xStep: 1,
  yStep: 1,
  line: { width: 0.005 },
  color: [0.5, 0.5, 1, 1],
  position: [0, 0, -3],
  xAlign: 'center',
});
screenGrid.scene = new Fig.Scene();
screenGrid.scene.setProjection({ style: '2D', left: -2, right: 2, bottom: -2, top: 2 });
const screenMinorGrid = figure.add({
  make: 'grid',
  bounds: [-2, -2, 4, 4],
  xStep: 0.2,
  yStep: 0.2,
  line: { width: 0.005 },
  color: [0.85, 0.85, 1, 1],
  position: [0, 0, -3],
  xAlign: 'center',
});
screenMinorGrid.scene = screenGrid.scene;

figure.add({
  make: 'grid',
  bounds: [-2, -2, 4, 4],
  xStep: 0.2,
  yStep: 0.2,
  line: { width: 0.005 },
  color: [0.8, 0.8, 0.8, 1],
  position: [0, 0, 1],
  xAlign: 'center',
});

figure.add({
  make: 'grid',
  bounds: [-2, -2, 4, 4],
  xStep: 1,
  yStep: 1,
  line: { width: 0.007 },
  color: [0.5, 0.5, 0.5, 1],
  position: [0, 0, 1],
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
addAxis('xPosAxis', [2, 0, 0], [1, 0, 0, 1], true);
addAxis('xNegAxis', [-2, 0, 0], [1, 0, 0, 1]);
addAxis('yPosAxis', [0, 2, 0], [0, 1, 0, 1], true);
addAxis('yNegAxis', [0, -2, 0], [0, 1, 0, 1]);
addAxis('zPosAxis', [0, 0, 2], [0, 0, 1, 1], true);
addAxis('zNegAxis', [0, 0, -2], [0, 0, 1, 1]);

const addSphere = (name, position, color) => {
  const [sx, sn] = sphere({ radius: 0.2, sides: 10, normals: 'curve' });
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

addSphere('xPos', [-2.1, -2.1, -2.1], [1, 0.5, 0.5, 1]);

