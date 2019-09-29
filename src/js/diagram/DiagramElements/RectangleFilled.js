// @flow

import VertexRectangleFilled from '../DrawingObjects/VertexObject/VertexRectangleFilled';
import type { TypeVertexRectangleFilledReference } from '../DrawingObjects/VertexObject/VertexRectangleFilled';
import { DiagramElementPrimitive } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

export type TypeRectangleFilledReference = TypeVertexRectangleFilledReference;

export default function RectangleFilled(
  webgl: Array<WebGLInstance>,
  alignH: 'left' | 'center' | 'right' | number,
  alignV: 'bottom' | 'middle' | 'top' | number,
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
    alignH,
    alignV,
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
  return new DiagramElementPrimitive(vertexRectangle, transform, color, diagramLimits);
}
