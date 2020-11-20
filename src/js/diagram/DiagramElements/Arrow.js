// @flow

import VertexArrow from '../DrawingObjects/VertexObject/VertexArrow';
import { DiagramElementPrimitive } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

export default function Arrow(
  webgl: Array<WebGLInstance>,
  width: number = 1,
  legWidth: number = 0.5,
  height: number = 1,
  legHeight: number = 0.5,
  tip: Point = new Point(0, 0),
  rotation: number = 0,
  color: TypeColor = [1, 1, 1, 1],
  transformOrLocation: Transform | Point = new Point(0, 0),
  diagramLimits: Rect = new Rect(-1, -1, 2, 2),
) {
  const vertexLine = new VertexArrow(
    webgl,
    width,
    legWidth,
    height,
    legHeight,
    tip,
    rotation,
  );
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }
  return new DiagramElementPrimitive(vertexLine, transform, color, diagramLimits);
}
