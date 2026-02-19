
import * as g2 from './js/tools/g2';
import * as math from './js/tools/math';
import * as m2 from './js/tools/m2';
import * as m3 from './js/tools/m3';
import * as morph from './js/tools/morph';
import Figure from './js/figure/Figure';
import TimeKeeper from './js/figure/TimeKeeper';
import { Recorder } from './js/figure/Recorder/Recorder';
import { FunctionMap, GlobalFunctionMap } from './js/tools/FunctionMap';
import * as color from './js/tools/color';
import * as html from './js/tools/htmlGenerator';
import * as misc from './js/tools/tools';
import * as css from './js/tools/styleSheets';
import * as lines from './js/figure/geometries/lines/lines';
import {
  FigureElement, FigureElementPrimitive, FigureElementCollection,
} from './js/figure/Element';
import Scene from './js/tools/geometry/scene';
import DrawContext2D from './js/figure/DrawContext2D';
import WebGLInstance from './js/figure/webgl/webgl';
import DrawingObject from './js/figure/DrawingObjects/DrawingObject';
import VertexGeneric from './js/figure/DrawingObjects/VertexObject/VertexGeneric';
import {
  FigureFont,
} from './js/figure/DrawingObjects/TextObject/TextObject';
import HTMLObject from './js/figure/DrawingObjects/HTMLObject/HTMLObject';
import HTMLEquation from './js/figure/Equation/HTMLEquation';
import CollectionsAngle from './js/figure/FigureCollections/Angle';
import CollectionsLine from './js/figure/FigureCollections/Line';
import CollectionsPolyline from './js/figure/FigureCollections/PolyLine';
// import EqnNavigator from './js/figure/FigureCollections/EqnNavigator';
import EquationLabel from './js/figure/FigureCollections/EquationLabel';
import { Equation } from './js/figure/Equation/Equation';
import EquationForm from './js/figure/Equation/EquationForm';
import SlideNavigator from './js/figure/SlideNavigator';

import type { TypeRotationDirection, TypeParsablePoint } from './js/tools/g2';
import type {
  COL_Line,
  OBJ_LineLabel, TypeLabelledLine,
} from './js/figure/FigureCollections/Line';
import type {
  TypeLabelLocation, TypeLabelSubLocation, TypeLabelOrientation,
} from './js/figure/FigureCollections/EquationLabel';

import type {
  COL_Angle, TypeAngleLabelOptions,
  TypeLabelledAngle,
} from './js/figure/FigureCollections/Angle';
import type { OBJ_Figure } from './js/figure/Figure';
import type {
  COL_Polyline, OBJ_PolylinePad,
} from './js/figure/FigureCollections/PolyLine';
import * as anim from './js/figure/Animation/Animation';

// This helps the docgen find the types file
// eslint-disable-next-line
import doNothing from './js/tools/types';

export type {
  TypeRotationDirection,
  TypeLabelLocation, TypeLabelSubLocation, TypeLabelOrientation,
  COL_Line,
  COL_Angle, OBJ_Figure,
  OBJ_LineLabel, TypeAngleLabelOptions,
  COL_Polyline, OBJ_PolylinePad, TypeParsablePoint,
  TypeLabelledAngle, TypeLabelledLine,
};


// /** Tools object that is so great
// * @namespace tools
// * @memberof module:Fig
// * @property {object} math   - Math tools
// * @property {object} g2     - 2D geometry tools
// * @property {object} color  - Color tools
// * @property {object} css    - CSS tools
// */
const tools = {
  math,
  g2,
  m3,
  color,
  css,
  html,
  misc,
  lines,
  m2,
  morph,
};

/**
 * FigureOne entry point
 * @module Fig
 * @global
 * @property {class} {@link Figure}      - Figure Class
 */
const Fig = {
  tools,
  Figure,
  Recorder,
  FunctionMap,
  GlobalFunctionMap,
  SlideNavigator,
  //
  FigureElement,
  FigureElementCollection,
  FigureElementPrimitive,
  DrawContext2D,
  WebGLInstance,
  //
  DrawingObject,
  VertexGeneric,
  FigureFont,
  HTMLObject,
  //
  CollectionsAngle,
  CollectionsLine,
  CollectionsPolyline,
  // EqnNavigator,
  EquationLabel,
  //
  EquationForm,
  Equation,
  //
  HTMLEquation,
  //
  Animation: anim,
  //
  Scene,
  Point: g2.Point,
  Plane: g2.Plane,
  Line: g2.Line,
  Rect: g2.Rect,
  Transform: g2.Transform,
  parsePoint: g2.getPoint,
  LineBounds: g2.LineBounds,
  RectBounds: g2.RectBounds,
  RangeBounds: g2.RangeBounds,
  minAngleDiff: g2.minAngleDiff,
  getTriangleCenter: g2.getTriangleCenter,
  polarToRect: g2.polarToRect,
  rectToPolar: g2.rectToPolar,
  threePointAngle: g2.threePointAngle,
  threePointAngleMin: g2.threePointAngleMin,
  clipAngle: g2.clipAngle,
  getPoint: g2.getPoint,
  getPoints: g2.getPoints,
  getScale: g2.getScale,
  getLine: g2.getLine,
  getRect: g2.getRect,
  getPlane: g2.getPlane,
  getTransform: g2.getTransform,
  surfaceGrid: g2.surfaceGrid,
  cube: g2.cube,
  sphere: g2.sphere,
  polygon: g2.polygon,
  revolve: g2.revolve,
  surface: g2.surface,
  cone: g2.cone,
  cylinder: g2.cylinder,
  line3: g2.line3,
  getMaxTimeFromVelocity: g2.getMaxTimeFromVelocity,
  toNumbers: g2.toNumbers,
  pointsToNumbers: g2.pointsToNumbers,

  // misc
  joinObjects: misc.joinObjects,
  m3,
  morph,
  misc,


  // math
  round: math.round,
  roundNum: math.roundNum,
  range: math.range,
  randSign: math.randSign,
  randBool: math.randBool,
  randInt: math.randInt,
  rand: math.rand,
  randElement: math.randElement,
  randElements: math.randElements,
  removeRandElement: math.removeRandElement,

  TimeKeeper,
};

export default Fig;
