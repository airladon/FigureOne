// @flow

import {
  Point, Transform,
} from '../../../../tools/g2';
import WebGLInstance from '../../../webgl/webgl';
import VertexObject from '../../../DrawingObjects/VertexObject/VertexObject';

function range(start: number, stop: number, step: number) {
  const out = [];
  for (let i = start; i <= stop + step * 0.5; i += step) {
    out.push(i);
  }
  return out;
}

class VertexIntegral extends VertexObject {
  height: number;

  constructor(
    webgl: WebGLInstance,
    lineHeight: number = 1,
    serif: boolean = true,
  ) {
    super(webgl);
    this.glPrimative = this.gl.TRIANGLE_STRIP;
    // let mul = 0.5;
    // if (lineHeight === 1) {
    //   mul = 1;
    // }
    let mul = 0.3;
    if (lineHeight < 5) {
      mul = 1 - Math.log(lineHeight) / 2;
    }
    const k = 20;
    const L = 1;
    const sigma = 0.07;
    const a = 0.003 * mul;
    const bias = 0.01 * mul;
    const xArray = range(-0.18, 0.18, 0.01);
    const yArray = xArray.map(x => L / (1 + Math.exp(-k * x)));
    const normDist = xArray.map(x => a / Math.sqrt(2 * Math.PI * sigma ** 2)
                                     * Math.exp(-(x ** 2) / (2 * sigma ** 2)));
    const xLeft = xArray.map((x, index) => x - normDist[index] - bias);
    const xRight = xArray.map((x, index) => x + normDist[index] + bias);
    const serifRadius = 0.03 * mul;
    const serifPoints = 30;

    // calculate upper serif properites
    const num = xLeft.length;
    const upperSerifPoint = new Point(xLeft[num - 1], yArray[num - 1]);
    const gradient = k * yArray[num - 1] * (L - yArray[num - 1]);
    const theta = Math.atan(gradient);
    const alpha = Math.PI / 2 - theta;

    const center = upperSerifPoint.add(new Point(
      serifRadius * Math.cos(alpha),
      -serifRadius * Math.sin(alpha),
    ));
    const dAngle = Math.PI * 2 / (serifPoints - 1);
    const startAngle = Math.PI / 2 + theta;

    // calculate lower serif properties
    const lowerSerifCenter = new Point(-center.x, L - center.y);
    const lowerSerifStartAngle = -alpha;

    // lower serif
    if (serif) {
      this.border.push([]);
      this.border.push([]);
      for (let i = 0; i < serifPoints; i += 1) {
        this.points.push(lowerSerifCenter.x);
        this.points.push(lowerSerifCenter.y);
        const angle = lowerSerifStartAngle + dAngle * i;
        const perimeterPoint = new Point(
          lowerSerifCenter.x + serifRadius * Math.cos(angle),
          lowerSerifCenter.y + serifRadius * Math.sin(angle),
        );
        this.points.push(perimeterPoint.x);
        this.points.push(perimeterPoint.y);
        this.border[1].push(perimeterPoint);
      }
    }

    const borderLeft = [];
    const borderRight = [];
    yArray.map((y, index) => {
      const pLeft = new Point(xLeft[index], y);
      const pRight = new Point(xRight[index], y);

      this.points.push(pRight.x);
      this.points.push(pRight.y);
      this.points.push(pLeft.x);
      this.points.push(pLeft.y);
      borderLeft.push(pLeft._dup());
      borderRight.push(pRight._dup());
      return undefined;
    });

    // upper serif
    if (serif) {
      for (let i = 0; i < serifPoints; i += 1) {
        this.points.push(center.x);
        this.points.push(center.y);
        const angle = startAngle + dAngle * i;
        const perimeterPoint = new Point(
          center.x + serifRadius * Math.cos(angle),
          center.y + serifRadius * Math.sin(angle),
        );
        this.points.push(perimeterPoint.x);
        this.points.push(perimeterPoint.y);
        this.border[2].push(perimeterPoint);
      }
    }

    this.border[0] = borderLeft.concat(borderRight.reverse());
    this.border[0].push(this.border[0][0]._dup());

    // normalize all points to have bottom left corner at 0,0
    // and height to be 1.
    const bounds = this.getGLBoundingRect(new Transform().matrix());
    const t = new Transform()
      .translate(-bounds.left, -bounds.bottom)
      .scale(1 / bounds.height, 1 / bounds.height);

    for (let i = 0; i < this.border.length; i += 1) {
      const border = this.border[i];
      for (let j = 0; j < border.length; j += 1) {
        this.border[i][j] = this.border[i][j].transformBy(t.matrix());
      }
    }

    for (let i = 0; i < this.points.length; i += 2) {
      const p = new Point(this.points[i], this.points[i + 1]);
      const newP = p.transformBy(t.matrix());
      this.points[i] = newP.x;
      this.points[i + 1] = newP.y;
    }

    // this.points[0] = new Point(0, 0);
    // this.points[1] = new Point(0, 0.5);
    // this.points[2] = new Point(0.5, 0.5);
    this.setupBuffer();
  }
}
export default VertexIntegral;

