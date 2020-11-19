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

/**
 * {@link AdvancedTrace} options object.
 *
 * A plot trace is a set of (x, y) points associated with an
 * x and y axis.
 *
 * The trace and can be drawn with either a set of
 * `markers` at each point, or a `line` between each pair of adjacent points.
 *
 * The axes are used to plot the trace - the trace
 * can only appear within the bounds of the axes, and the axes
 * provide the mapping from axis value to draw space so the trace
 * can be drawn. Points that lie outside the axis will not be draw,
 * and lines between pairs of points where one is outside will be interpolated.
 *
 * While FigureOne isn't designed to process very large numbers of points,
 * some steps can be taken to improve performance when large numbers of points
 * are being used (tens of thousands or more):
 * - Turn off corner interpolation between line segments in `line`:
 *   `{ line: { corner: 'none` } }`
 * - Use `xSampleDistance` and `ySampleDistance` to not draw points that are
 *   too close to each other
 * - If using markers, use polygons with smaller numbers of sides, and use fills
 *   instead of outlines
 *
 * Even using these methods, it can take up to a second to render a trace with
 * hundreds of thousands of points (depending on the client device).
 *
 * @see
 * For examples on using traces, see {@link AdvancedPlot}
 *
 * @property {Array<TypeParsablePoint>} [points] the x points of the trace
 * @property {ADV_Axis} [xAxis] The x axis associated with the trace
 * @property {ADV_Axis} [yAxis]
 * @property {OBJ_Line} [line]
 * @property {OBJ_Polygon | OBJ_Start} [markers]
 * @property {Array<number>} [color]
 * @property {string} [name]
 * @property {number} [xSampleDistance]
 * @property {number} [ySampleDistance]
 */
export type ADV_Trace = {
  xAxis?: ADV_Axis,
  yAxis?: ADV_Axis,
  x?: Array<TypeParsablePoint>,
  y?: Array<TypeParsablePoint>,
  line?: OBJ_Line,
  markers?: OBJ_Polygon | OBJ_Start,
  color?: Array<number>,
  name?: string,
  xSampleDistance?: number,
  ySampleDistance?: number,
};

// $FlowFixMe
class AdvancedTrace extends DiagramElementCollection {
  // Diagram elements
  _line: ?DiagramElementPrimitive;
  shapes: Object;
  equation: Object;

  points: Array<Point>;
  drawPoints: Array<Point>;
  polylines: Array<Array<Point>>;

  xAxis: AdvancedAxis;
  yAxis: AdvancedAxis;

  line: OBJ_Line;

  name: string;

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
      name: '',
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    // if (options.stop == null) {
    //   options.stop = options.start + 1;
    // }
    if (options.markers == null && options.line === undefined) {
      options.line = {};
    }
    this.defaultFont = options.font;
    this.points = getPoints(options.points);
    this.xAxis = options.xAxis;
    this.yAxis = options.yAxis;
    this.name = options.name;
    this.setColor(options.color);
    if (options.xSampleDistance == null) {
      options.xSampleDistance = (this.xAxis.stop - this.xAxis.start) / 4000;
    }
    if (options.ySampleDistance == null) {
      options.ySampleDistance = (this.yAxis.stop - this.yAxis.start) / 4000;
    }
    this.xSampleDistance = options.xSampleDistance;
    this.ySampleDistance = options.ySampleDistance;

