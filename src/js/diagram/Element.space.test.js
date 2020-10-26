import {
  Point, Transform, Rect,
} from '../tools/g2';
import {
  round,
} from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');

describe('Element Space Transforms', () => {
  let diagram;
  let a;
  let c;
  let create;
  beforeEach(() => {
    const diagramOptions = {
      simple: () => {
        diagram = makeDiagram(
          new Rect(0, 0, 1000, 1000),
          new Rect(-3, -3, 6, 6),
        );
        diagram.addElements([
          {
            name: 'c',
            method: 'collection',
            addElements: [
              {
                name: 'a',
                method: 'polygon',
                options: {
                  radius: 1,
                  sides: 4,
                  transform: [['t', 1, 0]],
                },
              },
            ],
            options: {
              transform: [['t', 1, 0]],
            },
          },
        ]);
      },
    };
    create = (option) => {
      diagramOptions[option]();
      diagram.initialize();
      c = diagram.getElement('c');
      a = diagram.getElement('c.a');
    };
  });
  describe('Simple', () => {
    let get;
    let getP;
    beforeEach(() => {
      create('simple');
      get = (element, p, from, to) => element.pointFromSpaceToSpace(p, from, to).round(3);
      getP = (x, y) => new Point(x, y).round(3);
    });
    test('Vertex to Local', () => {
      expect(get(a, [0, 0], 'vertex', 'local')).toEqual(getP(1, 0));
    });
    test('Local to Vertex', () => {
      expect(get(a, [0, 0], 'local', 'vertex')).toEqual(getP(-1, 0));
    });
    test('Vertex to Diagram', () => {
      expect(get(a, [0, 0], 'vertex', 'diagram')).toEqual(getP(2, 0));
    });
    test('Diagram to Vertex', () => {
      expect(get(a, [0, 0], 'diagram', 'vertex')).toEqual(getP(-2, 0));
    });
    test('Vertex to GL', () => {
      expect(get(a, [0, 0], 'vertex', 'gl')).toEqual(getP(0.667, 0));
    });
    test('GL to Vertex', () => {
      expect(get(a, [0, 0], 'gl', 'vertex')).toEqual(getP(-2, 0));
    });
    test('Vertex to Pixel', () => {
      expect(get(a, [0, 0], 'vertex', 'pixel')).toEqual(getP(833.333, 500));
    });
    test('Pixel to Vertex', () => {
      expect(get(a, [0, 0], 'pixel', 'vertex')).toEqual(getP(-5, 3));
    });
    // Remaining Local
    test('Local to Diagram', () => {
      expect(get(a, [0, 0], 'local', 'diagram')).toEqual(getP(1, 0));
    });
    test('Diagram to Local', () => {
      expect(get(a, [0, 0], 'diagram', 'local')).toEqual(getP(-1, 0));
    });
    test('Local to GL', () => {
      expect(get(a, [0, 0], 'local', 'gl')).toEqual(getP(0.333, 0));
    });
    test('GL to Local', () => {
      expect(get(a, [0, 0], 'gl', 'local')).toEqual(getP(-1, 0));
    });
    test('Local to Pixel', () => {
      expect(get(a, [0, 0], 'local', 'pixel')).toEqual(getP(666.667, 500));
    });
    test('Pixel to Local', () => {
      expect(get(a, [0, 0], 'pixel', 'local')).toEqual(getP(-4, 3));
    });
  });
});
