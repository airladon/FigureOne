// @flow

import * as g2 from './js/tools/g2';
import * as math from './js/tools/math';
import * as m2 from './js/tools/m2';
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
import DrawContext2D from './js/figure/DrawContext2D';
import WebGLInstance from './js/figure/webgl/webgl';
import DrawingObject from './js/figure/DrawingObjects/DrawingObject';
import VertexGeneric from './js/figure/DrawingObjects/VertexObject/VertexGeneric';
import {
  TextObject, FigureText, FigureFont,
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
  color,
  css,
  html,
  misc,
  lines,
  m2,
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
  TextObject,
  FigureText,
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

  TimeKeeper,
};

export default Fig;
