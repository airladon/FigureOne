// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point,
  getPoint, getTransform, parsePoint,
  comparePoints, Rect,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  DiagramElementCollection,
} from '../Element';
import type { ADV_Axis } from './Axis';
import type { ADV_Trace } from './Trace';
import type { ADV_PlotLegend } from './Legend';

/**
 * Plot frame.
 *
 * {@link ADV_Rectangle}` & { space: number }`
 *
 * Define how much larger the frame is than the plot, labels and
 * titles with `space`.
 */
export type TypePlotFrame = ADV_Rectangle & { space: number };

/**
 * Plot title.
 *
 * {@link OBJ_TextLines}` & { offset: `{@link TypeParsablePoint}` }`
 *
 * Use `offset` to adjust the location of the title.
 */
export type TypePlotTitle = OBJ_TextLines & { offset: TypeParsablePoint };

/**
 * {@link AdvancedPlot} options object.
 *
 * A plot is a collection of axes and traces, and may include a title, legend
 * and bounding frame.
 *
 * Use `width`, `height` and `position` to define the size of the plot area
 * (area where the traces are drawn) and where it is in the diagram.
 *
 * @property {number} [width] width of the plot area
 * @property {number} [height] height of the plot area
 * @property {ADV_Axis | boolean} [xAxis] customize the x axis, or use `false`
 * to hide it
 * @property {ADV_Axis | boolean} [yAxis] customize the y axis, or use `false`
 * to hide it
 * @property {Array<ADV_Axis>} [axes] add additional axes
 * @property {boolean} [grid] turn on and off the grid - use the grid options
 * in xAxis, yAxis or axes for finer customization
 * @property {TypePlotTitle | string} [title] plot title can be simply a
 * `string` or fully customized with TypePlotTitle
 * @property {Array<ADV_Trace | TypeParsablePoint> | ADV_Trace | Array<TypeParsablePoint>} [trace]
 *  Use array if plotting more than one trace. Use ADV_Trace to customize the
 *  trace.
 * @property {ADV_PlotLegend | boolean} [legend] `true` to turn the legend on,
 * or use ADV_PlotLegend to customize it's location and layout
 * @property {boolean | Array<number> | TypePlotFrame} [frame] frame around the
 * plot can be turned on with `true`, can be a simple color fill using
 * `Array<number>` as a color, or can be fully customized with TypePlotFrame
 * @property {Array<number> | ADV_Rectangle} [plotArea] plot area can be a
 * color fill with `Array<number`> as a color, or be fully customized with
 * ADV_Rectangle
 * @property {OBJ_Font} [font] Default font for plot (title, axes, labels, etc.)
 * @property {TypeParsablePoint} [position] Position of the plot
 */
export type ADV_Plot = {
  width?: number,
  height?: number,
  xAxis?: ADV_Axis | boolean,
  yAxis?: ADV_Axis | boolean,
  axes?: Array<ADV_Axis>,
  grid?: boolean,
  title?: string | TypePlotTitle,
  trace?: Array<ADV_Trace | TypeParsablePoint> | ADV_Trace | Array<TypeParsablePoint>,
  legend?: ADV_PlotLegend,
  frame?: boolean | Array<number> | TypePlotFrame,
  plotArea?: Array<number> | ADV_Rectangle,
  font?: OBJ_Font,
  position?: TypeParsablePoint,
};

