import {
  FigureElementCollection,
} from '../Element';
// import {
//   Point, Transform,
// } from '../../tools/g2';
import makeFigure from '../../__mocks__/makeFigure';

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

describe('Dim', () => {
  test('Primitive', () => {
    const element = makeSquare();
    expect(element.color).toEqual([0, 0, 1, 1]);
    element.dim();
    expect(element.color).toEqual(element.dimColor);
  });
  describe('Collections', () => {
    let collection;
    beforeEach(() => {
      collection = makeCollection();
    });
    test('Entire Collection', () => {
      expect(collection.color).not.toEqual(collection.dimColor);
      expect(collection._s3.color).not.toEqual(collection._s3.dimColor);
      expect(collection._squares._s1.color)
        .not.toEqual(collection._squares._s1.dimColor);
      expect(collection._squares._s2.color)
        .not.toEqual(collection._squares._s2.dimColor);

      collection.dim();

      expect(collection.color).toEqual(collection.dimColor);
      expect(collection._s3.color).toEqual(collection._s3.dimColor);
      expect(collection._squares._s1.color).toEqual(collection._squares._s1.dimColor);
      expect(collection._squares._s2.color).toEqual(collection._squares._s2.dimColor);
    });
    test('Parts of the Collection', () => {
      expect(collection.color).not.toEqual(collection.dimColor);
      expect(collection._s3.color).not.toEqual(collection._s3.dimColor);
      expect(collection._squares._s1.color)
        .not.toEqual(collection._squares._s1.dimColor);
      expect(collection._squares._s2.color)
        .not.toEqual(collection._squares._s2.dimColor);

      collection.dim(['s3', 'squares.s1']);

      expect(collection.color).not.toEqual(collection.dimColor);
      expect(collection._s3.color).toEqual(collection._s3.dimColor);
      expect(collection._squares._s1.color).toEqual(collection._squares._s1.dimColor);
      expect(collection._squares._s2.color).not.toEqual(collection._squares._s2.dimColor);
    });
  });
});
