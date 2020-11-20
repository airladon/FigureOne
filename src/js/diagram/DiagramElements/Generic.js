// @flow

import VertexGeneric from '../DrawingObjects/VertexObject/VertexGeneric';
import { DiagramElementPrimitive } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';
import type { CPY_Step } from '../DrawingObjects/Geometries/copy/copy';
import type { TypeColor } from '../../tools/types';

export default function Generic(
  webgl: Array<WebGLInstance>,
  vertices: Array<Point>,
  border: Array<Array<Point>> | 'points' | 'rect',
  touchBorder: Array<Array<Point>> | 'rect' | 'border' | 'none',
  holeBorder: Array<Array<Point>> | 'none',
  drawType: 'triangles' | 'strip' | 'fan' | 'lines',
  color: TypeColor,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
  textureLocation: string = '',
  textureVertexSpace: Rect = new Rect(-1, -1, 2, 2),
  textureCoords: Rect = new Rect(0, 0, 1, 1),
  textureRepeat: boolean = false,
  onLoad: ?() => void = null,
  copy: Array<CPY_Step>,
) {
  const generic = new VertexGeneric(
    webgl,
    vertices,
    border,
    touchBorder,
    holeBorder,
    drawType,
    textureLocation,
    textureVertexSpace,
    textureCoords,
    textureRepeat,
    copy,
  );
  if (textureLocation) {
    generic.onLoad = onLoad;
  }
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }
  // $FlowFixMe
  return new DiagramElementPrimitive(generic, transform, color, diagramLimits);
}
