import {
  Point, Line,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

jest.useFakeTimers();


describe('Set Position with Bounds', () => {
  let diagram;
  let a;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
        options: {
          radius: 1,
        },
      },
    ]);
    a = diagram.elements._a;
    diagram.initialize();
  });
  test('No Bounds', () => {
    a.setPosition(100, 0);
    expect(a.getPosition().round(3).x).toBe(100);
  });
  test('Rect Bounds', () => {
    a.move.bounds.updateTranslation({
      left: -10, bottom: -20, right: 30, top: 40,
    });
    a.setPosition(100, 0);
    expect(a.getPosition().round(3)).toEqual(new Point(30, 0));
    a.setPosition(100, 100);
    expect(a.getPosition().round(3)).toEqual(new Point(30, 40));
    a.setPosition(-100, -100);
    expect(a.getPosition().round(3)).toEqual(new Point(-10, -20));
  });
  test('0 Height Rect', () => {
    a.move.bounds.updateTranslation({
      left: -10, bottom: 0, right: 20, top: 0,
    });
    a.setPosition(100, 0);
    expect(a.getPosition().round(3)).toEqual(new Point(20, 0));
    a.setPosition(100, 100);
    expect(a.getPosition().round(3)).toEqual(new Point(20, 0));
    a.setPosition(-100, -100);
    expect(a.getPosition().round(3)).toEqual(new Point(-10, 0));
  });
  test('0 Width Rect', () => {
    a.move.bounds.updateTranslation({
      left: 0, bottom: -10, right: 0, top: 20,
    });
    a.setPosition(100, 0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    a.setPosition(100, 100);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 20));
    a.setPosition(-100, -100);
    expect(a.getPosition().round(3)).toEqual(new Point(0, -10));
  });
  test('Line Bounds - Horiztonal', () => {
    a.move.bounds.updateTranslation({
      line: new Line([-10, 0], [20, 0]),
    });
    a.setPosition(100, 0);
    expect(a.getPosition().round(3)).toEqual(new Point(20, 0));
    a.setPosition(100, 100);
    expect(a.getPosition().round(3)).toEqual(new Point(20, 0));
    a.setPosition(-100, -100);
    expect(a.getPosition().round(3)).toEqual(new Point(-10, 0));
  });
  test('Line Bounds - Vertical', () => {
    a.move.bounds.updateTranslation({
      line: new Line([0, -10], [0, 20]),
    });
    a.setPosition(100, 0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    a.setPosition(100, 100);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 20));
    a.setPosition(-100, -100);
    expect(a.getPosition().round(3)).toEqual(new Point(0, -10));
  });
  test('Line Bounds - Diagonal', () => {
    a.move.bounds.updateTranslation({
      line: new Line([-10, -10], [10, 10]),
    });
    a.setPosition(100, 0);
    expect(a.getPosition().round(3)).toEqual(new Point(10, 10));
    a.setPosition(100, 100);
    expect(a.getPosition().round(3)).toEqual(new Point(10, 10));
    a.setPosition(-100, -100);
    expect(a.getPosition().round(3)).toEqual(new Point(-10, -10));
    a.setPosition(5, 0);
    expect(a.getPosition().round(3)).toEqual(new Point(2.5, 2.5));
  });
});
