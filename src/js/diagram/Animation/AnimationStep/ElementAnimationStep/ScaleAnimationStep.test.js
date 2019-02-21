import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
// import * as math from '../../../../tools/math';
import { Point } from '../../../../tools/g2';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Scale Animation Step', () => {
  let elem1;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.objects.line();
    elem1.setScale(1, 1);
  });
  test('Simple scale', () => {
    elem1.animations.new()
      .scaleTo({ target: 2, duration: 1 })
      .start();

    elem1.animations.nextFrame(0);
    expect(elem1.getScale().round()).toEqual(new Point(1, 1));

    elem1.animations.nextFrame(0.5);
    expect(elem1.getScale().round()).toEqual(new Point(1.5, 1.5));

    elem1.animations.nextFrame(1.0);
    expect(elem1.getScale().round()).toEqual(new Point(2, 2));

    elem1.animations.nextFrame(1.1);
    expect(elem1.getScale().round()).toEqual(new Point(2, 2));
  });
  test('Simple scale to delta', () => {
    elem1.animations.new()
      .scaleTo({ delta: 1, duration: 1 })
      .start();

    elem1.animations.nextFrame(0);
    expect(elem1.getScale().round()).toEqual(new Point(1, 1));
    elem1.animations.nextFrame(0.5);
    expect(elem1.getScale().round()).toEqual(new Point(1.5, 1.5));
    elem1.animations.nextFrame(1.0);
    expect(elem1.getScale().round()).toEqual(new Point(2, 2));
    elem1.animations.nextFrame(1.1);
    expect(elem1.getScale().round()).toEqual(new Point(2, 2));
  });
  test('Simple scale with point', () => {
    elem1.animations.new()
      .scaleTo({ target: new Point(2, 2), duration: 1, progression: 'linear' })
      .start();

    elem1.animations.nextFrame(0);
    expect(elem1.getScale().round()).toEqual(new Point(1, 1));
    elem1.animations.nextFrame(0.5);
    expect(elem1.getScale().round()).toEqual(new Point(1.5, 1.5));
    elem1.animations.nextFrame(0.75);
    expect(elem1.getScale().round()).toEqual(new Point(1.75, 1.75));
    elem1.animations.nextFrame(1.0);
    expect(elem1.getScale().round()).toEqual(new Point(2, 2));
    elem1.animations.nextFrame(1.1);
    expect(elem1.getScale().round()).toEqual(new Point(2, 2));
  });
});
