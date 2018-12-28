// @flow

import * as g2 from './js/tools/g2';
import * as math from './js/tools/math';
import Diagram from './js/diagram/Diagram';
import * as color from './js/tools/color';
import * as html from './js/tools/htmlGenerator';
import * as misc from './js/tools/tools';
import * as css from './js/tools/styleSheets';
import {
  DiagramElement, DiagramElementPrimative, DiagramElementCollection,
} from './js/diagram/Element';
import DrawContext2D from './js/diagram/DrawContext2D';
import WebGLInstance from './js/diagram/webgl/webgl';
import {
  AnimationPhase, ColorAnimationPhase, CustomAnimationPhase,
} from './js/diagram/AnimationPhase';
import DrawingObject from './js/diagram/DrawingObjects/DrawingObject';
import VertexObject from './js/diagram/DrawingObjects/VertexObject/VertexObject';
import {
  TextObject, DiagramText, DiagramFont,
} from './js/diagram/DrawingObjects/TextObject/TextObject';
import HTMLObject from './js/diagram/DrawingObjects/HTMLObject/HTMLObject';
import HTMLEquation from './js/diagram/DiagramElements/Equation/HTMLEquation';
import DiagramObjectAngle from './js/diagram/DiagramObjects/Angle';
import DiagramObjectLine from './js/diagram/DiagramObjects/Line';
import EqnNavigator from './js/diagram/DiagramObjects/EqnNavigator';
import EquationLabel from './js/diagram/DiagramObjects/EquationLabel';
import { Equation } from './js/diagram/DiagramElements/Equation/GLEquation';
import { EquationNew } from './js/diagram/DiagramElements/Equation/Equation';
import EquationForm from './js/diagram/DiagramElements/Equation/EquationForm';

import type { TypeRotationDirection } from './js/tools/g2';
import type {
  TypeLineLabelLocation, TypeLineLabelSubLocation, TypeLineLabelOrientation,
  TypeLineVertexOrigin, TypeLineVertexSpaceStart, TypeLineOptions,
  TypeLineLabelOptions,
} from './js/diagram/DiagramObjects/Line';
import type {
  TypeAngleLabelOrientation, TypeAngleOptions,
} from './js/diagram/DiagramObjects/Angle';
import type { TypeDiagramOptions } from './js/diagram/Diagram';

export type {
  TypeRotationDirection,
  TypeLineLabelLocation, TypeLineLabelSubLocation, TypeLineLabelOrientation,
  TypeLineVertexOrigin, TypeLineVertexSpaceStart, TypeLineOptions,
  TypeAngleLabelOrientation, TypeAngleOptions, TypeDiagramOptions,
  TypeLineLabelOptions,
};

const tools = {
  math,
  g2,
  color,
  css,
  html,
  misc,
};

const FigureOne = {
  tools,
  Diagram,
  //
  DiagramElement,
  DiagramElementCollection,
  DiagramElementPrimative,
  DrawContext2D,
  WebGLInstance,
  AnimationPhase,
  ColorAnimationPhase,
  CustomAnimationPhase,
  //
  DrawingObject,
  VertexObject,
  TextObject,
  DiagramText,
  DiagramFont,
  HTMLObject,
  //
  DiagramObjectAngle,
  DiagramObjectLine,
  EqnNavigator,
  EquationLabel,
  //
  EquationLegacy: Equation,
  EquationForm,
  Equation: EquationNew,
  //
  HTMLEquation,
  //
  Point: g2.Point,
  Line: g2.Line,
  Rect: g2.Rect,
  Transform: g2.Transform,
  TransformLimit: g2.TransformLimit,
  Translation: g2.Translation,
  Scale: g2.Scale,
  Rotation: g2.Rotation,
};

export default FigureOne;
