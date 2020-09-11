import {
  Point,
} from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import * as tools from '../../../tools/tools';
// import * as colorTools from '../../../tools/color';
import makeDiagram from '../../../__mocks__/makeDiagram';
// import { Equation } from './Equation';
// import EquationForm from './EquationForm';
// import { Elements } from './Elements/Element';
// import Fraction from './Elements/Fraction';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

const col = c => [1, 0, 0, c];

describe('Equation Animation', () => {
  let diagram;
  let eqn;
  let a;
  let b;
  let c;
  // let color1;
  let ways;
  // let clean;
  beforeEach(() => {
    // clean = (formName) => {
    //   cleanForm(eqn.eqn.forms[formName].base);
    //   return eqn.eqn.forms[formName].base;
    // };
    diagram = makeDiagram();
    // color1 = [0.95, 0, 0, 1];
    ways = {
      simple: () => {
        diagram.addElements([{
          name: 'eqnA',
          method: 'addNavigator',
          options: {
            color: col(1),
            elements: {
              a: 'a',
              b: 'b',
              c: 'c',
            },
            forms: {
              0: ['b'],
              1: ['b', 'c'],
              2: ['a', 'b'],
            },
            formSeries: ['0', '1', '2'],
          },
        }]);
        eqn = diagram.elements._eqnAEqn;
        a = diagram.elements._eqnAEqn._a;
        b = diagram.elements._eqnAEqn._b;
        c = diagram.elements._eqnAEqn._c;
      },
    };
  });
  test('Next Form without interruption', () => {
    ways.simple();
    expect(diagram.elements).toHaveProperty('_eqnAEqn');
    expect(diagram.elements).toHaveProperty('_eqnANav');

    // only b is shown
    eqn.showForm('0');
    diagram.drawNow(0);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(c.opacity).toEqual(1);

    eqn.nextForm(1);
    diagram.drawNow(1);
    diagram.drawNow(1.2);
    // 'c' fades in over 0.4s
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 2)).toEqual(0.5);

    // 'c' is now fully in
    diagram.drawNow(1.5);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);

    // 'c' fades out, 'a' is waiting to fade in till after move
    eqn.nextForm(1);
    diagram.drawNow(2);
    diagram.drawNow(2.2);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 2)).toEqual(0.5);
    expect(b.getPosition()).toEqual(new Point(0, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(1);
    expect(c.animations.animations).toHaveLength(1);

    // 'c' is fully out, but not hidden, 'a' is still waiting
    diagram.drawNow(2.4);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 3)).toEqual(1);
    expect(b.getPosition()).toEqual(new Point(0, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(1);
    expect(c.animations.animations).toHaveLength(0);

    // 'c' is now hidden, 'b' starts to move, a' is still waiting
    diagram.drawNow(2.41);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);
    expect(b.getPosition().round(8)).toEqual(new Point(0.00000714, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(1);
    expect(c.animations.animations).toHaveLength(0);

    // 'b' is in the middle of its movement, 'a' is still waiting
    diagram.drawNow(2.9);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);
    expect(b.getPosition().round()).toEqual(new Point(0.035, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(1);
    expect(c.animations.animations).toHaveLength(0);

    // 'b' finished, 'a' is just about to start
    diagram.drawNow(3.4);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);
    expect(b.getPosition().round()).toEqual(new Point(0.07, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);

    // 'a' is half way through appearing
    diagram.drawNow(3.6);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity, 2)).toEqual(0.5);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);
    expect(b.getPosition().round()).toEqual(new Point(0.07, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);

    // 'a' is finished appearing
    diagram.drawNow(3.8);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity, 2)).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);
    expect(b.getPosition().round()).toEqual(new Point(0.07, 0));
    expect(a.animations.animations).toHaveLength(0);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);

    // Everything is done
    diagram.drawNow(3.81);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(c.opacity).toEqual(1);
    expect(b.getPosition().round()).toEqual(new Point(0.07, 0));
    expect(a.animations.animations).toHaveLength(0);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);
  });
  test('Interruption on fade in', () => {
    ways.simple();
    expect(diagram.elements).toHaveProperty('_eqnAEqn');
    expect(diagram.elements).toHaveProperty('_eqnANav');

    // only b is shown
    eqn.showForm('0');
    diagram.drawNow(0);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(c.opacity).toEqual(1);

    eqn.nextForm(1);
    diagram.drawNow(1);
    diagram.drawNow(1.2);
    // 'c' fades in over 0.4s
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 4)).toEqual(0.5005);

    // Interrupt by moving to next form while previous was animating
    // 'c' skips to be fully shown
    // 'c' animation is just waiting for next frame before it stops
    eqn.nextForm(1);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 4)).toEqual(1);
    expect(a.animations.animations).toHaveLength(0);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);

    // nothing has happened
    diagram.drawNow(2);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 4)).toEqual(1);
    expect(a.animations.animations).toHaveLength(0);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);
  });

  test('Interruption on fade out', () => {
    ways.simple();
    expect(diagram.elements).toHaveProperty('_eqnAEqn');
    expect(diagram.elements).toHaveProperty('_eqnANav');

    // 'b' and 'c' is shown
    eqn.showForm('1');
    diagram.drawNow(0);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(c.opacity).toEqual(1);

    // 'c' will fade out, 'b' will move, then 'a' will fade in
    eqn.nextForm(1);
    diagram.drawNow(1);
    diagram.drawNow(1.2);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 2)).toEqual(0.5);
    expect(b.getPosition()).toEqual(new Point(0, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(1);
    expect(c.animations.animations).toHaveLength(1);

    // Interrupt while fading out
    eqn.nextForm(1);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(c.opacity).toEqual(1);
    expect(b.getPosition().round()).toEqual(new Point(0.07, 0));
    expect(a.animations.animations).toHaveLength(0);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);
  });
});
