// @flow
import {
  Point, Line,
} from '../../../../tools/g2';
import Bracket from './Bracket';

export type TypeEquationSymbolAngleBracket = {
  symbol: 'angleBracket',
  side?: 'left' | 'right' | 'top' | 'bottom',
  lineWidth?: number,
  width?: number,
  draw?: 'static' | 'dynamic',
  staticHeight?: 'first' | number,
  color?: Array<number>;
  mods?: {};
};
export default class Bar extends Bracket {
  // eslint-disable-next-line class-methods-use-this

  // Angle Bracket
  //                         width
  //                      |<------->|
  //                      |         |
  //                      |      ___
  //           A          |     /  /
  //           |          |    /  /
  //           |          |   /  /
  //           |          |  /  /
  //           |            /  /
  //    height |           /  /
  //           |           \  \
  //           |            \  \
  //           |             \  \
  //           |              \  \
  //           |               \  \
  //           |                \  \
  //           V                 \__\

  // To calculate dimensions, need to solve the below where we know:
  //   * height (h)
  //   * width (w)
  //
  // Looking at the bottom half of the bracket:
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

  // eslint-disable-next-line class-methods-use-this
  getLeftPoints(
    options: Object,
    widthIn: number,
    height: number,
  ): [
    Array<Point>,
    Array<Point>,
    number,
    number,
  ] {
    // const { side } = options;
    const { lineWidth, width } = this.getVerticalDefaultValues(height, widthIn, options);
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

    // if (side === 'top' || side === 'bottom') {
    //   return this.getBracketPoints(leftPoints, rightPoints, side, height, width);
    // }
    return [leftPoints, rightPoints, width, height];
    // return this.getBracketPoints(leftPoints, rightPoints, side, width, height);
  }

  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getVerticalDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
      width?: number,
    }): {
      width: number,
      lineWidth: number,
    } {
    const out = {};
    if (width == null && options.width == null) {
      out.width = 97570.78 + (0.004958708 - 97570.78)
                  / (1 + (height / 2399858) ** 0.9383909);
    }
    if (width != null) {
      out.width = width;
    }
    if (options.width != null) {
      out.width = options.width;
    }
    if (options.lineWidth == null) {
      out.lineWidth = (0.2933614 + (0.0001418178 - 0.2933614)
                      / (1 + (height / 39.01413) ** 0.618041)) * 0.7;
    } else {
      out.lineWidth = options.lineWidth;
    }
    return out;
  }
}
