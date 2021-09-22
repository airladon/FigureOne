// @flow

// import Figure from '../Figure';
import {
  Transform,
  // getPoint, getTransform,
} from '../../tools/g2';
// import type { TypeParsablePoint, Point } from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
import {
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import type {
  OBJ_Collection, OBJ_LineStyleSimple,
} from '../FigurePrimitives/FigurePrimitiveTypes';
import type {
  TypeColor, OBJ_Font, OBJ_CurvedCorner,
} from '../../tools/types';
import type FigureCollections from './FigureCollections';
import EquationLabel from './EquationLabel';
import type { EQN_Equation, Equation } from '../Equation/Equation';


/**
 * Collections button label options object.
 *
 * A button can be annotated with a label using the `text` property and can be:
 * - text (`string`, `Array<string>`)
 * - an equation (`Equation`, `EQN_Equation`)
 *
 * In all cases, an actual {@link Equation} is created as the label. The
 * equation can have multiple forms, which can be set using the `showForm`
 * method.
 *
 * If `text`: `string`, then an equation with a single form named `base` will
 * be created with a single element being the string text.
 *
 * If `text`: `Array<string>`, then an equation with a form for each element
 * of the array is created. Each form is named '0', '1', '2'... corresponding
 * with the index of the array. Each form is has a single element, being the
 * text at that index.
 *
 * Use `text`: {@link Equation} or {@link EQN_Equation} to create completely
 * custom equations with any forms desirable.
 *
 * @see {@link COL_Button}
 *
 * @property {null | string | Array<string> | Equation | EQN_Equation } text
 * @property {OBJ_Font} [font] font to use
 * @property {number} [scale] size of the label
 * @property {TypeColor} [color]
 */
export type OBJ_ButtonLabel = {
  text: null | string | Array<string> | Equation | EQN_Equation,
  font?: OBJ_Font,
  scale?: number,
  color?: TypeColor,
};

/**
 * Button state options object.
 *
 * @property {TypeColor} [lineColor]
 * @property {TypeColor} [fillColor]
 * @property {TypeColor} [labelColor]
 * @property {string} [label]
 * @see {@link COL_Button}
 */
export type OBJ_ButtonColorState = {
  lineColor?: TypeColor,
  fillColor?: TypeColor,
  labelColor?: TypeColor,
}

/**
 * Button state options object.
 *
 * The `label` can either be the label text, or it can be the name of the form
 * of the equation label.
 *
 * @property {TypeColor} [lineColor]
 * @property {TypeColor} [fillColor]
 * @property {TypeColor} [labelColor]
 * @property {string} [label]
 * @see {@link COL_Button}
 */
export type OBJ_ButtonState = {
  lineColor?: TypeColor,
  fillColor?: TypeColor,
  labelColor?: TypeColor,
  label?: string,
}

/* eslint-disable max-len */
/**
 * {@link CollectionsButton} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
 *
 * @property {number} [width] button width
 * @property {number} [height] button height
 * @property {OBJ_CurvedCorner} [corner] button corner
 * @property {null | OBJ_LineStyleSimple} [line] button outline - use `null` to
 * remove the default line
 * @property {OBJ_ButtonLabel} [label]
 * @property {TypeColor} [lineColor]
 * @property {TypeColor} [fillColor]
 * @property {TypeColor} [labelColor]
 * @property {Array<OBJ_ButtonState | string>} [states]
 * @property {OBJ_ButtonColorState>} [states]
 *
 * @extends OBJ_Collection
 */
export type COL_Button = {
  width?: number,
  height?: number,
  corner?: OBJ_CurvedCorner,
  line?: null | OBJ_LineStyleSimple,
  label?: OBJ_ButtonLabel,
  lineColor?: TypeColor,
  fillColor?: TypeColor,
  labelColor?: TypeColor,
  states?: Array<OBJ_ButtonState | string>,
  touchDown?: OBJ_ButtonColorState,
} & OBJ_Collection;
/* eslint-enable max-len */

class ButtonLabel extends EquationLabel {
  constructor(
    collections: FigureCollections,
    labelText: string | Equation | EQN_Equation | Array<string>,
    color: TypeColor,
    scale: number = 0.7,
    font: ?OBJ_Font = undefined,
  ) {
    const xAlign = 'center';
    const yAlign = 'middle';
    super(collections, {
      label: labelText, color, scale, yAlign, xAlign, font,
    });
  }
}

/*
.########..##.....##.########.########..#######..##....##
.##.....##.##.....##....##.......##....##.....##.###...##
.##.....##.##.....##....##.......##....##.....##.####..##
.########..##.....##....##.......##....##.....##.##.##.##
.##.....##.##.....##....##.......##....##.....##.##..####
.##.....##.##.....##....##.......##....##.....##.##...###
.########...#######.....##.......##.....#######..##....##
*/
/* eslint-disable max-len */
/**
 * {@link FigureElementCollection} representing a toggle switch.
 *
 * ![](./apiassets/button.gif)
 *
 * The toggle switch can be turned on or off.
 *
  * Notifications - The notification manager property `notifications` will
 * publish the following events:
 * - `toggle`: switch is changed - `true` will be passed if the switch is
 *    changed to on, and `false` will be passed if the switch is changed to off
 * - `on`: switch is changed to on
 * - `off`: switch is changed to off
 *
 * See {@link COL_Button} for setup options.
 *
 * To test examples below, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple toggle switch with notification causing a console statement
 * const toggle = figure.add({
 *   make: 'collections.toggle',
 *   label: {
 *     text: 'Control',
 *     location: 'bottom',
 *     scale: 0.6,
 *   },
 * });
 *
 * toggle.notifications.add('toggle', (state) => {
 *   state ? console.log('on') : console.log('off');
 * });
 */
/* eslint-enable max-len */
// $FlowFixMe
class CollectionsButton extends FigureElementCollection {
  _fill: FigureElementPrimitive;
  _line: FigureElementPrimitive | null;
  label: ButtonLabel | null;
  _label: Equation | null;

  width: number;
  height: number;
  states: Array<OBJ_ButtonState>;
  touchDown: OBJ_ButtonColorState;

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: COL_Button,
  ) {
    const defaultOptions = {
      states: [],
      touchBorder: 'rect',
      color: collections.primitives.defaultColor,
      fillColor: [0, 0, 0, 0],
      line: { width: collections.primitives.defaultLineWidth },
      corner: { radius: collections.primitives.defaultLineWidth * 4, sides: 5 },
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
    };

    const options = joinObjects({}, defaultOptions, optionsIn);

    super(joinObjects({}, options));
    this.collections = collections;
    let {
      labelColor, lineColor, label,
    } = options;
    const {
      line, fillColor, color, width, height, corner, states, touchDown,
    } = options;

    if (lineColor == null) {
      if (line != null && line.color != null) {
        lineColor = line.color;
      } else {
        lineColor = color;
      }
    }
    if (labelColor == null) {
      if (label != null && typeof label === 'object' && label.font != null && label.font.color != null) {
        labelColor = label.font.color;
      } else if (label != null && typeof label === 'object' && label.color != null) {
        labelColor = label.color;
      } else {
        labelColor = color;
      }
    }

    this.touchDown = touchDown;
    this.states = states;
    if (this.states.length > 0) {
      if (typeof this.states[0] === 'string') {
        this.states[0] = { label: this.states[0] };
      }
      if (this.states[0].fillColor == null) {
        this.states[0].fillColor = fillColor;
      }
      if (this.states[0].labelColor == null) {
        this.states[0].labelColor = labelColor;
      }
      if (this.states[0].lineColor == null) {
        this.states[0].lineColor = lineColor;
      }
      if (this.states[0].label == null) {
        this.states[0].label = label;
      }
    }
    if (label == null && states != null) {
      if (typeof states[0] === 'string') {
        [label] = states;
      } else if (states[0].label != null) {
        label = states[0].label;
      }
    }
    if (label != null) {
      let loIn = label;
      if (typeof label === 'string') {
        loIn = { text: label };
      }
      const lo = joinObjects(
        {},
        {
          scale: 0.8,
          color: labelColor,
          font: collections.primitives.defaultFont,
        },
        {
          font: { color: labelColor },
        },
        loIn,
      );
      this.label = new ButtonLabel(
        this.collections, lo.text, lo.color, lo.scale, lo.font,
      );
      this.add('label', this.label.eqn);
      // this.updateLabel();
    } else {
      this.label = null;
      this._label = null;
    }

    if (width == null && this._label != null) {
      const r = this._label.getBoundingRect();
      this.width = r.width + r.height;
    } else if (width == null && height != null) {
      this.width = this.height * 2;
    } else if (width == null) {
      this.width = collections.primitives.defaultLength / 20;
    } else {
      this.width = width;
    }

    if (height == null && this._label != null) {
      const r = this._label.getBoundingRect();
      this.height = r.height + r.height;
    } else if (height == null && width != null) {
      this.height = this.width / 2;
    } else if (height == null) {
      this.height = collections.primitives.defaultLength / 20;
    } else {
      this.height = height;
    }

    this.add({
      name: 'fill',
      make: 'rectangle',
      width: this.width,
      height: this.height,
      corner,
      color: fillColor,
    });
    this.toBack('fill');
    if (line != null) {
      this.add({
        name: 'line',
        make: 'rectangle',
        line,
        width: this.width,
        height: this.height,
        corner,
        color: lineColor,
      });
    }
    this._custom.stateIndex = 0;
    // this.off(false);
    if (options.touch == null) {
      this.setTouchable();
      // this.onClick = this.pressed.bind(this, true);
    }
    this.notifications.add('onClick', () => {
      this.incrementState();
      this.updateState();
      this.updateStateForTouch(true);
    });
    this.notifications.add('touchUp', () => {
      this.updateStateForTouch(false);
    });
  }

  incrementState() {
    this._custom.stateIndex = (this._custom.stateIndex + 1) % this.states.length;
  }

  /**
   * Set the button state index.
   * @param {number} index
   */
  setStateIndex(index: number) {
    this._custom.stateIndex = index;
    this.updateState();
  }

  /**
   * Get the current button state index.
   * @return {number}
   */
  getStateIndex() {
    return this._custom.stateIndex;
  }

  getStateProperty(propertyName: string) {
    let property = this.states[0][propertyName];
    for (let i = 0; i < this._custom.stateIndex; i += 1) {
      if (this.states[0][propertyName] != null) {
        property = this.states[0][propertyName];
      }
    }
    return property;
  }

  updateState() {
    if (this.states.length > 0) {
      const s = this.states[this._custom.stateIndex];
      this._fill.setColor(this.getStateProperty('fillColor'));
      if (this._line != null) {
        this._line.setColor(this.getStateProperty('lineColor'));
      }
      if (this._label != null) {
        let labelText;
        if (typeof s === 'string') {
          labelText = s;
        } else if (s.label != null) {
          labelText = s.label;
        }
        if (labelText != null) {
          if (this._label.eqn.forms[labelText] != null) {
            this._label.showForm(labelText);
          } else {
            this.setLabel(labelText);
          }
        }
      }
      if (this._label != null) {
        this._label.setColor(this.getStateProperty('labelColor'));
      }
    }
  }

  updateStateForTouch(down: boolean) {
    if (this.touchDown == null) {
      return;
    }
    if (down) {
      const s = this.touchDown;
      if (s.fillColor != null) {
        this._fill.setColor(s.fillColor);
      }
      if (this._line != null && s.lineColor != null) {
        this._line.setColor(s.lineColor);
      }
      if (this._label != null && s.labelColor != null) {
        this._label.setColor(s.labelColor);
      }
    } else {
      this.updateState();
    }
  }

  // /**
  //  * Change label text.
  //  * @param {string} text text to change to
  //  */
  setLabel(text: string) {
    if (this.label != null) {
      this.label.setText(text);
    }
  }
}

export default CollectionsButton;
