// @flow

import VertexBracket from './VertexBracket';
// import VertexPolygonFilled from '../../DrawingObjects/VertexObject/VertexPolygon';
import { DiagramElementPrimative } from '../../../Element';
import {
  Point, Transform, Rect,
} from '../../../../tools/g2';
import WebGLInstance from '../../../webgl/webgl';

export default function Bracket(
  webgl: WebGLInstance,
  color: Array<number>,
  side: 'left' | 'right' | 'top' | 'bottom',
  numLines: number,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
) {
  // const serifSides = 30;
  // const serifRadius = 0.05;
  const vertices = new VertexBracket(webgl, side, numLines);
  // const serif = new VertexPolygonFilled(
  //   webgl,
  //   serifSides,
  //   serifRadius,
  //   0,
  //   new Point(0, 0),
  //   serifSides,
  // );
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }

  return new DiagramElementPrimative(vertices, transform, color, diagramLimits);
}
