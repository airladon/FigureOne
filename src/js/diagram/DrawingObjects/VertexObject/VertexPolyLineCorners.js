
// @flow

import { Point } from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';
import polylineTriangles from './PolyLineTriangles';

function cornerLength(coords, length, forceLength = true) {
  const center = coords[1];
  const ends = [coords[0], coords[2]];
  const points = [];
  for (let i = 0; i < 2; i += 1) {
    const delta = ends[i].sub(center);
    const angle = Math.atan2(delta.y, delta.x);
    let endLength = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    if (length < endLength || forceLength) {
      endLength = length;
    }
    points.push(new Point(
      endLength * Math.cos(angle) + center.x,
      endLength * Math.sin(angle) + center.y,
    ));
  }
  points.push(points[1]._dup());
  points[1] = center._dup();
  return points;
}

class PolyLineCorners extends VertexObject {
  constructor(
    webgl: Array<WebGLInstance>,
    coords: Array<Point>,
    close: boolean,
    length: number,
    width: number,
  ) {
    super(webgl);
    const newCoords = coords.slice();
    if (close) {
      newCoords.push(coords[0]);
      newCoords.push(coords[1]);
    }
    for (let i = 1, j = newCoords.length - 1; i < j; i += 1) {
      const cornerPoints = cornerLength(
        [newCoords[i - 1], newCoords[i], newCoords[i + 1]],
        length,
        true,
      );
      const cornerTriangles = polylineTriangles(
        cornerPoints,
        false,
        width,
      );
      for (let k = 0, m = cornerTriangles.points.length; k < m; k += 1) {
        this.points.push(cornerTriangles.points[k]);
      }
      this.border[i - 1] = [];
      for (let k = 0, m = cornerTriangles.border.length; k < m; k += 1) {
        this.border[i - 1].push(cornerTriangles.border[k]);
      }
    }
    this.setupBuffer();
  }
}

export default PolyLineCorners;

