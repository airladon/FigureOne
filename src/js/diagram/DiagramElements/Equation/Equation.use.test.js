import {
  Point,
} from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import * as tools from '../../../tools/tools';
// import * as colorTools from '../../../tools/color';
import makeDiagram from '../../../__mocks__/makeDiagram';
import { Equation } from './Equation';
// import EquationForm from './EquationForm';
import { Elements } from './Elements/Element';
import * as html from '../../../tools/htmlGenerator';
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
  let color2;
  let ways;
  let clean;
  beforeEach(() => {
    clean = (formName) => {
      cleanForm(eqn.eqn.forms[formName]);
      return eqn.eqn.forms[formName];
    };
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    color2 = [0, 0.95, 0, 1];
    ways = {
      allTextInConstructor: () => {
        eqn = new Equation(diagram.shapes, {
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
            1: [{ frac: ['a', 'v', '_2'] }, 'c'],
          },
          formSeries: ['0', '1'],
        });
      },
      allTextInConstructorAllOptionsNew__TO_TEST__TODO: () => {
        eqn = new Equation(diagram.shapes, {
          color: color1,
          position: [1, 1],           // Points can be defined as arrays
          elements: {
            a: 'a',
            b: { color: [1, 1, 0, 1] }, // Element text same as key name
            c: 'c',
            _2: '2',
            v: { symbol: 'vinculum' },
          },
          scale: 0.45,
          formDefaults: {
            alignment: {
              fixTo: { x: 2, y: 2 },    // Points can also be defined as objects
              xAlign: 'right',
              yAlign: 'top',
            },
            animation: {
              duration: 1,
              translation: {
                c: { style: 'curved', direction: 'up', mag: 0.5 },
              },
            },
            elementMods: {
              b: { color: [1, 0, 0, 1] },
            },
          },
          // Phrases are combinations of elements that can be used in forms to
          // make the forms simpler
          phrases: {
            ab: ['a', 'b'],
          },
          forms: {
            0: ['a', 'b', 'c'],
            1: [{ frac: ['a', 'v', '_2'] }, 'c'],
            // Equals can be used as an object key, so it is a valid inline definition
            2: ['ab', '=', 'c'],
            // Full form definition
            3: {
              content: ['c', 'b', 'd'],       // New elements can be defined (d)
              scale: 1.2,
              elementMods: {
                b: { color: [0, 1, 0, 1] },
              },
              description: '|Form| 2 |description|',
              modifiers: {
                Form: html.highlight([1, 0, 0, 0]),
              },
              animation: {
                duration: null,
                translation: {
                  c: { style: 'curved', direction: 'down', mag: 0.5 },
                },
              },
              alignment: {
                fixTo: 'b',
                xAlign: 'center',
                yAlign: 'baseline',
              },
              fromForm: {
                2: {
                  animation: {
                    duration: 2,
                    translation: {
                      c: { style: 'linear' },
                    },
                  },
                  elementMods: {
                    b: { color: [0, 0, 1, 1] },
                  },
                },
              },
            },
          },
          // Either a single or multiple form series can be defined
          formSeries: {
            a: ['0', '1'],
            b: ['1', '2'],
          },
        });
      },
      allTextInConstructorAllOptions: () => {
        eqn = new Equation(diagram.shapes, {
          color: color1,
          position: [1, 1],           // Points can be defined as arrays
          elements: {
            a: 'a',
            b: 'b',
            c: 'c',
            _2: '2',
            v: { symbol: 'vinculum' },
          },
          formDefaults: {
            alignment: {
              fixTo: { x: 2, y: 2 },    // Points can also be defined as objects
              xAlign: 'right',
              yAlign: 'top',
            },
          },
          scale: 0.45,
          forms: {
            0: ['a', 'b', 'c'],
            1: [{ frac: ['a', 'v', '_2'] }, 'c'],
          },
          formSeries: ['0', '1'],
        });
      },
      separateAllText: () => {
        eqn = new Equation(diagram.shapes, { color: color1 });
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
          1: [{ frac: ['a', 'v', '_2'] }, 'c'],
        });
        eqn.addForms({
          2: ['a', 'b', 'c'],
        });
        eqn.setFormSeries(['0', '1', '2']);
        eqn.showForm('1');
      },
      phrases: () => {
        eqn = new Equation(diagram.shapes, { color: color1 });
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
          f0: { frac: ['a', 'v', 'b'] },
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
          f3: frac(['a', 'v', 'b']),
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
          f: { frac: ['a', 'v', 'b'] },
          f0: 'f0',
          f1: 'f1',
          f2: 'f2',
          f3: 'f3',
          //
          d: ['b', 'a', 'c'],
          d0: 'bac',
          //
          e: { frac: [['a', 'b'], 'v', 'c'] },
          e0: { frac: ['ab', 'v', 'c'] },
        });
      },
      equationScale: () => {
        eqn = new Equation(diagram.shapes, {
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
        eqn = new Equation(diagram.shapes, {
          color: color1,
          formDefaults: {
            alignment: {
              fixTo: 'a',
              yAlign: 'top',
              xAlign: 'center',
            },
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
              xAlign: 'left',
              yAlign: 'baseline',
            },
          },
          aRightMiddle: {
            content: ['a', 'space1', 'b'],
            alignment: {
              fixTo: 'a',
              xAlign: 'right',
              yAlign: 'middle',
            },
          },
          bRightBottom: {
            content: ['a', 'space1', 'b'],
            alignment: {
              fixTo: 'b',
              xAlign: 'right',
              yAlign: 'bottom',
            },
          },
        });
      },
      autoAddElements: () => {
        eqn = new Equation(diagram.shapes, {
          color: color1,
          scale: 0.95,
        });
        eqn.addForms({
          0: [
            'a',
            'b_1',
            '_c_2',
            { d: { color: color2 } },
            { _e: { color: color2 } },
            { _f_: { color: color2 } }, // eslint-disable-next-line camelcase
            { _g_1: { color: color2 } },
          ],
        });
      },
      autoSymbolsName: () => {
        eqn = new Equation(diagram.shapes, { color: color1, scale: 0.95 });
        eqn.addForms({
          0: { frac: ['a', 'vinculum', 'b'] },
        });
      },
      autoSymbolsID: () => {
        eqn = new Equation(diagram.shapes, { color: color1, scale: 0.95 });
        eqn.addForms({
          0: { frac: ['a', 'v_vinculum', 'b'] },
          // 2: ['a', 'b', { vinculum }],
        });
      },
      autoSymbolsObjectName: () => {
        eqn = new Equation(diagram.shapes, { color: color1, scale: 0.95 });
        eqn.addForms({
          0: { frac: ['a', { vinculum: { color: color2 } }, 'b'] },
        });
      },
      autoSymbolsObjectID: () => {
        eqn = new Equation(diagram.shapes, { color: color1, scale: 0.95 });
        eqn.addForms({  // eslint-disable-next-line camelcase
          0: { frac: ['a', { v_vinculum: { color: color2 } }, 'b'] },
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
    expect(eqn.eqn.formDefaults.alignment.fixTo).toEqual(new Point(2, 2));
    expect(eqn.eqn.formDefaults.alignment.xAlign).toEqual('right');
    expect(eqn.eqn.formDefaults.alignment.yAlign).toEqual('top');
    expect(eqn.eqn.scale).toEqual(0.45);
    tools.cleanUIDs(eqn);
    eqn._a.parent = null;
    // console.log(eqn._a)
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
    const h1 = eqn.eqn.forms['0'].content[0].height;
    const h2 = eqn.eqn.forms['1'].content[0].height;
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
  });
  test('Auto Add Elements', () => {
    ways.autoAddElements();
    expect(eqn._a).not.toBe(undefined);
    expect(eqn._a.drawingObject.text[0].text).toBe('a');
    expect(eqn._a.color).toEqual(color1);

    expect(eqn._b_1).not.toBe(undefined);
    expect(eqn._b_1.drawingObject.text[0].text).toBe('b');
    expect(eqn._b_1.color).toEqual(color1);

    expect(eqn.__c_2).not.toBe(undefined);
    expect(eqn.__c_2.drawingObject.text[0].text).toBe('c');
    expect(eqn.__c_2.color).toEqual(color1);

    expect(eqn._d).not.toBe(undefined);
    expect(eqn._d.drawingObject.text[0].text).toBe('d');
    expect(eqn._d.color).toEqual(color2);

    expect(eqn.__e).not.toBe(undefined);
    expect(eqn.__e.drawingObject.text[0].text).toBe('e');
    expect(eqn.__e.color).toEqual(color2);

    expect(eqn.__f_).not.toBe(undefined);
    expect(eqn.__f_.drawingObject.text[0].text).toBe('f');
    expect(eqn.__f_.color).toEqual(color2);

    expect(eqn.__g_1).not.toBe(undefined);
    expect(eqn.__g_1.drawingObject.text[0].text).toBe('g');
    expect(eqn.__g_1.color).toEqual(color2);
  });
  test('Auto Symbols Name', () => {
    ways.autoSymbolsName();
    expect(eqn._a).not.toBe(undefined);
    expect(eqn._b).not.toBe(undefined);
    expect(eqn._a.drawingObject.text[0].text).toBe('a');
    expect(eqn._b.drawingObject.text[0].text).toBe('b');
    expect(eqn._vinculum.drawingObject.points).toEqual([
      0, 0, 0, 0.01, 0.133, 0, 0.133, 0.01,
    ]);
    expect(eqn._vinculum.color).toEqual(color1);
  });
  test('Auto Symbols ID', () => {
    ways.autoSymbolsID();
    expect(eqn._v.drawingObject.points).toEqual([
      0, 0, 0, 0.01, 0.133, 0, 0.133, 0.01,
    ]);
    expect(eqn._v.color).toEqual(color1);
  });
  test('Auto Symbols Object Name', () => {
    ways.autoSymbolsObjectName();
    expect(eqn._vinculum.drawingObject.points).toEqual([
      0, 0, 0, 0.01, 0.133, 0, 0.133, 0.01,
    ]);
    expect(eqn._vinculum.color).toEqual(color1);
  });
  test('Auto Symbols Object ID', () => {
    ways.autoSymbolsObjectID();
    expect(eqn._v.drawingObject.points).toEqual([
      0, 0, 0, 0.01, 0.133, 0, 0.133, 0.01,
    ]);
    expect(eqn._v.color).toEqual(color1);
  });
});
