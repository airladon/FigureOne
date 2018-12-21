// @flow

import {
  Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

export type TypeVertexRectangleFilledReference = 'topLeft' | 'center';

export default class VertexRectangleFilled extends VertexObject {
  start: Point;
  constructor(
    webgl: WebGLInstance,
    reference: TypeVertexRectangleFilledReference,
    width: number = 1,
    height: number = 1,
    cornerRadius: number = 0,
    cornerSides: number = 20,
  ): void {
    super(webgl);
    this.glPrimative = this.gl.TRIANGLE_FAN;

    let points = [];
    points.push(new Point(0, 0));

    const makeCorner = function makeCorner(
      radius: number,
      sides: number,
      rotation: number,
      offset: Point,
    ) {
      const cornerPoints = [];
      if (radius === 0 || sides <= 1) {
        cornerPoints.push(new Point(0, 0));
      } else {
        const step = Math.PI / 2 / sides;
        for (let i = 0; i < sides + 1; i += 1) {
          cornerPoints.push(new Point(
            radius * Math.cos(i * step + rotation) + offset.x,
            radius * Math.sin(i * step + rotation) + offset.y,
          ));
        }
      }
      return cornerPoints;
    };

    const rad = cornerRadius;
    const sides = cornerSides;
    points = [
      ...points,
      ...makeCorner(rad, sides, 0, new Point(width / 2 - rad, height / 2 - rad)),
    ];
    points = [
      ...points,
      ...makeCorner(rad, sides, Math.PI / 2, new Point(-width / 2 + rad, height / 2 - rad)),
    ];
    points = [
      ...points,
      ...makeCorner(rad, sides, Math.PI, new Point(-width / 2 + rad, -height / 2 + rad)),
    ];
    points = [
      ...points,
      ...makeCorner(rad, sides, Math.PI / 2 * 3, new Point(width / 2 - rad, -height / 2 + rad)),
    ];

    if (reference === 'topLeft') {
      points = points.map(p => p.add(new Point(width / 2, -height / 2)));
    }

    points.forEach((p) => {
      this.points.push(p.x);
      this.points.push(p.y);
    });
    this.points.push(this.points[2]);
    this.points.push(this.points[3]);

    this.border[0] = points.slice(1);
    this.setupBuffer();
  }
}
