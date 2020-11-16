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
import { joinObjects, joinObjectsWithOptions } from '../../tools/tools';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';


export type OBJ_Ticks = {
  start?: number,
  step?: number,
  stop?: number,
  values?: Array<number>,
  length?: number,
  overhang?: number,
  grid?: {
    overhang?: number,
    length?: number,
  } & OBJ_Line,
} & OBJ_Line;

export type ADV_Axis = {
  length?: number,              // draw space length
  position?: TypeParsablePoint, // collection position
  start?: number,               // value space start at draw space start
  stop?: number,                // value space stop at draw space stop
  axis?: 'x' | 'y',
  ticks?: OBJ_Ticks | Array<OBJ_Ticks>,
  grid?: OBJ_Ticks | Array<OBJ_Ticks>,
  // minorTicks?: OBJ_Ticks,
  line?: ADV_Line,
  font?: OBJ_Font,              // Default font
  labels?: {
    font?: OBJ_Font,
    precision?: number,
    rotation?: number,
    xAlign?: 'left' | 'right' | 'center',
    yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
    offset?: TypeParsablePoint,
    text?: null | Array<string>,
    values?: null | Array<number>,
  },
  title?: OBJ_TextLines,
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

  ticks: {
    start: number;
    step: number;
    stop: number;
  };

  minorTicks: {
    start: number;
    step: number;
    stop: number;
  }

  drawToValue: number;
  valueToDraw: number;
  defaultFont: OBJ_Font;

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
      font: {
        family: 'Times New Roman',
        size: 0.1,
        style: 'normal',
        weight: 'normal',
        color: shapes.defaultColor,
        opacity: 1,
      },
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.stop == null) {
      options.stop = options.start + 1;
    }
    this.defaultFont = options.font;
    this.start = options.start;
    this.stop = options.stop;
    this.length = options.length;
    this.axis = options.axis;
    this.angle = this.axis === 'x' ? 0 : Math.PI / 2;
    this.drawToValue = (options.stop - options.start) / options.length;
    this.valueToDraw = 1 / this.drawToValue;
    if (options.position != null) {
      this.transform.updateTranslation(getPoint(options.position));
    }
    if (options.transform != null) {
      this.transform = getTransform(options.transform);
    }

    this.setColor(options.color);


    if (options.line != null) {
      this.addLine(options.line);
    }
    if (options.ticks != null) {
      this.addTicks(options.ticks, 'ticks');
    }
    if (options.grid != null) {
      this.addTicks(options.grid, 'grid');
    }
    if (options.labels != null) {
      this.addLabels(options.labels);
    }
    if (options.title != null) {
      this.addTitle(options.title);
    }
  }

  addLine(options: OBJ_Line) {
    const defaultOptions = {
      length: this.length,
      angle: this.angle,
      width: 0.01,
    };
    const o = joinObjects({}, defaultOptions, options);
    const line = this.shapes.line(o);
    this.line = o;
    this.add('line', line);
  }

  addTicks(optionsIn: OBJ_Ticks | Array<OBJ_Ticks>, name: 'ticks' | 'grid' = 'ticks') {
    const defaultOptions = {
      start: this.start,
      stop: this.stop,
      step: (this.stop - this.start) / 5,
      width: this.line != null ? this.line.width : 0.01,
      length: 0.1,
      angle: this.angle + Math.PI / 2,
    };
    let optionsToUse;
    if (Array.isArray(optionsIn)) {
      optionsToUse = optionsIn;
    } else {
      optionsToUse = [optionsIn];
    }
    this[name] = [];
    optionsToUse.forEach((options, index) => {
      const o = joinObjects({}, defaultOptions, options);
      if (o.overhang == null) {
        o.overhang = name === 'ticks' ? o.length / 2 : 0;
      }
      const num = Math.floor((o.stop + o.step / 10000 - o.start) / o.step);
      o.num = num;
      if (o.values == null) {
        o.values = range(o.start, o.stop, o.step);
      }
      if (this.axis === 'x') {
        o.copy = [{ to: o.values.map(v => new Point(v * this.valueToDraw, 0)) }];
      } else {
        o.copy = [{ to: o.values.map(v => new Point(0, v * this.valueToDraw)) }];
      }

      if (o.p1 == null) {
        o.p1 = new Point(o.values[0], -o.overhang).rotate(this.angle);
      }

      const ticks = this.shapes.line(o);
      this.add(`${name}${index}`, ticks);
      this[name].push(o);
    });
  }

  addTitle(options: OBJ_Text & { rotation: number, offset: TypeParsablePoint }) {
    const defaultOptions = {
      font: joinObjects({}, this.defaultFont, { size: this.defaultFont.size * 2 }),
      justify: 'center',
      xAlign: 'center',
      yAlign: this.axis === 'x' ? 'top' : 'bottom',
      rotation: this.axis === 'x' ? 0 : Math.PI / 2,
      offset: [0, 0],
    };
    const o = joinObjects({}, defaultOptions, options);
    o.offset = getPoint(o.offset);
    if (o.position == null) {
      if (this.axis === 'x') {
        o.position = new Point(this.length / 2, -0.3).add(o.offset);
      } else {
        o.position = new Point(-0.3, this.length / 2).add(o.offset);
      }
    }
    const title = this.shapes.textLines(o);
    title.transform.updateRotation(o.rotation);
    this.add('title', title);
  }

  addLabels(options: Object) {
    const defaultOptions = {
      text: null,
      precision: 1,
      values: null,
      format: 'decimal',  // or 'exponent'
      font: this.defaultFont,
      xAlign: this.axis === 'x' ? 'center' : 'right',
      yAlign: this.axis === 'x' ? 'baseline' : 'middle',
      rotation: 0,
      // offset: this.axis === 'x' ? [0, -0.15] : [-0.15, 0],
    };
    const o = joinObjects({}, defaultOptions, options);

    // Calculate auto offset
    if (o.offset == null) {
      let offset = -o.font.size - 0.05;
      if (this.ticks != null) {
        offset += this.ticks[0].p1.y;
      }
      o.offset = this.axis === 'x' ? new Point(0, offset) : new Point(offset, 0);
    } else {
      o.offset = getPoint(o.offset);
    }

    // Values where to put the labels - null is auto which is same as ticks
    let values;
    if (o.values == null && this.ticks != null) {
      // values = [];
      // const { start, step, num } = this.ticks[0];
      // for (let i = 0; i < num + 1; i += 1) {
      //   values.push((start + i * step) * this.drawToValue);
      // }
      values = this.ticks[0].values;
    } else {
      values = o.values;
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
      const draw = values[i] * this.valueToDraw;
      if (this.axis === 'x') {
        location = new Point(draw + o.offset.x, o.offset.y).rotate(-o.rotation);
        // location = new Point(draw, 0).rotate(-o.rotation).add(o.offset);
      } else {
        location = new Point(o.offset.x, draw + o.offset.y).rotate(-o.rotation);
      }
      text.push({
        text: o.text[i],
        location,
      });
    }
    o.text = text;
    const labels = this.shapes.text(o);
    labels.transform.updateRotation(o.rotation);
    this.add('labels', labels);
    this.labels = o;
  }

  _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'angle',
      'lastLabelRotationOffset',
    ];
  }

  _fromState(state: Object) {
    joinObjects(this, state);
    this.setAngle({
      angle: this.angle,
      rotationOffset: this.lastLabelRotationOffset,
    });
    return this;
  }
}

export default AdvancedAxis;
