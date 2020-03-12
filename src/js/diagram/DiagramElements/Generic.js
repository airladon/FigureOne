// @flow

import VertexGeneric from '../DrawingObjects/VertexObject/VertexGeneric';
import { DiagramElementPrimitive } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

export default function Generic(
  webgl: Array<WebGLInstance>,
  vertices: Array<Point>,
  border: ?Array<Array<Point>>,
  holeBorder: ?Array<Array<Point>>,
  drawType: 'triangles' | 'strip' | 'fan' | 'lines',
  color: Array<number>,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
) {
  const vertexLine = new VertexGeneric(
    webgl,
    vertices,
    border,
    holeBorder,
    drawType,
  );
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }
  return new DiagramElementPrimitive(vertexLine, transform, color, diagramLimits);
}
