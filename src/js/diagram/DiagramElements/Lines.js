// @flow

import VertexLines from '../DrawingObjects/VertexObject/VertexLines';
import { DiagramElementPrimative } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

function Lines(
  webgl: Array<WebGLInstance>,
  linePairs: Array<Array<Point>>,
  numLinesThick: number,
  color: Array<number>,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
) {
  const vertexLine = new VertexLines(
    webgl,
    linePairs,
    numLinesThick,
  );
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }
  return new DiagramElementPrimative(vertexLine, transform, color, diagramLimits);
}

export default Lines;
