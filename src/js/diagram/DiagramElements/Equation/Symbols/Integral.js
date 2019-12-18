
// @flow
import {
  Point,
} from '../../../../tools/g2';
// import {
//   joinObjects,
// } from '../../../../tools/tools';
import {
  range,
} from '../../../../tools/math';
import Symbol from './Symbol';


export default class Integral extends Symbol {
  // eslint-disable-next-line class-methods-use-this
  getTriangles() {
    return 'triangles';
  }

  // eslint-disable-next-line class-methods-use-this
  // getWidth() {
  //   return (options: Object, height: number) => {
  //     let width;
  //     if (options.draw === 'static') {
  //       let { staticHeight } = options;
  //       if (typeof staticHeight !== 'number') {
  //         staticHeight = height;
  //       }
  //       ({ width } = this.getDefaultValues(staticHeight, null, options));
  //       return width / staticHeight * height;
  //     }
  //     ({ width } = options);
  //     ({ width } = this.getDefaultValues(height, width, options));
  //     return width;
  //   };
  // }

  //     --------------------------------------------------   0000000
  //     A                                              000000011111111
  //     |                                         0000000   111111111111
  //     |                                       0000000    11111111111111
  //     |                                      0000000     11111111111111
  //     |                                     0000000       111111111111
  //     |                                   000000000         11111111
  //     |                                  000000000
  //     |                                 0000000000
  //     |    S curve gradient = k         000000000
  //     |                                0000000000
  //     |                                0000000000
  //     |                               00000000000
  //     |                              00000000000
  //     |                              000000000000
  //     |                             000000000000      lineWidth
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
  //     |    111111111111       00000000
  //     |   11111111111111     0000000
  //     |   11111111111111   0000000
  //     |    111111111111   0000000
  //     V      111111110000000
  //     -------  0000000

