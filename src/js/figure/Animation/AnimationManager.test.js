import {
  Point,
} from '../../tools/g2';
import * as tools from '../../tools/tools';
import * as math from '../../tools/math';
import makeFigure from '../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

// jest.mock('../Gesture');
// jest.mock('../webgl/webgl');
// jest.mock('../DrawContext2D');

jest.useFakeTimers();

const point = value => new Point(value, value);

describe('Animation Manager', () => {
  let elem;
  let p1;
  let figure;
  beforeEach(() => {
    figure = makeFigure();
    elem = figure.collections.line();
    figure.elements.add('elem', elem);
    figure.elements.show();
    elem.setPosition(new Point(0, 0));
    elem.setColor([1, 0, 0, 1]);
    p1 = new Point(1, 1);
  });
  test('Basic', () => {
    // console.log(figure.elements)
    elem.animations.new()
      .position({ target: p1, duration: 1, progression: 'linear' })
      .start();
    figure.draw(0);
    // elem.animations.nextFrame(0);
    expect(elem.getPosition().round()).toEqual(point(0));

    // elem.animations.nextFrame(0.5);
    figure.draw(0.5);
    expect(elem.getPosition().round()).toEqual(point(0.5));

    // elem.animations.nextFrame(1.1);
    figure.draw(1.1);
    expect(elem.getPosition().round()).toEqual(point(1));
    expect(elem.animations.animations).toHaveLength(0);
  });
  test('Two parallel animations', () => {
    elem.animations.new()
      .position({ target: p1, duration: 1, progression: 'linear' })
      .start();
    elem.animations.new()
      .dissolveOut(2)
      .start();
    elem.animations.nextFrame(0);
    expect(elem.getPosition().round()).toEqual(point(0));
    expect(math.round(elem.opacity, 2)).toEqual(1);

    elem.animations.nextFrame(0.5);
    expect(elem.getPosition().round()).toEqual(point(0.5));
    expect(math.round(elem.opacity, 2)).toEqual(0.75);
    expect(elem.isShown).toBe(true);
    expect(elem.animations.animations).toHaveLength(2);

    elem.animations.nextFrame(1.5);
    expect(elem.getPosition().round()).toEqual(point(1));
    expect(math.round(elem.opacity, 2)).toEqual(0.25);
    expect(elem.animations.animations).toHaveLength(1);

    elem.animations.nextFrame(2.1);
    expect(elem.getPosition().round()).toEqual(point(1));
    expect(math.round(elem.opacity, 2)).toEqual(1);
    expect(elem.isShown).toBe(false);
    expect(elem.animations.animations).toHaveLength(0);
  });
  test('Two parallel animations with one not a sequence', () => {
    elem.animations.new()
      .position({ target: p1, duration: 1, progression: 'linear' })
      .start();
    elem.animations.newFromStep(elem.animations.dissolveOut(2))
      .start();

    elem.animations.nextFrame(0);
    expect(elem.getPosition().round()).toEqual(point(0));
    expect(math.round(elem.opacity, 2)).toEqual(1);

    elem.animations.nextFrame(0.5);
    expect(elem.getPosition().round()).toEqual(point(0.5));
    expect(math.round(elem.opacity, 2)).toEqual(0.75);
    expect(elem.isShown).toBe(true);
    expect(elem.animations.animations).toHaveLength(2);

    elem.animations.nextFrame(1.5);
    expect(elem.getPosition().round()).toEqual(point(1));
    expect(math.round(elem.opacity, 2)).toEqual(0.25);
    expect(elem.animations.animations).toHaveLength(1);

    elem.animations.nextFrame(2.1);
    expect(elem.getPosition().round()).toEqual(point(1));
    expect(math.round(elem.opacity, 2)).toEqual(1);
    expect(elem.isShown).toBe(false);
    expect(elem.animations.animations).toHaveLength(0);
  });
  test('Add to existing animation', () => {
    elem.animations.new('test')
      .position({ target: p1, duration: 1, progression: 'linear' })
      .start();

    elem.animations.nextFrame(0);
    expect(elem.getPosition().round()).toEqual(point(0));
    expect(math.round(elem.opacity, 2)).toEqual(1);
    expect(elem.animations.animations).toHaveLength(1);
    expect(elem.animations.animations[0].steps).toHaveLength(1);

    elem.animations.nextFrame(0.5);
    expect(elem.getPosition().round()).toEqual(point(0.5));
    elem.animations.addTo('test')
      .dissolveOut(1)
      .start();
    expect(elem.animations.animations).toHaveLength(1);
    expect(elem.animations.animations[0].steps).toHaveLength(2);
    // console.log(elem.animations.animations[0].steps)

    elem.animations.nextFrame(0.6);
    expect(elem.getPosition().round()).toEqual(point(0.6));
    expect(math.round(elem.opacity, 2)).toEqual(1);

    elem.animations.nextFrame(1.5);
    expect(elem.getPosition().round()).toEqual(point(1));
    expect(math.round(elem.opacity, 2)).toEqual(0.5);
    expect(elem.isShown).toBe(true);

    elem.animations.nextFrame(2.1);
    expect(elem.getPosition().round()).toEqual(point(1));
    expect(math.round(elem.opacity, 2)).toEqual(1);
    expect(elem.isShown).toBe(false);
  });
  test('Time Speed', () => {
    elem.animations.new()
      .position({ target: [1, 0], duration: 5, progression: 'linear' })
      .start();
    figure.mock.timeStep(0);
    expect(elem.getPosition().x).toEqual(0);
    figure.mock.timeStep(1);
    expect(elem.getPosition().x).toEqual(0.2);
    elem.animations.setTimeSpeed(0.5);
    figure.mock.timeStep(1);
    expect(elem.getPosition().x).toEqual(0.3);
    figure.mock.timeStep(1);
    expect(elem.getPosition().x).toEqual(0.4);

    elem.animations.setTimeSpeed(2);
    figure.mock.timeStep(0.5);
    expect(elem.getPosition().x).toEqual(0.6);
    figure.mock.timeStep(0.25);
    expect(elem.getPosition().x).toEqual(0.7);

    elem.animations.setTimeSpeed(1);
    figure.mock.timeStep(1);
    expect(elem.getPosition().x).toEqual(0.9);
  });
});
