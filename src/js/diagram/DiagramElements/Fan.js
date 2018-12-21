// @flow

import VertextFan from '../DrawingObjects/VertexObject/VertexFan';
import { DiagramElementPrimative } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

function Fan(
  webgl: WebGLInstance,
  points: Array<Point>,
  color: Array<number>,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
) {
  const vertexLine = new VertextFan(
    webgl,
    points,
  );
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }
  return new DiagramElementPrimative(vertexLine, transform, color, diagramLimits);
}

export default Fan;