function cleanTraces(
  tracesIn: Array<ADV_Trace | Array<TypeParsablePoint>> | ADV_Trace | Array<TypeParsablePoint>,
) {
  let traces = [];
  if (!Array.isArray(tracesIn)) {
    traces = [tracesIn];
  } else if (tracesIn.length === 0) {
    traces = [];
  } else if (parsePoint(tracesIn[0]) instanceof Point) {
    traces = [{ points: tracesIn }];
  } else {
    tracesIn.forEach((trace) => {
      if (!Array.isArray(trace)) {
        traces.push(trace);
      } else {
        traces.push({ points: trace });
      }
    });
  }

  let firstPoint = true;
  let result = { min: new Point(0, 0), max: new Point(0, 0) };
  traces.forEach((trace) => {
    for (let i = 0; i < trace.points.length; i += 1) {
      const p = getPoint(trace.points[i]);
      // eslint-disable-next-line no-param-reassign
      // trace.points[i] = p;
      result = comparePoints(p, result.min, result.max, firstPoint);
      firstPoint = false;
    }
  });
  const bounds = new Rect(
    result.min.x,
    result.min.y,
    result.max.x - result.min.x,
    result.max.y - result.min.y,
  );
  return [traces, bounds];
}

/*
.............########..##........#######..########
.............##.....##.##.......##.....##....##...
.............##.....##.##.......##.....##....##...
.............########..##.......##.....##....##...
.............##........##.......##.....##....##...
.............##........##.......##.....##....##...
.............##........########..#######.....##...
*/

