// @flow

import { Point, polarToRect } from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

class VertexPolygonLine extends VertexObject {
  radius: number;       // radius from center to outside of polygon
  glPrimitive: number;  // WebGL primitive used
  center: Point;     // center point
  dAngle: number;       // angle between adjacent verteces to center lines

  constructor(
    webgl: Array<WebGLInstance>,
    numSides: number,       // Must be 3 or greater (def: 3 if smaller)
    radius: number,
    rotation: number = 0,
    center: Point = new Point(0, 0),
    numSidesToDraw: number = numSides, // Must be <= numSides (def: numSides if greater)
    direction: -1 | 1 = 1,
    thickness: number = 1,
  ) {
    // setup webgl stuff
    super(webgl);
    this.glPrimative = webgl[0].gl.LINES;

    // Check potential errors in constructor input
    let sides = numSides;
    let sidesToDraw = Math.floor(numSidesToDraw);
    if (sides < 3) {
      sides = 3;
    }

    if (sidesToDraw < 0) {
      sidesToDraw = 0;
    } else if (sidesToDraw > sides) {
      sidesToDraw = sides;
    }

    // setup shape geometry
    this.radius = radius;
    // const inRad = radius - lineWidth;
    this.center = center;
    this.dAngle = Math.PI * 2.0 / sides;

    // const lines = [];
    const points = [];
    const thickPoints = [];
    for (let j = 1; j < thickness; j += 1) {
      thickPoints.push([]);
    }
    for (let i = 0; i <= sidesToDraw; i += 1) {
      const angle = i * this.dAngle * direction + rotation * direction;
      points.push(polarToRect(radius, angle));
      for (let j = 1; j < thickness; j += 1) {
        thickPoints[j - 1].push(polarToRect(radius * (1 - j * 0.003), angle));
      }
    }

    for (let i = 1; i <= sidesToDraw; i += 1) {
      // lines.push([points[i - 1], points[i]]);
      this.points.push(points[i - 1].x);
      this.points.push(points[i - 1].y);
      this.points.push(points[i].x);
      this.points.push(points[i].y);
      for (let j = 1; j < thickness; j += 1) {
        this.points.push(thickPoints[j - 1][i - 1].x);
        this.points.push(thickPoints[j - 1][i - 1].y);
        this.points.push(thickPoints[j - 1][i].x);
        this.points.push(thickPoints[j - 1][i].y);
      }
    }

    this.border[0] = points;
    if (sidesToDraw < sides) {
      this.border[0].push(center);
    }

    // for (let i = 1; i <= sidesToDraw; i += 1) {
    //   const lastAngle = (i - 1) * angleStep;
    //   const angle = i * angleStep;
    //   lines.push([polarToRect(1, lastAngle), polarToRect(1, angle)]);
    // }
    // // Setup shape primative vertices
    // let i;
    // let j = 0;
    // for (i = 0; i <= sidesToDraw; i += 1) {
    //   this.points[j] = polarToRect
    //   this.points[j] =
    //     center.x + inRad * Math.cos(i * this.dAngle * direction + rotation * direction);
    //   this.points[j + 1] =
    //     center.y + inRad * Math.sin(i * this.dAngle * direction + rotation * direction);
    //   this.points[j + 2] =
    //     center.x + radius * Math.cos(i * this.dAngle * direction + rotation * direction);
    //   this.points[j + 3] =
    //     center.y + radius * Math.sin(i * this.dAngle * direction + rotation * direction);
    //   j += 4;
    // }

    // // Make the encapsulating border
    // if (sidesToDraw < sides) {
    //   for (i = 0; i <= sidesToDraw; i += 1) {
    //     this.border[0].push(new Point(
    //       center.x + radius * Math.cos(i * this.dAngle * direction + rotation * direction),
    //       center.y + radius * Math.sin(i * this.dAngle * direction + rotation * direction),
    //     ));
    //   }
    //   for (i = sidesToDraw; i >= 0; i -= 1) {
    //     this.border[0].push(new Point(
    //       center.x + inRad * Math.cos(i * this.dAngle * direction + rotation * direction),
    //       center.y + inRad * Math.sin(i * this.dAngle * direction + rotation * direction),
    //     ));
    //   }
    //   this.border[0].push(this.border[0][0]._dup());
    // } else {
    //   for (i = 0; i <= sidesToDraw; i += 1) {
    //     this.border[0].push(new Point(
    //       center.x + radius * Math.cos(i * this.dAngle * direction + rotation * direction),
    //       center.y + radius * Math.sin(i * this.dAngle * direction + rotation * direction),
    //     ));
    //   }
    // }
    this.setupBuffer();
    // console.log(this.numPoints);
  }

  drawToAngle(
    offset: Object,
    rotate: number,
    scale: Object,
    drawAngle: number,
    color: Array<number>,
  ) {
    let count = Math.floor(drawAngle / this.dAngle) * 2.0 + 2;
    if (drawAngle >= Math.PI * 2.0) {
      count = this.numPoints;
    }
    this.draw(offset, rotate, scale, count, color);
  }

  getPointCountForAngle(drawAngle: number = Math.PI * 2) {
    const numSidesToDraw = Math.floor(drawAngle / this.dAngle) * 2.0;
    let pointCount = numSidesToDraw * 2;
    if (pointCount > this.numPoints) {
      pointCount = this.numPoints;
    }
    // let count = Math.floor(drawAngle / this.dAngle) * 2.0;
    // if (drawAngle >= Math.PI * 2.0) {
    //   count = this.numPoints;
    // }
    return pointCount;
  }
}

export default VertexPolygonLine;
