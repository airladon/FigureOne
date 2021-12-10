// @flow

// import Figure from '../Figure';
import {
  Transform, Point,
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
import { getRectangleBorder, rectangleBorderToTris } from '../geometries/rectangle';


/**
 * Border of circle or bar of slider.
 *
 * @property {width} [number] border width
 * @property {color} [TypeColor] border color
 * @see {@link OBJ_Slider}
 */
export type OBJ_SliderBorder = {
  width?: number;
  color?: TypeColor;
};

/**
 * Slider marker options.
 *
 * @property {'polygon' | 'rectangle'} [style]
 * @property {number} [width] width of 'rectangle'
 * @see {@link OBJ_Slider}
 */
export type OBJ_SliderMarker = {
  width?: number;
  style?: 'polygon' | 'rectangle';
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
 * @property {OBJ_SliderMarker | 'polygon' | 'rectangle' | 'none'} [marker] marker style
 * (`'polygon'`)
 * @property {'dark' | 'light'} [theme] selects default colors for a light or
 * dark switch (`dark`)
 * @property {TypeColor} [colorOff] slider off color (bar color from slider
 * value to 1)
 * @property {TypeColor} [colorOn] slider on color (bar color from 0 to slider
 * value (`[0, 1, 0, 1]`)
 * @property {OBJ_SliderBorder} [markerBorder] border around circle (defaults to on
 * where width is half the figure's default line width)
 * @property {OBJ_SliderBorder} [barBorder] border around bar
 * (defaults to off - width = 0)
 * @extends OBJ_Collection
 */
export type COL_Slider = {
  width?: number;
  height?: number;
  barHeight?: number;
  marker?: OBJ_SliderMarker | 'polygon' | 'rectangle' | 'none';
  sides?: number;
  theme?: 'dark' | 'light';
  colorOff?: TypeColor;
  colorOn?: TypeColor;
  markerBorder?: OBJ_SliderBorder,
  barBorder?: OBJ_SliderBorder,
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
 * ![](./apiassets/slider.png)
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
 * <a href="#drawing-boilerplate">boilerplate</a>
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
 *
 * @example
 * // Slider without a marker and red fill for on
 * figure.add({
 *   make: 'collections.slider',
 *   barHeight: 0.1,
 *   colorOn: [1, 0, 0, 1],
 *   width: 1,
 *   touchBorder: 0.2,
 *   marker: 'none',
 * });
 *
 * @example
 * // Slider with rectangle marker and multi-colors
 * const slider = figure.add({
 *   make: 'collections.slider',
 *   barHeight: 0.02,
 *   height: 0.1,
 *   width: 1,
 *   marker: 'rectangle',
 *   colorOff: [1, 0, 0, 1],
 *   colorOn: [0, 0.8, 0, 1],
 *   color: [0, 0, 0, 1],
 * });
 */
/* eslint-enable max-len */
// $FlowFixMe
class CollectionsSlider extends FigureElementCollection {
  _marker: FigureElementPrimitive;
  _bar: FigureElementPrimitive;
  _barOn: FigureElementPrimitive;
  _markerBorder: FigureElementPrimitive | null;
  _barBorder: FigureElementPrimitive | null;

  width: number;
  height: number;
  markerWidth: number;
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
      markerBorder: {
        width: collections.primitives.defaultLineWidth / 2,
      },
      barBorder: {
        width: 0,
      },
      marker: {
        style: 'polygon',
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
        markerBorder: colorLight,
        barBorder: colorLight,
      },
      light: {
        color: colorLight,
        on: colorOn,
        off: colorDark,
        markerBorder: colorDark,
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
      barHeight = height / 5;
    }

    if (options.marker === 'rectangle') {
      options.marker = { style: 'rectangle', width: height / 5 };
    }
    if (options.marker === 'polygon') {
      options.marker = { style: 'polygon' };
    }
    if (options.marker.style === 'rectangle' && options.marker.width == null) {
      options.marker.width = height / 5;
    }
    if (options.marker === 'none') {
      options.marker = { style: 'rectangle', width: 0 };
      options.markerBorder = 0;
    }

    super(joinObjects({}, options));
    this.collections = collections;

    this.width = width;
    this.markerWidth = options.marker.style === 'rectangle' ? options.marker.width : height;
    // this.height = height;
    this.barHeight = barHeight;
    const theme = themeColors[options.theme];
    this.colorOn = options.colorOn == null ? theme.off : options.colorOn;
    this.colorOff = options.colorOff == null ? theme.off : options.colorOff;

    const barRadius = Math.min(barHeight / 2, this.markerWidth / 2);
    this.add({
      name: 'bar',
      make: 'rectangle',
      width: width - options.barBorder.width * 2,
      height: barHeight - options.barBorder.width * 2,
      corner: { radius: barRadius, sides: Math.max(Math.floor(options.sides / 2), 1) },
      color: this.colorOff,
    });
    this.add({
      name: 'barOn',
      make: 'rectangle',
      width: 1,
      height: barHeight - options.barBorder.width * 2,
      color: this.colorOn,
      position: [-width / 2 + this.markerWidth / 2, 0],
      xAlign: 'left',
    });
    if (barRadius > 0) {  // $FlowFixMe
      const barOnBorder = getRectangleBorder({
        width: this.width,
        height: barHeight,
        corner: {
          radius: barRadius,
          sides: Math.max(Math.floor(options.sides / 2)),
        },
        xAlign: 'center',
        yAlign: 'middle',
      });
      const num = barOnBorder.length;
      const startPoints = [
        new Point(-width / 2 + this.markerWidth / 2, barHeight / 2),
        ...barOnBorder.slice(num / 4 * 3),
        ...barOnBorder.slice(0, num / 4),
        new Point(-width / 2 + this.markerWidth / 2, -barHeight / 2),
      ];
      const barPoints = rectangleBorderToTris(startPoints);
      this.add({
        name: 'barOnStart',
        make: 'generic',
        points: barPoints,
        color: this.colorOn,
        border: startPoints,
        // position: [-width / 2 + this.markerWidth / 2, 0],
      });
    }
    if (options.barBorder.width > 0) {
      this.add({
        name: 'barBorder',
        make: 'rectangle',
        width: width - options.barBorder.width,
        height: barHeight - options.barBorder.width,
        corner: {
          radius: Math.max(barHeight / 2, this.markerWidth / 2),
          sides: Math.max(Math.floor(options.sides / 2), 1),
        },
        line: { width: options.barBorder.width },
        color: options.barBorder.color == null
          ? theme.barBorder
          : options.barBorder.color,
      });
    } else {
      this._barBorder = null;
    }
    let markerOptions = {
      make: 'rectangle',
      width: Math.max(this.markerWidth - options.markerBorder.width, 0),
      height: height - options.markerBorder.width,
    };
    let markerBorderOptions = {
      make: 'rectangle',
      width: Math.max(this.markerWidth - options.markerBorder.width / 2, 0),
      height: height - options.markerBorder.width / 2,
    };
    if (options.marker.style === 'polygon') {
      markerOptions = {
        make: 'polygon',
        radius: height / 2 - options.markerBorder.width,
        sides: options.sides,
      };
      markerBorderOptions = {
        make: 'polygon',
        radius: height / 2 - options.markerBorder.width / 2,
        sides: options.sides,
      };
    }
    this.add(joinObjects({}, {
      name: 'marker',
      // make: options.marker.style,
      // radius: height / 2 - options.markerBorder.width,
      // sides: options.sides,
      color: options.color == null ? theme.color : options.color,
      // width: this.markerWidth - options.markerBorder.width,
      // height: height - options.markerBorder.height,
    }, markerOptions));
    if (options.markerBorder.width > 0) {
      this.add(joinObjects({}, {
        name: 'markerBorder',
        // make: options.marker.style,
        // radius: height / 2 - options.markerBorder.width / 2,
        // sides: options.sides,
        line: { width: options.markerBorder.width },
        color: options.markerBorder.color == null
          ? theme.markerBorder
          : options.markerBorder.color,
        // width: this.markerWidth - options.markerBorder.width / 2,
        // height: height - options.markerBorder.width / 2,
      }, markerBorderOptions));
    } else {
      this._markerBorder = null;
    }

    this._custom.lastSeek = 0;
    this.setValue(0);
    this.setMove({
      // bounds: {
      //   p1: [-this.width / 2 + this.height / 2, 0],
      //   p2: [this.width / 2 - this.height / 2, 0],
      // },
      freely: false,
    });
    this.notifications.add('setState', () => {
      this.setValue(this._custom.lastSeek, false);
    });
    this._custom.lastPosition = this.getPosition();
    this.notifications.add('beforeMove', () => {
      this._custom.lastPosition = this.getPosition();
    });
    this.notifications.add('setTransform', () => {
      const p = (this.getPosition().x - this._custom.lastPosition.x)
        / (this.width - this.markerWidth);
      this._custom.seek = clipValue(p + this._custom.seek, 0, 1);
      this.transform.updateTranslation(this._custom.lastPosition);
      this.setElementsToCircle();
      this.notify();
      this._custom.lastSeek = this.getValue();
    });
    this.notifications.add('onClick', (params) => { // $FlowFixMe
      const [, glPoint] = params;
      const localPoint = glPoint.transformBy(this.spaceTransformMatrix('gl', 'local'));
      const p = (localPoint.x - this._custom.lastPosition.x + this.width / 2 - this.markerWidth / 2)
        / (this.width - this.markerWidth);
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
  setValue(percentage: number, notify: boolean = true) {
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
      (this._marker.getPosition().x + this.width / 2 - this.markerWidth / 2)
        / (this.width - this.markerWidth),
      8,
    );
  }

  setElementsToCircle() {
    const circlePosition = this._custom.seek * (this.width - this.markerWidth)
      - this.width / 2 + this.markerWidth / 2;
    const barWidth = circlePosition + this.width / 2 - this.markerWidth / 2;
    this._marker.setPosition(circlePosition);
    if (this._markerBorder) {
      this._markerBorder.setPosition(this._marker.getPosition());
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
