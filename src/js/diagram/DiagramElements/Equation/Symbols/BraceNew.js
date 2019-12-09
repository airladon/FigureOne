// @flow
import {
  Point, Transform,
} from '../../../../tools/g2';
import Bracket from './BracketNew';


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

  //                              width
  //                   <---------------------->
  //
  //           A       OOO ooo                        A
  //  TipWidth |       00o    OOo                     |
  //           V       00o        OOo                 |
  //                    00o          OOo              |
  //                     00o           OOo            | h = outside radius
  //                      00o            OOo          |
  //                      00o              OOo        |
  //                       00o             OOo        |
  //                       00o              OOo       |
  //  Ci              Co    00o              OOo      V
  //  |                |
  //  |                |  w  |  line width     |
  //  |                |<--->|<--------------->|
  //  |                |     |                 |
  //  |  inside radius |     |                 |
  //  |<-------------------->|                 |
  //                   |                       |
  //                   |    outside radius     |
  //                   |<--------------------->|
  //
  // The solution to a circle that intersect at the same
  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    return (options: Object, height: number) => {
      const {
        lineWidth, width, sides, tipWidth,
      } = options;

      const outsideRadius = (width / 2 + lineWidth / 2);
      const h = outsideRadius - tipWidth;
      const w = outsideRadius - lineWidth;
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