/**
 * {@link DiagramElementCollection} representing a plot including axes, traces,
 * labels and titles.
 *
 * ![](./assets1/advplot_ex1.png)
 * ![](./assets1/advplot_ex2.png)
 *
 * ![](./assets1/advplot_ex3.png)
 * ![](./assets1/advplot_ex4.png)
 *
 * ![](./assets1/advplot_ex5.png)
 * ![](./assets1/advplot_ex6.png)
 *
 * This object provides convient and customizable plot functionality.
 *
 * At its simplist, just the points of the trace to be plotted need to be
 * passed in to get a plot with automatically generated axes, tick marks,
 * labels and grid lines.
 *
 * Additional options can be used to finely customize each of these, as well
 * as add and customize plot and axis titles, a legend, and a frame around the
 * entire plot.
 *
 * @see
 * See {@link ADV_Axis}, {@link OBJ_AxisLabels}, {@link OBJ_AxisTicks},
 * {@link ADV_Trace} and {@link ADV_Legend} for more examples of customizing
 * specific parts of the plot.
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
 * @example
 * // Plot of single trace with auto axis scaling
 * diagram.addElement({
 *   name: 'plot',
 *   method: 'advanced.plot',
 *   options: {
 *     trace: pow(),
 *   },
 * });
 *
 * @example
 * // Multiple traces with a legend
 * // Some traces are customized beyond the defaul color to include dashes and
 * // markers
 * diagram.addElement({
 *   name: 'plot',
 *   method: 'advanced.plot',
 *   options: {
 *     width: 2,                                    // Plot width in diagram
 *     height: 2,                                   // Plot height in diagram
 *     yAxis: { start: 0, stop: 100 },              // Customize y axis limits
 *     trace: [
 *       { points: pow(1.5), name: 'Power 1.5' },   // Trace names are for legend
 *       {                                          // Trace with only markers
 *         points: pow(2, 10, 0.5),
 *         name: 'Power 2',
 *         markers: { sides: 4, radius: 0.03 },
 *       },
 *       {                                          // Trace with markers and
 *         points: pow(3, 10, 0.5),                 // dashed line
 *         name: 'Power 3',
 *         markers: { radius: 0.03, sides: 10, line: { width: 0.005 } },
 *         line: { dash: [0.04, 0.01] },
 *       },
 *     ],
 *     legend: true,
 *   },
 * });
 *
 * @example
 * // Multiple grids and simple titles
 * diagram.addElement({
 *   name: 'plot',
 *   method: 'advanced.plot',
 *   options: {
 *     width: 2,
 *     height: 2,
 *     yAxis: {
 *       start: 0,
 *       stop: 100,
 *       grid: [
 *         { step: 20, width: 0.005, dash: [], color: [0.7, 0.7, 1, 1] },
 *         { step: 5, width: 0.005, dash: [0.01, 0.01], color: [1, 0.7, 0.7, 1] },
 *       ],
 *       title: 'velocity (m/s)',
 *     },
 *     xAxis: {
 *       grid: [
 *         { step: 2, width: 0.005, dash: [], color: [0.7, 0.7, 1, 1] },
 *         { step: 0.5, width: 0.005, dash: [0.01, 0.01], color: [1, 0.7, 0.7, 1] } * ,
 *       ],
 *       title: 'time (s)',
 *     },
 *     trace: pow(3),
 *     title: 'Velocity over Time'
 *   },
 * });
 *
 * @example
 * // Hide axes
 * // Use plot frame and plot area
 * // Title has a subtitle
 * diagram.addElement({
 *   name: 'plot',
 *   method: 'advanced.plot',
 *   options: {
 *     width: 2,
 *     height: 2,
 *     trace: pow(3),
 *     xAxis: { show: false },
 *     yAxis: { show: false },
 *     plotArea: [0.93, 0.93, 0.93, 1],
 *     frame: {
 *       line: { width: 0.005, color: [0.5, 0.5, 0.5, 1] },
 *       corner: { radius: 0.1, sides: 10 },
 *       space: 0.15,
 *     },
 *     title: {
 *       text: [
 *         'Velocity over Time',
 *         { text: 'For object A', lineSpace: 0.13, font: { size: 0.08 } },
 *       ],
 *       offset: [0, 0],
 *     }
 *   },
 * });
 *
 * @example
 * // Secondary y axis
 * diagram.addElement({
 *   name: 'plot',
 *   method: 'advanced.plot',
 *   options: {
 *     width: 2,
 *     height: 2,
 *     trace: pow(2),
 *     yAxis: {
 *       title: {
 *         text: 'velocity (m/s)',
 *         rotation: 0,
 *         xAlign: 'right',
 *       },
 *     },
 *     xAxis: { title: 'time (s)' },
 *     axes: [
 *       {
 *         axis: 'y',
 *         start: 0,
 *         stop: 900,
 *         color: [1, 0, 0, 1],
 *         position: [2, 0],
 *         ticks: {
 *           step: 300,
 *           offset: 0,
 *           length: 0.05,
 *         },
 *         labels: {
 *           offset: [0.2, 0],
 *           precision: 0,
 *           xAlign: 'left',
 *         },
 *         title: {
 *           offset: [0.4, 0],
 *           xAlign: 'left',
 *           text: 'displacment (m)',
 *           rotation: 0,
 *         }
 *       },
 *     ],
 *     position: [-1, -1],
 *   },
 * });
 *
 * @example
 * // Cartesian axes crossing at the zero point
 * // Automatic layout doesn't support this, but axes, ticks, labels and titles
 * // can all be customized to create it.
 * diagram.addElement({
 *   name: 'plot',
 *   method: 'advanced.plot',
 *   options: {
 *     width: 3,
 *     height: 3,
 *     trace: pow(2, 20),
 *     font: { size: 0.1 },
 *     xAxis: {
 *       start: -25,
 *       stop: 25,
 *       ticks: {
 *         start: -20,
 *         stop: 20,
 *         step: 5,
 *         length: 0.1,
 *         offset: -0.05
 *       },
 *       line: { arrow: 'barb' },
 *       position: [0, 1.5],
 *       labels: [
 *         {
 *           hide: 4,
 *           precision: 0,
 *           space: 0.1,
 *         },
 *         {
 *           values: 0,
 *           text: 'O',
 *           offset: [0, 0.165],
 *         },
 *       ],
 *       title: {
 *         text: 'x',
 *         offset: [1.65, 0.3],
 *         font: {
 *           style: 'italic',
 *           family: 'Times New Roman',
 *           size: 0.15,
 *         },
 *       },
 *     },
 *     yAxis: {
 *       start: -500,
 *       stop: 500,
 *       line: { arrow: 'barb' },
 *       ticks: {
 *         start: -400,
 *         stop: 400,
 *         step: 100,
 *         length: 0.1,
 *         offset: -0.05,
 *       },
 *       position: [1.5, 0],
 *       labels: {
 *         hide: 4,
 *         precision: 0,
 *         space: 0.03,
 *       },
 *       title: {
 *         text: 'y',
 *         offset: [0.35, 1.6],
 *         font: {
 *           style: 'italic',
 *           family: 'Times New Roman',
 *           size: 0.15,
 *         },
 *         rotation: 0,
 *       },
 *     },
 *     grid: false,
 *     position: [-1, -1],
 *   },
 * });
 *
 */
