// @flow

// import Figure from '../Figure';
import {
  Transform, Point,
  getPoint, // getTransform,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
import {
  round, range,
} from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import type {
  OBJ_Font, OBJ_Font_Fixed, TypeDash,
} from '../../tools/types';
import type {
  OBJ_Line, OBJ_TextLines,
} from '../FigurePrimitives/FigurePrimitiveTypes2D';
import type { OBJ_Collection } from '../FigurePrimitives/FigurePrimitiveTypes';
import type FigureCollections from './FigureCollections';

/**
 * Axis Ticks and Grid options object for {@link COL_Axis}.
 *
 * ![](./apiassets/axisticks.png)
 *
 * Ticks and grid locations can specified programatically with `start`,
 * `stop` and `step`, or manually using a `values` array where each value
 * is a value on the axis.
 *
 * `length` and `offset` control the length of the ticks/grid and how much
 * of the line is above or below the axis line. An offset of `0` will put
 * the entire tick on the positive side of the axis.
 *
 * Different properties are defined in different spaces.
 * - `start`, `step`, `stop` and `values` are all in axis space, or the values
 *   along the axis.
 * - `length`, `offset`, `width` and `dash` are all in draw space and relate
 *   to dimensions in the space the axis is being drawn into.
 *
 * @property {number} [start] start value of the ticks/grid on the axis
 * (`axis.start`)
 * @property {number} [step] step between ticks/grid
 * (`(axis.stop - axis.start) / 5`)
 * @property {number} [stop] stop value of the ticks/grid on the axis
 * (`axis.stop`)
 * @property {Array<number>} [values] value locations of the ticks/grid on
 * the axis (overrides `start`, `stop` and `step`)
 * @property {number} [length] length of the ticks/grid (draw space)
 * @property {number} [offset] offset of the ticks/grid (draw space) - use this
 * to center ticks around the axis or not (`-length / 2`)
 * @property {number} [width] width of ticks/grid (draw space)
 * @property {TypeDash} [dash] line style is solid or dashed (`[]`)
 *
 * @extends OBJ_Line
 *
 * @see
 *
 * {@link COL_Axis}
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 * @example
 * // Axis with no ticks
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   length: 2,
 * });
 *
 * @example
 * // Axis with default ticks
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   length: 2,
 *   ticks: true,
 * });
 *
 * @example
 * // Axis ticks with custom step and color
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   length: 2,
 *   ticks: { step: 0.5, color: [0, 0, 1, 1] },
 * });
 *
 * @example
 * // Axis with ticks between 0.2 and 0.8 below the line
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   length: 2,
 *   ticks: {
 *     start: 0.2,
 *     stop: 0.8,
 *     step: 0.2,
 *     length: 0.15,
 *     offset: -0.2,
 *     dash: [0.01, 0.01]
 *   },
 * });
 *
 * @example
 * // Axis with ticks at values
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   length: 2,
 *   ticks: { values: [0, 0.2, 0.8, 1] },
 * });
 */
export type OBJ_AxisTicks = {
  length?: number,
  offset?: number,
  width?: number,
} & OBJ_Line;


export type OBJ_AxisTicks_Fixed = {
  length: number,
  offset: number,
  width: number,
} & OBJ_Line;


/**
 * Axis label options object for the {@link COL_Axis}.
 *
 * ![](./apiassets/axislabels_ex1.png)
 *
 * ![](./apiassets/axislabels_ex2.png)
 *
 * ![](./apiassets/axislabels_ex3.png)
 *
 * ![](./apiassets/axislabels_ex4.png)
 *
 * ![](./apiassets/axislabels_ex5.png)
 *
 * ![](./apiassets/axislabels_ex6.png)
 *
 *
 * By default, labels are positioned with the first `ticks` defined in the
 * axis. Labels can also be positioned at custom values with `values`.
 *
 * Labels will be values at the label positions, unless specified as a specific
 * string or number in the `text` property.
 *
 * Different properties are defined in different spaces.
 * - `values`, is defined in axis space, or the values along the axis.
 * - `space` and `offset` are defined in draw space and relate
 *   to dimensions in the space the axis is being drawn into.
 *
 * @property {null | number | Array<number>} [values] the axis values to
 * position labels at - by default (`null`) these values will be the same
 * values as the first `ticks` values if `ticks` are defined (`null`)
 * @property {null | Array<string | null | number>} [text] An array of text to
 * be used for the labels. `null` will use the
 * value the label is at, `number` and `string` can be used for label
 * customization. If using an array that is shorter than the number of values
 * for labels to be drawn at, then `null` will be used for undefined values.
 * (`null`)
 * @property {number} [precision] Number of decimal places to be shown when the
 * label text is the axis value (`null`) or a `number` (`1`)
 * @property {'decimal' | 'exp'} [format] `'exp'` will present numbers in
 * exponential form (`'decimal'`)
 * @property {number} [space] space between the ticks and the label
 * @property {TypeParsablePoint} [offset] additional offset for the labels
 * (`[0, 0]`)
 * @property {number} [rotation] label rotation (`0`)
 * @property {'left' | 'right' | 'center'} [xAlign] horizontal alignment of
 * labels (`'center'` for x axes, `'right'` for y axes)
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] vertical
 * alignment of labels (`'top'` for x axes, `'middle'` for y axes)
 * @property {OBJ_Font} [font] specific font changes for labels
 * @property {Array<number> | number} [hide] value indexes to hide (`[]`)
 *
 * @see
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 * For more examples see {@link OBJ_Axis}.
 *
 * @example
 * // By default labels are displayed if there are ticks
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   length: 2,
 *   ticks: true,
 * });
 *
 * @example
 * // If there are multiple ticks, then just the first are used to show labels
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   length: 2,
 *   ticks: [
 *     { step: 0.5 },
 *     { step: 0.1, length: 0.05, offset: 0 },
 *   ],
 * });
 *
 * @example
 * // Long labels can be displayed with a rotation. Set the
 * // xAlign, yAlign and offset to make it look good.
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   axis: 'x',
 *   length: 2,
 *   start: 10000,
 *   stop: 20000,
 *   ticks: true,
 *   labels: {
 *     precision: 0,
 *     rotation: Math.PI / 4,
 *     yAlign: 'middle',
 *     xAlign: 'right',
 *     space: 0.05,
 *   },
 * });
 *
 * @example
 * // Specific labels can be hidden
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   length: 2,
 *   ticks: true,
 *   labels: { hide: 0 },
 * });
 *
 * @example
 * // Labels can be at specific values, and have a specific font
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   length: 2,
 *   ticks: true,
 *   labels: {
 *     values: [0, 0.6],
 *     font: { color: [0, 0, 1, 1], size: 0.15 },
 *   },
 * });
 *
 * @example
 * // Labels can be strings, `null` for the actual value, or numbers. If numbers
 * // then they will be drawn in the same format as the actual values.
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   length: 2,
 *   ticks: true,
 *   labels: {
 *     values: null,
 *     text: ['0', null, 'AB', '0.6', 0.8, null],
 *     format: 'exp',
 *   },
 * });
 */
export type OBJ_AxisLabels = {
  // values?: null | number | Array<number>,
  // text?: null | Array<string | null | number>,
  precision?: number,
  format?: 'decimal' | 'exp',
  space?: number,
  offset?: TypeParsablePoint,
  rotation?: number,
  xAlign?: 'left' | 'right' | 'center',
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
  font?: OBJ_Font,
  hide?: Array<number>,
};

export type OBJ_AxisLabelsFixed = {
  precision: number,
  format: 'decimal' | 'exp',
  space: number,
  offset: TypeParsablePoint,
  rotation: number,
  xAlign: 'left' | 'right' | 'center',
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
  font: OBJ_Font,
  hide: Array<number>,
};

/**
 * Axis title
 *
 * ({@link OBJ_TextLines} `& { rotation?: number, offset?:` {@link TypeParsablePoint} `}) | string`
 */
export type TypeAxisTitle = OBJ_TextLines & {
  rotation?: number,
  offset?: TypeParsablePoint
} | string;

/**
 * {@link CollectionsAxis} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
 *
 * An axis can be used to create a number line, used as an axis in
 * {@link COL_Plot} and/or used to plot a {@link COL_Trace} against.
 *
 * An axis is a line that may have
 * - tick marks
 * - labels
 * - grid lines
 * - a title
 *
 * An axis is drawn to a `length`. It will have values along its length
 * from `start` to `stop`. Ticks, grid lines and labels are all drawn
 * at axis value positions. All other dimensions, such as line lengths,
 * widths, positions, spaces and offsets are defined in draw space, or in the
 * same space as the `length` of the axis.
 *
 * @property {'x' | 'y'} [axis] `'x'` axes are horizontal, `'y'` axes are
 * vertical (`'x'`)
 * @property {number} [length] length of the axis
 * @property {OBJ_Line | boolean} [line] line style of the axis - `null` will draw
 * no line. By default, a solid line will be drawn if not defined.
 * @property {number} [start] start value of axis (`0`)
 * @property {number} [stop] stop value of axis. `stop` must be larger than
 * `start` (`start + 1`)
 * @property {OBJ_AxisTicks | Array<OBJ_AxisTicks> | boolean} [ticks] tick
 * options. Use an Array to setup multiple sets/styles of ticks. Use a boolean
 * value to turn ticks on or off. (`false`)
 * @property {OBJ_AxisLabels | Array<OBJ_AxisLabels> | boolean} [labels] label
 * options.
 * Use an array to setup multiple sets of labels, and use a boolean to turn
 * labels on and off (`true` if ticks exits, `false` otherwise)
 * @property {OBJ_AxisTicks | Array<OBJ_AxisTicks> | boolean} [grid] grid
 * options. Use an array for multiple sets of grids, and use a boolean to
 * turn grids on and off (`false`)
 * @property {TypeAxisTitle | boolean} [title] axis title (`false`)
 * @property {OBJ_Font} [font] default font of axis (used by title and labels)
 * @property {boolean} [show] `false` hides the axis. Two axes are needed
 * to plot an {@link CollectionsTrace} on a {@link CollectionsPlot}, but if either or
 * both axes aren't to be drawn, then use `false` to hide each axis (`true`)
 * @property {[number, number]} [auto] Will select automatic values for
 * `start`, `stop`, and `step` that cover the range [min, max]
 * @property {string} [name] axis name - used to define which axes a trace
 * should be plotted against in an {@link CollectionsPlot}.
 * @property {TypeParsablePoint} [position] axis position (`[0, 0]`)
 *
 * @extends OBJ_Collection
 */
export type COL_Axis = {
  axis?: 'x' | 'y',
  length?: number,              // draw space length
  line?: boolean | OBJ_Line,
  start?: number,               // value space start at draw space start
  stop?: number,                // value space stop at draw space stop
  ticks?: OBJ_AxisTicks | boolean,
  labels?: OBJ_AxisLabels,
  grid?: OBJ_AxisTicks | boolean,
  title?: TypeAxisTitle,
  font?: OBJ_Font,              // Default font
  show?: boolean,
  auto?: [number, number],
  name?: string,
  position?: TypeParsablePoint,
} & OBJ_Collection;


export type COL_AxisUpdate = {
  length?: number,              // draw space length
  line?: boolean | OBJ_Line,
  start?: number,               // value space start at draw space start
  stop?: number,                // value space stop at draw space stop
  ticks?: OBJ_AxisTicks | Array<OBJ_AxisTicks> | boolean,
  labels?: OBJ_AxisLabels | Array<OBJ_AxisLabels> | boolean,
  grid?: OBJ_AxisTicks | Array<OBJ_AxisTicks> | boolean,
  title?: TypeAxisTitle,
  font?: OBJ_Font,              // Default font
  show?: boolean,
  auto?: [number, number],
};


/*
...................###....##.....##.####..######.
..................##.##....##...##...##..##....##
.................##...##....##.##....##..##......
................##.....##....###.....##...######.
................#########...##.##....##........##
................##.....##..##...##...##..##....##
................##.....##.##.....##.####..######.
*/

/**
 * {@link FigureElementCollection} representing an Axis.
 *
 * This object defines an axis with an axis line, tick marks, labels,
 * grid lines and a title.
 *
 * See {@link COL_Axis} for the options that can be used when creating
 * the axis.
 *
 * An axis is drawn to a `length`. It will have values along its length
 * from `start` to `stop`. Ticks, grid lines and labels are all drawn
 * at axis value positions. All other dimensions, such as line lengths,
 * widths, positions, spaces and offsets are defined in draw space, or in the
 * same space as the `length` of the axis.
 *
 * The object contains additional methods that convert between axis values
 * and draw space positions, as well as a convenience method to report if a
 * value is within an axis.
 * - <a href="#collectionsaxisvaluetodraw">valueToDraw</a>
 * - <a href="#collectionsaxisdrawtovalue">drawToValue</a>
 * - <a href="#collectionsaxisinaxis">inAxis</a>
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 * For more examples of axis labels and axis ticks, see {@link OBJ_AxisLabels}
 * and {@link OBJ_AxisTicks}.
 *
 * #### Example
 * ```javascript
 * // By default an axis is an 'x' axis
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   ticks: true,
 * });
 * ```
 * ![](./apiassets/advaxis_ex1.png)
 *
 * #### Example
 * ```javascript
 * // An axis can also be created and then added to a figure
 * // An axis can have specific start and stop values
 * // An axis can be a y axis
 * const axis = figure.collections.axis({
 *   axis: 'y',
 *   start: -10,
 *   stop: 10,
 *   ticks: { step: 5 },
 * })
 * figure.add('axis', axis);
 * ```
 * ![](./apiassets/advaxis_ex2.png)
 *
 * #### Example
 * ```javascript
 * // An axis can have multiple sets of ticks and a title
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   ticks: [
 *     { step: 0.2, length: 0.1 },
 *     { step: 0.05, length: 0.05, offset: 0 },
 *   ],
 *   title: 'time (s)',
 * });
 * ```
 * ![](./apiassets/advaxis_ex3.png)
 *
 * #### Example
 * ```javascript
 * // An axis line and ticks can be customized to be dashed
 * // and have arrows
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   length: 2.5,
 *   start: -130,
 *   stop: 130,
 *   line: {
 *     dash: [0.01, 0.01],
 *     arrow: 'barb',
 *   },
 *   ticks: {
 *     start: -100,
 *     stop: 100,
 *     step: 25,
 *     dash: [0.01, 0.01],
 *   },
 *   labels: { precision: 0 },
 *   title: {
 *     font: { style: 'italic' },
 *     text: 'x',
 *     position: [2.65, 0.03],
 *   },
 * });
 * ```
 * ![](./apiassets/advaxis_ex4.png)
 *
 * #### Example
 * ```javascript
 * // An axis title can have grid lines extend from it, and titles with more
 * // formatting
 * figure.add({
 *   name: 'x',
 *   make: 'collections.axis',
 *   stop: 2,
 *   ticks: { step: 0.5 },
 *   grid: [
 *     { step: 0.5, length: 1, color: [0.5, 0.5, 0.5, 1] },
 *     { step: 0.1, length: 1, dash: [0.01, 0.01], color: [0.7, 0.7, 0.7, 1] },
 *   ],
 *   title: {
 *     font: { color: [0.4, 0.4, 0.4, 1] },
 *     text: [
 *       'Total Time',
 *       {
 *         text: 'in seconds',
 *         font: { size: 0.1 },
 *         lineSpace: 0.12,
 *       },
 *     ],
 *   },
 * });
 * ```
 * ![](./apiassets/advaxis_ex5.png)
 *
 *
 * @see {@link COL_Axis} for parameter descriptions
 *
 */
// $FlowFixMe
class CollectionsZoomAxis extends FigureElementCollection {
  // Figure elements
  _line: ?FigureElementPrimitive;
  _labels: ?FigureElementPrimitive;
  _grid: ?FigureElementPrimitive;
  _ticks: ?FigureElementPrimitive;

  length: number;
  angle: number;
  startValue: number;
  stopValue: number;
  showAxis: boolean;
  step: number;

  ticks: OBJ_AxisTicks_Fixed | null;
  grid: OBJ_AxisTicks_Fixed | null;
  labels: OBJ_AxisLabels | null;

  drawToValueRatio: number;
  valueToDrawRatio: number;
  defaultFont: OBJ_Font_Fixed;
  name: string;
  autoStep: null | number;
  axis: 'x' | 'y';
  line: OBJ_Line | null;
  grid: OBJ_Line | null;
  ticks: OBJ_Line | null;
  precision: number;

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: COL_Axis,
  ) {
    const defaultOptions: COL_Axis = {
      length: collections.primitives.defaultLength,
      angle: 0,
      start: 0,
      color: collections.primitives.defaultColor,
      font: collections.primitives.defaultFont,
      // name: '',
      line: {},
      precision: 10,
      show: true,
      axis: 'x',
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    super(options);
    this.collections = collections;
    this.name = options.name;
    this.startValue = options.start;
    if (options.stop != null) {
      this.stopValue = options.stop;
    } else {
      this.stopValue = this.startValue + 1;
    }
    this.step = options.step == null ? (this.stopValue - this.startValue) / 5 : options.step;
    this.length = options.length;
    this.calcRatios();
    this.precision = options.precision;
    this.showAxis = options.show;
    this.defaultFont = options.font;
    if (options.font == null || options.font.color == null) {
      this.defaultFont.color = options.color;
    }
    this.axis = options.axis;
    this.angle = this.axis === 'x' ? 0 : Math.PI / 2;
    this.setColor(options.color);
    this.line = null;
    if (options.line != null) {
      let lineO = options.line;
      if (lineO === true) {
        lineO = {};
      }
      const o = joinObjects(
        {},
        {
          width: this.collections.primitives.defaultLineWidth,
          color: this.color,
          length: this.length,
          angle: this.angle,
        },
        lineO,
      );
      this.line = o;
      const line = this.collections.primitives.line(o);
      this.add('line', line);
    }
    this.addTicks('grid', options);
    this.addTicks('ticks', options);
    this.labels = null;
    if (options.labels != null) {
      let labelsO = options.labels;
      if (labelsO === true) {
        labelsO = {};
      }
      const o = joinObjects(
        {},
        {
          precision: 1,
          format: 'decimal',  // or 'exponent'
          font: this.defaultFont,
          xAlign: this.axis === 'x' ? 'center' : 'right',
          yAlign: this.axis === 'x' ? 'baseline' : 'middle',
          rotation: 0,
          offset: [0, 0],
          fixed: false,
        },
        labelsO,
      );
      o.offset = getPoint(o.offset);
      this.labels = o;
      const labels = this.collections.primitives.text(joinObjects({}, o, { text: '0' }));
      labels.transform.updateRotation(o.rotation);
      this.add('labels', labels);
    }
    this.update(this.startValue, this.stopValue);
  }

  addTicks(type: 'grid' | 'ticks', options) {
    this[type] = null;
    if (options[type] != null) {
      let ticksOptions = options[type];
      if (ticksOptions === true) {
        ticksOptions = {};
      }
      const o = joinObjects(
        {},
        {
          width: this.line != null ? this.line.width : this.collections.primitives.defaultLineWidth,
          length: type === 'ticks' ? this.collections.primitives.defaultLineWidth * 10 : this.collections.primitives.defaultLineWidth * 50,
          angle: this.angle + Math.PI / 2,
          color: this.color,
          offset: 0,
        },
        ticksOptions,
      );
      this[type] = o;
      const ticks = this.collections.primitives.line(o);
      this.add(type, ticks);
    }
  }

  calcRatios() {
    this.drawToValueRatio = (this.stopValue - this.startValue) / this.length;
    this.valueToDrawRatio = 1 / this.drawToValueRatio;
  }

  rnd(value: number) {
    return round(value, this.precision);
  }

  pan(toValue: number, atPosition: number) {
    const normPosition = atPosition / this.length;
    const scale = this.stopValue - this.startValue;
    const offset = toValue - this.startValue - normPosition * scale;
    // console.log(normPosition, scale, offset, this.startValue + offset, this.stopValue + offset)
    this.update(this.startValue + offset, this.stopValue + offset);
  }

  update(startValue: number, stopValue: number) {
    this.startValue = startValue;
    this.stopValue = stopValue;
    this.calcRatios();
    const remainder = this.rnd(startValue % this.step);
    let startTick = startValue;
    let values = [];
    if (remainder > 0) {
      startTick = startValue + (this.step - remainder);
    } else if (remainder < 0) {
      startTick = startValue + (-remainder);
    }
    if (startTick <= stopValue) {
      values = range(startTick, stopValue, this.step);
    }
    console.log(values)

    // const { ticks, grid, labels, axis } = this;
    // const lengthSign = axis === 'x' ? 1 : -1;
    this.updateTicks('ticks', values);
    this.updateTicks('grid', values);
    this.updateText(values);
  }

  updateText(values: Array<number>) {
    if (this.labels == null || this._labels == null) {
      return;
    }

    let { space } = this.labels;
    const { offset, font, rotation, format, precision, fixed } = this.labels;
    if (space == null) {
      space = this.axis === 'x' ? font.size + this.collections.primitives.defaultLineWidth * 5 : this.collections.primitives.defaultLineWidth * 10;
    }
    const text = [];
    let bounds = 0;
    if (this.ticks != null) {
      if (this.axis === 'x') {
        bounds = Math.min(0, this.ticks.offset);
      } else {
        bounds = Math.min(0, -this.ticks.length + this.ticks.offset);
      }
    }
    for (let i = 0; i < values.length; i += 1) {
      let location;
      const draw = this.valueToDraw(values[i]);
      if (this.axis === 'x') {
        location = new Point(
          draw + offset.x,
          bounds - space + offset.y,
        ).rotate(-rotation);
      } else {
        location = new Point(
          bounds + offset.x - space,
          draw + offset.y,
        ).rotate(-rotation);
      }
      let label;
      if (format === 'decimal') {
        if (fixed) {
          label = `${round(values[i], precision).toFixed(precision)}`;
        } else {
          label = `${round(values[i], precision)}`;
        }
      } else {
        label = `${values[i].toExponential(precision)}`;
      }
      text.push({
        text: label,
        location,
      });
    }
    this._labels.drawingObject.loadText({
      text,
      font: this.labels.font,
      xAlign: this.labels.xAlign,
      yAlign: this.labels.yAlign,
    });
  }

  updateTicks(type: 'ticks' | 'grid', values: Array<number>) {
    const lengthSign = this.axis === 'x' ? 1 : -1;
    const ticks = this[type];
    if (ticks != null) {
      const length = ticks.length * lengthSign;
      let { offset } = ticks;
      if (offset == null) {
        offset = this.axis === 'x' ? -length / 2 : length / 2;
      }
      let copy;
      if (this.axis === 'x') {
        copy = [{ to: values.map(v => new Point(this.valueToDraw(v), 0)) }];
      } else {
        copy = [{ to: values.map(v => new Point(0, this.valueToDraw(v))) }];
      } // $FlowFixMe
      copy[0].original = false;
      const p1 = new Point(0, offset * lengthSign).rotate(this.angle);
      this[`_${type}`].custom.updatePoints({
        p1,
        copy,
        angle: this.angle + Math.PI / 2,
      });
    }
  }


  /**
   * Convert an axis value or values to a draw space position or positions.
   *
   * 'x' axes have a draw space position of 0 on the left end of the axis and
   * 'y' axes have a draw space position of 0 on the bottom end of the axis.
   *
   * @return {number} draw space position
   */
  valueToDraw<T: (number | Array<number>)>(value: T): T {
    if (typeof value === 'number') { // $FlowFixMe
      return (value - this.startValue) * this.valueToDrawRatio;
    }
    return value.map(v => (v - this.startValue) * this.valueToDrawRatio);
  }

  /**
   * Convert an axis draw space value or values to an axis value or values.
   *
   * 'x' axes have a draw space position of 0 on the left end of the axis and
   * 'y' axes have a draw space position of 0 on the bottom end of the axis.
   *
   * @return {number} draw space position
   */
  drawToValue<T: (number | Array<number>)>(drawValue: T): T {
    if (typeof drawValue === 'number') { // $FlowFixMe
      return drawValue * this.drawToValueRatio + this.startValue;
    }
    return drawValue.map(v => v * this.drawToValueRatio + this.startValue);
  }

  /**
   * Check if a value is within the axis.
   *
   * @return {boolean} `true` if value is within length of axis.
   */
  inAxis(value: number, precision: number = 8) {
    const roundedValue = round(value, precision);
    if (roundedValue < this.startValue || roundedValue > this.stopValue) {
      return false;
    }
    return true;
  }
  // isInAxis(value: number) {
  //   if (value )
  // }
}

export default CollectionsZoomAxis;
