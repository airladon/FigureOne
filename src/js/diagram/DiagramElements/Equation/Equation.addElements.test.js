import {
  Point, // Rect,
} from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import * as tools from '../../../tools/tools';
import makeDiagram from '../../../__mocks__/makeDiagram';
import { EquationNew } from './Equation';
import {
  DiagramFont,
} from '../../DrawingObjects/TextObject/TextObject';
import VertexHorizontalLine from '../../DrawingObjects/VertexObject/VertexHorizontalLine';
// import {
//   DiagramElementCollection,
// } from '../../Element';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

describe('Diagram Equations From Object', () => {
  let diagram;
  let eqn;
  let addElements;
  let color1;
  let color2;
  let defaultColor;
  beforeEach(() => {
    diagram = makeDiagram();
    eqn = new EquationNew(diagram.shapes);
    color1 = [0.95, 0, 0, 1];
    color2 = [0, 0.95, 0, 1];
    defaultColor = [0.5, 0.5, 0.5, 1];
    addElements = {
      // Simplest way to define elements is to just use text
      simple: {
        a: 'a',
        b: 'b',
        c: 'c',
      },
      // Different elements can be added at different times
      add1: {
        a: 'a',
        b: 'b',
      },
      add2: {
        c: 'c',
      },
      // Fonts will be italic for text and normal for numbers and known words
      autoFontSelection: {
        a: 'a',
        _1: '1',
      },
      // Elements can also be defined in object form
      simpleObject: {
        a: 'a',
        b: {
          text: 'b',
        },
      },
      // Options can be used in the object to override default options
      textOverrides: {
        a: 'a',
        b: {
          text: 'b',
          style: 'normal',
        },
        c: {
          text: 'c',
          font: new DiagramFont(
            'Helvetica', 'normal',
            0.3, '300', 'right', 'alphabetic', color1,
          ),
        },
        d: {         // font overrides style, color overrides font
          text: 'd',
          style: 'normal',
          color: color2,
          font: new DiagramFont(
            'Helvetica', 'italic',
            0.3, '300', 'right', 'alphabetic', color1,
          ),
        },
      },
      // Equation symbols are DiagramElementPrimatives or Collections
      symbols: {     // Symbols can be auto generated from string, or passed in
        a: 'a',
        v: { symbol: 'vinculum' },
        v1: eqn.eqn.symbols.vinculum(),
        v2: diagram.shapes.horizontalLine(new Point(0, 0), 1, 0.1, 0, defaultColor),
      },
      // Elements all become DiagramElementPrimatives/Collections and their
      // properties can be overwritten with elementOptions
      elementOptions: {
        a: 'a',
        b: {
          text: 'b',
          color: color1,
          mods: {
            isTouchable: true,
          },
        },
        v: {
          symbol: 'vinculum',
          color: color1,
          mods: {
            isTouchable: true,
          },
        },
      },
      vinculum: {
        v: { symbol: 'vinculum', color: color1 },
      },
      strike: {
        s: { symbol: 'strike', color: color1 },
      },
      xStrike: {
        x: { symbol: 'xStrike', color: color1 },
      },
    };
  });
  test('Equation instantiation', () => {
    expect(eqn).not.toBe(null);
  });
  test('Simple text only', () => {
    eqn.addElements(addElements.simple);
    expect(eqn._a).not.toBe(null);
    expect(Object.keys(eqn.elements).length).toBe(3);
    expect(eqn._a.drawingObject.text[0].text).toBe('a');
    expect(eqn._a.drawingObject.text[0].font.style).toBe('italic');
    // expect(eqn.__2.drawingObject.text[0].font.style).toBe('normal');
    // console.log(eqn._a.drawingObject.text[0])
    // expect(eqn._a.drawingObject.text[0])
  });
  test('Multi add steps', () => {
    eqn.addElements(addElements.add1);
    eqn.addElements(addElements.add2);
    expect(eqn._a.drawingObject.text[0].text).toBe('a');
    expect(eqn._b.drawingObject.text[0].text).toBe('b');
    expect(eqn._c.drawingObject.text[0].text).toBe('c');
  });
  test('Italics for text, normal for numbers', () => {
    eqn.addElements(addElements.autoFontSelection);
    expect(eqn._a.drawingObject.text[0].font.style).toBe('italic');
    expect(eqn.__1.drawingObject.text[0].font.style).toBe('normal');
  });
  test('Simple object definition', () => {
    eqn.addElements(addElements.simpleObject);
    expect(eqn._a.drawingObject.text[0].text).toBe('a');
    expect(eqn._b.drawingObject.text[0].text).toBe('b');
  });
  test('Text Overrides', () => {
    eqn.addElements(addElements.textOverrides);
    expect(eqn._a.drawingObject.text[0].text).toBe('a');
    expect(eqn._b.drawingObject.text[0].text).toBe('b');
    expect(eqn._c.drawingObject.text[0].text).toBe('c');
    expect(eqn._d.drawingObject.text[0].text).toBe('d');

    expect(eqn._a.drawingObject.text[0].font.style).toBe('italic');
    expect(eqn._b.drawingObject.text[0].font.style).toBe('normal');
    expect(eqn._c.drawingObject.text[0].font.style).toBe('normal');
    expect(eqn._d.drawingObject.text[0].font.style).toBe('italic');

    expect(eqn._a.drawingObject.text[0].font.family).toBe('Times New Roman');
    expect(eqn._b.drawingObject.text[0].font.family).toBe('Times New Roman');
    expect(eqn._c.drawingObject.text[0].font.family).toBe('Helvetica');
    expect(eqn._d.drawingObject.text[0].font.family).toBe('Helvetica');

    expect(eqn._a.drawingObject.text[0].font.color)
      .toEqual(defaultColor);
    expect(eqn._b.drawingObject.text[0].font.color)
      .toEqual(defaultColor);
    expect(eqn._c.drawingObject.text[0].font.color)
      .toEqual(color1);
    expect(eqn._d.drawingObject.text[0].font.color)
      .toEqual(color2);
  });
  test('Symbol', () => {
    eqn.addElements(addElements.symbols);
    expect(eqn._a.drawingObject.text[0].text).toBe('a');
    expect(eqn._v.drawingObject).toBeInstanceOf(VertexHorizontalLine);
    expect(eqn._v1.drawingObject).toBeInstanceOf(VertexHorizontalLine);
    expect(eqn._v2.drawingObject).toBeInstanceOf(VertexHorizontalLine);
  });
  test('ElementOptions', () => {
    eqn.addElements(addElements.elementOptions);
    expect(eqn._a.drawingObject.text[0].text).toBe('a');
    expect(eqn._b.drawingObject.text[0].text).toBe('b');
    expect(eqn._v.drawingObject).toBeInstanceOf(VertexHorizontalLine);

    expect(eqn._a.isTouchable).toBe(false);
    expect(eqn._b.isTouchable).toBe(true);
    expect(eqn._v.isTouchable).toBe(true);

    expect(round(eqn._a.color)).toEqual(round([0.5, 0.5, 0.5, 1]));
    expect(eqn._b.color).toEqual(color1);
    expect(eqn._v.color).toEqual(color1);
  });
  test('Create elements as part of initial diagram', () => {
    const equationOptions = {
      elements: addElements.simple,
    };
    const eqn1 = new EquationNew(diagram.shapes, equationOptions);
    expect(eqn1._a.drawingObject.text[0].text).toBe('a');
    expect(eqn1._b.drawingObject.text[0].text).toBe('b');
    expect(eqn1._c.drawingObject.text[0].text).toBe('c');
  });
  test('Symbol: Vinculum', () => {
    eqn.addElements(addElements.vinculum);
    expect(eqn._v.drawingObject).toBeInstanceOf(VertexHorizontalLine);
    expect(eqn._v.color).toEqual(color1);
  });
  test('Symbol: Strike', () => {
    eqn.addElements(addElements.strike);
    expect(eqn._s.drawingObject).toBeInstanceOf(VertexHorizontalLine);
    expect(eqn._s.color).toEqual(color1);
  });
  test('Symbol: xStrike', () => {
    eqn.addElements(addElements.xStrike);
    expect(eqn._x._s1.drawingObject).toBeInstanceOf(VertexHorizontalLine);
    expect(eqn._x._s2.drawingObject).toBeInstanceOf(VertexHorizontalLine);
    expect(eqn._x.color).toEqual(color1);
  });
});
