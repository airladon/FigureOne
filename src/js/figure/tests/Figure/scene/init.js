/* globals Fig */
const figure = new Fig.Figure();
const { cylinder, cone } = Fig;


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

const vertexShader = {
  dimension: 3,
  normals: true,
  light: 'directional',
};
const fragmentShader = {
  light: 'directional',
};


const addAxis = (name, direction, color, includeArrow = false) => {
  const [p, n] = cylinder({ radius: 0.03, sides: 10, line: [[0, 0, 0], [0.7, 0, 0]] });
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
    fragmentShader,
    vertices: { data: Fig.pointsToNumbers([...p, ...cn]) },
    normals: { data: Fig.pointsToNumbers([...n, ...cnNormals]) },
    dimension: 3,
    color,
    transform: [['rd', ...direction]],
  });
  r.setTouchable();
};
addAxis('xPos', [1, 0, 0], [1, 0, 0, 1], true);
addAxis('xNeg', [-1, 0, 0], [1, 0, 0, 1]);
addAxis('yPos', [0, 1, 0], [0, 1, 0, 1], true);
addAxis('yNeg', [0, -1, 0], [0, 1, 0, 1]);
addAxis('zPos', [0, 0, 1], [0, 0, 1, 1], true);
addAxis('zNeg', [0, 0, -1], [0, 0, 1, 1]);


const [cv, cn] = cone({
  line: [[0, 0, 0], [0, 0.3, 0]],
  radius: 0.1,
  sides: 4,
});

figure.add({
  make: 'gl',
  vertexShader,
  fragmentShader,
  dimension: 3,
  vertices: { data: Fig.pointsToNumbers(cv) },
  normals: { data: Fig.pointsToNumbers(cn) },
  color: [0, 1, 1, 1],
  position: [0, 0, 0.5],
});

const [cubeV, cubeN] = Fig.cube({
  side: 1,
});

figure.add({
  name: 'cube',
  make: 'gl',
  vertexShader: { dimension: 3, light: 'point', normals: true },
  fragmentShader: { light: 'point' },
  dimension: 3,
  vertices: { data: Fig.pointsToNumbers(cubeV) },
  normals: { data: Fig.pointsToNumbers(cubeN) },
  color: [1, 0, 0, 1],
  position: [0, 0, 0.5],
});