// $FlowFixMe
class AdvancedPlot extends DiagramElementCollection {
  // Diagram elements
  // _axis: ?AdvancedAxis;
  // _majorTicks: ?DiagramElementPrimitive;
  // _minorTicks: ?DiagramElementPrimitive;
  // _labels: ?DiagramElementPrimitive;
  // _arrow1: ?DiagramElementPrimitive;
  // _arrow2: ?DiagramElementPrimitive;

  shapes: Object;
  equation: Object;
  advanced: Object;

  axes: Array<AdvancedAxis>;
  traces: Array<AdvancedTrace>;

  // length: number;
  // angle: number;
  // start: number;
  // stop: number;

  /**
   * @hideconstructor
   */
  constructor(
    shapes: Object,
    equation: Object,
    advanced: Object,
    optionsIn: ADV_Plot,
  ) {
    super(new Transform('Plot')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.shapes = shapes;
    this.equation = equation;
    this.advanced = advanced;

    const defaultOptions = {
      font: shapes.defaultFont,
      color: shapes.defaultColor,
      theme: 'classic',
      width: shapes.limits.width / 3,
      height: shapes.limits.width / 3,
      grid: [],
      xAlign: 'plotAreaLeft',
      yAlign: 'plotAreaBottom',
    };
    if (
      optionsIn.color != null
      && (
        optionsIn.font == null
        || (optionsIn.font != null && optionsIn.font.color == null)
      )
    ) {
      defaultOptions.font.color = optionsIn.color;
    }
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.stop == null) {
      options.stop = options.start + 1;
    }
    this.defaultFont = options.font;
    this.defaultColor = options.color;
    this.width = options.width;
    this.height = options.height;
    this.theme = options.theme;
    this.grid = options.grid;
    this.xAxisShow = true;
    if (options.xAxis === false) {
      this.xAxisShow = false;
    }
    this.yAxisShow = true;
    if (options.yAxis === false) {
      this.yAxisShow = false;
    }

    if (optionsIn.font == null || optionsIn.font.size == null) {
      this.defaultFont.size = Math.min(this.width, this.height) / 20;
    }

    if (options.position != null) {
      this.transform.updateTranslation(getPoint(options.position));
    }
    if (options.transform != null) {
      this.transform = getTransform(options.transform);
    }

    this.setColor(options.color);

    this.axes = [];
    this.traces = [];

    const [traces, bounds] = cleanTraces(options.trace);

    if (options.frame != null && options.frame !== false) {
      this.addFrame(options.frame);
    }
    if (options.plotArea != null && options.plotArea !== false) {
      this.addPlotArea(options.plotArea);
    }

    this.addAxes([joinObjects(
      {},
      { axis: 'x', name: 'x', auto: [bounds.left, bounds.right] },
      options.xAxis != null ? options.xAxis : {},
    )]);
    this.addAxes([joinObjects(
      {},
      { axis: 'y', name: 'y', auto: [bounds.bottom, bounds.top] },
      options.yAxis != null ? options.yAxis : {},
    )]);
    if (options.axes != null) {
      this.addAxes(options.axes);
    }
    if (options.trace != null) {
      this.addTraces(traces);
    }
    if (options.title != null) {
      this.addTitle(options.title);
    }

    if (options.legend != null && options.legend !== false) {
      this.addLegend(options.legend);
    }

    if (options.border != null) {
      this.addBorder(options.border);
    }

    if (this.__frame != null && this.frameSpace != null) {
      this.__frame.surround(this, this.frameSpace);
    }
  }

