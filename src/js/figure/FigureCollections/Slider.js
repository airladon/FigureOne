// @flow

// import Figure from '../Figure';
import {
  Transform,
  // getPoint, getTransform,
} from '../../tools/g2';
// import type { TypeParsablePoint, Point } from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
import { round, clipValue } from '../../tools/math';
import {
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import type {
  OBJ_Collection,
} from '../FigurePrimitives/FigurePrimitiveTypes';
import type {
  TypeColor,
} from '../../tools/types';
import type FigureCollections from './FigureCollections';


/**
 * Border of circle or bar of slider.
 *
 * @property {width} [number] border width
 * @property {color} [TypeColor] border color
 * @see {@link OBJ_Slider}
 */
export type SliderBorder = {
  width?: number;
  color?: TypeColor;
};

/* eslint-disable max-len */
/**
 * {@link CollectionsSlider} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
 *
 * @property {number} [width] slider width
 * @property {number} [height] slider height
 * @property {number} [barHeight] height of slider bar bar
 * @property {number} [sides] number of sides in curves (`20`)
 * @property {'dark' | 'light'} [theme] selects default colors for a light or
 * dark switch (`dark`)
 * @property {TypeColor} [colorOff] slider off color (bar color from slider
 * value to 1)
 * @property {TypeColor} [colorOn] slider on color (bar color from 0 to slider
 * value (`[0, 1, 0, 1]`)
 * @property {SliderBorder} [circleBorder] border around circle (defaults to on
 * where width is half the figure's default line width)
 * @property {SliderBorder} [barBorder] border around bar
 * (defaults to off - width = 0)
 * @extends OBJ_Collection
 */
export type COL_Slider = {
  width?: number;
  height?: number;
  barHeight?: number;
  sides?: number;
  theme?: 'dark' | 'light';
  colorOff?: TypeColor;
  colorOn?: TypeColor;
  circleBorder?: SliderBorder,
  barBorder?: SliderBorder,
} & OBJ_Collection;
/* eslint-enable max-len */


/*
..######..##.......####.########..########.########.
.##....##.##........##..##.....##.##.......##.....##
.##.......##........##..##.....##.##.......##.....##
..######..##........##..##.....##.######...########.
.......##.##........##..##.....##.##.......##...##..
.##....##.##........##..##.....##.##.......##....##.
..######..########.####.########..########.##.....##
*/
/* eslint-disable max-len */
/**
 * {@link FigureElementCollection} representing a slider control.
 *
 * ![](./apiassets/slider.gif)
 *
 * Notifications - The notification manager property `notifications` will
 * publish the following events:
 * - `changed`: slider value is changed - slider position in percent is passed
 *   as parameter to callback.
 *
 * See {@link COL_Slider} for setup options.
 *
 * To test examples below, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple slider with notification causing a console statement
 * const slider = figure.add({
 *   make: 'collections.slider',
 *   barHeight: 0.02,
 *   height: 0.1,
 *   width: 1,
 *   color: [0.5, 0.5, 0.5, 1],
 *   touchBorder: 0.2,
 * });
 *
 * slider.notifications.add('changed', (position) => {
 *   console.log(position)
 * });
 */
/* eslint-enable max-len */
// $FlowFixMe
class CollectionsSlider extends FigureElementCollection {
  _circ: FigureElementPrimitive;
  _bar: FigureElementPrimitive;
  _barOn: FigureElementPrimitive;
  _circBorder: FigureElementPrimitive | null;
  _barBorder: FigureElementPrimitive | null;

  width: number;
  height: number;
  colorOn: TypeColor;
  colorOff: TypeColor;
  barHeight: number;

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: COL_Slider,
  ) {
    const colorLight = [0.8, 0.8, 0.8, 1];
    const colorDark = [0.45, 0.45, 0.45, 1];
    const colorOn = collections.primitives.defaultColor;

    const defaultOptions = {
      sides: 20,
      colorOn,
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
    if (width == null) {
      width = collections.primitives.defaultLength;
    }

    // If only barHeight dimension is defined, then use it to define
    // height
    if (height == null && barHeight != null) {
      height = barHeight * 1.7;
    }

    // If only width dimension is defined, then use it to define height
    if (height == null && barHeight == null
    ) {
      height = collections.primitives.defaultLength / 10;
    }

    if (barHeight == null) {
      barHeight = height / 1.7;
    }

    super(joinObjects({}, options));
    this.collections = collections;

    this.width = width;
    this.height = height;
    this.barHeight = barHeight;
    const theme = themeColors[options.theme];
    this.colorOn = options.colorOn == null ? theme.off : options.colorOn;
    this.colorOff = options.colorOff == null ? theme.off : options.colorOff;

    this.add({
      name: 'bar',
      make: 'rectangle',
      width: width - options.barBorder.width * 2,
      height: barHeight - options.barBorder.width * 2,
      corner: { radius: barHeight / 2, sides: Math.max(Math.floor(options.sides / 2), 1) },
      color: this.colorOff,
    });
    this.add({
      name: 'barOn',
      make: 'rectangle',
      width: 1,
      height: barHeight - options.barBorder.width * 2,
      color: this.colorOn,
      position: [-width / 2 + barHeight / 2, 0],
      xAlign: 'left',
    });
    this.add({
      name: 'barOnStart',
      make: 'arc',
      radius: barHeight / 2 - options.barBorder.width * 2,
      sides: options.sides,
      angle: Math.PI,
      startAngle: Math.PI / 2,
      corner: { radius: barHeight / 2, sides: Math.max(Math.floor(options.sides / 2), 1) },
      color: this.colorOn,
      position: [-width / 2 + barHeight / 2, 0],
    });
    if (options.barBorder.width > 0) {
      this.add({
        name: 'barBorder',
        make: 'rectangle',
        width: width - options.barBorder.width,
        height: barHeight - options.barBorder.width,
        corner: { radius: barHeight / 2, sides: Math.max(Math.floor(options.sides / 2), 1) },
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

    this._custom.lastSeek = 0;
    this.set(0);
    this.setMove({
      // bounds: {
      //   p1: [-this.width / 2 + this.height / 2, 0],
      //   p2: [this.width / 2 - this.height / 2, 0],
      // },
      freely: false,
    });
    this.notifications.add('setState', () => {
      this.set(this._custom.lastSeek, false);
    });
    this.notifications.add('setTransform', () => {
      const p = this.getPosition().x / (this.width - this.height);
      this._custom.seek = clipValue(p + this._custom.seek, 0, 1);
      this.transform.updateTranslation([0, 0]);
      this.setElementsToCircle();
      this.notify();
      this._custom.lastSeek = this.getValue();
    });
    this.notifications.add('onClick', (params) => { // $FlowFixMe
      const [glPoint] = params;
      const p = (glPoint.transformBy(this.spaceTransformMatrix('gl', 'local')).x + this.width / 2 - this.height / 2) / (this.width - this.height);
      this._custom.seek = clipValue(p, 0, 1);
      this.setElementsToCircle();
      this.notify();
      this._custom.lastSeek = this.getValue();
    });
  }

  /**
   * Set slider to value between 0 and 1.
   * @param {number} percentage between 0 and 1
   * @param {boolean} notify `true` to send notifications on change, `false` to
   * supress (`true`)
   */
  set(percentage: number, notify: boolean = true) {
    this._custom.seek = clipValue(percentage, 0, 1);
    this.setElementsToCircle();
    if (notify) {
      this.notify();
    }
    this._custom.lastSeek = percentage;
  }

  /**
   * Get slider value.
   * @return {number} between 0 and 1
   */
  getValue() {
    return round(
      (this._circ.getPosition().x + this.width / 2 - this.height / 2) / (this.width - this.height),
      8,
    );
  }

  setElementsToCircle() {
    const circlePosition = this._custom.seek * (this.width - this.height)
      - this.width / 2 + this.height / 2;
    const barWidth = circlePosition + this.width / 2 - this.barHeight / 2;
    this._circ.setPosition(circlePosition);
    if (this._circBorder) {
      this._circBorder.setPosition(this._circ.getPosition());
    }
    this._barOn.setScale(barWidth, 1);
  }

  notify() {
    const p = this.getValue();
    if (this._custom.lastSeek !== p) {
      this.notifications.publish('changed', p);
    }
    this._custom.lastSeek = p;
  }
}

export default CollectionsSlider;
