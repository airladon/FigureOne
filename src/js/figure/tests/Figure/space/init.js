/* globals Fig */
const figure = new Fig.Figure();
const { rod, cone } = Fig.tools.g2;

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

const gridMinor = figure.add({
  name: 'gridMinor',
  make: 'grid',
  bounds: [-1, -1, 2, 2],
  xStep: 0.1,
  yStep: 0.1,
  line: { width: 0.005 },
  color: [0.8, 0.8, 0.8, 1],
  position: [0, 0, 0],
  xAlign: 'center',
});

const gridMajor = figure.add({
  name: 'gridMajor',
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


const addAxis = (name, direction, color, includeArrow = false) => {
  const [p, n] = rod({
    radius: 0.02, sides: 10, line: [[0, 0, 0], [includeArrow ? 0.85 : 1, 0, 0]],
  });
  let cn = [];
  let cnNormals = [];
  if (includeArrow) {
    [cn, cnNormals] = cone({
      radius: 0.06,
      sides: 10,
      line: [[0.85, 0, 0], [1, 0, 0]],
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

figure.add([
  {
    name: 'cursorContainer',
    make: 'collection',
    elements: [
      {
        name: 'cursor',
        make: 'polygon',
        radius: 0.05,
        color: [0.5, 0.5, 1, 1],
        sides: 4,
        position: [0, 0, 1],
      },
    ],
  },
  {
    name: 'markContainer',
    make: 'collection',
    elements: [
      {
        name: 'mark',
        make: 'polygon',
        radius: 0.1,
        sides: 20,
        color: [1, 0.3, 0.3, 1],
      },
    ],
  },
]);


const mark = figure.get('markContainer.mark');
const cursor = figure.get('cursorContainer.cursor');
const markContainer = figure.get('markContainer');
const cursorContainer = figure.get('cursorContainer');
cursorContainer.scene = new Fig.Scene();