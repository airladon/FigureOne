// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point,
  getPoint, getTransform, getPoints, getBoundingRect, parsePoint,
  comparePoints, Rect,
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
import type { ADV_Trace } from './Trace';
import type { ADV_PlotLegend } from './Legend';


/**
 * {@link AdvancedPlot} options object.
 *
 * A plot is a collection of axes and traces, and may include a title and
 * legend.
 */
export type ADV_Plot = {
  width?: number,
  height?: number,
  position?: TypeParsablePoint, // collection position
  axes?: Array<ADV_Axis>,
  xAxis?: ADV_Axis | boolean,
  yAxis?: ADV_Axis | boolean,
  grid?: boolean,
  title?: OBJ_Text & { offset: TypeParsablePoint },
  trace?: Array<ADV_Trace> | ADV_Trace | Array<Point>,
  font?: OBJ_Font,
  legend?: ADV_PlotLegend,
  frame?: boolean | Array<number> | ADV_Rectangle & { space: number },
  plotArea?: Array<number> | ADV_Rectangle,
};

function cleanTraces(
  tracesIn: Array<ADV_Trace | Array<TypeParsablePoint>> | ADV_Trace | Array<TypeParsablePoint>,
) {
  let traces = [];
  // debugger;
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
      width: shapes.limits.width / 2,
      height: shapes.limits.width / 2,
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
      this.__frame.surround(this, this.frameSpace); //this.frame.space);
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
      console.log(o)
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
      length: this.width / 15,
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
        xAxis: this.getAxis('x') != null ? 'x' : 0,
        yAxis: this.getAxis('y') != null ? 'y' : 1,
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
