// @flow
import WebGLInstance from '../webgl/webgl';
import {
  Rect, // Point, Line,
} from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
// import {
//   DiagramElementCollection,
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

export default class DiagramObjects {
  webgl: Array<WebGLInstance>;
  draw2D: DrawContext2D;
  limits: Rect;
  shapes: Object;
  equation: Object;
  isTouchDevice: boolean;
  animateNextFrame: void => void;

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
    this.equation = equation;
  }


  line(...options: Array<COL_Line>) {
    // const optionsToUse = Object.assign({}, ...options);
    // console.log(Object.assign({}, ...options))
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsLine(
      this.shapes, this.equation, this.isTouchDevice,
      optionsToUse,
    );
  }

  angle(...options: Array<COL_Angle>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsAngle(
      this.shapes, this.equation, this.isTouchDevice, this.animateNextFrame,
      optionsToUse,
    );
  }

  label(...options: Array<TypeLabelOptions>) {
    // const optionsToUse = Object.assign({}, ...options);
    const optionsToUse = joinObjects({}, ...options);
    return new EquationLabel(
      this.equation, optionsToUse,
    );
  }

  polyline(...options: Array<COL_Polyline>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsPolyline(
      this.shapes, this.equation, this,
      this.isTouchDevice, this.animateNextFrame,
      optionsToUse,
    );
  }

  axis(...options: Array<COL_Axis>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsAxis(
      this.shapes, this.equation, optionsToUse,
    );
  }

  trace(...options: Array<COL_Trace>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsTrace(
      this.shapes, this.equation, optionsToUse,
    );
  }

  plot(...options: Array<COL_Plot>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsPlot(
      this.shapes, this.equation, this, optionsToUse,
    );
  }

  plotLegend(...options: Array<COL_Plot>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsPlotLegend(
      this.shapes, this.equation, this, optionsToUse,
    );
  }

  rectangle(...options: Array<COL_Rectangle>) {
    const optionsToUse = joinObjects({}, ...options);
    return new CollectionsRectangle(
      this.shapes, optionsToUse,
    );
  }
}
