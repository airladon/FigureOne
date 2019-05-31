import {
  DiagramElementPrimative,
  DiagramElementCollection,
} from './Element';
// import { AnimationPhase } from './AnimationPhase';
import {
  Point, Transform, TransformLimit,
} from '../tools/g2';
import webgl from '../__mocks__/WebGLInstanceMock';
import VertexPolygon from './DrawingObjects/VertexObject/VertexPolygon';
import {
  linear, round,
} from '../tools/math';
import * as m2 from '../tools/m2';

describe('Animationa and Movement', () => {
  describe('DiagramElementPrimative', () => {
    describe('Setup', () => {
      test('Instantiation', () => {
        const square = new VertexPolygon([webgl], 4, 1, 0.01, 0, Point.zero());
        const element = new DiagramElementPrimative(
          square,
          new Transform(),
          [0, 0, 1, 1],
        );
        expect(element instanceof DiagramElementPrimative).toBe(true);
      });
    });
    describe('Animation', () => {
      let element;
      let identity;
      beforeEach(() => {
        const square = new VertexPolygon([webgl], 4, 1, 0.01, 0, Point.zero());
        element = new DiagramElementPrimative(
          square,
          new Transform().scale(1, 1).rotate(0).translate(0, 0),
          [0, 0, 1, 1],
        );
        identity = new Transform();
        element.move.maxTransform = element.transform.constant(100);
        element.move.minTransform = element.transform.constant(-100);
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
          expect(t).toEqual(new Transform().scale(1, 1).rotate(0).translate(0, 0));

          expect(element.animations.state).toBe('idle');
          expect(element.isMoving()).toBe(true);

          element.draw(new Transform(), 10);
          expect(t.r()).toBe(0);

          element.draw(new Transform(), 10.5);
          expect(element.transform.r()).toBe(0.5);
          expect(element.animations.state).toBe('animating');
          expect(element.isMoving()).toBe(true);

          element.draw(new Transform(), 11);
          expect(element.transform.r()).toBe(1);
          expect(element.animations.state).toBe('idle');
          expect(element.isMoving()).toBe(false);
        });
        test('translate (0, 0) to (1, 0), 1 second, linear movement', () => {
          expect(element.isMoving()).toBe(false);

          // Setup the animation
          element.animations.new()
            .position({ target: new Point(1, 0), duration: 1, progression: 'linear' })
            .start();
          const t = element.transform;
          expect(t).toEqual(new Transform().scale(1, 1).rotate(0).translate(0, 0));

          expect(element.animations.state).toBe('idle');
          expect(element.isMoving()).toBe(true);

          // Initial draw setting start time
          element.draw(new Transform(), 0);
          expect(t.r()).toBe(0);

          // Draw half way through
          element.draw(new Transform(), 0.5);
          expect(element.transform.t()).toEqual(new Point(0.5, 0));
          expect(element.animations.state).toBe('animating');
          expect(element.isMoving()).toBe(true);

          // Draw at last time
          element.draw(new Transform(), 1);
          expect(element.transform.t()).toEqual(new Point(1.0, 0));
          expect(element.animations.state).toBe('idle');
          expect(element.isMoving()).toBe(false);
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
          element.draw(new Transform(), 0);     // Initial draw setting start time
          element.draw(new Transform(), 2);   // Draw half way through
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
          element.draw(new Transform(), 0);     // Initial draw setting start time
          element.draw(new Transform(), 0.5);   // Draw half way through
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
          element.draw(identity, 0);          // Give animation an initial time

          // Check initial values
          expect(element.isMoving()).toBe(true);

          // Half way through first phase
          element.draw(identity, 0.5);
          expect(element.transform.r()).toBe(0.5);
          expect(callback.mock.calls).toHaveLength(0);

          // End of first phase
          element.draw(identity, 1.0);
          expect(element.transform.r()).toBe(1.0);
          expect(callback.mock.calls).toHaveLength(0);

          // Start of next phase
          element.draw(identity, 1.1);
          expect(round(element.transform.r())).toBe(0.9);
          expect(callback.mock.calls).toHaveLength(0);

          // Skip to into third phase
          element.draw(identity, 2.1);
          expect(round(element.transform.r())).toBe(-0.1);
          expect(callback.mock.calls).toHaveLength(0);

          // Time after End
          element.draw(identity, 3.1);
          expect(round(element.transform.r())).toBe(-1);
          expect(callback.mock.calls).toHaveLength(1);
          expect(element.isMoving()).toBe(false);
        });
      });
    });
    describe('Moving Freely', () => {
      let element;
      let identity;
      beforeEach(() => {
        const square = new VertexPolygon([webgl], 4, 1, 0.01, 0, Point.zero());
        element = new DiagramElementPrimative(
          square,
          new Transform().scale(1, 1).rotate(0).translate(0, 0),
          [0, 0, 1, 1],
        );
        element.move.maxVelocity = new TransformLimit(100, 100, 100);
        element.move.freely.zeroVelocityThreshold =
          new TransformLimit(0.01, 0.01, 0.01);
        identity = new Transform();
        element.move.maxTransform = element.transform.constant(100);
        element.move.minTransform = element.transform.constant(-100);
      });
      test('Deceleration', () => {
        const callback = jest.fn();
        const initialV = new Transform().scale(-2, 1).rotate(0).translate(10, 20);
        const decel = new TransformLimit(1, 2, 1);

        element.state.movement.velocity = initialV;
        element.move.freely.deceleration = decel;

        expect(element.state.isMovingFreely).toBe(false);
        element.startMovingFreely(callback);
        expect(element.state.isMovingFreely).toBe(true);
        element.draw(identity, 0);
        expect(element.state.movement.velocity.round()).toEqual(initialV);

        element.draw(identity, 1);
        expect(element.state.isMovingFreely).toBe(true);
        let vel = element.state.movement.velocity;
        expect(vel.t().round(2)).toEqual(new Point(9.55, 19.11));
        expect(vel.s().round(2)).toEqual(new Point(-1.11, 0.55));
        expect(vel.r()).toBe(0);
        expect(element.transform.round(2)).toEqual(new Transform()
          .scale(-0.55, 1.78).rotate(0).translate(9.78, 19.55));

        element.draw(identity, 2);
        vel = element.state.movement.velocity;
        expect(vel.t().round(2)).toEqual(new Point(9.11, 18.21));
        expect(vel.s().round(2)).toEqual(new Point(-0.21, 0.11));
        expect(vel.r()).toBe(0);
        expect(callback.mock.calls).toHaveLength(0);

        element.draw(identity, 23);
        vel = element.state.movement.velocity;
        expect(vel).toEqual(vel.zero());
        expect(callback.mock.calls).toHaveLength(1);
      });
      test('Zero and Max Threshold', () => {
        const initialV = new Transform()
          .scale(30, -30).rotate(10).translate(10, -10);
        const decel = new TransformLimit(1, 1, 1);
        const zero = new TransformLimit(15, 5, 5);
        const max = new TransformLimit(20, 20, 20);
        element.state.movement.velocity = initialV;
        element.move.freely.deceleration = decel;
        element.move.freely.zeroVelocityThreshold = zero;
        element.move.maxVelocity = max;

        expect(element.state.isMovingFreely).toBe(false);

        element.startMovingFreely();
        let vel = element.state.movement.velocity;

        expect(vel.t().round(2)).toEqual(new Point(10, -10));
        expect(vel.s().round(2)).toEqual(new Point(14.14, -14.14));
        expect(vel.r()).toBe(10);

        element.draw(identity, 0);

        expect(element.state.isMovingFreely).toBe(true);

        element.draw(identity, 4.999);
        vel = element.state.movement.velocity;

        expect(vel.t().round(2)).toEqual(new Point(6.47, -6.47));
        expect(vel.s().round(2)).toEqual(new Point(10.61, -10.61));
        expect(vel.r()).toBe(5.001);

        element.draw(identity, 5.001);
        vel = element.state.movement.velocity;

        expect(vel.t().round(2)).toEqual(new Point(6.46, -6.46));
        expect(vel.s().round(2)).toEqual(new Point(0, 0));
        expect(vel.r()).toBe(0);

        element.draw(identity, 9.13);
        vel = element.state.movement.velocity;
        expect(vel.t().round(2)).toEqual(new Point(3.54, -3.54));

        element.draw(identity, 9.15);
        vel = element.state.movement.velocity;
        expect(vel.t().round(2)).toEqual(new Point(0, 0));

        expect(element.state.isMovingFreely).toBe(false);
      });
    });
    describe('Being Moved', () => {
      let element;
      const RealDate = Date.now;
      beforeEach(() => {
        const square = new VertexPolygon([webgl], 4, 1, 0.01, 0, Point.zero());
        element = new DiagramElementPrimative(
          square,
          new Transform().scale(1, 1).rotate(0).translate(0, 0),
          [0, 0, 1, 1],
        );
        element.move.freely.zeroVelocityThreshold =
          new TransformLimit(0.0001, 0.0001, 0.0001);
        element.move.maxVelocity = new TransformLimit(100, 100, 100);
      });
      afterEach(() => {
        Date.now = RealDate;
      });
      describe('Move', () => {
        test('Move', () => {
          Date.now = () => 0;
          element.startBeingMoved();
          expect(element.state.isBeingMoved).toBe(true);
          Date.now = () => 1000;
          element.moved(new Transform()
            .scale(1, 1).rotate(1).translate(1, -1));
          expect(element.state.movement.velocity.round()).toEqual(new Transform()
            .scale(0, 0).rotate(1).translate(1, -1));
        });
      });
    });
    describe('Pulse', () => {
      let element;
      let identity;
      beforeEach(() => {
        const square = new VertexPolygon([webgl], 4, 1, 0.01, 0, Point.zero());
        element = new DiagramElementPrimative(
          square,
          new Transform().scale(1, 1).rotate(0).translate(0, 0),
          [0, 0, 1, 1],
        );
        identity = new Transform();
      });
      test('pulse scale now', () => {
        let pulseTransform;
        let expectM;
        element.pulseScaleNow(1, 1.1);
        element.draw(identity, 0);
        expect(element.state.pulse.startTime).toBe(0);
        expect(element.lastDrawTransform.matrix()).toEqual(element.transform.matrix());

        element.draw(identity, 0.5);
        pulseTransform = new Transform()
          .scale(1.1, 1.1).rotate(0).translate(0, 0);
        expectM = m2.mul(element.transform.matrix(), pulseTransform.matrix());
        expect(element.lastDrawTransform.matrix()).toEqual(expectM);

        element.draw(identity, 1.0);
        pulseTransform = new Transform()
          .scale(1, 1).rotate(0).translate(0, 0);
        expectM = m2.mul(element.transform.matrix(), pulseTransform.matrix());
        expect(element.lastDrawTransform.matrix()).toEqual(expectM);
        expect(element.state.isPulsing).toBe(true);

        element.draw(identity, 1.1);
        expect(element.lastDrawTransform.matrix()).toEqual(expectM);
        expect(element.state.isPulsing).toBe(false);
      });
      test('pulse thick', () => {
        const draw = jest.fn();
        element.drawingObject.drawWithTransformMatrix = draw;
        element.pulseThickNow(1, 1.2, 5);
        element.draw(identity, 0.0);
        element.draw(identity, 0.5);
        expect(draw.mock.calls).toHaveLength(10);

        const maxPulseTransform = new Transform()
          .scale(1.2, 1.2).rotate(0).translate(0, 0);
        // (Point.zero(), 0, new Point(1.2, 1.2));
        const maxM = m2.mul(element.transform.matrix(), maxPulseTransform.matrix());
        expect(draw.mock.calls[5][0]).toEqual(maxM);

        const minPulseTransform = new Transform()
          .scale(0.8, 0.8).rotate(0).translate(0, 0);
        // Point.zero(), 0, new Point(0.8, 0.8));
        const minM = m2.mul(element.transform.matrix(), minPulseTransform.matrix());
        expect(draw.mock.calls[9][0]).toEqual(minM);
      });
    });
    describe('Get and Is being touched', () => {
      let square;
      beforeEach(() => {
        const sq = new VertexPolygon([webgl], 4, Math.sqrt(2.205), 0.1, 0, Point.zero());
        square = new DiagramElementPrimative(
          sq,
          new Transform().rotate(Math.PI / 4),
          [0, 0, 1, 1],
        );
        square.isTouchable = true;
      });
      test('Inside square and border', () => {
        expect(square.isBeingTouched(new Point(0, 0))).toBe(true);
        expect(square.isBeingTouched(new Point(1.0499, 0))).toBe(true);
        expect(square.isBeingTouched(new Point(0, 1.0499))).toBe(true);
        expect(square.isBeingTouched(new Point(1.0499, 1.0499))).toBe(true);
        expect(square.isBeingTouched(new Point(-1.0499, -1.0499))).toBe(true);
        expect(square.isBeingTouched(new Point(0, -1.0499))).toBe(true);
        expect(square.isBeingTouched(new Point(-1.0499, 0))).toBe(true);
      });
      test('Outside of border', () => {
        expect(square.isBeingTouched(new Point(1.05001, 0))).toBe(false);
        expect(square.isBeingTouched(new Point(0, 1.05001))).toBe(false);
        expect(square.isBeingTouched(new Point(1.05001, 1.05001))).toBe(false);
        expect(square.isBeingTouched(new Point(-1.05001, -1.05001))).toBe(false);
        expect(square.isBeingTouched(new Point(0, -1.05001))).toBe(false);
        expect(square.isBeingTouched(new Point(-1.05001, 0))).toBe(false);
        expect(square.isBeingTouched(new Point(100, 100))).toBe(false);
      });
      test('Get being touched', () => {
        expect(square.getTouched(new Point(0, 0))).toEqual([square]);
        expect(square.getTouched(new Point(1, 1))).toEqual([square]);
        expect(square.getTouched(new Point(2, 2))).toEqual([]);
      });
    });
    describe('Get bounding box', () => {
      test('square centered on origin with scale 1', () => {
        const sq = new VertexPolygon(
          [webgl],
          4,
          Math.sqrt(2) * (0.105), Math.sqrt(2) * 0.01,
          Math.PI / 4, Point.zero(),
        );
        const square = new DiagramElementPrimative(sq);
        const box = square.getGLBoundingRect();
        expect(round(box.left, 3)).toEqual(-0.105);
        expect(round(box.bottom, 3)).toEqual(-0.105);
        expect(round(box.right, 3)).toEqual(0.105);
        expect(round(box.top, 3)).toEqual(0.105);
      });
      test('square vertices offset to origin with scale 1', () => {
        const sq = new VertexPolygon(
          [webgl],
          4,
          Math.sqrt(2) * (0.105), Math.sqrt(2) * 0.01,
          Math.PI / 4, new Point(0.5, 0),
        );
        const square = new DiagramElementPrimative(sq);
        const box = square.getGLBoundingRect();
        expect(round(box.left, 3)).toEqual(-0.105 + 0.5);
        expect(round(box.bottom, 3)).toEqual(-0.105);
        expect(round(box.right, 3)).toEqual(0.105 + 0.5);
        expect(round(box.top, 3)).toEqual(0.105);
      });
      test('square element offset to origin with scale 1', () => {
        const sq = new VertexPolygon(
          [webgl],
          4,
          Math.sqrt(2) * (0.105), Math.sqrt(2) * 0.01,
          Math.PI / 4, new Point(0, 0),
        );
        const square = new DiagramElementPrimative(
          sq,
          new Transform().scale(1, 1).rotate(0).translate(0.5, 0),
        );
        square.setFirstTransform();
        const box = square.getGLBoundingRect();
        expect(round(box.left, 3)).toEqual(-0.105 + 0.5);
        expect(round(box.bottom, 3)).toEqual(-0.105);
        expect(round(box.right, 3)).toEqual(0.105 + 0.5);
        expect(round(box.top, 3)).toEqual(0.105);
      });
      test('square element offset to origin with scale 2', () => {
        const sq = new VertexPolygon(
          [webgl],
          4,
          Math.sqrt(2) * (0.105), Math.sqrt(2) * 0.01,
          Math.PI / 4, new Point(0.5, 0),
        );
        const square = new DiagramElementPrimative(
          sq,
          new Transform().scale(2, 2).rotate(0).translate(0, 0),
        );
        square.setFirstTransform();
        const box = square.getGLBoundingRect();
        expect(round(box.left, 3)).toEqual(-0.105 * 2 + 0.5 * 2);
        expect(round(box.bottom, 3)).toEqual(-0.105 * 2);
        expect(round(box.right, 3)).toEqual(0.105 * 2 + 0.5 * 2);
        expect(round(box.top, 3)).toEqual(0.105 * 2);
      });
    });
    describe('Default move max/min transforms', () => {
      test('setMoveBoundaryToDiagram no transform', () => {
        const sq = new VertexPolygon(
          [webgl],
          4,
          Math.sqrt(2) * 0.105, Math.sqrt(2) * 0.01,
          Math.PI / 4, new Point(0, 0),
        );
        const square = new DiagramElementPrimative(
          sq,
          new Transform().scale(1, 1).rotate(0).translate(0, 0),
        );
        square.isMovable = true;
        square.move.boundary = 'diagram';
        square.setMoveBoundaryToDiagram();
        expect(square.move.maxTransform.t()).toEqual(new Point(0.895, 0.895));
        expect(square.move.minTransform.t()).toEqual(new Point(-0.895, -0.895));
        square.setMoveBoundaryToDiagram([-2, -1, 4, 2]);
        expect(square.move.maxTransform.t()).toEqual(new Point(1.895, 0.895));
        expect(square.move.minTransform.t()).toEqual(new Point(-1.895, -0.895));
      });
      test('setMoveBoundaryToDiagram with transform', () => {
        const sq = new VertexPolygon(
          [webgl],
          4,
          Math.sqrt(2) * 0.105, Math.sqrt(2) * 0.01,
          Math.PI / 4, new Point(0, 0),
        );
        const square = new DiagramElementPrimative(
          sq,
          new Transform().scale(2, 2).rotate(0).translate(0, 0),
        );
        square.isMovable = true;
        square.move.boundary = 'diagram';

        expect(square.move.maxTransform.t().round()).toEqual(new Point(1000, 1000));
        expect(square.move.minTransform.t().round()).toEqual(new Point(-1000, -1000));

        square.setMoveBoundaryToDiagram();
        expect(square.move.maxTransform.t().round()).toEqual(new Point(0.79, 0.79));
        expect(square.move.minTransform.t().round()).toEqual(new Point(-0.79, -0.79));

        square.setMoveBoundaryToDiagram([-1, -2, 2, 4]);
        expect(square.move.maxTransform.t().round()).toEqual(new Point(0.79, 1.79));
        expect(square.move.minTransform.t().round()).toEqual(new Point(-0.79, -1.79));
      });
    });
    describe('Copy', () => {
      test('Vertex Object', () => {
        const sq = new VertexPolygon(
          [webgl],
          4,
          Math.sqrt(2) * 0.105, Math.sqrt(2) * 0.01,
          Math.PI / 4, new Point(0, 0),
        );
        const square = new DiagramElementPrimative(
          sq,
          new Transform().scale(1, 1).rotate(0).translate(0, 0),
        );
        // change a default value DiagramElement base class
        square.isShown = true;
        // change a default value in DiagramElementPrimative class
        square.color = [0.5, 0.4, 0.3, 0.2];

        const copy = square._dup();
        expect(copy).toEqual(square);
        expect(copy).not.toBe(square);
        expect(copy.drawingObject).toBe(square.drawingObject);

        // change a default value DiagramElement base class
        square.isShown = false;
        // change a default value in DiagramElementPrimative class
        square.color = [0.6, 0.5, 0.4, 0.3];
        expect(square.color).toEqual([0.6, 0.5, 0.4, 0.3]);
        expect(copy.color).toEqual([0.5, 0.4, 0.3, 0.2]);
        expect(square.isShown).toBe(false);
        expect(copy.isShown).toBe(true);
      });
    });
  });
  describe('DiagramElementCollection', () => {
    let squareElement;
    let triElement;
    let collection;
    const RealDate = Date.now;
    let identity;
    beforeEach(() => {
      identity = new Transform();
      const square = new VertexPolygon([webgl], 4, 1005, 0.01, 0, Point.zero());
      const tri = new VertexPolygon([webgl], 3, 0.1005, 0.01, 0, new Point(0.1, 0.1));
      squareElement = new DiagramElementPrimative(
        square,
        new Transform().scale(1, 1).rotate(0).translate(0, 0),
        [0, 0, 1, 1],
      );
      // Transform the triangle by 0.1 in x, rotate by 90 deg, scale by 2
      // This means, the outside point (0.105, 0) will transform:
      //    - tranlation x by 0.1: (0.205, 0)
      //    - rotation by 90 degrees: (0, 0.205)
      //    - scale by 2: (0, 0.41)
      triElement = new DiagramElementPrimative(
        tri,
        new Transform().scale(2, 2).rotate(Math.PI / 2).translate(0.1, 0),
        [0, 0, 1, 1],
      );
      collection = new DiagramElementCollection(new Transform()
        .scale(1, 1).rotate(0).translate(0, 0));
      collection.add('square', squareElement);
      collection.add('tri', triElement);
    });
    afterEach(() => {
      Date.now = RealDate;
    });
    test('Combination of animation and movement with a collection', () => {
      const callbackAnim = jest.fn();
      const callbackMoveFree = jest.fn();
      const draw = jest.fn();
      webgl.gl.drawArrays = draw;
      collection.draw(identity, 0);
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
      collection.draw(new Transform(), 0);
      collection.draw(new Transform(), 0.5);
      expect(collection.animations.state).toBe('animating');
      expect(collection.transform.round()).toEqual(new Transform()
        .scale(1, 1).rotate(0).translate(1, 0));

      Date.now = () => 0;
      collection.startBeingMoved();
      // expect(collection.state.isAnimating).toBe(false);
      expect(collection.animations.state).toBe('idle');
      expect(collection.state.isBeingMoved).toBe(true);
      expect(collection.state.isMovingFreely).toBe(false);

      // Over 1 s, rotation = 0.1;
      Date.now = () => 1000;
      collection.moved(new Transform()
        .scale(1, 1).rotate(0.1).translate(0.5, 0));
      expect(collection.transform.round()).toEqual(new Transform()
        .scale(1, 1).rotate(0.1).translate(0.5, 0));
      const velocity = new Transform().scale(0, 0).rotate(0.1).translate(-0.5, 0);
      expect(collection.state.movement.velocity.isEqualTo(velocity)).toBe(true);

      const moveFreeProps = collection.move.freely;
      moveFreeProps.deceleration = new TransformLimit(1, 0.01, 1);
      moveFreeProps.zeroVelocityThreshold = new TransformLimit(0.1, 0.05, 0.1);

      // Now at (1, 0), 0.1 and rotating with velocity 0.1 rads/s
      collection.startMovingFreely(callbackMoveFree);
      // expect(collection.state.isAnimating).toBe(false);
      expect(collection.state.isBeingMoved).toBe(false);
      expect(collection.state.isMovingFreely).toBe(true);


      collection.draw(new Transform(), 10);
      expect(collection.state.movement.velocity.isEqualTo(velocity)).toEqual(true);

      // After one second, should have rotated to:
      //  rotation: 0.1 + 0.1*1 - 0.5*0.01*1*1
      //  with velocity: 0.1 - 0.01*1*1
      collection.draw(new Transform(), 11);
      expect(collection.state.movement.velocity.round()).toEqual(new Transform()
        .scale(0, 0).rotate(0.09).translate(0, 0));
      expect(collection.transform.round()).toEqual(new Transform()
        .scale(1, 1).rotate(0.195).translate(0.38, 0));

      // At 5 seconds, velocity becomes 0, so rotation is
      //  rotation: 0.1 + 0.1*5 - 0.5*0.01*5*5
      //  with velocity: 0.1 - 0.01*1*1
      collection.draw(new Transform(), 15.1);
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
      let square;
      // let squareElement2;
      // let squareElement3;
      // let collection2;
      beforeEach(() => {
        identity = new Transform();
        square = new VertexPolygon(
          [webgl],
          4,
          Math.sqrt(2) * (1.05),
          Math.sqrt(2) * 0.1,
          Math.PI / 4,
          Point.zero(),
        );
        squareElement = new DiagramElementPrimative(square);
        collection = new DiagramElementCollection();
        collection.add('square', squareElement);
        collection.isTouchable = true;
        squareElement.isTouchable = true;
      });
      test('Simple', () => {
        expect(squareElement.isBeingTouched(new Point(0, 0))).toBe(true);
        expect(squareElement.isBeingTouched(new Point(1.049, 1.049))).toBe(true);
        expect(collection.isBeingTouched(new Point(0, 0))).toBe(true);
        expect(collection.isBeingTouched(new Point(1.049, 1.049))).toBe(true);
      });
      test('Collection Transform', () => {
        collection.setTransform(new Transform()
          .translate(new Point(10, 0))
          .rotate(Math.PI / 2));
        collection.draw(identity, 0);
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
        const squareElement2 = new DiagramElementPrimative(
          square,
          new Transform().translate(0.5, 0),
        );
        collection.add('square2', squareElement2);
        let touched = collection.getTouched(new Point(0, 0));
        // console.log(touched)
        expect(touched).toHaveLength(2);
        // expect(touched.includes(collection)).toBe(true);
        expect(touched.includes(squareElement)).toBe(true);
        expect(touched.includes(squareElement2)).toBe(false);

        squareElement.hide();
        touched = collection.getTouched(new Point(0, 0));
        expect(touched).toHaveLength(0);

        squareElement.show();
        squareElement.isTouchable = false;
        touched = collection.getTouched(new Point(0, 0));
        expect(touched).toHaveLength(0);
      });
    });
    describe('Copy', () => {
      test('Vertex Objects', () => {
        const copy = collection._dup();
        expect(collection).toEqual(copy);
        expect(collection).not.toBe(copy);
        expect(collection.elements).toEqual(copy.elements);
        expect(collection.elements).not.toBe(copy.elements);
        expect(collection.drawOrder).toEqual(copy.drawOrder);
        expect(collection.drawOrder).not.toBe(copy.drawOrder);
        expect(collection._square).toEqual(copy._square);
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
    test('square centered on origin with scale 1', () => {
      const sq = new VertexPolygon(
        [webgl],
        4,
        Math.sqrt(2) * (0.105), Math.sqrt(2) * 0.01,
        Math.PI / 4, Point.zero(),
      );
      const square = new DiagramElementPrimative(sq);
      const collection = new DiagramElementCollection();
      collection.add('square', square);
      collection.setFirstTransform(new Transform());

      const box = collection.getGLBoundingRect();
      expect(round(box.left, 3)).toEqual(-0.105);
      expect(round(box.bottom, 3)).toEqual(-0.105);
      expect(round(box.right, 3)).toEqual(0.105);
      expect(round(box.top, 3)).toEqual(0.105);
    });
    test('square offset from origin with scale 1, normal collection', () => {
      const sq = new VertexPolygon(
        [webgl],
        4,
        Math.sqrt(2) * 0.105, Math.sqrt(2) * 0.01,
        Math.PI / 4, Point.zero(),
      );
      const square = new DiagramElementPrimative(sq, new Transform()
        .scale(1, 1)
        .rotate(0)
        .translate(0.5, 0));
      const collection = new DiagramElementCollection();
      collection.add('square', square);
      collection.setFirstTransform(new Transform());

      const box = collection.getGLBoundingRect();
      expect(round(box.left, 3)).toEqual(-0.105 + 0.5);
      expect(round(box.bottom, 3)).toEqual(-0.105);
      expect(round(box.right, 3)).toEqual(0.105 + 0.5);
      expect(round(box.top, 3)).toEqual(0.105);
    });
    test('square on origin with scale 1, collection offset', () => {
      const sq = new VertexPolygon(
        [webgl],
        4,
        Math.sqrt(2) * 0.105, Math.sqrt(2) * 0.01,
        Math.PI / 4, Point.zero(),
      );
      const square = new DiagramElementPrimative(sq);
      const collection = new DiagramElementCollection(new Transform()
        .scale(1, 1)
        .rotate(0)
        .translate(0.5, 0));
      collection.add('square', square);
      collection.setFirstTransform(new Transform());

      const box = collection.getGLBoundingRect();
      expect(round(box.left, 3)).toEqual(-0.105 + 0.5);
      expect(round(box.bottom, 3)).toEqual(-0.105);
      expect(round(box.right, 3)).toEqual(0.105 + 0.5);
      expect(round(box.top, 3)).toEqual(0.105);
    });
    test('square element offset and colleciton offset', () => {
      const sq = new VertexPolygon(
        [webgl],
        4,
        Math.sqrt(2) * 0.105, Math.sqrt(2) * 0.01,
        Math.PI / 4, Point.zero(),
      );
      const square = new DiagramElementPrimative(sq, new Transform()
        .scale(1, 1)
        .rotate(0)
        .translate(0.5, 0));
      const collection = new DiagramElementCollection(new Transform()
        .scale(1, 1)
        .rotate(0)
        .translate(0.5, 0));
      collection.add('square', square);
      collection.setFirstTransform(new Transform());

      const box = collection.getGLBoundingRect();
      expect(round(box.left, 3)).toEqual(-0.105 + 1.0);
      expect(round(box.bottom, 3)).toEqual(-0.105);
      expect(round(box.right, 3)).toEqual(0.105 + 1.0);
      expect(round(box.top, 3)).toEqual(0.105);
    });
    test('square element offset and scaled and colleciton offset', () => {
      const sq = new VertexPolygon(
        [webgl],
        4,
        Math.sqrt(2) * 0.105, Math.sqrt(2) * 0.01,
        Math.PI / 4, Point.zero(),
      );
      const square = new DiagramElementPrimative(sq, new Transform()
        .scale(1, 1)
        .rotate(0)
        .translate(0.5, 0));
      const collection = new DiagramElementCollection(new Transform()
        .scale(2, 2)
        .rotate(0)
        .translate(0.5, 0));
      collection.add('square', square);
      collection.setFirstTransform(new Transform());

      const box = collection.getGLBoundingRect();
      expect(round(box.left, 3)).toEqual((-0.105 + 0.5) * 2 + 0.5);
      expect(round(box.bottom, 3)).toEqual(-0.105 * 2);
      expect(round(box.right, 3)).toEqual((0.105 + 0.5) * 2 + 0.5);
      expect(round(box.top, 3)).toEqual(0.105 * 2);
    });
    test('two squares', () => {
      const sq = new VertexPolygon(
        [webgl],
        4,
        Math.sqrt(2) * 0.105, Math.sqrt(2) * 0.01,
        Math.PI / 4, Point.zero(),
      );
      const square1 = new DiagramElementPrimative(sq, new Transform()
        .scale(1, 1)
        .rotate(0)
        .translate(0.5, 0));
      const square2 = new DiagramElementPrimative(sq, new Transform()
        .scale(1, 1)
        .rotate(0)
        .translate(0, -0.5));
      const collection = new DiagramElementCollection(new Transform()
        .scale(2, 2)
        .rotate(0)
        .translate(0.5, 0.5));
      collection.add('square1', square1);
      collection.add('square2', square2);
      collection.setFirstTransform(new Transform());

      const box = collection.getGLBoundingRect();
      expect(round(box.left, 3)).toEqual(round(-0.105 * 2 + 0.5, 3));
      expect(round(box.bottom, 3)).toEqual((-0.105 - 0.5) * 2 + 0.5);
      expect(round(box.right, 3)).toEqual((0.105 + 0.5) * 2 + 0.5);
      expect(round(box.top, 3)).toEqual(0.105 * 2 + 0.5);
    });
    // test('square vertices offset to origin with scale 1', () => {
    //   const sq = new VertexPolygon(
    //     webgl,
    //     Math.sqrt(2) * 0.1, 4, 4, Math.sqrt(2) * 0.01,
    //     Math.PI / 4, new Point(0.5, 0),
    //   );
    //   const square = new DiagramElementPrimative(sq);
    //   const box = square.getGLBoundingRect();
    //   expect(box.max.round()).toEqual(new Point(0.105 + 0.5, 0.105));
    //   expect(box.min.round()).toEqual(new Point(-0.105 + 0.5, -0.105));
    // });
    // test('square element offset to origin with scale 1', () => {
    //   const sq = new VertexPolygon(
    //     webgl,
    //     Math.sqrt(2) * 0.1, 4, 4, Math.sqrt(2) * 0.01,
    //     Math.PI / 4, new Point(0, 0),
    //   );
    //   const square = new DiagramElementPrimative(
    //     sq,
    //     new Transform().scale(1, 1).rotate(0).translate(0.5, 0),
    //   );
    //   const box = square.getGLBoundingRect();
    //   expect(box.max.round()).toEqual(new Point(0.105 + 0.5, 0.105));
    //   expect(box.min.round()).toEqual(new Point(-0.105 + 0.5, -0.105));
    // });
    // test('square element offset to origin with scale 2', () => {
    //   const sq = new VertexPolygon(
    //     webgl,
    //     Math.sqrt(2) * 0.1, 4, 4, Math.sqrt(2) * 0.01,
    //     Math.PI / 4, new Point(0.5, 0),
    //   );
    //   const square = new DiagramElementPrimative(
    //     sq,
    //     new Transform().scale(2, 2).rotate(0).translate(0, 0),
    //   );
    //   const box = square.getGLBoundingRect();
    //   expect(box.max.round()).toEqual(new Point(0.105 * 2 + 0.5 * 2, 0.105 * 2));
    //   expect(box.min.round()).toEqual(new Point(-0.105 * 2 + 0.5 * 2, -0.105 * 2));
    // });
  });
});
