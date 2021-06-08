// @flow
import {
  PositionAnimationStep, AnimationBuilder, RotationAnimationStep,
  ScaleAnimationStep, TransformAnimationStep, ColorAnimationStep,
  OpacityAnimationStep, PulseAnimationStep, CustomAnimationStep,
  DelayAnimationStep, ParallelAnimationStep, SerialAnimationStep,
  TriggerAnimationStep, ScenarioAnimationStep,
} from '../Animation/Animation';

import type Figure from '../Figure';

import {
  getPoint, getTransform, getRect, getLine,
  getBounds,
} from '../../tools/g2';

function assignAsLinkOnly(obj: Object) {
  if (obj != null) {
    // eslint-disable-next-line no-param-reassign
    obj._assignAsLinkOnly = true;
  }
  return obj;
}

function parseState(state: Object, figure: Figure) {
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
      out.push(parseState(stateElement, figure));
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
    if (state.f1Type === 'l') {
      return getLine(state);
    }
    if (state.f1Type === 'rangeBounds') {
      return getBounds(state);
    }
    if (state.f1Type === 'rectBounds') {
      return getBounds(state);
    }
    if (state.f1Type === 'lineBounds') {
      return getBounds(state);
    }
    if (state.f1Type === 'transformBounds') {
      return getBounds(state);
    }
    if (state.f1Type === 'de') {
      return assignAsLinkOnly(figure.getElement(state.state));
    }
    if (state.f1Type === 'positionAnimationStep') {
      return new PositionAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'rotationAnimationStep') {
      return new RotationAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'scaleAnimationStep') {
      return new ScaleAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'transformAnimationStep') {
      return new TransformAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'scenarioAnimationStep') {
      return new ScenarioAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'colorAnimationStep') {
      return new ColorAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'opacityAnimationStep') {
      return new OpacityAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'pulseAnimationStep') {
      return new PulseAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'customAnimationStep') {
      return new CustomAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'delayAnimationStep') {
      return new DelayAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'parallelAnimationStep') {
      return new ParallelAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'serialAnimationStep') {
      return new SerialAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'triggerAnimationStep') {
      return new TriggerAnimationStep()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
    if (state.f1Type === 'animationBuilder') {
      return new AnimationBuilder()._fromState(
        parseState(state.state, figure),
        figure.getElement.bind(figure),
        figure.timeKeeper,
      );
    }
  }
  const out = {};
  Object.keys(state).forEach((property) => {
    out[property] = parseState(state[property], figure);
  });
  return out;
}

export default parseState;
