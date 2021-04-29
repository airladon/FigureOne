import {
  // FigureElementPrimitive,
  FigureElementCollection,
} from '../../Element';
// import { AnimationPhase } from './AnimationPhase';
import {
  Point, Transform,
} from '../../../tools/g2';
import webgl from '../../../__mocks__/WebGLInstanceMock';
import {
  linear, round,
} from '../../../tools/math';
import * as m2 from '../../../tools/m2';
import makeFigure from '../../../__mocks__/makeFigure';
// import Figure from './Figure';

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');
jest.useFakeTimers();


describe('Animationa and Movement', () => {
  let figure;
  beforeEach(() => {
    figure = makeFigure();  // this is just initializing the global
  });
  describe('FigureElementPrimitive', () => {
    describe('Animation', () => {
      let element;
      // let identity;
      // let figure;
      // let figure;
      beforeEach(() => {
        element = figure.shapes.polygon({ sides: 4, radius: 1, line: { width: 0.01 } });
        figure.elements.add('e', element);
      });
      describe('Rotation', () => {
        test('Rotate 1 radian, for 1 second, with linear movement', () => {
          // expect(element.state.isAnimating).toBe(false);
          expect(element.isMoving()).toBe(false);

          // element.animateRotationTo(1, 1, 1, null, linear);
          element.animations.new()
            .rotation({
              target: 1,
              direction: 1,
              duration: 1,
              progression: 'linear',
            })
            .start();
          const t = element.transform;
          expect(t).toEqual(new Transform('polygon').scale(1, 1).rotate(0).translate(0, 0));

          expect(element.animations.state).toBe('idle');
          expect(element.isAnimating()).toBe(true);

          // element.setupDraw(10);
          figure.mock.timeStep(10);

          expect(t.r()).toBe(0);

          // element.setupDraw(10.5);
          figure.mock.timeStep(0.5);
          expect(round(element.transform.r(), 3)).toBe(0.5);
          expect(element.animations.state).toBe('animating');
          expect(element.isAnimating()).toBe(true);

          // element.setupDraw(11);
          figure.mock.timeStep(1);
          expect(element.transform.r()).toBe(1);
          expect(element.animations.state).toBe('idle');
          expect(element.isAnimating()).toBe(false);
        });
        test('translate (0, 0) to (1, 0), 1 second, linear movement', () => {
          expect(element.isAnimating()).toBe(false);

          // Setup the animation
          element.animations.new()
            .position({ target: new Point(1, 0), duration: 1, progression: 'linear' })
            .start();
          const t = element.transform;
          expect(t).toEqual(new Transform('polygon').scale(1, 1).rotate(0).translate(0, 0));

          expect(element.animations.state).toBe('idle');
          expect(element.isAnimating()).toBe(true);

          // Initial draw setting start time
          // element.setupDraw(new Transform(), 0);
          figure.mock.timeStep(0);
          expect(t.r()).toBe(0);

          // Draw half way through
          // element.setupDraw(new Transform(), 0.5);
          figure.mock.timeStep(0.5);
          expect(element.transform.t()).toEqual(new Point(0.5, 0));
          expect(element.animations.state).toBe('animating');
          expect(element.isAnimating()).toBe(true);

          // Draw at last time
          // element.setupDraw(new Transform(), 1);
          figure.mock.timeStep(0.5);
          expect(element.transform.t()).toEqual(new Point(1.0, 0));
          expect(element.animations.state).toBe('idle');
          expect(element.isAnimating()).toBe(false);
        });
        test('Callback', () => {
          const callback = jest.fn();         // Callback mock
          // Setup the animation
          element.animations.new()
            .rotation({
              target: 1,
              direction: 1,
              duration: 1,
              onFinish: callback,
              progression: 'linear',
            })
            .start();
          // element.animateRotationTo(1, 1, 1, callback, linear);
          // element.setupDraw(new Transform(), 0);     // Initial draw setting start time
          figure.mock.timeStep(0);
          figure.mock.timeStep(2);
          // element.setupDraw(new Transform(), 2);   // Draw half way through
          element.animations.cancelAll();            // Stop animating

          // expect(element.state.isAnimating).toBe(false);
          expect(callback.mock.calls).toHaveLength(1);
        });
        test('Stop animating during animation', () => {
          const callback = jest.fn();         // Callback mock
          // Setup the animation
          element.animations.new()
            .rotation({
              target: 1,
              duration: 1,
              direction: 1,
              onFinish: callback,
              progression: linear,
            })
            .start();
          figure.mock.timeStep(0);
          // element.setupDraw(new Transform(), 0);     // Initial draw setting start time
          figure.mock.timeStep(0.5);
          // element.setupDraw(new Transform(), 0.5);   // Draw half way through
          element.animations.cancelAll();            // Stop animating

          // expect(element.state.isAnimating).toBe(false);
          expect(callback.mock.calls).toHaveLength(1);
        });
        test('Three phase animation plan', () => {
          const callback = jest.fn();         // Callback mock
          element.animations.new()
            .rotation({
              target: 1,
              direction: 1,
              duration: 1,
              progression: linear,
              completeOnCancel: true,
            })
            .rotation({
              target: 0,
              direction: -1,
              duration: 1,
              progression: linear,
              completeOnCancel: true,
            })
            .rotation({
              target: -1,
              direction: -1,
              duration: 1,
              progression: linear,
              completeOnCancel: true,
            })
            .whenFinished(callback)
            .start();

          expect(callback.mock.calls).toHaveLength(0);
          figure.mock.timeStep(0);
          // element.setupDraw(identity, 0);          // Give animation an initial time

          // Check initial values
          expect(element.isAnimating()).toBe(true);

          // Half way through first phase
          // element.setupDraw(identity, 0.5);
          figure.mock.timeStep(0.5);
          expect(round(element.transform.r(), 3)).toBe(0.5);
          expect(callback.mock.calls).toHaveLength(0);

          // End of first phase
          // element.setupDraw(identity, 1.0);
          figure.mock.timeStep(0.5);
          expect(element.transform.r()).toBe(1.0);
          expect(callback.mock.calls).toHaveLength(0);

          // Start of next phase
          // element.setupDraw(identity, 1.1);
          figure.mock.timeStep(0.1);
          expect(round(element.transform.r())).toBe(0.9);
          expect(callback.mock.calls).toHaveLength(0);

          // Skip to into third phase
          // element.setupDraw(identity, 2.1);
          figure.mock.timeStep(1);
          expect(round(element.transform.r())).toBe(-0.1);
          expect(callback.mock.calls).toHaveLength(0);

          // Time after End
          // element.setupDraw(identity, 3.1);
          figure.mock.timeStep(1);
          expect(round(element.transform.r())).toBe(-1);
          expect(callback.mock.calls).toHaveLength(1);
          expect(element.isAnimating()).toBe(false);
        });
      });
    });
    describe('Moving Freely', () => {
      let element;
      // let identity;
      // let figure;
      beforeEach(() => {
        element = figure.shapes.polygon({ sides: 4, radius: 1, line: { width: 0.01 } });
        element.move.maxVelocity = 100; // new TransformLimit(100, 100, 100);
        element.move.freely.zeroVelocityThreshold = {
          scale: 0.01, rotation: 0.01, translation: 0.01,
        };
        // new TransformLimit(0.01, 0.01, 0.01);
        // identity = new Transform();
        // element.move.maxTransform = element.transform.constant(100);
        // element.move.minTransform = element.transform.constant(-100);
        figure.elements.add('e', element);
      });
      test('Deceleration', () => {
        const callback = jest.fn();
        const initialV = new Transform().scale(-2, 1).rotate(0).translate(10, 20);
        // const decel = new TransformLimit(1, 2, 1);
        const decel = { scale: 1, rotation: 2, translation: 1 };

        element.state.movement.velocity = initialV;
        element.move.freely.deceleration = decel;

        expect(element.state.isMovingFreely).toBe(false);
        figure.mock.timeStep(0);
        element.startMovingFreely(callback);
        expect(element.state.isMovingFreely).toBe(true);
        // element.setupDraw(identity, 0);
        // figure.mock.timeStep(0);
        expect(element.state.movement.velocity.round()).toEqual(initialV);
        // element.setupDraw(identity, 1);
        // debugger;
        figure.mock.timeStep(1);
        expect(element.state.isMovingFreely).toBe(true);
        let vel = element.state.movement.velocity;
        expect(vel.t().round(2)).toEqual(new Point(9.55, 19.11));
        expect(vel.s().round(2)).toEqual(new Point(-1, 0));
        expect(vel.r()).toBe(0);
        element.transform.name = '';
        expect(element.transform.round(2)).toEqual(new Transform()
          .scale(-0.5, 1.5).rotate(0).translate(9.78, 19.55));

        // element.setupDraw(identity, 2);
        figure.mock.timeStep(1);
        vel = element.state.movement.velocity;
        expect(vel.t().round(2)).toEqual(new Point(9.11, 18.21));
        expect(vel.s().round(2)).toEqual(new Point(0, 0));
        expect(vel.r()).toBe(0);
        expect(callback.mock.calls).toHaveLength(0);

        // element.setupDraw(identity, 23);
        figure.mock.timeStep(21);
        vel = element.state.movement.velocity;
        expect(vel).toEqual(vel.zero());
        expect(callback.mock.calls).toHaveLength(1);
      });
      test('Zero and Max Threshold', () => {
        const initialV = new Transform()
          .scale(30, -30).rotate(10).translate(10, -10);
        // const decel = new TransformLimit(1, 1, 1);
        const decel = { scale: 1, rotation: 1, translation: 1 };
        const zero = { scale: 15, rotation: 5, translation: 5 };
        // const zero = new TransformLimit(15, 5, 5);
        const max = { scale: 20, position: 20, rotation: 20 };
        element.state.movement.velocity = initialV;
        element.move.freely.deceleration = decel;
        element.move.freely.zeroVelocityThreshold = zero;
        element.move.maxVelocity = max;

        expect(element.state.isMovingFreely).toBe(false);

        figure.mock.timeStep(0);
        element.startMovingFreely();
        let vel = element.state.movement.velocity;

        expect(vel.t().round(2)).toEqual(new Point(10, -10));
        expect(vel.s().round(2)).toEqual(new Point(20, -20));
        expect(vel.r()).toBe(10);

        // element.setupDraw(identity, 0);
        // figure.mock.timeStep(0);

        expect(element.state.isMovingFreely).toBe(true);

        // element.setupDraw(identity, 4.999);
        figure.mock.timeStep(4.999);
        vel = element.state.movement.velocity;

        expect(vel.t().round(2)).toEqual(new Point(6.47, -6.47));
        expect(vel.s().round(2)).toEqual(new Point(15, -15));
        expect(vel.r()).toBe(5.001);

        // element.setupDraw(identity, 5.001);
        figure.mock.timeStep(0.002);
        vel = element.state.movement.velocity;

        expect(vel.t().round(2)).toEqual(new Point(6.46, -6.46));
        expect(vel.s().round(2)).toEqual(new Point(0, 0));
        expect(vel.r()).toBe(0);

        // element.setupDraw(identity, 9.13);
        figure.mock.timeStep(4.129);
        vel = element.state.movement.velocity;
        expect(vel.t().round(2)).toEqual(new Point(3.54, -3.54));

        // element.setupDraw(identity, 9.15);
        figure.mock.timeStep(0.02);
        vel = element.state.movement.velocity;
        expect(vel.t().round(2)).toEqual(new Point(0, 0));

        expect(element.state.isMovingFreely).toBe(false);
      });
    });
    describe('Being Moved', () => {
      let element;
      const RealDate = global.performance.now;
      beforeEach(() => {
        element = figure.shapes.polygon({ sides: 4, radius: 1, line: { width: 0.01 } });
        element.move.freely.zeroVelocityThreshold = 0.0001;
        element.move.maxVelocity = 100;
      });
      afterEach(() => {
        global.performance.now = RealDate;
      });
      describe('Move', () => {
        test('Move', () => {
          global.performance.now = () => 0;
          element.startBeingMoved();
          expect(element.state.isBeingMoved).toBe(true);
          global.performance.now = () => 1000;
          element.moved(new Transform()
            .scale(1, 1).rotate(1).translate(1, -1));
          expect(element.state.movement.velocity.round()).toEqual(new Transform()
            .scale(0, 0).rotate(1).translate(1, -1));
        });
      });
    });
    describe('Pulse', () => {
      let element;
      // let identity;
      // let figure;
      beforeEach(() => {
        figure = makeFigure();
        element = figure.shapes.polygon({ sides: 4, radius: 1, line: { width: 0.01 } });
        // identity = new Transform();
        figure.elements.add('e', element);
      });
      test('pulse scale now', () => {
        let pulseTransform;
        let expectM;
        figure.mock.timeStep(0);
        element.pulse({ duration: 1, scale: 1.1 });
        // element.setupDraw(identity, 0);
        expect(element.state.pulse.startTime).toBe(0);
        expect(element.lastDrawTransform.matrix()).toEqual(element.transform.matrix());

        // element.setupDraw(identity, 0.5);
        figure.mock.timeStep(0.5);
        pulseTransform = new Transform()
          .scale(1.1, 1.1).rotate(0).translate(0, 0);
        expectM = m2.mul(element.transform.matrix(), pulseTransform.matrix());
        expect(round(element.lastDrawPulseTransform.matrix())).toEqual(expectM);

        // element.setupDraw(identity, 1);
        figure.mock.timeStep(0.5);
        pulseTransform = new Transform()
          .scale(1, 1).rotate(0).translate(0, 0);
        expectM = m2.mul(element.transform.matrix(), pulseTransform.matrix());
        expect(element.lastDrawPulseTransform.matrix()).toEqual(expectM);
        expect(element.state.isPulsing).toBe(false);

        // element.setupDraw(identity, 1.1);
        figure.mock.timeStep(0.1);
        expect(element.lastDrawPulseTransform.matrix()).toEqual(expectM);
        expect(element.state.isPulsing).toBe(false);
      });
      test('pulse thick', () => {
        const draw = jest.fn();
        element.drawingObject.drawWithTransformMatrix = draw;
        figure.mock.timeStep(0);
        expect(draw.mock.calls).toHaveLength(1);
        element.pulse({
          duration: 1, scale: 1.2, min: 0.8, num: 5,
        });
        // element.setupDraw(identity, 0.0);
        figure.mock.timeStep(0);
        // element.draw(0.0);
        // element.setupDraw(identity, 0.5);
        figure.mock.timeStep(0.5);
        // element.draw(0.5);
        expect(draw.mock.calls).toHaveLength(11);

        const maxPulseTransform = new Transform()
          .scale(1.2, 1.2).rotate(0).translate(0, 0);
        // (Point.zero(), 0, new Point(1.2, 1.2));
        const maxM = m2.mul(element.transform.matrix(), maxPulseTransform.matrix());
        expect(round(draw.mock.calls[6][0], 3)).toEqual(round(maxM, 3));

        const minPulseTransform = new Transform()
          .scale(0.8, 0.8).rotate(0).translate(0, 0);
        // Point.zero(), 0, new Point(0.8, 0.8));
        const minM = m2.mul(element.transform.matrix(), minPulseTransform.matrix());
        expect(round(draw.mock.calls[10][0], 3)).toEqual(round(minM, 3));
      });
    });
    describe('Get and Is being touched', () => {
      let square;
      let glPoint;
      beforeEach(() => {
        // const figure = makeFigure();
        square = figure.shapes.polygon({
          sides: 4,
          radius: Math.sqrt(2),
          line: { width: 0.1 },
          rotation: Math.PI / 4,
        });
        square.isTouchable = true;
        figure.elements.add('square', square);
        figure.initialize();
        glPoint = (x, y) => new Point(x, y)
          .transformBy(figure.spaceTransforms.figureToGL.matrix());
      });
      test('Inside square and border', () => {
        expect(square.isBeingTouched(glPoint(0, 0))).toBe(true);
        expect(square.isBeingTouched(glPoint(1.0499, 0))).toBe(true);
        expect(square.isBeingTouched(glPoint(0, 1.0499))).toBe(true);
        expect(square.isBeingTouched(glPoint(1.0499, 1.0499))).toBe(true);
        expect(square.isBeingTouched(glPoint(-1.0499, -1.0499))).toBe(true);
        expect(square.isBeingTouched(glPoint(0, -1.0499))).toBe(true);
        expect(square.isBeingTouched(glPoint(-1.0499, 0))).toBe(true);
      });
      test('Outside of border', () => {
        expect(square.isBeingTouched(glPoint(1.05001, 0))).toBe(false);
        expect(square.isBeingTouched(glPoint(0, 1.05001))).toBe(false);
        expect(square.isBeingTouched(glPoint(1.05001, 1.05001))).toBe(false);
        expect(square.isBeingTouched(glPoint(-1.05001, -1.05001))).toBe(false);
        expect(square.isBeingTouched(glPoint(0, -1.05001))).toBe(false);
        expect(square.isBeingTouched(glPoint(-1.05001, 0))).toBe(false);
        expect(square.isBeingTouched(glPoint(100, 100))).toBe(false);
      });
      test('Get being touched', () => {
        expect(square.getTouched(new Point(0, 0))).toEqual([square]);
        expect(square.getTouched(new Point(1, 1))).toEqual([square]);
        expect(square.getTouched(new Point(2, 2))).toEqual([]);
      });
    });
    describe('Get bounding box', () => {
      let square;
      // let figure;
      let createSquare;
      beforeEach(() => {
        // figure = makeFigure();
        createSquare = (offset) => {
          square = figure.shapes.polygon({
            sides: 4,
            radius: Math.sqrt(2) * 0.1,
            line: { width: 0.01 },
            rotation: Math.PI / 4,
            offset,
          });
          figure.elements.add('square', square);
          figure.initialize();
        };
      });
      test('square centered on origin with scale 1', () => {
        createSquare([0, 0]);
        const box = square.getBoundingRect('figure');
        expect(round(box.left, 3)).toEqual(-0.105);
        expect(round(box.bottom, 3)).toEqual(-0.105);
        expect(round(box.right, 3)).toEqual(0.105);
        expect(round(box.top, 3)).toEqual(0.105);
      });
      test('square vertices offset to origin with scale 1', () => {
        createSquare([0, 0]);
        square.setPosition(0.5, 0);
        figure.setFirstTransform();
        const box = square.getBoundingRect('figure');
        expect(round(box.left, 3)).toEqual(-0.105 + 0.5);
        expect(round(box.bottom, 3)).toEqual(-0.105);
        expect(round(box.right, 3)).toEqual(0.105 + 0.5);
        expect(round(box.top, 3)).toEqual(0.105);
      });
      test('square element offset to origin with scale 1', () => {
        createSquare([0.5, 0]);
        const box = square.getBoundingRect('figure');
        expect(round(box.left, 3)).toEqual(-0.105 + 0.5);
        expect(round(box.bottom, 3)).toEqual(-0.105);
        expect(round(box.right, 3)).toEqual(0.105 + 0.5);
        expect(round(box.top, 3)).toEqual(0.105);
      });
      test('square element offset to origin with scale 2', () => {
        createSquare([0.5, 0]);
        square.setTransform(new Transform().scale(2, 2).rotate(0).translate(0, 0));
        figure.setFirstTransform();
        const box = square.getBoundingRect('figure');
        expect(round(box.left, 3)).toEqual(-0.105 * 2 + 0.5 * 2);
        expect(round(box.bottom, 3)).toEqual(-0.105 * 2);
        expect(round(box.right, 3)).toEqual(0.105 * 2 + 0.5 * 2);
        expect(round(box.top, 3)).toEqual(0.105 * 2);
      });
    });
    describe('Default move max/min transforms', () => {
      test('setMoveBounds no transform', () => {
        const square = figure.shapes.polygon({
          sides: 4,
          radius: Math.sqrt(2) * 0.105,
          line: { width: Math.sqrt(2) * 0.01 },
          rotation: Math.PI / 4,
        });
        square.isMovable = true;
        // square.move.bounds = 'figure';
        square.setMoveBounds('figure', true);
        let { boundary } = square.move.bounds.getTranslation();
        expect(round(boundary.left, 3)).toBe(-1);
        expect(round(boundary.right, 3)).toBe(1);
        expect(round(boundary.bottom, 3)).toBe(-1);
        expect(round(boundary.top, 3)).toBe(1);
        // expect(round(boundary.left, 3)).toBe(-0.895);
        // expect(round(boundary.right, 3)).toBe(0.895);
        // expect(round(boundary.bottom, 3)).toBe(-0.895);
        // expect(round(boundary.top, 3)).toBe(0.895);
        square.setMoveBounds({
          translation: {
            left: -2, bottom: -1, right: 2, top: 1,
          },
        }, true);
        ({ boundary } = square.move.bounds.getTranslation());
        expect(round(boundary.left, 3)).toBe(-2);
        expect(round(boundary.right, 3)).toBe(2);
        expect(round(boundary.bottom, 3)).toBe(-1);
        expect(round(boundary.top, 3)).toBe(1);
        // expect(round(boundary.left, 3)).toBe(-1.895);
        // expect(round(boundary.right, 3)).toBe(1.895);
        // expect(round(boundary.bottom, 3)).toBe(-0.895);
        // expect(round(boundary.top, 3)).toBe(0.895);
        // square.setMoveBounds([-1, -2, 2, 4]);
        square.setMoveBounds({
          translation: {
            left: -1, bottom: -2, right: 1, top: 2,
          },
        }, true);
        ({ boundary } = square.move.bounds.getTranslation());
        expect(round(boundary.left, 3)).toBe(-1);
        expect(round(boundary.right, 3)).toBe(1);
        expect(round(boundary.bottom, 3)).toBe(-2);
        expect(round(boundary.top, 3)).toBe(2);
        // expect(round(boundary.left, 3)).toBe(-0.895);
        // expect(round(boundary.right, 3)).toBe(0.895);
        // expect(round(boundary.bottom, 3)).toBe(-1.895);
        // expect(round(boundary.top, 3)).toBe(1.895);
        // square.setMoveBounds([-2, -2, 4, 4]);
        square.setMoveBounds({
          translation: {
            left: -2, bottom: -2, right: 2, top: 2,
          },
        }, true);
        ({ boundary } = square.move.bounds.getTranslation());
        expect(round(boundary.left, 3)).toBe(-2);
        expect(round(boundary.right, 3)).toBe(2);
        expect(round(boundary.bottom, 3)).toBe(-2);
        expect(round(boundary.top, 3)).toBe(2);
        // expect(round(boundary.left, 3)).toBe(-1.895);
        // expect(round(boundary.right, 3)).toBe(1.895);
        // expect(round(boundary.bottom, 3)).toBe(-1.895);
        // expect(round(boundary.top, 3)).toBe(1.895);
      });
      test('setMoveBounds with transform', () => {
        const square = figure.shapes.polygon({
          sides: 4,
          radius: Math.sqrt(2) * 0.105,
          line: { width: Math.sqrt(2) * 0.01 },
          rotation: Math.PI / 4,
          transform: new Transform().scale(2, 2).rotate(0).translate(0, 0),
        });
        square.isMovable = true;
        // square.move.bounds = 'figure';

        square.setMoveBounds('figure', true);
        let { boundary } = square.move.bounds.getTranslation();
        expect(round(boundary.left, 3)).toBe(-1);
        expect(round(boundary.right, 3)).toBe(1);
        expect(round(boundary.bottom, 3)).toBe(-1);
        expect(round(boundary.top, 3)).toBe(1);
        // expect(round(boundary.left, 3)).toBe(-0.79);
        // expect(round(boundary.right, 3)).toBe(0.79);
        // expect(round(boundary.bottom, 3)).toBe(-0.79);
        // expect(round(boundary.top, 3)).toBe(0.79);

        square.setMoveBounds({
          translation: {
            left: -1, bottom: -2, right: 1, top: 2,
          },
        }, true);
        ({ boundary } = square.move.bounds.getTranslation());
        expect(round(boundary.left, 3)).toBe(-1);
        expect(round(boundary.right, 3)).toBe(1);
        expect(round(boundary.bottom, 3)).toBe(-2);
        expect(round(boundary.top, 3)).toBe(2);
        // expect(round(boundary.left, 3)).toBe(-0.79);
        // expect(round(boundary.right, 3)).toBe(0.79);
        // expect(round(boundary.bottom, 3)).toBe(-1.79);
        // expect(round(boundary.top, 3)).toBe(1.79);
      });
    });
    describe('Copy', () => {
      test('Vertex Object', () => {
        const square = figure.shapes.polygon({
          sides: 4,
          radius: Math.sqrt(2) * 0.105,
          line: { width: Math.sqrt(2) * 0.01 },
          rotation: Math.PI / 4,
          transform: new Transform().scale(2, 2).rotate(0).translate(0, 0),
        });
        // change a default value FigureElement base class
        square.isShown = true;
        // change a default value in FigureElementPrimitive class
        square.color = [0.5, 0.4, 0.3, 0.2];

        const copy = square._dup();
        expect(copy).toEqual(square);
        expect(copy).not.toBe(square);
        expect(copy.drawingObject).toBe(square.drawingObject);

        // change a default value FigureElement base class
        square.isShown = false;
        // change a default value in FigureElementPrimitive class
        square.color = [0.6, 0.5, 0.4, 0.3];
        expect(square.color).toEqual([0.6, 0.5, 0.4, 0.3]);
        expect(copy.color).toEqual([0.5, 0.4, 0.3, 0.2]);
        expect(square.isShown).toBe(false);
        expect(copy.isShown).toBe(true);
      });
    });
  });
  describe('FigureElementCollection', () => {
    let squareElement;
    let triElement;
    let collection;
    const RealDate = Date.now;
    // let identity;
    // let figure;
    beforeEach(() => {
      // figure = makeFigure();
      // identity = new Transform();
      squareElement = figure.shapes.polygon({
        sides: 4,
        radius: 1005,
        line: { width: 0.01 },
      });
      triElement = figure.shapes.polygon({
        sides: 3,
        radius: 0.1005,
        line: { width: 0.001 },
        offset: [0.1, 0.1],
        transform: new Transform().scale(2, 2).rotate(Math.PI / 2).translate(0.1, 0),
      });
      // Transform the triangle by 0.1 in x, rotate by 90 deg, scale by 2
      // This means, the outside point (0.105, 0) will transform:
      //    - tranlation x by 0.1: (0.205, 0)
      //    - rotation by 90 degrees: (0, 0.205)
      //    - scale by 2: (0, 0.41)
      // triElement = new FigureElementPrimitive(
      //   tri,
      //   new Transform().scale(2, 2).rotate(Math.PI / 2).translate(0.1, 0),
      //   [0, 0, 1, 1],
      // );
      collection = new FigureElementCollection({
        transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
      });
      collection.add('square', squareElement);
      collection.add('tri', triElement);
      figure.elements.add('c', collection);
    });
    afterEach(() => {
      global.performance.now = RealDate;
    });
    test('Combination of animation and movement with a collection', () => {
      const callbackAnim = jest.fn();
      const callbackMoveFree = jest.fn();
      const draw = jest.fn();
      webgl.gl.drawArrays = draw;
      // collection.setupDraw(identity, 0);
      // collection.draw(0);
      figure.mock.timeStep(0);
      expect(draw.mock.instances).toHaveLength(2);
      expect(collection.state.isBeingMoved).toBe(false);
      expect(collection.state.isMovingFreely).toBe(false);

      // Move translation to (0.5, 0)
      collection.animations.new()
        .position({
          target: new Point(2, 0),
          duration: 1,
          progression: 'linear',
          onFinish: callbackAnim,
        })
        .start();
      // collection.animateTranslationTo(new Point(1, 0), 1, callbackAnim, linear);
      // expect(collection.state.isAnimating).toBe(true);
      expect(collection.animations.state).toBe('idle');
      expect(collection.state.isBeingMoved).toBe(false);
      expect(collection.state.isMovingFreely).toBe(false);
      // collection.setupDraw(new Transform(), 0);
      // collection.draw(0);
      figure.mock.timeStep(0);
      // collection.setupDraw(new Transform(), 0.5);
      // collection.draw(0.5);
      figure.mock.timeStep(0.5);
      expect(collection.animations.state).toBe('animating');
      expect(collection.transform.round()).toEqual(new Transform()
        .scale(1, 1).rotate(0).translate(1, 0));

      // global.performance.now = () => 0;
      collection.startBeingMoved();
      // expect(collection.state.isAnimating).toBe(false);
      expect(collection.animations.state).toBe('idle');
      expect(collection.state.isBeingMoved).toBe(true);
      expect(collection.state.isMovingFreely).toBe(false);

      // Over 1 s, rotation = 0.1;
      // global.performance.now = () => 1000;
      figure.mock.timeStep(1);
      collection.moved(new Transform()
        .scale(1, 1).rotate(0.1).translate(0.5, 0));
      expect(collection.transform.round()).toEqual(new Transform()
        .scale(1, 1).rotate(0.1).translate(0.5, 0));
      const velocity = new Transform().scale(0, 0).rotate(0.1).translate(-0.5, 0);
      expect(collection.state.movement.velocity.isEqualTo(velocity)).toBe(true);

      const moveFreeProps = collection.move.freely;
      // moveFreeProps.deceleration = new TransformLimit(1, 0.01, 1);
      // moveFreeProps.zeroVelocityThreshold = new TransformLimit(0.1, 0.05, 0.1);
      moveFreeProps.deceleration = { scale: 1, rotation: 0.01, translation: 1 };
      moveFreeProps.zeroVelocityThreshold = { scale: 0.1, rotation: 0.05, translation: 0.1 };

      // Now at (1, 0), 0.1 and rotating with velocity 0.1 rads/s
      // figure.mock.timeStep(0);
      collection.startMovingFreely(callbackMoveFree);
      // expect(collection.state.isAnimating).toBe(false);
      expect(collection.state.isBeingMoved).toBe(false);
      expect(collection.state.isMovingFreely).toBe(true);


      // collection.setupDraw(new Transform(), 10);
      // collection.draw(10);
      // figure.mock.timeStep(9.5);
      expect(collection.state.movement.velocity.isEqualTo(velocity)).toEqual(true);

      // After one second, should have rotated to:
      //  rotation: 0.1 + 0.1*1 - 0.5*0.01*1*1
      //  with velocity: 0.1 - 0.01*1*1
      // collection.setupDraw(new Transform(), 11);
      // collection.draw(11);
      figure.mock.timeStep(1);
      expect(collection.state.movement.velocity.round()).toEqual(new Transform()
        .scale(0, 0).rotate(0.09).translate(0, 0));
      expect(collection.transform.round()).toEqual(new Transform()
        .scale(1, 1).rotate(0.195).translate(0.38, 0));

      // At 5 seconds, velocity becomes 0, so rotation is
      //  rotation: 0.1 + 0.1*5 - 0.5*0.01*5*5
      //  with velocity: 0.1 - 0.01*1*1
      // collection.setupDraw(new Transform(), 15.1);
      // collection.draw(15.1);
      figure.mock.timeStep(4.1);
      // expect(collection.state.isAnimating).toBe(false);
      expect(collection.state.isBeingMoved).toBe(false);
      expect(collection.state.isMovingFreely).toBe(false);
      expect(collection.state.movement.velocity).toEqual(collection.state.movement.velocity.zero());
      expect(collection.transform.round()).toEqual(new Transform()
        .scale(1, 1).rotate(0.475).translate(0.38, 0));

      // Check all the callbacks were called once
      expect(callbackAnim.mock.calls).toHaveLength(1);
      expect(callbackMoveFree.mock.calls).toHaveLength(1);
    });
    describe('Show and hide', () => {
      let square;
      let tri;
      beforeEach(() => {
        /* eslint-disable no-underscore-dangle */
        square = collection._square;
        tri = collection._tri;
        /* eslint-enable no-underscore-dangle */
      });
      test('Show and Hide all', () => {
        expect(square.isShown).toBe(true);
        expect(tri.isShown).toBe(true);
        expect(collection.isShown).toBe(true);

        collection.hideAll();
        expect(square.isShown).toBe(false);
        expect(tri.isShown).toBe(false);
        expect(collection.isShown).toBe(false);

        collection.showAll();
        expect(square.isShown).toBe(true);
        expect(tri.isShown).toBe(true);
        expect(collection.isShown).toBe(true);
      });
      test('Show and Hide only', () => {
        expect(square.isShown).toBe(true);
        expect(tri.isShown).toBe(true);
        expect(collection.isShown).toBe(true);

        collection.hideOnly([square]);
        expect(square.isShown).toBe(false);
        expect(tri.isShown).toBe(true);
        expect(collection.isShown).toBe(true);

        collection.hideAll();
        collection.showOnly([tri]);
        expect(square.isShown).toBe(false);
        expect(tri.isShown).toBe(true);
        expect(collection.isShown).toBe(true);
      });
    });
    describe('Get and Is being touched', () => {
      // let square;
      // let squareElement2;
      // let squareElement3;
      // let collection2;
      beforeEach(() => {
        // identity = new Transform();
        squareElement = figure.shapes.polygon({
          sides: 4,
          radius: Math.sqrt(2) * (1.05),
          // line: { width: Math.sqrt(2) * 0.1 },
          rotation: Math.PI / 4,
        });
        // squareElement = new FigureElementPrimitive(square);
        collection = new FigureElementCollection();
        collection.add('square', squareElement);
        collection.isTouchable = true;
        squareElement.isTouchable = true;
        figure.elements.add('f', collection);
        figure.initialize();
      });
      test('Simple', () => {
        expect(squareElement.isBeingTouched(new Point(0, 0))).toBe(true);
        expect(squareElement.isBeingTouched(new Point(1.049, 1.049))).toBe(true);
        expect(collection.isBeingTouched(new Point(0, 0))).toBe(true);
        expect(collection.isBeingTouched(new Point(1.049, 1.049))).toBe(true);
      });
      test('Collection Transform', () => {
        // figure.initialize();
        collection.setTransform(new Transform()
          .translate(new Point(10, 0))
          .rotate(Math.PI / 2));
        figure.mock.timeStep(0);
        collection.setTouchable();
        // collection.setupDraw(0);
        // collection.draw(0, [identity]);
        // figure.mock.timeStep(0);
        // console.log(collection.getBoundingRect('figure', 'touchBorder'));
        expect(collection.isBeingTouched(new Point(0, 10))).toBe(true);
        expect(collection.isBeingTouched(new Point(1.049, 11.049))).toBe(true);
        expect(collection.isBeingTouched(new Point(1.051, 11.049))).toBe(false);
        expect(collection.isBeingTouched(new Point(1.049, 11.051))).toBe(false);
      });
      test('Collection not touchable', () => {
        collection.isTouchable = false;
        squareElement.isTouchable = true;
        expect(squareElement.isBeingTouched(new Point(0, 0))).toBe(true);
        expect(collection.isBeingTouched(new Point(0, 0))).toBe(false);
      });
      test('Get being touched', () => {
        const squareElement2 = figure.shapes.polygon({
          sides: 4,
          radius: Math.sqrt(2) * (1.05),
          rotation: Math.PI / 4,
          transform: new Transform().translate(0.5, 0),
        });

        collection.add('square2', squareElement2);
        squareElement2.isTouchable = true;
        let touched = collection.getTouched(new Point(0, 0));

        expect(touched).toHaveLength(1);
        expect(touched.includes(collection)).toBe(true);
        expect(touched.includes(squareElement)).toBe(false);
        expect(touched.includes(squareElement2)).toBe(false);

        squareElement.hide();
        touched = collection.getTouched(new Point(0, 0));
        expect(touched).toHaveLength(1);

        squareElement2.hide();
        touched = collection.getTouched(new Point(0, 0));
        expect(touched).toHaveLength(0);

        squareElement.show();
        squareElement.isTouchable = false;
        touched = collection.getTouched(new Point(0, 0));
        expect(touched).toHaveLength(1);
      });
    });
    describe('Copy', () => {
      test('Vertex Objects', () => {
        collection.parent = null;

        const copy = collection._dup();
        // expect(collection).toEqual(copy);
        expect(collection).not.toBe(copy);
        // expect(collection.elements).toEqual(copy.elements);
        expect(collection.elements).not.toBe(copy.elements);
        // expect(collection.drawOrder).toEqual(copy.drawOrder);
        expect(collection.drawOrder).not.toBe(copy.drawOrder);

        // expect(collection._square).toEqual(copy._square);
        expect(collection._square).not.toBe(copy._square);
        expect(collection._square.drawingObject)
          .toBe(copy._square.drawingObject);
        expect(collection.transform).toEqual(copy.transform);
        expect(collection.transform).not.toBe(copy.transform);
        expect(collection._square).toBe(collection.elements.square);
      });
    });
  });
  describe('Get bounding box', () => {
    // let figure;
    // let square;
    let collection;
    let createSquare;
    beforeEach(() => {
      // figure = makeFigure();
      createSquare = function cs(
        offset = [0, 0],
        sTransform = new Transform(),
        cTransform = new Transform(),
      ) {
        // square = figure.shapes.polygon({
        //   radius: Math.sqrt(2) * 0.1,
        //   line: { width: 0.01 },
        //   rotation: Math.PI / 4,
        //   offset,
        //   transform: sTransform,
        // });
        collection = figure.add({
          name: 'c',
          method: 'collection',
          options: {
            transform: cTransform,
          },
          elements: [
            {
              name: 'square',
              method: 'polygon',
              options: {
                radius: Math.sqrt(2) * 0.1,
                line: { width: 0.01 },
                rotation: Math.PI / 4,
                offset,
                transform: sTransform,
              },
            },
          ],
        });
        collection = figure.elements._c;
        figure.initialize();
        figure.setFirstTransform();
      };
    });
    test('square centered on origin with scale 1', () => {
      createSquare();

      const box = collection.getBoundingRect('figure');

      expect(round(box.left, 3)).toEqual(-0.105);
      expect(round(box.bottom, 3)).toEqual(-0.105);
      expect(round(box.right, 3)).toEqual(0.105);
      expect(round(box.top, 3)).toEqual(0.105);
    });
    test('square offset from origin with scale 1, normal collection', () => {
      createSquare([0, 0], new Transform()
        .scale(1, 1)
        .rotate(0)
        .translate(0.5, 0));

      const box = collection.getBoundingRect('figure');
      expect(round(box.left, 3)).toEqual(-0.105 + 0.5);
      expect(round(box.bottom, 3)).toEqual(-0.105);
      expect(round(box.right, 3)).toEqual(0.105 + 0.5);
      expect(round(box.top, 3)).toEqual(0.105);
    });
    test('square on origin with scale 1, collection offset', () => {
      createSquare([0, 0], new Transform(), new Transform()
        .scale(1, 1)
        .rotate(0)
        .translate(0.5, 0));
      // collection.setFirstTransform(new Transform());
      const box = collection.getBoundingRect('figure');
      expect(round(box.left, 3)).toEqual(-0.105 + 0.5);
      expect(round(box.bottom, 3)).toEqual(-0.105);
      expect(round(box.right, 3)).toEqual(0.105 + 0.5);
      expect(round(box.top, 3)).toEqual(0.105);
    });
    test('square element offset and colleciton offset', () => {
      createSquare(
        [0, 0],
        new Transform().scale(1, 1).rotate(0).translate(0.5, 0),
        new Transform().scale(1, 1).rotate(0).translate(0.5, 0),
      );
      const box = collection.getBoundingRect('figure');
      expect(round(box.left, 3)).toEqual(-0.105 + 1.0);
      expect(round(box.bottom, 3)).toEqual(-0.105);
      expect(round(box.right, 3)).toEqual(0.105 + 1.0);
      expect(round(box.top, 3)).toEqual(0.105);
    });
    test('square element offset and scaled and colleciton offset', () => {
      createSquare(
        [0, 0],
        new Transform().scale(1, 1).rotate(0).translate(0.5, 0),
        new Transform().scale(2, 2).rotate(0).translate(0.5, 0),
      );
      const box = collection.getBoundingRect('figure');
      expect(round(box.left, 3)).toEqual((-0.105 + 0.5) * 2 + 0.5);
      expect(round(box.bottom, 3)).toEqual(-0.105 * 2);
      expect(round(box.right, 3)).toEqual((0.105 + 0.5) * 2 + 0.5);
      expect(round(box.top, 3)).toEqual(0.105 * 2);
    });
    test('two squares', () => {
      figure.add({
        name: 'coll',
        method: 'collection',
        options: {
          transform: new Transform().scale(2, 2).rotate(0).translate(0.5, 0.5),
        },
        elements: [
          {
            name: 'square1',
            method: 'polygon',
            options: {
              radius: Math.sqrt(2) * 0.1,
              line: { width: 0.01 },
              sides: 4,
              rotation: Math.PI / 4,
              transform: new Transform().scale(1, 1).rotate(0).translate(0.5, 0),
            },
          },
          {
            name: 'square2',
            method: 'polygon',
            options: {
              radius: Math.sqrt(2) * 0.1,
              line: { width: 0.01 },
              sides: 4,
              rotation: Math.PI / 4,
              transform: new Transform().scale(1, 1).rotate(0).translate(0, -0.5),
            },
          },
        ],
      });
      figure.setFirstTransform();
      collection = figure.elements._coll;
      const box = collection.getBoundingRect('gl');
      expect(round(box.left, 3)).toEqual(round(-0.105 * 2 + 0.5, 3));
      expect(round(box.bottom, 3)).toEqual((-0.105 - 0.5) * 2 + 0.5);
      expect(round(box.right, 3)).toEqual((0.105 + 0.5) * 2 + 0.5);
      expect(round(box.top, 3)).toEqual(0.105 * 2 + 0.5);
    });
  });
});
