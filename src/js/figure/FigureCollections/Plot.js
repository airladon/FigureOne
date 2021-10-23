// @flow

// import Figure from '../Figure';
import {
  Transform, Point,
  getPoint, isParsablePoint,
  comparePoints, Rect,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import { clipValue } from '../../tools/math';
import {
  FigureElementCollection,
} from '../Element';
import type CollectionsAxis, { COL_Axis } from './Axis';
import type CollectionsTrace, { COL_Trace } from './Trace';
import type { COL_PlotLegend } from './Legend';
import type CollectionsRectangle, { COL_Rectangle } from './Rectangle';
import type { OBJ_Collection, OBJ_LineStyleSimple, OBJ_Texture } from '../FigurePrimitives/FigurePrimitiveTypes';
import type { OBJ_TextLines } from '../FigurePrimitives/FigurePrimitiveTypes2D';
import type {
  OBJ_Font, TypeColor, OBJ_Font_Fixed, OBJ_CurvedCorner,
} from '../../tools/types';
import type FigureCollections from './FigureCollections';
// import type FigureCollectionsAxis from './Axis';


/**
 * Plot frame.
 *
 *
 * @property {OBJ_LineStyleSimple} [line] line detail
 * @property {TypeColor | OBJ_Texture} [fill] fill detail
 * @property {OBJ_CurvedCorner} [corner] define if need curved corners
 * @property {number} [space] space between plot, labels and title and frame
 * boundary
 */
export type TypePlotFrame = {
  line?: OBJ_LineStyleSimple,
  fill?: TypeColor | OBJ_Texture,
  corner?: OBJ_CurvedCorner,
  space?: number,
};

export type OBJ_PlotZoomOptions = {
  axis?: 'x' | 'y' | 'xy',
  sensitivity?: number,
  point?: TypeParsablePoint,
};

export type OBJ_PlotPanOptions = {
  axis: 'x' | 'y' | 'xy',
  sensitivity?: number,
  wheel?: boolean,
  momentum?: boolean,
}

/**
 * An axis definition for a plot is the same as that for an
 * {@link CollectionsAxis} with an additional property `location` which can be
 * used to conveniently set the axis `position`. Note, if `position` is set in
 * the axis definition, then it will override `location`.
 *
 * @extends {COL_Axis}
 *
 * @property {OBJ_PlotAxis} [location]
 */
export type OBJ_PlotAxis = {
  location?: 'left' | 'right' | 'top' | 'bottom',
} & COL_Axis;

/**
 * Plot title.
 *
 * {@link OBJ_TextLines}` & { offset: `{@link TypeParsablePoint}` }`
 *
 * Use `offset` to adjust the location of the title.
 */
export type TypePlotTitle = OBJ_TextLines & { offset: TypeParsablePoint };

/**
 * {@link CollectionsPlot} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
 *
 * A plot is a collection of axes and traces, and may include a title, legend
 * and bounding frame.
 *
 * Use `width`, `height` and `position` to define the size of the plot area
 * (area where the traces are drawn) and where it is in the figure.
 *
 * @extends OBJ_Collection
 *
 * @property {number} [width] width of the plot area
 * @property {number} [height] height of the plot area
 * @property {OBJ_PlotAxis | boolean} [x] customize the x axis, or use `false`
 * to hide it
 * @property {OBJ_PlotAxis | boolean} [y] customize the y axis, or use `false`
 * to hide it
 * @property {Array<OBJ_PlotAxis>} [axes] add axes additional to x and y
 * @property {boolean} [grid] turn on and off the grid - use the grid options
 * in x axis, y axis or axes for finer customization
 * @property {TypePlotTitle | string} [title] plot title can be simply a
 * `string` or fully customized with TypePlotTitle
 * @property {Array<COL_Trace | TypeParsablePoint> | COL_Trace | Array<TypeParsablePoint>} [trace]
 *  Use array if plotting more than one trace. Use COL_Trace to customize the
 *  trace.
 * @property {COL_PlotLegend | boolean} [legend] `true` to turn the legend on,
 * or use COL_PlotLegend to customize it's location and layout
 * @property {boolean | TypeColor | TypePlotFrame} [frame] frame around the
 * plot can be turned on with `true`, can be a simple color fill using
 * `Array<number>` as a color, or can be fully customized with TypePlotFrame
 * @property {TypeColor | COL_Rectangle} [plotArea] plot area can be a
 * color fill with `TypeColor` as a color, or be fully customized with
 * COL_Rectangle
 * @property {OBJ_Font} [font] Default font for plot (title, axes, labels, etc.)
 * @property {TypeColor} [color] Default color
 * @property {TypeParsablePoint} [position] Position of the plot
 * @property {OBJ_PlotZoomOptions} [zoom] options for interactive zooming
 * @property {OBJ_PlotPanOptions} [pan] options for interactive panning
 * @property {TypeParsablePoint} [cross] value where the default x and y
 * axes should cross. If defined, each `axis.position` will be overridden. If
 * the cross point is outside of the plot area, then the axes will be drawn on
 * the border of the plot area. (`undefined`)
 * @property {boolean} [plotAreaLabels] if `true` then axes with a cross point
 * will be drawn such that the labels stay within the plot area. So, if the
 * labels are on the left side of a y axis, and the cross point is out of the
 * plot area to the left, then instead of the axis being drawn on the left edge
 * of the plot area, it will be drawn within the plot area such that its labels
 * are within the plot area (`false`).
 * @property {boolean} [autoGrid] if `true` sets the grid for an axes to expand
 * accross the entire plot area. Set to `false` if only a partial length grid
 * is needed (`true`)
 */
export type COL_Plot = {
  width?: number,
  height?: number,
  x?: OBJ_PlotAxis | boolean,
  y?: OBJ_PlotAxis | boolean,
  axes?: Array<OBJ_PlotAxis>,
  cross?: TypeParsablePoint | null,
  grid?: boolean,
  title?: string | TypePlotTitle,
  trace?: Array<COL_Trace | TypeParsablePoint> | COL_Trace | Array<TypeParsablePoint>,
  legend?: COL_PlotLegend,
  frame?: boolean | TypeColor | TypePlotFrame,
  plotArea?: TypeColor | COL_Rectangle,
  font?: OBJ_Font,
  color?: TypeColor,
  position?: TypeParsablePoint,
  zoom?: OBJ_PlotZoomOptions | 'x' | 'y' | 'xy',
  pan?: OBJ_PlotPanOptions | 'x' | 'y' | 'xy',
  cross?: TypeParsablePoint,
  autoGrid?: boolean,
  plotAreaLabels?: boolean,
} & OBJ_Collection;

function cleanTraces(
  tracesIn: Array<COL_Trace | Array<TypeParsablePoint>> | COL_Trace | Array<TypeParsablePoint>,
): [Array<COL_Trace>, Rect] {
  let traces = [];
  if (!Array.isArray(tracesIn)) {
    traces = [tracesIn];
  } else if (tracesIn.length === 0) {
    traces = []; // $FlowFixMe
  } else if (isParsablePoint(tracesIn[0])) {
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
  traces.forEach((trace) => { // $FlowFixMe
    for (let i = 0; i < trace.points.length; i += 1) { // $FlowFixMe
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
  );  // $FlowFixMe
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
 * {@link FigureElementCollection} representing a plot including axes, traces,
 * labels and titles.
 *
 * ![](./apiassets/advplot_ex1.png)
 * ![](./apiassets/advplot_ex2.png)
 *
 * ![](./apiassets/advplot_ex3.png)
 * ![](./apiassets/advplot_ex4.png)
 *
 * ![](./apiassets/advplot_ex5.png)
 * ![](./apiassets/advplot_ex6.png)
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
 * See {@link COL_Axis}, {@link OBJ_AxisLabels}, {@link OBJ_AxisTicks},
 * {@link COL_Trace} and {@link COL_PlotLegend} for more examples of customizing
 * specific parts of the plot.
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 * All examples below also use this power function to generate the traces:
 * ```javascript
 * const pow = (pow = 2, stop = 10, step = 0.05) => {
 *   const xValues = Fig.range(0, stop, step);
 *   return xValues.map(x => new Fig.Point(x, x ** pow));
 * }
 * ```
 * @example
 * // Plot of single trace with auto axis scaling
 * figure.add({
 *   name: 'plot',
 *   make: 'collections.plot',
 *   trace: pow(),
 * });
 *
 * @example
 * // Multiple traces with a legend
 * // Some traces are customized beyond the default color to include dashes and
 * // markers
 * figure.add({
 *   name: 'plot',
 *   make: 'collections.plot',
 *   width: 2,                                    // Plot width in figure
 *   height: 2,                                   // Plot height in figure
 *   yAxis: { start: 0, stop: 100 },              // Customize y axis limits
 *   trace: [
 *     { points: pow(1.5), name: 'Power 1.5' },   // Trace names are for legend
 *     {                                          // Trace with only markers
 *       points: pow(2, 10, 0.5),
 *       name: 'Power 2',
 *       markers: { sides: 4, radius: 0.03 },
 *     },
 *     {                                          // Trace with markers and
 *       points: pow(3, 10, 0.5),                 // dashed line
 *       name: 'Power 3',
 *       markers: { radius: 0.03, sides: 10, line: { width: 0.005 } },
 *       line: { dash: [0.04, 0.01] },
 *     },
 *   ],
 *   legend: true,
 * });
 *
 * @example > collections.plot.multiple.grids.simple.titles
 * // Multiple grids and simple titles
 * figure.add({
 *   name: 'plot',
 *   make: 'collections.plot',
 *   width: 2,
 *   height: 2,
 *   yAxis: {
 *     start: 0,
 *     stop: 100,
 *     grid: [
 *       { step: 20, width: 0.005, dash: [], color: [0.7, 0.7, 1, 1] },
 *       { step: 5, width: 0.005, dash: [0.01, 0.01], color: [1, 0.7, 0.7, 1] },
 *     ],
 *     title: 'velocity (m/s)',
 *   },
 *   xAxis: {
 *     grid: [
 *       { step: 2, width: 0.005, dash: [], color: [0.7, 0.7, 1, 1] },
 *       { step: 0.5, width: 0.005, dash: [0.01, 0.01], color: [1, 0.7, 0.7, 1] },
 *     ],
 *     title: 'time (s)',
 *   },
 *   trace: pow(3),
 *   title: 'Velocity over Time'
 * });
 *
 * @example
 * // Hide axes
 * // Use plot frame and plot area
 * // Title has a subtitle
 * figure.add({
 *   name: 'plot',
 *   make: 'collections.plot',
 *   width: 2,
 *   height: 2,
 *   trace: pow(3),
 *   xAxis: { show: false },
 *   yAxis: { show: false },
 *   plotArea: [0.93, 0.93, 0.93, 1],
 *   frame: {
 *     line: { width: 0.005, color: [0.5, 0.5, 0.5, 1] },
 *     corner: { radius: 0.1, sides: 10 },
 *     space: 0.15,
 *   },
 *   title: {
 *     text: [
 *       'Velocity over Time',
 *       { text: 'For object A', lineSpace: 0.13, font: { size: 0.08 } },
 *     ],
 *     offset: [0, 0],
 *   }
 * });
 *
 * @example
 * // Secondary y axis
 * figure.add({
 *   name: 'plot',
 *   make: 'collections.plot',
 *   width: 2,
 *   height: 2,
 *   trace: pow(2),
 *   yAxis: {
 *     title: {
 *       text: 'velocity (m/s)',
 *       rotation: 0,
 *       xAlign: 'right',
 *     },
 *   },
 *   xAxis: { title: 'time (s)' },
 *   axes: [
 *     {
 *       axis: 'y',
 *       start: 0,
 *       stop: 900,
 *       color: [1, 0, 0, 1],
 *       position: [2, 0],
 *       ticks: {
 *         step: 300,
 *         offset: 0,
 *         length: 0.05,
 *       },
 *       labels: {
 *         offset: [0.2, 0],
 *         precision: 0,
 *         xAlign: 'left',
 *       },
 *       title: {
 *         offset: [0.4, 0],
 *         xAlign: 'left',
 *         text: 'displacment (m)',
 *         rotation: 0,
 *       }
 *     },
 *   ],
 *   position: [-1, -1],
 * });
 *
 * @example
 * // Cartesian axes crossing at the zero point
 * // Automatic layout doesn't support this, but axes, ticks, labels and titles
 * // can all be customized to create it.
 * figure.add({
 *   name: 'plot',
 *   make: 'collections.plot',
 *   width: 3,
 *   height: 3,
 *   trace: pow(2, 20),
 *   font: { size: 0.1 },
 *   xAxis: {
 *     start: -25,
 *     stop: 25,
 *     ticks: {
 *       start: -20,
 *       stop: 20,
 *       step: 5,
 *       length: 0.1,
 *       offset: -0.05
 *     },
 *     line: { arrow: 'barb' },
 *     position: [0, 1.5],
 *     labels: [
 *       {
 *         hide: 4,
 *         precision: 0,
 *         space: 0.1,
 *       },
 *       {
 *         values: 0,
 *         text: 'O',
 *         offset: [0, 0.165],
 *       },
 *     ],
 *     title: {
 *       text: 'x',
 *       offset: [1.65, 0.3],
 *       font: {
 *         style: 'italic',
 *         family: 'Times New Roman',
 *         size: 0.15,
 *       },
 *     },
 *   },
 *   yAxis: {
 *     start: -500,
 *     stop: 500,
 *     line: { arrow: 'barb' },
 *     ticks: {
 *       start: -400,
 *       stop: 400,
 *       step: 100,
 *       length: 0.1,
 *       offset: -0.05,
 *     },
 *     position: [1.5, 0],
 *     labels: {
 *       hide: 4,
 *       precision: 0,
 *       space: 0.03,
 *     },
 *     title: {
 *       text: 'y',
 *       offset: [0.35, 1.6],
 *       font: {
 *         style: 'italic',
 *         family: 'Times New Roman',
 *         size: 0.15,
 *       },
 *       rotation: 0,
 *     },
 *   },
 *   grid: false,
 *   position: [-1, -1],
 * });
 *
 */
// $FlowFixMe
class CollectionsPlot extends FigureElementCollection {
  // Figure elements
  // _axis: ?CollectionsAxis;
  // _majorTicks: ?FigureElementPrimitive;
  // _minorTicks: ?FigureElementPrimitive;
  // _labels: ?FigureElementPrimitive;
  // _arrow1: ?FigureElementPrimitive;
  // _arrow2: ?FigureElementPrimitive;
  _x: ?CollectionsAxis;
  _y: ?CollectionsAxis;
  __frame: ?CollectionsRectangle;

  shapes: Object;
  equation: Object;
  collections: Object;

  axes: Array<CollectionsAxis>;
  traces: Array<CollectionsTrace>;
  cross: null | Point;

  defaultFont: OBJ_Font_Fixed;
  width: number;
  height: number;
  colorTheme: string;
  styleTheme: string;
  grid: boolean;
  xAxisShow: boolean;
  yAxisShow: boolean;
  frameSpace: ?number;
  zoom: {
    x: boolean,
    y: boolean,
    enabled: boolean,
  };

  pan: {
    x: boolean,
    y: boolean,
    enabled: boolean,
  };

  autoGrid: boolean;
  plotAreaLabels: boolean;

  // length: number;
  // angle: number;
  // start: number;
  // stop: number;

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: COL_Plot,
  ) {
    const defaultOptions = {
      font: collections.primitives.defaultFont,
      color: collections.primitives.defaultColor,
      colorTheme: 'dark',
      styleTheme: 'box',
      width: (collections.primitives.scene.right - collections.primitives.scene.left) / 3,
      height: (collections.primitives.scene.right - collections.primitives.scene.left) / 3,
      grid: true,
      xAlign: 'plotAreaLeft',
      yAlign: 'plotAreaBottom',
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
      touchBorder: 'rect',
      zoom: false,
      pan: false,
      plotAreaLabels: false,
      autoGrid: true, // !!((optionsIn.zoom || optionsIn.pan || optionsIn.cross)),
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
    // if (options.transform != null) {
    //   options.transform = getTransform(options.transform);
    // }
    // if (options.position != null) {
    //   options.transform.updateTranslation(getPoint(options.position));
    // }
    if (options.stop == null) {
      options.stop = options.start + 1;
    }
    super(options);
    this.collections = collections;

    this.defaultFont = options.font;
    this.defaultColor = options.color;
    const colorTheme = this.getColorTheme(options.colorTheme);
    const styleTheme = this.getStyleTheme(options.styleTheme);
    if (optionsIn.font == null || optionsIn.font.color == null) {
      if (optionsIn.color == null) {
        this.defaultFont.color = colorTheme.color;
      } else {
        this.defaultFont.color = this.defaultColor;
      }
    }
    this.width = options.width;
    this.height = options.height;
    this.colorTheme = options.colorTheme;
    this.styleTheme = options.styleTheme;
    this.grid = options.grid;
    this.cross = options.cross;
    if (this.cross == null && styleTheme.cross) {
      this.cross = getPoint(styleTheme.cross);
    }
    this.autoGrid = options.autoGrid;
    if (optionsIn.autoGrid == null && styleTheme.autoGrid != null) {
      this.autoGrid = styleTheme.autoGrid;
    }
    this.plotAreaLabels = options.plotAreaLabels;
    if (options.cross != null) {
      this.cross = getPoint(options.cross);
    }
    this.drawNumberOrder = [-1, 0];
    this.xAxisShow = true;
    if (options.x === false) {
      this.xAxisShow = false;
    }
    this.yAxisShow = true;
    if (options.y === false) {
      this.yAxisShow = false;
    }

    if (optionsIn.font == null || optionsIn.font.size == null) {
      this.defaultFont.size = Math.min(this.width, this.height) / 16;
    }

    this.setColor(options.color);

    this.axes = [];
    this.traces = [];

    // console.log(options.trace)
    const [traces, bounds] = cleanTraces(options.trace);

    if (options.plotArea != null && options.plotArea !== false) {
      this.addPlotArea(options.plotArea);
    }

    this.addAxes([joinObjects(
      {},
      { axis: 'x', name: 'x', auto: [bounds.left, bounds.right] },
      this.grid === false ? { grid: [] } : {},
      options.x != null ? options.x : {},
    )]);
    this.addAxes([joinObjects(
      {},
      { axis: 'y', name: 'y', auto: [bounds.bottom, bounds.top] },
      this.grid === false ? { grid: [] } : {},
      options.y != null ? options.y : {},
    )]);
    if (options.axes != null) {
      this.addAxes(options.axes);
    }
    this.setupCross();
    if (options.trace != null) {
      this.addTraces(traces);
    }
    if (options.title != null) {
      this.addTitle(options.title);
    }

    if (options.legend != null && options.legend !== false) {
      this.addLegend(options.legend);
    }

    // if (options.border != null) {
    //   this.addBorder(options.border);
    // }

    if (options.frame != null && options.frame !== false) {
      this.addFrame(options.frame);
    }
    // if (this.__frame != null && this.frameSpace != null) {
    //   this.__frame.surround(this, this.frameSpace, true);
    // }

    this.zoom = { enabled: false, x: false, y: false };
    this.pan = { enabled: false, x: false, y: false };
    if (
      (options.zoom != null && options.zoom !== false)
      || (options.pan != null && options.pan !== false)
    ) {
      this.addGestureRectangle(options.zoom, options.pan);
      this.setupCross();
    }
    this.setupGrid();
  }

  setupCross() {
    const { cross, _x, _y } = this;
    if (cross == null || _x == null || _y == null) {
      return;
    }
    const xAxisYPosition = _y.valueToDraw(cross.y);
    const yAxisXPosition = _x.valueToDraw(cross.x);
    let yMin = 0;
    let yMax = this.height;
    let xMin = 0;
    let xMax = this.width;
    if (this.plotAreaLabels) {
      if (_x._labels != null) {
        const labelRect = _x._labels.getBoundingRect();
        yMin = Math.max(yMin, -labelRect.bottom * 1.2);
        yMax = Math.min(yMax, this.height - labelRect.top);
      }
      if (_x._ticks0) {
        const ticksRect = _x._ticks0.getBoundingRect();
        yMin = Math.max(yMin, -ticksRect.bottom);
        yMax = Math.min(yMax, this.height - ticksRect.top);
      }
      if (_y._labels != null) {
        const labelRect = _y._labels.getBoundingRect();
        xMin = Math.max(xMin, -labelRect.left);
        xMax = Math.min(xMax, this.height - labelRect.right);
      }
      if (_y._ticks0) {
        const ticksRect = _y._ticks0.getBoundingRect();
        xMin = Math.max(xMin, -ticksRect.left);
        xMax = Math.min(xMax, this.height - ticksRect.right);
      }
    }
    const y = clipValue(xAxisYPosition, yMin, yMax);
    const x = clipValue(yAxisXPosition, xMin, xMax);
    _x.setPosition(0, y);
    _y.setPosition(x, 0);

    this.setupGrid();
  }

  setupGrid() {
    if (this.autoGrid) {
      this.axes.forEach((axis) => {
        const p = axis.getPosition();
        if (axis.axis === 'x') { // $FlowFixMe
          axis.grid.forEach((g, i) => axis[`_grid${i}`].setPosition(0, -p.y));
        } else { // $FlowFixMe
          axis.grid.forEach((g, i) => axis[`_grid${i}`].setPosition(-p.x, 0));
        }
      });
    }
  }

  showGrid() {
    this.axes.forEach(axis => axis.showGrid());
  }

  hideGrid() {
    this.axes.forEach(axis => axis.hideGrid());
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

  addAxes(axes: Array<OBJ_PlotAxis>) {
    const defaultOptions = {
      color: this.defaultColor,
      font: this.defaultFont,
    };
    axes.forEach((axisOptions) => {
      let axisType;
      if (axisOptions.axis != null) {
        axisType = axisOptions.axis;  // $FlowFixMe
      } else if (defaultOptions.axis != null) {
        axisType = defaultOptions.axis;
      }
      if (axisType === 'x') {     // $FlowFixMe
        defaultOptions.length = this.width;
      } else {                    // $FlowFixMe
        defaultOptions.length = this.height;
      }
      // const theme = this.getTheme(this.theme, axisType, axisOptions.color);
      const theme = joinObjects(
        {},
        this.getStyleTheme(this.styleTheme, axisType, axisOptions.location),
        this.getColorTheme(this.colorTheme, axisOptions.color),
      );

      const show = axisType === 'x' ? this.xAxisShow : this.yAxisShow;
      // $FlowFixMe
      defaultOptions.show = show;
      const o = joinObjects({}, defaultOptions, theme.axis, axisOptions);
      if (
        axisOptions.color != null
        && (axisOptions.font == null || axisOptions.font.color == null)
      ) {
        o.font.color = axisOptions.color;
      }
      if (typeof axisOptions.ticks === 'string') {
        o.ticks = joinObjects({}, theme.axis.ticks, { location: axisOptions.ticks });
      }
      if (typeof axisOptions.labels === 'string') {
        o.labels = joinObjects({}, theme.axis.labels, { location: axisOptions.labels });
      }
      if (typeof axisOptions.title === 'string') {
        o.title = joinObjects({}, theme.axis.title, { text: axisOptions.title });
      }
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
      const axis = this.collections.axis(o);
      this.add(o.name, axis);
      this.axes.push(axis);
    });
  }

  addPlotArea(plotArea: Array<number> | COL_Rectangle) {
    const defaultOptions = {
      width: this.width,
      height: this.height,
      xAlign: 'left',
      yAlign: 'bottom',
      position: [0, 0],
    };
    let o;
    if (Array.isArray(plotArea)) {    // $FlowFixMe
      defaultOptions.fill = plotArea;
      o = defaultOptions;
    } else {
      o = joinObjects({}, defaultOptions, plotArea);
    }
    this.add('_plotArea', this.collections.rectangle(o));
  }

  addGestureRectangle(
    zoomOptions: OBJ_PlotZoomOptions | 'xy' | 'x' | 'y' | false,
    panOptions: OBJ_PlotPanOptions | 'xy' | 'x' | 'y' | false,
  ) {
    const options = {
      width: this.width,
      height: this.height,
      xAlign: 'left',
      yAlign: 'bottom',
      position: [0, 0],
    };
    if (zoomOptions != null && zoomOptions !== false) {
      const defaultOptions = {
        axis: typeof zoomOptions === 'string' ? zoomOptions : 'xy',
        sensitivity: 1,
        point: null,
      };
      let zOptions;
      if (typeof zoomOptions === 'string') {
        zOptions = defaultOptions;
      } else {
        zOptions = joinObjects({}, defaultOptions, zoomOptions);
      }
      joinObjects(options, { zoom: zOptions });
      this.zoom.enabled = true;
      this.zoom.x = zOptions.axis.startsWith('x');
      this.zoom.y = zOptions.axis.endsWith('y');
    }
    if (panOptions != null && panOptions !== false) {
      const defaultOptions = {
        axis: typeof panOptions === 'string' ? panOptions : 'xy',
        sensitivity: 1,
        wheel: true,
      };
      let pOptions;
      if (typeof panOptions === 'string') {
        pOptions = defaultOptions;
      } else {
        pOptions = joinObjects({}, defaultOptions, panOptions);
      }
      joinObjects(options, { pan: pOptions });
      this.pan.enabled = true;
      this.pan.x = pOptions.axis.startsWith('x');
      this.pan.y = pOptions.axis.endsWith('y');
    }
    const gesture = this.collections.primitives.gesture(options);
    gesture.notifications.add('zoom', () => {
      if (!this.zoom.enabled) {
        return;
      }
      const z = gesture.getZoom();
      const p = this.drawToPoint(z.current.normPosition);
      this.zoomDelta(p, z.mag / z.last.mag);
      gesture.reset();
    });
    gesture.notifications.add('pan', () => {
      if (!this.pan.enabled) {
        return;
      }
      const z = gesture.getZoom();
      const p = gesture.getPan();
      this.panDeltaDraw(p.delta.scale(-z.mag));
      gesture.reset();
    });
    this.add('_gesture', gesture);
  }

  addFrame(frameIn: TypePlotFrame | true | TypeColor) {
    let frame = frameIn;
    if (typeof frame === 'boolean') {
      frame = { line: { width: this.collections.primitives.defaultLineWidth } };
    } else if (Array.isArray(frame)) {
      frame = { fill: frameIn };
    }
    const space = frame.space != null && typeof frame.space === 'number'
      ? frame.space
      : Math.min(this.width, this.height) / 20;
    const defaultOptions = {
      width: 0,
      height: 0,
      xAlign: 'left',
      yAlign: 'bottom',
      position: [0, 0],
      space,
    };
    const o = joinObjects({}, defaultOptions, frame);
    this.frameSpace = o.space;
    this.add('_frame', this.collections.rectangle(o));
    // $FlowFixMe
    this.toBack(this.__frame);
    // $FlowFixMe
    this.__frame.getAllPrimitives().forEach((e) => { e.drawNumber = -1; });
    this.notifications.add('setFigure', () => {
      // $FlowFixMe
      this.__frame.surround(this, this.frameSpace);
    });
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

  addLegend(legendOptions: COL_PlotLegend | boolean) {
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
    // const theme = this.getTheme(this.theme).legend;
    const theme = joinObjects(
      {}, this.getStyleTheme(this.styleTheme),
      this.getColorTheme(this.colorTheme),
    );
    const o = joinObjects({}, defaultOptions, theme, optionsIn);
    const legend = this.collections.plotLegend(o);
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

  pointToDraw(
    point: TypeParsablePoint,
    xAxisName: string = 'x',
    yAxisName: string = 'y',
  ) {
    const xAxis = this.getAxis(xAxisName);
    const yAxis = this.getAxis(yAxisName);
    if (xAxis == null || yAxis == null) {
      throw new Error(`Plot.pointToDraw Error: Both xAxis and yAxis need to be defined. xAxis: ${JSON.stringify(xAxis)}, yAxis: ${JSON.stringify(yAxis)}`);
    }
    const p = getPoint(point);
    return new Point(xAxis.valueToDraw(p.x), yAxis.valueToDraw(p.y));
  }

  drawToPoint(
    point: TypeParsablePoint,
    xAxisName: string = 'x',
    yAxisName: string = 'y',
  ) {
    const xAxis = this.getAxis(xAxisName);
    const yAxis = this.getAxis(yAxisName);
    if (xAxis == null || yAxis == null) {
      throw new Error(`Plot.drawToPoint Error: Both xAxis and yAxis need to be defined. xAxis: ${JSON.stringify(xAxis)}, yAxis: ${JSON.stringify(yAxis)}`);
    }
    const p = getPoint(point);
    return new Point(xAxis.drawToValue(p.x), yAxis.drawToValue(p.y));
  }

  addTraces(traces: Array<COL_Trace>) {
    const theme = this.getColorTheme(this.colorTheme);
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

      const trace = this.collections.trace(o);
      this.add(o.name, trace);
      this.traces.push(trace);
    });
  }

  updateTraces() {
    for (let i = 0; i < this.traces.length; i += 1) {
      this.traces[i].updateAxes();
    }
  }

  getStyleTheme(
    name: string,
    axis: 'x' | 'y' = 'x',
    location: null | 'left' | 'bottom' | 'right' | 'top' = null,
  ) {
    // const length = axis === 'x' ? this.width : this.height;
    const gridLength = axis === 'x' ? this.height : this.width;
    const lineWidth = this.collections.primitives.defaultLineWidth;
    const tickLength = lineWidth * 5;
    let theme = {};
    if (name === 'box') {
      let position = [0, 0];
      if (location === 'top') {
        position = [0, this.height];
      } else if (location === 'right') {
        position = [this.width, 0];
      }
      theme = {
        axis: {
          line: { width: lineWidth },
          ticks: {
            width: lineWidth,
            length: tickLength,
            location: location || (axis === 'x' ? 'bottom' : 'left'),
          },
          grid: {
            width: lineWidth / 2,
            length: gridLength,
          },
          labels: {
            location: location || (axis === 'x' ? 'bottom' : 'left'),
          },
          position,
          title: {
            location: location || (axis === 'x' ? 'bottom' : 'left'),
          },
        },
      };
    }
    if (name === 'numberLine' || name === 'positiveNumberLine') {
      theme = {
        axis: {
          line: {
            width: lineWidth,
            arrow: { end: 'barb' },
            arrowLength: lineWidth * 5,
          },
          ticks: {
            width: lineWidth,
            length: tickLength,
            location: 'center',
          },
          grid: {
            width: lineWidth / 2,
            length: gridLength,
          },
          labels: {
            location: axis === 'x' ? 'bottom' : 'left',
          },
          title: {
            location: axis === 'x' ? 'right' : 'top',
          },
        },
        cross: [0, 0],
        autoGrid: true,
      };
      if (name === 'numberLine') {   // $FlowFixMe
        theme.axis.labels.hide = [0]; // $FlowFixMe
        theme.axis.line.arrow = 'barb';
      }
    }
    return theme;
  }

  // eslint-disable-next-line class-methods-use-this
  getColorTheme(name: string, defaultColor: TypeColor | null = null) {
    let theme = {};
    if (name === 'dark') {
      const color = defaultColor == null ? [0.35, 0.35, 0.35, 1] : defaultColor;
      const gridColor = defaultColor == null ? [0.7, 0.7, 0.7, 1] : defaultColor;
      theme = {
        color,
        axis: {
          color,
          grid: {
            color: gridColor,
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
    if (name === 'light') {
      const color = defaultColor == null ? [0.9, 0.9, 0.9, 1] : defaultColor;
      const gridColor = defaultColor == null ? [0.5, 0.5, 0.5, 1] : defaultColor;
      theme = {
        color,
        axis: {
          color,
          grid: {
            color: gridColor,
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
          [0.5, 0.5, 1, 1],
          [1, 0.5, 0.5, 1],
          [0.5, 1, 0.5, 1],
          [1, 1, 0.2, 1],
          [0.2, 1, 1, 1],
          [1, 0.2, 1, 1],
        ],
      };
    }
    return theme;
  }

  // getTheme(name: string, axis: 'x' | 'y' = 'x', defaultColor: Array<number> | null = null) {
  //   const length = axis === 'x' ? this.width : this.height;
  //   const gridLength = axis === 'x' ? this.height : this.width;

  //   // const minDimension = Math.min(

  //   let theme = {};
  //   if (name === 'classic') {
  //     const color = defaultColor == null ? [0.35, 0.35, 0.35, 1] : defaultColor;
  //     const gridColor = defaultColor == null ? [0.7, 0.7, 0.7, 1] : defaultColor;
  //     const tickLength = Math.min(this.width, this.height) / 30;
  //     // const gridDash = this.collections.primitives.defaultLineWidth;
  //     theme = {
  //       axis: {
  //         color,
  //         line: { width: this.collections.primitives.defaultLineWidth },
  //         ticks: {
  //           width: this.collections.primitives.defaultLineWidth,
  //           length: tickLength,
  //           offset: -tickLength + this.collections.primitives.defaultLineWidth / 2,
  //         },
  //         font: {
  //           color,
  //         },
  //         length,
  //         grid: {
  //           color: gridColor,
  //           width: this.collections.primitives.defaultLineWidth / 2,
  //           length: gridLength,
  //           // dash: [gridDash, gridDash],
  //         },
  //       },
  //       title: {
  //         font: { color },
  //       },
  //       legend: {
  //         color,
  //         font: { color },
  //       },
  //       traceColors: [
  //         [0, 0, 1, 1],
  //         [1, 0, 0, 1],
  //         [0, 0.7, 0, 1],
  //         [0.8, 0.8, 0.2, 1],
  //         [0.2, 0.8, 0.8, 1],
  //         [0.8, 0.2, 0.8, 1],
  //       ],
  //     };
  //   }

  //   if (theme.axis != null && theme.axis.grid != null) {
  //     if (this.grid === false) {  // $FlowFixMe
  //       delete theme.axis.grid;
  //       // theme.axis.grid = undefined;
  //     } else if (typeof this.grid === 'object' || Array.isArray(this.grid)) {
  //       theme.axis.grid = joinObjects({}, theme.axis.grid, this.grid);
  //     }
  //   }
  //   return theme;
  // }

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
    const theme = this.getColorTheme(this.colorTheme).title;
    const o = joinObjects({}, defaultOptions, theme, optionsToUse);
    o.offset = getPoint(o.offset);
    const bounds = this.getNonTraceBoundingRect();
    if (o.position == null) {
      o.position = new Point(
        this.width / 2 + o.offset.x,
        bounds.top + o.font.size * 0.5 + o.offset.y,
      );
    }
    const title = this.collections.primitives.textLines(o);
    this.add('title', title);
  }

  panDeltaValue(deltaValue: Point) {
    const x = this.getXAxis();
    if (x != null && this.pan.enabled && this.pan.x) {
      x.panDeltaValue(deltaValue.x);
    }
    const y = this.getXAxis();
    if (y != null && this.pan.enabled && this.pan.y) {
      y.panDeltaValue(deltaValue.x);
    }
    this.updateTraces();
    this.setupCross();
  }

  panDeltaDraw(deltaDraw: Point) {
    const x = this.getXAxis();
    if (x != null && this.pan.enabled && this.pan.x) {
      x.panDeltaDraw(deltaDraw.x);
    }
    const y = this.getYAxis();
    if (y != null && this.pan.enabled && this.pan.y) {
      y.panDeltaDraw(deltaDraw.y);
    }
    this.updateTraces();
    this.setupCross();
  }

  zoomValue(value: Point, mag: number) {
    const x = this.getXAxis();
    if (x != null && this.zoom.enabled && this.zoom.x) {
      x.zoomValue(value.x, mag);
    }
    const y = this.getYAxis();
    if (y != null && this.zoom.enabled && this.zoom.y) {
      y.zoomValue(value.y, mag);
    }
    this.updateTraces();
    this.setupCross();
  }

  zoomDelta(value: Point, magDelta: number) {
    const x = this.getXAxis();
    if (x != null && this.zoom.enabled && this.zoom.x) {
      x.zoomDelta(value.x, magDelta);
    }
    const y = this.getYAxis();
    if (y != null && this.zoom.enabled && this.zoom.y) {
      y.zoomDelta(value.y, magDelta);
    }
    this.updateTraces();
    this.setupCross();
  }
}

export default CollectionsPlot;
