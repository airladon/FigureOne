// @flow

import VertexRadialLines from '../DrawingObjects/VertexObject/VertexRadialLines';
import { DiagramElementPrimitive } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

function RadialLines(
  webgl: Array<WebGLInstance>,
  innerRadius: number = 0,
  outerRadius: number = 1,
  width: number = 0.05,
  dAngle: number = Math.PI / 4,
  maxAngle: number = Math.PI * 2,
  color: Array<number>,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
) {
  const vertexLine = new VertexRadialLines(
    webgl,
    innerRadius,
    outerRadius,
    width,
    dAngle,
    maxAngle,
  );
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }
  return new DiagramElementPrimitive(vertexLine, transform, color, diagramLimits);
}

export default RadialLines;
