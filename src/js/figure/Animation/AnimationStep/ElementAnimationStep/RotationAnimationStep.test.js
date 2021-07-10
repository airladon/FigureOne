import * as tools from '../../../../tools/tools';
import makeFigure from '../../../../__mocks__/makeFigure';
import { round } from '../../../../tools/math';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Rotation Animation Step', () => {
  let elem1;
  let figure;
  beforeEach(() => {
    figure = makeFigure();
    elem1 = figure.collections.line();
    elem1.setRotation(0);
    figure.elements.add('elem1', elem1);
  });
  test('Simple rotate', () => {
    elem1.animations.new()
      .rotation({ target: 1, duration: 1 })
      .start();

    elem1.animations.nextFrame(0);
    expect(round(elem1.getRotation())).toBe(0);

    elem1.animations.nextFrame(0.5);
    expect(round(elem1.getRotation())).toBe(0.5);

    elem1.animations.nextFrame(1.0);
    expect(round(elem1.getRotation())).toBe(1);

    elem1.animations.nextFrame(1.1);
    expect(round(elem1.getRotation())).toBe(1);
  });
  test('Simple rotate to delta', () => {
    elem1.animations.new()
      .rotation({ delta: 1, duration: 1 })
      .start();

    elem1.animations.nextFrame(0);
    expect(round(elem1.getRotation())).toBe(0);

    elem1.animations.nextFrame(0.5);
    expect(round(elem1.getRotation())).toBe(0.5);

    elem1.animations.nextFrame(1.0);
    expect(round(elem1.getRotation())).toBe(1);

    elem1.animations.nextFrame(1.1);
    expect(round(elem1.getRotation())).toBe(1);
  });
  test('Rotate counter clock wise', () => {
    elem1.animations.new()
      .rotation({
        start: 1, target: 0, direction: 1, duration: 1,
      })
      .start();

    elem1.animations.nextFrame(0);
    expect(round(elem1.getRotation())).toBe(1);

    elem1.animations.nextFrame(0.5);
    expect(round(elem1.getRotation(), 2)).toBe(3.64);

    elem1.animations.nextFrame(1.0);
    expect(round(elem1.getRotation(), 2)).toBe(0);
  });
  describe('Rotation Types', () => {
    describe('2D', () => {
      test('r', () => {
        elem1.transform.updateRotation(['r', 0]);
        elem1.animations.new().rotation({ target: ['r', 1], duration: 1 }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation())).toBe(0);
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 2)).toBe(0.5);
      });
      test('2D', () => {
        elem1.transform.updateRotation(['2D', 0]);
        elem1.animations.new().rotation({ target: ['2D', 1], duration: 1 }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation())).toBe(0);
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 2)).toBe(0.5);
      });
      test('number', () => {
        elem1.transform.updateRotation(0);
        elem1.animations.new().rotation({ target: 1, duration: 1 }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation())).toBe(0);
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 2)).toBe(0.5);
      });
      test('mix', () => {
        elem1.transform.updateRotation(0);
        elem1.animations.new().rotation({ target: ['2D', 1], duration: 1 }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation())).toBe(0);
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 2)).toBe(0.5);
      });
    });
    describe('spherical', () => {
      test('rs', () => {
        elem1.transform.updateRotation(['rs', 0, 0]);
        elem1.animations.new().rotation({ target: ['rs', 1, 2], duration: 1 }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation())).toEqual([0, 0]);
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 2)).toEqual([0.5, 1]);
      });
      test('sph', () => {
        elem1.transform.updateRotation(['sph', 0, 0]);
        elem1.animations.new().rotation({ target: ['sph', 1, 2], duration: 1 }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation())).toEqual([0, 0]);
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 2)).toEqual([0.5, 1]);
      });
      test('mix', () => {
        elem1.transform.updateRotation(['rs', 0, 0]);
        elem1.animations.new().rotation({ target: ['sph', 1, 2], duration: 1 }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation())).toEqual([0, 0]);
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 2)).toEqual([0.5, 1]);
      });
    });
    describe('cartesian', () => {
      test('rc', () => {
        elem1.transform.updateRotation(['rc', 0, 0, 0]);
        elem1.animations.new().rotation({ target: ['rc', 1, 2, 3], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rc', 0, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rc', 0.5, 1, 1.5]));
      });
      test('xyz', () => {
        elem1.transform.updateRotation(['xyz', 0, 0, 0]);
        elem1.animations.new().rotation({ target: ['xyz', 1, 2, 3], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rc', 0, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rc', 0.5, 1, 1.5]));
      });
      test('mix', () => {
        elem1.transform.updateRotation(['rc', 0, 0, 0]);
        elem1.animations.new().rotation({ target: ['xyz', 1, 2, 3], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rc', 0, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rc', 0.5, 1, 1.5]));
      });
    });
    describe('axis angle', () => {
      test('ra', () => {
        elem1.transform.updateRotation(['ra', [0, 1, 0], 0]);
        elem1.animations.new().rotation({ target: ['ra', [0, 1, 0], 1], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0.5]));
      });
      test('ra numbers', () => {
        elem1.transform.updateRotation(['ra', 0, 1, 0, 0]);
        elem1.animations.new().rotation({ target: ['ra', 0, 1, 0, 1], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0.5]));
      });
      test('axis', () => {
        elem1.transform.updateRotation(['axis', [0, 1, 0], 0]);
        elem1.animations.new().rotation({ target: ['axis', [0, 1, 0], 1], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0.5]));
      });
      test('mix', () => {
        elem1.transform.updateRotation(['ra', [0, 1, 0], 0]);
        elem1.animations.new().rotation({ target: ['axis', [0, 1, 0], 1], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0.5]));
      });
    });
    describe('direction', () => {
      test('rd', () => {
        elem1.transform.updateRotation(['rd', [1, 0, 0]]);
        elem1.animations.new().rotation({ target: ['rd', [0, 1, 0]], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rd', 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rd', 0.5, 0.5, 0]));
      });
      test('rd numbers', () => {
        elem1.transform.updateRotation(['rd', 1, 0, 0]);
        elem1.animations.new().rotation({ target: ['rd', 0, 1, 0], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rd', 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rd', 0.5, 0.5, 0]));
      });
      test('dir', () => {
        elem1.transform.updateRotation(['dir', [1, 0, 0]]);
        elem1.animations.new().rotation({ target: ['dir', [0, 1, 0]], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rd', 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rd', 0.5, 0.5, 0]));
      });
      test('mix', () => {
        elem1.transform.updateRotation(['rd', [1, 0, 0]]);
        elem1.animations.new().rotation({ target: ['dir', [0, 1, 0]], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rd', 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rd', 0.5, 0.5, 0]));
      });
    });
    describe('rbasis', () => {
      test('rb', () => {
        elem1.transform.updateRotation(['rb', { x: [1, 0, 0], y: [0, 1, 0] }]);
        elem1.animations.new().rotation({
          target: ['rb', { x: [0, 0, 1], y: [0, 1, 0] }],
          duration: 1,
        }).start();
        const t = elem1.getTransform.bind(elem1);
        const r2 = 1 / Math.sqrt(2);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rb', 1, 0, 0, 0, 1, 0, 0, 0, 1]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rb', r2, 0, r2, 0, 1, 0, -r2, 0, r2]));
      });
      test('rb numbers', () => {
        elem1.transform.updateRotation(['rb', 1, 0, 0, 0, 1, 0, 0, 0, 1]);
        elem1.animations.new().rotation({
          target: ['rb', 0, 0, 1, 0, 1, 0, -1, 0, 0],
          duration: 1,
        }).start();
        const t = elem1.getTransform.bind(elem1);
        const r2 = 1 / Math.sqrt(2);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rb', 1, 0, 0, 0, 1, 0, 0, 0, 1]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rb', r2, 0, r2, 0, 1, 0, -r2, 0, r2]));
      });
      test('rbasis', () => {
        elem1.transform.updateRotation(['rbasis', { x: [1, 0, 0], y: [0, 1, 0] }]);
        elem1.animations.new().rotation({
          target: ['rbasis', { x: [0, 0, 1], y: [0, 1, 0] }],
          duration: 1,
        }).start();
        const t = elem1.getTransform.bind(elem1);
        const r2 = 1 / Math.sqrt(2);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rb', 1, 0, 0, 0, 1, 0, 0, 0, 1]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rb', r2, 0, r2, 0, 1, 0, -r2, 0, r2]));
      });
      test('mix', () => {
        elem1.transform.updateRotation(['rb', { x: [1, 0, 0], y: [0, 1, 0] }]);
        elem1.animations.new().rotation({
          target: ['rbasis', { x: [0, 0, 1], y: [0, 1, 0] }],
          duration: 1,
        }).start();
        const t = elem1.getTransform.bind(elem1);
        const r2 = 1 / Math.sqrt(2);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rb', 1, 0, 0, 0, 1, 0, 0, 0, 1]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rb', r2, 0, r2, 0, 1, 0, -r2, 0, r2]));
      });
    });
  });
  // test('Rotate clip to 0to360', () => {
  //   elem1.animations.new()
  //     .rotation({
  //       start: -1, target: 0, clipTo: '0to360', duration: 1,
  //     })
  //     .start();
  //   elem1.animations.nextFrame(0);
  //   expect(round(elem1.getRotation(), 2)).toBe(6.28 - 1);
  //   elem1.animations.nextFrame(0.5);
  //   expect(round(elem1.getRotation(), 2)).toBe(6.28 - 0.5);
  //   elem1.animations.nextFrame(1.0);
  //   expect(round(elem1.getRotation(), 2)).toBe(0);
  //   elem1.animations.nextFrame(1.1);
  //   expect(round(elem1.getRotation(), 2)).toBe(0);
  // });
  // test('Rotate clip to -180to180', () => {
  //   elem1.animations.new()
  //     .rotation({
  //       start: 0, target: 6.28, clipTo: '-180to180', duration: 1, direction: 1, progression: 'linear',
  //     })
  //     .start();
  //   elem1.animations.nextFrame(0);
  //   expect(round(elem1.getRotation(), 2)).toBe(0);
  //   elem1.animations.nextFrame(0.5);
  //   expect(round(elem1.getRotation(), 2)).toBe(3.14);
  //   elem1.animations.nextFrame(0.75);
  //   expect(round(elem1.getRotation(), 2)).toBe(-3.14 / 2);
  //   elem1.animations.nextFrame(1.1);
  //   expect(round(elem1.getRotation(), 2)).toBe(0);
  // });
  test('Rotate with velocity', () => {
    elem1.animations.new()
      .rotation({
        start: 0, target: 1, velocity: 1, direction: 1, progression: 'linear',
      })
      .start();
    elem1.animations.nextFrame(0);
    expect(round(elem1.getRotation(), 2)).toBe(0);
    elem1.animations.nextFrame(0.5);
    expect(round(elem1.getRotation(), 2)).toBe(0.5);
    elem1.animations.nextFrame(1);
    expect(round(elem1.getRotation(), 2)).toBe(1);
  });
  test('Rotate with velocity, but no movement', () => {
    elem1.animations.new()
      .rotation({
        start: 1, target: 1, velocity: 1, direction: 1, progression: 'linear',
      })
      .start();
    expect(elem1.animations.state).toBe('idle');
    expect(elem1.animations.animations[0].state).toBe('finished');
    expect(round(elem1.getRotation(), 2)).toBe(1);
    figure.draw(0);
    expect(elem1.animations.state).toBe('idle');
    expect(elem1.animations.animations).toHaveLength(0);
  });
});
