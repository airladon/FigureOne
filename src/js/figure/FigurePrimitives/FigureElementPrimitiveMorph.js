// @flow
import { FigureElementPrimitive } from '../Element';
import { CustomAnimationStep } from '../Animation/AnimationStep/CustomStep';
import AnimationManager from '../Animation/AnimationManager';
import type { OBJ_AnimationStep } from '../Animation/AnimationStep';


/**
 * FigureElementPrimitiveMorph is a primitive for morphin vertices.
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
