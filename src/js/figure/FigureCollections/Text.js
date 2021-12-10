// @flow

// import Figure from '../Figure';
import {
  Transform, Point, isBuffer, getBorder, getBuffer,
  // getPoint, getTransform,
} from '../../tools/g2';
import type { TypeParsablePoint, TypeParsableBuffer, TypeParsableBorder } from '../../tools/g2';
import { joinObjects, splitString } from '../../tools/tools';
import { areColorsWithinDelta } from '../../tools/color';
// import {
//   FigureElementCollection, FigureElementPrimitive,
// } from '../Element';
// import type {
//   TypeText,
// } from '../FigurePrimitives/FigurePrimitiveTypes';
import type {
  OBJ_Font, OBJ_Font_Fixed, TypeColor,
} from '../../tools/types';
import type FigureCollections from './FigureCollections';
import type { EQN_EquationElements, EQN_Forms } from '../Equation/Equation';
import type { TypeEquationPhrase } from '../Equation/EquationFunctions';
import { Equation } from '../Equation/Equation';
import { FigureFont } from '../DrawingObjects/TextObject/TextObject';
import type {
  OBJ_Collection,
} from '../FigurePrimitives/FigurePrimitiveTypes';

/**
 * Formatted Text line definition object.
 *
 * Used to define a line of text in {@link OBJ_FormattedText}.
 *
 * @property {string} [text] string representing a line of text
 * @property {OBJ_Font} [font] line specific default font
 * @property {number} [lineSpace] line specific separation from top of
 * previous line to baseline of this line
 * @property {number} [baselineSpace] line specific separation from baseline of
 * this previous line to baseline of this line
 */
export type OBJ_TextLineDefinition = {
  text: string,
  font?: OBJ_Font,
  lineSpace?: number,
  baselineSpace?: number,
};

/**
 * Text modifier definition object.
 *
 * Used to define the modifiers of a string within a formatted text element
 * {@link OBJ_FormattedText}.
 *
 * @property {string} [text] text to replace `modifierId` with - if `undefined`
 * then `modifierId` is used
 * @property {TypeParsablePoint} [offset] text offset
 * @property {OBJ_Font} [font] font changes for modified text
 * @property {boolean} [inLine] `false` if modified text should not contribute
 * to line layout (default: `true`)
 * @property {string | function(): void} [onClick] function to execute on click
 * within the `touchBorder` of the modified text
 * @property {TypeParsableBuffer | boolean} [touch] use `true` to enable touch
 * or a buffer to enable touch and define the touchBorder (`false`)
 * buffer (`TypeParsableBuffer`) around the rectangle (default: `'0'`)
 * @property {number} [space] additional space to right of text
 * @property {TypeEquationPhrase} [eqn] use this to replace the text with an
 * equation defined by an equation phrase - when using eqn the `font` property
 * will be ignored
 */
export type OBJ_TextModifiersDefinition = {
  text?: string,
  offset?: TypeParsablePoint,
  inLine?: boolean,
  font?: OBJ_Font,
  touch?: boolean | TypeParsableBuffer,
  onClick?: string | () => void,
  space?: number,
  eqn?: TypeEquationPhrase,
};

