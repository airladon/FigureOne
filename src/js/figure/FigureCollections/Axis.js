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
  OBJ_Line, OBJ_TextLines, OBJ_Collection,
} from '../FigurePrimitives/FigurePrimitives';
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
 *   method: 'collections.axis',
 *   options: {
 *     length: 2,
 *   },
 * });
 *
 * @example
 * // Axis with default ticks
 * figure.add({
 *   name: 'x',
 *   method: 'collections.axis',
 *   options: {
 *     length: 2,
 *     ticks: true,
 *   },
 * });
 *
 * @example
 * // Axis ticks with custom step and color
 * figure.add({
 *   name: 'x',
 *   method: 'collections.axis',
 *   options: {
 *     length: 2,
 *     ticks: { step: 0.5, color: [0, 0, 1, 1] },
 *   },
 * });
 *
 * @example
 * // Axis with ticks between 0.2 and 0.8 below the line
 * figure.add({
 *   name: 'x',
 *   method: 'collections.axis',
 *   options: {
 *     length: 2,
 *     ticks: {
 *       start: 0.2,
 *       stop: 0.8,
 *       step: 0.2,
 *       length: 0.15,
 *       offset: -0.2,
 *       dash: [0.01, 0.01]
 *     },
 *   },
 * });
 *
 * @example
 * // Axis with ticks at values
 * figure.add({
 *   name: 'x',
 *   method: 'collections.axis',
 *   options: {
 *     length: 2,
 *     ticks: { values: [0, 0.2, 0.8, 1] },
 *   },
 * });
 */
export type OBJ_AxisTicks = {
  start?: number,
  step?: number,
  stop?: number,
  values?: Array<number>,
  length?: number,
  offset?: number,
  width?: number,
  dash?: Array<number>,
} & OBJ_Line;


export type OBJ_AxisTicks_Fixed = {
  start: number,
  step: number,
  stop: number,
  values: Array<number>,
  length: number,
  offset: number,
  width: number,
  dash: TypeDash,
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
 *   method: 'collections.axis',
 *   options: {
 *     length: 2,
 *     ticks: true,
 *   },
 * });
 *
 * @example
 * // If there are multiple ticks, then just the first are used to show labels
 * figure.add({
 *   name: 'x',
 *   method: 'collections.axis',
 *   options: {
 *     length: 2,
 *     ticks: [
 *       { step: 0.5 },
 *       { step: 0.1, length: 0.05, offset: 0 },
 *     ],
 *   },
 * });
 *
 * @example
 * // Long labels can be displayed with a rotation. Set the
 * // xAlign, yAlign and offset to make it look good.
 * figure.add({
 *   name: 'x',
 *   method: 'collections.axis',
 *   options: {
 *     axis: 'x',
 *     length: 2,
 *     start: 10000,
 *     stop: 20000,
 *     ticks: true,
 *     labels: {
 *       precision: 0,
 *       rotation: Math.PI / 4,
 *       yAlign: 'middle',
 *       xAlign: 'right',
 *       space: 0.05,
 *     },
 *   },
 * });
 *
 * @example
 * // Specific labels can be hidden
 * figure.add({
 *   name: 'x',
 *   method: 'collections.axis',
 *   options: {
 *     length: 2,
 *     ticks: true,
 *     labels: { hide: 0 },
 *   },
 * });
 *
 * @example
 * // Labels can be at specific values, and have a specific font
 * figure.add({
 *   name: 'x',
 *   method: 'collections.axis',
 *   options: {
 *     length: 2,
 *     ticks: true,
 *     labels: {
 *       values: [0, 0.6],
 *       font: { color: [0, 0, 1, 1], size: 0.15 },
 *     },
 *   },
 * });
 *
 * @example
 * // Labels can be strings, `null` for the actual value, or numbers. If numbers
 * // then they will be drawn in the same format as the actual values.
 * figure.add({
 *   name: 'x',
 *   method: 'collections.axis',
 *   options: {
 *     length: 2,
 *     ticks: true,
 *     labels: {
 *       values: null,
 *       text: ['0', null, 'AB', '0.6', 0.8, null],
 *       format: 'exp',
 *     },
 *   },
 * });
 */
