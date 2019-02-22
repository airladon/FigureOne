import {
  Point,
} from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import * as tools from '../../../tools/tools';
import * as colorTools from '../../../tools/color';
import makeDiagram from '../../../__mocks__/makeDiagram';
import { EquationNew } from './Equation';
// import EquationForm from './EquationForm';
import { Elements } from './Elements/Element';
// import Fraction from './Elements/Fraction';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

/* eslint-disable no-param-reassign */
const cleanElements = (elements) => {
  const r = 8;
  elements.ascent = round(elements.ascent, r);
  elements.descent = round(elements.descent, r);
  elements.width = round(elements.width, r);
  elements.height = round(elements.height, r);
  if (elements.location) {
    elements.location = elements.location.round(r);
  }
  if (Array.isArray(elements.content)) {
    elements.content.forEach((c) => {
      cleanElements(c);
    });
    // elements.content = elements.content.map(c => cleanElements(c));
  } else if (
    elements.content instanceof Elements
    || elements.content instanceof Element
  ) {
    cleanElements(elements.content);
  } else {
    elements.content = [];
  }
};

function cleanForm(form) {
  form.collectionMethods = {};
  form.elements = {};
  form.name = 'name';
  cleanElements(form);
}
/* eslint-enable no-param-reassign */

const col = (c: number) => [1, 0, 0, c];

describe('Equation Animation', () => {
  let diagram;
  // let eqn;
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
        // eqn = new EquationNew(diagram.shapes, {
        //   color: color1,
        //   elements: {
        //     a: 'a',
        //     b: 'b',
        //     c: 'c',
        //     d: 'd',
        //   },
        //   forms: {
        //     0: ['b'],
        //     1: ['b', 'c'],
        //     2: ['a', 'b'],
        //   },
        //   formSeries: ['0', '1', '2'],
        // });
        diagram.addElements(diagram.elements, [{
          name: 'eqnA',
          method: 'equation/addNavigator',
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
      },
    };
  });
  test('All Text in constructor', () => {
    ways.simple();
    const eqn = diagram.elements._eqnAEqn;
    const a = diagram.elements._eqnAEqn._a;
    const b = diagram.elements._eqnAEqn._b;
    const c = diagram.elements._eqnAEqn._c;
    expect(diagram.elements).toHaveProperty('_eqnAEqn');
    expect(diagram.elements).toHaveProperty('_eqnANav');
    eqn.showForm('0');
    diagram.draw(0);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(a.color).toEqual(col(1));
    expect(b.color).toEqual(col(1));
    expect(c.color).toEqual(col(1));

    eqn.nextForm(1);
    diagram.draw(1);
    diagram.draw(4.01);
    // console.log(c.animations.animations[0].steps)
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.color).toEqual(col(1));
    expect(b.color).toEqual(col(1));
    expect(c.color).toEqual(col(1));


    // console.log(diagram.elements._eqnAEqn._a)
    // expect(eq).toHavePropert('_a');
    // expect(eqn).toHaveProperty('_a');
    // expect(eqn).toHaveProperty('_b');
    // expect(eqn).toHaveProperty('_c');
    // expect(eqn).toHaveProperty('__2');
    // expect(eqn).toHaveProperty('_v');

    // // Check color
    // expect(eqn._a.drawingObject.text[0].font.color)
    //   .toBe(colorTools.colorArrayToRGBA(color1));

    // // Check math vs number style
    // expect(eqn._a.drawingObject.text[0].font.style).toBe('italic');
    // expect(eqn.__2.drawingObject.text[0].font.style).toBe('normal');
  });
});
