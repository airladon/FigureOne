import {
  Point, Rect,
} from '../../../tools/g2';
// import {
//   round,
// } from '../tools/math';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

// jest.mock('../../recorder.worker');

describe('Element Space Transforms', () => {
  let figure;
  let a;
  let c;
  let create;
  let get;
  let getP;
  beforeEach(() => {
    const collection = {
      name: 'c',
      make: 'collection',
      elements: [
        {
          name: 'a',
          make: 'polygon',
          radius: 1,
          sides: 4,
          transform: [['t', 1, 0]],
        },
      ],
      transform: [['t', 1, 0]],
    };
    const figureOptions = {
      _2d: () => {
        figure = makeFigure(
          new Rect(0, 0, 1000, 1000),
          {
            left: -4, right: 4, bottom: -4, top: 4,
          },
        );
        figure.add(collection);
      },
      orthographic: () => {
        // Position camera, near and far planes so origin is at z = 0 in gl space
        figure = makeFigure(
          new Rect(0, 0, 1000, 1000),
          {
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
        );
        figure.add(collection);
      },
      perspective: () => {
        // Position camera, near and far planes so origin is at z = 0.6666 in
        // gl space - note in perspective space z compresses the further from
        // the camera you go
        figure = makeFigure(
          new Rect(0, 0, 1000, 1000),
          {
            style: 'perspective',
            fieldOfView: 0.8,
            aspectRatio: 1,
            camera: {
              position: [3, 3, 3],
              lookAt: [0, 0, 0],
              up: [0, 1, 0],
            },
            near: Math.sqrt(3),
            far: Math.sqrt(3) * 5,
          },
        );
        figure.add(collection);
      },
    };
    create = (option) => {
      figureOptions[option]();
      figure.initialize();
      // c = figure.getElement('c');
      a = figure.getElement('c.a');
    };
    get = (
      element, p, from, to, precision = 3, plane,
    ) => element.transformPoint(p, from, to, plane).round(precision);
    getP = (x, y, z, precision = 3) => new Point(x, y, z).round(precision);
  });
  describe('2D', () => {
    beforeEach(() => {
      create('_2d');
    });
    test('Draw to Local', () => {
      expect(get(a, [0, 0], 'draw', 'local')).toEqual(getP(1, 0));
      expect(get(a, [1, 1], 'local', 'draw')).toEqual(getP(0, 1));

      expect(get(a, [0, 1], 'draw', 'local')).toEqual(getP(1, 1));
      expect(get(a, [1, 0], 'local', 'draw')).toEqual(getP(0, 0));
    });
    test('Draw to Figure', () => {
      expect(get(a, [0, 0], 'draw', 'figure')).toEqual(getP(2, 0));
      expect(get(a, [2, 0], 'figure', 'draw')).toEqual(getP(0, 0));

      expect(get(a, [0, 1], 'draw', 'figure')).toEqual(getP(2, 1));
      expect(get(a, [2, 1], 'figure', 'draw')).toEqual(getP(0, 1));
    });
    test('Draw to GL', () => {
      expect(get(a, [0, 0], 'draw', 'gl')).toEqual(getP(0.5, 0));
      expect(get(a, [0.5, 0], 'gl', 'draw')).toEqual(getP(0, 0));

      expect(get(a, [0, 1], 'draw', 'gl')).toEqual(getP(0.5, 0.25));
      expect(get(a, [0.5, 0.25], 'gl', 'draw')).toEqual(getP(0, 1));
    });
    test('Draw to Pixel', () => {
      expect(get(a, [0, 0], 'draw', 'pixel')).toEqual(getP(500 + 250, 500));
      expect(get(a, [500 + 250, 500], 'pixel', 'draw')).toEqual(getP(0, 0));

      expect(get(a, [0, 1], 'draw', 'pixel')).toEqual(getP(500 + 250, 500 - 125));
      expect(get(a, [500 + 250, 500 - 125], 'pixel', 'draw')).toEqual(getP(0, 1));
    });
    test('Local to Figure', () => {
      expect(get(a, [0, 0], 'local', 'figure')).toEqual(getP(1, 0));
      expect(get(a, [1, 0], 'figure', 'local')).toEqual(getP(0, 0));

      expect(get(a, [0, 1], 'local', 'figure')).toEqual(getP(1, 1));
      expect(get(a, [1, 1], 'figure', 'local')).toEqual(getP(0, 1));
    });
    test('Local to GL', () => {
      expect(get(a, [0, 0], 'local', 'gl')).toEqual(getP(0.25, 0));
      expect(get(a, [0.25, 0], 'gl', 'local')).toEqual(getP(0, 0));

      expect(get(a, [0, 1], 'local', 'gl')).toEqual(getP(0.25, 0.25));
      expect(get(a, [0.25, 0.25], 'gl', 'local')).toEqual(getP(0, 1));
    });
    test('Local to Pixel', () => {
      expect(get(a, [0, 0], 'local', 'pixel')).toEqual(getP(500 + 125, 500));
      expect(get(a, [500 + 125, 500], 'pixel', 'local')).toEqual(getP(0, 0));

      expect(get(a, [0, 1], 'local', 'pixel')).toEqual(getP(500 + 125, 500 - 125));
      expect(get(a, [500 + 125, 500 - 125], 'pixel', 'local')).toEqual(getP(0, 1));
    });
    test('Figure to GL', () => {
      expect(get(a, [0, 0], 'figure', 'gl')).toEqual(getP(0, 0));
      expect(get(a, [0, 0], 'gl', 'figure')).toEqual(getP(0, 0));
      expect(get(a, [0, 1], 'figure', 'gl')).toEqual(getP(0, 0.25));
      expect(get(a, [0, 0.25], 'gl', 'figure')).toEqual(getP(0, 1));
    });
    test('Figure to Pixel', () => {
      expect(get(a, [0, 0], 'figure', 'pixel')).toEqual(getP(500, 500));
      expect(get(a, [500, 500], 'pixel', 'figure')).toEqual(getP(0, 0));
      expect(get(a, [0, 1], 'figure', 'pixel')).toEqual(getP(500, 500 - 125));
      expect(get(a, [500, 500 - 125], 'pixel', 'figure')).toEqual(getP(0, 1));
    });
    test('GL to Pixel', () => {
      expect(get(a, [0, 0], 'gl', 'pixel')).toEqual(getP(500, 500));
      expect(get(a, [500, 500], 'pixel', 'gl')).toEqual(getP(0, 0));
      expect(get(a, [0, -1], 'gl', 'pixel')).toEqual(getP(500, 1000));
      expect(get(a, [500, 1000], 'pixel', 'gl')).toEqual(getP(0, -1));
    });
  });
  describe('Orthographic', () => {
    beforeEach(() => {
      create('orthographic');
    });
    test('Draw to Local', () => {
      expect(get(a, [0, 0, 0], 'draw', 'local')).toEqual(getP(1, 0, 0));
      expect(get(a, [1, 0, 0], 'local', 'draw')).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'draw', 'local')).toEqual(getP(1, 1, 1));
      expect(get(a, [1, 1, 1], 'local', 'draw')).toEqual(getP(0, 1, 1));
    });
    test('Draw to Figure', () => {
      expect(get(a, [0, 0, 0], 'draw', 'figure')).toEqual(getP(2, 0, 0));
      expect(get(a, [2, 0, 0], 'figure', 'draw')).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'draw', 'figure')).toEqual(getP(2, 1, 1));
      expect(get(a, [2, 1, 1], 'figure', 'draw')).toEqual(getP(0, 1, 1));
    });
    test('Draw to GL', () => {
      expect(get(a, [0, 0, 0], 'draw', 'gl')).toEqual(getP(0.707, -0.408, -0.333));
      expect(get(a, [0.707, -0.408, -0.333], 'gl', 'draw', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'draw', 'gl')).toEqual(getP(0.354, -0.204, -0.667));
      expect(get(a, [0.354, -0.204, -0.667], 'gl', 'draw', 2)).toEqual(getP(0, 1, 1));
    });
    test('Draw to Pixel', () => {
      expect(get(a, [0, 0, 0], 'draw', 'pixel', 0)).toEqual(getP(500 + 0.707 * 500, 500 + 0.408 * 500, 0, 0));
      expect(get(a, [500 + 0.707 * 500, 500 + 0.408 * 500], 'pixel', 'draw')).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'draw', 'pixel', 0)).toEqual(getP(500 + 0.354 * 500, 500 + 0.204 * 500, 0, 0));
      expect(get(a, [500 + 0.354 * 500, 500 + 0.204 * 500], 'pixel', 'draw', 2, [[0, 0, 1], [0, 0, 1]])).toEqual(getP(0, 1, 1, 0));
    });
    test('Local to Figure', () => {
      expect(get(a, [0, 0, 0], 'local', 'figure')).toEqual(getP(1, 0, 0));
      expect(get(a, [1, 0, 0], 'figure', 'local')).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'local', 'figure')).toEqual(getP(1, 1, 1));
      expect(get(a, [1, 1, 1], 'figure', 'local')).toEqual(getP(0, 1, 1));
    });
    test('Local to GL', () => {
      expect(get(a, [0, 0, 0], 'local', 'gl')).toEqual(getP(0.354, -0.204, -0.167));
      expect(get(a, [0.354, -0.204, -0.167], 'gl', 'local', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'local', 'gl')).toEqual(getP(0, 0, -0.5));
      expect(get(a, [0, 0, -0.5], 'gl', 'local', 2)).toEqual(getP(0, 1, 1));
    });
    test('Local to pixel', () => {
      expect(get(a, [0, 0, 0], 'local', 'pixel', 0)).toEqual(getP(500 + 500 * 0.354, 500 + 500 * 0.204, 0, 0));
      expect(get(a, [500 + 500 * 0.354, 500 + 500 * 0.204], 'pixel', 'local', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'local', 'pixel')).toEqual(getP(500, 500, 0));
      expect(get(a, [500, 500], 'pixel', 'local', 2, [[0, 0, 1], [0, 0, 1]])).toEqual(getP(0, 1, 1));
    });
    test('Figure to GL', () => {
      expect(get(a, [0, 0, 0], 'figure', 'gl')).toEqual(getP(0, 0, 0));
      expect(get(a, [0, 0, 0], 'gl', 'figure', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'figure', 'gl')).toEqual(getP(-0.354, 0.204, -0.333));
      expect(get(a, [-0.354, 0.204, -0.333], 'gl', 'figure', 2)).toEqual(getP(0, 1, 1));
    });
    test('Figure to Pixel', () => {
      expect(get(a, [0, 0, 0], 'figure', 'pixel')).toEqual(getP(500, 500));
      expect(get(a, [500, 500], 'pixel', 'figure', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'figure', 'pixel', 0)).toEqual(getP(500 - 500 * 0.354, 500 - 500 * 0.204, 0));
      expect(get(a, [500 - 500 * 0.354, 500 - 500 * 0.204], 'pixel', 'figure', 2, [[0, 0, 1], [0, 0, 1]])).toEqual(getP(0, 1, 1));
    });
    test('GL to Pixel', () => {
      expect(get(a, [0, 0, 0], 'gl', 'pixel')).toEqual(getP(500, 500));
      expect(get(a, [500, 500], 'pixel', 'gl', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'gl', 'pixel', 0)).toEqual(getP(500, 0, 0));
      expect(get(a, [500, 0], 'pixel', 'gl', 2, [[0, 0, 1], [0, 0, 1]])).toEqual(getP(0, 1, 1));
    });
  });
  describe('Perspective', () => {
    beforeEach(() => {
      create('perspective');
    });
    test('Draw to Local', () => {
      expect(get(a, [0, 0, 0], 'draw', 'local')).toEqual(getP(1, 0, 0));
      expect(get(a, [1, 0, 0], 'local', 'draw')).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'draw', 'local')).toEqual(getP(1, 1, 1));
      expect(get(a, [1, 1, 1], 'local', 'draw')).toEqual(getP(0, 1, 1));
    });
    test('Draw to Figure', () => {
      expect(get(a, [0, 0, 0], 'draw', 'figure')).toEqual(getP(2, 0, 0));
      expect(get(a, [2, 0, 0], 'figure', 'draw')).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'draw', 'figure')).toEqual(getP(2, 1, 1));
      expect(get(a, [2, 1, 1], 'figure', 'draw')).toEqual(getP(0, 1, 1));
    });
    test('Draw to GL', () => {
      expect(get(a, [0, 0, 0], 'draw', 'gl')).toEqual(getP(0.828, -0.478, 0.429));
      expect(get(a, [0.828, -0.478, 0.429], 'gl', 'draw', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'draw', 'gl')).toEqual(getP(0.579, -0.334, 0));
      expect(get(a, [0.579, -0.334, 0], 'gl', 'draw', 2)).toEqual(getP(0, 1, 1));
    });
    test('Draw to Pixel', () => {
      expect(get(a, [0, 0, 0], 'draw', 'pixel', 0)).toEqual(getP(500 + 0.828 * 500, 500 + 0.478 * 500, 0, 0));
      expect(get(a, [500 + 0.828 * 500, 500 + 0.478 * 500], 'pixel', 'draw', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'draw', 'pixel', 0)).toEqual(getP(500 + 0.579 * 500, 500 + 0.334 * 500, 0, 0));
      expect(get(a, [500 + 0.579 * 500, 500 + 0.334 * 500], 'pixel', 'draw', 2, [[0, 0, 1], [0, 0, 1]])).toEqual(getP(0, 1, 1, 0));
    });
    test('Local to Figure', () => {
      expect(get(a, [0, 0, 0], 'local', 'figure')).toEqual(getP(1, 0, 0));
      expect(get(a, [1, 0, 0], 'figure', 'local')).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'local', 'figure')).toEqual(getP(1, 1, 1));
      expect(get(a, [1, 1, 1], 'figure', 'local')).toEqual(getP(0, 1, 1));
    });
    test('Local to GL', () => {
      expect(get(a, [0, 0, 0], 'local', 'gl')).toEqual(getP(0.362, -0.209, 0.563));
      expect(get(a, [0.362, -0.209, 0.563], 'gl', 'local', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'local', 'gl')).toEqual(getP(0, 0, 0.25));
      expect(get(a, [0, 0, 0.25], 'gl', 'local', 2)).toEqual(getP(0, 1, 1));
    });
    test('Local to pixel', () => {
      expect(get(a, [0, 0, 0], 'local', 'pixel', 0)).toEqual(getP(500 + 500 * 0.362, 500 + 500 * 0.209, 0, 0));
      expect(get(a, [500 + 500 * 0.362, 500 + 500 * 0.209], 'pixel', 'local', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'local', 'pixel')).toEqual(getP(500, 500, 0));
      expect(get(a, [500, 500], 'pixel', 'local', 2, [[0, 0, 1], [0, 0, 1]])).toEqual(getP(0, 1, 1));
    });
    test('Figure to GL', () => {
      expect(get(a, [0, 0, 0], 'figure', 'gl')).toEqual(getP(0, 0, 0.667));
      expect(get(a, [0, 0, 0.667], 'gl', 'figure', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'figure', 'gl')).toEqual(getP(-0.414, 0.239, 0.429));
      expect(get(a, [-0.414, 0.239, 0.429], 'gl', 'figure', 2)).toEqual(getP(0, 1, 1));
    });
    test('Figure to Pixel', () => {
      expect(get(a, [0, 0, 0], 'figure', 'pixel')).toEqual(getP(500, 500));
      expect(get(a, [500, 500], 'pixel', 'figure', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'figure', 'pixel', 0)).toEqual(getP(500 - 500 * 0.414, 500 - 500 * 0.239, 0, 0));
      expect(get(a, [500 - 500 * 0.414, 500 - 500 * 0.239], 'pixel', 'figure', 2, [[0, 0, 1], [0, 0, 1]])).toEqual(getP(0, 1, 1));
    });
    test('GL to Pixel', () => {
      expect(get(a, [0, 0, 0], 'gl', 'pixel')).toEqual(getP(500, 500));
      expect(get(a, [500, 500], 'pixel', 'gl', 2)).toEqual(getP(0, 0, 0));

      expect(get(a, [0, 1, 1], 'gl', 'pixel', 0)).toEqual(getP(500, 0, 0));
      expect(get(a, [500, 0], 'pixel', 'gl', 2, [[0, 0, 1], [0, 0, 1]])).toEqual(getP(0, 1, 1));
    });
  });
});

/*
// Test for Orthographic - change position of 'grid' elements
// between z = 0 and z = 1

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
*/