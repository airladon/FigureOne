// @flow
import {
  Point, Transform,
} from '../../../../tools/g2';
import Bracket from './Bracket';


export default class Bar extends Bracket {
  // eslint-disable-next-line class-methods-use-this
  getWidth() {
    return (type: 'static' | 'dynamic', options: Object, height: number) => {
      const { width } = options;
      if (type === 'static') {
        return height * width;
      }
      return width;
    };
  }

  //  - Curve R1 and R2 are repeated 4 times in brace
  //  - Curve R1 is a full 90º circle
  //  - Curve R2 > R1 and is less than 90º
  //                                       width
  //                               |<--------------->|
  //                               |                 |
  //                               |                *|
  //           A                   |              * *
  //           |                   |       R1   *  *
  //           |                   |          *   *  R2
  //           |                   |        *    *
  //           |                   |       *    *
  //           |                   |       *    *
  //           |                   |      *    *
  //           |                   |      *    *
  //           |                   |      *    *
  //           |                   |      *    *
  //           |                   |      *    *
  //           |                   |      *    *
  //           |                   |      *    *
  //           |                   |      *    *
  //           |                   |      *    *
  //           |                   |      *    *
  //           |                   |     *    *
  //           |                   |     *    *
  //           |                   |    *    *
  //           |                      *   *
  //   height  |                    *  *
  //           |                   * *
  //           |          A        * *
  //           |          |          *  *
  //           |          |        |   *   *
  //           |          |        |     *    *
  //           |          |        |      *    *
  //           |          |        |      *    *
  //           |          |        |       *    *
  //           |          |        |       *    *
  //           |          |        |       *    *
  //           |          |        |       *    *
  //           |    h / 2 |        |       *    *
  //           |          |        |       *    *
  //           |          |        |       *    *
  //           |          |        |       *    *
  //           |          |        |       *    *
  //           |          |        |       *    *
  //           |          |        |        *    *
  //           |          |        |        *    *
  //           |          |        |         *    *
  //           |          |        |           *   *
  //           |          |        |             *  *
  //           V          V        |_______________ *
  //                           (0,0)
  //

  // The solution to a circle that intersect at the same
  //
  //                       |OOO ooo
  //                       |       OOo
  //                       |         | OOo              A
  //                       |         |    OOo           |
  //                       |         |      OOo         |
  //                       |         |        OOo       |
  //                       |         |         OOo      | h
  //                       |         |          OOo     |
  //                       |         |           OOo    |
  //                       |         |           OOo    |
  //                       C---------|-----------OOo    V
  //                       |         |      w      |
  //                       |         |<----------->|
  //                       |                       |
  //                       |          r            |
  //                       |<--------------------->|
  // Circle with radius r intersects a vertical line with height h
  // a distance w from the circle horizontal.
  //
  // Calculate r:
  //          w^2 + h^2
  //     r = -----------
  //              2w
  //
  // Calculate angle from center C to intersection with h:
  //
  //     theta = arcsin (h / r))
  //
  //
  //
  //  For the brace case, the outside radius is a full 90º arc
  //  The inside arc is calculated from the top equations where
  //
  //       w = outsideRadius - lineWidth
  //
  //                              width
  //                   <---------------------->
  //
  //           A       OOO ooo
  //  TipWidth |       00o    OOo
  //           V       00o        OOo   ---------------
  //                     00o         OOo              A
  //                       00o           OOo          |
  //                        00o            OOo        |
  //                         00o            OOo       | h
  //                         00o             OOo      |
  //                          00o            OOo      |
  //  Ci              Co      00o            OOo      V
  //  |                |
  //  |                |     |  line width     |
  //  |                |     |<--------------->|
  //  |                |     |                 |
  //  |  inside radius |     |                 |
  //  |<-------------------->|                 |
  //                   |                       |
  //                   |    outside radius     |
  //                   |<--------------------->|
  //
  //
  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    return (options: Object, height: number) => {
      const {
        lineWidth, width, sides, tipWidth,
      } = options;

      const outsideRadius = (width / 2 + lineWidth / 2);
      const h = outsideRadius - tipWidth;
      const w = outsideRadius - lineWidth;
      // const w = lineWidth;
      const insideRadius = (w ** 2 + h ** 2) / (2 * w);
      const leftPoints = [];
      const rightPoints = [];
      const outsideStep = Math.PI / 2 / sides;

      const insideStep = Math.asin(h / insideRadius) / sides;

      const insidePoints = [];
      const outsidePoints = [];
      for (let i = 0; i < sides + 1; i += 1) {
        const outsideAngle = i * outsideStep;
        const insideAngle = i * insideStep;
        outsidePoints.push(new Point(
          outsideRadius * Math.cos(outsideAngle),
          outsideRadius * Math.sin(outsideAngle),
        ));
        insidePoints.push(new Point(
          insideRadius * Math.cos(insideAngle) - insideRadius + outsideRadius - lineWidth,
          insideRadius * Math.sin(insideAngle),
        ));
      }

      // const topCurveCenter = new Point(width, height - outsideRadius);
      let m = (new Transform().scale(-1, 1).translate(
        width, height - outsideRadius,
      )).m();
      for (let i = 0; i < sides + 1; i += 1) {
        leftPoints.push(outsidePoints[sides - i].transformBy(m));
        rightPoints.push(insidePoints[sides - i].transformBy(m));
      }

      m = (new Transform().scale(1, -1).translate(
        0,
        height / 2 - tipWidth / 2 + outsideRadius,
      )).m();
      for (let i = 0; i < sides + 1; i += 1) {
        leftPoints.push(insidePoints[i].transformBy(m));
        rightPoints.push(outsidePoints[i].transformBy(m));
      }

      m = (new Transform().translate(
        0,
        height / 2 + tipWidth / 2 - outsideRadius,
      )).m();
      for (let i = 0; i < sides + 1; i += 1) {
        leftPoints.push(insidePoints[sides - i].transformBy(m));
        rightPoints.push(outsidePoints[sides - i].transformBy(m));
      }

      m = (new Transform().scale(-1, -1).translate(
        width,
        outsideRadius,
      )).m();
      for (let i = 0; i < sides + 1; i += 1) {
        leftPoints.push(outsidePoints[i].transformBy(m));
        rightPoints.push(insidePoints[i].transformBy(m));
      }

      return [leftPoints, rightPoints, width, height];
    };
  }
}
