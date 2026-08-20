import * as tools from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';
import { Equation } from './Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

describe('Equation element positionedBy', () => {
  let figure;
  let make;
  beforeEach(() => {
    figure = makeFigure();
    make = (forms, elements = {}) => {
      const eqn = new Equation(figure.shapes, {
        elements: {
          a: 'a',
          b: 'b',
          c: 'c',
          d: 'd',
          v: { symbol: 'vinculum' },
          lb: { symbol: 'bracket', side: 'left' },
          rb: { symbol: 'bracket', side: 'right' },
          bar: { symbol: 'bar', side: 'top' },
          int: { symbol: 'int' },
          sum: { symbol: 'sum' },
          s: { symbol: 'strike' },
          r: { symbol: 'radical' },
          ...elements,
        },
        forms,
        font: { render: 'gl' },
      });
      figure.elements.add('eqn', eqn);
      return eqn;
    };
  });
  test('Element not in a form is not positioned', () => {
    const eqn = make({ 0: ['a', 'b'] });
    expect(eqn._c.positionedBy).toBe(null);
  });
  test('Simple form', () => {
    const eqn = make({ 0: ['a', 'b'] });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: '' });
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: '' });
  });
  test('Fraction slots and symbol', () => {
    const eqn = make({ 0: [{ frac: ['a', 'v', 'b'] }, 'c'] });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'frac.numerator' });
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'frac.denominator' });
    expect(eqn._v.positionedBy).toEqual({ form: '0', with: 'frac.symbol' });
    expect(eqn._c.positionedBy).toEqual({ form: '0', with: '' });
  });
  test('Nested functions - a single content slot adds nothing', () => {
    const eqn = make({
      form1: {
        scale: {
          content: { frac: { numerator: 'a', symbol: 'v', denominator: 'b' } },
          scale: 0.5,
        },
      },
    });
    eqn.showForm('form1');
    expect(eqn._a.positionedBy).toEqual({ form: 'form1', with: 'scale.frac.numerator' });
    expect(eqn._b.positionedBy).toEqual({ form: 'form1', with: 'scale.frac.denominator' });
  });
  test('Most recent form wins', () => {
    const eqn = make({
      0: [{ frac: ['a', 'v', 'b'] }],
      1: ['a', 'b'],
    });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'frac.numerator' });
    eqn.showForm('1');
    expect(eqn._a.positionedBy).toEqual({ form: '1', with: '' });
  });
  test('Annotations', () => {
    const eqn = make({
      0: [
        { sup: ['a', 'b'] },
        { sub: ['c', 'd'] },
      ],
    });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'sup' });
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'sup.superscript' });
    expect(eqn._c.positionedBy).toEqual({ form: '0', with: 'sub' });
    expect(eqn._d.positionedBy).toEqual({ form: '0', with: 'sub.subscript' });
  });
  test('Superscript and subscript together', () => {
    const eqn = make({ 0: { supSub: ['a', 'b', 'c'] } });
    eqn.showForm('0');
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'supSub.superscript' });
    expect(eqn._c.positionedBy).toEqual({ form: '0', with: 'supSub.subscript' });
  });
  test('Glyph named by its side', () => {
    const eqn = make({ 0: { brac: ['lb', 'a', 'rb'] } });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'brac' });
    expect(eqn._lb.positionedBy).toEqual({ form: '0', with: 'brac.left' });
    expect(eqn._rb.positionedBy).toEqual({ form: '0', with: 'brac.right' });
  });
  test('Annotations of a glyph are named as if on the function', () => {
    // Both are [symbol, content, from, to]
    const eqn = make({
      0: [
        { int: ['int', 'a', 'b', 'c'] },
        { sumOf: ['sum', 'd', 'e', 'f'] },
      ],
    }, { e: 'e', f: 'f' });
    eqn.showForm('0');
    expect(eqn._int.positionedBy).toEqual({ form: '0', with: 'int.left' });
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'int' });
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'int.from' });
    expect(eqn._c.positionedBy).toEqual({ form: '0', with: 'int.to' });
    expect(eqn._sum.positionedBy).toEqual({ form: '0', with: 'sumOf.left' });
    expect(eqn._d.positionedBy).toEqual({ form: '0', with: 'sumOf' });
    expect(eqn._e.positionedBy).toEqual({ form: '0', with: 'sumOf.from' });
    expect(eqn._f.positionedBy).toEqual({ form: '0', with: 'sumOf.to' });
  });
  test('Comment', () => {
    const eqn = make({
      0: { topComment: { content: 'a', comment: 'b', symbol: 'bar' } },
    });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'topComment' });
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'topComment.comment' });
    expect(eqn._bar.positionedBy).toEqual({ form: '0', with: 'topComment.top' });
  });
  test('Root', () => {
    const eqn = make({
      0: { root: { content: 'a', symbol: 'r', root: 'b' } },
    });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'root' });
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'root.root' });
    expect(eqn._r.positionedBy).toEqual({ form: '0', with: 'root.encompass' });
  });
  test('User named annotation', () => {
    const eqn = make({
      0: {
        annotate: {
          content: 'a',
          annotations: [
            { content: 'b', name: 'label' },
            { content: 'c' },
          ],
        },
      },
    });
    eqn.showForm('0');
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'annotate.label' });
    expect(eqn._c.positionedBy).toEqual({ form: '0', with: 'annotate.1' });
  });
  test('An annotation may be named `content`', () => {
    const eqn = make({
      0: {
        annotate: {
          content: 'a',
          annotations: [{ content: 'b', name: 'content' }],
        },
      },
    });
    eqn.showForm('0');
    // `content` is a generic slot name, not a reserved word - a name the
    // caller chose is kept, and does not collide with the main content.
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'annotate' });
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'annotate.content' });
  });
  test('Matrix cells are named by row and column', () => {
    const eqn = make({
      0: { matrix: [[2, 2], 'lb', ['a', 'b', 'c', 'd'], 'rb'] },
    });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'matrix.0_0' });
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'matrix.0_1' });
    expect(eqn._c.positionedBy).toEqual({ form: '0', with: 'matrix.1_0' });
    expect(eqn._d.positionedBy).toEqual({ form: '0', with: 'matrix.1_1' });
    expect(eqn._lb.positionedBy).toEqual({ form: '0', with: 'matrix.left' });
  });
  test('Lines are named by index', () => {
    const eqn = make({
      0: { lines: { content: ['a', ['b', 'c']] } },
    });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'lines.0' });
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'lines.1' });
    expect(eqn._c.positionedBy).toEqual({ form: '0', with: 'lines.1' });
  });
  test('A single line is indexed like any other line', () => {
    const eqn = make({ 0: { lines: { content: ['a'] } } });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'lines.0' });
  });
  test('A function called directly records the same lineage as a phrase', () => {
    const eqn = make({ 0: ['a'] });
    const fns = eqn.eqn.functions;
    const frac = fns.frac.bind(fns);
    eqn.addForms({
      phrase: { frac: ['a', 'v', 'b'] },
      direct: frac(['a', 'v', 'b']),
    });
    eqn.showForm('phrase');
    expect(eqn._a.positionedBy).toEqual({ form: 'phrase', with: 'frac.numerator' });
    eqn.showForm('direct');
    expect(eqn._a.positionedBy).toEqual({ form: 'direct', with: 'frac.numerator' });
    expect(eqn._b.positionedBy).toEqual({ form: 'direct', with: 'frac.denominator' });
  });
  test('Phrases carry the lineage of the functions inside them', () => {
    const eqn = make({ 0: ['a'] });
    const fns = eqn.eqn.functions;
    const frac = fns.frac.bind(fns);
    eqn.addPhrases({
      // A phrase held as an equation phrase is re-parsed into each form...
      parsed: { frac: ['a', 'v', 'b'] },
      // ...and one held as an already-built function is duplicated into it,
      // so the duplicate has to carry the function's name and slot names too.
      built: frac(['c', 'v', 'd']),
    });
    eqn.addForms({ 1: ['parsed', 'built'] });
    eqn.showForm('1');
    expect(eqn._a.positionedBy).toEqual({ form: '1', with: 'frac.numerator' });
    expect(eqn._b.positionedBy).toEqual({ form: '1', with: 'frac.denominator' });
    expect(eqn._c.positionedBy).toEqual({ form: '1', with: 'frac.numerator' });
    expect(eqn._d.positionedBy).toEqual({ form: '1', with: 'frac.denominator' });
  });
  test('Absolute content keeps its lineage when it is re-positioned', () => {
    const eqn = make({
      0: [{
        absolute: {
          content: 'a', x: 0.1, y: 0.1, update: true,
        },
      }, 'b'],
    });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'absolute' });
    // Tracking absolute content is re-positioned every frame, outside the
    // form's own layout - which must not clear what the form recorded.
    eqn.eqn.forms['0'].updateAbsolutePositions();
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'absolute' });
  });
  test('Single content functions add only their own name', () => {
    const eqn = make({
      0: [
        { container: { content: 'a', width: 0.5 } },
        { color: { content: 'b', color: [1, 0, 0, 1] } },
        { offset: { content: 'c', offset: [0.1, 0] } },
        { box: { content: 'd', symbol: 's' } },
      ],
    });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'container' });
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'color' });
    expect(eqn._c.positionedBy).toEqual({ form: '0', with: 'offset' });
    expect(eqn._d.positionedBy).toEqual({ form: '0', with: 'box' });
  });
  test('Form ignored elements are left alone', () => {
    const eqn = make({
      0: ['a', 'b'],
      1: [{ frac: ['a', 'v', 'b'] }],
    });
    eqn.showForm('0');
    eqn._b.isFormIgnored = true;
    eqn.showForm('1');
    expect(eqn._a.positionedBy).toEqual({ form: '1', with: 'frac.numerator' });
    // `b` keeps how it was positioned when it was last laid out by a form
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: '' });
  });
  test('Strike comment', () => {
    const eqn = make({
      0: { topStrike: { content: 'a', symbol: 's', comment: 'b' } },
    });
    eqn.showForm('0');
    expect(eqn._a.positionedBy).toEqual({ form: '0', with: 'topStrike' });
    expect(eqn._b.positionedBy).toEqual({ form: '0', with: 'topStrike.comment' });
    expect(eqn._s.positionedBy).toEqual({ form: '0', with: 'topStrike.encompass' });
  });
});
