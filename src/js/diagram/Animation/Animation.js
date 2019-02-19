// @flow
import type {
  TypePositionAnimationStepInputOptions,
} from './AnimationStep/ElementAnimationStep/PositionAnimationStep';
import PositionAnimationStep from './AnimationStep/ElementAnimationStep/PositionAnimationStep';

import type {
  TypeTransformAnimationStepInputOptions,
} from './AnimationStep/ElementAnimationStep/TransformAnimationStep';
import TransformAnimationStep from './AnimationStep/ElementAnimationStep/TransformAnimationStep';

import type {
  TypeParallelAnimationStepInputOptions,
} from './AnimationStep/ParallelAnimationStep';
import ParallelAnimationStep from './AnimationStep/ParallelAnimationStep';

import type {
  TypeSerialAnimationStepInputOptions,
} from './AnimationStep/SerialAnimationStep';
import SerialAnimationStep from './AnimationStep/SerialAnimationStep';

import type {
  TypeAnimationStepInputOptions,
} from './AnimationStep';
import AnimationStep from './AnimationStep';

import type { TypeAnimatorInputOptions } from './Animator';
import Animator from './Animator';

export type {
  TypePositionAnimationStepInputOptions, TypeAnimatorInputOptions,
  TypeParallelAnimationStepInputOptions, TypeSerialAnimationStepInputOptions,
  TypeTransformAnimationStepInputOptions, TypeAnimationStepInputOptions,
};
export {
  PositionAnimationStep, Animator, ParallelAnimationStep, SerialAnimationStep,
  TransformAnimationStep, AnimationStep,
};
