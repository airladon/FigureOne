// @flow

import * as g2 from './js/tools/g2';
import * as math from './js/tools/math';
import Diagram from './js/diagram/Diagram';
import { Recorder } from './js/diagram/Recorder';
import { FunctionMap, GlobalFunctionMap } from './js/tools/FunctionMap';
import * as color from './js/tools/color';
import * as html from './js/tools/htmlGenerator';
import * as misc from './js/tools/tools';
import * as css from './js/tools/styleSheets';
import * as lines from './js/diagram/DrawingObjects/Geometries/lines/lines';
import {
  DiagramElement, DiagramElementPrimitive, DiagramElementCollection,
} from './js/diagram/Element';
import DrawContext2D from './js/diagram/DrawContext2D';
import WebGLInstance from './js/diagram/webgl/webgl';
import DrawingObject from './js/diagram/DrawingObjects/DrawingObject';
import VertexObject from './js/diagram/DrawingObjects/VertexObject/VertexObject';
import {
  TextObject, DiagramText, DiagramFont,
} from './js/diagram/DrawingObjects/TextObject/TextObject';
import HTMLObject from './js/diagram/DrawingObjects/HTMLObject/HTMLObject';
import HTMLEquation from './js/diagram/DiagramElements/Equation/HTMLEquation';
import AdvancedAngle from './js/diagram/DiagramObjects/Angle';
import AdvancedLine from './js/diagram/DiagramObjects/Line';
import AdvancedPolyline from './js/diagram/DiagramObjects/PolyLine';
import EqnNavigator from './js/diagram/DiagramObjects/EqnNavigator';
import EquationLabel from './js/diagram/DiagramObjects/EquationLabel';
import { Equation } from './js/diagram/DiagramElements/Equation/Equation';
import EquationForm from './js/diagram/DiagramElements/Equation/EquationForm';

import type { TypeRotationDirection, TypeParsablePoint } from './js/tools/g2';
import type {
  TypeLabelLocation, TypeLabelSubLocation, TypeLabelOrientation,
  TypeLineVertexOrigin, TypeLineVertexSpaceStart, ADV_Line,
  TypeLineLabelOptions, TypeLabelledLine,
} from './js/diagram/DiagramObjects/Line';
import type {
  TypeAngleLabelOrientation, ADV_Angle, TypeAngleLabelOptions,
  TypeLabelledAngle,
} from './js/diagram/DiagramObjects/Angle';
import type { TypeDiagramOptions } from './js/diagram/Diagram';
import type {
  ADV_Polyline, OBJ_PolylinePad,
} from './js/diagram/DiagramObjects/PolyLine';
import * as anim from './js/diagram/Animation/Animation';

export type {
  TypeRotationDirection,
  TypeLabelLocation, TypeLabelSubLocation, TypeLabelOrientation,
  TypeLineVertexOrigin, TypeLineVertexSpaceStart, ADV_Line,
  TypeAngleLabelOrientation, ADV_Angle, TypeDiagramOptions,
  TypeLineLabelOptions, TypeAngleLabelOptions,
  ADV_Polyline, OBJ_PolylinePad, TypeParsablePoint,
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
  color,
  css,
  html,
  misc,
  lines,
};

/**
 * FigureOne entry point
 * @module Fig
 * @global
 * @property {class} {@link Diagram}      - Diagram Class
 */
const Fig = {
  tools,
  Diagram,
  Recorder,
  FunctionMap,
  GlobalFunctionMap,
  //
  DiagramElement,
  DiagramElementCollection,
  DiagramElementPrimitive,
  DrawContext2D,
  WebGLInstance,
  //
  DrawingObject,
  VertexObject,
  TextObject,
  DiagramText,
  DiagramFont,
  HTMLObject,
  //
  AdvancedAngle,
  AdvancedLine,
  AdvancedPolyline,
  EqnNavigator,
  EquationLabel,
  //
  EquationForm,
  Equation,
  //
  HTMLEquation,
  //
  Animation: anim,
  //
  Point: g2.Point,
  Line: g2.Line,
  Rect: g2.Rect,
  Transform: g2.Transform,
  Translation: g2.Translation,
  Scale: g2.Scale,
  Rotation: g2.Rotation,
  parsePoint: g2.getPoint,
  LineBounds: g2.LineBounds,
  TransformBounds: g2.TransformBounds,
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
  getTransform: g2.getTransform,

  // math
  round: math.round,
  range: math.range,
  randSign: math.randSign,
  randInt: math.randInt,
  rand: math.rand,
  randElement: math.randElement,
  randElements: math.randElements,
  removeRandElement: math.removeRandElement,
};

export default Fig;
