import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';
import { Equation } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

describe('Equation Functions - Front and Back', () => {
  let figure;
  let eqn;
  let elements;
  let order;
  beforeEach(() => {
    figure = makeFigure();
    elements = {
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd',
      v: { symbol: 'vinculum' },
    };
    const inputForms = () => {
      eqn = new Equation(figure.shapes, { color: [1, 0, 0, 1] });
      const e = eqn.eqn.functions;
      const back = e.back.bind(e);
      const front = e.front.bind(e);
      eqn.addElements(elements);
      eqn.addForms({
        // No front/back wrapper — natural definition order
        plain: ['a', 'b', 'c'],
        // Send `b` completely to the back
        bBackFull: ['a', { back: ['b'] }, 'c'],
        // Bring `a` completely to the front
        aFrontFull: [{ front: ['a'] }, 'b', 'c'],
        // Send `c` back one place
        cBack1: ['a', 'b', { back: { content: 'c', num: 1 } }],
        // Bring `a` forward one place
        aFront1: [{ front: { content: 'a', num: 1 } }, 'b', 'c'],
        // Negative num: `c` to one place ahead of the full back
        cBackNeg1: ['a', 'b', { back: { content: 'c', num: -1 } }],
        // Negative num: `a` to one place behind the full front
        aFrontNeg1: [{ front: { content: 'a', num: -1 } }, 'b', 'c'],
        // Equivalent definition styles to bBackFull
        bBackObject: ['a', { back: { content: 'b' } }, 'c'],
        bBackArray: ['a', { back: [['b'], null] }, 'c'],
        bBackFn: ['a', back(['b']), 'c'],
        aFrontFn: [front(['a']), 'b', 'c'],
        // Nesting — inner back flips b ahead of a first, then outer back moves
        // the reordered [b,a] group as a unit
        nested: [{ back: [['a', { back: ['b'] }]] }, 'c'],
        // Group move preserves relative order (a before b, not reversed)
        groupBack: [{ back: [['a', 'b']] }, 'c'],
        // before anchor — position `d` just before (behind) `c`
        beforeAnchor: ['a', 'b', 'c', { back: { content: 'd', before: 'c' } }],
        // before anchor with num — one further back than just-before `c`
        beforeAnchorNum: ['a', 'b', 'c', { back: { content: 'd', before: 'c', num: 1 } }],
        // after anchor — position `a` just after (in front of) `c`
        afterAnchor: [{ front: { content: 'a', after: 'c' } }, 'b', 'c', 'd'],
        // before anchor list — position `d` before the most-back of [b, c]
        beforeList: ['a', 'b', 'c', { back: { content: 'd', before: ['c', 'b'] } }],
        // elementMods — send a to back, then b to back (b ends furthest back)
        modBack: {
          content: ['a', 'b', 'c'],
          elementMods: {
            a: { back: {} },
            b: { back: {} },
          },
        },
        // elementMods — send c back one place via num
        modBackNum: {
          content: ['a', 'b', 'c'],
          elementMods: {
            c: { back: { num: 1 } },
          },
        },
        // elementMods front/back combined with a normal (color) mod
        modMixed: {
          content: ['a', 'b', 'c'],
          elementMods: {
            c: { front: {}, color: [0, 1, 0, 1] },
          },
        },
        // elementMods before anchor — position `d` just before `b`
        modBefore: {
          content: ['a', 'b', 'c', 'd'],
          elementMods: {
            d: { back: { before: 'b' } },
          },
        },
      });
      figure.elements = eqn;
    };
    inputForms();
    // Helper: index of an element name in the equation's draw stack
    order = name => eqn.drawOrder.indexOf(name);
  });

  const show = (form) => {
    eqn.showForm(form);
    figure.setFirstTransform();
  };

  test('Natural order from a plain form', () => {
    show('plain');
    expect(order('a')).toBeLessThan(order('b'));
    expect(order('b')).toBeLessThan(order('c'));
  });

  test('back with no num sends element completely to the back', () => {
    show('bBackFull');
    // `b` should be drawn before (behind) both `a` and `c`
    expect(order('b')).toBeLessThan(order('a'));
    expect(order('b')).toBeLessThan(order('c'));
  });

  test('front with no num brings element completely to the front', () => {
    show('aFrontFull');
    // `a` should be drawn after (in front of) both `b` and `c`
    expect(order('a')).toBeGreaterThan(order('b'));
    expect(order('a')).toBeGreaterThan(order('c'));
  });

  test('back with num sends element back that many places', () => {
    show('cBack1');
    // Natural a,b,c -> c moves back one place -> a,c,b
    expect(order('a')).toBeLessThan(order('c'));
    expect(order('c')).toBeLessThan(order('b'));
  });

  test('front with num brings element forward that many places', () => {
    show('aFront1');
    // Natural a,b,c -> a moves forward one place -> b,a,c
    expect(order('b')).toBeLessThan(order('a'));
    expect(order('a')).toBeLessThan(order('c'));
  });

  test('Negative back num positions ahead of the full back', () => {
    show('cBackNeg1');
    // Natural a,b,c,(v) -> c one place ahead of the full back -> a,c,b,(v)
    expect(order('a')).toBeLessThan(order('c'));
    expect(order('c')).toBeLessThan(order('b'));
    expect(order('c')).toBeLessThan(order('v'));
  });

  test('Negative front num positions behind the full front', () => {
    show('aFrontNeg1');
    // Natural a,b,c,(v) -> a one place behind the full front -> b,c,a,(v)
    expect(order('b')).toBeLessThan(order('a'));
    expect(order('c')).toBeLessThan(order('a'));
    expect(order('a')).toBeLessThan(order('v'));
  });

  test('Equivalent back definitions all send b to the back', () => {
    ['bBackFull', 'bBackObject', 'bBackArray', 'bBackFn'].forEach((form) => {
      show('plain');
      show(form);
      expect(order('b')).toBeLessThan(order('a'));
      expect(order('b')).toBeLessThan(order('c'));
    });
  });

  test('Bound front function brings a to the front', () => {
    show('aFrontFn');
    expect(order('a')).toBeGreaterThan(order('b'));
    expect(order('a')).toBeGreaterThan(order('c'));
  });

  test('Relative move is deterministic across repeated showings', () => {
    show('cBack1');
    const first = eqn.drawOrder.slice();
    show('cBack1');
    show('cBack1');
    expect(eqn.drawOrder).toEqual(first);
  });

  test('Each front/back form resets to the natural order', () => {
    // bBackFull moves b to the very back
    show('bBackFull');
    expect(order('b')).toBeLessThan(order('a'));
    // aFrontFull should start from the natural order, so b returns to between
    // a and c rather than staying at the back
    show('aFrontFull');
    expect(order('b')).toBeLessThan(order('c'));
    expect(order('a')).toBeGreaterThan(order('b'));
    expect(order('a')).toBeGreaterThan(order('c'));
  });

  test('A plain form restores the natural order (color-like)', () => {
    // Natural order: a behind b
    show('plain');
    expect(order('a')).toBeLessThan(order('b'));
    // A front/back form reorders
    show('aFrontFull');
    expect(order('a')).toBeGreaterThan(order('b'));
    // Returning to a plain form restores the natural order
    show('plain');
    expect(order('a')).toBeLessThan(order('b'));
    expect(order('b')).toBeLessThan(order('c'));
  });

  test('elementMods back sends elements back in definition order', () => {
    show('modBack');
    // a sent back, then b sent back -> b ends furthest back
    expect(order('b')).toBeLessThan(order('a'));
    expect(order('a')).toBeLessThan(order('c'));
  });

  test('elementMods back with num moves the set number of places', () => {
    show('modBackNum');
    // Natural a,b,c -> c back one place -> a,c,b
    expect(order('a')).toBeLessThan(order('c'));
    expect(order('c')).toBeLessThan(order('b'));
  });

  test('elementMods front combines with other (color) mods', () => {
    show('modMixed');
    // c brought to front
    expect(order('c')).toBeGreaterThan(order('a'));
    expect(order('c')).toBeGreaterThan(order('b'));
    // the color mod is still applied, and `front` is not set as a property
    expect(eqn._c.color).toEqual([0, 1, 0, 1]);
    expect(eqn._c.front).toBeUndefined();
  });

  test('elementMods draw order is deterministic across repeated showings', () => {
    show('modBackNum');
    const first = eqn.drawOrder.slice();
    show('modBackNum');
    show('modBackNum');
    expect(eqn.drawOrder).toEqual(first);
  });

  test('Nested front/back applies inner-most first', () => {
    // inner `back b` flips b ahead of a; outer `back [a,b]` then moves the
    // reordered group as a unit -> b before a, both behind c
    show('nested');
    expect(order('b')).toBeLessThan(order('a'));
    expect(order('a')).toBeLessThan(order('c'));
  });

  test('Group move preserves relative order (not reversed)', () => {
    show('groupBack');
    // a and b sent to back as a group; a stays before b
    expect(order('a')).toBeLessThan(order('b'));
    expect(order('b')).toBeLessThan(order('c'));
  });

  test('before anchor positions the group just behind the anchor', () => {
    show('beforeAnchor');
    // d placed just before c -> a,b,d,c
    expect(order('d')).toBeLessThan(order('c'));
    expect(order('d')).toBeGreaterThan(order('b'));
    expect(order('c') - order('d')).toBe(1);
  });

  test('before anchor with num shifts further back', () => {
    show('beforeAnchorNum');
    // one place further back than just-before c -> a,d,b,c
    expect(order('d')).toBeLessThan(order('b'));
    expect(order('d')).toBeGreaterThan(order('a'));
  });

  test('after anchor positions the group just in front of the anchor', () => {
    show('afterAnchor');
    // a placed just after c -> b,c,a,d
    expect(order('a')).toBeGreaterThan(order('c'));
    expect(order('a')).toBeLessThan(order('d'));
    expect(order('a') - order('c')).toBe(1);
  });

  test('before anchor list uses the most-back anchor', () => {
    show('beforeList');
    // most-back of [c, b] is b -> d placed just before b -> a,d,b,c
    expect(order('d')).toBeLessThan(order('b'));
    expect(order('d')).toBeGreaterThan(order('a'));
  });

  test('elementMods before anchor positions relative to the anchor', () => {
    show('modBefore');
    // d placed just before b -> a,d,b,c
    expect(order('d')).toBeLessThan(order('b'));
    expect(order('d')).toBeGreaterThan(order('a'));
    expect(order('b') - order('d')).toBe(1);
  });
});
