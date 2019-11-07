import {
  DiagramElementPrimitive,
  DiagramElementCollection,
} from '../Element';
import {
  Point, Transform,
} from '../../tools/g2';
import webgl from '../../__mocks__/WebGLInstanceMock';
import VertexPolygon from '../DrawingObjects/VertexObject/VertexPolygon';

const makeSquare = () => {
  const square = new VertexPolygon([webgl], 4, 1, 0.01, 0, Point.zero());
  const element = new DiagramElementPrimitive(
    square,
    new Transform(),
    [0, 0, 1, 1],
  );
  return element;
};

const makeCollection = () => {
  const collection = new DiagramElementCollection();
  const squares = new DiagramElementCollection();
  const square1 = makeSquare();
  const square2 = makeSquare();
  const square3 = makeSquare();
  squares.add('s1', square1);
  squares.add('s2', square2);
  collection.add('squares', squares);
  collection.add('s3', square3);
  return collection;
};

describe('GetElement', () => {
  test('Primitive', () => {
    const element = makeSquare();
    const got = element.getElement();
    expect(got).toBe(element);
  });
  describe('Collections', () => {
    let collection;
    beforeEach(() => {
      collection = makeCollection();
    });
    test('Get self', () => {
      expect(collection.getElement()).toBe(collection);
    });
    test('Get with underscore', () => {
      expect(collection.getElement('_s3')).toBe(collection._s3);
    });
    test('Get without underscore', () => {
      expect(collection.getElement('s3')).toBe(collection._s3);
    });
    test('Get with nested', () => {
      expect(collection.getElement('squares.s1')).toBe(collection._squares._s1);
    });
    test('Get invalid', () => {
      expect(collection.getElement('squares.s5')).toBe(null);
    });
  });
});
