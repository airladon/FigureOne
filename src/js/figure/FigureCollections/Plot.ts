
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
  FigureElementCollection, FigureElement,
} from '../Element';
import type CollectionsAxis from './Axis';
import type { COL_Axis } from './Axis';
import type CollectionsTrace from './Trace';
import type { COL_Trace } from './Trace';
import type { COL_PlotLegend } from './Legend';
import type CollectionsRectangle from './Rectangle';
import type { COL_Rectangle } from './Rectangle';
import type { OBJ_Collection, OBJ_LineStyleSimple, OBJ_Texture } from '../FigurePrimitives/FigurePrimitiveTypes';
import type { OBJ_FormattedText } from './Text';
import type {
  OBJ_Font, TypeColor, OBJ_Font_Fixed, OBJ_CurvedCorner,
} from '../../tools/types';
import type FigureCollections from './FigureCollections';
// import type FigureCollectionsAxis from './Axis';


/**
 * Gesture area extension. `left` and `bottom` should be negative numbers
 * if extending beyond the plot area.
 *
 * @property {number} [left]
 * @property {number} [right]
 * @property {number} [top]
 * @property {number} [bottom]
 * @interface
 * @group Misc Shapes
 */
export type OBJ_GestureArea = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

/**
 * Plot frame.
 *
 *
 * @property {OBJ_LineStyleSimple} [line] line detail
 * @property {TypeColor | OBJ_Texture} [fill] fill detail
 * @property {OBJ_CurvedCorner} [corner] define if need curved corners
 * @property {number} [space] space between plot, labels and title and frame
 * boundary
 * @interface
 * @group Misc Shapes
 */
export type OBJ_PlotFrame = {
  line?: OBJ_LineStyleSimple;
  fill?: TypeColor | OBJ_Texture;
  corner?: OBJ_CurvedCorner;
  space?: number;
};

/**
  * @property {'x' | 'y' | 'xy'} [axis] which axis to zoom (`xy`)
  * @property {number} [pinchSensitivity] pinch zoom sensitivity
  * where >1 is more sensitive and <1 is less sensitive (`1`)
  * @property {number} [wheelSensitivity] mouse wheel sensitivity
  * where >1 is more sensitive and <1 is less sensitive (`1`)
  * @property {TypeParsablePoint | number} [value] fix value to zoom on - will
  * override pinch or mouse wheel zoom location
  * @property {null | number} [min] minimum zoom where `null` is no limit
  * (`null`)
  * @property {null | number} [max] maximum zoom where `null` is no limit
  * (`null`)
 * @interface
 * @group Misc Shapes
 */
export type OBJ_PlotZoomOptions = {
  axis?: 'x' | 'y' | 'xy';
  wheelSensitivity?: number;
  pinchSensitivity?: number;
  value?: TypeParsablePoint | number;
  min?: null | number;
  max?: null | number;
};

/**
  * @property {'x' | 'y' | 'xy'} [axis] which axis to zoom (`xy`)
  * @property {number} [wheelSensitivity] mouse wheel sensitivity
  * where >1 is more sensitive and <1 is less sensitive (`1`)
  * @property {boolean} [wheel] enable mouse wheel to pan (`true`)
  * @property {boolean} [momentum] enable panning momentum (`true`)
  * @property {number} [maxVelocity] maximum panning velocity (`10`)
 * @interface
 * @group Misc Shapes
 */
