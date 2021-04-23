import {
  Point,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
// import * as colorTools from '../../tools/color';
import makeFigure from '../../__mocks__/makeFigure';
import { Equation } from './Equation';
// import EquationForm from './EquationForm';
import { Elements } from './Elements/Element';
import * as html from '../../tools/htmlGenerator';
// import Fraction from './Elements/Fraction';

tools.isTouchDevice = jest.fn();
jest.useFakeTimers();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

/* eslint-disable no-param-reassign, camelcase */
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
  let figure;
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
    figure = makeFigure();
    color1 = [0.95, 0, 0, 1];
    color2 = [0, 0.95, 0, 1];
    ways = {
      allOptions: () => {
        eqn = new Equation(figure.shapes, {
          color: [0.95, 0, 0, 1],            // default color of the equation
          // Default font for the equation. Note, there is no `style` option for
          // setting `italic` or `normal`. This can be set on an individual
          // element basis, otherwise it will automatically choose:
          //   - `italics`: if the element text has any letters in it
          //   - `normal`: if not (just numbers or symbols like '=')
          // None, some or all of the options can be used
          font: {
            family: 'Times New Roman',
            weight: '200',      // Use CSS weight definition strings
            size: 0.2,          // element space font height
          },
          // Scale of the equation - scale scales the sizes of the text as well
          // as the spaces between them in the layout. In comparison,
          // `font.size` will only change the size of the font. Set `font.size`
          // to be particular with the font size, and then scale for layout.
          // Note, scale will not impact dynamic symbol line widths.
          scale: 1,
          // equation transform
          transform: [['s', 1], ['r', 0], ['t', [0, 0]]],
          // equation position - will override translation in transform
          position: [0, 0],
          // Elements can be defined inline in `forms` or defined here. Define
          // here is there are lots of customizations to the element that will
          // make the form definition cluttered
          elements: {
            // Needed if no options change, but better off just doing an inline
            // defintion in the form
            a: 'a',
            // If using fancy characters or want to embed space in the element,
            // then can define key/text map directly,
            equals: ' = ',
            b: {                       // Full element definition
              text: ' b ',             // Text to show
              font: {                  // Customize the font
                style: 'normal',
                family: 'Helvetica',
                weight: 'bold',         // Use CSS weight definitions
                size: '0.2',            // Size is in element space units
              },
              family: 'Helvetica',
              color: [1, 0, 0, 1],      // Element color
              style: 'normal',          // `style`, `weight` and `size` can
              weight: 'bold',           //   also be defined outside of the
              size: '0.2',              //   font obj definition for cleanliness
              mods: {                   // Element mods
                isTouchable: true,
              },
            },
            // By default, element text is the same as key text
            c: { style: 'normal', color: [0, 1, 0, 1] },
            // Underscores can be used to define the same text with different
            // keys, so they can be moved independently. When keys are converted
            // to text, only the string after a leading underscore, and before
            // the first underscore (that's not a leading underscore) is used.
            // The next six elements will all have the same text, but will be
            // independant elements
            d: { color: [1, 0, 0, 1] },
            _d: { color: [1, 0, 0, 1] },
            d_: { color: [1, 0, 0, 1] },
            d_1: { color: [1, 0, 0, 1] },
            d_2: { color: [1, 0, 0, 1] },
            d_1_1: { color: [1, 0, 0, 1] },
            // Symbols can be defined
            v: { symbol: 'vinculum' },
            leftB: {
              symbol: 'brace',
              side: 'left',
              lineWidth: 0.01,
              sides: 10,
              width: 0.04,
              tipWidth: 0.01,
              draw: 'dynamic',
            },
            rightB: { symbol: 'brace', side: 'right' },
          },
          // Default form attributes
          formDefaults: {
            alignment: {
              // fixtTo a point in elementSpace, or an equation element.
              // The equation will then be aligned around this point or element.
              // In this case, we want the different forms to be alighned around
              // the `equals` element - so as we animate between forms the
              // `equals` element will stay in place.
              fixTo: ['equals'],
              xAlign: 'center',
              yAlign: 'middle',
            },
            // Default way to animate between forms
            // animation: {
            duration: 1,      // Use `null` for velocity
            translation: {    // How elements translate during animation
              c: { style: 'curved', direction: 'up', mag: 0.5 },
            },
            // },
            // What mods to apply to the individual elements
            // These mods will be set every time the form is shown (as
            // opposed to element definition mods above which are set
            // only on element creation).
            // Element mods can also be set on each form individually.
            elementMods: {
              b: { color: [1, 0, 0, 1] },   // define each element
              c: {
                isTouchable: true,
                color: [0, 0, 1, 1],
              },
            },
          },
          // Phrases are combinations of elements that can be used in forms to
          // make the forms simpler. This is especially useful for frequently
          // reused phrases within a form.
          // Each phrase must have a unique key compared to all the equation
          // elements
          phrases: {
            ab: ['a', 'b'],
            f: { frac: ['a', 'v', 'b'] },
            cf: ['c', 'f'],                // Phrases can use other phrases
            // Similar to forms, phrases can incorporate inline element
            // definitions
            '2x': ['_2', 'x'],
          },

          // An equation form defines how a collection of elements is laid out
          forms: {
            // A form can be just a single element
            simpleElement: 'a',
            // A form can be just a single phrase
            simplePhrase: '2x',
            // Three elements in a line
            simpleSequence: ['a', 'b', 'c'],
            // An array entry can be an object definition
            inlineFrac: [{ frac: ['a', 'v', '_2'] }, 'c'],
            // Simple elements that require few mods can be defined inline. In
            // this case `hello` is an element not defined in `addElements`, and
            // will be added as an element here, with text `hello` and all other
            // properties as default. Note, the unique id of this inline
            // definition is `hello`, and so it will be the same element in
            // other forms that use `hello`.
            inlineElementDefinition: ['a', 'equals', 'hello'],
            // If need multiple different elements with the same text as
            // an inline definition, then use underscores. This will produce
            // and equation `2a2` where the first and last `2` are unique
            // elements that can be animated independently
            inlineMultiDefinition: ['_2_1', 'a', '_2_2'],
            // Equals can be used as an object key, so it is a valid inline definition
            inlineEqualsElement: ['ab', '=', 'c'],
            // Elements can be fully defined inline as well, but be careful with
            // this as if just `m` is used in another form definition, only the
            // first forms definition will be stored in the `m` identifier.
            inlineFullDefinition: ['_a', { m: { style: 'normal' } }],
            // Symbols can be defined inline. `vinculum` is a special word and
            // cannot be used as keys for any elements. Use this for forms where
            // only one vinculum is required.
            inlineSymbol: { frac: ['a', 'vinculum', 'b'] },
            // Symbols can be defined inline with unique identifiers. In this
            // case we can refer to this vinculum as v1 in other locations.
            // Be careful to make sure this form is defined before other forms
            // that just use `v1`. Use this when more than one vinculum is in a
            // form, and/or you want to animate to another form and insure the
            // correct vinculum changes size to become the vinculum of the next
            // form
            inlineSymbolWithId: { frac: ['a', 'v1_vinculum', 'b'] },
            // Symbols can also be defined fully inline as objects, including
            // any additional properties. Usually would make sense to define
            // this in `addElements` to make forms less cluttered.
            inlineSymbolObject: {
              frac: [
                'a',
                { v2: { symbol: 'vinculum', color: [0, 0, 1, 1] } },
                'b',
              ],
            },
            // Spaces can be used directly - these are not elements and do not
            // need to be unique. Use singular or multiple spaces in a string.
            spaces: ['a', ' ', 'b', '   ', 'c'],
            // Forms can be defined as objects where the content key is the form
            // definition, and other keys are options
            objectDefinition: {
              content: 'c',
              alignment: {
                xAlign: 'right',
                yAlign: 'baseline',
              },
            },
            // Another example which will be used to test fullObject fromForm
            // override
            objectDef2: {
              content: 'c',
              elementMods: {
                c: { color: [0.5, 1, 0, 1] },
              },
              alignment: { xAlign: 'right', yAlign: 'baseline' },
            },
            // Full form object definition - the content key is required, but
            // all other keys are optional.
            fullObject: {
              content: ['b', 'c', 'd'],
              scale: 1.2,
              // Element mods specific to this form
              elementMods: {
                b: { color: [0, 1, 0, 1] },
              },
              // Descriptions are used in equation navigators
              description: '|Form| 2 |description|',
              // Text modifiers of the description
              modifiers: {
                Form: html.highlight([1, 0, 0, 0]),
              },
              // A form can have its own animation definition
              // animation: {
              duration: 4,     // use null for velocity
              translation: {
                b: ['curved', 'up', 0.3],
                c: { style: 'curved', direction: 'down', mag: 1 },
              },
              // },
              // A form can have it's own alignment definition
              alignment: {
                fixTo: 'b',
                xAlign: 'center',
                yAlign: 'baseline',
              },
              // The animation attributes and elementMods may be different if
              // animating from specific forms.
              fromForm: {
                objectDef2: {
                  // animation: {
                  duration: 2,
                  translation: {
                    c: { style: 'linear' },
                  },
                  // },
                  elementMods: {
                    b: { color: [0.5, 0, 1, 1] },
                    c: { color: [0.5, 0.5, 1, 1] },
                  },
                },
              },
            },
          },
          // Form Series are used by equation navigators to know the order of
          // forms to progress through. If only a single series is needed,
          // then simply define an array of strings, where each string is the
          // form name. If more than one series are needed, then use an object
          // where each key will identify a particular series
          formSeries: {
            a: ['simpleElement', 'simplePhrase', 'inlineSymbolWithId'],
            b: ['inlineEqualsElement', 'simpleSequence'],
          },
        });
      },
      allTextInConstructor: () => {
        eqn = new Equation(figure.shapes, {
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
      allTextInConstructorAllOptions: () => {
        eqn = new Equation(figure.shapes, {
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
        eqn = new Equation(figure.shapes, { color: color1 });
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
        eqn = new Equation(figure.shapes, { color: color1 });
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
        eqn = new Equation(figure.shapes, {
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
        eqn = new Equation(figure.shapes, {
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
        eqn = new Equation(figure.shapes, {
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
        eqn = new Equation(figure.shapes, { color: color1, scale: 0.95 });
        eqn.addForms({
          0: { frac: ['a', 'vinculum', 'b'] },
        });
      },
      autoSymbolsID: () => {
        eqn = new Equation(figure.shapes, { color: color1, scale: 0.95 });
        eqn.addForms({
          0: { frac: ['a', 'v_vinculum', 'b'] },
          // 2: ['a', 'b', { vinculum }],
        });
      },
      autoSymbolsObjectName: () => {
        eqn = new Equation(figure.shapes, { color: color1, scale: 0.95 });
        eqn.addForms({
          0: { frac: ['a', { vinculum: { color: color2 } }, 'b'] },
        });
      },
      autoSymbolsObjectID: () => {
        eqn = new Equation(figure.shapes, { color: color1, scale: 0.95 });
        eqn.addForms({  // eslint-disable-next-line camelcase
          0: { frac: ['a', { v_vinculum: { color: color2 } }, 'b'] },
        });
      },
    };
  });
  /*
  ....................................................##......##..
  ..................................................####....####..
  ....................................................##......##..
  ....................................................##......##..
  ....................................................##......##..
  ....................................................##......##..
  ..................................................######..######
  */
  // Note, the letter a has the following bounds:
  //   width: 0.1,
  //   height: 0.103,
  //   descent: -0.008,
  //   ascent: top: 0.095,
  // The string ' b ' has the following bounds:
  //   width: 0.3,
  //   height: 0.148,
  //   descent: -0.008,
  //   ascent: top: 0.14,
  // Note, no matter the length of the text, the test mock will always return
  // the same dimensions
  describe('All Options', () => {
    let aWidth;
    // let aAsc;
    // let aDes;
    let aHeight;
    // let bAsc;
    let bDes;
    let bHeight;
    beforeEach(() => {
      ways.allOptions();
      figure.elements.add('eqn', eqn);
      figure.initialize();
      aWidth = 0.1;
      aHeight = 0.103;
      // aAsc = 0.095;
      // aDes = 0.008;
      // bAsc = 0.14;
      bDes = 0.008;
      bHeight = 0.148;
    });
    test('simpleElement', () => {
      eqn.showForm('simpleElement');
      figure.setFirstTransform();
      const a = eqn._a;
      const rect = a.getBoundingRect('figure');
      expect(round(rect.left, 4)).toBe(round(-aWidth / 2, 4));
      expect(round(rect.right, 4)).toBe(round(aWidth / 2, 4));
      expect(round(rect.bottom, 4)).toBe(round(-aHeight / 2, 4));
      expect(round(rect.top, 4)).toBe(round(aHeight / 2, 4));
    });
    test('simplePhrase', () => {
      eqn.showForm('simplePhrase');
      figure.setFirstTransform();
      const _2 = eqn.__2.getBoundingRect('figure');
      const _x = eqn._x.getBoundingRect('figure');
      const w = _2.width + _x.width;
      expect(round(_2.left, 4)).toBe(round(-w / 2, 4));
      expect(round(_x.right, 4)).toBe(round(w / 2, 4));
      expect(round(_2.bottom, 4)).toBe(round(-bHeight / 2, 4));
      expect(round(_2.top, 4)).toBe(round(bHeight / 2, 4));
    });
    test('simpleSequence', () => {
      eqn.showForm('simpleSequence');
      figure.setFirstTransform();
      const a = eqn._a.getBoundingRect('figure');
      const b = eqn._b.getBoundingRect('figure');
      const c = eqn._c.getBoundingRect('figure');
      const w = a.width + b.width + c.width;
      expect(round(a.left, 4)).toBe(round(-w / 2, 4));
      expect(round(c.right, 4)).toBe(round(w / 2, 4));
      expect(round(b.bottom, 4)).toBe(round(-bHeight / 2, 4));
      expect(round(b.top, 4)).toBe(round(bHeight / 2, 4));
    });
    test('inlineFrac', () => {
      eqn.showForm('inlineFrac');
      figure.setFirstTransform();
      const a = eqn._a.getBoundingRect('figure');
      const v = eqn._v.getBoundingRect('figure');
      const _2 = eqn.__2.getBoundingRect('figure');
      const c = eqn._c.getBoundingRect('figure');
      const w = v.width + c.width;
      const h = a.top - _2.bottom;
      expect(round(v.left, 4)).toBe(round(-w / 2, 4));
      expect(round(c.right, 4)).toBe(round(w / 2, 4));
      expect(round(_2.bottom, 4)).toBe(round(-h / 2, 4));
      expect(round(a.top, 4)).toBe(round(h / 2, 4));
    });
    test('inlineElementDefinition', () => {
      eqn.showForm('inlineElementDefinition');
      figure.setFirstTransform();
      const a = eqn._a.getBoundingRect('figure');
      const equals = eqn._equals.getBoundingRect('figure');
      const hello = eqn._hello.getBoundingRect('figure');
      const w = a.width + equals.width + hello.width;
      expect(round(a.left, 4)).toBe(round(-w / 2, 4));
      expect(round(equals.left, 4)).toBe(round(a.right, 4));
      expect(round(hello.right, 4)).toBe(round(w / 2, 4));
    });
    test('inlineMultiDefinition', () => {
      eqn.showForm('inlineMultiDefinition');
      figure.setFirstTransform();
      const a = eqn._a.getBoundingRect('figure');
      const _2_1 = eqn.__2_1.getBoundingRect('figure');
      const _2_2 = eqn.__2_2.getBoundingRect('figure');
      const w = a.width + _2_1.width + _2_2.width;
      expect(round(_2_1.left, 4)).toBe(round(-w / 2, 4));
      expect(round(_2_2.right, 4)).toBe(round(w / 2, 4));
      expect(eqn.__2_1.drawingObject.text[0].text).toBe('2');
      expect(eqn.__2_2.drawingObject.text[0].text).toBe('2');
    });
    test('inlineEqualsElement', () => {
      eqn.showForm('inlineEqualsElement');
      figure.setFirstTransform();
      const a = eqn._a.getBoundingRect('figure');
      const b = eqn._b.getBoundingRect('figure');
      const equals = eqn['_='].getBoundingRect('figure');
      const c = eqn._c.getBoundingRect('figure');
      const w = a.width + b.width + equals.width + c.width;
      expect(round(a.left, 4)).toBe(round(-w / 2, 4));
      expect(round(a.right, 4)).toBe(round(b.left, 4));
      expect(round(b.right, 4)).toBe(round(equals.left, 4));
      expect(round(equals.right, 4)).toBe(round(c.left, 4));
      expect(round(c.right, 4)).toBe(round(w / 2, 4));
      expect(eqn['_='].drawingObject.text[0].text).toBe('=');
    });
    test('inlineFullDefinition', () => {
      eqn.showForm('inlineFullDefinition');
      figure.setFirstTransform();
      const a = eqn._a.getBoundingRect('figure');
      const m = eqn._m.getBoundingRect('figure');
      const w = [a, m].reduce((sum, e) => sum + e.width, 0);
      expect(round(a.left, 4)).toBe(round(-w / 2, 4));
      expect(round(a.right, 4)).toBe(round(m.left, 4));
      expect(round(m.right, 4)).toBe(round(w / 2, 4));
      expect(eqn._m.drawingObject.text[0].font.style).toBe('normal');
    });
    test('inlineSymbol', () => {
      eqn.showForm('inlineSymbol');
      figure.setFirstTransform();
      const a = eqn._a.getBoundingRect('figure');
      const v = eqn._vinculum.getBoundingRect('figure');
      const b = eqn._b.getBoundingRect('figure');
      const h = a.top - b.bottom;
      expect(round(v.left, 4)).toBe(round(-v.width / 2, 4));
      expect(round(v.right, 4)).toBe(round(v.width / 2, 4));
      expect(round(b.bottom, 4)).toBe(round(-h / 2, 4));
      expect(round(a.top, 4)).toBe(round(h / 2, 4));
      expect(round(a.bottom, 4)).toBe(round(v.top + 0.05, 4));
      expect(round(b.top, 4)).toBe(round(v.bottom - 0.05, 4));
    });
    test('inlineSymbolWithId', () => {
      eqn.showForm('inlineSymbolWithId');
      figure.setFirstTransform();
      const a = eqn._a.getBoundingRect('figure');
      const v = eqn._v1.getBoundingRect('figure');
      const b = eqn._b.getBoundingRect('figure');
      const h = a.top - b.bottom;
      expect(round(v.left, 4)).toBe(round(-v.width / 2, 4));
      expect(round(v.right, 4)).toBe(round(v.width / 2, 4));
      expect(round(b.bottom, 4)).toBe(round(-h / 2, 4));
      expect(round(a.top, 4)).toBe(round(h / 2, 4));
      expect(round(a.bottom, 4)).toBe(round(v.top + 0.05, 4));
      expect(round(b.top, 4)).toBe(round(v.bottom - 0.05, 4));
    });
    test('inlineSymbolObject', () => {
      eqn.showForm('inlineSymbolObject');
      figure.setFirstTransform();
      const a = eqn._a.getBoundingRect('figure');
      const v = eqn._v2.getBoundingRect('figure');
      const b = eqn._b.getBoundingRect('figure');
      const h = a.top - b.bottom;
      expect(round(v.left, 4)).toBe(round(-v.width / 2, 4));
      expect(round(v.right, 4)).toBe(round(v.width / 2, 4));
      expect(round(b.bottom, 4)).toBe(round(-h / 2, 4));
      expect(round(a.top, 4)).toBe(round(h / 2, 4));
      expect(round(a.bottom, 4)).toBe(round(v.top + 0.05, 4));
      expect(round(b.top, 4)).toBe(round(v.bottom - 0.05, 4));
    });
    test('spaces', () => {
      eqn.showForm('spaces');
      figure.setFirstTransform();
      const a = eqn._a.getBoundingRect('figure');
      const b = eqn._b.getBoundingRect('figure');
      const c = eqn._c.getBoundingRect('figure');
      const w = c.right - a.left;
      expect(round(a.left, 4)).toBe(round(-w / 2, 4));
      expect(round(c.right, 4)).toBe(round(w / 2, 4));
      expect(round(a.right, 4)).toBe(round(b.left - 0.03, 4));
      expect(round(b.right, 4)).toBe(round(c.left - 0.03 * 3, 4));
    });
    describe('fullObject', () => {
      let b;
      let c;
      let d;
      let w;
      beforeEach(() => {
        eqn.showForm('fullObject');
        figure.setFirstTransform();
        b = eqn._b.getBoundingRect('figure');
        c = eqn._c.getBoundingRect('figure');
        d = eqn._d.getBoundingRect('figure');
        w = [b, c, d].reduce((sum, e) => sum + e.width, 0);
      });
      test('alignment', () => {
        expect(round(b.left, 4)).toBe(round(-b.width / 2, 4));
        expect(round(d.right, 4)).toBe(round(w - b.width / 2, 4));
        expect(round(b.bottom, 4)).toBe(round(-bDes * 1.2, 4));
      });
      test('scale', () => {
        expect(round(b.width, 4)).toBe(0.3 * 1.2);
      });
      test('elementMods', () => {
        expect(round(eqn._b.color, 4)).toEqual([0, 1, 0, 1]);
        expect(round(eqn._c.color, 4)).toEqual([0, 0, 1, 1]);
      });
      test('animation - form duration and curve', () => {
        eqn.showForm('objectDefinition');
        figure.setFirstTransform();
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(-0.1, 0));
        // Duration will be ignored as it is defined in the form
        eqn.goToForm({ form: 'fullObject', duration: 10, animate: 'move' });
        figure.mock.timeStep(0);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(-0.1, 0));
        figure.mock.timeStep(1);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(-0.072, -0.05));
        figure.mock.timeStep(1);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(0.04, -0.14));
        figure.mock.timeStep(1);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(0.152, -0.05));
        figure.mock.timeStep(1);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(0.18, 0));
      });
      test('animation - form duration override from goTo', () => {
        eqn.showForm('objectDefinition');
        figure.setFirstTransform();
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(-0.1, 0));
        eqn.goToForm({
          form: 'fullObject',
          duration: 1,
          animate: 'move',
          prioritizeFormDuration: false,
        });
        figure.mock.timeStep(0);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(-0.1, 0));
        figure.mock.timeStep(0.25);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(-0.072, -0.05));
        figure.mock.timeStep(0.25);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(0.04, -0.14));
        figure.mock.timeStep(0.25);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(0.152, -0.05));
        figure.mock.timeStep(0.25);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(0.18, 0));
      });
      test('animation - fromForm override animation and color', () => {
        eqn.showForm('objectDef2');
        figure.setFirstTransform();
        expect(round(eqn._c.color, 3)).toEqual(round([0.5, 1, 0, 1], 3));
        expect(round(eqn._b.color, 3)).toEqual(round([1, 0, 0, 1], 3));
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(-0.1, 0));
        // Duration will be ignored as it is defined in the form
        eqn.goToForm({ form: 'fullObject', duration: 10, animate: 'move' });
        figure.mock.timeStep(0);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(-0.1, 0));
        figure.mock.timeStep(0.5);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(-0.072, 0));
        figure.mock.timeStep(0.5);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(0.04, 0));
        figure.mock.timeStep(0.5);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(0.152, 0));
        figure.mock.timeStep(0.5);
        expect(eqn._c.getPosition().round(3)).toEqual(new Point(0.18, 0));
        figure.mock.timeStep(1);
        expect(round(eqn._c.color, 3)).toEqual(round([0.5, 0.5, 1, 1], 3));
        expect(round(eqn._b.color, 3)).toEqual(round([0.5, 0, 1, 1], 3));
      });
    });
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
    const originBasline = eqn._a.getPosition('figure');
    eqn.showForm('aCenterTop');
    const aCenterTop = eqn._a.getPosition('figure');
    eqn.showForm('aRightMiddle');
    const aRightMiddle = eqn._a.getPosition('figure');
    eqn.showForm('bRightBottom');
    const bRightBottom = eqn._a.getPosition('figure');

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
    expect(round(eqn._vinculum.drawingObject.points, 3)).toEqual([
      0, 0, 0, 0.01, 0.19, 0, 0.19, 0.01,
    ]);
    expect(eqn._vinculum.color).toEqual(color1);
  });
  test('Auto Symbols ID', () => {
    ways.autoSymbolsID();
    expect(round(eqn._v.drawingObject.points, 3)).toEqual([
      0, 0, 0, 0.01, 0.19, 0, 0.19, 0.01,
    ]);
    expect(eqn._v.color).toEqual(color1);
  });
  test('Auto Symbols Object Name', () => {
    ways.autoSymbolsObjectName();
    expect(round(eqn._vinculum.drawingObject.points, 3)).toEqual([
      0, 0, 0, 0.01, 0.19, 0, 0.19, 0.01,
    ]);
    expect(eqn._vinculum.color).toEqual(color2);
  });
  test('Auto Symbols Object ID', () => {
    ways.autoSymbolsObjectID();
    expect(round(eqn._v.drawingObject.points, 3)).toEqual([
      0, 0, 0, 0.01, 0.19, 0, 0.19, 0.01,
    ]);
    expect(eqn._v.color).toEqual(color2);
  });
});
