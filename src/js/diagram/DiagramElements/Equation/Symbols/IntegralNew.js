
// @flow
import {
  Point, quadBezierPoints,
} from '../../../../tools/g2';
import {
  range,
} from '../../../../tools/math';
import Symbol from './Symbol';


export default class Product extends Symbol {
  // eslint-disable-next-line class-methods-use-this
  getTriangles() {
    return 'strip';
  }

  // eslint-disable-next-line class-methods-use-this
  getWidth() {
    return (type: 'static' | 'dynamic', options: Object, height: number) => {
      // The width should be 7 times the thick2 linewidth;
      // const { lineWidth } = options;
      // let lineWidthToUse = lineWidth;
      // if (lineWidth == null) {
      //   lineWidthToUse = height * 0.93 / (25 * height + 15);
      // }
      // const width = lineWidthToUse * 7 * 3;
      // if (type === 'static') {
      //   return width * height;
      // }
      // return width;
      const { width } = options;
      let widthToUse = width;
      if (widthToUse == null) {
        widthToUse = height * 0.5;
      }
      if (options.type === 'static') {
        return widthToUse * height;
      }
      return widthToUse;
    };
  }

  //                                  
  //     --------------------------------------------------   0000000
  //     A                                              000000011111111
  //     |                                         0000000   111111111111
  //     |                                       0000000    11111111111111
  //     |                                      0000000     11111111111111
  //     |                                     0000000       111111111111
  //     |                                   000000000         11111111
  //     |                                  000000000
  //     |                                 0000000000
  //     |             gradient = k        000000000
  //     |                                0000000000
  //     |                                0000000000
  //     |                               00000000000
  //     |                              00000000000
  //     |                              000000000000
  //     |                             000000000000      a
  //   h |                     ------->000000000000<----------
  //     |                             000000000000
  //     |                             000000000000
  //     |                            000000000000
  //     |                             00000000000
  //     |                            00000000000
  //     |                            0000000000
  //     |                            0000000000
  //     |                            000000000
  //     |                           000000000
  //     |                          0000000000
  //     |      11111111           000000000
  //     |    111111111111       0000000
  //     |   11111111111111     0000000
  //     |   11111111111111   0000000
  //     |    111111111111   0000000
  //     V      111111110000000
  //     -------  0000000

