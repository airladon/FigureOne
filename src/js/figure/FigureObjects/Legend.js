// @flow

// import Figure from '../Figure';
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
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import type CollectionsTrace, { COL_Trace } from './Trace';
import type { OBJ_Font, OBJ_Font_Fixed } from '../../tools/types';
import type {
  OBJ_TextLines,
} from '../FigurePrimitives/FigurePrimitives';
import type { TypePlotFrame } from './Plot';

/**
 * Legend customization for a single trace sample in the legend.
 *
 * @property {OBJ_Font} [font] default font
 * @property {number} [length] length of the line sample
 * @property {TypeParsablePoint} [offset] offset of this trace sample from
 * the last trace sample
 * @property {number} [space] space between line sample and text
 * @property {boolean} [fontColorIsLineColor] use line color as font color
 * @property {OBJ_TextLines | 'string'} [text] custom text
 * @property {TypeParsablePoint} [position] position of the trace sample
 */
export type OBJ_PlotLegendCustomTrace = {
  font?: OBJ_Font,
  length?: number,
  offset?: TypeParsablePoint,
  space?: number,
  fontColorIsLineColor?: boolean,
  text?: OBJ_TextLines | 'string',
  position?: TypeParsablePoint,
};

/**
 * Legend customization options object
 *
 * Allows customization of specific trace samples in the legend.
 * `_arrayIndexOrName` represents a generic key that should actually
 * be the array index of the specific trace defined in {@link COL_PlotLegend}
 * or the name of the trace. See examples in {@link CollectionsPlotLegend} for use.
 *
 * @property {OBJ_PlotLegendCustomTrace} [_arrayIndexOrName]
 */
export type OBJ_PlotLegendCustom = {
  [_arrayIndexOrName: string]: OBJ_PlotLegendCustomTrace;
};

/**
 * {@link CollectionsPlotLegend} options object.
 *
 * A legend consists of a number of trace samples and their corresponding names,
 * and may have an encompassing frame with a border and fill.
 *
 * @property {TypeParsablePoint} [position] position of the first trace in the
 * legend
 * @property {number} [length] length of the line sample
 * @property {number} [space] space between the line and the text
 * @property {Array<TypeParsablePoint> | TypeParsablePoint} [offset] offset
 * between trace samples - can be used to space out a legend, or make it
 * horizontal
 * @property {OBJ_Font} [font] default font for trace sample text
 * @property {boolean} [fontColorIsLineColor] set the trace sample text color to
 * the same as the line sample
 * @property {Array<number> | TypePlotFrame} [frame] frame around the legend -
 * specifying just a color will create a solid fill rectangle of that color
 * @property {Array<number>} [show] array of which trace indeces to show if only
 * some should be shown
 * @property {Array<number>} [hide] array of which trace indeces to hide if some
 * should be hidden
 * @property {OBJ_PlotLegendCustom} [custom] customizations to specific trace
 * samples
 * @property {Array<COL_Trace>} [traces] the traces from the plot that this
 * legend will display. This is used by {@link CollectionsPlot} and should not be
 * used by the user.
 */
export type COL_PlotLegend = {
  position?: TypeParsablePoint,
  length?: number, // 0 = text only
  space?: number,
  offset?: Array<TypeParsablePoint> | TypeParsablePoint,
  font?: OBJ_Font,
  fontColorIsLineColor?: boolean,
  frame?: Array<number> | TypePlotFrame,
  show?: Array<number>,
  hide?: Array<number>,
  custom?: OBJ_PlotLegendCustom,
  traces: Array<COL_Trace>,
};


