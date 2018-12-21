// @flow

import VertexBar from './VertexBar';
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
  const vertices = new VertexBar(webgl, side, numLines);
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }

  return new DiagramElementPrimative(vertices, transform, color, diagramLimits);
}
