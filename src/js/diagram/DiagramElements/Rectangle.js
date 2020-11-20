// @flow

import VertexRectangle from '../DrawingObjects/VertexObject/VertexRectangle';
import { DiagramElementPrimitive } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

export default function Rectangle(
  webgl: Array<WebGLInstance>,
  xAlign: 'left' | 'center' | 'right' | number,
  yAlign: 'bottom' | 'middle' | 'top' | number,
  width: number,
  height: number,
  lineWidth: number,
  cornerRadius: number,
  cornerSides: number,
  color: TypeColor,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
) {
  const vertexRectangle = new VertexRectangle(
    webgl,
    xAlign,
    yAlign,
    width,
    height,
    lineWidth,
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
