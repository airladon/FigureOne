
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


export default class IntegralNew extends Symbol {
  // eslint-disable-next-line class-methods-use-this
  getTriangles() {
    return 'strip';
  }

  // eslint-disable-next-line class-methods-use-this
  getWidth() {
    return (options: Object, height: number) => {
      let width;
      if (options.draw === 'static') {
        let { staticHeight } = options;
        if (typeof staticHeight !== 'number') {
          staticHeight = height;
        }
        ({ width } = this.getDefaultValues(staticHeight, null, options));
        return width / staticHeight * height;
      }
      ({ width } = options);
      ({ width } = this.getDefaultValues(height, width, options));
      return width;
    };
  }

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
  //     |    111111111111       0000000
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
        sides, serif, // lineWidth, tipWidth,
      } = options;
      const { lineWidth, width, tipWidth } = this.getDefaultValues(
        height,
        widthIn,
        options,
      );

      const percentage = 0.99999999999;
      const h = height;
      const serifRadius = lineWidth * 0.7;
      let widthWithoutSerifs = width;
      if (serif) {
        widthWithoutSerifs = width - serifRadius * 2;
      }
      const xArray = range(
        -widthWithoutSerifs / 2,
        widthWithoutSerifs / 2,
        widthWithoutSerifs / sides,
      );
      const targetY = percentage * height;
      const k = -Math.log(height / targetY - 1) / width / 2;

      let bottomTheta = 0;
      const linePoints = [];
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
        linePoints.push(new Point(x + xDelta + width / 2, y + yDelta));
        linePoints.push(new Point(x - xDelta + width / 2, y - yDelta));
        if (index === 0) {
          bottomTheta = theta;
        }
      });

      if (serif === false) {
        return [linePoints, width, height];
      }
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
      const angleDelta = Math.PI * 2 / Math.max(serifPoints, 3);
      for (let i = 0; i < serifPoints + 1; i += 1) {
        bottomSerifPoints.push(linePoints[1]._dup());
        bottomSerifPoints.push(new Point(
          bottomCenter.x + serifRadius * Math.cos(angleDelta * i),
          bottomCenter.y + serifRadius * Math.sin(angleDelta * i),
        ));
        topSerifPoints.push(linePoints[linePoints.length - 2]._dup());
        topSerifPoints.push(new Point(
          topCenter.x + serifRadius * Math.cos(angleDelta * i),
          topCenter.y + serifRadius * Math.sin(angleDelta * i),
        ));
      }
      const points = [
        ...bottomSerifPoints,
        ...linePoints,
        ...topSerifPoints,
      ];
      return [points, width, height];
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
      tipWidth?: number,
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
    const out = {
      lineWidth: 607.73 + (0.0004220802 - 607.73) / (1 + (height / 5368595) ** 0.6370402),
      width: 12277.16 + (0.003737719 - 12277.16) / (1 + (height / 36507180) ** 0.6193363),
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
