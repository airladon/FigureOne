// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point,
  getPoint, getTransform,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
import {
  round, range,
} from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';


/**
 * Axis Ticks and Grid options object for {@link ADV_Axis}.
 *
 * ![](./assets1/axisticks.png)
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
 * {@link ADV_Axis}
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 * @example
 * // Axis with no ticks
 * diagram.addElement({
 *   name: 'x',
 *   method: 'advanced.axis',
 *   options: {
 *     length: 2,
 *   },
 * });
 *
 * @example
 * // Axis with default ticks
 * diagram.addElement({
 *   name: 'x',
 *   method: 'advanced.axis',
 *   options: {
 *     length: 2,
 *     ticks: true,
 *   },
 * });
 *
 * @example
 * // Axis ticks with custom step and color
 * diagram.addElement({
 *   name: 'x',
 *   method: 'advanced.axis',
 *   options: {
 *     length: 2,
 *     ticks: { step: 0.5, color: [0, 0, 1, 1] },
 *   },
 * });
 *
 * @example
 * // Axis with ticks between 0.2 and 0.8 below the line
 * diagram.addElement({
 *   name: 'x',
 *   method: 'advanced.axis',
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
 * diagram.addElement({
 *   name: 'x',
 *   method: 'advanced.axis',
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


/**
 * Axis label options object.
 *
 * By default, labels are positioned with the first `ticks` defined in the axis.
 */