/*
................##.......########..######...########.##....##.########.
................##.......##.......##....##..##.......###...##.##.....##
................##.......##.......##........##.......####..##.##.....##
................##.......######...##...####.######...##.##.##.##.....##
................##.......##.......##....##..##.......##..####.##.....##
................##.......##.......##....##..##.......##...###.##.....##
................########.########..######...########.##....##.########.
*/
/**
 * {@link FigureElementCollection} representing an legend.
 *
 * ![](./assets1/advlegend_ex1.png)
 * ![](./assets1/advlegend_ex2.png)
 *
 * ![](./assets1/advlegend_ex3.png)
 * ![](./assets1/advlegend_ex4.png)
 *
 * ![](./assets1/advlegend_ex5.png)
 *
 * This object defines a legend in an {@link CollectionsPlot}.
 *
 * The legend includes traces, trace names and a frame. Each can be customized
 * using the {@link COL_PlotLegend} options object.
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
 * // By default, the legend will appear in the top right corner
 * figure.addElement({
 *   name: 'plot',
 *   method: 'collections.plot',
 *   options: {
 *     trace: [
 *       { points: pow(2), name: 'Power 2' },
 *       { points: pow(2.5), name: 'Power 2.5' },
 *       {
 *         points: pow(3, 10, 0.5),
 *         name: 'Power 3',
 *         markers: { radius: 0.03, sides: 10 },
 *       },
 *     ],
 *     legend: true,
 *   },
 * });
 *
 * @example
 * // Change the line length, position and use a frame on the legend
 * figure.addElement({
 *   name: 'plot',
 *   method: 'collections.plot',
 *   options: {
 *     trace: [
 *       { points: pow(2), name: 'Power 2' },
 *       { points: pow(2.5), name: 'Power 2.5' },
 *       {
 *         points: pow(3, 10, 0.5),
 *         name: 'Power 3',
 *         markers: { radius: 0.03, sides: 10 },
 *       },
 *     ],
 *     legend: {
 *       length: 0.5,
 *       frame: [0.95, 0.95, 0.95, 1],
 *       position: [0.2, 1.8],
 *     },
 *   },
 * });
 *
 * @example
 * // Make a horizontal legend
 * figure.addElement({
 *   name: 'plot',
 *   method: 'collections.plot',
 *   options: {
 *     trace: [
 *       { points: pow(2), name: 'Power 2' },
 *       { points: pow(2.5), name: 'Power 2.5' },
 *       {
 *         points: pow(3, 10, 0.5),
 *         name: 'Power 3',
 *         markers: { radius: 0.03, sides: 10 },
 *       },
 *     ],
 *     legend: {
 *       offset: [0.9, 0],
 *       position: [-0.3, -0.5],
 *       frame: {
 *         line: { width: 0.005 },
 *         corner: { radius: 0.05, sides: 10 },
 *       },
 *     },
 *   },
 * });
 *
 * @example
 * // Customize legend trace text
 * figure.addElement({
 *   name: 'plot',
 *   method: 'collections.plot',
 *   options: {
 *     trace: [
 *       { points: pow(2), name: 'Power 2' },
 *       { points: pow(2.5), name: 'Power 2.5' },
 *       {
 *         points: pow(3, 10, 0.5),
 *         name: 'Power 3',
 *         markers: { radius: 0.03, sides: 10 },
 *       },
 *     ],
 *     legend: {
 *       offset: [0, -0.2],
 *       custom: {
 *         1: {
 *           font: { size: 0.1, style: 'italic', color: [1, 0, 0, 1] },
 *           text: {
 *             text: [
 *               'Power 2.5',
 *               {
 *                 text: 'Reference Trace',
 *                 font: { size: 0.06 },
 *                 lineSpace: 0.06,
 *               },
 *             ],
 *             justify: 'left',
 *           },
 *         },
 *       },
 *     },
 *   },
 * });
 *
 * @example
 * // Customize legend
 * figure.addElement({
 *   name: 'plot',
 *   method: 'collections.plot',
 *   options: {
 *     trace: [
 *       { points: pow(2), name: 'Power 2' },
 *       { points: pow(2.5), name: 'Power 2.5' },
 *       {
 *         points: pow(3, 10, 0.5),
 *         name: 'Power 3',
 *         markers: { radius: 0.03, sides: 10 },
 *       },
 *     ],
 *     legend: {
 *       fontColorIsLineColor: true,
 *       length: 0,
 *       custom: {
 *         0: { position: [2, 0.2] },
 *         1: { position: [2, 0.7] },
 *         'Power 3': { position: [2, 2] },
 *       }
 *     },
 *   },
 * });
 */
// $FlowFixMe
class CollectionsPlotLegend extends FigureElementCollection {
  // Figure elements
  _frame: ?FigureElementPrimitive;
  // _axis: ?CollectionsAxis;
  // _majorTicks: ?FigureElementPrimitive;
  // _minorTicks: ?FigureElementPrimitive;
  // _labels: ?FigureElementPrimitive;
  // _arrow1: ?FigureElementPrimitive;
  // _arrow2: ?FigureElementPrimitive;

  shapes: Object;
  equation: Object;
  collections: Object;
  defaultFont: OBJ_Font_Fixed;

  traces: Array<CollectionsTrace>;
  offset: Array<Point>;