/* eslint-disable max-len */
/**
 * {@link FormattedText} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
 *
 * ![](./apiassets/ftext1.png)
 *
 * ![](./apiassets/ftext2.png)
 *
 * ![](./apiassets/ftext3.png)
 *
 * ![](./apiassets/ftext4.gif)
 *
 * ![](./apiassets/ftext5.png)
 *
 * ![](./apiassets/ftext6.gif)
 *
 * Formatted text allows:
 *   - Use of more than one font
 *   - Multi-line text
 *   - Embedded equations
 *   - Interactivity on select strings
 *
 * If `text` is defined as an array of strings of line definition objects, then
 * each element of the array will be a new line of text.
 *
 * All text will be laid out with the default font (or default line font if a
 * line definition object is used).
 *
 * To modify the font of portions of text within a line, surround the text to
 * modify with '|' characters. The string surrounded by the '|' characters will
 * then be a unique identifier that can be referenced in the `modifiers`
 * property which will then allow for replacing that text with some other text,
 * changing the font of the text, changing the touchability of the text and/or
 * replacing the text with an embedded equation.
 *
 * If a string is surrounded by '|' characters but not defined in `modifiers`
 * then that string will have the formmating of the `accent` property applied
 * to it.
 *
 * @property {Array<string | OBJ_TextLineDefinition> | string} [text] array of
 * line strings - single string is single line only.
 * @property {OBJ_TextModifiersDefinition} [modifiers] modifier definitions
 * @property {OBJ_Font} [font] Default font to use in lines
 * @property {TypeParsableBuffer} [defaultTextTouchBorder] default buffer for
 * `touch` property in {@link OBJ_TextModifiersDefinition}
 * @property {EQN_EquationElements} [elements] equation elements to use within
 * the equation phrases defined in `modifiers`
 * @property {'left' | 'right' | 'center} [justify] justification of lines
 * (`left`)
 * @property {number} [lineSpace] Space between ascent of each line with
 * descent of previous line (`font.size * 0.5`)
 * @property {number} [baselineSpace] Space between baselines of lines. This
 * will override `lineSpace` for all lines including individual line settings
 * (`undefined`)
 * @property {'left' | 'right' | 'center'} [xAlign] horizontal alignment of
 * lines with `position` (`left`)
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] vertical
 * alignment of lines with `position` (`baseline`)
 * @property {TypeParsableBuffer | TypeParsableBorder | 'children' | 'rect' | number} [border]
 * border used for keeping shape within limits (`'draw'`)
 * @property {TypeParsableBuffer | TypeParsableBorder | 'border' | 'children' | 'rect' | number} [touchBorder]
 * border used for determining shape was touched. `number` and `'rect'` use
 * the the points in `'buffer'` to calculate the bounding rects (`'buffer'`).
 * @property {OBJ_Font} [accent] default modifier for accented text without a
 * specific modification. By default accented text will be italic.
 *
 * @extends OBJ_Collection
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * // Accent a word
 * figure.add({
 *   make: 'ftext',
 *   text: 'Hello |World|',
 * });
 *
 * @example
 * // Multi-line center justified
 * figure.add({
 *   make: 'ftext',
 *   text: ['First line', 'Second line'],
 *   justify: 'center',
 * });
 *
 * @example
 * // Modifiers
 * figure.add({
 *   make: 'ftext',
 *   text: ['|First| |line|', 'Second |line2|'],
 *   modifiers: {
 *     First: { font: { underline: 'true', color: [0, 0.7, 0.7, 1] } },
 *     line: { font: { color: [0, 0, 1, 1] } },
 *     line2: { text: 'line', font: { color: [0, 0.7, 0, 1], style: 'italic' } },
 *   },
 * });
 *
 * @example
 * // Interactive words in formatted text
 * figure.add({
 *   make: 'ftext',
 *   text: 'Touch |here| or |here2|',
 *   modifiers: {
 *     here: {
 *       font: { underline: true, color: [0, 0, 1, 1] },
 *       touch: 0.1,
 *       onClick: () => console.log('here 1'),
 *     },
 *     here2: {
 *       text: 'here',
 *       font: { underline: true, color: [0, 0.8, 0, 1] },
 *       touch: 0.1,
 *       onClick: () => console.log('here 2'),
 *     },
 *   },
 *   xAlign: 'center',
 * });
 *
 * @example
 * // Embedded equation (inline form definition)
 * figure.add({
 *   make: 'ftext',
 *   text: '|root2| is irrational',
 *   modifiers: {
 *     root2: { eqn: { root: ['radical', '2'] } },
 *   },
 *   xAlign: 'center',
 * });
 *
 * @example
 * // Embedded equation with defined, touchable elements
 * figure.add({
 *   name: 't',
 *   make: 'ftext',
 *   text: ['A fraction is |fraction|', 'Touch it!'],
 *   modifiers: {
 *     fraction: {
 *       eqn: {
 *         scale: [{ frac: ['num', 'v', 'den'] }, 0.7],
 *       },
 *       offset: [0, 0.2],
 *       touch: 0.1,
 *       onClick: () => figure.get('t').pulse({
 *         elements: ['num', 'den', 'v'],
 *         centerOn: 'v',
 *         xAlign: 'left',
 *         scale: 1.3,
 *       }),
 *       space: 0.3,
 *     },
 *   },
 *   elements: {
 *     num: 'numerator',
 *     den: { text: 'denominator', color: [0, 0, 1, 1], style: 'italic' },
 *     v: { symbol: 'vinculum' },
 *   },
 *   xAlign: 'center',
 * });
 */