    if (options.line != null) {
      this.addLine(options.line);
    }
    if (options.markers != null) {
      this.addMarkers(options.markers);
    }
  }

  pointToDraw(p: Point) {
    return new Point(this.xAxis.valueToDraw(p.x), this.yAxis.valueToDraw(p.y));
  }

  inAxes(p: Point) {
    if (this.xAxis.inAxis(p.x) && this.yAxis.inAxis(p.y)) {
      return true;
    }
    return false;
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
    let result = false;
    const intersect = [];
    const bounds = [
      new Line([0, 0], [0, this.yAxis.length]),
      new Line([this.xAxis.length, 0], [this.xAxis.length, this.yAxis.length]),
      new Line([0, 0], [this.xAxis.length, 0]),
      new Line([0, this.yAxis.length], [this.xAxis.length, this.yAxis.length]),
    ];
    bounds.forEach((bound) => {
      const i = line.intersectsWith(bound);
      if (i.withinLine) {
        result = true;
        intersect.push(i.intersect);
      }
    });
    return { result, intersect };
  }

  updatePoints() {
    this.polylines = [];
    this.drawPoints = this.points.map(p => this.pointToDraw(p));
    this.drawPoints = [];
    let sampling = false;
    if (this.xSampleDistance != null && this.ySampleDistance != null) {
      sampling = true;
    }
    let lastPoint;
    const drawIndexes = [];
    for (let i = 0; i < this.points.length; i += 1) {
      if (sampling && lastPoint != null) {
        if (
          Math.abs(this.points[i].x - lastPoint.x) >= this.xSampleDistance
          || Math.abs(this.points[i].y - lastPoint.y) >= this.ySampleDistance
        ) {
          this.drawPoints.push(this.pointToDraw(this.points[i]));
          lastPoint = this.points[i];
          drawIndexes.push(i);
        }
      } else {
        this.drawPoints.push(this.pointToDraw(this.points[i]));
        lastPoint = this.points[i];
        drawIndexes.push(i);
      }
    }
    const inX = [];
    const inY = [];
    for (let i = 0; i < drawIndexes.length; i += 1) {
      inX.push(this.xAxis.inAxis(this.points[drawIndexes[i]].x));
      inY.push(this.yAxis.inAxis(this.points[drawIndexes[i]].y));
    }

    let inLine = false;
    let polyline = [];
    for (let i = 0; i < this.drawPoints.length; i += 1) {
      if (inX[i] && inY[i]) {
        inLine = true;
        polyline.push(this.drawPoints[i]);
      }
      // This point is the last point
      if (inLine && i === this.drawPoints.length - 1) {
        this.polylines.push(polyline);
        polyline = [];
      // Next point is within axes
      } else if (inLine && inX[i + 1] && inY[i + 1]) {
        // this.polylines.push(polyline);
        // polyline
      // Next point leaving the axes
      } else if (inLine && (inX[i + 1] === false || inY[i + 1] === false)) {
        const intersect = this.intersect(this.drawPoints[i], this.drawPoints[i + 1]);
        if (intersect.result) {
          polyline.push(...intersect.intersect);
        }
        this.polylines.push(polyline);
        polyline = [];
        inLine = false;
      // This point is out of axes, and next point is in axes
      } else if (inLine === false && inX[i + 1] && inY[i + 1]) {
        const intersect = this.intersect(this.drawPoints[i], this.drawPoints[i + 1]);
        if (intersect.result) {
          polyline.push(...intersect.intersect);
        }
      // This point is out of axes, and next point is out of axes, but
      // the line between points may cross over into the axes
      } else if (inLine === false && i < this.drawPoints.length - 1) {
        const intersect = this.intersect(this.drawPoints[i], this.drawPoints[i + 1]);
        if (intersect.result) {
          this.polylines.push(intersect.intersect.map(p => p._dup()));
        }
      }
    }
  }

  addLine(options: OBJ_PolyLine) {
    const defaultOptions = {
      color: this.color,
      width: this.shapes.defaultLineWidth,
    };
    this.updatePoints();
    this.line = joinObjects({}, defaultOptions, options);
    this.polylines.forEach((points, index) => {
      const line = this.shapes.polyline(joinObjects({}, this.line, { points }));
      this.add(`${line}${index}`, line);
    });
  }

  addMarkers(options: OBJ_Polygon) {
    const defaultOptions = {
      radius: 0.02,
    };
    const markers = this.points.filter(p => this.inAxes(p));
    if (markers.length === 0) {
      return;
    }
    const o = joinObjects({}, defaultOptions, options);
    this.markers = o;
    if (o.copy == null) {
      o.copy = [];
    } else if (Array.isArray(o.copy) === false) {
      o.copy = [o.copy];
    }
    o.copy.push({
      to: markers.map(p => this.pointToDraw(p)),
      original: false,
    });
    this.add('markers', this.shapes.polygon(o));
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
