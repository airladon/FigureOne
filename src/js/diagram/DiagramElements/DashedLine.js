// @flow

import VertexDashedLine from '../DrawingObjects/VertexObject/VertexDashedLine';
import { DiagramElementPrimitive } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

function DashedLine(
  webgl: Array<WebGLInstance>,
  start: Point,
  length: number,
  width: number,
  rotation: number,
  dashStyle: Array<number>,
  color: TypeColor,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
) {
  const vertexLine = new VertexDashedLine(
    webgl,
    start,
    length,
    width,
    rotation,
    dashStyle,
  );
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }
  return new DiagramElementPrimitive(vertexLine, transform, color, diagramLimits);
}

export default DashedLine;
