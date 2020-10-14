// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { OBJ_AnimationStep } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';


// export type OBJ_AnimationStep = {
//   duration?: number;
// } & OBJ_AnimationStep;

/**
 * Delay animation step
 * @extends AnimationStep
 */
export class DelayAnimationStep extends AnimationStep {
  constructor(
    numOrOptions: number | OBJ_AnimationStep = {},
    ...args: Array<OBJ_AnimationStep>
  ) {
    let options = {};
    const defaultOptions = { duration: 0 };
    if (typeof numOrOptions === 'number') {
      options = joinObjects({}, defaultOptions, { duration: numOrOptions }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, numOrOptions, ...args);
    }
    super(options);
    // this.duration = options.duration;
  }

  _dup() {
    const dup = new DelayAnimationStep();
    duplicateFromTo(this, dup);
    return dup;
  }

  // _getStateProperties() {  // eslint-disable-line class-methods-use-this
  //   return [...super._getStateProperties(),
  //     'callback',
  //     'startPercent',
  //     'progression',
  //   ];
  // }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'delayAnimationStep';
  }
}

export function delay(
  numOrOptionsIn: number | OBJ_AnimationStep = {},
  ...args: Array<OBJ_AnimationStep>
) {
  return new DelayAnimationStep(numOrOptionsIn, ...args);
}
