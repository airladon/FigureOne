// @flow

import {
  Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

export type TypeVertexRectangleFilledReference = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center' | 'middleLeft' | 'middleRight' | 'topCenter' | 'bottomCenter' | Point;

export default class VertexRectangle extends VertexObject {
  start: Point;
  constructor(
    webgl: Array<WebGLInstance>,
    xAlign: 'left' | 'center' | 'right' | number,
    yAlign: 'bottom' | 'middle' | 'top' | number,
    width: number = 1,
    height: number = 1,
    lineWidth: number = 0.01,
    cornerRadius: number = 0,
    cornerSides: number = 20,
  ): void {
    super(webgl);
    this.glPrimitive = this.gl[0].TRIANGLE_STRIP;

    let points = [];
    // points.push(new Point(0, 0));

    const makeCorner = function makeCorner(
      radius: number,
      sides: number,
      rotation: number,
      offset: Point,
    ) {
      const cornerPoints = [];
      if (radius === 0 || sides === 0) {
        cornerPoints.push(offset);
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

    let rad = Math.min(cornerRadius, width / 2, height / 2);
    let innerRad = Math.max(cornerRadius - lineWidth, 0.0001);
    const sides = cornerSides;
    if (sides === 0) {
      rad = 0;
      innerRad = 0;
    }

    const outsidePoints = [
      ...makeCorner(rad, sides, 0, new Point(width / 2 - rad, height / 2 - rad)),
      ...makeCorner(rad, sides, Math.PI / 2, new Point(-width / 2 + rad, height / 2 - rad)),
      ...makeCorner(rad, sides, Math.PI, new Point(-width / 2 + rad, -height / 2 + rad)),
      ...makeCorner(rad, sides, Math.PI / 2 * 3, new Point(width / 2 - rad, -height / 2 + rad)),
    ];

    const insidePoints = [
      ...makeCorner(
        innerRad, sides, 0,
        new Point(width / 2 - innerRad - lineWidth, height / 2 - innerRad - lineWidth),
      ),
      ...makeCorner(
        innerRad, sides, Math.PI / 2,
        new Point(-width / 2 + innerRad + lineWidth, height / 2 - innerRad - lineWidth),
      ),
      ...makeCorner(
        innerRad, sides, Math.PI,
        new Point(-width / 2 + innerRad + lineWidth, -height / 2 + innerRad + lineWidth),
      ),
      ...makeCorner(
        innerRad, sides, Math.PI / 2 * 3,
        new Point(width / 2 - innerRad - lineWidth, -height / 2 + innerRad + lineWidth),
      ),
    ];

    outsidePoints.forEach((p, index) => {
      points.push(p);
      points.push(insidePoints[index]);
    });

    if (yAlign === 'top') {
      points = points.map(p => p.add(0, -height / 2));
    } else if (yAlign === 'bottom') {
      points = points.map(p => p.add(0, height / 2));
    } else if (yAlign === 'middle') {
      points = points.map(p => p.add(0, 0));
    } else {
      points = points.map(p => p.add(0, yAlign));
    }
    if (xAlign === 'left') {
      points = points.map(p => p.add(width / 2, 0));
    } else if (xAlign === 'right') {
      points = points.map(p => p.add(-width / 2, 0));
    } else if (xAlign === 'center') {
      points = points.map(p => p.add(0, 0));
    } else {
      points = points.map(p => p.add(xAlign, xAlign));
    }

    points.forEach((p) => {
      this.points.push(p.x);
      this.points.push(p.y);
    });
    this.points.push(this.points[0]);
    this.points.push(this.points[1]);
    this.points.push(this.points[2]);
    this.points.push(this.points[3]);

    this.border[0] = points.slice(1);
    this.setupBuffer();
  }
}
