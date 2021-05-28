// @flow
import { FigureElementPrimitive } from '../Element';
import { CustomAnimationStep } from '../Animation/AnimationStep/CustomStep';
import AnimationManager from '../Animation/AnimationManager';
import type { OBJ_AnimationStep } from '../Animation/AnimationStep';


/**
   * {@link FigureElementPrimitive} that can efficiently translate large numbers
   * of points.
   *
   * ![](./apiassets/morph.gif)
   *
   * ![](./apiassets/morph2.gif)
   *
   * The morph primitive is optimized to animate hundreds of thousands of
   * points with minimal performance impact.
   *
   * Multiple arrays of points can be defined, and the translation of
   * corresponding points in two arrays can be animated.
   *
   * Being able to accomodate so many points means this primitive can be used to
   * efficiently morph shapes.
   *
   * All points in all point arrays can be assigned an individual color if
   * desired. Use `color: TypeColor` to assign all points in all arrays the same
   * color, `color: Array<TypeColor>` to assign all points in each array a
   * specific color, `color: Array<Array<TypeColor>>` to assign each point in
   * each array a specific color, and
   * `color: Array<TypeColor | Array<TypeColor>` to assign some point arrays
   * with one color, and others with a specific color per point.
   *
   * A point array is an array of numbers representing consecutive x, y points.
   * For example, [x1, y1, x2, y2, ...].
   *
   * A color array is an array of numbers representing the color of each points.
   * For example, [r1, g1, b1, a1, r2, g2, b2, a2, ...].
   *
   * If `color` is an array of colors and/or color arrays, then the its length
   * must be equal to the number of point Arrays. The colors in the array will
   * be matched up with the corresponding point arrays in `points`.
   *
   * This element's specialty is creating a visual effect, and so does not
   * automatically calculate touch borders, and doesn't allow for color changes
   * (with the `setColor`, `dim`, and `undim` methods). If touch borders are
   * desired then either setup touch borders manually, or use a different
   * element as a touch pad.
   *
   * This element comes with two specialized methods and an animation step:
   *  - `setPoints` - sets points to a specific point array
   *  - `setPointsBetween` - sets points to a position between two point arrays
   *  - `animations.morph` - morph between `start` and `target`
   *
   * Note, while animation is efficient, loading or generating hundreds of
   * thousands of points when first instantiated can be slow on lower
   * end systems, and may need to be accounted for (like letting the user know
   * that loading is ongoing).
   *
   * @example
   * const { polylineToShapes, getPolygonCorners } = Fig.tools.morph;
   * const { range } = Fig.tools.math;
   *
   * // Number of shapes that make up the lines
   * const n = 300;
   *
   * // Generate a line of points along a sinc function
   * const sinc = (xIn, a, b) => {
   *   const x = xIn === 0 ? 0.00001 : xIn;
   *   return a * Math.sin(b * x) / (b * x);
   * };
   *
   * // Generate line of shapes along a sinc function
   * const xValues = range(-0.8, 0.8, 0.01);
   * const [sincPoints] = polylineToShapes({
   *   points: xValues.map(x => [x, sinc(x, 0.6, 20)]),
   *   num: n,
   *   size: 0.04,
   *   shape: 15,
   * });
   *
   * // Generate a line of shapes along a square
   * const [squarePoints] = polylineToShapes({
   *   points: [[0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]],
   *   num: n,
   *   size: 0.04,
   *   close: true,
   *   shape: 15,
   * });
   *
   * // Generate a line of shapes along a circle
   * const [circlePoints] = polylineToShapes({
   *   points: getPolygonCorners({ radius: 0.5, sides: 50, rotation: Math.PI / 4 }),
   *   num: n,
   *   size: 0.04,
   *   close: true,
   *   shape: 15,
   * });
   *
   * const morpher = figure.add({
   *   make: 'morph',
   *   names: ['sinc', 'square', 'circle'],
   *   points: [sincPoints, squarePoints, circlePoints],
   *   color: [1, 0, 0, 1],
   * });
   *
   * // Animate morph
   * morpher.animations.new()
   *   .delay(1)
   *   .morph({ start: 'sinc', target: 'square', duration: 2 })
   *   .morph({ start: 'square', target: 'circle', duration: 2 })
   *   .morph({ start: 'circle', target: 'sinc', duration: 2 })
   *   .start();
   *
   * @example
   * const { imageToShapes, circleCloudShapes, polylineToShapes } = Fig.tools.morph;
   * const { range } = Fig.tools.math;
   *
   * const image = new Image();
   * image.src = './logocolored.png';
   * image.onload = () => {
   *   const [logo, logoColors] = imageToShapes({
   *     image,
   *     width: 2,
   *     height: 2,
   *     dither: 0.003,
   *   });
   *
   *   const n = logo.length / 2 / 6;
   *   const cloud = circleCloudShapes({
   *     radius: 3,
   *     num: n,
   *     size: 0.005,
   *   });
   *
   *   const xValues = range(-0.8, 0.8, 0.001);
   *   const [sine] = polylineToShapes({
   *     points: xValues.map(x => [x, 0.3 * Math.sin(x * 2 * Math.PI / 0.4)]),
   *     num: n,
   *     size: 0.01,
   *   });
   *
   *   const m = figure.add({
   *     make: 'morph',
   *     points: [cloud, logo, sine],
   *     names: ['cloud', 'logo', 'sine'],
   *     color: [logoColors, logoColors, [0, 0, 1, 1]],
   *   });
   *
   *   m.setPoints('sine');
   *   m.animations.new()
   *     .delay(1)
   *     .morph({ start: 'sine', target: 'cloud', duration: 2 })
   *     .morph({ start: 'cloud', target: 'logo', duration: 2 })
   *     .start();
   * };
   */
// $FlowFixMe
export default class FigureElementPrimitiveMorph extends FigureElementPrimitive {
  shapeNameMap: {
    [name: string]: number,
  };

  animations: {
    morph: (OBJ_AnimationStep) => CustomAnimationStep,
  } & AnimationManager;

  /**
   * Set points position to be between two points arrays
   * @param {string | number} from name or index of point array to morph from
   * @param {string | number} to name or index of point array to morph to
   * @param {number} percent percent of morph between from and to
   */
  setPointsBetween(
    from: string | number,
    to: string | number,
    percent: number,
  ) {
    this.drawingObject.updateUniform('u_from', this.getIndex(from));
    this.drawingObject.updateUniform('u_to', this.getIndex(to));
    this.drawingObject.updateUniform('u_percent', percent);
  }

  /**
   * Set points to equal a point array
   * @param {string | number} points point array name or index to set
   */
  setPoints(points: string | number) {
    this.drawingObject.updateUniform('u_from', this.getIndex(points));
    this.drawingObject.updateUniform('u_to', this.getIndex(points));
    this.drawingObject.updateUniform('u_percent', 0);
  }

  getIndex = (shapeNameOrIndex: string | number) => {
    if (typeof shapeNameOrIndex === 'string') {
      return this.shapeNameMap[shapeNameOrIndex];
    }
    return shapeNameOrIndex;
  }
}
