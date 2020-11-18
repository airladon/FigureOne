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
import type { ADV_PlotLegend } from './Legend';


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
  legend?: ADV_PlotLegend,
  frame?: ADV_Rectangle & { space: number },
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
      optionsIn = { line: { width: this.shapes.defaultLineWidth } };
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

  // addLegend(legendOptions: {
  //   length?: number, // 0 = text only
  //   font?: OBJ_Font,
  //   fontColorIsLineColor?: boolean,
  //   lineTextSpace?: number,
  //   offset?: Array<TypeParsablePoint> | TypeParsablePoint,
  //   frame?: ADV_Rectangle & { space: number },
  //   custom?: {
  //     [arrayNumberOrName: string]: {
  //       font?: OBJ_Font,
  //       length?: number,
  //       offset?: TypeParsablePoint,
  //       lineTextSpace?: number,
  //       fontColorIsLineColor?: boolean,
  //       text?: OBJ_TextLines,
  //       position?: TypeParsablePoint,
  //     },
  //   },
  //   position?: TypeParsablePoint,
  //   xAlign?: 'left' | 'center' | 'right' | number,
  //   yAlgin?: 'bottom' | 'middle' | 'top' | number,
  //   space?: number,
  //   show?: Array<number | string>,
  //   hide?: Array<number | string>,
  // }) {
  //   const defaultOptions = {
  //     font: this.defaultFont,
  //     xAlign: 'left',
  //     yAlign: 'middle',
  //     fontColorIsLineColor: false,
  //     frame: false,
  //     custom: {},
  //     length: this.width / 15,
  //     lineTextSpace: this.width / 50,
  //     position: [this.width + this.width / 20, this.height],
  //   };
  //   const o = joinObjects({}, defaultOptions, legendOptions);
  //   const legend = this.shapes.collection();
  //   let toShow = [...Array(this.traces.length).keys()];
  //   if (o.toShow) {
  //     toShow = [];
  //     o.toShow.forEach((index) => {
  //       const traceIndex = this.getTraceIndex(index);
  //       if (traceIndex !== -1) {
  //         toShow.push(traceIndex);
  //       }
  //     });
  //   }
  //   if (o.toHide) {
  //     o.toHide.forEach((index) => {
  //       const traceIndex = this.getTraceIndex(index);
  //       if (traceIndex !== -1 && toShow.indexOf(traceIndex) !== -1) {
  //         toShow.splice(traceIndex, 1);
  //       }
  //     });
  //   }
  //   const offset = [];
  //   if (o.offset == null) {
  //     o.offset = [new Point(0, -o.font.size * 1.5)];
  //   }
  //   o.offset = getPoints(o.offset);
  //   for (let i = 0; i < toShow.length; i += 1) {
  //     offset.push(o.offset[i % o.offset.length]._dup());
  //   }
  //   let p = new Point(0, 0);
  //   toShow.forEach((traceIndex, index) => {
  //     const trace = this.traces[traceIndex];
  //     let custom = {};
  //     if (o.custom[`${index}`] != null) {
  //       custom = o.custom[`${index}`];
  //     } else if (o.custom[trace.name] != null) {
  //       custom = o.custom[trace.name];
  //     }
  //     if (index === 0 && custom.position == null) {
  //       custom.position = getPoint(o.position);
  //     }
  //     const oTrace = joinObjects({}, {
  //       length: o.length,
  //       font: o.font,
  //       fontColorIsLineColor: o.fontColorIsLineColor,
  //       offset: offset[index],
  //       lineTextSpace: o.lineTextSpace,
  //       text: trace.name,
  //     }, custom);
  //     if (oTrace.position != null) {
  //       p = getPoint(oTrace.position);
  //     } else {
  //       p = p.add(getPoint(oTrace.offset));
  //     }
  //     if (oTrace.length > 0 && trace.line != null) {
  //       const oLine = joinObjects({}, trace.line, {
  //         p1: p,
  //         length: oTrace.length,
  //         angle: 0,
  //       });
  //       const line = this.shapes.line(oLine);
  //       legend.add(`line${traceIndex}`, line);
  //     }
  //     // console.log(trace)
  //     if (oTrace.length > 0 && trace.markers != null) {
  //       const oMarker = joinObjects({}, trace.markers, {
  //         position: new Point(p.x + oTrace.length / 2, p.y),
  //         copy: trace.markers.copy.slice(0, -1),
  //       });
  //       const marker = this.shapes.polygon(oMarker);
  //       legend.add(`marker${traceIndex}`, marker);
  //     }
  //     const textOptions = {
  //       // font: joinObjects({}, this.defaultFont, { size: this.defaultFont.size * 2 }),
  //       font: this.defaultFont,
  //       justify: 'center',
  //       xAlign: 'left',
  //       yAlign: 'middle',
  //       position: new Point(p.x + oTrace.length + oTrace.lineTextSpace, p.y),
  //     };
  //     let textOptionsToUse = oTrace.text;
  //     if (typeof oTrace.text === 'string') {
  //       textOptionsToUse = { text: [oTrace.text] };
  //     }
  //     let colorOverride = {};
  //     if (o.fontColorIsLineColor) {
  //       colorOverride = { font: { color: trace.color.slice() } };
  //     }
  //     const theme = this.getTheme(this.theme).legend;
  //     const oText = joinObjects({}, textOptions, theme, colorOverride, textOptionsToUse);
  //     // o.offset = getPoint(o.offset);
  //     const traceName = this.shapes.textLines(oText);
  //     legend.add(`trace${traceIndex}`, traceName);
  //   });
  //   this.add('legend', legend);
  //   if (o.frame != null && o.frame !== false) {
  //     const bounds = legend.getBoundingRect('draw');
  //     const frameOptions = {
  //       space: Math.min(bounds.width, bounds.height) / 20,
  //     };
  //     let frameOptionsIn = o.frame;
  //     if (o.frame === true) {
  //       frameOptions.line = { width: this.width / 400 };
  //       frameOptionsIn = {};
  //     }
  //     const oFrame = joinObjects({}, frameOptions, frameOptionsIn);
  //     legend.frameSpace = oFrame.space;
  //     const frame = this.advanced.rectangle(oFrame);
  //     frame.surround(legend, oFrame.space);
  //     legend.add('frame', frame);
  //   }
  //   // legend.align(o.xAlign, o.yAlign);
  //   // console.log(getPoint(o.position))
  //   // if (o.position != null) {
  //   //   legend.setPosition(getPoint(o.position));
  //   // }
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
        o.name = `trace_${this.traces.length}`;
      }
      o.xAxis = this.getAxis(o.xAxis);
      o.yAxis = this.getAxis(o.yAxis);

      const trace = this.advanced.trace(o);
      this.add(o.name, trace);
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
          line: { width: this.shapes.defaultLineWidth * 1.5 },
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
            width: this.shapes.defaultLineWidth / 1.5,
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