export type OBJ_AxisLabels = {
  values?: null | number | Array<number>,
  text?: null | Array<string | null | number>,
  precision?: number,
  format?: 'decimal' | 'exp',
  space?: number,
  offset?: TypeParsablePoint,
  rotation?: number,
  xAlign?: 'left' | 'right' | 'center',
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
  font?: OBJ_Font,
  hide?: Array<number>,
}

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
  ticks?: OBJ_AxisTicks | Array<OBJ_AxisTicks> | boolean,
  labels?: OBJ_AxisLabels | Array<OBJ_AxisLabels> | boolean,
  grid?: OBJ_AxisTicks | Array<OBJ_AxisTicks> | boolean,
  title?: TypeAxisTitle,
  font?: OBJ_Font,              // Default font
  show?: boolean,
  auto?: [number, number],
  name?: string,
  position?: TypeParsablePoint,
} & OBJ_Collection;


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
 *   method: 'collections.axis',
 *   options: {
 *     ticks: true,
 *   },
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
 *   method: 'collections.axis',
 *   options: {
 *     ticks: [
 *       { step: 0.2, length: 0.1 },
 *       { step: 0.05, length: 0.05, offset: 0 },
 *     ],
 *     title: 'time (s)',
 *   },
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
 *   method: 'collections.axis',
 *   options: {
 *     length: 2.5,
 *     start: -130,
 *     stop: 130,
 *     line: {
 *       dash: [0.01, 0.01],
 *       arrow: 'barb',
 *     },
 *     ticks: {
 *       start: -100,
 *       stop: 100,
 *       step: 25,
 *       dash: [0.01, 0.01],
 *     },
 *     labels: { precision: 0 },
 *     title: {
 *       font: { style: 'italic' },
 *       text: 'x',
 *       position: [2.65, 0.03],
 *     },
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
 *   method: 'collections.axis',
 *   options: {
 *     stop: 2,
 *     ticks: { step: 0.5 },
 *     grid: [
 *       { step: 0.5, length: 1, color: [0.5, 0.5, 0.5, 1] },
 *       { step: 0.1, length: 1, dash: [0.01, 0.01], color: [0.7, 0.7, 0.7, 1] },
 *     ],
 *     title: {
 *       font: { color: [0.4, 0.4, 0.4, 1] },
 *       text: [
 *         'Total Time',
 *         {
 *           text: 'in seconds',
 *           font: { size: 0.1 },
 *           lineSpace: 0.12,
 *         },
 *       ],
 *     },
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
class CollectionsAxis extends FigureElementCollection {
  // Figure elements
  _line: ?FigureElementPrimitive;
  _majorTicks: ?FigureElementPrimitive;
  _majorGrid: ?FigureElementPrimitive;
  _minorTicks: ?FigureElementPrimitive;
  _minorGrid: ?FigureElementPrimitive;
  _labels: ?FigureElementPrimitive;
  _arrow1: ?FigureElementPrimitive;
  _arrow2: ?FigureElementPrimitive;
  _title: ?FigureElementPrimitive;

  length: number;
  angle: number;
  startValue: number;
  stopValue: number;
  showAxis: boolean;

  ticks: Array<OBJ_AxisTicks_Fixed>;
  grid: Array<OBJ_AxisTicks_Fixed>;

  labels: Array<OBJ_AxisLabels>;

  drawToValueRatio: number;
  valueToDrawRatio: number;
  defaultFont: OBJ_Font_Fixed;
  name: string;
  autoStep: null | number;
  axis: 'x' | 'y';
  line: OBJ_Line;

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
      name: '',
      line: {},
      // grid: null,
      // ticks: null,
      show: true,
      axis: 'x',
      transform: new Transform('Axis').scale(1, 1).rotate(0).translate(0, 0),
      limits: collections.primitives.limits,
    };
    let options = joinObjects({}, defaultOptions, optionsIn);
    super(options);
    this.collections = collections;
    this.autoStep = null;
    if (optionsIn.auto != null) {
      const {
        start, stop, step, precision,
      } = this.calcAuto(optionsIn.auto);
      defaultOptions.start = start;
      defaultOptions.stop = stop;
      defaultOptions.ticks = {};
      defaultOptions.labels = { precision };
      this.autoStep = step;
    }
    options = joinObjects({}, defaultOptions, optionsIn);
    if (options.stop == null || options.stop <= options.start) {
      options.stop = options.start + 1;
    }
    this.name = options.name;
    this.defaultFont = options.font;
    if (optionsIn.font == null || optionsIn.font.color == null) {
      this.defaultFont.color = options.color;
    }
    this.showAxis = options.show;
    this.startValue = options.start;
    this.stopValue = options.stop;
    if (this.startValue >= this.stopValue) {
      this.startValue = this.stopValue - 1;
    }
    this.length = options.length;
    this.axis = options.axis;
    this.angle = this.axis === 'x' ? 0 : Math.PI / 2;
    this.drawToValueRatio = (options.stop - options.start) / options.length;
    this.valueToDrawRatio = 1 / this.drawToValueRatio;
    if (options.ticks != null && options.labels === undefined) {
      options.labels = {};
    }
    // if (options.position != null) {
    //   this.transform.updateTranslation(getPoint(options.position));
    // }
    // if (options.transform != null) {
    //   this.transform = getTransform(options.transform);
    // }
    this.setColor(options.color);

    this.ticks = [];
    this.grid = [];
    this.labels = [];

    if (this.showAxis && options.line != null && options.line !== false) {
      this.addLine(options.line);
    }
    if (this.showAxis && options.ticks != null && options.ticks !== false) {
      this.addTicks(options.ticks, 'ticks');
    }

    if (this.showAxis && options.labels != null && options.labels !== false) {
      this.addLabels(options.labels);
    }
    if (this.showAxis && options.title != null) {
      this.addTitle(options.title);
    }
    if (this.showAxis && options.grid != null && options.grid !== false) {
      this.addTicks(options.grid, 'grid');
    }
    this.reorder();
  }

  addLine(optionsInOrBool: OBJ_Line | boolean) {
    let optionsIn = optionsInOrBool;
    if (optionsInOrBool === true) {
      optionsIn = {};
    }
    const defaultOptions = {
      length: this.length,
      angle: this.angle,
      width: this.collections.primitives.defaultLineWidth,
      color: this.color,
    };
    const o = joinObjects({}, defaultOptions, optionsIn);
    const line = this.collections.primitives.line(o);
    this.line = o;
    this.add('line', line);
  }

  reorder() {
    let grid = [];
    let ticks = [];
    const line = [];
    this.drawOrder.forEach((elementName) => {
      if (elementName.startsWith('grid')) {
        grid.push(elementName);
      }
      if (elementName.startsWith('tick')) {
        ticks.push(elementName);
      }
      if (elementName.startsWith('line')) {
        line.push(elementName);
      }
    });
    ticks = ticks.reverse();
    grid = grid.reverse();
    this.toBack(ticks);
    this.toBack(line);
    this.toBack(grid);
  }

  processTicks(
    name: 'ticks' | 'grid',
    o: { start?: number, stop?: number, step?: number},
    index: number,
  ) {
    // let { start, stop } = this;
    let start = this.startValue;
    let stop = this.stopValue;
    let step;
    if (o.start != null) {
      start = o.start;
    }
    if (o.stop != null) {
      stop = o.stop;
    }
    if (o.step != null) {
      step = o.step;
    }

    if (name === 'grid' && this.ticks.length >= index + 1) {
      if (o.start == null) {
        start = this.ticks[index].start;
      }
      if (o.stop == null) {
        stop = this.ticks[index].stop;
      }
      if (o.step == null) {
        step = this.ticks[index].step;
      }
    }
    if (step == null && this.autoStep != null && this.autoStep < (stop - start) / 2) {
      step = this.autoStep;
    } else if (step == null && index === 0) {
      step = (stop - start) / 5;
    } else if (step == null) { // $FlowFixMe
      step = this[name].step / 2;
    }
    return { start, stop, step };
  }

  addTicks(optionsInOrBool: OBJ_AxisTicks | Array<OBJ_AxisTicks> | boolean, name: 'ticks' | 'grid' = 'ticks') {
    let optionsIn = optionsInOrBool;
    if (optionsInOrBool === true) {
      optionsIn = {};
    }
    const defaultOptions = {
      // start: this.startValue,
      // stop: this.stopValue,
      // step: (this.stopValue - this.startValue) / 5,
      width: this.line != null ? this.line.width : this.collections.primitives.defaultLineWidth,
      length: name === 'ticks' ? this.collections.primitives.defaultLineWidth * 10 : this.collections.primitives.defaultLineWidth * 50,
      angle: this.angle + Math.PI / 2,
      color: this.color,
    };
    let optionsToUse;
    if (Array.isArray(optionsIn)) {
      optionsToUse = optionsIn;
    } else {
      optionsToUse = [optionsIn];
    } // $FlowFixMe
    this[name] = [];
    const elements = [];
    const lengthSign = this.axis === 'x' ? 1 : -1;
    optionsToUse.forEach((options, index) => {
      const o = joinObjects({}, defaultOptions, options);
      const { start, stop, step } = this.processTicks(name, o, index);
      o.start = start;
      o.stop = stop;
      o.step = step;
      o.length *= lengthSign;
      if (o.offset == null && name === 'ticks') {
        o.offset = this.axis === 'x' ? -o.length / 2 : o.length / 2;
      } else if (o.offset == null && name === 'grid') {
        const t = this.transform.t() || new Point(0, 0);
        if (this.axis === 'x') {
          o.offset = -t.y;
        } else {
          o.offset = -t.x;
        }
      }
      const num = Math.floor((o.stop + o.step / 10000 - o.start) / o.step);
      o.num = num;
      if (o.values == null) {
        o.values = range(o.start, o.stop, o.step);
      }

      if (this.axis === 'x') {
        o.copy = [{ to: o.values.map(v => new Point(this.valueToDraw(v), 0)) }];
      } else {
        o.copy = [{ to: o.values.map(v => new Point(0, this.valueToDraw(v))) }];
      } // $FlowFixMe
      o.copy[0].original = false;

      if (o.p1 == null) {
        o.p1 = new Point(0, o.offset * lengthSign).rotate(this.angle);
      }

      const ticks = this.collections.primitives.line(o);
      elements.push(ticks); // $FlowFixMe
      this[name].push(o);
    });

    // Add elements in reverse to ensure first elements are drawn last and
    // will therefore overwrite later elements.
    elements.reverse();
    elements.forEach((element, index) => {
      this.add(`${name}${index}`, element);
    });
  }

  addTitle(optionsIn: OBJ_TextLines & { rotation?: number, offset?: TypeParsablePoint } | string) {
    const defaultOptions = {
      font: joinObjects({}, this.defaultFont, { size: this.defaultFont.size || 0.1 * 1.3 }),
      justify: 'center',
      xAlign: 'center',
      yAlign: this.axis === 'x' ? 'top' : 'bottom',
      rotation: this.axis === 'x' ? 0 : Math.PI / 2,
      offset: [0, 0],
    };
    let optionsToUse = optionsIn;
    if (typeof optionsIn === 'string') {
      optionsToUse = { text: [optionsIn] };
    }
    const o = joinObjects({}, defaultOptions, optionsToUse);
    o.offset = getPoint(o.offset);
    const bounds = this.getBoundingRect('draw');
    if (o.position == null) {
      if (this.axis === 'x') {
        o.position = new Point(this.length / 2, bounds.bottom - o.font.size / 1.5).add(o.offset);
      } else {
        o.position = new Point(bounds.left - o.font.size / 1.5, this.length / 2).add(o.offset);
      }
    }
    const title = this.collections.primitives.textLines(o);
    title.transform.updateRotation(o.rotation);
    this.add('title', title);
  }

  addLabels(optionsInOrBool: OBJ_AxisLabels | Array<OBJ_AxisLabels> | boolean) {
    let optionsIn = optionsInOrBool;
    if (optionsInOrBool === true) {
      optionsIn = {};
    }
    const defaultOptions = {
      text: null,
      precision: 1,
      values: null,
      format: 'decimal',  // or 'exponent'
      font: this.defaultFont,
      xAlign: this.axis === 'x' ? 'center' : 'right',
      yAlign: this.axis === 'x' ? 'baseline' : 'middle',
      rotation: 0,
    };
    let optionsToUse;
    if (Array.isArray(optionsIn)) {
      optionsToUse = optionsIn;
    } else {
      optionsToUse = [optionsIn];
    }
    this.labels = [];
    const bounds = this.getBoundingRect('draw');
    optionsToUse.forEach((options, index) => {
      const o = joinObjects({}, defaultOptions, options);
      if (typeof o.hide === 'number') {
        o.hide = [o.hide];
      }
      if (typeof o.values === 'number') {
        o.values = [o.values];
      }

      o.offset = getPoint(o.offset);

      if (typeof o.text === 'string') {
        o.text = [o.text];
      }

      // Values where to put the labels - null is auto which is same as ticks
      let values = [];
      if (o.values == null && this.ticks.length > 0) {
        values = this.ticks[index].values;
      } else {
        values = o.values;
      }
      if (values == null) {
        values = [];
      }

      // Text for labels at each value - null is actual value
      if (o.text == null) {
        o.text = [];
        o.text = Array(values.length).map(() => null);
      }

      if (o.space == null) {
        o.space = this.axis === 'x' ? o.font.size + this.collections.primitives.defaultLineWidth * 5 : this.collections.primitives.defaultLineWidth * 10;
      }

      // Generate the text objects
      const text = [];
      for (let i = 0; i < values.length; i += 1) {
        let location;
        const draw = this.valueToDraw(values[i]);
        if (this.axis === 'x') {
          location = new Point(
            draw + o.offset.x,
            bounds.bottom - o.space + o.offset.y,
          ).rotate(-o.rotation);
        } else {
          location = new Point(
            bounds.left + o.offset.x - o.space,
            draw + o.offset.y,
          ).rotate(-o.rotation);
        }
        if (
          o.hide == null
          || (o.hide != null && o.hide.indexOf(i) === -1)
        ) {
          let label = o.text[i];
          if (label == null) {
            label = values[i];
          }
          if (typeof label === 'number') {
            if (o.format === 'decimal') {
              label = `${round(label, o.precision).toFixed(o.precision)}`;
            } else {
              label = `${label.toExponential(o.precision)}`;
            }
          }
          text.push({
            text: label,
            location,
          });
        }
      }
      o.text = text;
      const labels = this.collections.primitives.text(o);
      labels.transform.updateRotation(o.rotation);
      this.add(`labels${index}`, labels);
      this.labels.push(o);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  calcAuto(auto: [number, number]) {
    const [min, max] = auto;
    const r = max - min;
    let order;
    if (r < 1) {
      order = Math.floor(Math.log10(r));
    } else if (1 <= r && r < 3) {
      order = Math.floor(Math.log10(r / 3));
    } else {
      order = Math.ceil(Math.log10(r));
    }
    // let order = r < 10 ? Math.floor(Math.log10(r)) : Math.ceil(Math.log10(r));
    if (order === 0) {
      order = 1;
    }
    const factor = 10 ** (order - 1);
    // const newRange = Math.ceil(r / factor + 1) * factor;
    const newStart = Math.floor(min / factor) * factor;
    const newEnd = Math.ceil(max / factor) * factor;
    const newRange = newEnd - newStart;
    // const newEnd = newStart + newRange;
    let step;
    switch (round(newRange / factor)) {
      case 3:
      case 6:
        step = newRange / 3;
        break;
      case 4:
      case 8:
        step = newRange / 4;
        break;
      case 7:
        step = newRange / 7;
        break;
      case 9:
        step = newRange / 3;
        break;
      default:
        step = newRange / 5;
    }
    let precision = 0;
    if (order < 0) {
      precision = Math.abs(order) + 1;
    }
    return {
      start: round(newStart),
      stop: round(newEnd),
      step: round(step),
      precision: round(precision),
    };
  }

  // _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
  //   return [...super._getStateProperties(options),
  //     'length', 'angle', 'start', 'stop',
  //     'ticks', 'grid', 'labels', 'drawToValueRatio', 'valueToDraw',
  //   ];
  // }

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
  drawToValue<T: (number | Array<number>)>(value: T): T {
    if (typeof value === 'number') { // $FlowFixMe
      return value * this.drawToValueRatio;
    }
    return value.map(v => v * this.drawToValueRatio);
  }

  /**
   * Check if a value is within the axis.
   *
   * @return {boolean} `true` if value is within length of axis.
   */
  inAxis(value: number) {
    if (value < this.startValue || value > this.stopValue) {
      return false;
    }
    return true;
  }
  // isInAxis(value: number) {
  //   if (value )
  // }
}

export default CollectionsAxis;
