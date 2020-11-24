// @flow
import WebGLInstance from '../webgl/webgl';
import {
  Rect, // Point, Line,
} from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
// import {
//   FigureElementCollection,
// } from '../Element';
import DrawContext2D from '../DrawContext2D';
// import EquationNavigator from './EquationNavigator';
import CollectionsLine from './Line';
import CollectionsAngle from './Angle';
// eslint-disable-next-line import/no-cycle
import CollectionsPolyline from './PolyLine';
import CollectionsAxis from './Axis';
import CollectionsTrace from './Trace';
import type { COL_Line } from './Line';
import type { COL_Angle } from './Angle';
import type { TypeLabelOptions } from './EquationLabel';
import type { COL_Polyline } from './PolyLine';
import type { COL_Axis } from './Axis';
import type { COL_Trace } from './Trace';
import type { COL_Plot } from './Plot';
import type { COL_Rectangle } from './Rectangle';
import EquationLabel from './EquationLabel';
import CollectionsPlot from './Plot';
import CollectionsPlotLegend from './Legend';
import CollectionsRectangle from './Rectangle';
import type { EQN_Equation } from '../Equation/Equation';
import type { OBJ_Collection } from '../FigurePrimitives/FigurePrimitives';
// import { Equation } from '../Equation/Equation';

/**
 * Built in figure collections.
 *
 * Provides advanced shapes the specific methods, animations and interactivity.
 */
export default class FigureCollections {
  webgl: Array<WebGLInstance>;
  draw2D: DrawContext2D;
  limits: Rect;
  shapes: Object;
  equationFromFig: Object;
  isTouchDevice: boolean;
  animateNextFrame: void => void;

  /**
    * @hideconstructor
    */
  constructor(
    shapes: Object,
    equation: Object,
    isTouchDevice: boolean,
    animateNextFrame: () => void,
  ) {
    this.webgl = shapes.webgl;
    this.draw2D = shapes.draw2D;
    this.limits = shapes.limits;
    this.shapes = shapes;
    this.isTouchDevice = isTouchDevice;
    this.animateNextFrame = animateNextFrame;
    this.equationFromFig = equation;
  }

  /**
   * Create a {@link FigureElementCollection}.
   */
  collection(
    options: OBJ_Collection,
  ) {
    return this.shapes.collection(options);
  }

  /**
   * Create a {@link Equation}.
   */
  equation(
    options: EQN_Equation,
  ) {
    return this.equationFromFig.equation(this.shapes, options);
  }
  // equation(
  //   options: EQN_Equation,
  // ) {
  //   const equation = new Equation(this.shapes, options);
  //   return equation;
  // }

  /**
   * Create a {@link CollectionsLine}.
   */
  line(...options: Array<COL_Line>) {
    // const optionsToUse = Object.assign({}, ...options);
    // console.log(Object.assign({}, ...options))
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsLine(
      this.shapes, this.equationFromFig, this.isTouchDevice,
      optionsToUse,
    );
  }

  /**
   * Create a {@link CollectionsAngle}.
   */
  angle(...options: Array<COL_Angle>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsAngle(
      this.shapes, this.equationFromFig, this.isTouchDevice, this.animateNextFrame,
      optionsToUse,
    );
  }

  label(...options: Array<TypeLabelOptions>) {
    // const optionsToUse = Object.assign({}, ...options);
    const optionsToUse = joinObjects({}, ...options);
    return new EquationLabel(
      this.equationFromFig, optionsToUse,
    );
  }

  /**
   * Create a {@link CollectionsPolyline}.
   */
  polyline(...options: Array<COL_Polyline>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsPolyline(
      this.shapes, this.equationFromFig, this,
      this.isTouchDevice, this.animateNextFrame,
      optionsToUse,
    );
  }

  /**
   * Create a {@link CollectionsRectangle}.
   */
  rectangle(...options: Array<COL_Rectangle>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsRectangle(
      this.shapes, optionsToUse,
    );
  }

  /**
   * Create a {@link CollectionsAixs}.
   */
  axis(...options: Array<COL_Axis>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsAxis(
      this.shapes, this.equationFromFig, optionsToUse,
    );
  }

  /**
   * Create a {@link CollectionsTrace}.
   */
  trace(...options: Array<COL_Trace>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsTrace(
      this.shapes, this.equationFromFig, optionsToUse,
    );
  }

  /**
   * Create a {@link CollectionsPlot}.
   */
  plot(...options: Array<COL_Plot>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsPlot(
      this.shapes, this.equationFromFig, this, optionsToUse,
    );
  }

  /**
   * Create a {@link CollectionsLegend}.
   */
  plotLegend(...options: Array<COL_Plot>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsPlotLegend(
      this.shapes, this.equationFromFig, this, optionsToUse,
    );
  }
}
