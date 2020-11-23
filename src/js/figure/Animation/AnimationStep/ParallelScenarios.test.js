// import { DelayAnimationStep } from './DelayAnimationStep';
import * as tools from '../../../tools/tools';
// import * as math from '../../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';
import {
  Point,
} from '../../../tools/g2';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');


describe('Transfrom Animation Unit', () => {
  let elem1;
  let elem2;
  let figure;
  beforeEach(() => {
    figure = makeFigure();
    elem1 = figure.collections.line();
    elem1.setPosition(new Point(0, 0));
    elem1.scenarios = {
      1: { position: new Point(1, 0) },
      2: { position: new Point(2, 0) },
    };
    elem2 = figure.collections.line();
    elem2.setPosition(new Point(0, 0));
    elem2.scenarios = {
      1: { position: new Point(0, 1) },
      2: { position: new Point(0, 2) },
    };
    figure.elements = figure.shapes.collection();
    figure.elements.add('elem1', elem1);
    figure.elements.add('elem2', elem2);
  });
  test('Simple', () => {
    // elem1.animations.new()
    //   .scenario({ target: '1', duration: 1 })
    //   .start();
    figure.elements.animations.new()
      .scenarios({ target: '1', duration: 1 })
      .scenarios({ target: '2', duration: 1 })
      .start();
    expect(elem1.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(elem2.getPosition().round(3)).toEqual(new Point(0, 0));
    figure.draw(0);
    figure.draw(0.5);
    expect(elem1.getPosition().round(3)).toEqual(new Point(0.5, 0));
    expect(elem2.getPosition().round(3)).toEqual(new Point(0, 0.5));
    figure.draw(1);
    expect(elem1.getPosition().round(3)).toEqual(new Point(1, 0));
    expect(elem2.getPosition().round(3)).toEqual(new Point(0, 1));
    figure.draw(1.5);
    expect(elem1.getPosition().round(3)).toEqual(new Point(1.5, 0));
    expect(elem2.getPosition().round(3)).toEqual(new Point(0, 1.5));
    figure.draw(2);
    expect(elem1.getPosition().round(3)).toEqual(new Point(2, 0));
    expect(elem2.getPosition().round(3)).toEqual(new Point(0, 2));
    expect(figure.elements.animations.state).toBe('idle');
    // figure.draw(2.01);
    // expect(figure.elements.animations.state).toBe('idle');
  });
});
