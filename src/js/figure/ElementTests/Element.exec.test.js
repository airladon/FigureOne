import {
  FigureElementCollection,
} from '../Element';
// import { AnimationPhase } from './AnimationPhase';
// import {
//   Point, Transform,
// } from '../../tools/g2';
import makeFigure from '../../__mocks__/makeFigure';

const mockDone = jest.fn(() => {});

const makeSquare = () => {
  const figure = makeFigure();
  const element = figure.shapes.polygon({ sides: 4, radius: 1, color: [0, 0, 1, 1] });
  return element;
};

const makeCollection = () => {
  const collection = new FigureElementCollection();
  const squares = new FigureElementCollection();
  const square1 = makeSquare();
  const square2 = makeSquare();
  const square3 = makeSquare();
  squares.add('s1', square1);
  squares.add('s2', square2);
  collection.add('squares', squares);
  collection.add('s3', square3);
  return collection;
};

describe('ElementExec', () => {
  test('Primitive', () => {
    const element = makeSquare();
    expect(element.opacity).toBe(1);
    element.exec(['setOpacity', 0.5], mockDone);
    expect(element.opacity).toBe(0.5);
  });
  test('Primitive - incorrect function', () => {
    const element = makeSquare();
    element.exec(['setOpacity1', 0.5], mockDone);
  });
  describe('Collections', () => {
    let collection;
    beforeEach(() => {
      collection = makeCollection();
    });
    test('Exec collection', () => {
      expect(collection.opacity).toBe(1);
      collection.exec(['setOpacity', 0.5]);
      expect(collection.opacity).toBe(0.5);
    });
    test('Exec collection with null', () => {
      expect(collection.opacity).toBe(1);
      collection.exec(['setOpacity', 0.5], null);
      expect(collection.opacity).toBe(0.5);
    });
    test('Exec collection with empty array', () => {
      expect(collection.opacity).toBe(1);
      collection.exec(['setOpacity', 0.5], []);
      expect(collection.opacity).toBe(1);
    });
    test('Exec some elements', () => {
      expect(collection.opacity).toBe(1);
      expect(collection._s3.opacity).toBe(1);
      expect(collection._squares._s1.opacity).toBe(1);
      expect(collection._squares._s2.opacity).toBe(1);
      collection.exec(['setOpacity', 0.5], ['squares.s1', '_s3']);
      expect(collection.opacity).toBe(1);
      expect(collection._s3.opacity).toBe(0.5);
      expect(collection._squares._s1.opacity).toBe(0.5);
      expect(collection._squares._s2.opacity).toBe(1);
    });
  });
});
