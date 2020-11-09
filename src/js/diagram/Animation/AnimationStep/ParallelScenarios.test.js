// import { DelayAnimationStep } from './DelayAnimationStep';
import * as tools from '../../../tools/tools';
// import * as math from '../../../tools/math';
import makeDiagram from '../../../__mocks__/makeDiagram';
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
  let diagram;
  beforeEach(() => {
    diagram = makeDiagram();
    elem1 = diagram.advanced.line();
    elem1.setPosition(new Point(0, 0));
    elem1.scenarios = {
      1: { position: new Point(1, 0) },
      2: { position: new Point(2, 0) },
    };
    elem2 = diagram.advanced.line();
    elem2.setPosition(new Point(0, 0));
    elem2.scenarios = {
      1: { position: new Point(0, 1) },
      2: { position: new Point(0, 2) },
    };
    diagram.elements = diagram.shapes.collection();
    diagram.elements.add('elem1', elem1);
    diagram.elements.add('elem2', elem2);
  });
  test('Simple', () => {
    // elem1.animations.new()
    //   .scenario({ target: '1', duration: 1 })
    //   .start();
    diagram.elements.animations.new()
      .scenarios({ target: '1', duration: 1 })
      .scenarios({ target: '2', duration: 1 })
      .start();
    expect(elem1.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(elem2.getPosition().round(3)).toEqual(new Point(0, 0));
    diagram.draw(0);
    diagram.draw(0.5);
    expect(elem1.getPosition().round(3)).toEqual(new Point(0.5, 0));
    expect(elem2.getPosition().round(3)).toEqual(new Point(0, 0.5));
    diagram.draw(1);
    expect(elem1.getPosition().round(3)).toEqual(new Point(1, 0));
    expect(elem2.getPosition().round(3)).toEqual(new Point(0, 1));
    diagram.draw(1.5);
    expect(elem1.getPosition().round(3)).toEqual(new Point(1.5, 0));
    expect(elem2.getPosition().round(3)).toEqual(new Point(0, 1.5));
    diagram.draw(2);
    expect(elem1.getPosition().round(3)).toEqual(new Point(2, 0));
    expect(elem2.getPosition().round(3)).toEqual(new Point(0, 2));
    expect(diagram.elements.animations.state).toBe('idle');
    // diagram.draw(2.01);
    // expect(diagram.elements.animations.state).toBe('idle');
  });
});
