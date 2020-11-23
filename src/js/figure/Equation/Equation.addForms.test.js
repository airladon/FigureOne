import {
  Point, // Rect,
} from '../../tools/g2';

import * as tools from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';
import { Equation } from './Equation';
import Fraction from './Elements/Fraction';
import * as html from '../../tools/htmlGenerator';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

describe('Figure Equations From Object', () => {
  let figure;
  let eqn;
  let addForms;
  let forms;
  let color1;
  let equationOptions;
  beforeEach(() => {
    figure = makeFigure();
    // Some default elements
    eqn = new Equation(figure.shapes, {
      elements: {
        a: 'a',
        b: 'b',
        c: 'c',
        d: 'd',
        e: 'e',
        f: 'f',
        v: { symbol: 'vinculum' },
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
      },
    });
    color1 = [0.95, 0, 0, 1];

    // Forms can be created when creating the equation
    equationOptions = {
      elements: {
        a: 'a',
        b: 'b',
        c: 'c',
      },
      forms: {
        0: ['a', 'b', 'c'],
        1: ['b', 'a', 'c'],
      },
      formSeries: ['0', '1'],
    };

    // Forms can be created after creating the equation
    // This also shows all the different ways forms can be defined
    addForms = {
      // Full form options
      allFormOptions: {
        0: {
          content: ['a', 'b', 'c'],
          // subForm: 'deg',
          scale: 1.2,
          alignment: {
            fixTo: 'b',
            xAlign: 'center',
            yAlign: 'bottom',
          },
          description: '|Form| 1 |description|',
          modifiers: {
            Form: html.highlight([1, 0, 0, 0]),
          },
          elementMods: {
            a: {
              color: color1,
              isTouchable: true,
            },
          },
          // animationOptions: {
          //   default: {
          //     translation: {},
          //     duration: 1
          //   }
          //   fromNext: {

          //   }
          //   fromPrev: {
          //   }
          //   fromForm: {

          //   },
          // }
          animation: {
            duration: 1,
            translation: {
              a: {
                style: 'curved',
                direction: 'up',
                mag: 0.95,
              },
              b: ['curved', 'down', 0.45],
            },
          },
          // fromPrev: {
          //   duration: null,
          //   translation: {
          //     a: ['curved', 'down', 0.2],
          //     b: ['curved', 'down', 0.2],
          //   },
          // },
          // fromNext: {
          //   duration: 2,
          //   translation: {
          //     a: ['curved', 'down', 0.2],
          //     b: ['curved', 'down', 0.2],
          //   },
          // },
        },
      },
      // A form can be defined just as the text element
      textOnly: {
        0: 'a',
      },
      // A form can be defined as an array of text elements
      arraySingleForm: {
        0: ['a', 'b', 'c'],
      },
      // Many forms with different names can be defined
      arrayTwoForms: {
        0: ['a', 'b', 'c'],
        1: ['b', 'a', 'c'],
      },
      // Text arrays can be nested in text arrays (but there isn't really
      // a need to)
      nestedArrays: {
        0: ['a', ['b', 'c']],
      },
      // Forms can include methods either as the object by themselves
      // (0 and 2), or as part of an array
      methods: {
        0: { frac: ['a', 'v', 'b'] },
        1: [{ frac: ['a', 'v', 'b'] }],
        2: {
          frac: {
            numerator: 'a',
            denominator: 'b',
            symbol: 'v',
          },
        },
        3: [
          {
            frac: {
              numerator: 'a',
              denominator: 'b',
              symbol: 'v',
            },
          },
        ],
      },
      // Form arrays can have multiple methods in them
      multiMethod: {
        0: [
          { frac: ['a', 'v', 'b'] },
          'c',
          { frac: ['d', 'v1', 'e'] },
        ],
      },
      // Form methods can be nested in each other
      nestedMethod: {
        0: [
          {
            frac: [
              { frac: ['d', 'v1', 'e'] },
              'v',
              'b',
            ],
          },
        ],
      },
      // Forms can be defined as objects to include additional data like
      // subForm name, elementMods, animationTime, description and description
      // modifiers
      fullObject: {
        0: {
          content: ['b', 'a', 'c'],
          elementMods: {
            b: {
              color: color1,
            },
          },
          // subForm: 'deg',
        },
      },
      // // If multiple sub forms exist, and all being defined at once, then need
      // // to split the form object into subForm objects, where each subform
      // // object can be defined as any form above
      // subFormObject: {
      //   0: {
      //     deg: ['b', 'a', 'c'],
      //     rad: {
      //       content: ['b', 'a', 'c'],
      //       elementMods: {
      //         b: {
      //           color: color1,
      //         },
      //       },
      //     },
      //     method: {
      //       frac: {
      //         numerator: 'a',
      //         denominator: 'b',
      //         symbol: 'v',
      //         scale: 0.5,
      //       },
      //     },
      //   },
      // },
      // addForms can be called multiple times
      addFormsMultipleTimes: {
        first: {
          0: ['a', 'b', 'c'],
        },
        second: {
          1: ['b', 'a', 'c'],
        },
      },
      // Form time can be defined either as a single time or a time
      // for different transitions in a formSeries
      time: {
        0: {
          content: ['b', 'a', 'c'],
        },
        1: {
          content: ['b', 'a', 'c'],
          animation: { duration: 10 },
        },
        2: {
          content: ['b', 'a', 'c'],
          animation: { duration: 10 },
          fromForm: {
            prev: { animation: { duration: 20 } },
            next: { animation: { duration: 30 } },
          },
          // time: { fromPrev: 20, fromNext: 30, fromAny: 40 },
        },
        3: {
          content: ['b', 'a', 'c'],
          fromForm: {
            prev: { animation: { duration: 20 } },
          },
        },
      },
      // ElementMods can be used to modify the FigureElement properties
      // after creation
      elementMods: {
        0: {
          content: ['b', 'a', 'c'],
        },
        1: {
          content: ['b', 'a', 'c'],
          elementMods: {
            b: {
              color: color1,
              isTouchable: true,
              animate: { transform: { translation: { options: { magnitude: 2 } } } },
            },
          },
        },
      },
      // Fractions can have scale defined
      fracWithScale: {
        0: [{ frac: ['a', 'v', 'b', 0.5] }],
        1: [
          {
            frac: {
              numerator: 'a',
              denominator: 'b',
              symbol: 'v',
              scale: 0.5,
            },
          },
        ],
      },
      // With descriptions
      descriptions: {
        0: {
          content: ['a', 'b'],
          description: 'Form 0 description',
        },
        1: {
          content: ['a', 'b'],
          description: '|Form| 1 |description|',
          modifiers: {
            Form: html.highlight([1, 0, 0, 0]),
          },
        },
      },
    };
    ({ forms } = eqn.eqn);
  });
  test('Equation instantiation', () => {
    expect(eqn).not.toBe(null);
  });
  test('Text only', () => {
    eqn.addForms(addForms.textOnly);
    const { content } = forms['0'].content[0];
    expect(content[0].content.drawingObject.text[0].text).toBe('a');
  });
  test('Array Single Form', () => {
    eqn.addForms(addForms.arraySingleForm);
    expect(forms).toHaveProperty('0');
    // expect(forms['0']).toHaveProperty('base');
    const { content } = forms['0'].content[0];
    expect(content[0].content.drawingObject.text[0].text).toBe('a');
    expect(content[1].content.drawingObject.text[0].text).toBe('b');
    expect(content[2].content.drawingObject.text[0].text).toBe('c');
  });
  test('Array Two Forms', () => {
    eqn.addForms(addForms.arrayTwoForms);
    expect(forms).toHaveProperty('0');
    expect(forms).toHaveProperty('1');
    // expect(forms['0']).toHaveProperty('base');
    // expect(forms['1']).toHaveProperty('base');
    expect(forms['0'].content[0].content[0].content).toBe(eqn._a);
    expect(forms['1'].content[0].content[0].content).toBe(eqn._b);
  });
  test('Nested Arrays', () => {
    eqn.addForms(addForms.nestedArrays);
    expect(forms['0'].content[0].content[0].content).toBe(eqn._a);
    expect(forms['0'].content[0].content[1].content).toBe(eqn._b);
    expect(forms['0'].content[0].content[2].content).toBe(eqn._c);
  });
  test('Methods', () => {
    eqn.addForms(addForms.methods);
    const content0 = forms['0'].content[0].content;
    expect(content0[0]).toBeInstanceOf(Fraction);
    expect(content0[0].content[1].content[0].content).toBe(eqn._a);
    expect(content0[0].content[2].content[0].content).toBe(eqn._b);
    expect(content0[0].content[0].content).toBe(eqn._v);
    const content1 = forms['1'].content[0].content;
    expect(content1).toEqual(content0);
    const content2 = forms['2'].content[0].content;
    expect(content2).toEqual(content0);
    const content3 = forms['3'].content[0].content;
    expect(content3).toEqual(content0);
  });
  test('Multi Method', () => {
    eqn.addForms(addForms.multiMethod);
    const { content } = forms['0'].content[0];
    expect(content[0]).toBeInstanceOf(Fraction);
    expect(content[0].content[1].content[0].content).toBe(eqn._a);
    expect(content[0].content[2].content[0].content).toBe(eqn._b);
    expect(content[0].content[0].content).toBe(eqn._v);
    expect(content[1].content).toBe(eqn._c);
    expect(content[2]).toBeInstanceOf(Fraction);
    expect(content[2].content[1].content[0].content).toBe(eqn._d);
    expect(content[2].content[2].content[0].content).toBe(eqn._e);
    expect(content[2].content[0].content).toBe(eqn._v1);
  });
  test('Nested Method', () => {
    eqn.addForms(addForms.nestedMethod);
    const { content } = forms['0'].content[0];
    expect(content[0]).toBeInstanceOf(Fraction);
    expect(content[0].content[2].content[0].content).toBe(eqn._b);
    expect(content[0].content[0].content).toBe(eqn._v);
    const contentN = content[0].content[1].content[0];
    expect(contentN.content[1].content[0].content).toBe(eqn._d);
  });
  test('Frac with scale', () => {
    eqn.addForms(addForms.fracWithScale);
    const content0 = forms['0'].content[0].content;
    expect(content0[0]).toBeInstanceOf(Fraction);
    // expect(content0[0].scaleModifier).toBe(0.5);
    const content1 = forms['1'].content[0].content;
    expect(content1).toEqual(content0);
  });
  test('Full Object', () => {
    eqn.addForms(addForms.fullObject);
    const { content } = forms['0'].content[0];
    expect(content[0].content.drawingObject.text[0].text).toBe('b');
    expect(content[1].content.drawingObject.text[0].text).toBe('a');
    expect(content[2].content.drawingObject.text[0].text).toBe('c');
    expect(forms['0'].elementMods.b.mods.color).toEqual(color1);
    expect(eqn._b.color).toEqual([1, 0, 0, 1]);
    eqn.showForm('0');
    expect(eqn._b.color).toEqual([0.95, 0, 0, 1]);
  });
  test('AddForms called multiple times', () => {
    eqn.addForms(addForms.addFormsMultipleTimes.first);
    eqn.addForms(addForms.addFormsMultipleTimes.second);
    expect(forms['0'].content[0].content[0].content).toBe(eqn._a);
    expect(forms['1'].content[0].content[0].content).toBe(eqn._b);
  });
  test('Create forms as part of initial euation creation', () => {
    const eqn1 = new Equation(figure.shapes, equationOptions);
    const forms1 = eqn1.eqn.forms;
    expect(forms1['0'].content[0].content[0].content).toBe(eqn1._a);
    expect(forms1['1'].content[0].content[0].content).toBe(eqn1._b);
    expect(eqn1.eqn.formSeries).toEqual({ base: ['0', '1'] });
  });
  test('Time', () => {
    eqn.addForms(addForms.time);
    expect(forms['0'].animation.duration).toBe(undefined);
    expect(forms['0'].fromForm).toEqual({});
    // expect(forms['0'].fromNext).toBe(undefined);
    expect(forms['1'].animation.duration).toBe(10);
    // expect(forms['1'].fromPrev).toBe(undefined);
    // expect(forms['1'].fromNext).toBe(undefined);
    expect(forms['1'].fromForm).toEqual({});
    expect(forms['2'].animation.duration).toBe(10);
    expect(forms['2'].fromForm.prev.animation.duration).toBe(20);
    expect(forms['2'].fromForm.next.animation.duration).toBe(30);
    expect(forms['3'].duration).toBe(undefined);
    expect(forms['2'].fromForm.prev.animation.duration).toBe(20);
    // expect(forms['3'].fromNext).toBe(undefined);
  });
  test('Element Modifications', () => {
    eqn.addForms(addForms.elementMods);
    expect(forms['0'].elementMods).toEqual({});
    expect(forms['1'].elementMods).toEqual({
      b: {
        element: eqn._b,
        mods: {
          color: color1,
          isTouchable: true,
          animate: { transform: { translation: { options: { magnitude: 2 } } } },
        },
      },
    });
  });
  test('Descriptions', () => {
    eqn.addForms(addForms.descriptions);
    expect(forms['0'].description).toBe('Form 0 description');
    expect(forms['1'].description).toBe('|Form| 1 |description|');
    expect(eqn.getDescription('1')).toBe('<span class="highlight_word"" style="color:rgba(255,0,0,0);">Form</span> 1 <span class="highlight_word">description</span>');
  });
  // Note, the letter a has the following bounds:
  //   width: 0.1,
  //   height: 0.103,
  //   descent: -0.008,
  //   ascent: top: 0.095,
  // The letter b has the following bounds:
  //   width: 0.1,
  //   height: 0.148,
  //   descent: -0.008,
  //   ascent: top: 0.14,
  test('All form options', () => {
    expect(eqn._a.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(eqn._a.getScale().round(3)).toEqual(new Point(1, 1));
    // debugger;
    eqn.addForms(addForms.allFormOptions);
    expect(forms['0'].description).toBe('|Form| 1 |description|');
    expect(eqn.getDescription('0', 'deg')).toBe('<span class="highlight_word"" style="color:rgba(255,0,0,0);">Form</span> 1 <span class="highlight_word">description</span>');
    const form = forms['0'];
    expect(form.elementMods.a.mods.color).toEqual(color1);
    expect(form.elementMods.a.mods.isTouchable).toEqual(true);
    expect(form.animation.duration).toEqual(1);
    expect(form.animation.translation.a.style).toBe('curved');
    expect(form.animation.translation.a.direction).toBe('up');
    expect(form.animation.translation.a.mag).toBe(0.95);
    expect(form.animation.translation.b.style).toBe('curved');
    expect(form.animation.translation.b.direction).toBe('down');
    expect(form.animation.translation.b.mag).toBe(0.45);

    eqn.showForm('0');
    // FixTo is b, 'center'. As 'a' and 'b' are both 0.1 width, and the scale
    // is 1.2, then the left position of a must be: 0.15 * 1.2 = -0.18
    expect(eqn._a.getPosition().round(3)).toEqual(new Point(-0.18, 0.01));
    expect(eqn._a.getScale().round(3)).toEqual(new Point(1.2, 1.2));
  });
});
