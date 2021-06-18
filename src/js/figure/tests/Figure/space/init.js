/* globals Fig */
const figure = new Fig.Figure();
const { rod } = Fig.tools.g2;


const screenGrid = figure.add({
  make: 'grid',
  bounds: [-1, -1, 2, 2],
  xStep: 0.5,
  yStep: 0.5,
  line: { width: 0.005 },
  color: [0.9, 0.9, 1, 1],
  position: [0, 0, -3],
  xAlign: 'center',
});
screenGrid.scene = new Fig.Scene();

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


const addAxis = (name, direction, color) => {
  const [p, n] = rod({ radius: 0.02, sides: 10, line: [[0, 0, 0], [0.7, 0, 0]] });
  const r = figure.add({
    name,
    make: 'gl',
    vertexShader: { dimension: 3, light: 'directional', normals: true },
    fragShader: { light: 'directional' },
    vertices3: { data: p },
    normals: { data: n },
    color,
    transform: [['rd', ...direction]],
  });
  r.setTouchable();
};
addAxis('xPos', [1, 0, 0], [1, 0, 0, 1]);
addAxis('xNeg', [-1, 0, 0], [0.7, 0, 0, 1]);
addAxis('yPos', [0, 1, 0], [0, 1, 0, 1]);
addAxis('yNeg', [0, -1, 0], [0, 0.5, 0, 1]);
addAxis('zPos', [0, 0, 1], [0.3, 0.3, 1, 1]);
addAxis('zNeg', [0, 0, -1], [0, 0, 0.8, 1]);
