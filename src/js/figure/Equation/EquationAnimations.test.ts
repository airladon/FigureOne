import {
  Point,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
// import * as colorTools from '../../../tools/color';
import makeFigure from '../../__mocks__/makeFigure';
// import { Equation } from './Equation';
// import EquationForm from './EquationForm';
// import { Elements } from './Elements/Element';
// import Fraction from './Elements/Fraction';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

const col = c => [1, 0, 0, c];

describe('Equation Animation', () => {
  let figure;
  let eqn;
  let a;
  let b;
  let c;
  // let color1;
  let ways;
  // let clean;
  beforeEach(() => {
    // clean = (formName) => {
    //   cleanForm(eqn.eqn.forms[formName].base);
    //   return eqn.eqn.forms[formName].base;
    // };
    figure = makeFigure();
    // color1 = [0.95, 0, 0, 1];
    ways = {
      simple: () => {
        figure.add([{
          name: 'eqn',
          make: 'equation',
          options: {
            color: col(1),
            elements: {
              a: 'a',
              b: 'b',
              c: 'c',
            },
            forms: {
              0: ['b'],
              1: ['b', 'c'],
              2: ['a', 'b'],
            },
            formSeries: ['0', '1', '2'],
          },
        }]);
        eqn = figure.elements._eqn;
        a = figure.elements._eqn._a;
        b = figure.elements._eqn._b;
        c = figure.elements._eqn._c;
      },
    };
  });
  test('Next Form without interruption', () => {
    ways.simple();
    expect(figure.elements).toHaveProperty('_eqn');
    // expect(figure.elements).toHaveProperty('_eqnANav');

    // only b is shown
    eqn.showForm('0');
    figure.drawNow(0);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(c.opacity).toEqual(1);

    eqn.nextForm(1);
    figure.drawNow(1);
    figure.drawNow(1.2);
    // 'c' fades in over 0.4s
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 2)).toEqual(0.5);

    // 'c' is now fully in
    figure.drawNow(1.5);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);

    // 'c' fades out, 'a' is waiting to fade in till after move
    eqn.nextForm(1);
    figure.drawNow(2);
    figure.drawNow(2.2);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 2)).toEqual(0.5);
    expect(b.getPosition()).toEqual(new Point(0, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(1);
    expect(c.animations.animations).toHaveLength(1);

    // 'c' is fully out, but not hidden, 'a' is still waiting
    figure.drawNow(2.4);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 3)).toEqual(1);
    expect(b.getPosition()).toEqual(new Point(0, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(1);
    expect(c.animations.animations).toHaveLength(0);

    // 'c' is now hidden, 'b' starts to move, a' is still waiting
    figure.drawNow(2.41);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);
    expect(b.getPosition().round(8)).toEqual(new Point(0.00000714, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(1);
    expect(c.animations.animations).toHaveLength(0);

    // 'b' is in the middle of its movement, 'a' is still waiting
    figure.drawNow(2.9);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);
    expect(b.getPosition().round(4)).toEqual(new Point(0.035, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(1);
    expect(c.animations.animations).toHaveLength(0);

    // 'b' finished, 'a' is just about to start
    figure.drawNow(3.4);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);
    expect(b.getPosition().round()).toEqual(new Point(0.07, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);

    // 'a' is half way through appearing
    figure.drawNow(3.6);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity, 2)).toEqual(0.5);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);
    expect(b.getPosition().round()).toEqual(new Point(0.07, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);

    // 'a' is finished appearing
    figure.drawNow(3.8);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(round(a.opacity, 2)).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity)).toEqual(1);
    expect(b.getPosition().round()).toEqual(new Point(0.07, 0));
    expect(a.animations.animations).toHaveLength(0);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);

    // Everything is done
    figure.drawNow(3.81);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(c.opacity).toEqual(1);
    expect(b.getPosition().round()).toEqual(new Point(0.07, 0));
    expect(a.animations.animations).toHaveLength(0);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);
  });
  test('Interruption on fade in', () => {
    ways.simple();
    expect(figure.elements).toHaveProperty('_eqn');
    // expect(figure.elements).toHaveProperty('_eqnANav');

    // only b is shown
    eqn.showForm('0');
    figure.drawNow(0);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(c.opacity).toEqual(1);

    eqn.nextForm(1);
    figure.drawNow(1);
    figure.drawNow(1.2);
    // 'c' fades in over 0.4s
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 4)).toEqual(0.5005);

    // Interrupt by moving to next form while previous was animating
    // 'c' skips to be fully shown
    // 'c' animation is just waiting for next frame before it stops
    eqn.nextForm(1);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 4)).toEqual(1);
    expect(a.animations.animations).toHaveLength(0);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);

    // nothing has happened
    figure.drawNow(2);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 4)).toEqual(1);
    expect(a.animations.animations).toHaveLength(0);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);
  });

  test('Interruption on fade out', () => {
    ways.simple();
    expect(figure.elements).toHaveProperty('_eqn');
    // expect(figure.elements).toHaveProperty('_eqnANav');

    // 'b' and 'c' is shown
    eqn.showForm('1');
    figure.drawNow(0);
    expect(a.isShown).toBe(false);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(c.opacity).toEqual(1);

    // 'c' will fade out, 'b' will move, then 'a' will fade in
    eqn.nextForm(1);
    figure.drawNow(1);
    figure.drawNow(1.2);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(true);
    expect(round(a.opacity)).toEqual(0.001);
    expect(b.opacity).toEqual(1);
    expect(round(c.opacity, 2)).toEqual(0.5);
    expect(b.getPosition()).toEqual(new Point(0, 0));
    expect(a.animations.animations).toHaveLength(1);
    expect(b.animations.animations).toHaveLength(1);
    expect(c.animations.animations).toHaveLength(1);

    // Interrupt while fading out
    eqn.nextForm(1);
    expect(a.isShown).toBe(true);
    expect(b.isShown).toBe(true);
    expect(c.isShown).toBe(false);
    expect(a.opacity).toEqual(1);
    expect(b.opacity).toEqual(1);
    expect(c.opacity).toEqual(1);
    expect(b.getPosition().round()).toEqual(new Point(0.07, 0));
    expect(a.animations.animations).toHaveLength(0);
    expect(b.animations.animations).toHaveLength(0);
    expect(c.animations.animations).toHaveLength(0);
  });

  describe('isFormIgnored', () => {
    test('showForm does not hide ignored element when not in target form', () => {
      ways.simple();
      eqn.showForm('1');         // shows b and c
      figure.drawNow(0);
      expect(c.isShown).toBe(true);

      c.isFormIgnored = true;
      const cColor = [0, 1, 0, 1];
      const cPosition = new Point(0.5, 0.5);
      c.setColor(cColor);
      c.setPosition(cPosition);

      eqn.showForm('2');         // form 2 = ['a', 'b'] — c would normally be hidden
      figure.drawNow(0);

      expect(a.isShown).toBe(true);
      expect(b.isShown).toBe(true);
      expect(c.isShown).toBe(true);
      expect(c.color).toEqual(cColor);
      expect(c.getPosition()).toEqual(cPosition);
    });

    test('showForm does not show or move ignored element when in target form', () => {
      ways.simple();
      eqn.showForm('0');         // only b shown
      figure.drawNow(0);
      expect(c.isShown).toBe(false);

      c.isFormIgnored = true;
      const cColor = [0, 1, 0, 1];
      const cPosition = new Point(0.5, 0.5);
      c.setColor(cColor);
      c.setPosition(cPosition);

      eqn.showForm('1');         // form 1 = ['b', 'c'] — c would normally be shown and moved
      figure.drawNow(0);

      expect(c.isShown).toBe(false);
      expect(c.color).toEqual(cColor);
      expect(c.getPosition()).toEqual(cPosition);
    });

    test('goToForm move animation does not queue animations on ignored element', () => {
      ways.simple();
      eqn.showForm('0');         // only b shown
      figure.drawNow(0);

      c.isFormIgnored = true;
      const cColor = [0, 1, 0, 1];
      const cPosition = new Point(0.5, 0.5);
      c.setColor(cColor);
      c.setPosition(cPosition);

      // form 1 = ['b', 'c'] — without ignore, c would dissolve in and move
      eqn.goToForm({ form: '1', animate: 'move', duration: 1 });
      figure.drawNow(0);
      figure.drawNow(0.5);

      expect(c.animations.animations).toHaveLength(0);
      expect(c.color).toEqual(cColor);
      expect(c.getPosition()).toEqual(cPosition);

      figure.drawNow(2);
      expect(c.animations.animations).toHaveLength(0);
      expect(c.color).toEqual(cColor);
      expect(c.getPosition()).toEqual(cPosition);
    });

    test('elementMods skipped for ignored element', () => {
      figure.add([{
        name: 'eqn',
        make: 'equation',
        options: {
          color: col(1),
          elements: { a: 'a', b: 'b', c: 'c' },
          forms: {
            withMods: {
              content: ['a', 'b', 'c'],
              elementMods: {
                c: { color: [1, 1, 0, 1] },
              },
            },
          },
        },
      }]);
      const e = figure.elements._eqn;
      const cElem = e._c;
      const initialColor = [0, 0, 1, 1];
      cElem.isFormIgnored = true;
      cElem.setColor(initialColor);

      e.showForm('withMods');
      figure.drawNow(0);

      expect(cElem.color).toEqual(initialColor);
    });

    test('ignored element contributes zero size to form layout', () => {
      ways.simple();
      eqn.showForm('2');         // ['a', 'b']
      figure.drawNow(0);
      const aPosBaseline = a.getPosition()._dup();
      const bPosBaseline = b.getPosition()._dup();

      // With c flagged and inserted into the form, layout should match baseline.
      figure.elements._eqn.addForms({
        formWithIgnored: ['c', 'a', 'b'],
      });
      c.isFormIgnored = true;
      c.setPosition(0.5, 0.5);

      eqn.showForm('formWithIgnored');
      figure.drawNow(0);

      expect(a.getPosition()).toEqual(aPosBaseline);
      expect(b.getPosition()).toEqual(bPosBaseline);
      expect(c.getPosition()).toEqual(new Point(0.5, 0.5));
    });

    test('isFormIgnored is captured in saved state', () => {
      ways.simple();
      c.isFormIgnored = true;
      const state = c._state({ ignoreShown: true, returnF1Type: false });
      expect(state.isFormIgnored).toBe(true);

      c.isFormIgnored = false;
      const state2 = c._state({ ignoreShown: true, returnF1Type: false });
      expect(state2.isFormIgnored).toBe(false);
    });
  });

  describe('formChanged notification', () => {
    test('showForm publishes phase:showForm', () => {
      ways.simple();
      const events = [];
      eqn.notifications.add('formChanged', e => events.push(e));

      eqn.showForm('0');
      figure.drawNow(0);

      expect(events).toHaveLength(1);
      expect(events[0].phase).toBe('showForm');
      expect(events[0].form.name).toBe('0');
      expect(events[0].fromForm).toBeUndefined();
    });

    test('getCurrentForm returns target inside goToFormStart listener', () => {
      ways.simple();
      eqn.showForm('0');
      figure.drawNow(0);

      let currentAtStart = null;
      eqn.notifications.add('formChanged', (e) => {
        if (e.phase === 'goToFormStart') {
          currentAtStart = eqn.getCurrentForm().name;
        }
      });

      eqn.goToForm({ form: '1', animate: 'dissolve', duration: 1 });
      expect(currentAtStart).toBe('1');
    });

    test('goToForm publishes start, multiple steps, final step(p:1), and end', () => {
      ways.simple();
      eqn.showForm('0');
      figure.drawNow(0);

      const events = [];
      eqn.notifications.add('formChanged', e => events.push({
        phase: e.phase,
        formName: e.form && e.form.name,
        fromForm: e.fromForm,
        progress: e.progress,
      }));

      eqn.goToForm({ form: '1', animate: 'dissolve', duration: 1 });
      // _EquationFormStep covers the full animation; this self-checks the
      // total against allHideShow's accounting.
      const total = eqn.animations.getRemainingTime('_EquationFormStep');
      expect(total).toBeGreaterThan(0);

      figure.drawNow(0);
      figure.drawNow(total * 0.25);
      figure.drawNow(total * 0.5);
      figure.drawNow(total * 0.75);
      figure.drawNow(total + 0.1);

      expect(events[0].phase).toBe('goToFormStart');
      expect(events[0].formName).toBe('1');

      const steps = events.filter(e => e.phase === 'goToFormStep');
      expect(steps.length).toBeGreaterThanOrEqual(2);
      steps.forEach((s) => {
        expect(s.progress).toBeGreaterThanOrEqual(0);
        expect(s.progress).toBeLessThanOrEqual(1);
      });

      // last step is exactly progress:1 (no duplicates), immediately
      // followed by goToFormEnd, which is the last event
      const endIndex = events.findIndex(e => e.phase === 'goToFormEnd');
      expect(endIndex).toBeGreaterThan(0);
      expect(events[endIndex - 1].phase).toBe('goToFormStep');
      expect(events[endIndex - 1].progress).toBe(1);
      // only one terminal step(p:1)
      expect(steps.filter(s => s.progress === 1)).toHaveLength(1);
      expect(endIndex).toBe(events.length - 1);
    });

    test('animate:move publishes a complete event stream', () => {
      ways.simple();
      eqn.showForm('1');           // ['b','c']
      figure.drawNow(0);

      const events = [];
      eqn.notifications.add('formChanged', e => events.push({
        phase: e.phase, progress: e.progress,
      }));

      // form '2' = ['a','b'] — c dissolves out, a dissolves in, b may move
      eqn.goToForm({ form: '2', animate: 'move', duration: 1 });
      const total = eqn.animations.getRemainingTime('_EquationFormStep');
      expect(total).toBeGreaterThan(0);

      figure.drawNow(0);
      figure.drawNow(total * 0.5);
      figure.drawNow(total + 0.1);

      const phases = events.map(e => e.phase);
      expect(phases[0]).toBe('goToFormStart');
      expect(phases[phases.length - 1]).toBe('goToFormEnd');
      const steps = events.filter(e => e.phase === 'goToFormStep');
      expect(steps.length).toBeGreaterThanOrEqual(1);
      expect(steps[steps.length - 1].progress).toBe(1);
    });

    test('duration:0 goToForm publishes only goToForm* phases, no showForm', () => {
      ways.simple();
      eqn.showForm('0');
      figure.drawNow(0);

      const events = [];
      eqn.notifications.add('formChanged', e => events.push({
        phase: e.phase, progress: e.progress,
      }));

      eqn.goToForm({ form: '1', animate: 'dissolve', duration: 0 });

      const phases = events.map(e => e.phase);
      expect(phases).toEqual(['goToFormStart', 'goToFormStep', 'goToFormEnd']);
      expect(events[1].progress).toBe(1);
    });

    test('internal showForm during goToForm interruption does not publish showForm', () => {
      ways.simple();
      eqn.showForm('0');
      figure.drawNow(0);

      // Start an animated goToForm
      eqn.goToForm({ form: '1', animate: 'dissolve', duration: 1 });
      figure.drawNow(0);
      figure.drawNow(0.3);

      const events = [];
      eqn.notifications.add('formChanged', e => events.push(e.phase));

      // Interrupt with another goToForm — skipToTarget runs an internal
      // showForm to snap to current, which must not emit 'showForm'.
      eqn.goToForm({ form: '2', animate: 'dissolve', duration: 1 });
      expect(events).not.toContain('showForm');
    });
  });
});
