// @flow

// import Figure from '../Figure';
import {
  Transform, getPoint, Point,
  // getPoint, getTransform,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
import { joinObjects, splitString } from '../../tools/tools';
import {
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import type {
  OBJ_Collection,
} from '../FigurePrimitives/FigurePrimitiveTypes';
import type {
  TypeColor, OBJ_Font,
} from '../../tools/types';
import type FigureCollections from './FigureCollections';
import EquationLabel from './EquationLabel';
import type { EQN_Equation, Equation } from '../Equation/Equation';
import type {
  TypeLabelSubLocation,
} from './EquationLabel';

// $FlowFixMe
class CollectionsText extends FigureElementCollection {
  _eqn: Equation;

  font: OBJ_Font_Fixed;
  accent: OBJ_Font_Fixed;
  justify: 'left' | 'right' | 'center';
  xAlign: 'left' | 'right' | 'center';
  yAlign: 'mid' | 'bottom' | 'top' | 'baseline';
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
      xAlign: 'left',
      yAlign: 'baseline',
      lineSpace: null,
      transform: new Transform().scale(1).rotate(0).translate(0, 0),
    };

    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.lineSpace == null) {
      options.lineSpace = options.font.size * 1.3;
    }
    if (options.accent == null) {
      options.accent = options.font.style === 'italic' ? 'normal' : 'italic';
    }
    super(joinObjects({}, options));
    this.collections = collections;
    this.font = options.font;
    this.xAlign = options.xAlign;
    this.yAlign = options.yAlign;
    this.lineSpace = options.lineSpace;
    this.justify = options.justify;
    this.accent = joinObjects({}, this.font, options.accent);
    this.modifiers = options.modifiers || {};
    this.lines = [];

    this.splitLines(options.text);
    const equationOptions = this.createEquation();

    this.add(equationOptions);
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
        let textFont = lineFont;
        let offset = new Point(0, 0);
        let inLine = true;
        let touchBorder;
        let onClick;
        let followOffsetY = false;
        let rSpace = 0;
        let lSpace = 0;

        if (i % 2 === firstToken) {
          let mod;
          if (this.modifiers[s] != null) {
            mod = this.modifiers[s];
          } else {
            mod = {
              text: s,
              font: defaultAccent,
            };
          }
          // const mod = this.modifiers[s];
          if (mod.text != null) {
            ({ text } = mod);
          }
          if (mod.font != null) {
            textFont = joinObjects({}, lineFont, mod.font);
          }
          if (mod.inLine != null) { inLine = mod.inLine; }
          if (mod.offset != null) { offset = mod.offset; }
          // if (mod.border != null) {
          //   border = mod.border;
          // }
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
          if (mod.followOffsetY != null) { followOffsetY = mod.followOffsetY; }
          if (mod.lSpace != null) { lSpace = mod.lSpace; }
          if (mod.rSpace != null) { rSpace = mod.rSpace; }
          // this.modifiers[s] = mod;
          // if (Array.isArray(border)) {  // $FlowFixMe
          //   border = getPoints(border);
          // }
          // if (Array.isArray(touchBorder)) {  // $FlowFixMe
          //   touchBorder = getBorder(touchBorder);
          // }
        }
        line.push({
          text,
          textFont,
          offset,
          inLine,
          lineIndex,
          touchBorder,
          onClick,
          followOffsetY,
          lSpace,
          rSpace,
        });
      });
      this.lines.push({
        justify: lineJustification,
        space: lineLineSpace,
        text: line,
        width: 0,
      });
    });
  }

  createEquation() {
    console.log(this.lines);
    const eqn = [];
    const content = []
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
            yAlign: this.yAlign,
          },
        },
      },
    };
    console.log(o);
    return o;
  }

  // eslint-disable-next-line class-methods-use-this
  createLine(line: Object, lineIndex: number) {
    const lineOptions = {
      justify: line.justify,
      space: line.space,
      content: [],
    };
    const elementOptions = {};
    line.text.forEach((element, index) => {
      const name = `e${lineIndex}${index}`;
      elementOptions[name] = {
        text: element.text,
        font: element.textFont,
        touchBorder: element.touchBorder,
        onClick: element.onClick,
      };
      lineOptions.content.push(name);
    });
    return [elementOptions, lineOptions];
  }
}

export default CollectionsText;
