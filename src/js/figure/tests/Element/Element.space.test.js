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
    const figureOptions = {
      simple: () => {
        figure = makeFigure(
          new Rect(0, 0, 1000, 1000),
          new Rect(-3, -3, 6, 6),
        );
        figure.add([
          {
            name: 'c',
            make: 'collection',
            elements: [
              {
                name: 'a',
                make: 'polygon',
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
      rectangleOffZero: () => {
        figure = makeFigure(
          new Rect(100, 200, 1000, 500),
          new Rect(1, 1, 4, 2),
        );
        figure.add([
          {
            name: 'c',
            make: 'collection',
            elements: [
              {
                name: 'a',
                make: 'polygon',
                options: {
                  radius: 1,
                  sides: 4,
                  transform: [['t', 1, 0]],
                },
              },
            ],
            options: {
              transform: [['s', 0.5, 0.5], ['t', 2, 0], ['r', Math.PI / 4]],
            },
          },
        ]);
      },
      collectionInCollection: () => {
        figure = makeFigure(
          new Rect(0, 0, 1000, 1000),
          new Rect(-3, -3, 6, 6),
        );
        figure.add([
          {
            name: 'c',
            make: 'collection',
            options: {
              position: [0.5, 0],
            },
            elements: [
              {
                name: 'c',
                make: 'collection',
                options: {
                  position: [0.5, 0],
                },
                elements: [
                  {
                    name: 'p',
                    make: 'shapes.rectangle',
                    options: {
                      width: 1,
                      height: 1,
                      position: [0.5, 0],
                    },
                  },
                ],
              },
            ],
          },
        ]);
      },
    };
    create = (option) => {
      figureOptions[option]();
      figure.initialize();
      // c = figure.getElement('c');
      a = figure.getElement('c.a');
    };
    get = (element, p, from, to) => element.pointFromSpaceToSpace(p, from, to).round(3);
    getP = (x, y) => new Point(x, y).round(3);
  });
  describe('Simple', () => {
    beforeEach(() => {
      create('simple');
    });
    test('Vertex to Local', () => {
      expect(get(a, [0, 0], 'draw', 'local')).toEqual(getP(1, 0));
    });
    test('Local to Vertex', () => {
      expect(get(a, [0, 0], 'local', 'draw')).toEqual(getP(-1, 0));
    });
    test('Vertex to Figure', () => {
      expect(get(a, [0, 0], 'draw', 'figure')).toEqual(getP(2, 0));
    });
    test('Figure to Vertex', () => {
      expect(get(a, [0, 0], 'figure', 'draw')).toEqual(getP(-2, 0));
    });
    test('Vertex to GL', () => {
      expect(get(a, [0, 0], 'draw', 'gl')).toEqual(getP(0.667, 0));
    });
    test('GL to Vertex', () => {
      expect(get(a, [0, 0], 'gl', 'draw')).toEqual(getP(-2, 0));
    });
    test('Vertex to Pixel', () => {
      expect(get(a, [0, 0], 'draw', 'pixel')).toEqual(getP(833.333, 500));
    });
    test.only('Pixel to Vertex', () => {
      expect(get(a, [0, 0], 'pixel', 'draw')).toEqual(getP(-5, 3));
    });
    // Remaining Local
    test('Local to Figure', () => {
      expect(get(a, [0, 0], 'local', 'figure')).toEqual(getP(1, 0));
    });
    test('Figure to Local', () => {
      expect(get(a, [0, 0], 'figure', 'local')).toEqual(getP(-1, 0));
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

    // Remaining figure
    test('Figure to GL', () => {
      expect(get(a, [0, 0], 'figure', 'gl')).toEqual(getP(0, 0));
    });
    test('GL to Figure', () => {
      expect(get(a, [0, 0], 'gl', 'figure')).toEqual(getP(0, 0));
    });
    test('Figure to Pixel', () => {
      expect(get(a, [0, 0], 'figure', 'pixel')).toEqual(getP(500, 500));
    });
    test('Pixel to Figure', () => {
      expect(get(a, [0, 0], 'pixel', 'figure')).toEqual(getP(-3, 3));
    });

    // Remaining GL
    test('GL to Pixel', () => {
      expect(get(a, [0, 0], 'gl', 'pixel')).toEqual(getP(500, 500));
    });
    test('Pixel to GL', () => {
      expect(get(a, [0, 0], 'pixel', 'gl')).toEqual(getP(-1, 1));
    });
  });
  describe('Rectangle off zero', () => {
    beforeEach(() => {
      create('rectangleOffZero');
    });
    test('Vertex to Figure', () => {
      expect(get(a, [0, 0], 'draw', 'figure')).toEqual(getP(1.768, 1.768));
    });
    test('Figure to Vertex', () => {
      expect(get(a, [0, 0], 'figure', 'draw')).toEqual(getP(-5, 0));
    });
    test('Vertex to Pixel', () => {
      expect(get(a, [0, 0], 'draw', 'pixel')).toEqual(getP(191.942, 308.058));
    });
    test('Pixel to Vertex', () => {
      expect(get(a, [0, 0], 'pixel', 'draw')).toEqual(getP(0.657, 2.828));
    });
  });
  describe('Collection in collection', () => {
    // let c;
    let cc;
    let p;
    beforeEach(() => {
      create('collectionInCollection');
      c = figure.getElement('c');
      cc = figure.getElement('c.c');
      p = figure.getElement('c.c.p');
    });
    test('Pixel', () => {
      expect(c.getPosition('pixel').round(3)).toEqual(getP(583.333, 500));
      expect(cc.getPosition('pixel').round(3)).toEqual(getP(666.667, 500));
      expect(p.getPosition('pixel').round(3)).toEqual(getP(750, 500));
      expect(c.getBoundingRect('pixel').round(3)).toEqual(
        new Rect(666.667, 416.667, 166.667, 166.667).round(3),
      );
    });
    test('Figure', () => {
      expect(c.getPosition('figure').round(3)).toEqual(getP(0.5, 0));
      expect(cc.getPosition('figure').round(3)).toEqual(getP(1, 0));
      expect(p.getPosition('figure').round(3)).toEqual(getP(1.5, 0));
      expect(c.getBoundingRect('figure').round(3)).toEqual(new Rect(1, -0.5, 1, 1));
      expect(cc.getBoundingRect('figure').round(3)).toEqual(new Rect(1, -0.5, 1, 1));
      expect(p.getBoundingRect('figure').round(3)).toEqual(new Rect(1, -0.5, 1, 1));
    });
    test('local', () => {
      expect(c.getPosition('local').round(3)).toEqual(getP(0.5, 0));
      expect(cc.getPosition('local').round(3)).toEqual(getP(0.5, 0));
      expect(p.getPosition('local').round(3)).toEqual(getP(0.5, 0));
      expect(c.getBoundingRect('local').round(3)).toEqual(new Rect(1, -0.5, 1, 1));
      expect(cc.getBoundingRect('local').round(3)).toEqual(new Rect(0.5, -0.5, 1, 1));
      expect(p.getBoundingRect('local').round(3)).toEqual(new Rect(0, -0.5, 1, 1));
    });
    test('Vertex', () => {
      expect(c.getPosition('draw').round(3)).toEqual(getP(0, 0));
      expect(cc.getPosition('draw').round(3)).toEqual(getP(0, 0));
      expect(p.getPosition('draw').round(3)).toEqual(getP(0, 0));
      expect(c.getBoundingRect('draw').round(3)).toEqual(new Rect(0.5, -0.5, 1, 1));
      expect(cc.getBoundingRect('draw').round(3)).toEqual(new Rect(0, -0.5, 1, 1));
      expect(p.getBoundingRect('draw').round(3)).toEqual(new Rect(-0.5, -0.5, 1, 1));
    });
  });
});
