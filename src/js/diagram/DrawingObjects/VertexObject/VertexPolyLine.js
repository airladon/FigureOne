// @flow

import { Point } from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';
import polylineTriangles3 from './PolyLineTriangles3';
import type { TypeBorderToPoint } from './PolyLineTriangles3';

export type TypeVertexPolyLineBorderToPoint = TypeBorderToPoint;

class VertexPolyLine extends VertexObject {
  width: number;
  close: boolean;
  borderToPoint: TypeBorderToPoint;

  constructor(
    webgl: Array<WebGLInstance>,
    coords: Array<Point>,
    close: boolean,
    width: number,
    borderToPoint: TypeBorderToPoint = 'never',
  ): void {
    super(webgl);
    this.width = width;
    this.close = close;
    this.borderToPoint = borderToPoint;
    this.setupPoints(coords);
    this.setupBuffer();
  }

  change(coords: Array<Point>) {
    this.setupPoints(coords);
    this.resetBuffer();
  }

  setupPoints(coords: Array<Point>) {
    const lineTriangles = polylineTriangles3(
      coords,
      this.close,
      this.width,
      this.borderToPoint,
    );
    this.points = lineTriangles.points;
    this.border[0] = lineTriangles.border;
    this.holeBorder[0] = lineTriangles.holeBorder;
  }
}

export default VertexPolyLine;
