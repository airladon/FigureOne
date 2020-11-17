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
  xAxis?: ADV_Axis,
  yAxis?: ADV_Axis,
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
};

// function getTheme(name: string, length: number, axis: 'x' | 'y') {
//   if (name === 'classic') {
//     const color = [0.35, 0.35, 0.35, 1];
//     const tLength = length / 20;
//     return {
//       axis: {
//         color,
//         ticks: {
//           width: 0.005,
//           length: tLength,
//           offset: -tLength,
//         },
//         font: {
//           color,
//         },
//       },
//       grid: {
//         color,
//         width: 0.003,
//       },
//     };
//   }
//   return {};
// }

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
    if (options.xAxis != null) {
      this.addAxes([options.xAxis], 'x', bounds);
    }
    if (options.yAxis != null) {
      this.addAxes([options.yAxis], 'y', bounds);
    }
    if (options.axes != null) {
      this.addAxes(options.axes, null, bounds);
    }
    if (this.getXAxis() == null) {
      this.addAxes([{
        axis: 'x', name: 'x', auto: [bounds.left, bounds.right],
      }]);
    }
    if (this.getYAxis() == null) {
      this.addAxes([{
        axis: 'y', name: 'y', auto: [bounds.bottom, bounds.top],
      }]);
    }
    if (options.traces != null) {
      this.addTraces(options.traces);
    }
  }

  addAxes(axes: Array<ADV_Axis>, type: 'x' | 'y' | null) {
    const defaultOptions = {
      color: this.defaultColor,
      font: this.defaultFont,
      type: 'x',
    };
    if (type != null) {
      defaultOptions.axis = type;
      defaultOptions.name = type;
    }
    axes.forEach((axisOptions) => {
      // let theme = {};
      let axisType;
      if (axisOptions.axis != null) {
        axisType = axisOptions.axis;
      } else if (defaultOptions.axis != null) {
        axisType = defaultOptions.axis;
      }
      const theme = this.getTheme(this.theme, axisType);
      const o = joinObjects({}, defaultOptions, theme.axis, axisOptions);
      if (o.name == null) {
        o.name = `axis_${this.axes.length}`;
      }
      if (axisOptions.length == null) {
        o.length = o.axis === 'x' ? this.width : this.height;
      }
      const axis = this.advanced.axis(o);
      this.add(o.name, axis);
      this.axes.push(axis);
    });
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

  getTheme(name: string, axis: 'x' | 'y') {
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