export type OBJ_AxisLabels = {
  font?: OBJ_Font,
  precision?: number,
  rotation?: number,
  xAlign?: 'left' | 'right' | 'center',
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
  offset?: TypeParsablePoint,
  text?: null | Array<string>,
  values?: null | number | Array<number>,
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
 *
 */
export type ADV_Axis = {
  length?: number,              // draw space length
  position?: TypeParsablePoint, // collection position
  start?: number,               // value space start at draw space start
  stop?: number,                // value space stop at draw space stop
  axis?: 'x' | 'y',
  ticks?: OBJ_AxisTicks | Array<OBJ_AxisTicks>,
  grid?: OBJ_AxisTicks | Array<OBJ_AxisTicks>,
  line?: null | ADV_Line,
  font?: OBJ_Font,              // Default font
  labels?: AxisLabels | Array<AxisLabels>,
  title?: TypeAxisTitle,
  name?: string,
  auto?: [number, number],
  show?: boolean,
};

// $FlowFixMe
class AdvancedAxis extends DiagramElementCollection {
  // Diagram elements
  _line: ?DiagramElementPrimitive;
  _majorTicks: ?DiagramElementPrimitive;
  _majorGrid: ?DiagramElementPrimitive;
  _minorTicks: ?DiagramElementPrimitive;
  _minorGrid: ?DiagramElementPrimitive;
  _labels: ?DiagramElementPrimitive;
  _arrow1: ?DiagramElementPrimitive;
  _arrow2: ?DiagramElementPrimitive;
  _title: ?DiagramElementPrimitive;

  shapes: Object;
  equation: Object;

  length: number;
  angle: number;
  start: number;
  stop: number;

  ticks: ?Array<OBJ_AxisTicks>;
  grid: ?Array<OBJ_AxisTicks>;
  labels: ?Array<OBJ_AxisLabels>;

  drawToValueRatio: number;
  valueToDraw: number;
  defaultFont: OBJ_Font;
  name: string;

  /**
   * @hideconstructor
   */
  constructor(
    shapes: Object,
    equation: Object,
    optionsIn: ADV_Axis,
  ) {
    super(new Transform('Axis')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.shapes = shapes;
    this.equation = equation;

    const defaultOptions = {
      length: 1,
      angle: 0,
      start: 0,
      color: shapes.defaultColor,
      font: shapes.defaultFont,
      name: '',
      line: {},
      grid: null,
      ticks: null,
      show: true,
      axis: 'x',
    };
    if (optionsIn.auto != null) {
      const {
        start, stop, step, precision,
      } = this.calcAuto(optionsIn.auto);
      defaultOptions.start = start;
      defaultOptions.stop = stop;
      defaultOptions.ticks = { step };
      defaultOptions.labels = { precision };
    }
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.stop == null || options.stop <= options.start) {
      options.stop = options.start + 1;
    }
    this.name = options.name;
    this.defaultFont = options.font;
    if (optionsIn.font == null || optionsIn.font.color == null) {
      this.defaultFont.color = options.color;
    }
    this.show = options.show;
    this.start = options.start;
    this.stop = options.stop;
    this.length = options.length;
    this.axis = options.axis;
    this.angle = this.axis === 'x' ? 0 : Math.PI / 2;
    this.drawToValueRatio = (options.stop - options.start) / options.length;
    this.valueToDrawRatio = 1 / this.drawToValueRatio;
    if (options.ticks != null && options.labels === undefined) {
      options.labels = {};
    }
    if (options.position != null) {
      this.transform.updateTranslation(getPoint(options.position));
    }
    if (options.transform != null) {
      this.transform = getTransform(options.transform);
    }
    this.setColor(options.color);

    if (this.show && options.grid != null && options.grid !== false) {
      this.addTicks(options.grid, 'grid');
    }
    if (this.show && options.line != null && options.line !== false) {
      this.addLine(options.line);
    }
    if (this.show && options.ticks != null && options.ticks !== false) {
      this.addTicks(options.ticks, 'ticks');
    }
    if (this.show && options.labels != null && options.labels !== false) {
      this.addLabels(options.labels);
    }
    if (this.show && options.title != null) {
      this.addTitle(options.title);
    }
  }

  addLine(optionsInOrBool: OBJ_Line | boolean) {
    let optionsIn = optionsInOrBool;
    if (optionsInOrBool === true) {
      optionsIn = {};
    }
    const defaultOptions = {
      length: this.length,
      angle: this.angle,
      width: this.shapes.defaultLineWidth,
      color: this.color,
    };
    const o = joinObjects({}, defaultOptions, optionsIn);
    const line = this.shapes.line(o);
    this.line = o;
    this.add('line', line);
  }

  addTicks(optionsInOrBool: OBJ_AxisTicks | Array<OBJ_AxisTicks> | boolean, name: 'ticks' | 'grid' = 'ticks') {
    let optionsIn = optionsInOrBool;
    if (optionsInOrBool === true) {
      optionsIn = {};
    }
    const defaultOptions = {
      start: this.start,
      stop: this.stop,
      step: (this.stop - this.start) / 5,
      width: this.line != null ? this.line.width : 0.01,
      length: this.shapes.defaultLineWidth * 10,
      angle: this.angle + Math.PI / 2,
      color: this.color,
    };
    let optionsToUse;
    if (Array.isArray(optionsIn)) {
      optionsToUse = optionsIn;
    } else {
      optionsToUse = [optionsIn];
    }
    this[name] = [];
    const elements = [];
    const lengthSign = this.axis === 'x' ? 1 : -1;
    optionsToUse.forEach((options) => {
      const o = joinObjects({}, defaultOptions, options);
      o.length *= lengthSign;
      if (o.offset == null && name === 'ticks') {
        o.offset = this.axis === 'x' ? -o.length / 2 : o.length / 2;
      } else if (o.offset == null && name === 'grid') {
        if (this.axis === 'x') {
          o.offset = -this.transform.t().y;
        } else {
          o.offset = -this.transform.t().x;
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
      }
      o.copy[0].original = false;

      if (o.p1 == null) {
        o.p1 = new Point(0, o.offset * lengthSign).rotate(this.angle);
      }

      const ticks = this.shapes.line(o);
      elements.push(ticks);
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
      font: joinObjects({}, this.defaultFont, { size: this.defaultFont.size * 1.5 }),
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
    const title = this.shapes.textLines(o);
    title.transform.updateRotation(o.rotation);
    this.add('title', title);
  }

  addLabels(optionsInOrBool: AxisLabels | Array<AxisLabels> | boolean) {
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
      if (o.values == null && this.ticks != null) {
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
        for (let i = 0; i < values.length; i += 1) {
          if (o.format === 'decimal') {
            o.text.push(`${round(values[i], o.precision).toFixed(o.precision)}`);
          } else {
            o.text.push(`${values[i].toExponential(o.precision)}`);
          }
        }
      }

      // Generate the text objects
      const text = [];
      for (let i = 0; i < values.length; i += 1) {
        let location;
        const draw = this.valueToDraw(values[i]);
        if (this.axis === 'x') {
          location = new Point(
            draw + o.offset.x,
            bounds.bottom - o.font.size * 1.5 + o.offset.y,
          ).rotate(-o.rotation);
        } else {
          location = new Point(
            bounds.left + o.offset.x - o.font.size / 1.5,
            draw + o.offset.y,
          ).rotate(-o.rotation);
        }
        if (
          o.hide == null
          || (o.hide != null && o.hide.indexOf(i) === -1)
        ) {
          text.push({
            text: o.text[i],
            location,
          });
        }
      }
      o.text = text;
      const labels = this.shapes.text(o);
      labels.transform.updateRotation(o.rotation);
      this.add(`labels${index}`, labels);
      this.labels.push(o);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  calcAuto(auto: [number, number]) {
    const [min, max] = auto;
    const r = max - min;
    let order = r >= 1 ? Math.ceil(Math.log10(r)) : Math.floor(Math.log10(r));
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
    if (order === 1) {
      precision = 1;
    } else if (order < 0) {
      precision = Math.abs(order) + 1;
    }
    return {
      start: round(newStart),
      stop: round(newEnd),
      step: round(step),
      precision: round(precision),
    };
  }

  _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'length', 'angle', 'start', 'stop',
      'ticks', 'grid', 'labels', 'drawToValueRatio', 'valueToDraw',
    ];
  }

  valueToDraw(value: number) {
    return (value - this.start) * this.valueToDrawRatio;
  }

  valuesToDraw(values: Array<number>) {
    return values.map(v => this.valueToDraw(v));
  }

  inAxis(value: number) {
    if (value < this.start || value > this.stop) {
      return false;
    }
    return true;
  }
  // isInAxis(value: number) {
  //   if (value )
  // }
}

export default AdvancedAxis;
