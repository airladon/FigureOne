import {
  Point,
} from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import * as tools from '../../../tools/tools';
// import * as colorTools from '../../../tools/color';
import makeDiagram from '../../../__mocks__/makeDiagram';
import { EquationNew } from './Equation';
// import EquationForm from './EquationForm';
import { Elements } from './Elements/Element';
// import Fraction from './Elements/Fraction';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

// const cleanUIDs = (objectToClean: {}) => {
//   const genericUID = '0000000000';
//   if (objectToClean == null) {
//     return;
//   }
//   if (objectToClean.uid != null) {
//     if (objectToClean.uid === genericUID) {
//       return;
//     }
//     objectToClean.uid = genericUID;
//   }
//   const keys = Object.keys(objectToClean);
//   for (let i = 0; i < keys.length; i += 1) {
//     const key = keys[i];
//     const value = objectToClean[key];
//     if (
//       typeof value === 'object'
//       && !Array.isArray(value)
//       && value != null
//       && typeof value !== 'function'
//       && typeof value !== 'number'
//       && typeof value !== 'boolean'
//       && typeof value !== 'string'
//       ) {
//         cleanUIDs(value);
//     }
//   };
// }

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

describe('Different ways to make an equation', () => {
  let diagram;
  let eqn;
  let color1;
  let ways;
  let clean;
  beforeEach(() => {
    clean = (formName) => {
      cleanForm(eqn.eqn.forms[formName].base);
      return eqn.eqn.forms[formName].base;
    };
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    ways = {
      allTextInConstructor: () => {
        eqn = new EquationNew(diagram.shapes, {
          color: color1,
          elements: {
            a: 'a',
            b: 'b',
            c: 'c',
            _2: '2',
            v: { symbol: 'vinculum' },
          },
          forms: {
            0: ['a', 'b', 'c'],
            1: [{ frac: ['a', '_2', 'v'] }, 'c'],
          },
          formSeries: ['0', '1'],
        });
      },
      allTextInConstructorAllOptions: () => {
        eqn = new EquationNew(diagram.shapes, {
          color: color1,
          position: [1, 1],           // Points can be defined as arrays
          elements: {
            a: 'a',
            b: 'b',
            c: 'c',
            _2: '2',
            v: { symbol: 'vinculum' },
          },
          defaultFormAlignment: {
            fixTo: { x: 2, y: 2 },    // Points can also be defined as objects
            alignH: 'right',
            alignV: 'top',
          },
          scale: 0.45,
          forms: {
            0: ['a', 'b', 'c'],
            1: [{ frac: ['a', '_2', 'v'] }, 'c'],
          },
          formSeries: ['0', '1'],
        });
      },
      separateAllText: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        eqn.addElements({
          a: 'a',
          b: 'b',
        });
        eqn.addElements({
          a: 'a',
          b: 'b',
          c: 'c',
          _2: '2',
          v: { symbol: 'vinculum' },
        });
        eqn.addForms({
          0: ['a', 'b', 'c'],
          1: [{ frac: ['a', '_2', 'v'] }, 'c'],
        });
        eqn.addForms({
          2: ['a', 'b', 'c'],
        });
        eqn.setFormSeries(['0', '1', '2']);
        eqn.showForm('1');
      },
      phrases: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const frac = eqn.eqn.functions.frac.bind(eqn.eqn.functions);
        eqn.addElements({
          a: 'a',
          b: 'b',
          c: 'c',
          _2: '2',
          v: { symbol: 'vinculum' },
        });
        eqn.addPhrases({
          // Simple
          abc: ['a', 'b', 'c'],
          // All different ways to write a fraction
          f0: { frac: ['a', 'b', 'v'] },
          f1: {
            frac: {
              numerator: 'a',
              denominator: 'b',
              symbol: 'v',
            },
          },
          f2: frac({
            numerator: 'a',
            denominator: 'b',
            symbol: 'v',
          }),
          f3: frac('a', 'b', 'v'),
          // Phrases dependent on other phrases
          ba: ['b', 'a'],
          bac: ['ba', 'c'],
          //
          // Phrase for integration into fraction
          ab: ['a', 'b'],
        });
        eqn.addForms({
          '0a': ['a', 'b', 'c'],
          '0b': 'abc',
          //
          f: { frac: ['a', 'b', 'v'] },
          f0: 'f0',
          f1: 'f1',
          f2: 'f2',
          f3: 'f3',
          //
          d: ['b', 'a', 'c'],
          d0: 'bac',
          //
          e: { frac: [['a', 'b'], 'c', 'v'] },
          e0: { frac: ['ab', 'c', 'v'] },
        });
      },
      // nonTextFunctions: () => {
      //   eqn = new EquationNew(diagram.shapes, { color: color1 });
      //   const e = eqn.eqn.functions;
      //   eqn.addElements({
      //     a: 'a',
      //     b: 'b',
      //     c: 'c',
      //     _2: '2',
      //     v: { symbol: 'vinculum' },
      //     v1: { symbol: 'vinculum' },
      //   });
      //   eqn.addForms({
      //     0: {
      //       frac: [
      //         {
      //           frac: ['a', 'b', 'v'],
      //         },
      //         'c',
      //         'v1',
      //       ],
      //     },
      //     1: [{ frac: ['a', '_2', 'v'] }, 'c'],
      //   });
      //   eqn.setFormSeries(['0', '1', '2']);
      //   eqn.showForm('1');
      // },
      equationScale: () => {
        eqn = new EquationNew(diagram.shapes, {
          color: color1,
          scale: 0.95,
        });
        eqn.addElements({
          a: 'a',
          b: 'b',
          c: 'c',
        });
        eqn.addForms({
          0: ['a', 'b'],
          1: {
            content: ['a', 'b'],
            scale: 0.85,
          },
        });
      },
      equationFormAlignment: () => {
        eqn = new EquationNew(diagram.shapes, {
          color: color1,
          defaultFormAlignment: {
            fixTo: 'a',
            alignV: 'top',
            alignH: 'center',
          },
        });
        eqn.addElements({
          a: 'a',
          b: 'b',
          c: 'c',
        });
        eqn.addForms({
          aCenterTop: ['a', 'space1', 'b'],
          originBasline: {
            content: ['a', 'space1', 'b'],
            alignment: {
              fixTo: new Point(0, 0),
              alignH: 'left',
              alignV: 'baseline',
            },
          },
          aRightMiddle: {
            content: ['a', 'space1', 'b'],
            alignment: {
              fixTo: 'a',
              alignH: 'right',
              alignV: 'middle',
            },
          },
          bRightBottom: {
            content: ['a', 'space1', 'b'],
            alignment: {
              fixTo: 'b',
              alignH: 'right',
              alignV: 'bottom',
            },
          },
        });
      },
    };
  });
  test('All Text in constructor', () => {
    ways.allTextInConstructor();
    expect(eqn).toHaveProperty('_a');
    expect(eqn).toHaveProperty('_b');
    expect(eqn).toHaveProperty('_c');
    expect(eqn).toHaveProperty('__2');
    expect(eqn).toHaveProperty('_v');

    // Check color
    expect(eqn._a.drawingObject.text[0].font.color)
      .toEqual(color1);

    // Check math vs number style
    expect(eqn._a.drawingObject.text[0].font.style).toBe('italic');
    expect(eqn.__2.drawingObject.text[0].font.style).toBe('normal');
  });
  test('All Text in constructor with all options', () => {
    ways.allTextInConstructorAllOptions();

    expect(eqn).toHaveProperty('_a');
    expect(eqn).toHaveProperty('_b');
    expect(eqn).toHaveProperty('_c');
    expect(eqn).toHaveProperty('__2');
    expect(eqn).toHaveProperty('_v');

    // Check color
    expect(eqn._a.drawingObject.text[0].font.color)
      .toEqual(color1);

    // Check position
    expect(eqn.transform.t()).toEqual(new Point(1, 1));

    // Check default form alignment
    expect(eqn.eqn.defaultFormAlignment.fixTo).toEqual(new Point(2, 2));
    expect(eqn.eqn.defaultFormAlignment.alignH).toEqual('right');
    expect(eqn.eqn.defaultFormAlignment.alignV).toEqual('top');
    expect(eqn.eqn.scale).toEqual(0.45);

    tools.cleanUIDs(eqn);
    expect(eqn._a).toMatchSnapshot();
  });
  test('Separate All Text', () => {
    ways.separateAllText();
    expect(eqn).toHaveProperty('_a');
    expect(eqn).toHaveProperty('_b');
    expect(eqn).toHaveProperty('_c');
    expect(eqn).toHaveProperty('__2');
    expect(eqn).toHaveProperty('_v');

    // Check color
    expect(eqn._a.drawingObject.text[0].font.color)
      .toEqual(color1);

    // Test locations of all elements
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn.__2.transform.mat)).toMatchSnapshot();
    expect(round(eqn._v.transform.mat)).toMatchSnapshot();
    expect(round(eqn._c.transform.mat)).toMatchSnapshot();
  });
  test('Equation Scale', () => {
    ways.equationScale();
    expect(eqn.eqn.scale).toBe(0.95);
    const h1 = eqn.eqn.forms['0'].base.content[0].height;
    const h2 = eqn.eqn.forms['1'].base.content[0].height;
    expect(round(h1 / h2)).toBe(round(0.95 / 0.85));
  });
  test('Equation Form Alignment', () => {
    ways.equationFormAlignment();
    eqn.showForm('originBasline');
    const originBasline = eqn._a.getPosition('diagram');
    eqn.showForm('aCenterTop');
    const aCenterTop = eqn._a.getPosition('diagram');
    eqn.showForm('aRightMiddle');
    const aRightMiddle = eqn._a.getPosition('diagram');
    eqn.showForm('bRightBottom');
    const bRightBottom = eqn._a.getPosition('diagram');

    // Test x positions
    expect(originBasline.x > aCenterTop.x).toBe(true);
    expect(aCenterTop.x > aRightMiddle.x).toBe(true);
    expect(aRightMiddle.x > bRightBottom.x).toBe(true);

    // Test y positions
    expect(aCenterTop.y < aRightMiddle.y).toBe(true);
    expect(aRightMiddle.y < originBasline.y).toBe(true);
    expect(originBasline.y < bRightBottom.y).toBe(true);
  });
  test('Phrases', () => {
    ways.phrases();
    expect(clean('0a')).toEqual(clean('0b'));
    //
    expect(clean('f')).toEqual(clean('f0'));
    expect(clean('f')).toEqual(clean('f1'));
    expect(clean('f')).toEqual(clean('f2'));
    expect(clean('f')).toEqual(clean('f3'));
    //
    expect(clean('d')).toEqual(clean('d0'));
    expect(clean('e')).toEqual(clean('e0'));
    // console.log(Object.entries(eqn.eqn.forms['1a'].base))
    // console.log(Object.entries(eqn.eqn.forms['1b'].base))
  });
});
