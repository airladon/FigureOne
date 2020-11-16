// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point, Line,
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
  color: Array<number>
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

  pointToDraw(p: Point) {
    return new Point(this.xAxis.valueToDraw(p.x), this.yAxis.valueToDraw(p.y));
  }

  intersect(p1: Point, p2: Point) {
    if (p1.x < 0 && p2.x < 0) {
      return { result: false };
    }
    if (p1.y < 0 && p2.y < 0) {
      return { result: false };
    }
    if (p1.x > this.xAxis.length && p2.x > this.xAxis.length) {
      return { result: false };
    }
    if (p1.y > this.yAxis.length && p2.y > this.yAxis.length) {
      return { result: false };
    }
    const line = new Line(p1, p2);
    const left = new Line([0, 0], [0, this.yAxis.length]);
    let i = line.intersectsWith(left);
    let result = false;
    const intersect = [];
    if (i.withinLine) {
      // return { result: true, intersect: i.intersect };
      result = true;
      intersect.push(i.intersect)
    }
    const right = new Line([this.xAxis.length, 0], [this.xAxis.length, this.yAxis.length]);
    i = line.intersectsWith(right);
    if (i.withinLine) {
      result = true;
      intersect.push(i.intersect)
      // return { result: true, intersect: i.intersect };
    }
    const bottom = new Line([0, 0], [this.xAxis.length, 0]);
    i = line.intersectsWith(bottom);
    if (i.withinLine) {
      result = true;
      intersect.push(i.intersect)
      // return { result: true, intersect: i.intersect };
    }
    const top = new Line([0, this.yAxis.length], [this.xAxis.length, this.yAxis.length]);
    i = line.intersectsWith(top);
    if (i.withinLine) {
      result = true;
      intersect.push(i.intersect)
      // return { result: true, intersect: i.intersect };
    }
    return { result, intersect };
  }

  updatePoints() {
    this.drawPoints = [];
    const drawPoints = this.points.map(p => this.pointToDraw(p));
    const inX = this.points.map(p => this.xAxis.inAxis(p.x));
    const inY = this.points.map(p => this.yAxis.inAxis(p.y));

    let inLine = false;
    let polyline = [];
    for (let i = 0; i < drawPoints.length; i += 1) {
      if (inX[i] && inY[i]) {
        inLine = true;
        polyline.push(drawPoints[i]);
      }
      // This point is the last point
      if (inLine && i === drawPoints.length - 1) {
        this.drawPoints.push(polyline);
        polyline = [];
      // Next point is within axes
      } else if (inLine && inX[i + 1] && inY[i + 1]) {
        this.drawPoints.push(polyline);
      // Next point leaving the axes
      } else if (inLine && (inX[i + 1] === false || inY[i + 1] === false)) {
        const intersect = this.intersect(drawPoints[i], drawPoints[i + 1]);
        if (intersect.result) {
          polyline.push(...intersect.intersect);
        }
        this.drawPoints.push(polyline);
        polyline = [];
        inLine = false;
      // This point is out of axes, and next point is in axes
      } else if (inLine === false && inX[i + 1] && inY[i + 1]) {
        const intersect = this.intersect(drawPoints[i], drawPoints[i + 1]);
        if (intersect.result) {
          polyline.push(...intersect.intersect);
        }
      // This point is out of axes, and next point is out of axes, but
      // the line between points may cross over into the axes
      } else if (inLine === false && i < drawPoints.length - 1) {
        const intersect = this.intersect(drawPoints[i], drawPoints[i + 1]);
        if (intersect.result) {
          this.drawPoints.push(intersect.intersect.map(p => p._dup()));
        }
      }
    }
  }

  addLine(options: OBJ_PolyLine) {
    const defaultOptions = {
      color: this.color,
      width: 0.01,
    };
    this.line = joinObjects({}, defaultOptions, options);
    this.drawPoints.forEach((points, index) => {
      const line = this.shapes.polyline(joinObjects({}, this.line, { points }));
      this.add(`${line}${index}`, line);
    });
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
