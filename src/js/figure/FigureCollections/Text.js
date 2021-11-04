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
// import type {
//   OBJ_Collection,
// } from '../FigurePrimitives/FigurePrimitiveTypes';
import type {
  TypeColor, OBJ_Font, OBJ_Font_Fixed,
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
 * @property {number} [lineSpace] line specific separation from baseline of
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
 * @property {TypeParsableBuffer | Array<TypeParsablePoint>} [touchBorder]
 * touch border can be custom (`Array<TypeParsablePoint>`), or be set to some
 * buffer (`TypeParsableBuffer`) around the rectangle (default: `'0'`)
 * @property {number} [space] additional space to right of text
 */
export type OBJ_TextModifiersDefinition = {
  text?: string,
  offset?: TypeParsablePoint,
  inLine?: boolean,
  font?: OBJ_Font,
  touchBorder?: TypeParsableBuffer | Array<TypeParsablePoint>,
  onClick?: string | () => void,
  space?: number,
};

/**
 */
export type OBJ_CollectionsText = {
  text: Array<string | OBJ_TextLinesDefinition>,
  modifiers: OBJ_TextModifiersDefinition | { eqn?: TypeEquationPhrase },
  elements: EQN_EquationElements,
  font?: OBJ_Font,
  defaultTextTouchBorder?: TypeParsableBuffer,
  justify?: 'left' | 'center' | 'right',
  lineSpace?: number,
  baselineSpace?: number,
  xAlign: 'left' | 'right' | 'center',
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
  color: TypeColor,
  border?: TypeParsableBorder | 'buffer' | 'draw' | 'rect' | number,
  touchBorder?: TypeParsableBorder | 'rect' | 'border' | 'buffer' | number | 'draw',
  defaultAccent?: OBJ_Font,
}

// $FlowFixMe
class CollectionsText extends Equation {
  _eqn: Equation;

  font: OBJ_Font_Fixed;
  accent: OBJ_Font;
  justify: 'left' | 'right' | 'center';
  // xAlign: 'left' | 'right' | 'center';
  // yAlign: 'mid' | 'bottom' | 'top' | 'baseline';
  lineSpace: number;
  lines: Array<Object>;
  modifiers: Object;

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
      // xAlign: 'left',
      // yAlign: 'baseline',
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
    };

    const options = joinObjects({}, defaultOptions, optionsIn);
    options.textFont = options.font;
    if (options.xAlign != null) {
      options.formDefaults.alignment.xAlign = options.xAlign;
    }
    if (options.yAlign != null) {
      options.formDefaults.alignment.yAlign = options.yAlign;
    }

    super(collections.primitives, joinObjects({}, options));
    if (options.lineSpace == null) {
      options.lineSpace = options.font.size * 1.3;
    }
    if (options.accent == null) {
      options.accent = options.font.style === 'italic' ? { style: 'normal' } : { style: 'italic' };
    }
    this.collections = collections;
    this.font = options.font;
    // this.xAlign = options.xAlign;
    // this.yAlign = options.yAlign;
    this.lineSpace = options.lineSpace;
    this.justify = options.justify;
    this.accent = options.accent;
    this.modifiers = options.modifiers || {};
    this.lines = [];

    this.splitLines(options.text);
    const equationOptions = this.createEquation();

    this.addElements(joinObjects({}, equationOptions.elements, options.elements || {}));
    this.addForms(equationOptions.forms);
    // this.add(equationOptions);
  }

  splitLines(lines: Array<Object | string>) {
    lines.forEach((lineDefinition, lineIndex) => {
      // const lineIndex = i;
      // const lineDefinition = lines[i];
      let lineJustification = this.justify;
      let lineLineSpace = this.lineSpace;
      let lineToUse;
      let lineFont = this.font;
      if (typeof lineDefinition !== 'string') {
        const {
          font, justify, lineSpace,
        } = lineDefinition;
        lineToUse = lineDefinition.text;
        if (font != null) {
          lineFont = joinObjects({}, { color: this.color }, this.font, font);
        }
        if (lineSpace != null) {
          lineLineSpace = lineSpace;
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
            if (mod.touchBorder != null) {
              touchBorder = mod.touchBorder;
              if (
                touchBorder != null
                && Array.isArray(touchBorder)
                && !isBuffer(touchBorder)
              ) { // $FlowFixMe
                [touchBorder] = getBorder(touchBorder);
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
        baselineSpace: lineLineSpace,
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
            baselineSpace: this.lineSpace,
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
      baselineSpace: line.baselineSpace,
      content: [],
    };
    console.log(line.justify)
    const elementOptions = {};
    line.text.forEach((element, index) => {
      // const name = element.modText === '' ? `e${lineIndex}${index}` : element.modText;
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
        // if (element.lSpace) {
        //   content = {
        //     offset: {
        //       content, offset: [element.lSpace, 0], inSize,
        //     },
        //   };
        // }
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
