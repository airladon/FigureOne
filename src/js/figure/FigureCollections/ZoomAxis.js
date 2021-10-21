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
  OBJ_Font, OBJ_Font_Fixed, TypeDash, TypeColor,
} from '../../tools/types';
import type {
  OBJ_Line, OBJ_TextLines,
} from '../FigurePrimitives/FigurePrimitiveTypes2D';
import type { OBJ_Collection } from '../FigurePrimitives/FigurePrimitiveTypes';
import type FigureCollections from './FigureCollections';

/**
 * @property {Array<number>} values
 * @property {number} start start value of axis at current zoom/pan
 * @property {number} stop stop value of axis at current zoom/pan
 * @property {number} step step value for current zoom
 * @property {number} mag zoom magnification
 */
export type OBJ_LabelsCallbackParams = {
  values: Array<number>,
  start: number,
  stop: number,
  step: number,
  z: number,
}
/**
 * Simple line style.
 *
 * @property {number} [width]
 * @property {TypeDash} [dash]
 * @property {TypeColor} [color]
 */
export type OBJ_SimpleLineStyle = {
  width?: number,
  dash?: TypeDash,
  color?: TypeColor,
};

/**
 * Axis Ticks and Grid options object for {@link COL_ZoomAxis}.
 *
 * @property {number} [length] length of the ticks/grid (draw space)
 * @property {number} [offset] offset of the ticks/grid (draw space) - use this
 * to center ticks around the axis or not (`-length / 2`)
 * @property {number} [width] width of ticks/grid (draw space)
 * @property {TypeDash} [dash] dash style of ticks (draw space)
 * @property {TypeColor} [color] color of ticks/grid
 *
 * @see
 *
 * {@link COL_ZoomAxis}
 */
export type OBJ_ZoomAxisTicks = {
  length?: number,
  offset?: number,
  width?: number,
  dash?: TypeDash,
  color?: TypeColor,
};


export type OBJ_ZoomAxisTicks_Fixed = {
  length: number,
  offset: number,
  width: number,
  width?: number,
  dash?: TypeDash,
  color?: TypeColor,
};


/**
 * Axis label options object for the {@link COL_ZoomAxis}.
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
 * @property {number} [precision] Maximum number of decimal places to be shown
 * @property {number} [precision] Fix the decimal places to the precision (all
 * labels have the same number of decimal places)
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
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 * For more examples see {@link OBJ_Axis}.
 *
 * @example
 */
export type OBJ_ZoomAxisLabels = {
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
  fixed?: boolean,
};

