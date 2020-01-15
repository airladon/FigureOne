// @flow

import {
  Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

export type TypeVertexRectangleFilledReference = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center' | 'middleLeft' | 'middleRight' | 'topCenter' | 'bottomCenter' | Point;

export default class VertexBox extends VertexObject {
  lineWidth: number;
  fill: boolean;

  constructor(
    webgl: Array<WebGLInstance>,
    width: number = 1,
    height: number = 1,
    lineWidth: number = 0.01,
    fill: boolean = false,
  ): void {
    super(webgl);
    this.glPrimitive = this.gl[0].TRIANGLE_STRIP;
    this.lineWidth = lineWidth;
    this.fill = fill;
    const points = this.getPoints(width, height, lineWidth, fill);
    this.updatePoints(points, width, height, true);
  }

  updatePoints(
    points: Array<Point>,
    width: number,
    height: number,
    initialize: boolean = false,
  ) {
    // let t;
    this.points = [];
    points.forEach((p) => {
      this.points.push(p.x);
      this.points.push(p.y);
    });

    this.border[0] = [
      new Point(-width / 2, -height / 2),
      new Point(width / 2, -height / 2),
      new Point(width / 2, height / 2),
      new Point(-width / 2, height / 2),
    ];

    if (initialize) {
      this.setupBuffer();
    } else {
      this.resetBuffer();
    }
  }

  updateBox(
    width: number,
    height: number,
    lineWidth: number = this.lineWidth,
    fill: boolean = this.fill,
  ) {
    const points = this.getPoints(width, height, lineWidth, fill);
    this.updatePoints(points, width, height, false);
  }

  // eslint-disable-next-line class-methods-use-this
  getPoints(
    width: number,
    height: number,
    lineWidth: number = this.lineWidth,
    fill: boolean = this.fill,
  ) {
    let points;
    if (fill) {
      points = [
        new Point(-width / 2, -height / 2),
        new Point(-width / 2 + width, -height / 2),
        new Point(-width / 2, -height / 2 + height),
        new Point(-width / 2 + width, -height / 2 + height),
      ];
    } else {
      points = [
        new Point(-width / 2, -height / 2),
        new Point(-width / 2 + lineWidth, -height / 2 + lineWidth),
        new Point(-width / 2, -height / 2 + height),
        new Point(-width / 2 + lineWidth, -height / 2 + height - lineWidth),
        new Point(-width / 2 + width, -height / 2 + height),
        new Point(-width / 2 + width - lineWidth, -height / 2 + height - lineWidth),
        new Point(-width / 2 + width, -height / 2),
        new Point(-width / 2 + width - lineWidth, -height / 2 + lineWidth),
        new Point(-width / 2, -height / 2),
        new Point(-width / 2 + lineWidth, -height / 2 + lineWidth),
      ];
    }
    return points;
  }
}
