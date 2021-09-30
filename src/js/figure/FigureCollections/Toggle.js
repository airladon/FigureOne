// @flow

// import Figure from '../Figure';
import {
  Transform, getPoint,
  // getPoint, getTransform,
} from '../../tools/g2';
import type { TypeParsablePoint, Point } from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
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


/**
 * Collections toggle label options object.
 *
 * A toggle switch can be annotated with a label using the `text` property and can be:
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
 * Use `text`: `Equation` or `EQN_Equation` to create completely custom
 * equations with any forms desirable.
 *
 *
 * @see {@link COL_Toggle}
 *
 * @property {null | string | Array<string> | Equation | EQN_Equation } text
 * @property {TypeParsablePoint} [offset] offset to default loation
 * @property {TypeLabelSubLocation} [location] location of label relative to
 * toggle
 * @property {number} [scale] size of the label
 * @property {TypeColor} [color]
 */
export type OBJ_ToggleLabel = {
  text: null | string | Array<string> | Equation | EQN_Equation,
  offset?: TypeParsablePoint,
  location?: TypeLabelSubLocation,
  scale?: number,
  color?: TypeColor,
};

/**
 * Border of circle or bar of toggle.
 *
 * @property {width} [number] border width
 * @property {color} [TypeColor] border color
 * @see {@link OBJ_Toggle}
 */
export type OBJ_ToggleBorder = {
  width?: number;
  color?: TypeColor;
};

/* eslint-disable max-len */
/**
 * {@link CollectionsToggle} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
 *
 * @property {number} [width] toggle width
 * @property {number} [height] toggle height
 * @property {number} [barHeight] height of toggle bar showing on
 * or off
 * @property {number} [sides] number of sides in curves (`20`)
 * @property {'dark' | 'light'} [theme] selects default colors for a light or
 * dark switch (`dark`)
 * @property {TypeColor} [colorOff] toggle off color
 * @property {TypeColor} [colorOn] toggle on color (`[0, 1, 0, 1]`)
 * @property {OBJ_ToggleBorder} [circleBorder] border around circle (defaults to on
 * where width is half the figure's default line width)
 * @property {OBJ_ToggleBorder} [barBorder] border around bar
 * (defaults to off - width = 0)
 * @property {OBJ_ToggleLabel} [label]

 * @extends OBJ_Collection
 */
export type COL_Toggle = {
  width?: number;
  height?: number;
  barHeight?: number;
  sides?: number;
  theme?: 'dark' | 'light';
  colorOff?: TypeColor;
  colorOn?: TypeColor;
  circleBorder?: OBJ_ToggleBorder,
  barBorder?: OBJ_ToggleBorder,
  label?: OBJ_ToggleLabel,
} & OBJ_Collection;
/* eslint-enable max-len */

class ToggleLabel extends EquationLabel {
  offset: Point;
  location: TypeLabelSubLocation;

  constructor(
    collections: FigureCollections,
    labelText: string | Equation | EQN_Equation | Array<string>,
    color: TypeColor,
    offset: TypeParsablePoint,
    location: TypeLabelSubLocation = 'top',
    scale: number = 0.7,
    font: ?OBJ_Font = undefined,
  ) {
    let xAlign = 'center';
    let yAlign = 'middle';
    if (location === 'left') {
      xAlign = 'right';
    } else if (location === 'right') {
      xAlign = 'left';
    }
    if (location === 'top') {
      yAlign = 'bottom';
    } else if (location === 'bottom') {
      yAlign = 'top';
    }
    super(collections, {
      label: labelText, color, scale, yAlign, xAlign, font,
    });
    this.offset = getPoint(offset);
    this.location = location;
  }
}

