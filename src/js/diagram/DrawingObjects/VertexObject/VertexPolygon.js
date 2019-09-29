// @flow

import { Point } from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

class VertexPolygon extends VertexObject {
  radius: number;       // radius from center to outside of polygon
  glPrimitive: number;  // WebGL primitive used
  // outRad: number;       // radius from center to polygon vertex + 1/2 linewidth
  // inRad: number;        // radius from center to polygon vertex - 1/2 linewidth
  center: Point;     // center point
  dAngle: number;       // angle between adjacent verteces to center lines

  constructor(
    webgl: Array<WebGLInstance>,
    numSides: number,       // Must be 3 or greater (def: 3 if smaller)
    radius: number,
    lineWidth: number,
    rotation: number = 0,
    center: Point = new Point(0, 0),
    numSidesToDraw: number = numSides, // Must be <= numSides (def: numSides if greater)
    direction: -1 | 1 = 1,
    triangles: boolean = false,
  ) {
    // setup webgl stuff
    super(webgl);
    if (triangles) {
      this.glPrimitive = webgl[0].gl.TRIANGLES;
    } else {
      this.glPrimitive = webgl[0].gl.TRIANGLE_STRIP;
    }

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
    const inRad = radius - lineWidth;
    // const outRad = radius + lineWidth / 2.0;
    // this.outRad = outRad;
    // this.inRad = inRad;
    this.center = center;
    this.dAngle = Math.PI * 2.0 / sides;

    // Setup shape primative vertices
    let i;
    let j = 0;
    for (i = 0; i <= sidesToDraw; i += 1) {
      const angle = i * this.dAngle * direction + rotation * direction;
      const lastAngle = (i - 1) * this.dAngle * direction + rotation * direction;

      const inPoint = new Point(
        inRad * Math.cos(angle),
        inRad * Math.sin(angle),
      ).add(center);
      const outPoint = new Point(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
      ).add(center);
      const lastInPoint = new Point(
        inRad * Math.cos(lastAngle),
        inRad * Math.sin(lastAngle),
      ).add(center);
      const lastOutPoint = new Point(
        radius * Math.cos(lastAngle),
        radius * Math.sin(lastAngle),
      ).add(center);
      if (triangles) {
        if (i > 0) {
          this.points[j] = lastInPoint.x;
          this.points[j + 1] = lastInPoint.y;
          this.points[j + 2] = lastOutPoint.x;
          this.points[j + 3] = lastOutPoint.y;
          this.points[j + 4] = outPoint.x;
          this.points[j + 5] = outPoint.y;
          this.points[j + 6] = outPoint.x;
          this.points[j + 7] = outPoint.y;
          this.points[j + 8] = lastInPoint.x;
          this.points[j + 9] = lastInPoint.y;
          this.points[j + 10] = inPoint.x;
          this.points[j + 11] = inPoint.y;
          j += 12;
        }
      } else {
        // this.points[j] =
        //   center.x + inRad * Math.cos(i * this.dAngle * direction + rotation * direction);
        // this.points[j + 1] =
        //   center.y + inRad * Math.sin(i * this.dAngle * direction + rotation * direction);
        // this.points[j + 2] =
        //   center.x + radius * Math.cos(i * this.dAngle * direction + rotation * direction);
        // this.points[j + 3] =
        //   center.y + radius * Math.sin(i * this.dAngle * direction + rotation * direction);
        // j += 4;
        this.points[j] = inPoint.x;
        this.points[j + 1] = inPoint.y;
        this.points[j + 2] = outPoint.x;
        this.points[j + 3] = outPoint.y;
        j += 4;
      }
    }

    // Make the encapsulating border
    if (sidesToDraw < sides) {
      for (i = 0; i <= sidesToDraw; i += 1) {
        this.border[0].push(new Point(
          center.x + radius * Math.cos(i * this.dAngle * direction + rotation * direction),
          center.y + radius * Math.sin(i * this.dAngle * direction + rotation * direction),
        ));
      }
      for (i = sidesToDraw; i >= 0; i -= 1) {
        this.border[0].push(new Point(
          center.x + inRad * Math.cos(i * this.dAngle * direction + rotation * direction),
          center.y + inRad * Math.sin(i * this.dAngle * direction + rotation * direction),
        ));
      }
      this.border[0].push(this.border[0][0]._dup());
    } else {
      for (i = 0; i <= sidesToDraw; i += 1) {
        this.border[0].push(new Point(
          center.x + radius * Math.cos(i * this.dAngle * direction + rotation * direction),
          center.y + radius * Math.sin(i * this.dAngle * direction + rotation * direction),
        ));
      }
    }
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
    let count = Math.floor(drawAngle / this.dAngle) * 2.0 + 2;
    if (drawAngle >= Math.PI * 2.0) {
      count = this.numPoints;
    }
    return count;
  }
}

export default VertexPolygon;
