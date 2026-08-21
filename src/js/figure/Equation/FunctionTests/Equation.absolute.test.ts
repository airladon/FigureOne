import {
  Point,
} from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

describe('Equation Functions - Absolute', () => {
  let figure;
  let eqn;
  let addEqn;

  beforeEach(() => {
    figure = makeFigure();
    addEqn = (forms, options = {}) => {
      figure.add([{
        name: 'eqn',
        make: 'equation',
        options: {
          elements: {
            a: 'a',
            b: 'b',
            c: 'c',
            d: 'd',
            n: 'n',
            m: 'm',
            v: { symbol: 'vinculum' },
          },
          forms,
          ...options,
        },
      }]);
      eqn = figure.elements._eqn;
    };
  });

  describe('Layout', () => {
    test('Absolute content does not contribute to the layout', () => {
      addEqn({
        without: ['a', 'b', 'c'],
        with: [
          'a',
          { absolute: { content: 'd', x: 1, y: 1 } },
          'b',
          'c',
        ],
      });
      eqn.showForm('without');
      figure.setFirstTransform();
      const withoutA = eqn._a.getBoundingRect('local');
      const withoutB = eqn._b.getBoundingRect('local');
      const withoutC = eqn._c.getBoundingRect('local');

      eqn.showForm('with');
      figure.setFirstTransform();
      expect(round(eqn._a.getBoundingRect('local').left, 5))
        .toEqual(round(withoutA.left, 5));
      expect(round(eqn._b.getBoundingRect('local').left, 5))
        .toEqual(round(withoutB.left, 5));
      expect(round(eqn._c.getBoundingRect('local').left, 5))
        .toEqual(round(withoutC.left, 5));
      // The absolute content is still shown
      expect(eqn._d.isShown).toBe(true);
    });

    test('Absolute content is not moved by the form alignment', () => {
      addEqn({
        left: {
          content: ['a', 'b', 'c', { absolute: { content: 'd', x: 0.5, y: 0.3 } }],
          alignment: { xAlign: 'left', yAlign: 'baseline' },
        },
        center: {
          content: ['a', 'b', 'c', { absolute: { content: 'd', x: 0.5, y: 0.3 } }],
          alignment: { xAlign: 'center', yAlign: 'middle' },
        },
      });
      eqn.showForm('left');
      figure.setFirstTransform();
      const leftA = eqn._a.getBoundingRect('local');
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(0.5);
      expect(round(eqn._d.getPosition('local').y, 5)).toEqual(0.3);

      eqn.showForm('center');
      figure.setFirstTransform();
      // The rest of the equation is realigned...
      expect(round(eqn._a.getBoundingRect('local').left, 5))
        .not.toEqual(round(leftA.left, 5));
      // ...but the absolute content stays where it was pinned
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(0.5);
      expect(round(eqn._d.getPosition('local').y, 5)).toEqual(0.3);
    });
  });

  describe('Local space', () => {
    test('Coordinate position with default alignment', () => {
      addEqn({
        0: ['a', { absolute: { content: 'd', x: -0.4, y: 0.25 } }],
      });
      eqn.showForm('0');
      figure.setFirstTransform();
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(-0.4);
      expect(round(eqn._d.getPosition('local').y, 5)).toEqual(0.25);
    });

    test('xAlign and yAlign', () => {
      addEqn({
        base: ['a', { absolute: { content: 'd', x: 0.5, y: 0.3 } }],
        right: {
          content: ['a', {
            absolute: {
              content: 'd', x: 0.5, y: 0.3, xAlign: 'right', yAlign: 'top',
            },
          }],
        },
        center: {
          content: ['a', {
            absolute: {
              content: 'd', x: 0.5, y: 0.3, xAlign: 'center', yAlign: 'middle',
            },
          }],
        },
        bottom: {
          content: ['a', {
            absolute: {
              content: 'd', x: 0.5, y: 0.3, xAlign: 'left', yAlign: 'bottom',
            },
          }],
        },
        multiplier: {
          content: ['a', {
            absolute: {
              content: 'd', x: 0.5, y: 0.3, xAlign: 0.25, yAlign: 0.25,
            },
          }],
        },
      });
      eqn.showForm('base');
      figure.setFirstTransform();
      const r = eqn._d.getRelativeBoundingRect('local');

      eqn.showForm('right');
      figure.setFirstTransform();
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(round(0.5 - r.width, 5));
      expect(round(eqn._d.getPosition('local').y, 5)).toEqual(round(0.3 - r.top, 5));

      eqn.showForm('center');
      figure.setFirstTransform();
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(round(0.5 - r.width / 2, 5));
      expect(round(eqn._d.getPosition('local').y, 5))
        .toEqual(round(0.3 - r.bottom - (r.top - r.bottom) / 2, 5));

      eqn.showForm('bottom');
      figure.setFirstTransform();
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(0.5);
      expect(round(eqn._d.getPosition('local').y, 5)).toEqual(round(0.3 - r.bottom, 5));

      eqn.showForm('multiplier');
      figure.setFirstTransform();
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(round(0.5 - r.width * 0.25, 5));
      expect(round(eqn._d.getPosition('local').y, 5))
        .toEqual(round(0.3 - r.bottom - (r.top - r.bottom) * 0.25, 5));
    });

    test('Array form with null placeholders uses the defaults', () => {
      addEqn({
        // unit, space, xAlign, yAlign, update and fullContentBounds are all
        // null placeholders, so each must fall back to its default
        0: ['a', { absolute: ['d', 0.5, 0.3, null, null, null, null, null, null] }],
      });
      eqn.showForm('0');
      figure.setFirstTransform();
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(0.5);
      expect(round(eqn._d.getPosition('local').y, 5)).toEqual(0.3);
    });

    test('yAlign baseline places composite content on the equation baseline', () => {
      // A fraction is composite content whose wrapper origin is its baseline.
      // Placing it inline in a form puts that baseline at y = 0 (the form's
      // default 'baseline' alignment); pinning it with yAlign: 'baseline' at
      // y = 0 must land it in exactly the same place.
      addEqn({
        inline: ['a', { frac: ['n', 'v', 'm'] }],
        pinned: [
          'a',
          {
            absolute: {
              content: { frac: ['n', 'v', 'm'] },
              x: 0,
              y: 0,
              yAlign: 'baseline',
            },
          },
        ],
      });
      eqn.showForm('inline');
      figure.setFirstTransform();
      const inlineNum = eqn._n.getPosition('local');
      const inlineDen = eqn._m.getPosition('local');
      const inlineVin = eqn._v.getPosition('local');

      eqn.showForm('pinned');
      figure.setFirstTransform();
      // Same vertical placement relative to the baseline, for every part
      expect(round(eqn._n.getPosition('local').y, 5)).toEqual(round(inlineNum.y, 5));
      expect(round(eqn._m.getPosition('local').y, 5)).toEqual(round(inlineDen.y, 5));
      expect(round(eqn._v.getPosition('local').y, 5)).toEqual(round(inlineVin.y, 5));
    });

    test('A space that is neither a name nor a FigureElement is rejected', () => {
      expect(() => {
        addEqn({
          0: ['a', {
            absolute: {
              content: 'd', x: 0, y: 0, space: { not: 'an element' },
            },
          }],
        });
      }).toThrow(/space must be/);
    });

    test('Percent of the form bounds', () => {
      addEqn({
        0: [
          'a', 'b', 'c',
          {
            absolute: {
              content: 'd', x: 1, y: 1, unit: 'percent',
            },
          },
        ],
      });
      eqn.showForm('0');
      figure.setFirstTransform();
      const form = eqn.getCurrentForm();
      const bounds = form.getBounds();
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(round(bounds.right, 5));
      expect(round(eqn._d.getPosition('local').y, 5)).toEqual(round(bounds.top, 5));
    });
  });

  describe('Figure space', () => {
    test('Coordinate position is independent of the equation position', () => {
      addEqn({
        0: [
          'a', 'b',
          {
            absolute: {
              content: 'd', x: 0.2, y: -0.1, space: 'figure',
            },
          },
        ],
      }, { position: [0.7, 0.4] });
      eqn.showForm('0');
      figure.setFirstTransform();
      const p = eqn._d.getPosition('figure');
      expect(round(p.x, 5)).toEqual(0.2);
      expect(round(p.y, 5)).toEqual(-0.1);
    });

    test('Percent of the scene', () => {
      addEqn({
        0: [
          'a',
          {
            absolute: {
              content: 'd', x: 0, y: 1, unit: 'percent', space: 'figure',
            },
          },
        ],
      }, { position: [0.3, -0.2] });
      eqn.showForm('0');
      figure.setFirstTransform();
      const { scene } = figure;
      const p = eqn._d.getPosition('figure');
      expect(round(p.x, 5)).toEqual(round(scene.left, 5));
      expect(round(p.y, 5)).toEqual(round(scene.top, 5));
    });

    test('Equation scale does not scale the position', () => {
      addEqn({
        0: [
          'a',
          {
            absolute: {
              content: 'd', x: 0.2, y: -0.1, space: 'figure',
            },
          },
        ],
      }, { position: [0.7, 0.4], scale: 1 });
      eqn.setScale(2);
      eqn.showForm('0');
      figure.setFirstTransform();
      const p = eqn._d.getPosition('figure');
      expect(round(p.x, 5)).toEqual(0.2);
      expect(round(p.y, 5)).toEqual(-0.1);
    });
  });

  describe('Element space', () => {
    test('Position is in the target element draw space', () => {
      figure.add([{
        name: 'ref',
        make: 'polygon',
        radius: 0.1,
        position: [-0.5, 0.25],
      }]);
      addEqn({
        0: [
          'a',
          {
            absolute: {
              content: 'd', x: 0.1, y: 0.05, space: 'ref',
            },
          },
        ],
      }, { position: [0.7, 0.4] });
      eqn.showForm('0');
      figure.setFirstTransform();
      const p = eqn._d.getPosition('figure');
      expect(round(p.x, 5)).toEqual(round(-0.5 + 0.1, 5));
      expect(round(p.y, 5)).toEqual(round(0.25 + 0.05, 5));
    });

    test('Target element inside the same equation, with a realigned form', () => {
      addEqn({
        0: {
          content: ['a', 'b', 'c', {
            absolute: {
              content: 'd', x: 0, y: 0, space: 'b',
            },
          }],
          alignment: { xAlign: 'center', yAlign: 'middle' },
        },
      });
      eqn.showForm('0');
      figure.setFirstTransform();
      // `b` is laid out by the same form, and the form is then offset as a
      // whole for its alignment - the pin must use b's final position
      const b = eqn._b.getPosition('local');
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(round(b.x, 5));
      expect(round(eqn._d.getPosition('local').y, 5)).toEqual(round(b.y, 5));
    });

    test('Resolves after a direct form.arrange with no outer setPositions', () => {
      addEqn({
        0: ['a', 'b', 'c', {
          absolute: {
            content: 'd', x: 0, y: 0, space: 'b',
          },
        }],
      });
      eqn.showForm('0');
      figure.setFirstTransform();
      // EquationLabel and Equation.setPosition realign a form by calling
      // arrange() directly, so the resolve must be correct at the end of it
      eqn.getCurrentForm().arrange(1, 'right', 'top', new Point(0, 0));
      figure.setFirstTransform();
      const b = eqn._b.getPosition('local');
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(round(b.x, 5));
      expect(round(eqn._d.getPosition('local').y, 5)).toEqual(round(b.y, 5));
    });

    test('Retries when the target element is added after the equation', () => {
      addEqn({
        0: [
          'a',
          {
            absolute: {
              content: 'd', x: 0, y: 0, space: 'ref',
            },
          },
        ],
      });
      eqn.showForm('0');
      figure.setFirstTransform();
      // 'ref' does not exist yet, so the content is left in the layout flow
      const unresolved = eqn._d.getPosition('figure');

      figure.add([{
        name: 'ref', make: 'polygon', radius: 0.1, position: [-0.5, 0.25],
      }]);
      figure.drawNow(0);
      const p = eqn._d.getPosition('figure');
      expect(round(p.x, 5)).not.toEqual(round(unresolved.x, 5));
      expect(round(p.x, 5)).toEqual(-0.5);
      expect(round(p.y, 5)).toEqual(0.25);
    });

    test('Percent of the target element bounding rect', () => {
      figure.add([{
        name: 'ref',
        make: 'rectangle',
        width: 0.4,
        height: 0.2,
        position: [-0.5, 0.25],
      }]);
      addEqn({
        0: [
          'a',
          {
            absolute: {
              content: 'd', x: 1, y: 1, unit: 'percent', space: 'ref',
            },
          },
        ],
      });
      eqn.showForm('0');
      figure.setFirstTransform();
      const r = figure.elements._ref.getBoundingRect('figure');
      const p = eqn._d.getPosition('figure');
      expect(round(p.x, 5)).toEqual(round(r.right, 5));
      expect(round(p.y, 5)).toEqual(round(r.top, 5));
    });
  });

  describe('Update', () => {
    test('Position tracks the equation when update is true', () => {
      addEqn({
        0: [
          'a',
          {
            absolute: {
              content: 'd', x: 0.2, y: -0.1, space: 'figure', update: true,
            },
          },
        ],
      }, { position: [0.7, 0.4] });
      eqn.showForm('0');
      figure.setFirstTransform();
      expect(round(eqn._d.getPosition('figure').x, 5)).toEqual(0.2);

      eqn.setPosition(-0.3, 0.1);
      figure.drawNow(0);
      const p = eqn._d.getPosition('figure');
      expect(round(p.x, 5)).toEqual(0.2);
      expect(round(p.y, 5)).toEqual(-0.1);
    });

    test('Position is fixed in the equation when update is false', () => {
      addEqn({
        0: [
          'a',
          {
            absolute: {
              content: 'd', x: 0.2, y: -0.1, space: 'figure',
            },
          },
        ],
      }, { position: [0.7, 0.4] });
      eqn.showForm('0');
      figure.setFirstTransform();
      const local = eqn._d.getPosition('local');

      eqn.setPosition(-0.3, 0.1);
      figure.drawNow(0);
      // Unresolved - the content keeps the position it was given in the
      // equation, so it moves with the equation
      expect(round(eqn._d.getPosition('local').x, 5)).toEqual(round(local.x, 5));
      expect(round(eqn._d.getPosition('figure').x, 5)).not.toEqual(0.2);
    });
  });
});
