// @flow
import {
  Point, Line,
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

  // Angle Bracket
  //                       width
  //                      |<--->|
  //                      |
  //           A          |     /
  //           |          |    /
  //           |          |   /
  //           |             /
  //           |            /
  //    height |           /
  //           |           \
  //           |            \
  //           |             \
  //           |              \
  //           |               \
  //           |                \
  //           V                 \

  // To calculate dimensions, need to solve the below where we know:
  //   * height (h)
  //   * width (w)
  //
  //   - Draw a circle at B of radius lineWidth
  //   - This circle will touch an extended line C at a right angle (R)
  //   - Line E is the line from the circle center (B) to the tangent point (R)
  //   - Line A is the secant and the extended line C is the tangent of the
  //     the angle Theta which is angle between the line A and line E
  //   - The angle between lines E and D is also a right angle (as C || D),
  //     therefore we can calculate the angle between A and D (Beta)
  //   - Calculate the angle from the horiontal to A: a = arctan2(h/2, w)
  //   - Calculate the angle from the horizontal to D: alpha = a + Beta
  //   - Calculate the horizontal component of D: Dh = h / 2 / tan(alpha)
  //   - Calculate Tip Width = w - Dh
  //
  //                                 width
  //                   |<------------------------------>|
  //                   |                                |
  //                   |   tip width           Dh       |
  //                   |<-------------->|<------------->|
  //
  //          ______   __________________...............:
  //          A        :\*               \              :
  //          |        : \  *             \             :
  //          |        :  \   *            \            :
  //          |        :   \    *           \           :
  //          |        :    \     *          \          :
  //          |        :     \      *         \         :
  //          |        :      \       * A      \ D      :
  //   h / 2  |        :       \        *       \       :
  //          |        :        \         *      \      :
  //          |        :       C \          *     \     :
  //          |        :          \           *    \    :
  //          |        :           \            *   \   :
  //          |        :            \             *  \  :
  //          |        :             \              * \ :
  //          |        :              \               *\:
  //          V_____   :...............\________________\  B
  //                                    \               *
  //                        C extension  \          *
  //                                      \      *   E
  //                                     R \ *

  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    return (options: Object, height: number) => {
      const {
        lineWidth, width,
      } = options;
      const line = new Line(new Point(0, 0), new Point(width, height / 2));
      const theta = Math.acos(lineWidth / line.distance);
      const beta = Math.PI / 2 - theta;
      const alpha = line.ang + beta;
      const tipWidth = width - height / 2 / Math.tan(alpha);

      const leftPoints = [
        new Point(width - tipWidth, 0),
        new Point(0, height / 2),
        new Point(width - tipWidth, height),
      ];
      const rightPoints = [
        new Point(width, 0),
        new Point(tipWidth, height / 2),
        new Point(width, height),
      ];

      return [leftPoints, rightPoints, width, height];
    };
  }
}
