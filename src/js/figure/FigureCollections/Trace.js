// @flow

// import Figure from '../Figure';
import {
  Transform, Point, Line,
  getPoints,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
// import {
//   round, range,
// } from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import type CollectionsAxis, { COL_Axis } from './Axis';
import type {
  OBJ_Line, OBJ_Polygon, OBJ_Star, OBJ_LineStyleSimple, OBJ_Collection,
} from '../FigurePrimitives/FigurePrimitives';
import type { TypeColor, OBJ_Font_Fixed } from '../../tools/types';
import type { CPY_Steps } from '../geometries/copy/copy';
import type FigureCollections from './FigureCollections';

/**
 * {@link CollectionsTrace} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
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
 * @extends OBJ_Collection
 *
 * @property {Array<TypeParsablePoint>} points the x points of the trace
 * @property {COL_Axis | string} [xAxis] The x axis associated with the trace,
 * if this is a string, the trace must be part of a plot with an axis with the
 * same name. In plots, this will default to the string `'x'`.
 * @property {COL_Axis | string} [yAxis] The y axis associated with the trace,
 * if this is a string, the trace must be part of a plot with an axis with the
 * same name. In plots, this will default to the string `'y'`.
 * @property {OBJ_LineStyleSimple} [line] line style of the trace - if neither `line` nor
 * `markers` is defined, then `line` will default to a solid line. If `line`
 * is not defined, but `markers` is, then only markers will be used to represent
 * the line
 * @property {OBJ_Polygon | OBJ_Star} [markers] marker style of the trace
 * @property {TypeColor} [color] color of the trace
 * @property {string} [name] name of the trace used in plot legends
 * @property {number} [xSampleDistance] If x distance between points is less
 * than this value, then the later point will not be plotted. By default this is
 * 1/4000th the range of the x axis
 * @property {number} [ySampleDistance] If y distance between points is less
 * than this value, then the later point will not be plotted. By default this is
 * 1/4000th the range of the y axis
 *
 * @see
 * For more examples on using traces, see {@link CollectionsPlot}
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 */
export type COL_Trace = {
  points: Array<TypeParsablePoint>,
  xAxis?: COL_Axis | string,
  yAxis?: COL_Axis | string,
  x?: Array<TypeParsablePoint>,
  y?: Array<TypeParsablePoint>,
  line?: OBJ_LineStyleSimple,
  markers?: OBJ_Polygon | OBJ_Star,
  color?: TypeColor,
  name?: string,
  xSampleDistance?: number,
  ySampleDistance?: number,
} & OBJ_Collection;

/**
 * {@link FigureElementCollection} representing a trace.
 *
 * ![](./apiassets/advtrace_ex1.png)
 * ![](./apiassets/advtrace_ex2.png)
 *
 * ![](./apiassets/advtrace_ex3.png)
 * ![](./apiassets/advtrace_ex4.png)
 *
 * ![](./apiassets/advtrace_ex5.png)
 * ![](./apiassets/advtrace_ex6.png)
 *
 * This object defines a trace in an {@link CollectionsPlot}.
 *
 * The trace includes all the points of the trace, and the axes that it
 * should be drawn against and is defined using the {@link COL_PlotTrace}
 * options object.
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 * All examples below also use this power function to generate the traces:
 * ```javascript
 * const pow = (pow = 2, stop = 10, step = 0.05) => {
 *   const xValues = Fig.tools.math.range(0, stop, step);
 *   return xValues.map(x => new Fig.Point(x, x ** pow));
 * }
 * ```
 *
 * @example
 * // When plotting a single trace, just the points are required. By default
 * // the line will be solid, and it will be plotted against the 'x' and 'y' axes.
 * figure.add({
 *   name: 'plot',
 *   method: 'collections.plot',
 *   options: {
 *     trace: pow(),
 *   },
 * });
 *
 * @example
 * // Change the thickness and color of the line
 * figure.add({
 *   name: 'plot',
 *   method: 'collections.plot',
 *   options: {
 *     trace: {
 *       points: pow(),
 *       line: {
 *         width: 0.03,
 *         color: [0, 0.8, 0.4, 1],
 *       }
 *     },
 *   },
 * });
 *
 * @example
 * // Default Markers
 * figure.add({
 *   name: 'plot',
 *   method: 'collections.plot',
 *   options: {
 *     trace: {
 *       points: pow(2, 10, 1),
 *       markers: true,
 *     },
 *   },
 * });
 *
 * @example
 * // Custom Markers
 * figure.add({
 *   name: 'plot',
 *   method: 'collections.plot',
 *   options: {
 *     trace: {
 *       points: pow(2, 10, 1),
 *       markers: {
 *         radius: 0.035,
 *         sides: 20,
 *         line: { width: 0.01 },
 *       },
 *     },
 *   },
 * });
 *
 * @example
 * // Line and markers
 * figure.add({
 *   name: 'plot',
 *   method: 'collections.plot',
 *   options: {
 *     trace: {
 *       points: pow(2, 10, 1),
 *       line: { width: 0.01, dash: [0.02, 0.01] },
 *       markers: {
 *         radius: 0.035,
 *         sides: 20,
 *       },
 *     },
 *   },
 * });
 *
 * @example
 * // Use names in trace definitions to customize legend
 * figure.add({
 *   name: 'plot',
 *   method: 'collections.plot',
 *   options: {
 *     trace: [
 *       pow(2),
 *       { points: pow(2.5), name: 'Power 2.5' },
 *       {
 *         points: pow(3, 10, 1),
 *         name: 'Power 3',
 *         markers: { radius: 0.03 },
 *         line: { width: 0.01 },
 *       },
 *     ],
 *     legend: true,
 *   },
 * });
 */
// $FlowFixMe
class CollectionsTrace extends FigureElementCollection {
  // Figure elements
  _line: ?FigureElementPrimitive;

  points: Array<Point>;
  drawPoints: Array<Point>;
  polylines: Array<Array<Point>>;

  xAxis: CollectionsAxis;
  yAxis: CollectionsAxis;

  line: OBJ_Line;
  defaultFont: OBJ_Font_Fixed;
  xSampleDistance: number;
  ySampleDistance: number;
  markers: (OBJ_Polygon | OBJ_Star) & { copy: CPY_Steps };

  name: string;

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: COL_Trace,
  ) {
    const defaultOptions = {
      color: collections.primitives.defaultColor,
      font: {
        family: 'Times New Roman',
        size: 0.1,
        style: 'normal',
        weight: 'normal',
        color: collections.primitives.defaultColor,
        opacity: 1,
      },
      name: '',
      transform: new Transform('Trace').scale(1, 1).rotate(0).translate(0, 0),
      limits: collections.primitives.limits,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.markers == null && options.line === undefined) {
      options.line = {};
    }
    super(options);
    this.collections = collections;
    this.defaultFont = options.font;
    this.points = getPoints(options.points);
    this.xAxis = options.xAxis;
    this.yAxis = options.yAxis;
    this.name = options.name;
    this.setColor(options.color);
    if (options.xSampleDistance == null) {
      options.xSampleDistance = (this.xAxis.stopValue - this.xAxis.startValue) / 4000;
    }
    if (options.ySampleDistance == null) {
      options.ySampleDistance = (this.yAxis.stopValue - this.yAxis.startValue) / 4000;
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

  /**
   * Update the trace with a new set of points.
   * @param {Array<TypeParsablePoint>} points
   */
  update(points: Array<TypeParsablePoint>) {
    this.removeLine();
    this.removeMarkers();
    this.points = getPoints(points);
    if (this.line != null) {
      this.addLine(this.line);
    }
    if (this.markers != null) {
      this.markers.copy = [];
      this.addMarkers(this.markers);
    }
    // if (this._line != null) {
    //   this._line.updatePoints({ points: this.points });
    // }
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

  addLine(options: OBJ_LineStyleSimple) {
    const defaultOptions = {
      color: this.color,
      width: this.collections.primitives.defaultLineWidth,
    };
    this.updatePoints();
    this.line = joinObjects({}, defaultOptions, options);
    this.polylines.forEach((points, index) => {
      const line = this.collections.primitives.polyline(joinObjects({}, this.line, { points }));
      this.add(`line${index}`, line);
    });
  }

  removeLine() {
    const lines = this.drawOrder.filter(e => e.startsWith('line'));
    lines.forEach((elementName) => {
      this.remove(elementName);
    });
  }

  removeMarkers() {
    // const index = this.drawOrder.indexOf('markers');
    // if (index !== -1) {
    //   this.remove('markers');
    // }
    const markers = this.drawOrder.filter(e => e.startsWith('markers'));
    markers.forEach((elementName) => {
      this.remove(elementName);
    });
  }

  addMarkers(options: OBJ_Polygon | OBJ_Star) {
    const defaultOptions = {
      radius: 0.02,
      color: this.color,
    };
    const markers = this.points.filter(p => this.inAxes(p));
    const o = joinObjects({}, defaultOptions, options);
    this.markers = o;
    if (markers.length === 0) {
      return;
    }
    if (o.copy == null) {
      o.copy = [];
    } else if (Array.isArray(o.copy) === false) {
      o.copy = [o.copy];
    }
    o.copy.push({
      to: markers.map(p => this.pointToDraw(p)),
      original: false,
    });
    this.add('markers', this.collections.primitives.polygon(o));
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

export default CollectionsTrace;
