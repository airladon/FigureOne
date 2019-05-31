// @flow

import {
  Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

export type TypeVertexRectangleFilledReference = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center' | 'middleLeft' | 'middleRight' | 'topCenter' | 'bottomCenter' | Point;

export default class VertexRectangleFilled extends VertexObject {
  start: Point;
  constructor(
    webgl: WebGLInstance,
    alignH: 'left' | 'center' | 'right' | number,
    alignV: 'bottom' | 'middle' | 'top' | number,
    width: number = 1,
    height: number = 1,
    cornerRadius: number = 0,
    cornerSides: number = 20,
  ): void {
    super(webgl);
    this.glPrimative = this.gl[0].TRIANGLE_FAN;

    let points = [];
    points.push(new Point(0, 0));

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
    const sides = cornerSides;
    if (sides === 0) {
      rad = 0;
    }
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

    if (alignV === 'top') {
      points = points.map(p => p.add(0, -height / 2));
    } else if (alignV === 'bottom') {
      points = points.map(p => p.add(0, height / 2));
    } else if (alignV === 'middle') {
      points = points.map(p => p.add(0, 0));
    } else {
      points = points.map(p => p.add(0, alignV));
    }
    if (alignH === 'left') {
      points = points.map(p => p.add(width / 2, 0));
    } else if (alignH === 'right') {
      points = points.map(p => p.add(-width / 2, 0));
    } else if (alignH === 'center') {
      points = points.map(p => p.add(0, 0));
    } else {
      points = points.map(p => p.add(alignH, alignH));
    }
    // if (reference === 'topLeft') {
    //   points = points.map(p => p.add(new Point(width / 2, -height / 2)));
    // } else if (reference === 'topRight') {
    //   points = points.map(p => p.add(new Point(-width / 2, -height / 2)));
    // } else if (reference === 'bottomLeft') {
    //   points = points.map(p => p.add(new Point(width / 2, height / 2)));
    // } else if (reference === 'bottomRight') {
    //   points = points.map(p => p.add(new Point(-width / 2, height / 2)));
    // } else if (reference === 'middleLeft') {
    //   points = points.map(p => p.add(new Point(width / 2, 0)));
    // } else if (reference === 'middleRight') {
    //   points = points.map(p => p.add(new Point(-width / 2, 0)));
    // } else if (reference === 'topCenter') {
    //   points = points.map(p => p.add(new Point(0, -height / 2)));
    // } else if (reference === 'bottomCenter') {
    //   points = points.map(p => p.add(new Point(0, height / 2)));
    // } else if (typeof reference !== 'string') {   // $FlowFixMe
    //   points = points.map(p => p.add(reference));
    // }

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
