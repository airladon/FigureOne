import * as tools from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';
import { Equation } from './Equation';

tools.isTouchDevice = jest.fn();
jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

describe('ignoreSetColor mechanism', () => {
  let figure;
  let eqn;
  const eqnColor = [0, 0, 1, 1];   // equation default = blue
  const ownColor = [0, 1, 0, 1];   // shape's intrinsic = green
  const red = [1, 0, 0, 1];
  const grey = [0.5, 0.5, 0.5, 1];
  beforeEach(() => {
    figure = makeFigure();
    eqn = new Equation(figure.primitives, { color: eqnColor });
    eqn.addElements({
      a: 'a',
      b: { symbol: 'vinculum', color: ownColor }, // shape with its own colour
    });
    eqn.addForms({ 0: ['a', 'b'] });
    eqn.showForm('0');
  });

  // --- Collection cascade (the path preserveChildColor governs) ---
  test('no lock: equation default cascade overrides the shape', () => {
    eqn.setColor(red, true, 'form');
    expect(eqn._a.color).toEqual(red);
    expect(eqn._b.color).toEqual(red); // shape overridden
  });
  test('lock: shape ignores the equation default cascade, keeps its colour', () => {
    eqn._b.ignoreSetColor = ['form'];
    eqn.setColor(red, true, 'form');
    expect(eqn._a.color).toEqual(red);      // unlocked element still recoloured
    expect(eqn._b.color).toEqual(ownColor); // locked shape holds its colour
  });
  test('lock: explicit (untagged) setColor still controls the shape', () => {
    eqn._b.ignoreSetColor = ['form'];
    eqn.setColor(red, true, 'form');        // default cascade ignored
    expect(eqn._b.color).toEqual(ownColor);
    eqn._b.setColor(grey);                  // explicit, untagged -> honoured
    expect(eqn._b.color).toEqual(grey);
  });
  test('lock: dim/undim still work (grey-out)', () => {
    eqn._b.ignoreSetColor = ['form'];
    eqn._b.dim();
    expect(eqn._b.color).toEqual(grey);
    eqn._b.undim();
    expect(eqn._b.color).toEqual(ownColor);
  });

  // --- Form layout / color phrase path ---
  test('lock: a color phrase still recolours the shape (re-stamped explicit)', () => {
    const eqn2 = new Equation(figure.primitives, { color: eqnColor });
    eqn2.addElements({ a: 'a', b: { symbol: 'vinculum', color: ownColor } });
    eqn2._b.ignoreSetColor = ['form'];
    eqn2.addForms({ 0: [{ color: ['b', red] }, 'a'] });
    eqn2.showForm('0');
    expect(eqn2._b.color).toEqual(red);     // explicit colour phrase wins
    expect(eqn2._a.color).toEqual(eqnColor);
  });

  // --- Text elements (the most common equation element type) ---
  test('lock works on a text element, not just symbols', () => {
    const eqnT = new Equation(figure.primitives, { color: eqnColor });
    eqnT.addElements({ a: { text: 'a', color: ownColor }, b: 'b' });
    eqnT.addForms({ 0: ['a', 'b'] });
    eqnT.showForm('0');
    eqnT._a.ignoreSetColor = ['form'];
    eqnT.setColor(red, true, 'form');
    expect(eqnT._b.color).toEqual(red);      // unlocked text recoloured
    expect(eqnT._a.color).toEqual(ownColor); // locked text holds its colour
    eqnT._a.setColor(grey);                  // explicit still works on text
    expect(eqnT._a.color).toEqual(grey);
  });

  // --- API shape ---
  test('ignoreSetColor accepts a plain string', () => {
    eqn._b.ignoreSetColor = 'form';
    eqn.setColor(red, true, 'form');
    expect(eqn._b.color).toEqual(ownColor);
  });
  test('ignoreSetColor with a non-matching source is honoured', () => {
    eqn._b.ignoreSetColor = ['theme'];
    eqn.setColor(red, true, 'form');
    expect(eqn._b.color).toEqual(red);      // 'form' not in list -> not ignored
  });
});
