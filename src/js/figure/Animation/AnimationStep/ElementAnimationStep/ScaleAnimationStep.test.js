import * as tools from '../../../../tools/tools';
import makeFigure from '../../../../__mocks__/makeFigure';
// import * as math from '../../../../tools/math';
import { Point } from '../../../../tools/g2';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Scale Animation Step', () => {
  let elem1;
  let tester;
  beforeEach(() => {
    const figure = makeFigure();
    elem1 = figure.collections.line();
    elem1.setScale(1, 1);
    tester = () => {
      elem1.animations.nextFrame(0);
      expect(elem1.getScale().round(4)).toEqual(new Point(1, 1));
      elem1.animations.nextFrame(0.5);
      expect(elem1.getScale().round(4)).toEqual(new Point(1.5, 1.5));
      elem1.animations.nextFrame(1.0);
      expect(elem1.getScale().round(4)).toEqual(new Point(2, 2));
      elem1.animations.nextFrame(1.1);
      expect(elem1.getScale().round(4)).toEqual(new Point(2, 2));
    };
  });
  test('Simple scale', () => {
    elem1.animations.new()
      .scale({ target: 2, duration: 1 })
      .start();
    tester();
  });
  test('Simple scale with element creater', () => {
    elem1.animations.newFromStep(elem1.anim.scale({ target: 2, duration: 1 }))
      .start();
    tester();
  });
  test('Simple scale to delta', () => {
    elem1.animations.new()
      .scale({ delta: 1, duration: 1 })
      .start();
    tester();
  });
  test('Simple scale with point', () => {
    elem1.animations.new()
      .scale({ target: new Point(2, 2), duration: 1, progression: 'linear' })
      .start();
    tester();
  });
});
