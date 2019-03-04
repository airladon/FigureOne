// @flow

// import VertexPolygon from '../DrawingObjects/VertexObject/VertexPolygon';
import VertexText from '../DrawingObjects/VertexObject/VertexText';
// import VertexPolygonLine from '../DrawingObjects/VertexObject/VertexPolygonLine';
import { DiagramElementPrimative } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

function Text(
  webgl: WebGLInstance,
  color: Array<number>,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
) {
  const vertexText = new VertexText(
    webgl,
    {},
  );
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }
  return new DiagramElementPrimative(vertexText, transform, color, diagramLimits);
}

export default Text;
