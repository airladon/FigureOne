// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point,
  getPoint, getPoints,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
import {
  round, range,
} from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';

export type ADV_Trace = {
  xAxis?: ADV_Axis,
  yAxis?: ADV_Axis,
  x?: Array<TypeParsablePoint>,
  y?: Array<TypeParsablePoint>,
  line: OBJ_Line,
};

// $FlowFixMe
class AdvancedTrace extends DiagramElementCollection {
  // Diagram elements
  _line: ?DiagramElementPrimitive;
  shapes: Object;
  equation: Object;

  points: Array<Point>;
  drawPoints: Array<Point>;
  // x: Array<number>;
  // y: Array<number>;
  // xDraw: Array<Point>;
  // yDraw: Array<Point>;
  xAxis: AdvancedAxis;
  yAxis: AdvancedAxis;

  line: OBJ_Line;

  defaultFont: OBJ_Font;

  /**
   * @hideconstructor
   */
  constructor(
    shapes: Object,
    equation: Object,
    optionsIn: ADV_Trace,
  ) {
    super(new Transform('Axis')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.shapes = shapes;
    this.equation = equation;

    const defaultOptions = {
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
    this.points = getPoints(options.points);
    this.xAxis = options.xAxis;
    this.yAxis = options.yAxis;
    this.updatePoints();

    this.setColor(options.color);


    if (options.line != null) {
      this.addLine(options.line);
    }
    // if (options.labels != null) {
    //   this.addLabels(options.labels);
    // }
    // if (options.title != null) {
    //   this.addTitle(options.title);
    // }
  }

  updatePoints() {
    this.drawPoints = [];
    for (let i = 0; i < this.points.length; i += 1) {
      const p = this.points[i];
      const inX = this.xAxis.inAxis(p.x);
      const inY = this.yAxis.inAxis(p.y);
      if (inX && inY) {
        this.drawPoints.push(new Point(
          this.xAxis.valueToDraw(p.x),
          this.xAxis.valueToDraw(p.y),
        ));
      }
    }
  }

  addLine(options: OBJ_PolyLine) {
    const defaultOptions = {
      // length: this.length,
      // angle: this.angle,
      // points: this.drawPoints,
      width: 0.01,
    };
    const o = joinObjects({}, defaultOptions, options, { points: this.drawPoints });
    const line = this.shapes.polyline(o);
    this.line = o;
    this.add('line', line);
  }

  _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      // 'angle',
      // 'lastLabelRotationOffset',
    ];
  }

  // _fromState(state: Object) {
  //   joinObjects(this, state);
  //   this.setAngle({
  //     angle: this.angle,
  //     rotationOffset: this.lastLabelRotationOffset,
  //   });
  //   return this;
  // }
}

export default AdvancedTrace;
