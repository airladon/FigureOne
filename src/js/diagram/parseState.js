// @flow
import {
  PositionAnimationStep, AnimationBuilder, RotationAnimationStep,
  ScaleAnimationStep, TransformAnimationStep, ColorAnimationStep,
  OpacityAnimationStep, PulseAnimationStep, CustomAnimationStep,
  DelayStep, ParallelAnimationStep,
} from './Animation/Animation';

import type Diagram from './Diagram';

import {
  getPoint, getTransform, getRect, getLine, Translation, Rotation, Scale,
} from '../tools/g2';

function parseState(state: Object, diagram: Diagram) {
  if (typeof state === 'number') {
    return state;
  }
  if (typeof state === 'string') {
    return state;
  }
  if (typeof state === 'boolean') {
    return state;
  }
  if (state == null) {
    return state;
  }

  if (Array.isArray(state)) {
    const out = [];
    state.forEach((stateElement) => {
      out.push(parseState(stateElement, diagram));
    });
    return out;
  }
  if (state.f1Type != null) {
    if (state.f1Type === 'rect') {
      return getRect(state);
    }
    if (state.f1Type === 'p') {
      return getPoint(state);
    }
    if (state.f1Type === 'tf') {
      return getTransform(state);
    }
    if (state.f1Type === 't') {
      return new Translation(state);
    }
    if (state.f1Type === 's') {
      return new Scale(state);
    }
    if (state.f1Type === 'r') {
      return new Rotation(state);
    }
    if (state.f1Type === 'l') {
      return getLine(state);
    }
    if (state.f1Type === 'de') {
      return diagram.getElement(state.state);
    }
    if (state.f1Type === 'positionAnimationStep') {
      return new PositionAnimationStep()._fromState(
        parseState(state.state, diagram),
        diagram.getElement.bind(diagram),
      );
    }
    if (state.f1Type === 'rotationAnimationStep') {
      return new RotationAnimationStep()._fromState(
        parseState(state.state, diagram),
        diagram.getElement.bind(diagram),
      );
    }
    if (state.f1Type === 'scaleAnimationStep') {
      return new ScaleAnimationStep()._fromState(
        parseState(state.state, diagram),
        diagram.getElement.bind(diagram),
      );
    }
    if (state.f1Type === 'transformAnimationStep') {
      return new TransformAnimationStep()._fromState(
        parseState(state.state, diagram),
        diagram.getElement.bind(diagram),
      );
    }
    if (state.f1Type === 'colorAnimationStep') {
      return new ColorAnimationStep()._fromState(
        parseState(state.state, diagram),
        diagram.getElement.bind(diagram),
      );
    }
    if (state.f1Type === 'opacityAnimationStep') {
      return new OpacityAnimationStep()._fromState(
        parseState(state.state, diagram),
        diagram.getElement.bind(diagram),
      );
    }
    if (state.f1Type === 'pulseAnimationStep') {
      return new PulseAnimationStep()._fromState(
        parseState(state.state, diagram),
        diagram.getElement.bind(diagram),
      );
    }
    if (state.f1Type === 'customAnimationStep') {
      return new CustomAnimationStep()._fromState(
        parseState(state.state, diagram),
        diagram.getElement.bind(diagram),
      );
    }
    if (state.f1Type === 'delayAnimationStep') {
      return new DelayStep()._fromState(
        parseState(state.state, diagram),
        diagram.getElement.bind(diagram),
      );
    }
    if (state.f1Type === 'parallelAnimationStep') {
      return new ParallelAnimationStep()._fromState(
        parseState(state.state, diagram),
        diagram.getElement.bind(diagram),
      );
    }
    if (state.f1Type === 'animationBuilder') {
      return new AnimationBuilder()._fromState(
        parseState(state.state, diagram),
        diagram.getElement.bind(diagram),
      );
    }
  }
  const out = {};
  Object.keys(state).forEach((property) => {
    out[property] = parseState(state[property], diagram);
  });
  return out;
}

export default parseState;
