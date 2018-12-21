// @flow

import VertexRectangleFilled from '../DrawingObjects/VertexObject/VertexRectangleFilled';
import type { TypeVertexRectangleFilledReference } from '../DrawingObjects/VertexObject/VertexRectangleFilled';
import { DiagramElementPrimative } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

export type TypeRectangleFilledReference = TypeVertexRectangleFilledReference;

export default function RectangleFilled(
  webgl: WebGLInstance,
  topLeft: TypeRectangleFilledReference,
  width: number,
  height: number,
  cornerRadius: number,
  cornerSides: number,
  color: Array<number>,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
) {
  const vertexRectangle = new VertexRectangleFilled(
    webgl,
    topLeft,
    width,
    height,
    cornerRadius,
    cornerSides,
  );
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }
  return new DiagramElementPrimative(vertexRectangle, transform, color, diagramLimits);
}
