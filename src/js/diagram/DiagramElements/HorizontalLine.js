// @flow

import VertexHorizontalLine from '../DrawingObjects/VertexObject/VertexHorizontalLine';
import { DiagramElementPrimative } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

function HorizontalLine(
  webgl: Array<WebGLInstance>,
  start: Point,
  length: number,
  width: number,
  rotation: number,
  color: Array<number>,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
) {
  const vertexLine = new VertexHorizontalLine(
    webgl,
    start,
    length,
    width,
    rotation,
  );
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }
  return new DiagramElementPrimative(vertexLine, transform, color, diagramLimits);
}

export default HorizontalLine;
