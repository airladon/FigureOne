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
  let figure;
  beforeEach(() => {
    jest.useFakeTimers();
    figure = makeFigure();
    elem1 = figure.primitives.polygon();
    figure.elements.add('elem1', elem1);
    elem1.setScale(1, 1);
  });
  test('Simple scale', () => {
    elem1.animations.new()
      .pulse({ scale: 2, duration: 1, when: 'nextFrame' })
      .start();
    figure.mock.timeStep(0);
    expect(elem1.getScale().round()).toEqual(new Point(1, 1, 1));
    expect(elem1.lastDrawPulseTransform.s()).toEqual(new Point(1, 1, 1));
    figure.mock.timeStep(0.5);
    expect(elem1.lastDrawPulseTransform.s()).toEqual(new Point(2, 2, 1));
    figure.mock.timeStep(0.25);
    expect(elem1.lastDrawPulseTransform.s().round(3)).toEqual(new Point(1.5, 1.5, 1));
  });
});
