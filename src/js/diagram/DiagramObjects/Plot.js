// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point,
  getPoint, getTransform, getPoints, getBoundingRect,
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

export type ADV_Plot = {
  width?: number,
  height?: number,
  position?: TypeParsablePoint, // collection position
  axes?: Array<ADV_Axis>,
  xAxis?: ADV_Axis | boolean,
  yAxis?: ADV_Axis | boolean,
  grid?: boolean,
  title?: OBJ_Text,
  traces?: Array<ADV_Trace>,
  font?: OBJ_Font,
  xAlign?: 'left' | 'center' | 'right',
  yAlgin?: 'bottom' | 'middle' | 'top',
  legend?: {
    position?: TypeParsablePoint,
    xAlign?: 'left' | 'center' | 'right',
    yAlgin?: 'bottom' | 'middle' | 'top',
  },
  frame?: ADV_Rectangle | { space: number },
  plotArea?: Array<number> | OBJ_Texture,
};

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
      grid: false,
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

    const points = [];
    options.traces.forEach((trace) => {
      for (let i = 0; i < trace.points.length; i += 1) {
        points.push(getPoint(trace.points[i]));
      }
    });
    const bounds = getBoundingRect(points);

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
    if (options.traces != null) {
      this.addTraces(options.traces);
    }
    if (options.title != null) {
      this.addTitle(options.title);
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
      const theme = this.getTheme(this.theme, axisType);
      const show = axisType === 'x' ? this.xAxisShow : this.yAxisShow;
      defaultOptions.show = show;
      const o = joinObjects({}, defaultOptions, theme.axis, axisOptions);
      if (o.name == null) {
        o.name = `axis_${this.axes.length}`;
      }
      const axis = this.advanced.axis(o);
      this.add(o.name, axis);
      this.axes.push(axis);
    });
  }

  addPlotArea(plotArea: Array<number> | OBJ_Texture) {
    const o = {
      width: this.width,
      height: this.height,
      xAlign: 'left',
      yAlign: 'bottom',
      position: [0, 0],
    };
    if (Array.isArray(plotArea)) {
      o.color = plotArea;
    } else {
      o.texture = plotArea;
    }
    this.add('_plotArea', this.shapes.rectangle(o));
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
      optionsIn = { line: { width: 0.01 } };
    }
    const o = joinObjects({}, defaultOptions, optionsIn);
    this.frameSpace = o.space;
    this.add('_frame', this.advanced.rectangle(o));
  }

  // addLegend(legend: {
  //   font: OBJ_Font,
  //   textIsTraceColor: boolean,
  //   textOnly: boolean,
  //   position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | TypeParsablePoint,
  //   columns: boolean,
  //   offset: TypeParsablePoint,
  //   length: number,
  //   box: ADV_Rectangle,
  // }) {
    
  //   this.traces.forEach((trace) => {

  //   })
  // }

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
    const defaultOptions = {
      xAxis: this.getAxis('x') != null ? 'x' : 0,
      yAxis: this.getAxis('y') != null ? 'y' : 1,
      color: this.defaultColor,
    };
    traces.forEach((traceOptions) => {
      const o = joinObjects({}, defaultOptions, traceOptions);
      if (o.name == null) {
        o.name = `${this.traces.length}`;
      }
      o.xAxis = this.getAxis(o.xAxis);
      o.yAxis = this.getAxis(o.yAxis);

      const trace = this.advanced.trace(o);
      this.add(`trace_${this.traces.length}`, trace);
      this.traces.push(trace);
    });
  }

  getTheme(name: string, axis: 'x' | 'y' = 'x') {
    const length = axis === 'x' ? this.width : this.height;
    const gridLength = axis === 'x' ? this.height : this.width;

    const minDimension = Math.min(this.shapes.limits.width, this.shapes.limits.height);

    let theme = {};
    if (name === 'classic') {
      const color = [0.35, 0.35, 0.35, 1];
      const tickLength = Math.min(this.width, this.height) / 30;
      const gridDash = minDimension / 500;
      theme = {
        axis: {
          color,
          line: { width: 0.01 },
          ticks: {
            width: 0.005,
            length: tickLength,
            offset: -tickLength,
          },
          font: {
            color,
          },
          length,
          grid: {
            color,
            width: 0.003,
            length: gridLength,
            dash: [gridDash, gridDash],
          },
        },
        title: {
          font: { color },
        },
      };
    }

    if (theme.axis != null && theme.axis.grid != null) {
      if (this.grid === false) {
        theme.axis.grid = undefined;
      } else if (typeof this.grid === 'object') {
        theme.axis.grid = joinObjects({}, theme.axis.grid, this.grid);
      }
    }
    return theme;
  }

  addTitle(optionsIn: OBJ_TextLines & { offset: TypeParsablePoint } | string) {
    const defaultOptions = {
      font: joinObjects({}, this.defaultFont, { size: this.defaultFont.size * 2 }),
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
      o.position = new Point(this.width / 2, bounds.top + o.font.size * 1);
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