  getNonTraceBoundingRect() {
    const children = [];
    Object.keys(this.elements).forEach((elementName) => {
      if (!elementName.startsWith('trace')) {
        children.push(elementName);
      }
    });
    return this.getBoundingRect('draw', 'border', children);
  }

  addAxes(axes: Array<ADV_Axis>) {
    const defaultOptions = {
      color: this.defaultColor,
      font: this.defaultFont,
      type: 'x',
    };
    axes.forEach((axisOptions) => {
      let axisType;
      if (axisOptions.axis != null) {
        axisType = axisOptions.axis;
      } else if (defaultOptions.axis != null) {
        axisType = defaultOptions.axis;
      }
      if (axisType === 'x') {
        defaultOptions.length = this.width;
      } else {
        defaultOptions.length = this.height;
      }
      const theme = this.getTheme(this.theme, axisType, axisOptions.color);
      const show = axisType === 'x' ? this.xAxisShow : this.yAxisShow;
      defaultOptions.show = show;
      const o = joinObjects({}, defaultOptions, theme.axis, axisOptions);
      if (Array.isArray(o.grid)) {
        for (let i = 0; i < o.grid.length; i += 1) {
          o.grid[i] = joinObjects({}, theme.axis.grid, o.grid[i]);
        }
      }
      if (Array.isArray(o.ticks)) {
        for (let i = 0; i < o.ticks.length; i += 1) {
          o.ticks[i] = joinObjects({}, theme.axis.ticks, o.ticks[i]);
        }
      }
      if (o.name == null) {
        o.name = `axis_${this.axes.length}`;
      }
      const axis = this.advanced.axis(o);
      this.add(o.name, axis);
      this.axes.push(axis);
    });
  }

  addPlotArea(plotArea: Array<number> | ADV_Rectangle) {
    const defaultOptions = {
      width: this.width,
      height: this.height,
      xAlign: 'left',
      yAlign: 'bottom',
      position: [0, 0],
    };
    let o;
    if (Array.isArray(plotArea)) {
      defaultOptions.fill = plotArea;
      o = defaultOptions;
    } else {
      o = joinObjects({}, defaultOptions, plotArea);
    }
    this.add('_plotArea', this.advanced.rectangle(o));
  }

  addFrame(frame: ADV_Rectangle) {
    const defaultOptions = {
      width: this.width / 2,
      height: this.height / 2,
      xAlign: 'left',
      yAlign: 'bottom',
      position: [0, 0],
      space: Math.min(this.width, this.height) / 20,
    };
    let optionsIn = frame;
    if (optionsIn === true) {
      optionsIn = { line: { width: this.shapes.defaultLineWidth } };
    } else if (Array.isArray(optionsIn)) {
      optionsIn = { fill: optionsIn };
    }
    const o = joinObjects({}, defaultOptions, optionsIn);
    this.frameSpace = o.space;
    this.add('_frame', this.advanced.rectangle(o));
  }

  getTraceIndex(name: string | number) {
    if (typeof name === 'number') {
      return name;
    }
    for (let i = 0; i < this.traces.length; i += 1) {
      if (name === this.traces[i].name) {
        return i;
      }
    }
    return -1;
  }

  addLegend(legendOptions: ADV_PlotLegend | boolean) {
    let optionsIn;
    if (legendOptions === true) {
      optionsIn = {};
    } else {
      optionsIn = legendOptions;
    }
    const defaultOptions = {
      traces: this.traces,
      lineTextSpace: this.width / 50,
      length: this.width / 10,
      position: [this.width + this.width / 20, this.height],
    };
    const theme = this.getTheme(this.theme).legend;
    const o = joinObjects({}, defaultOptions, theme, optionsIn);
    const legend = this.advanced.plotLegend(o);
    this.add('_legend', legend);
  }