export type OBJ_ZoomAxisLabels_Fixed = {
  precision: number,
  format: 'decimal' | 'exp',
  space: number,
  offset: Point,
  rotation: number,
  xAlign: 'left' | 'right' | 'center',
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
  font: OBJ_Font_Fixed,
  hide: Array<number>,
  fixed: boolean,
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
 * @property {number} [length] length of the axis in draw space
 * @property {OBJ_SimpleLineStyle | boolean} [line] line style of the axis -
 * `false` will draw no line. By default, a solid line will be drawn if not
 * defined.
 * @property {number} [start] start value of axis (`0`)
 * @property {number} [stop] stop value of axis. `stop` must be larger than
 * `start` (`start + 1`)
 * @property {OBJ_AxisTicks | Array<OBJ_AxisTicks> | boolean} [ticks] tick
 * options. Use an Array to setup multiple sets/styles of ticks. Use a boolean
 * value to turn ticks on or off. (`false`)
 * @property {OBJ_AxisLabels | string | (Object) => Array<string>} [labels]
 * label options. Use `false` to turn labels off, or a string or function as
 * a callback to define custom labels for a set of values.
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
export type COL_ZoomAxis = {
  axis?: 'x' | 'y',
  length?: number,              // draw space length
  line?: boolean | OBJ_SimpleLineStyle,
  start?: number,               // value space start at draw space start
  stop?: number,                // value space stop at draw space stop
  ticks?: OBJ_ZoomAxisTicks | boolean | Array<OBJ_ZoomAxisTicks | boolean>,
  labels?: OBJ_ZoomAxisLabels | string | (OBJ_LabelsCallbackParams) => Array<string>,
  grid?: OBJ_ZoomAxisTicks | boolean | Array<OBJ_ZoomAxisTicks | boolean>,
  title?: TypeAxisTitle,
  font?: OBJ_Font,              // Default font
  show?: boolean,
  min?: number | null,
  max?: number | null,
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
  step: Array<number>;
  min: number | null;
  max: number | null;

  ticks: OBJ_ZoomAxisTicks_Fixed | null;
  grid: OBJ_ZoomAxisTicks_Fixed | null;
  labels: OBJ_ZoomAxisLabels_Fixed | null;

  drawToValueRatio: number;
  valueToDrawRatio: number;
  defaultFont: OBJ_Font_Fixed;
  name: string;
  autoStep: null | number;
  axis: 'x' | 'y';
  line: OBJ_Line | null;
  grid: Array<{
    width: number,
    length: number,
    angle: number,
    offset: number,
  } | false>;

  ticks: Array<{
    width: number,
    length: number,
    angle: number,
    offset: number,
  } | false>;

  // minorTicks: {
  //   width: number,
  //   length: number,
  //   angle: number,
  //   offset: number,
  // } | null;
  labelsCallback: null | string | (OBJ_LabelsCallbackParams) => Array<string>
  precision: number;
  currentZoom: number;
  initialScale: number;
  initialStart: number

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: COL_ZoomAxis,
  ) {
    const defaultOptions: COL_ZoomAxis = {
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
      min: null,
      max: null,
      border: 'rect',
      touchBorder: 'rect',
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
    this.initialStart = this.startValue;
    this.initialScale = this.stopValue - this.startValue;
    this.step = options.step == null ? [(this.stopValue - this.startValue) / 5] : options.step;
    if (!Array.isArray(this.step)) {
      this.step = [this.step];
    }
    // this.minorStep = options.minorStep == null
    //   ? (this.stopValue - this.startValue) / 20
    //   : options.minorStep;
    this.length = options.length;
    this.calcRatios();
    this.precision = options.precision;
    this.showAxis = options.show;
    this.min = options.min;
    this.max = options.max;
    if (this.min != null && this.min > this.startValue) {
      throw new Error(`ZoomAxis Error - min value cannot be greater than start value. Min pan: ${this.min}, start: ${this.startValue}`);
    }
    if (this.max != null && this.max < this.stopValue) {
      throw new Error(`ZoomAxis Error - max value cannot be less than stop value. Max pan: ${this.max}, stop: ${this.stopValue}`);
    }
    this.defaultFont = options.font;
    if (options.font == null || options.font.color == null) {
      this.defaultFont.color = options.color;
    }
    this.axis = options.axis;
    this.angle = this.axis === 'x' ? 0 : Math.PI / 2;
    this.setColor(options.color);
    this.currentZoom = 1;
    this.line = null;
    if (this.showAxis && options.line != null && options.line !== false) {
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

    if (!this.showAxis || options.grid == null) {
      options.grid = false;
    }
    if (!Array.isArray(options.grid)) {
      options.grid = [options.grid];
    }
    this.grid = Array(options.grid.length);
    for (let i = options.grid.length - 1; i >= 0; i -= 1) {
      this.addTicks('grid', options.grid[i], i);
    }

    if (!this.showAxis || options.ticks == null) {
      options.ticks = false;
    }
    if (!Array.isArray(options.ticks)) {
      options.ticks = [options.ticks];
    }
    this.ticks = Array(options.ticks.length);
    for (let i = options.ticks.length - 1; i >= 0; i -= 1) {
      this.addTicks('ticks', options.ticks[i], i);
    }

    const maxTicksGrid = Math.max(this.ticks.length, this.grid.length);
    while (this.step.length < maxTicksGrid) {
      this.step.push(this.step[this.step.length - 1] / 2);
    }

    // this.addTicks('minorGrid', options);
    // this.addTicks('grid', options);
    // this.addTicks('minorTicks', options);
    // this.addTicks('ticks', options);
    this.labels = null;
    if (this.showAxis && options.labels != null && options.labels !== false) {
      let labelsO = options.labels;
      if (typeof options.labels === 'string' || typeof options.labels === 'function') {
        this.labelsCallback = options.labels;
        labelsO = true;
      }
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
          hide: [],
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
    if (this.showAxis && options.title != null) {
      this.addTitle(options.title);
    }
  }

  addTicks(
    type: 'grid' | 'ticks',
    options: OBJ_ZoomAxisTicks | boolean,
    index: number,
  ) {
    // $FlowFixMe
    // this[type] = [];
    if (options != null) {
      let ticksOptions = options;
      if (ticksOptions === false) { // $FlowFixMe
        this[type][index] = false;
        return;
      }
      if (ticksOptions === true) {
        ticksOptions = {};
      }
      const widthScale = type === 'grid' ? 0.5 : 1;
      const length = type === 'ticks'
        ? this.collections.primitives.defaultLineWidth * (10 / (index + 1))
        : this.collections.primitives.defaultLineWidth * 50;
      const offset = type === 'ticks' ? -length / 2 : 0;
      const o = joinObjects(
        {},
        {
          width: (this.line != null // $FlowFixMe
            ? this.line.width / (index + 1)
            : this.collections.primitives.defaultLineWidth / (index + 1)) * widthScale,
          length,
          angle: this.angle + Math.PI / 2,
          color: this.color,
          offset,
        },
        ticksOptions,
      );
      // $FlowFixMe
      this[type][index] = o;
      const ticks = this.collections.primitives.line(o);
      this.add(`${type}${index}`, ticks);
    }
  }

  calcRatios() {
    this.drawToValueRatio = (this.stopValue - this.startValue) / this.length;
    this.valueToDrawRatio = 1 / this.drawToValueRatio;
  }

  rnd(value: number) {
    return round(value, this.precision);
  }

  /**
   * Pan so an axis value is located at a draw location.
   */
  pan(toValue: number, atDraw: number) {
    const normPosition = atDraw / this.length;
    const scale = this.stopValue - this.startValue;
    const [start, stop] = this.clipRange(
      toValue - normPosition * scale,
      toValue + (1 - normPosition) * scale,
    );
    this.update(start, stop);
  }

  clipRange(startIn: number, stopIn: number) {
    let start = startIn;
    let stop = stopIn;
    const span = stop - start;
    if (this.min != null && start < this.min) {
      start = this.min;
      stop = this.min + span;
      if (this.max != null) {
        stop = Math.min(this.max, stop);
      }
    }
    if (this.max != null && stop > this.max) {
      stop = this.max;
      start = this.max - span;
      if (this.min != null) {
        stop = Math.max(this.min, start);
      }
    }
    return [start, stop];
  }

  /**
   * Pan by some delta axis value.
   */
  panDeltaValue(deltaValue: number) {
    const [start, stop] = this.clipRange(this.startValue + deltaValue, this.stopValue + deltaValue);
    if (this.startValue !== start || this.stopValue !== stop) {
      this.update(start, stop);
    }
  }

  /**
   * Pan by some delta draw value.
   */
  panDeltaDraw(deltaDraw: number) {
    const deltaValue = deltaDraw / this.length * (this.stopValue - this.startValue);
    this.panDeltaValue(deltaValue);
    // this.update(this.startValue + deltaValue, this.stopValue + deltaValue);
  }

  /**
   * Zoom to some magnitude (`mag`), such that `value`
   * is located at `drawPosition` on the axis.
   */
  zoom(value: number, drawPosition: number, mag: number) {
    const normPosition = drawPosition / this.length;
    const scale = this.initialScale / mag;
    this.currentZoom = mag;
    this.update(value - normPosition * scale, value + (1 - normPosition) * scale);
  }

  /**
   * Zoom on a value that is already shown on the axis.
   */
  zoomValue(value: number, mag: number) {
    const normPosition = (value - this.startValue) / (this.stopValue - this.startValue);
    const span = this.initialScale / mag;
    this.currentZoom = mag;
    const [start, stop] = this.clipRange(
      value - normPosition * span,
      value + (1 - normPosition) * span,
    );
    this.update(start, stop);
  }

  /**
   * Zoom by a delta magnitude on a value already shown on the axis.
   */
  zoomDelta(value: number, magDelta: number) {
    const normPosition = (value - this.startValue) / (this.stopValue - this.startValue);
    this.currentZoom *= magDelta;
    const span = this.initialScale / this.currentZoom;
    const [start, stop] = this.clipRange(
      value - normPosition * span,
      value + (1 - normPosition) * span,
    );
    this.update(start, stop);
  }

  update(startValueIn: number, stopValueIn: number) {
    this.startValue = Math.max(this.min == null ? startValueIn : this.min, startValueIn);
    this.stopValue = Math.min(this.max == null ? stopValueIn : this.max, stopValueIn);
    this.currentZoom = this.initialScale / (this.stopValue - this.startValue);
    this.calcRatios();
    // const step = 1 / 2 ** Math.floor(-Math.log(this.step / this.currentZoom) / Math.log(2)) * 2;
    // we only want step to change for zooms of 4, 2, 1, 0.5, 0.25, 0.
    let z = 1;
    if (this.currentZoom < 1) {
      z = (2 ** Math.ceil(Math.log2(this.currentZoom)));
    } else {
      z = 2 ** Math.floor(Math.log2(this.currentZoom));
    }
    const step = this.step.map(s => s / z);
    // const step = this.step / z;
    // const minorStep = this.minorStep / z;

    const getValues = (s) => {
      const remainder = this.rnd(this.startValue % s);
      let startTick = this.startValue;
      let values = [];
      if (remainder > 0) {
        startTick = this.startValue + (s - remainder);
      } else if (remainder < 0) {
        startTick = this.startValue + (-remainder);
      }
      if (startTick <= this.stopValue) {
        values = range(startTick, this.stopValue, s);
      }
      return values;
    };
    const updateTicks = (type) => { // $FlowFixMe
      this[type].forEach((t, index) => {
        if (t === false) {
          return;
        }
        let s;
        if (index <= step.length - 1) {
          s = step[index];
        } else {
          s = step[step.length - 1];
        }
        const values = getValues(s);
        this.updateTicks(type, values, index);
      });
    };
    updateTicks('grid');
    updateTicks('ticks');

    const values = getValues(step[0]);
    this.updateText(values);
  }

  updateText(values: Array<number>) {
    if (this.labels == null || this._labels == null) {
      return;
    }

    let customLabels;
    if (this.labelsCallback != null) {
      customLabels = this.fnMap.exec(this.labelsCallback, ({
        values,
        start: this.startValue,
        stop: this.stopValue,
        step: this.step[0],
        mag: this.currentZoom,
      }));
    }

    let { space } = this.labels;
    const {
      offset, font, rotation, format, precision, fixed,
    } = this.labels;
    if (space == null) {
      space = this.axis === 'x' ? font.size + this.collections.primitives.defaultLineWidth * 5 : this.collections.primitives.defaultLineWidth * 10;
    }
    const text = [];
    let bounds = 0;
    if (this.ticks[0] !== false) {
      if (this.axis === 'x') {
        bounds = Math.min(0, this.ticks[0].offset);
      } else {
        bounds = Math.min(0, this.ticks[0].offset);
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
      if (customLabels != null) {
        label = customLabels[i];
      } else if (format === 'decimal') {
        if (fixed) {
          label = `${round(values[i], precision).toFixed(precision)}`;
        } else {
          label = `${round(values[i], precision)}`;
        }
      } else {
        label = `${values[i].toExponential(precision)}`;
      } // $FlowFixMe
      if (this.labels.hide.length > 0) { // $FlowFixMe
        if (this.labels.hide.indexOf(round(values[i], precision + 5)) > -1) {
          label = '';
        }
      }
      text.push({
        text: label,
        location,
      });
    }
    // $FlowFixMe
    this._labels.drawingObject.clear(); // $FlowFixMe
    this._labels.drawingObject.loadText({
      text, // $FlowFixMe
      font: this.labels.font, // $FlowFixMe
      xAlign: this.labels.xAlign, // $FlowFixMe
      yAlign: this.labels.yAlign,
    });
    // $FlowFixMe
    this._labels.drawBorder = this._labels.drawingObject.textBorder;
    // $FlowFixMe
    this._labels.drawBorderBuffer = this._labels.drawingObject.textBorderBuffer;
  }

  updateTicks(type: 'ticks' | 'grid', values: Array<number>, index: number) {
    const lengthSign = this.axis === 'x' ? 1 : -1; // $FlowFixMe
    const ticks = this[type][index];
    // if (this.axis === 'y') {
    //   console.log(index)
    // }
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
      // $FlowFixMe
      this[`_${type}${index}`].custom.updatePoints({
        p1,
        copy,
        angle: this.axis === 'x' ? this.angle + Math.PI / 2 : this.angle - Math.PI / 2,
      });
    }
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
}

export default CollectionsZoomAxis;