  // Integral line is generated from a sigmoid function (S-curve) that is
  // thickened more in middle than on ends (square of cosine of normalized
  // height)
  //
  // S (sigmoid) Curve:
  //                    h
  //         s(x) = -----------            (1)
  //                       -kx
  //                  1 + e
  //
  // It's derivative is:
  //
  //        ds
  //       ----  =  h k s (1 - s)          (2)
  //        dx
  //
  // The angle theta of the curve at some given x can is then:
  //
  //     theta = atan(ds/dx)               (3)
  //
  //
  // If you know s, x and want to find k, then can rearrange the above to:
  //
  //      k = -ln((h / s) - 1) / x         (4)
  //
  // Procedure:
  //    - Find gradient where s = 0.999999 of the height and x is w / 2
  //    - Make an xRange from w / 2 to w / 2 (with buffer for serif)
  //    - Go through all x and:
  //        - Find y from (1)
  //        - Find the derivative at x using (2) and theta using (3)
  //        - Find the left and right sides of the line using theta + PI / 2
  //          and add more thickness in the middle
  //
  //    - Find serifs by:
  //        - Go to end outside point and find its theta
  //        - Center of serif is then at vector from end point to
  //          theta + π/2 with magnitude of serif radius
  //        - Draw circle at serif
  //
  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    return (options: Object, widthIn: number, height: number) => {
      const {
        sides, serif, num, type, serifSides, lineIntegralSides,
      } = options;
      const { lineWidth, width, tipWidth } = this.getDefaultValues(
        height,
        widthIn,
        options,
      );
      const singleWidth = width - (num - 1) * lineWidth * 3;
      const percentage = 0.99999999999;
      const h = height;
      const serifRadius = lineWidth * 0.7;
      let widthWithoutSerifs = singleWidth;
      if (serif) {
        widthWithoutSerifs = singleWidth - serifRadius * 2;
      }
      const xArray = range(
        -widthWithoutSerifs / 2,
        widthWithoutSerifs / 2,
        widthWithoutSerifs / sides,
      );
      const targetY = percentage * height;
      const k = -Math.log(height / targetY - 1) / singleWidth / 2;

      let bottomTheta = 0;
      const linePoints = [];
      let prevLeft;
      let prevRight;
      xArray.forEach((x, index) => {
        const sigmoid = 1 / (1 + Math.exp(-k * x));
        const derivative = h * k * sigmoid * (1 - sigmoid);
        const theta = Math.atan(derivative);
        const y = sigmoid * h;
        const a = (lineWidth / 2 - tipWidth / 2)
                 * (Math.cos((y - height / 2) / height * Math.PI)) ** 2
                 + tipWidth / 2;
        const xDelta = a * Math.cos(theta + Math.PI / 2);
        const yDelta = a * Math.sin(theta + Math.PI / 2);
        const left = new Point(x + xDelta + singleWidth / 2, y + yDelta);
        const right = new Point(x - xDelta + singleWidth / 2, y - yDelta);
        if (index > 0) {
          linePoints.push(prevLeft._dup());
          linePoints.push(prevRight._dup());
          linePoints.push(right._dup());
          linePoints.push(prevLeft._dup());
          linePoints.push(right._dup());
          linePoints.push(left._dup());
        }
        prevLeft = left;
        prevRight = right;
        if (index === 0) {
          bottomTheta = theta;
        }
      });

      let points = [];
      if (serif === false) {
        points = linePoints;
      } else {
        const serifPoints = serifSides;

        const bottomCenter = new Point(
          linePoints[1].x + serifRadius * Math.cos(bottomTheta + Math.PI / 2),
          linePoints[1].y + serifRadius * Math.sin(bottomTheta + Math.PI / 2),
        );

        const topCenter = new Point(
          linePoints[linePoints.length - 1].x + serifRadius * Math.cos(bottomTheta - Math.PI / 2),
          linePoints[linePoints.length - 1].y + serifRadius * Math.sin(bottomTheta - Math.PI / 2),
        );

        const bottomSerifPoints = [];
        const topSerifPoints = [];
        const angleDelta = Math.PI * 2 / Math.max(serifPoints, 3);
        let prevBottom = new Point(0, 0); // initialied for flow only
        let prevTop = new Point(0, 0);    // initialied for flow only
        for (let i = 0; i < serifPoints + 1; i += 1) {
          const bottom = new Point(
            bottomCenter.x + serifRadius * Math.cos(angleDelta * i),
            bottomCenter.y + serifRadius * Math.sin(angleDelta * i),
          );
          const top = new Point(
            topCenter.x + serifRadius * Math.cos(angleDelta * i),
            topCenter.y + serifRadius * Math.sin(angleDelta * i),
          );
          if (i > 0) {
            bottomSerifPoints.push(linePoints[1]._dup());
            bottomSerifPoints.push(prevBottom._dup());
            bottomSerifPoints.push(bottom._dup());
            topSerifPoints.push(linePoints[linePoints.length - 2]._dup());
            topSerifPoints.push(prevTop._dup());
            topSerifPoints.push(top._dup());
          }
          prevBottom = bottom;
          prevTop = top;
        }
        points = [
          ...bottomSerifPoints,
          ...linePoints,
          ...topSerifPoints,
        ];
      }
      const numPoints = points.length;
      for (let i = 1; i < num; i += 1) {
        for (let j = 0; j < numPoints; j += 1) {
          points.push(points[j].add(lineWidth * 3 * i, 0));
        }
        // width = width + lineWidth * 2;
      }
      if (type === 'line') {
        const lineIntegralEllipsePoints = this.getLineIntegralPoints(
          lineWidth, num, width, height, lineIntegralSides,
        );
        points = [...points, ...lineIntegralEllipsePoints];
      }
      return [points, width, height];
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getLineIntegralPoints(
    lineWidth: number,
    num: number,
    width: number,
    height: number,
    sides: number,
  ) {
    const ellipseHeight = lineWidth * 6;
    const ellipseWidth = Math.max(
      ellipseHeight,
      (lineWidth * 3 + (num - 1) * lineWidth * 3 / 2) * 2,
    );
    const center = new Point(width / 2, height / 2);
    const deltaAngle = Math.PI * 2 / sides;
    let prevOuter = new Point(0, 0);
    let prevInner = new Point(0, 0);
    const ellipseLineWidth = lineWidth / 2;
    const points = [];
    for (let i = 0; i < sides + 1; i += 1) {
      const angle = i * deltaAngle;
      const inner = new Point(
        (ellipseWidth / 2 - ellipseLineWidth / 2) * Math.cos(angle),
        (ellipseHeight / 2 - ellipseLineWidth / 2) * Math.sin(angle),
      ).add(center);
      const outer = new Point(
        (ellipseWidth / 2 + ellipseLineWidth / 2) * Math.cos(angle),
        (ellipseHeight / 2 + ellipseLineWidth / 2) * Math.sin(angle),
      ).add(center);
      if (i > 0) {
        points.push(prevOuter._dup());
        points.push(prevInner._dup());
        points.push(inner._dup());
        points.push(prevOuter._dup());
        points.push(inner._dup());
        points.push(outer._dup());
      }
      prevOuter = outer;
      prevInner = inner;
    }
    return points;
  }

  // eslint-disable-next-line class-methods-use-this
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth: number,
      tipWidth: number,
      num: number,
    }) {
    // at 2:
    //    lw = 0.05 (40)
    //     w = 0.4 (5)
    //     e = 0.01 (200)
    //
    // at 1:
    //    lw = 0.03 (33)
    //     w = 0.25 (4)
    //     e = 0.01 (100)
    //
    // at 0.5:
    //    lw = 0.02 (25)
    //     w = 0.15 (3.3)
    //     e = 0.008 (63)
    //
    // at 0.3:
    //    lw = 0.017 (17)
    //     w = 0.15 (2)
    //     e = 0.006 (50)
    //
    // Using https://mycurvefit.com and add 0 to each to keep values under 0.3 positive
    const defaultLineWidth = 607.73 + (0.0004220802 - 607.73)
      / (1 + (height / 5368595) ** 0.6370402);
    const defaultSingleWidth = 12277.16 + (0.003737719 - 12277.16)
      / (1 + (height / 36507180) ** 0.6193363);
    const defaultTotalWidth = defaultSingleWidth + ((options.num - 1) * defaultLineWidth * 3);
    const out = {
      lineWidth: defaultLineWidth,
      width: defaultTotalWidth,
      tipWidth: 0.01033455 + (0.000004751934 - 0.01033455) / (1 + (height / 0.2588074) ** 2.024942),
    };
    if (width != null) {
      out.width = width;
    }
    if (options.lineWidth != null) {
      out.lineWidth = options.lineWidth;
    }
    if (options.tipWidth != null) {
      out.tipWidth = options.tipWidth;
    }
    return out;
  }
}
