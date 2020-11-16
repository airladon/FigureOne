// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point,
  getPoint, getTransform,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';
import type { ADV_Axis } from './Axis';

export type OBJ_Ticks = {
  start: number;
  step: number;
  stop: number;
  length: number;
  descent: number;
};

export type ADV_Plot = {
  length?: number,              // draw space length
  width?: number,
  position?: TypeParsablePoint, // collection position
  axes?: Array<ADV_Axis>,
  title?: OBJ_Text,
  traces?: Array<ADV_Trace>,
};

// $FlowFixMe
class AdvancedPlot extends DiagramElementCollection {
  // Diagram elements
  _axis: ?AdvancedAxis;
  _majorTicks: ?DiagramElementPrimitive;
  _minorTicks: ?DiagramElementPrimitive;
  _labels: ?DiagramElementPrimitive;
  _arrow1: ?DiagramElementPrimitive;
  _arrow2: ?DiagramElementPrimitive;

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

  /**
   * @hideconstructor
   */
  constructor(
    shapes: Object,
    equation: Object,
    optionsIn: {
      length: number,
      axis: 'x' | 'y',
      line: OBJ_Line,
      start: number,
      stop: number,
      ticks: {
        start: number,
        step: number,
        stop: number,
        line: OBJ_Line,
      },
      minorTicks: {
        start: number,
        step: number,
        stop: number,
        line: OBJ_Line,
      },
      labels: {
        text: null | Array<string>,
        precision: number,
      } & OBJ_Text,
    },
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
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.stop == null) {
      options.stop = options.start + 1;
    }
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
      this.addTicks(options.ticks);
    }
    if (options.minorTicks != null) {
      this.addTicks(options.minorTicks, false);
    }
    if (options.labels != null) {
      this.addLabels(options.labels);
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

  addTicks(options: Object, major: boolean = true) {
    const defaultOptions = {
      start: this.start,
      stop: this.stop,
      step: (this.stop - this.start) / 5,
      width: this.line != null ? this.line.width : 0.01,
      length: 0.1,
      angle: this.angle + Math.PI / 2,
    };
    const o = joinObjects({}, defaultOptions, options);
    if (o.descent == null) {
      o.descent = o.length / 2;
    }
    o.start *= this.valueToDraw;
    o.stop *= this.valueToDraw;
    o.step *= this.valueToDraw;
    const num = Math.floor((o.stop + o.step / 10000 - o.start) / o.step);
    o.num = num;
    o.copy = [{ along: this.angle, step: o.step, num }];
    if (o.p1 == null) {
      o.p1 = new Point(o.start, -o.descent).rotate(this.angle);
    }
    const ticks = this.shapes.line(o);
    if (major) {
      this.ticks = o;
      this.add('ticks', ticks);
    } else {
      this.minorTicks = o;
      this.add('minorTicks', ticks);
    }
  }

  addLabels(options: Object) {
    const defaultOptions = {
      text: null,
      precision: 1,
      values: null,
      format: 'decimal',  // or 'exponent'
      font: {
        family: 'Times New Roman',
        size: 0.1,
        style: 'normal',
        weight: 'normal',
        color: this.color,
        opacity: 1,
      },
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
        offset += this.ticks.p1.y;
      }
      o.offset = this.axis === 'x' ? new Point(0, offset) : new Point(offset, 0);
    } else {
      o.offset = getPoint(o.offset);
    }

    // Values where to put the labels - null is auto which is same as ticks
    let values;
    if (o.values == null) {
      values = [];
      const { start, step, num } = this.ticks;
      for (let i = 0; i < num + 1; i += 1) {
        values.push((start + i * step) * this.drawToValue);
      }
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