/* eslint-enable max-len */
export type OBJ_FormattedText = {
  text?: Array<string | OBJ_TextLineDefinition> | string,
  modifiers?: OBJ_TextModifiersDefinition | { eqn?: TypeEquationPhrase },
  elements?: EQN_EquationElements,
  font?: OBJ_Font,
  defaultTextTouchBorder?: TypeParsableBuffer,
  justify?: 'left' | 'center' | 'right',
  lineSpace?: number,
  baselineSpace?: number,
  xAlign?: 'left' | 'right' | 'center',
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
  border?: TypeParsableBuffer | TypeParsableBorder | 'children' | 'rect' | number;
  touchBorder?: TypeParsableBuffer | TypeParsableBorder | 'border' | 'children' | 'rect' | number;
  accent?: OBJ_Font,
} & OBJ_Collection;

// $FlowFixMe
class CollectionsText extends Equation {
  _eqn: Equation;

  font: OBJ_Font_Fixed;
  accent: OBJ_Font;
  justify: 'left' | 'right' | 'center';
  lineSpace: number | null;
  lines: Array<Object>;
  modifiers: Object;
  baselineSpace: number | null;
  defaultTextTouchBorder: TypeParsableBuffer;
  xAlign: 'left' | 'right' | 'center';
  yAlign: 'bottom' | 'top' | 'middle' | 'baseline';
  touchCounter: number;

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: Object,
  ) {
    const defaultOptions = {
      color: collections.primitives.defaultColor,
      font: collections.primitives.defaultFont,
      justify: 'left',
      lineSpace: null,
      transform: new Transform().scale(1).rotate(0).translate(0, 0),
      scale: 1,
      formDefaults: {
        alignment: {
          fixTo: new Point(0, 0),
          xAlign: 'left',
          yAlign: 'baseline',
        },
        elementMods: {},
        layout: 'always',
      },
      accent: {},
      baselineSpace: null,
      defaultTextTouchBorder: 0,
    };
    delete defaultOptions.font.color;

    const options = joinObjects({}, defaultOptions, optionsIn);
    const elementsBackup = options.elements;
    delete options.elements;
    super(collections.primitives, joinObjects({}, options));
    options.elements = elementsBackup;
    this.xAlign = 'left';
    this.yAlign = 'baseline';
    this.font = joinObjects({}, collections.primitives.defaultFont);
    this.justify = 'left';
    this.modifiers = {};
    this.accent = { style: 'italic' };
    this.baselineSpace = null;
    this.lineSpace = null;
    this.lines = [];
    this.defaultTextTouchBorder = 0;
    this.collections = collections;
    this.touchCounter = 0;
    this.setText(options);
  }

  fontUpdated() {
    super.fontUpdated();
    this.clear();
    this.layoutForms('all');
  }

  setText(optionsIn: OBJ_FormattedText) {
    const defaultOptions = {
      color: this.color.slice(),
      font: this.font,
      justify: this.justify,
      lineSpace: this.lineSpace,
      scale: this.eqn.scale,
      formDefaults: {
        alignment: {
          fixTo: new Point(0, 0),
          xAlign: this.xAlign,
          yAlign: this.yAlign,
        },
        elementMods: {},
        layout: 'always',
      },
      accent: this.accent,
      baselineSpace: this.baselineSpace,
      defaultTextTouchBorder: this.defaultTextTouchBorder,
      reform: true,
      text: '',
    };

    // Careful, I think memory is not being fully garbage collected here...
    // use sparingly
    const options = joinObjects({}, defaultOptions, optionsIn);
    options.textFont = options.font;
    if (options.reform) {
      this.cleanupForms();
    }
    if (options.xAlign != null) {
      this.eqn.formDefaults.alignment.xAlign = options.xAlign;
      this.xAlign = options.xAlign;
    }
    if (options.yAlign != null) {
      this.eqn.formDefaults.alignment.yAlign = options.yAlign;
      this.yAlign = options.yAlign;
    }

    // if (optionsIn.color != null) {
    //   options.color = optionsIn.color;
    // }
    // if (optionsIn.font != null && optionsIn.font.color != null) {
    //   options.color = optionsIn.font.color;
    // }

    this.font = options.font;
    if (optionsIn.font != null && optionsIn.font.color != null) {
      this.font.color = optionsIn.font.color;
      this.color = this.font.color.slice();
    } else if (optionsIn.color != null) {
      this.font.color = optionsIn.color;
      this.color = this.font.color.slice();
    } else {
      this.font.color = this.color;
    }
    if (options.lineSpace == null) {
      options.lineSpace = options.font.size * 0.5;
    }
    // this.eqn.textFont = new FigureFont(joinObjects({}, this.font));
    this.lineSpace = options.lineSpace;
    this.baselineSpace = options.baselineSpace;
    this.justify = options.justify;
    this.accent = options.accent;
    joinObjects(this.modifiers, options.modifiers);
    this.lines = [];
    this.defaultTextTouchBorder = options.defaultTextTouchBorder;
    // this.xAlign = options.xAlign;
    // this.yAlign = options.yAlign;
    this.splitLines(options.text);
    const equationOptions = this.createEquation();
    // console.log(equationOptions);
    // $FlowFixMe
    this.eqn.textFont = new FigureFont(equationOptions.textFont);
    // console.log(equationOptions)
    // this.addElements(joinObjects({}, equationOptions.elements, options.elements || {}));
    let relayout = false;
    // console.log(equationOptions.elements)
    // console.log(options.elements)
    // console.log(optionsIn)
    relayout = this.updateElements(
      joinObjects({}, equationOptions.elements, options.elements || {}),
    );

    // $FlowFixMe
    if (this.updateForms(equationOptions.forms, options.reform)) {
      relayout = true;
    }


    if (relayout) {
      this.layoutForms('reset');
    }
  }

  updateElements(
    elems: {
      [elementName: string]: {
        text: string,
        font: {
          size: number,
          family: string,
          weight: string,
          style: string,
          color: TypeColor,
        },
        touchBorder?: TypeParsableBuffer,
        onClick?: string | () => void,
      },
    },
  ) {
    const toAdd = {};
    let relayout = false;
    Object.keys(elems).forEach((name) => {
      const element = elems[name];
      if (this.elements[name] == null) {
        toAdd[name] = element;
      } else if (this.elements[name].getText != null) {
        const e = this.elements[name];
        const text = e.getText();
        const font = e.getFont();
        if (
          element.text !== text
          || element.font.size !== font.size
          || element.font.style !== font.style
          || element.font.family !== font.family
          || element.font.weight !== font.weight
        ) {
          relayout = true;
          e.setText({ text: element.text, font: element.font });
        }
        if (!areColorsWithinDelta(font.color, element.font.color, 0.001)) {
          e.setColor(element.font.color);
        }
        // if (!areColorsWithinDelta(font.color, e.color, 0.001)) {
        //   e.setColor(font.color);
        // }
        e.isTouchable = false;
        if (element.touchBorder) {
          e.setTouchable();
          e.touchBorder = element.touchBorder;
          this.setHasTouchableElements();
        }
        if (element.onClick != null) {
          e.onClick = element.onClick;
          e.setTouchable();
          this.setHasTouchableElements();
        }
      }
    });
    if (Object.keys(toAdd).length > 0) {
      // $FlowFixMe
      this.addElements(toAdd);
      relayout = true;
    }
    if (this.xAlign !== 'left' || this.yAlign !== 'baseline') {
      relayout = true;
    }
    return relayout;
  }

  updateForms(
    forms: EQN_Forms,
    reform: boolean,
  ) {
    if (reform || this.eqn.forms.base == null) {
      this.addForms(forms);
      return true;
    }
    return false;
  }

  splitLines(linesIn: Array<Object | string> | string) {
    let lines;
    if (Array.isArray(linesIn)) {
      lines = linesIn;
    } else {
      lines = [linesIn];
    }
    lines.forEach((lineDefinition, lineIndex) => {
      // const lineIndex = i;
      // const lineDefinition = lines[i];
      let lineJustification = this.justify;
      let lineLineSpace = this.lineSpace;
      let lineBaselineSpace = this.baselineSpace;
      let lineToUse;
      let lineFont = this.font;
      if (typeof lineDefinition !== 'string') {
        const {
          font, justify, lineSpace, baselineSpace,
        } = lineDefinition;
        lineToUse = lineDefinition.text;
        if (font != null) {
          lineFont = joinObjects({}, { color: this.color }, this.font, font);
        }
        if (baselineSpace != null) {
          lineBaselineSpace = baselineSpace;
        }
        if (lineSpace != null) {
          lineLineSpace = lineSpace;
          if (baselineSpace == null) {
            lineBaselineSpace = null;
          }
        }
        if (justify != null) {
          lineJustification = justify;
        }
      } else {
        lineToUse = lineDefinition;
      }
      const line = [];

      const [split, firstToken] = splitString(lineToUse, '|', '/');
      split.forEach((s, i) => {
        let text = s;
        let eqn = null;
        let textFont = lineFont;
        let offset;
        let inLine = true;
        let touchBorder;
        let onClick;
        let space = 0;

        if (i % 2 === firstToken) {
          let mod;
          if (this.modifiers[s] != null) {
            mod = this.modifiers[s];
            if (mod.text != null) {
              ({ text } = mod);
            }
            if (mod.eqn != null) {
              ({ eqn } = mod);
            }
            if (mod.font != null) {
              textFont = joinObjects({}, lineFont, mod.font);
            }
            if (mod.inLine != null) { inLine = mod.inLine; }
            if (mod.offset != null) { offset = mod.offset; }
            if (mod.touch != null) {
              if (mod.touch === true) {
                touchBorder = this.defaultTextTouchBorder;
              } else if (mod.touch !== false) {
                touchBorder = mod.touch;
                if (
                  touchBorder != null
                  && Array.isArray(touchBorder)
                  && !isBuffer(touchBorder)
                ) { // $FlowFixMe
                  [touchBorder] = getBorder(touchBorder);
                }
              }
            }
            if (mod.onClick != null) { onClick = mod.onClick; }
            if (mod.space != null) { space = mod.space; }
          } else {
            text = s;
            textFont = joinObjects({}, lineFont, this.accent);
          }
        }
        line.push({
          text,
          eqn,
          textFont,
          offset,
          inLine,
          lineIndex,
          touchBorder,
          onClick,
          space,
        });
      });

      this.lines.push({
        justify: lineJustification,
        lineSpace: lineLineSpace,
        baselineSpace: lineBaselineSpace,
        text: line,
        width: 0,
      });
    });
  }

  createEquation() {
    // console.log(this.lines);
    // const eqn = [];
    const content = [];
    const elements = {};
    this.lines.forEach((line, lineIndex) => {
      const [elementOptions, lineOptions] = this.createLine(line, lineIndex);
      joinObjects(elements, elementOptions);
      content.push(lineOptions);
    });
    const o = {
      name: 'lines',
      make: 'equation',
      color: this.color,
      font: this.font,
      textFont: this.font,
      scale: 1,
      elements,
      forms: {
        base: {
          lines: {
            content,
            justify: this.justify,
            lineSpace: this.lineSpace,
            baselineSpace: this.baselineSpace,
          },
        },
      },
    };
    // console.log(o);
    return o;
  }

  // eslint-disable-next-line class-methods-use-this
  createLine(line: Object, lineIndex: number) {
    const lineOptions = {
      justify: line.justify,
      space: line.lineSpace,
      baselineSpace: line.baselineSpace,
      content: [],
    };
    const elementOptions = {};
    line.text.forEach((element, index) => {
      const name = `e${lineIndex}_${index}`;
      if (element.eqn) {
        let c = element.eqn;
        if (element.touchBorder != null && element.touchBorder !== false) {
          const t = getBuffer(element.touchBorder);
          const symbol = {};
          symbol[`__t${this.touchCounter}`] = { symbol: 'tBox', onClick: element.onClick };
          c = {
            tBox: {
              content: c,
              symbol,
              leftSpace: t.left,
              topSpace: t.top,
              bottomSpace: t.bottom,
              rightSpace: t.right,
            },
          };
          this.touchCounter += 1;
        }
        if (element.offset != null) {
          c = { offset: [c, element.offset, true] };
        }
        if (element.space != null) {
          c = { pad: { content: c, right: element.space } };
        }
        if (element.inLine != null && element.inLine === false) {
          c = { container: { content: c, inSize: false } };
        }
        lineOptions.content.push(c);
      } else {
        elementOptions[name] = {
          text: element.text,
          font: element.textFont,
          touchBorder: element.touchBorder,
          onClick: element.onClick,
        };
        let content = name;
        let inSize = true;
        if (element.inLine === false) {
          inSize = false;
        }
        if (element.offset) {
          content = {
            offset: {
              content, offset: element.offset, inSize,
            },
          };
        }
        lineOptions.content.push(content);
        if (element.space) {
          lineOptions.content.push({
            container: {
              width: element.space,
            },
          });
        }
      }
    });
    return [elementOptions, lineOptions];
  }
}

export default CollectionsText;