  // S Curve thickened with a Guassian Curve
  //
  // S Curve:            h
  //         f(x) = -----------
  //                       -kx
  //                  1 + e
  //
  // Normal Distribution:
  //
  //                    1           -1/2((x - u) / s)^2
  //       f(x) = --------------- e
  //                s*sqrt(2π)
  //
  // Where s is sigma (standard deviation) and u is mu (mean).
  getPoints() {
    // $FlowFixMe
    return (options: Object, width: number, height: number) => {
      const { lineWidth, sides, percentage, tipWidth, serif } = options;

      const L = height;
      const xArray = range(-width / 2, width / 2, width / sides);
      const targetY = percentage * height;
      const k = -Math.log(height / targetY - 1) / width / 2;

      // leftPoints = [];
      // rightPoints = [];
      // centerPoints = [];
      let bottomTheta;
      const linePoints = [];
      xArray.forEach((x, index) => {
        const sigmoid = 1 / (1 + Math.exp(-k * x));
        const derivative = L * k * sigmoid * (1 - sigmoid);
        const theta = Math.atan(derivative);
        // const a = lineWidth * Math.sin(theta) / 2 + lineWidth / 2;
        const y = sigmoid * L;
        const a = (lineWidth / 2 - tipWidth / 2) * (Math.cos((y - height / 2) / (height) * Math.PI)) ** 2 + tipWidth / 2;
        const xDelta = a * Math.cos(theta + Math.PI / 2);
        const yDelta = a * Math.sin(theta + Math.PI / 2);
        linePoints.push(new Point(x + xDelta + width / 2, y + yDelta));
        linePoints.push(new Point(x - xDelta + width / 2, y - yDelta));
        if (index === 0) {
          bottomTheta = theta;
        }
      });

      if (serif === false) {
        return [linePoints, width, height];
      }
      const serifRadius = lineWidth * 0.7;
      const serifPoints = 10;

      const bottomCenter = new Point(
        linePoints[1].x + serifRadius * Math.cos(bottomTheta + Math.PI / 2),
        linePoints[1].y + serifRadius * Math.sin(bottomTheta + Math.PI / 2),
      );

      const topCenter = new Point(
        linePoints[linePoints.length - 2].x + serifRadius * Math.cos(bottomTheta - Math.PI / 2),
        linePoints[linePoints.length - 2].y + serifRadius * Math.sin(bottomTheta - Math.PI / 2),
      );

      const bottomSerifPoints = [];
      const topSerifPoints = [];
      const angleDelta = Math.PI * 2 / Math.max(sides, 3);
      for (let i = 0; i < sides + 1; i += 1) {
        bottomSerifPoints.push(linePoints[1]._dup());
        bottomSerifPoints.push(new Point(
          bottomCenter.x + serifRadius * Math.cos(angleDelta * i),
          bottomCenter.y + serifRadius * Math.sin(angleDelta * i),
        ));
        topSerifPoints.push(linePoints[linePoints.length - 2]._dup());
        topSerifPoints.push(new Point(
          topCenter.x + serifRadius * Math.cos(angleDelta * i),
          topCenter.y + serifRadius * Math.sin(angleDelta * i),
        ))
      }
      const points = [
        ...bottomSerifPoints,
        ...linePoints,
        ...topSerifPoints,
      ];
      // console.log(points)
      return [points, width, height];
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getPointsOld() {
    return (options: Object, width: number, height: number) => {
      const { lineWidth, sides, percentage, minLineWidth, sigma, radius, serif } = options;
      let lineWidthToUse = lineWidth;
      if (lineWidth == null) {
        // lineWidthToUse = width / (25 * height + 15);
        lineWidthToUse = width / 21;
      }
      let minLineWidthToUse = minLineWidth;
      if (minLineWidth == null) {
        minLineWidthToUse = lineWidthToUse / 2;
      }

      const targetY = percentage * height;
      const k = -Math.log(height / targetY - 1) / width / 2;
      // const k = 40;
      const L = height;
      const s = sigma || 0.07;
      const a = lineWidthToUse / 2 - minLineWidthToUse / 2;
      const bias = minLineWidthToUse / 2;
      const xArray = range(-width / 2, width / 2, width / sides);
      const yArray = xArray.map(x => L / (1 + Math.exp(-k * x)));
      const normDist = xArray.map(x => a / Math.sqrt(2 * Math.PI * s ** 2)
                                      * Math.exp(-(x ** 2) / (2 * s ** 2)));
      const xLeft = xArray.map((x, index) => x - normDist[index] - bias);
      const xRight = xArray.map((x, index) => x + normDist[index] + bias);
      
      // calculate upper serif properites
      const serifRadius = radius;
      const serifPoints = 30;
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
      const lowSerifPoints = [];
      if (serif) {
        for (let i = 0; i < serifPoints; i += 1) {
          lowSerifPoints.push(new Point(lowerSerifCenter.x + width / 2, lowerSerifCenter.y));
          const angle = lowerSerifStartAngle + dAngle * i;
          const perimeterPoint = new Point(
            lowerSerifCenter.x + serifRadius * Math.cos(angle),
            lowerSerifCenter.y + serifRadius * Math.sin(angle),
          );
          lowSerifPoints.push(new Point(perimeterPoint.x + width / 2, perimeterPoint.y));
        }
      }

      // yArray.map((y, index) => {
      //   const pLeft = new Point(xLeft[index], y);
      //   const pRight = new Point(xRight[index], y);

      //   this.points.push(pRight.x);
      //   this.points.push(pRight.y);
      //   this.points.push(pLeft.x);
      //   this.points.push(pLeft.y);
      //   borderLeft.push(pLeft._dup());
      //   borderRight.push(pRight._dup());
      //   return undefined;
      // });

      // upper serif
      const upperSerifPoints = [];
      if (serif) {
        for (let i = 0; i < serifPoints; i += 1) {
          upperSerifPoints.push(new Point(center.x + width / 2, center.y));
          const angle = startAngle + dAngle * i;
          const perimeterPoint = new Point(
            center.x + serifRadius * Math.cos(angle),
            center.y + serifRadius * Math.sin(angle),
          );
          upperSerifPoints.push(new Point(perimeterPoint.x + width / 2, perimeterPoint.y));
        }
      }

      let points = lowSerifPoints;
      yArray.forEach((y, index) => {
        points.push(new Point(xLeft[index] + width / 2, y));
        points.push(new Point(xRight[index] + width / 2, y));
      });
      points = [...points, ...upperSerifPoints];
      return [points, width, height];
    };
  }
}

  //                                                     0
  //                                               0
  //                                          0
  //                                        0
  //                                       0
  //                                      0
  //                                      0
  //                                     0
  //                                     0
  //                                    0
  //                                    0
  //                                   0
  //                                   0
  //                                  0
  //                                  0
  //                                 0
  //                                 0
  // 
