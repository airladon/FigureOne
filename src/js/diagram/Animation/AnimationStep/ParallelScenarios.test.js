// import { DelayStep } from './DelayStep';
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
    elem1 = diagram.objects.line();
    elem1.setPosition(new Point(0, 0));
    elem1.scenarios = {
      1: { position: new Point(1, 0) },
      2: { position: new Point(2, 0) },
    };
    elem2 = diagram.objects.line();
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
  // test('Delay then move', () => {
  //   elem1.animations.new()
  //     .delay(1)
  //     .position({ target: new Point(1, 1), duration: 1, progression: 'linear' })
  //     .start();

  //   elem1.animations.nextFrame(0);
  //   elem1.animations.nextFrame(0.1);
  //   expect(elem1.getPosition().round()).toEqual(new Point(0, 0));

  //   elem1.animations.nextFrame(0.9);
  //   expect(elem1.getPosition().round()).toEqual(new Point(0, 0));

  //   elem1.animations.nextFrame(1.1);
  //   expect(elem1.getPosition().round()).toEqual(new Point(0.1, 0.1));
  // });

  // test('Delay 0 then move', () => {
  //   elem1.animations.new()
  //     .delay(0)
  //     .position({ target: new Point(1, 1), duration: 1, progression: 'linear' })
  //     .start();

  //   elem1.animations.nextFrame(0);
  //   elem1.animations.nextFrame(0.1);
  //   expect(elem1.getPosition().round()).toEqual(new Point(0.1, 0.1));

  //   elem1.animations.nextFrame(0.9);
  //   expect(elem1.getPosition().round()).toEqual(new Point(0.9, 0.9));

  //   elem1.animations.nextFrame(1.1);
  //   expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
  // });

  // test('Move, Delay, Move', () => {
  //   elem1.animations.new()
  //     .position({ target: new Point(1, 1), duration: 1, progression: 'linear' })
  //     .delay(1)
  //     .position({ target: new Point(2, 2), duration: 1, progression: 'linear' })
  //     .delay(1)
  //     .start();
  //   elem1.animations.nextFrame(0);
  //   elem1.animations.nextFrame(0.5);
  //   expect(elem1.getPosition().round()).toEqual(new Point(0.5, 0.5));

  //   elem1.animations.nextFrame(1);
  //   expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
  //   elem1.animations.nextFrame(1.5);
  //   expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
  //   elem1.animations.nextFrame(2);
  //   expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
  //   elem1.animations.nextFrame(2.5);
  //   expect(elem1.getPosition().round()).toEqual(new Point(1.5, 1.5));
  //   elem1.animations.nextFrame(3);
  //   expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
  //   elem1.animations.nextFrame(3.5);
  //   expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
  //   let remaining = elem1.animations.nextFrame(4);
  //   expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
  //   expect(math.round(remaining)).toBe(0);
  //   remaining = elem1.animations.nextFrame(4.1);
  //   expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
  //   expect(math.round(remaining)).toBe(0.1);
  // });
  // test('Delay separate elem1 in parallel method', () => {
  //   elem1.animations.new()
  //     .position({ target: new Point(1, 1), duration: 1, progression: 'linear' })
  //     .inParallel([
  //       elem1.anim.builder()
  //         .delay(1)
  //         .position({ target: new Point(2, 2), duration: 1, progression: 'linear' }),
  //       elem2.anim.position({ target: new Point(1, 1), duration: 1, progression: 'linear' }),
  //     ])
  //     .start();
  //   let remaining;
  //   remaining = elem1.animations.nextFrame(0);
  //   remaining = elem1.animations.nextFrame(0.5);
  //   expect(elem1.getPosition().round()).toEqual(new Point(0.5, 0.5));
  //   expect(elem2.getPosition().round()).toEqual(new Point(0, 0));
  //   expect(remaining).toBe(0);

  //   remaining = elem1.animations.nextFrame(1.5);
  //   expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
  //   expect(elem2.getPosition().round()).toEqual(new Point(0.5, 0.5));

  //   remaining = elem1.animations.nextFrame(2.5);
  //   expect(elem1.getPosition().round()).toEqual(new Point(1.5, 1.5));
  //   expect(elem2.getPosition().round()).toEqual(new Point(1, 1));
  //   expect(remaining).toBe(0);

  //   remaining = elem1.animations.nextFrame(3.5);
  //   expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
  //   expect(elem2.getPosition().round()).toEqual(new Point(1, 1));
  //   expect(math.round(remaining)).toBe(0.5);
  // });
});
