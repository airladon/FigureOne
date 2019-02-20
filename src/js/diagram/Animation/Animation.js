// @flow
import type {
  TypePositionAnimationStepInputOptions,
} from './AnimationStep/ElementAnimationStep/PositionAnimationStep';
import PositionAnimationStep from './AnimationStep/ElementAnimationStep/PositionAnimationStep';

import type {
  TypeColorAnimationStepInputOptions,
} from './AnimationStep/ElementAnimationStep/ColorAnimationStep';
import {
  ColorAnimationStep, DissolveInAnimationStep, dissolveIn,
  DissolveOutAnimationStep, dissolveOut,
} from './AnimationStep/ElementAnimationStep/ColorAnimationStep';


import type {
  TypeTransformAnimationStepInputOptions,
} from './AnimationStep/ElementAnimationStep/TransformAnimationStep';
import TransformAnimationStep from './AnimationStep/ElementAnimationStep/TransformAnimationStep';

import type {
  TypeTriggerStepInputOptions,
} from './AnimationStep/TriggerStep';
import {
  TriggerStep, trigger,
} from './AnimationStep/TriggerStep';

import type {
  TypeCustomAnimationStepInputOptions,
} from './AnimationStep/CustomStep';
import {
  CustomAnimationStep, custom,
} from './AnimationStep/CustomStep';


import type {
  TypeParallelAnimationStepInputOptions,
} from './AnimationStep/ParallelAnimationStep';
import {
  ParallelAnimationStep, inParallel,
} from './AnimationStep/ParallelAnimationStep';

import type {
  TypeSerialAnimationStepInputOptions,
} from './AnimationStep/SerialAnimationStep';
import {
  SerialAnimationStep, inSerial,
} from './AnimationStep/SerialAnimationStep';

import type {
  TypeDelayStepInputOptions,
} from './AnimationStep/DelayStep';
import {
  DelayStep, delay,
} from './AnimationStep/DelayStep';

import type {
  TypeAnimationStepInputOptions,
} from './AnimationStep';
import AnimationStep from './AnimationStep';

import type {
  TypeAnimationManagerInputOptions,
} from './AnimationManager';
import AnimationManager from './AnimationManager';

import type { TypeAnimatorInputOptions } from './Animator';
import Animator from './Animator';

export type {
  TypePositionAnimationStepInputOptions, TypeAnimatorInputOptions,
  TypeParallelAnimationStepInputOptions, TypeSerialAnimationStepInputOptions,
  TypeTransformAnimationStepInputOptions, TypeAnimationStepInputOptions,
  TypeDelayStepInputOptions, TypeTriggerStepInputOptions,
  TypeColorAnimationStepInputOptions, TypeCustomAnimationStepInputOptions,
  TypeAnimationManagerInputOptions,
};
export {
  PositionAnimationStep, Animator, ParallelAnimationStep, SerialAnimationStep,
  TransformAnimationStep, AnimationStep, DelayStep, TriggerStep,
  inParallel, inSerial, trigger, delay, ColorAnimationStep,
  DissolveInAnimationStep, dissolveIn, DissolveOutAnimationStep, dissolveOut,
  CustomAnimationStep, custom, AnimationManager,
};
