import {
  Point,
} from './Point';
import { isPointInPolygon, isPointOnPolygon } from './polygon';
// import { round } from './math';

describe('Polygon', () => {
  let closedSquare;
  let square;
  beforeEach(() => {
    closedSquare = [
      new Point(-1, -1),
      new Point(-1, 1),
      new Point(1, 1),
      new Point(1, -1),
      new Point(-1, -1),
    ];
    square = [
      new Point(-1, -1),
      new Point(-1, 1),
      new Point(1, 1),
      new Point(1, -1),
    ];
  });
  test('(0, 0) is within the closed unit square', () => {
    const p = new Point(0, 0);
    expect(isPointInPolygon(p, closedSquare)).toEqual(true);
  });
  test('(2, 2) is not within the closed unit square', () => {
    const p = new Point(2, 2);
    expect(isPointInPolygon(p, closedSquare)).toEqual(false);
  });
  test('(0, 0) is within the open unit square', () => {
    const poly = [
      new Point(-1, -1),
      new Point(-1, 1),
      new Point(1, 1),
      new Point(1, -1)];
    const p = new Point(0, 0);
    expect(isPointInPolygon(p, poly)).toEqual(true);
  });
  test('(2, 2) is not within the open unit square', () => {
    const p = new Point(2, 2);
    expect(isPointInPolygon(p, square)).toEqual(false);
  });
  test('(1, 1) is not within the open unit square', () => {
    const p = new Point(1, 1);
    expect(isPointInPolygon(p, square)).toEqual(false);
  });
  test('(1, 1) is on the corner of the open unit square', () => {
    const p = new Point(1, 1);
    expect(isPointOnPolygon(p, square)).toEqual(true);
  });
  test('1, 0 is on the side of the open unit square', () => {
    const p = new Point(1, 0);
    expect(isPointOnPolygon(p, square)).toEqual(true);
  });
  test('1, 0 is on the side of the closed unit square', () => {
    const p = new Point(1, 0);
    expect(isPointOnPolygon(p, closedSquare)).toEqual(true);
  });
  test('isOnPolygon when actually in open square', () => {
    const p = new Point(0, 0);
    expect(isPointOnPolygon(p, square)).toEqual(true);
  });
  test('isOnPolygon when actually in closed square', () => {
    const p = new Point(0, 0);
    expect(isPointOnPolygon(p, closedSquare)).toEqual(true);
  });
  test('isOnPolygon when not actually in open square', () => {
    const p = new Point(2, 2);
    expect(isPointOnPolygon(p, square)).toEqual(false);
  });
  test('isOnPolygon when not actually in closed square', () => {
    const p = new Point(2, 2);
    expect(isPointOnPolygon(p, closedSquare)).toEqual(false);
  });
});