  toShow: Array<number>;

  /**
   * @hideconstructor
   */
  constructor(
    shapes: Object,
    equation: Object,
    collections: Object,
    optionsIn: COL_PlotLegend,
  ) {
    const defaultOptions = {
      font: shapes.defaultFont,
      color: shapes.defaultColor,
      fontColorIsLineColor: false,
      frame: false,
      custom: {},
      length: shapes.defaultLength / 10,
      space: 0.05,
      position: new Point(0, 0),
      transform: new Transform('PlotLegend').scale(1, 1).rotate(0).translate(0, 0),
      limits: shapes.limits,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);

    super(options);
    this.shapes = shapes;
    this.equation = equation;
    this.collections = collections;

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
    if (o.show) {
      toShow = [];
      let showToUse = o.show;
      if (typeof showToUse === 'number') {
        showToUse = [showToUse];
      }
      showToUse.forEach((index) => {
        const traceIndex = this.getTraceIndex(index);
        if (traceIndex !== -1) {
          toShow.push(traceIndex);
        }
      });
    }
    if (o.hide) {
      let hideToUse = o.hide;
      if (typeof hideToUse === 'number') {
        hideToUse = [hideToUse];
      }
      hideToUse.forEach((index) => {
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
      offset = [new Point(0, -this.defaultFont.size * 1.5)];
    }
    offset = getPoints(offset);
    for (let i = 0; i < this.toShow.length; i += 1) {
      offsetArray.push(offset[i % offset.length]._dup());
    }
    return offsetArray;
  }

  addTraces(o: COL_PlotLegend) {
    let p = new Point(0, 0);
    this.toShow.forEach((traceIndex, index) => {
      const trace = this.traces[traceIndex];

      // Get any trace specific customizations
      let custom = {};                              // $FlowFixMe
      if (o.custom[`${index}`] != null) {           // $FlowFixMe
        custom = o.custom[`${index}`];              // $FlowFixMe
      } else if (o.custom[trace.name] != null) {
        custom = o.custom[trace.name];
      }
      if (index === 0 && custom.position == null) {
        custom.position = getPoint(o.position || [0, 0]);
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
          position: new Point(p.x + oTrace.length / 2, p.y),  // $FlowFixMe
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
      if (custom.font != null) {
        textOptions.font = joinObjects({}, textOptions.font, custom.font);
      }
      let textOptionsToUse = oTrace.text;
      if (typeof oTrace.text === 'string') {
        textOptionsToUse = { text: [oTrace.text] };
      }
      if (typeof custom.text === 'string') { // $FlowFixMe
        custom.text = { text: [custom.text] };
      }
      let colorOverride = {};
      if (o.fontColorIsLineColor) {
        colorOverride = { font: { color: trace.color.slice() } };
      }
      const oText = joinObjects({}, textOptions, colorOverride, textOptionsToUse, custom.text);
      // o.offset = getPoint(o.offset);
      const traceName = this.shapes.textLines(oText);
      this.add(`trace${traceIndex}`, traceName);
    });
  }

  addFrame(optionsIn: Object | boolean | Array<number>) {
    let o = optionsIn;
    if (optionsIn === true) {
      o = {};
    } else if (Array.isArray(optionsIn)) {
      o = { fill: optionsIn };
    }
    // const bounds = this.getBoundingRect('draw');
    const defaultFrameOptions = {
      // space: Math.min(bounds.width, bounds.height) / 20,
      space: this.defaultFont.size,
      // line: { width: 0.01 },
    };
    if (optionsIn.line == null && optionsIn.fill == null) { // $FlowFixMe
      defaultFrameOptions.line = { width: 0.01 };
    }

    const oFrame = joinObjects({}, defaultFrameOptions, o);
    if (oFrame.line != null && oFrame.line.color == null) {
      oFrame.line.color = this.defaultColor.slice();
    }
    const frame = this.collections.rectangle(oFrame);
    frame.surround(this, oFrame.space);
    this.add('frame', frame);
  }

  // _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
  //   return [...super._getStateProperties(options),
  //     'angle',
  //     'lastLabelRotationOffset',
  //   ];
  // }

  // _fromState(state: Object) {
  //   joinObjects(this, state);
  //   this.setAngle({
  //     angle: this.angle,
  //     rotationOffset: this.lastLabelRotationOffset,
  //   });
  //   return this;
  // }
}

export default CollectionsPlotLegend;