  getAxis(name: string) {
    for (let i = 0; i < this.axes.length; i += 1) {
      if (this.axes[i].name === name) {
        return this.axes[i];
      }
    }
    return null;
  }

  getXAxis() {
    for (let i = 0; i < this.axes.length; i += 1) {
      if (this.axes[i].axis === 'x') {
        return this.axes[i];
      }
    }
    return null;
  }

  getYAxis() {
    for (let i = 0; i < this.axes.length; i += 1) {
      if (this.axes[i].axis === 'y') {
        return this.axes[i];
      }
    }
    return null;
  }

  addTraces(traces: Array<ADV_Trace>) {
    const theme = this.getTheme(this.theme);
    traces.forEach((traceOptions, index) => {
      const defaultOptions = {
        xAxis: 'x',
        yAxis: 'y',
        color: theme.traceColors[index % theme.traceColors.length],
      };
      const o = joinObjects({}, defaultOptions, traceOptions);
      if (o.name == null) {
        o.name = `trace_${index}`;
      }
      o.xAxis = this.getAxis(o.xAxis);
      o.yAxis = this.getAxis(o.yAxis);

      const trace = this.advanced.trace(o);
      this.add(o.name, trace);
      this.traces.push(trace);
    });
  }

  getTheme(name: string, axis: 'x' | 'y' = 'x', defaultColor: Array<number> | null = null) {
    const length = axis === 'x' ? this.width : this.height;
    const gridLength = axis === 'x' ? this.height : this.width;

    // const minDimension = Math.min(this.shapes.limits.width, this.shapes.limits.height);

    let theme = {};
    if (name === 'classic') {
      const color = defaultColor == null ? [0.35, 0.35, 0.35, 1] : defaultColor;
      const tickLength = Math.min(this.width, this.height) / 30;
      const gridDash = this.shapes.defaultLineWidth;
      theme = {
        axis: {
          color,
          line: { width: this.shapes.defaultLineWidth },
          ticks: {
            width: this.shapes.defaultLineWidth,
            length: tickLength,
            offset: -tickLength,
          },
          font: {
            color,
          },
          length,
          grid: {
            color,
            width: this.shapes.defaultLineWidth / 2,
            length: gridLength,
            dash: [gridDash, gridDash],
          },
        },
        title: {
          font: { color },
        },
        legend: {
          color,
          font: { color },
        },
        traceColors: [
          [0, 0, 1, 1],
          [1, 0, 0, 1],
          [0, 0.7, 0, 1],
          [0.8, 0.8, 0.2, 1],
          [0.2, 0.8, 0.8, 1],
          [0.8, 0.2, 0.8, 1],
        ],
      };
    }

    if (theme.axis != null && theme.axis.grid != null) {
      if (this.grid === false) {
        theme.axis.grid = undefined;
      } else if (typeof this.grid === 'object' || Array.isArray(this.grid)) {
        theme.axis.grid = joinObjects({}, theme.axis.grid, this.grid);
      }
    }
    return theme;
  }

  addTitle(optionsIn: OBJ_TextLines & { offset: TypeParsablePoint } | string) {
    const defaultOptions = {
      font: joinObjects({}, this.defaultFont, { size: this.defaultFont.size * 1.5 }),
      justify: 'center',
      xAlign: 'center',
      yAlign: 'bottom',
      offset: [0, 0],
    };
    let optionsToUse = optionsIn;
    if (typeof optionsIn === 'string') {
      optionsToUse = { text: [optionsIn] };
    }
    const theme = this.getTheme(this.theme).title;
    const o = joinObjects({}, defaultOptions, theme, optionsToUse);
    o.offset = getPoint(o.offset);
    const bounds = this.getNonTraceBoundingRect();
    if (o.position == null) {
      o.position = new Point(
        this.width / 2 + o.offset.x,
        bounds.top + o.font.size * 0.5 + o.offset.y,
      );
    }
    const title = this.shapes.textLines(o);
    this.add('title', title);
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

export default AdvancedPlot;