/*
.########..#######...######....######...##.......########
....##....##.....##.##....##..##....##..##.......##......
....##....##.....##.##........##........##.......##......
....##....##.....##.##...####.##...####.##.......######..
....##....##.....##.##....##..##....##..##.......##......
....##....##.....##.##....##..##....##..##.......##......
....##.....#######...######....######...########.########
*/
/* eslint-disable max-len */
/**
 * {@link FigureElementCollection} representing a toggle switch.
 *
 * ![](./apiassets/toggle.gif)
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
 * See {@link COL_Toggle} for setup options.
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
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
class CollectionsToggle extends FigureElementCollection {
  _circ: FigureElementPrimitive;
  _bar: FigureElementPrimitive;
  _circBorder: FigureElementPrimitive | null;
  _barBorder: FigureElementPrimitive | null;
  label: ToggleLabel | null;
  _label: FigureElementPrimitive | null;

  width: number;
  height: number;
  colorOn: TypeColor;
  colorOff: TypeColor;

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: COL_Toggle,
  ) {
    const colorLight = [0.8, 0.8, 0.8, 1];
    const colorDark = [0.45, 0.45, 0.45, 1];
    const colorOn = [0, 0.8, 0, 1];

    const defaultOptions = {
      sides: 20,
      colorOn: [0, 1, 0, 1],
      circleBorder: {
        width: collections.primitives.defaultLineWidth / 2,
      },
      barBorder: {
        width: 0,
      },
      theme: 'dark',
      touchBorder: 'rect',
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
    };

    const themeColors = {
      dark: {
        color: colorDark,
        on: colorOn,
        off: colorLight,
        circleBorder: colorLight,
        barBorder: colorLight,
      },
      light: {
        color: colorLight,
        on: colorOn,
        off: colorDark,
        circleBorder: colorDark,
        barBorder: colorDark,
      },
    };

    const options = joinObjects({}, defaultOptions, optionsIn);
    let { width, height, barHeight } = options;
    // If no dimensions are defined then use defaultLength
    if (width == null && height == null && barHeight == null) {
      height = collections.primitives.defaultLength / 10;
    }

    // If only barHeight dimension is defined, then use it to define
    // height
    if (width == null && height == null && barHeight != null) {
      height = barHeight * 1.7;
    }

    // If only width dimension is defined, then use it to define height
    if (height == null && barHeight == null && width != null
    ) {
      height = width / 1.7;
    }

    // At this point, height is defined.
    if (width == null) {
      width = height * 1.7;
    }

    if (barHeight == null) {
      barHeight = height / 1.7;
    }

    super(joinObjects({}, options));
    this.collections = collections;

    this.width = width;
    this.height = height;
    const theme = themeColors[options.theme];
    this.colorOn = options.colorOn == null ? theme.off : options.colorOn;
    this.colorOff = options.colorOff == null ? theme.off : options.colorOff;

    this.add({
      name: 'bar',
      make: 'rectangle',
      width: width - options.barBorder.width * 2,
      height: barHeight - options.barBorder.width * 2,
      corner: { radius: barHeight / 2, sides: 10 },
      color: this.colorOff,
    });
    if (options.barBorder.width > 0) {
      this.add({
        name: 'barBorder',
        make: 'rectangle',
        width: width - options.barBorder.width,
        height: barHeight - options.barBorder.width,
        corner: { radius: barHeight / 2, sides: 10 },
        line: { width: options.barBorder.width },
        color: options.barBorder.color == null
          ? theme.barBorder
          : options.barBorder.color,
      });
    } else {
      this._barBorder = null;
    }

    this.add({
      name: 'circ',
      make: 'polygon',
      radius: height / 2 - options.circleBorder.width,
      sides: options.sides,
      color: options.color == null ? theme.color : options.color,
    });
    if (options.circleBorder.width > 0) {
      this.add({
        name: 'circBorder',
        make: 'polygon',
        radius: height / 2 - options.circleBorder.width / 2,
        sides: options.sides,
        line: { width: options.circleBorder.width },
        color: options.circleBorder.color == null
          ? theme.circleBorder
          : options.circleBorder.color,
      });
    } else {
      this._circBorder = null;
    }
    if (options.label != null) {
      let loIn = options.label;
      if (typeof options.label === 'string') {
        loIn = { text: options.label };
      }
      const lo = joinObjects(
        {},
        {
          offset: [0, 0],
          location: 'left',
          scale: 0.8,
          color: options.color == null ? theme.color : options.color,
          font: collections.primitives.defaultFont,
        },
        {
          font: { color: options.color == null ? theme.color : options.color },
        },
        loIn,
      );
      this.label = new ToggleLabel(
        this.collections, lo.text, lo.color,
        lo.offset, lo.location, lo.scale, lo.font,
      );
      this.add('label', this.label.eqn);
      this.updateLabel();
    } else {
      this.label = null;
      this._label = null;
    }
    this.off(false);
    if (options.touch == null) {
      this.setTouchable();
      this.onClick = this.toggle.bind(this, true);
    }
    this.notifications.add('setState', () => {
      if (this._custom.state) {
        this.on(false);
      } else {
        this.off(false);
      }
    });
  }

  /**
   * Turn switch on.
   * @param {boolean} `true` to send `'toggle'` and `'on'` notifications
   */
  on(notify: boolean = true) {
    this._circ.setPosition(this.width / 2 - this.height / 2, 0);
    if (this._circBorder != null) {
      this._circBorder.setPosition(this.width / 2 - this.height / 2, 0);
    }
    this._bar.setColor(this.colorOn);
    this._custom.state = true;
    if (notify) {
      this.notifications.publish('on');
      this.notifications.publish('toggle', true);
    }
  }

  /**
   * Turn switch off.
   * @param {boolean} `true` to send `'toggle'` and `'off'` notifications
   */
  off(notify: boolean = true) {
    this._circ.setPosition(-this.width / 2 + this.height / 2, 0);
    if (this._circBorder != null) {
      this._circBorder.setPosition(-this.width / 2 + this.height / 2, 0);
    }
    this._bar.setColor(this.colorOff);
    this._custom.state = false;
    if (notify) {
      this.notifications.publish('off');
      this.notifications.publish('toggle', false);
    }
  }

  /**
   * `true` if switch is on.
   * @return {boolean}
   */
  isOn() {
    return this._custom.state;
  }

  /**
   * `true` if switch is off.
   * @return {boolean}
   */
  isOff() {
    return !this._custom.state;
  }

  /**
   * Toggle switch.
   */
  toggle() {
    if (this._custom.state === false) {
      this.on();
    } else {
      this.off();
    }
  }

  updateLabel() {
    const { label, _label } = this;
    if (label != null && _label != null) {
      let { x, y } = label.offset;
      const buffer = this.height / 2;
      if (label.location === 'left') {
        x = -this.width / 2 - buffer;
      } else if (label.location === 'right') {
        x = this.width / 2 + buffer;
      }
      if (label.location === 'bottom') {
        y = -this.height / 2 - buffer;
      } else if (label.location === 'top') {
        y = this.height / 2 + buffer;
      }
      _label.setPosition(x, y);
    }
  }

  /**
   * Change label text.
   * @param {string} text text to change to
   */
  setLabel(text: string) {
    if (this.label != null) {
      this.label.setText(text);
    }
    this.updateLabel();
  }
}

export default CollectionsToggle;
