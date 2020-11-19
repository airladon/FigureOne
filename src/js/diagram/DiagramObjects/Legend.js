// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point,
  getPoint, getPoints,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';
import type { ADV_Trace } from './Trace';

/**
 * {@link AdvancedPlotLegend} options object.
 */
export type ADV_PlotLegend = {
  traces: Array<ADV_Trace>,
  length?: number, // 0 = text only
  font?: OBJ_Font,
  fontColorIsLineColor?: boolean,
  offset?: Array<TypeParsablePoint> | TypeParsablePoint,
  frame?: ADV_Rectangle & { space: number },
  position?: TypeParsablePoint,
  xAlign?: 'left' | 'center' | 'right',
  yAlgin?: 'bottom' | 'middle' | 'top',
  show?: Array<number>,
  hide?: Array<number>,
  space?: number,
  custom?: {
    [arrayNumberOrName: string]: {
      font?: OBJ_Font,
      length?: number,
      offset?: TypeParsablePoint,
      space?: number,
      fontColorIsLineColor?: boolean,
      text?: OBJ_TextLines,
      position?: TypeParsablePoint,
    },
  },
};

// $FlowFixMe
class AdvancedPlotLegend extends DiagramElementCollection {
  // Diagram elements
  _frame: ?DiagramElementPrimitive;
  // _axis: ?AdvancedAxis;
  // _majorTicks: ?DiagramElementPrimitive;
  // _minorTicks: ?DiagramElementPrimitive;
  // _labels: ?DiagramElementPrimitive;
  // _arrow1: ?DiagramElementPrimitive;
  // _arrow2: ?DiagramElementPrimitive;

  shapes: Object;
  equation: Object;
  advanced: Object;

  traces: Array<AdvancedTrace>;

  toShow: Array<number>;

  /**
   * @hideconstructor
   */
  constructor(
    shapes: Object,
    equation: Object,
    advanced: Object,
    optionsIn: ADV_PlotLegend,
  ) {
    super(new Transform('PlotLegend')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.shapes = shapes;
    this.equation = equation;
    this.advanced = advanced;

    const defaultOptions = {
      font: shapes.defaultFont,
      color: shapes.defaultColor,
      xAlign: 'center',
      yAlign: 'middle',
      fontColorIsLineColor: false,
      frame: false,
      custom: {},
      length: 0.1,
      space: 0.05,
      position: new Point(0, 0),
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.defaultFont = options.font;
    this.defaultColor = options.color;
    this.traces = options.traces;

    this.toShow = this.getTracesToShow(options);
    this.offset = this.getOffset(options);
    this.addTraces(options);
    if (options.frame != null && options.frame !== false) {
      this.addFrame(options.frame);
      this.toBack('frame');
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

  getTracesToShow(o: { show?: number, hide?: number }) {
    let toShow = [...Array(this.traces.length).keys()];
    if (o.toShow) {
      toShow = [];
      o.toShow.forEach((index) => {
        const traceIndex = this.getTraceIndex(index);
        if (traceIndex !== -1) {
          toShow.push(traceIndex);
        }
      });
    }
    if (o.toHide) {
      o.toHide.forEach((index) => {
        const traceIndex = this.getTraceIndex(index);
        if (traceIndex !== -1 && toShow.indexOf(traceIndex) !== -1) {
          toShow.splice(traceIndex, 1);
        }
      });
    }
    return toShow;
  }

  getOffset(o: { offset: Array<TypeParsablePoint> | TypeParsablePoint }) {
    const offsetArray = [];
    let { offset } = o;
    if (offset == null) {
      offset = [new Point(0, -o.font.size * 1.5)];
    }
    offset = getPoints(offset);
    for (let i = 0; i < this.toShow.length; i += 1) {
      offsetArray.push(offset[i % offset.length]._dup());
    }
    return offsetArray;
  }

  addTraces(o: ADV_PlotLegend) {
    let p = new Point(0, 0);
    this.toShow.forEach((traceIndex, index) => {
      const trace = this.traces[traceIndex];

      // Get any trace specific customizations
      let custom = {};
      if (o.custom[`${index}`] != null) {
        custom = o.custom[`${index}`];
      } else if (o.custom[trace.name] != null) {
        custom = o.custom[trace.name];
      }
      if (index === 0 && custom.position == null) {
        custom.position = getPoint(o.position);
      }

      // Trace specific options
      const oTrace = joinObjects({}, {
        length: o.length,
        font: o.font,
        fontColorIsLineColor: o.fontColorIsLineColor,
        offset: this.offset[index],
        space: o.space,
        text: trace.name,
      }, custom);

      // Get final position of trace start
      if (oTrace.position != null) {
        p = getPoint(oTrace.position);
      } else {
        p = p.add(getPoint(oTrace.offset));
      }

      // Add trace line (if exists)
      if (oTrace.length > 0 && trace.line != null) {
        const oLine = joinObjects({}, trace.line, {
          p1: p,
          length: oTrace.length,
          angle: 0,
        });
        const line = this.shapes.line(oLine);
        this.add(`line${traceIndex}`, line);
      }

      // Add trace marker (if exists)
      if (oTrace.length > 0 && trace.markers != null) {
        const oMarker = joinObjects({}, trace.markers, {
          position: new Point(p.x + oTrace.length / 2, p.y),
          copy: trace.markers.copy.slice(0, -1),
        });
        const marker = this.shapes.polygon(oMarker);
        this.add(`marker${traceIndex}`, marker);
      }

      // Add trace text
      const textOptions = {
        font: this.defaultFont,
        justify: 'center',
        xAlign: 'left',
        yAlign: 'middle',
        position: new Point(p.x + oTrace.length + oTrace.space, p.y),
      };
      let textOptionsToUse = oTrace.text;
      if (typeof oTrace.text === 'string') {
        textOptionsToUse = { text: [oTrace.text] };
      }
      let colorOverride = {};
      if (o.fontColorIsLineColor) {
        colorOverride = { font: { color: trace.color.slice() } };
      }
      const oText = joinObjects({}, textOptions, colorOverride, textOptionsToUse);
      // o.offset = getPoint(o.offset);
      const traceName = this.shapes.textLines(oText);
      this.add(`trace${traceIndex}`, traceName);
    });
  }

  addFrame(optionsIn: Object | boolean) {
    let o = optionsIn;
    if (optionsIn === true) {
      o = {};
    }
    // const bounds = this.getBoundingRect('draw');
    const defaultFrameOptions = {
      // space: Math.min(bounds.width, bounds.height) / 20,
      space: this.defaultFont.size,
      // line: { width: 0.01 },
    };
    if (optionsIn.line == null && optionsIn.fill == null) {
      defaultFrameOptions.line = { width: 0.01 };
    }

    const oFrame = joinObjects({}, defaultFrameOptions, o);
    if (oFrame.line != null && oFrame.line.color == null) {
      oFrame.line.color = this.defaultColor.slice();
    }
    const frame = this.advanced.rectangle(oFrame);
    frame.surround(this, oFrame.space);
    this.add('frame', frame);
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

export default AdvancedPlotLegend;
