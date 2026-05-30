import {
  round,
} from '../../../tools/math';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';
import { Equation } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

describe('Equation Functions - Opacity', () => {
  let figure;
  let eqn;
  let elements;
  let functions;
  beforeEach(() => {
    figure = makeFigure();
    elements = {
      a: 'a',
      b: 'b',
      c: 'c',
      v: { symbol: 'vinculum' },
    };
    functions = {
      inputForms: () => {
        eqn = new Equation(figure.shapes, { color: [1, 0, 0, 1] });
        const e = eqn.eqn.functions;
        const opacity = e.opacity.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          base: {
            content: {
              opacity: {
                content: ['a', 'b', 'c'],
                opacity: 0.5,
              },
            },
          },
          // Method Object
          1: { opacity: { content: ['a', 'b', 'c'], opacity: 0.5 } },
          // Method Array
          2: { opacity: [['a', 'b', 'c'], 0.5] },
          // Function with Method Array
          3: e.opacity([['a', 'b', 'c'], 0.5]),
          // Bound Function with Object
          4: opacity([['a', 'b', 'c'], 0.5]),
          // Nested — multiplicative: 0.5 * 0.5 = 0.25
          nested: {
            opacity: {
              content: { opacity: [['a', 'b', 'c'], 0.5] },
              opacity: 0.5,
            },
          },
          // Partial — only `b` inside opacity wrapper
          partial: ['a', { opacity: ['b', 0.4] }, 'c'],
          // No opacity wrapper — leaves should stay at 1
          plain: ['a', 'b', 'c'],
          // Opacity wrapper present, but ignoreOpacity suppresses the cascade
          ignored: {
            content: { opacity: [['a', 'b', 'c'], 0.5] },
            ignoreOpacity: true,
          },
          // Opacity zero — should cascade through and apply
          zero: { opacity: [['a', 'b', 'c'], 0] },
          // Opacity wrapping a fraction — exercises glyph/content cascade
          frac: { opacity: [{ frac: ['a', 'v', 'b'] }, 0.5] },
        });
        figure.elements = eqn;
      },
    };
  });

  test('Equivalent definitions all produce 0.5 opacity', () => {
    functions.inputForms();
    const elems = [eqn._a, eqn._b, eqn._c];
    ['base', '1', '2', '3', '4'].forEach((f) => {
      eqn.showForm(f);
      figure.setFirstTransform();
      const opacities = elems.map(elem => round(elem.opacity, 4));
      expect(opacities).toEqual([0.5, 0.5, 0.5]);
    });

    eqn.showForm('base');
    figure.setFirstTransform();
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._c.transform.mat)).toMatchSnapshot();
  });

  test('Opacity zero cascades to wrapped elements', () => {
    functions.inputForms();
    eqn.showForm('zero');
    figure.setFirstTransform();
    [eqn._a, eqn._b, eqn._c].forEach((elem) => {
      expect(round(elem.opacity, 4)).toEqual(0);
    });
  });

  test('Opacity applies to glyphs and content of an annotated function', () => {
    functions.inputForms();
    eqn.showForm('frac');
    figure.setFirstTransform();
    expect(round(eqn._a.opacity, 4)).toEqual(0.5);
    expect(round(eqn._b.opacity, 4)).toEqual(0.5);
    expect(round(eqn._v.opacity, 4)).toEqual(0.5);
  });

  test('Nested opacity multiplies', () => {
    functions.inputForms();
    eqn.showForm('nested');
    figure.setFirstTransform();
    const opacities = [eqn._a, eqn._b, eqn._c].map(elem => round(elem.opacity, 4));
    expect(opacities).toEqual([0.25, 0.25, 0.25]);
  });

  test('Partial opacity only affects wrapped content', () => {
    functions.inputForms();
    eqn.showForm('partial');
    figure.setFirstTransform();
    expect(round(eqn._a.opacity, 4)).toEqual(1);
    expect(round(eqn._b.opacity, 4)).toEqual(0.4);
    expect(round(eqn._c.opacity, 4)).toEqual(1);
  });

  test('No opacity wrapper leaves opacity at default', () => {
    functions.inputForms();
    eqn.showForm('plain');
    figure.setFirstTransform();
    [eqn._a, eqn._b, eqn._c].forEach((elem) => {
      expect(round(elem.opacity, 4)).toEqual(1);
    });
  });

  test('No opacity wrapper preserves externally-set opacities', () => {
    functions.inputForms();
    eqn._a.setOpacity(0.3);
    eqn._b.setOpacity(0.4);
    eqn._c.setOpacity(0.5);
    eqn.showForm('plain');
    figure.setFirstTransform();
    expect(round(eqn._a.opacity, 4)).toEqual(0.3);
    expect(round(eqn._b.opacity, 4)).toEqual(0.4);
    expect(round(eqn._c.opacity, 4)).toEqual(0.5);
  });

  test('Partial wrapper preserves opacity on unwrapped siblings', () => {
    functions.inputForms();
    eqn._a.setOpacity(0.3);
    eqn._c.setOpacity(0.5);
    eqn.showForm('partial');
    figure.setFirstTransform();
    // 'b' is inside the opacity wrapper (0.4), so it gets overridden
    expect(round(eqn._b.opacity, 4)).toEqual(0.4);
    // 'a' and 'c' are outside, so their externally-set opacities are preserved
    expect(round(eqn._a.opacity, 4)).toEqual(0.3);
    expect(round(eqn._c.opacity, 4)).toEqual(0.5);
  });

  test('ignoreOpacity suppresses the cascade even with opacity wrapper', () => {
    functions.inputForms();
    // Externally set opacities first; cascade should not stomp them
    eqn._a.setOpacity(0.2);
    eqn._b.setOpacity(0.2);
    eqn._c.setOpacity(0.2);
    eqn.showForm('ignored');
    figure.setFirstTransform();
    [eqn._a, eqn._b, eqn._c].forEach((elem) => {
      expect(round(elem.opacity, 4)).toEqual(0.2);
    });
  });
});
