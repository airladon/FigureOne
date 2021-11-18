// @flow

// import Figure from '../Figure';
import {
  Transform, Point, isBuffer, getBorder,
  // getPoint, getTransform,
} from '../../tools/g2';
import type { TypeParsablePoint, TypeParsableBuffer, TypeParsableBorder } from '../../tools/g2';
import { joinObjects, splitString } from '../../tools/tools';
// import {
//   FigureElementCollection, FigureElementPrimitive,
// } from '../Element';
import type {
  TypeText,
} from '../FigurePrimitives/FigurePrimitiveTypes';
import type {
  OBJ_Font, OBJ_Font_Fixed,
} from '../../tools/types';
import type FigureCollections from './FigureCollections';
import type { EQN_EquationElements } from '../Equation/Equation';
import type { TypeEquationPhrase } from '../Equation/EquationFunctions';
import { Equation } from '../Equation/Equation';

/**
 * Lines Text Definition object.
 *
 * Used to define a string within a text lines primitive {@link OBJ_TextLines}.
 *
 * @property {string} [text] string representing a line of text
 * @property {OBJ_Font} [font] line specific default font
//  * @property {'left' | 'right' | 'center'} [justify] line specific justification
 * @property {number} [lineSpace] line specific separation from top of
 * this line to baseline of previous line
 * @property {number} [baselineSpace] line specific separation from baseline of
 * this line to baseline of previous line
 * @property {boolean} [fixColor] If `true`, {@link FigureElement}`.setColor`
 * method will not change the color of text
 */
export type OBJ_TextLinesDefinition = {
  text: string,
  font?: OBJ_Font,
  // justify?: 'left' | 'right' | 'center',
  lineSpace?: number,
  baselineSpace?: number,
};

/**
 * Modifier Text Definition object.
 *
 * Used to define the modifiers of a string within a text lines primitive
 * {@link OBJ_TextLines}.
 *
 * @property {string} [text] text to replace `modifierId` with - if `undefined`
 * then `modifierId` is used
 * @property {TypeParsablePoint} [offset] text offset
 * @property {boolean} [followOffsetY] `true` will make any subsequent text
 * have the same y offset as a starting point (`false`)
 * @property {OBJ_Font} [font] font changes for modified text
 * @property {boolean} [inLine] `false` if modified text should not contribute
 * to line layout (default: `true`)
 * @property {string | function(): void} [onClick] function to execute on click
 * within the `touchBorder` of the modified text
 * @property {TypeParsableBuffer | boolean} [touch] use `true` to enable touch
 * or a buffer to enable touch and define the touchBorder (`false`)
 * buffer (`TypeParsableBuffer`) around the rectangle (default: `'0'`)
 * @property {number} [space] additional space to right of text
 */
export type OBJ_TextModifiersDefinition = {
  text?: string,
  offset?: TypeParsablePoint,
  inLine?: boolean,
  font?: OBJ_Font,
  touch?: boolean | TypeParsableBuffer,
  onClick?: string | () => void,
  space?: number,
};

/* eslint-disable max-len */
/**
 * @property {Array<string | OBJ_TextLinesDefinition> | string} [text] array of
 * line strings - single string is single line only.
 * @property {OBJ_TextModifiersDefinition} [modifiers] modifier definitions
 * @property {OBJ_Font} [font] Default font to use in lines
 * @property {TypeParsableBuffer} [defaultTextTouchBorder] default buffer for
 * `touchBorder` property in `text`
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
 * @property {TypeText} [type] choose to render text either in webgl canvas or
 * a separate 2d canvas.
 */
/* eslint-enable max-len */
export type OBJ_CollectionsText = {
  text: Array<string | OBJ_TextLinesDefinition> | string,
  modifiers: OBJ_TextModifiersDefinition | { eqn?: TypeEquationPhrase },
  elements: EQN_EquationElements,
  font?: OBJ_Font,
  defaultTextTouchBorder?: TypeParsableBuffer,
  justify?: 'left' | 'center' | 'right',
  lineSpace?: number,
  baselineSpace?: number,
  xAlign: 'left' | 'right' | 'center',
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
  border?: TypeParsableBuffer | TypeParsableBorder | 'children' | 'rect' | number;
  touchBorder?: TypeParsableBuffer | TypeParsableBorder | 'border' | 'children' | 'rect' | number;
  accent?: OBJ_Font,
  type: TypeText,
}

// $FlowFixMe
class CollectionsText extends Equation {
  _eqn: Equation;

  font: OBJ_Font_Fixed;
  accent: OBJ_Font;
  justify: 'left' | 'right' | 'center';
  lineSpace: number;
  lines: Array<Object>;
  modifiers: Object;
  baselineSpace: number | null;
  defaultTextTouchBorder: TypeParsableBuffer;

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

    const options = joinObjects({}, defaultOptions, optionsIn);
    options.textFont = options.font;
    if (options.xAlign != null) {
      options.formDefaults.alignment.xAlign = options.xAlign;
    }
    if (options.yAlign != null) {
      options.formDefaults.alignment.yAlign = options.yAlign;
    }

    if (optionsIn.color != null) {
      options.color = optionsIn.color;
    }
    if (optionsIn.font != null && optionsIn.font.color != null) {
      options.color = optionsIn.font.color;
    }

    super(collections.primitives, joinObjects({}, options));
    if (options.lineSpace == null) {
      options.lineSpace = options.font.size * 0.5;
    }
    if (Object.keys(options.accent).length === 0) {
      options.accent = { style: 'italic' };
    }
    this.collections = collections;
    this.font = options.font;
    this.font.color = this.color;
    this.lineSpace = options.lineSpace;
    this.baselineSpace = options.baselineSpace;
    this.justify = options.justify;
    this.accent = options.accent;
    this.modifiers = options.modifiers || {};
    this.lines = [];
    this.defaultTextTouchBorder = options.defaultTextTouchBorder;

    this.splitLines(options.text);
    const equationOptions = this.createEquation();

    this.addElements(joinObjects({}, equationOptions.elements, options.elements || {}));
    // $FlowFixMe
    this.addForms(equationOptions.forms);
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
      const name = `e${lineIndex}${index}`;
      if (element.eqn) {
        lineOptions.content.push(element.eqn);
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