export type OBJ_PlotPanOptions = {
  axis: 'x' | 'y' | 'xy';
  wheelSensitivity?: number;
  wheel?: boolean;
  momentum?: boolean;
  maxVelocity?: number;
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
 * @interface
 * @group Misc Shapes
 */
export type OBJ_PlotAxis = {
  location?: 'left' | 'right' | 'top' | 'bottom';
} & COL_Axis;

/**
 * Plot area label buffer where a positive value is more buffer
 * @property {number} [left]
 * @property {number} [right]
 * @property {number} [top]
 * @property {number} [bottom]
 * @interface
 * @group Misc Shapes
 */
export type OBJ_PlotAreaLabelBuffer = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export type OBJ_PlotAreaLabelBufferFixed = {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Plot title.
 *
 * {@link OBJ_TextLines}` & { offset: `{@link TypeParsablePoint}` }`
 *
 * Use `offset` to adjust the location of the title.
 * @interface
 * @group Misc Shapes
 */
export type OBJ_PlotTitle = OBJ_FormattedText & { offset: TypeParsablePoint };

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
 * @property {OBJ_PlotTitle | string} [title] plot title can be simply a
 * `string` or fully customized with OBJ_PlotTitle
 * @property {Array<COL_Trace | TypeParsablePoint> | COL_Trace | Array<TypeParsablePoint>} [trace]
 *  Use array if plotting more than one trace. Use COL_Trace to customize the
 *  trace.
 * @property {COL_PlotLegend | boolean} [legend] `true` to turn the legend on,
 * or use COL_PlotLegend to customize it's location and layout
 * @property {boolean | TypeColor | OBJ_PlotFrame} [frame] frame around the
 * plot can be turned on with `true`, can be a simple color fill using
 * `Array<number>` as a color, or can be fully customized with OBJ_PlotFrame
 * @property {TypeColor | COL_Rectangle} [plotArea] plot area can be a
 * color fill with `TypeColor` as a color, or be fully customized with
 * COL_Rectangle
 * @property {OBJ_Font} [font] Default font for plot (title, axes, labels, etc.)
 * @property {TypeColor} [color] Default color
 * @property {TypeParsablePoint} [position] Position of the plot
 * @property {OBJ_PlotZoomOptions | 'x' | 'y' | 'xy'} [zoom] options for
 * interactive zooming
 * @property {OBJ_PlotPanOptions | 'x' | 'y' | 'xy'} [pan] options for
 * interactive panning
 * @property {TypeParsablePoint} [cross] value where the default x and y
 * axes should cross. If defined, each `axis.position` will be overridden. If
 * the cross point is outside of the plot area, then the axes will be drawn on
 * the border of the plot area. (`undefined`)
 * @property {boolean | OBJ_PlotAreaLabelBuffer} [plotAreaLabels] if `true`
 * then axes with a cross point
 * will be drawn such that the labels stay within the plot area. So, if the
 * labels are on the left side of a y axis, and the cross point is out of the
 * plot area to the left, then instead of the axis being drawn on the left edge
 * of the plot area, it will be drawn within the plot area such that its labels
 * are within the plot area (`false`).
 * @property {boolean} [autoGrid] if `true` sets the grid for an axes to expand
 * accross the entire plot area. Set to `false` if only a partial length grid
 * is needed (`true`)
 * @property {'box' | 'numberLine' | 'positiveNumberLine'} [styleTheme] defines
 * default values for tick, label, axis locations and cross points. (`'box'`)
 * @property {'light' | 'dark'} [colorTheme] defines defaul colors. `'dark'`
 * theme is better on light backgrounds while '`light'` theme is better on dark
 * backgrounds (`'dark'`)
 * @property {OBJ_GestureArea} [gestureArea] the gesture area is the plot area
 * by default. Use this property to extend the gesture area beyond the plot
 * area. This is useful for the user to zoom in on areas on the edge of the
 * plot area.
 * @interface
 * @group 2D Shape Collections
 */
export type COL_Plot = {
  width?: number;
  height?: number;
  x?: OBJ_PlotAxis | boolean;
  y?: OBJ_PlotAxis | boolean;
  axes?: Array<OBJ_PlotAxis>;
  cross?: TypeParsablePoint | null;
  grid?: boolean;
  title?: string | OBJ_PlotTitle;
  trace?: Array<COL_Trace | TypeParsablePoint> | COL_Trace | Array<TypeParsablePoint>;
  legend?: COL_PlotLegend;
  frame?: boolean | TypeColor | OBJ_PlotFrame;
  plotArea?: TypeColor | COL_Rectangle;
  font?: OBJ_Font;
  color?: TypeColor;
  position?: TypeParsablePoint;
  zoom?: OBJ_PlotZoomOptions | 'x' | 'y' | 'xy';
  pan?: OBJ_PlotPanOptions | 'x' | 'y' | 'xy';
  gestureArea?: OBJ_GestureArea;
  autoGrid?: boolean;
  plotAreaLabels?: boolean | OBJ_PlotAreaLabelBuffer;
  styleTheme?: 'box' | 'numberLine' | 'positiveNumberLine';
  colorTheme?: 'light' | 'dark';
} & OBJ_Collection;

function cleanTraces(
  tracesIn: Array<COL_Trace | Array<TypeParsablePoint>> | COL_Trace | Array<TypeParsablePoint>,
): [Array<COL_Trace>, Rect] {
  let traces: Array<COL_Trace> = [];
  if (tracesIn == null) {
    return [
      [],
      new Rect(0, 0, 1, 1),
    ];
  }
  if (!Array.isArray(tracesIn)) {
    traces = [tracesIn];
  } else if (tracesIn.length === 0) {
    traces = [];
  } else if (isParsablePoint(tracesIn[0])) {
    traces = [{ points: tracesIn } as COL_Trace];
  } else {
    tracesIn.forEach((trace) => {
      if (!Array.isArray(trace)) {
        traces.push(trace as COL_Trace);
      } else {
        traces.push({ points: trace } as COL_Trace);
      }
    });
  }

  let firstPoint = true;
  let result = { min: new Point(0, 0), max: new Point(0, 0) };
  traces.forEach((trace) => {
    for (let i = 0; i < (trace as any).points.length; i += 1) {
      const p = getPoint((trace as any).points[i]);
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
 * {@link FigureElementCollection} representing a plot including axes, traces,
 * labels and titles.
 *
 * ![](./apiassets/advplot_ex1.png)
 *
 * ![](./apiassets/advplot_ex2.png)
 *
 * ![](./apiassets/advplot_ex3.png)
 *
 * ![](./apiassets/advplot_ex4.png)
 *
 * ![](./apiassets/advplot_ex5.png)
 *
 * ![](./apiassets/advplot_ex6.png)
 *
 * ![](./apiassets/advplot_zoom.gif)
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
 * Plots can also be interactive, with both zoom and pan functionality from
 * mouse, mouse wheel, touch and pinch gestures.
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
 * const pow = (pow = 2, start = 0, stop = 10, step = 0.05) => {
 *   const xValues = Fig.range(start, stop, step);
 *   return xValues.map(x => new Fig.Point(x, x ** pow));
 * }
 * ```
 * @example
 * // Plot of single trace with auto axis scaling
 * figure.add({
 *   make: 'collections.plot',
 *   trace: pow(),
 * });
 *
 * @example
 * // Multiple traces with a legend
 * // Some traces are customized beyond the default color to include dashes and
 * // markers
 * figure.add({
 *   make: 'collections.plot',
 *   width: 2,                                    // Plot width in figure
 *   height: 2,                                   // Plot height in figure
 *   y: { start: 0, stop: 50 },                   // Customize y axis limits
 *   trace: [
 *     { points: pow(1.5), name: 'Power 1.5' },   // Trace names are for legend
 *     {                                          // Trace with only markers
 *       points: pow(2, 0, 10, 0.5),
 *       name: 'Power 2',
 *       markers: { sides: 4, radius: 0.03 },
 *     },
 *     {                                          // Trace with markers and
 *       points: pow(3, 0, 10, 0.5),              // dashed line
 *       name: 'Power 3',
 *       markers: { radius: 0.03, sides: 10, line: { width: 0.005 } },
 *       line: { dash: [0.04, 0.01] },
 *     },
 *   ],
 *   legend: true,
 * });
 *
 * @example
 * // Multiple grids and simple titles
 * figure.add({
 *   make: 'collections.plot',
 *   y: {
 *     start: -50,
 *     stop: 50,
 *     step: [25, 5],
 *     grid: [
 *       true,
 *       { width: 0.005, dash: [0.01, 0.01], color: [1, 0.7, 0.7, 1] },
 *     ],
 *     title: 'velocity (m/s)',
 *   },
 *   x: {
 *     start: -5,
 *     stop: 5,
 *     step: [2.5, 0.5, 0.1],
 *     grid: [
 *       true,
 *       { width: 0.005, dash: [0.01, 0.01], color: [1, 0.7, 0.7, 1] },
 *     ],
 *     title: 'time (s)',
 *   },
 *   trace: pow(3, -10, 10),
 *   title: 'Velocity over Time',
 * });
 *
 * @example
 * // Hide axes
 * // Use plot frame and plot area
 * // Title has a subtitle
 * figure.add({
 *   make: 'collections.plot',
 *   trace: pow(3),
 *   x: { show: false },
 *   y: { show: false },
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
 *   },
 * });
 *
 * @example
 * // Secondary y axis
 * figure.add({
 *   make: 'collections.plot',
 *   trace: pow(2),
 *   y: {
 *     title: {
 *       text: 'velocity (m/s)',
 *       rotation: 0,
 *       xAlign: 'right',
 *     },
 *   },
 *   x: { title: 'time (s)' },
 *   axes: [
 *     {
 *       axis: 'y',
 *       start: 0,
 *       stop: 900,
 *       step: 300,
 *       color: [1, 0, 0, 1],
 *       location: 'right',
 *       title: {
 *         offset: [0.6, 0.1],
 *         text: 'displacment (m)',
 *         rotation: 0,
 *       },
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
 *   make: 'collections.plot',
 *   trace: pow(3, -10, 10),
 *   font: { size: 0.1 },
 *   styleTheme: 'numberLine',
 *   x: {
 *     title: {
 *       text: 'x',
 *       font: { style: 'italic', family: 'Times New Roman', size: 0.15 },
 *     },
 *   },
 *   y: {
 *     step: 500,
 *     title: {
 *       text: 'y',
 *       font: { style: 'italic', family: 'Times New Roman', size: 0.15 },
 *     },
 *   },
 *   grid: false,
 * });
 *
 * @example
 * // Zoomable and Pannable plot
 *
 * // Create the points for the plot
 * const points = Array(3000).fill(0).map(() => {
 *   const x = Math.random() * 8 - 4;
 *   const y = Math.random() / Math.sqrt(2 * Math.PI) * Math.exp(-0.5 * x ** 2);
 *   return [x, y];
 * });
 *
 * // Make a zoomable and pannable plot
 * const plot = figure.add({
 *   make: 'collections.plot',
 *   trace: { points, markers: { sides: 6, radius: 0.01 } },
 *   zoom: { axis: 'xy', min: 0.5, max: 16 },
 *   pan: true,
 * });
 *
 * // Initialize by zooming in by a magnification factor of 10
 * plot.zoomValue([1.8333, 0.06672], 10);
 *
 * @group 2D Shape Collections
 */
class CollectionsPlot extends FigureElementCollection {
  // Figure elements
  // _axis: CollectionsAxis | null | undefined;
  // _majorTicks: FigureElementPrimitive | null | undefined;
  // _minorTicks: FigureElementPrimitive | null | undefined;
  // _labels: FigureElementPrimitive | null | undefined;
  // _arrow1: FigureElementPrimitive | null | undefined;
  // _arrow2: FigureElementPrimitive | null | undefined;
  _x: CollectionsAxis | null | undefined;
  _y: CollectionsAxis | null | undefined;
  __frame: CollectionsRectangle | null | undefined;

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
  frameSpace: number | null | undefined;
  zoom: {
    x: boolean;
    y: boolean;
    enabled: boolean;
    min: null | number;
    max: null | number;
  };

  pan: {
    x: boolean;
    y: boolean;
    enabled: boolean;
  };

  autoGrid: boolean;
  plotAreaLabels: boolean | OBJ_PlotAreaLabelBufferFixed;
  forceColor: null | TypeColor;
  zoomPoint: null | Point;

  gestureArea: {
    left: number;
    bottom: number;
    top: number;
    right: number;
  };

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
    const defaultOptions: Record<string, any> = {
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
      gestureArea: {
        left: 0, bottom: 0, top: 0, right: 0,
      },
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
    const options = joinObjects<any>({}, defaultOptions, optionsIn);
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
    this.forceColor = null;
    if (optionsIn.color != null) {
      this.forceColor = optionsIn.color;
    }
    const colorTheme = this.getColorTheme(options.colorTheme);
    const styleTheme = this.getStyleTheme(options.styleTheme);
    if (optionsIn.font == null || optionsIn.font.color == null) {
      if (optionsIn.color == null) {
        this.defaultFont.color = (colorTheme as any).color;
      } else {
        this.defaultFont.color = this.defaultColor;
      }
    }
    this.gestureArea = options.gestureArea;
    this.width = options.width;
    this.height = options.height;
    this.colorTheme = options.colorTheme;
    this.styleTheme = options.styleTheme;
    this.grid = options.grid;
    this.zoomPoint = null;
    this.cross = options.cross;
    if (this.cross == null && (styleTheme as any).cross) {
      this.cross = getPoint((styleTheme as any).cross);
    }
    this.autoGrid = options.autoGrid;
    if (optionsIn.autoGrid == null && (styleTheme as any).autoGrid != null) {
      this.autoGrid = (styleTheme as any).autoGrid;
    }
    this.plotAreaLabels = options.plotAreaLabels;
    if (typeof this.plotAreaLabels === 'object') {
      this.plotAreaLabels = joinObjects<any>(
        {}, {
          left: 0, right: 0, bottom: 0, top: 0,
        }, this.plotAreaLabels,
      );
    }
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

    this.addAxes([joinObjects<any>(
      {},
      { axis: 'x', name: 'x', auto: [bounds.left, bounds.right] },
      this.grid === false ? { grid: [] } : {},
      options.x != null ? options.x : {},
    )]);
    this.addAxes([joinObjects<any>(
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

    this.zoom = {
      enabled: false, x: false, y: false, min: null, max: null,
    };
    this.pan = {
      enabled: false, x: false, y: false,
    };
    if (
      (options.zoom != null && options.zoom !== false)
      || (options.pan != null && options.pan !== false)
    ) {
      this.addGestureRectangle(options.zoom, options.pan, options.x, options.y);
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
      let left = 0;
      let right = 0;
      let bottom = 0;
      let top = 0;
      if (!(typeof this.plotAreaLabels === 'boolean')) {
        ({
          left, right, bottom, top,
        } = this.plotAreaLabels);
      }
      if ((_x as any)._labels != null) {
        const labelRect = (_x as any)._labels.getBoundingRect();
        yMin = Math.max(yMin, -labelRect.bottom + bottom);
        yMax = Math.min(yMax, this.height - labelRect.top - top);
      }
      if ((_x as any)._ticks0) {
        const ticksRect = (_x as any)._ticks0.getBoundingRect();
        yMin = Math.max(yMin, -ticksRect.bottom + bottom);
        yMax = Math.min(yMax, this.height - ticksRect.top - top);
      }
      if ((_y as any)._labels != null) {
        const labelRect = (_y as any)._labels.getBoundingRect();
        xMin = Math.max(xMin, -labelRect.left + left);
        xMax = Math.min(xMax, this.width - labelRect.right - right);
      }
      if ((_y as any)._ticks0) {
        const ticksRect = (_y as any)._ticks0.getBoundingRect();
        xMin = Math.max(xMin, -ticksRect.left + left);
        xMax = Math.min(xMax, this.width - ticksRect.right - right);
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
        if (axis.axis === 'x' && (axis as any).showAxis) {
          (axis as any).grid.forEach((g: any, i: number) => {
            if (g) {
              (axis as any)[`_grid${i}`].setPosition(0, -p.y);
            }
          });
        } else if (axis.axis === 'y' && (axis as any).showAxis) {
          (axis as any).grid.forEach((g: any, i: number) => {
            if (g) {
              (axis as any)[`_grid${i}`].setPosition(-p.x, 0);
            }
          });
        }
      });
    }
  }

  showGrid() {
    this.axes.forEach(axis => (axis as any).showGrid());
  }

  hideGrid() {
    this.axes.forEach(axis => (axis as any).hideGrid());
  }

  getNonTraceBoundingRect() {
    const children: Array<string> = [];
    Object.keys(this.elements).forEach((elementName) => {
      if (!elementName.startsWith('trace')) {
        children.push(elementName);
      }
    });
    return this.getBoundingRect('draw', 'border', children);
  }

  addAxes(axes: Array<OBJ_PlotAxis>) {
    const defaultOptions: Record<string, any> = {
      color: this.defaultColor,
      font: this.defaultFont,
      axis: 'x',
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
      // const theme = this.getTheme(this.theme, axisType, axisOptions.color);
      // if (this.forceColor) { forceColor = { color: this.forceColor }; }
      const theme: Record<string, any> = joinObjects<any>(
        {},
        this.getStyleTheme(this.styleTheme, axisType, axisOptions.location),
        this.getColorTheme(this.colorTheme, axisOptions.color || this.forceColor),
      );

      const show = axisType === 'x' ? this.xAxisShow : this.yAxisShow;
      defaultOptions.show = show;
      const o = joinObjects<any>({}, defaultOptions, theme.axis, axisOptions);
      if (
        axisOptions.color != null
        && (axisOptions.font == null || axisOptions.font.color == null)
      ) {
        o.font.color = axisOptions.color;
      }
      if (typeof axisOptions.ticks === 'string') {
        o.ticks = joinObjects<any>({}, theme.axis.ticks, { location: axisOptions.ticks });
      }
      if (typeof axisOptions.labels === 'string') {
        o.labels = joinObjects<any>({}, theme.axis.labels, { location: axisOptions.labels });
      }
      if (typeof axisOptions.title === 'string') {
        o.title = joinObjects<any>({}, theme.axis.title, { text: axisOptions.title });
      }
      if (axisOptions.step == null) {
        if (axisOptions.start != null) {
          o.auto[0] = axisOptions.start;
        }
        if (axisOptions.stop != null) {
          o.auto[1] = axisOptions.stop;
        }
      }
      if (Array.isArray(o.grid)) {
        for (let i = 0; i < o.grid.length; i += 1) {
          o.grid[i] = joinObjects<any>({}, theme.axis.grid, o.grid[i]);
        }
      }
      if (Array.isArray(o.ticks)) {
        for (let i = 0; i < o.ticks.length; i += 1) {
          o.ticks[i] = joinObjects<any>({}, theme.axis.ticks, o.ticks[i]);
        }
      }
      if (o.name == null) {
        o.name = `axis_${this.axes.length}`;
      }
      const axis = (this.collections as any).axis(o);
      this.add(o.name, axis as any);
      this.axes.push(axis);
    });
  }

  addPlotArea(plotArea: Array<number> | COL_Rectangle) {
    const defaultOptions: Record<string, any> = {
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
      o = joinObjects<any>({}, defaultOptions, plotArea);
    }
    this.add('_plotArea', (this.collections as any).rectangle(o) as any);
    (this as any).__plotArea.getAllPrimitives().forEach((e: any) => { e.drawNumber = -1; });
  }

  addGestureRectangle(
    zoomOptions: OBJ_PlotZoomOptions | 'xy' | 'x' | 'y' | false,
    panOptions: OBJ_PlotPanOptions | 'xy' | 'x' | 'y' | false,
    xAxis: OBJ_PlotAxis,
    yAxis: OBJ_PlotAxis,
  ) {
    const options: Record<string, any> = {
      width: this.width + this.gestureArea.right - this.gestureArea.left,
      height: this.height + this.gestureArea.top - this.gestureArea.bottom,
      xAlign: 'left',
      yAlign: 'bottom',
      position: [this.gestureArea.left, this.gestureArea.bottom],
    };
    if (zoomOptions != null && zoomOptions !== false) {
      const defaultOptions: Record<string, any> = {
        axis: typeof zoomOptions === 'string' ? zoomOptions : 'xy',
        wheelSensitivity: 1,
        pinchSensitivity: 1,
        value: null,
        min: null,
        max: null,
      };
      let zOptions: Record<string, any>;
      if (typeof zoomOptions === 'string') {
        zOptions = defaultOptions;
      } else {
        zOptions = joinObjects<any>({}, defaultOptions, zoomOptions);
      }
      if (zOptions.value != null) {
        if (typeof zOptions.value === 'number') {
          this.zoomPoint = getPoint([zOptions.value, zOptions.value]);
        } else {
          this.zoomPoint = getPoint(zOptions.value);
        }
      }
      joinObjects<any>(options, { zoom: zOptions });
      this.zoom.enabled = true;
      this.zoom.x = zOptions.axis.startsWith('x');
      this.zoom.y = zOptions.axis.endsWith('y');
      this.zoom.min = zOptions.min;
      this.zoom.max = zOptions.max;
      options.zoom.min = null;
      options.zoom.max = null;
    }
    if (panOptions != null && panOptions !== false) {
      const defaultOptions: Record<string, any> = {
        axis: typeof panOptions === 'string' ? panOptions : 'xy',
        wheelSensitivity: 1,
        wheel: true,
        maxVelocity: 10,
        momentum: true,
      };
      let pOptions: Record<string, any>;
      if (typeof panOptions === 'string') {
        pOptions = defaultOptions;
      } else {
        pOptions = joinObjects<any>({}, defaultOptions, panOptions);
      }
      joinObjects<any>(options, { pan: pOptions });
      this.pan.enabled = true;
      this.pan.x = pOptions.axis.startsWith('x');
      this.pan.y = pOptions.axis.endsWith('y');
    }
    if (
      (this.zoom.x || this.pan.x)
      && this._x != null
      && xAxis != null && (xAxis as any).autoStep == null
    ) {
      (this._x as any).autoStep = 'decimal';
      this._x.update();
    }
    if (
      (this.zoom.y || this.pan.y)
      && this._y != null
      && yAxis != null && (yAxis as any).autoStep == null
    ) {
      (this._y as any).autoStep = 'decimal';
      this._y.update();
    }
    const gesture = (this.collections as any).primitives.gesture(options);
    gesture.notifications.add('zoom', () => {
      if (!this.zoom.enabled) {
        return;
      }
      const z = gesture.getZoom();
      const totWidth = this.width + this.gestureArea.right - this.gestureArea.left;
      const totHeight = this.height + this.gestureArea.top - this.gestureArea.bottom;
      const p = this.drawToPoint(new Point(
        z.current.normPosition.x * totWidth + this.gestureArea.left,
        z.current.normPosition.y * totHeight + this.gestureArea.bottom,
      ));
      this.zoomDelta(p, z.mag / z.last.mag);
      gesture.reset(true);
    });
    gesture.notifications.add('pan', () => {
      if (!this.pan.enabled) {
        return;
      }
      const z = gesture.getZoom();
      const p = gesture.getPan();
      this.panDeltaDraw(p.delta.scale(-z.mag));
      gesture.reset(true);
    });
    this.add('_gesture', gesture as any);
  }

  addFrame(frameIn: OBJ_PlotFrame | true | TypeColor) {
    let frame: any = frameIn;
    if (typeof frame === 'boolean') {
      frame = { line: { width: (this.collections as any).primitives.defaultLineWidth } };
    } else if (Array.isArray(frame)) {
      frame = { fill: frameIn };
    }
    const space = frame.space != null && typeof frame.space === 'number'
      ? frame.space
      : Math.min(this.width, this.height) / 20;
    const defaultOptions: Record<string, any> = {
      width: 0,
      height: 0,
      xAlign: 'left',
      yAlign: 'bottom',
      position: [0, 0],
      space,
    };
    const o = joinObjects<any>({}, defaultOptions, frame);
    this.frameSpace = o.space;

    this.add('_frame', (this.collections as any).rectangle(o) as any);
    this.toBack(this.__frame as any);
    (this.__frame as any).getAllPrimitives().forEach((e: any) => { e.drawNumber = -1; });
    this.notifications.add('setFigure', () => {
      (this.__frame as any).surround(this, this.frameSpace);
    });
    this.getAtlases(() => this.update());
  }

  override fontUpdated() {
    super.fontUpdated();
    this.update();
  }

  update() {
    let elements = this.getChildren();
    elements = elements.filter(e => e.name !== '_frame');
    if (this.__frame != null) {
      (this.__frame as any).surround(elements, this.frameSpace, false);
    }
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
    const defaultOptions: Record<string, any> = {
      traces: this.traces,
      lineTextSpace: this.width / 50,
      length: this.width / 10,
      position: [this.width + this.width / 20, this.height],
      font: this.defaultFont,
    };
    // const theme = this.getTheme(this.theme).legend;
    const theme: Record<string, any> = joinObjects<any>(
      {}, this.getStyleTheme(this.styleTheme),
      this.getColorTheme(this.colorTheme, this.forceColor),
    );
    const o = joinObjects<any>({}, defaultOptions, theme.legend, optionsIn);
    const legend = (this.collections as any).plotLegend(o);
    this.add('_legend', legend as any);
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

  /**
   * Convert a plot point value on the axes `yAxisName` and `xAxisName` to
   * a plot draw space position.
   *
   * The plot draw space is (0, 0) at the bottom
   * left of the plot area and extends to (`width`, `height`) in the top right
   * corner of the plot area where `width` and `height` are defined when
   * creating the plot.
   * @param {TypeParsablePoint} point
   * @param {string = 'x'} xAxisName
   * @param {string = 'y'} yAxisName
   */
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

  /**
   * Convert a plot draw space position to a plot point value on the axes
   * `yAxisName` and `xAxisName`.
   *
   * The plot draw space is (0, 0) at the bottom
   * left of the plot area and extends to (`width`, `height`) in the top right
   * corner of the plot area where `width` and `height` are defined when
   * creating the plot.
   * @param {TypeParsablePoint} drawSpacePoint
   * @param {string = 'x'} xAxisName
   * @param {string = 'y'} yAxisName
   */
  drawToPoint(
    drawSpacePoint: TypeParsablePoint,
    xAxisName: string = 'x',
    yAxisName: string = 'y',
  ) {
    const xAxis = this.getAxis(xAxisName);
    const yAxis = this.getAxis(yAxisName);
    if (xAxis == null || yAxis == null) {
      throw new Error(`Plot.drawToPoint Error: Both xAxis and yAxis need to be defined. xAxis: ${JSON.stringify(xAxis)}, yAxis: ${JSON.stringify(yAxis)}`);
    }
    const p = getPoint(drawSpacePoint);
    return new Point(xAxis.drawToValue(p.x), yAxis.drawToValue(p.y));
  }

  /**
   * Set a figure element's position to the position in the figure where some
   * point on the plot is.
   * @param {FigureElement} element
   * @param {TypeParsablePoint} point
   */
  setElementTo(
    element: FigureElement,
    point: TypeParsablePoint,
  ) {
    const figurePosition = this.pointToDraw(point).transformBy(this.spaceTransformMatrix('draw', 'figure'));
    element.setFigurePosition(figurePosition);
  }

  /**
   * Get the plot value where some element is.
   * @param {FigureElement} element
   */
  getPointAtElement(element: FigureElement) {
    return this.drawToPoint(
      element.getPosition('figure')
        .transformBy(this.spaceTransformMatrix('figure', 'draw')),
    );
  }

  addTraces(traces: Array<COL_Trace>) {
    const theme: Record<string, any> = this.getColorTheme(this.colorTheme, this.forceColor);
    traces.forEach((traceOptions, index) => {
      const defaultOptions: Record<string, any> = {
        xAxis: 'x',
        yAxis: 'y',
        color: theme.traceColors[index % theme.traceColors.length],
      };
      const o = joinObjects<any>({}, defaultOptions, traceOptions);
      if (o.name == null) {
        o.name = `trace_${index}`;
      }
      o.xAxis = this.getAxis(o.xAxis);
      o.yAxis = this.getAxis(o.yAxis);

      const trace = (this.collections as any).trace(o);
      this.add(o.name, trace as any);
      this.traces.push(trace);
    });
  }

  updateTraces() {
    for (let i = 0; i < this.traces.length; i += 1) {
      (this.traces[i] as any).updateAxes();
    }
  }

  getStyleTheme(
    name: string,
    axis: 'x' | 'y' = 'x',
    location: null | 'left' | 'bottom' | 'right' | 'top' | undefined = null,
  ): Record<string, any> {
    // const length = axis === 'x' ? this.width : this.height;
    const gridLength = axis === 'x' ? this.height : this.width;
    const lineWidth = (this.collections as any).primitives.defaultLineWidth;
    const tickLength = lineWidth * 5;
    let theme: Record<string, any> = {};
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
            arrow: { end: { head: 'barb', scale: 0.8 } },
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
      if (name === 'numberLine') {
        theme.axis.labels.hide = [0];
        theme.axis.line.arrow = { head: 'barb', scale: 0.8 };
      }
    }
    return theme;
  }

  // eslint-disable-next-line class-methods-use-this
  getColorTheme(name: string, defaultColor: TypeColor | null = null): Record<string, any> {
    let theme: Record<string, any> = {};
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
          [1, 1, 0.2, 1],
          [1, 0.3, 0.3, 1],
          [0.3, 1, 0.3, 1],
          [0.3, 1, 1, 1],
          [1, 0.3, 1, 1],
          [1, 0.7, 0.5, 1],
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
  //     if (this.grid === false) {
  //       delete theme.axis.grid;
  //       // theme.axis.grid = undefined;
  //     } else if (typeof this.grid === 'object' || Array.isArray(this.grid)) {
  //       theme.axis.grid = joinObjects({}, theme.axis.grid, this.grid);
  //     }
  //   }
  //   return theme;
  // }

  addTitle(optionsIn: OBJ_FormattedText & { offset: TypeParsablePoint } | string) {
    const defaultOptions: Record<string, any> = {
      font: joinObjects<any>({}, this.defaultFont, { size: this.defaultFont.size * 1.5 }),
      justify: 'center',
      xAlign: 'center',
      yAlign: 'bottom',
      offset: [0, 0],
    };
    let optionsToUse: any = optionsIn;
    if (typeof optionsIn === 'string') {
      optionsToUse = { text: [optionsIn] };
    }
    const theme = (this.getColorTheme(this.colorTheme, this.forceColor) as any).title;
    const o = joinObjects<any>({}, defaultOptions, theme, optionsToUse);
    o.offset = getPoint(o.offset);
    const bounds = this.getNonTraceBoundingRect();
    if (o.position == null) {
      o.position = new Point(
        this.width / 2 + o.offset.x,
        bounds.top + o.font.size * 0.5 + o.offset.y,
      );
    }
    const title = (this.collections as any).text(o);
    this.add('title', title as any);
  }

  panDeltaValue(deltaValueIn: TypeParsablePoint) {
    const deltaValue = getPoint(deltaValueIn);
    const x = this.getXAxis();
    if (x != null && this.pan.enabled && this.pan.x) {
      (x as any).panDeltaValue(deltaValue.x);
    }
    const y = this.getYAxis();
    if (y != null && this.pan.enabled && this.pan.y) {
      (y as any).panDeltaValue(deltaValue.y);
    }
    this.updateTraces();
    this.setupCross();
    this.notifications.publish('update');
    this.notifications.publish('pan');
  }

  panDeltaDraw(deltaDrawIn: TypeParsablePoint) {
    const deltaDraw = getPoint(deltaDrawIn);
    const x = this.getXAxis();
    if (x != null && this.pan.enabled && this.pan.x) {
      (x as any).panDeltaDraw(deltaDraw.x);
    }
    const y = this.getYAxis();
    if (y != null && this.pan.enabled && this.pan.y) {
      (y as any).panDeltaDraw(deltaDraw.y);
    }
    this.updateTraces();
    this.setupCross();
    this.notifications.publish('update');
    this.notifications.publish('pan');
  }

  panToValue(value: TypeParsablePoint, atDraw: TypeParsablePoint) {
    const v = getPoint(value);
    const d = getPoint(atDraw);
    const x = this.getXAxis();
    const y = this.getYAxis();
    if (x != null && this.pan.enabled && this.pan.x) {
      (x as any).pan(v.x, d.x);
    }
    if (y != null && this.pan.enabled && this.pan.y) {
      (y as any).pan(v.y, d.y);
    }
    this.updateTraces();
    this.setupCross();
    this.notifications.publish('update');
    this.notifications.publish('pan');
  }

  zoomValue(valueIn: TypeParsablePoint, mag: number) {
    const value = getPoint(valueIn);
    const x = this.getXAxis();
    const m = clipValue(mag, this.zoom.min, this.zoom.max);
    if (x != null && this.zoom.enabled && this.zoom.x) {
      const v = this.zoomPoint != null ? this.zoomPoint.x : value.x;
      (x as any).zoomValue(v, m);
    }
    const y = this.getYAxis();
    if (y != null && this.zoom.enabled && this.zoom.y) {
      const v = this.zoomPoint != null ? this.zoomPoint.y : value.y;
      (y as any).zoomValue(v, m);
    }
    this.updateTraces();
    this.setupCross();
    this.notifications.publish('update');
    this.notifications.publish('zoom');
  }

  zoomDelta(valueIn: TypeParsablePoint, magDelta: number) {
    const value = getPoint(valueIn);
    const x = this.getXAxis();
    if (x != null && this.zoom.enabled && this.zoom.x) {
      const v = this.zoomPoint != null ? this.zoomPoint.x : value.x;
      const m = clipValue((x as any).currentZoom * magDelta, this.zoom.min, this.zoom.max);
      (x as any).zoomDelta(v, m / (x as any).currentZoom);
    }
    const y = this.getYAxis();
    if (y != null && this.zoom.enabled && this.zoom.y) {
      const v = this.zoomPoint != null ? this.zoomPoint.y : value.y;
      const m = clipValue((y as any).currentZoom * magDelta, this.zoom.min, this.zoom.max);
      (y as any).zoomDelta(v, m / (y as any).currentZoom);
    }
    this.updateTraces();
    this.setupCross();
    this.notifications.publish('update');
    this.notifications.publish('zoom');
  }

  /**
   * Get the current zoom.
   * @return {number}
   */
  getZoom() {
    const x = this.getXAxis();
    if (x != null && this.zoom.enabled && this.zoom.x) {
      return (x as any).currentZoom;
    }
    const y = this.getYAxis();
    if (y != null && this.zoom.enabled && this.zoom.y) {
      return (y as any).currentZoom;
    }
    return 1;
  }

  /**
   * Get the current pan.
   * @return {Point}
   */
  getPan() {
    const pan = new Point(0, 0);
    const x = this.getXAxis();
    if (x != null && this.pan.enabled && this.pan.x) {
      pan.x = -((x as any).startValue - (x as any).initialStart / (x as any).currentZoom);
    }
    const y = this.getYAxis();
    if (y != null && this.pan.enabled && this.pan.y) {
      pan.y = -((y as any).startValue - (y as any).initialStart / (y as any).currentZoom);
    }
    return pan;
  }
}

export default CollectionsPlot;
