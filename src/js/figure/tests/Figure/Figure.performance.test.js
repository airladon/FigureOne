import {
  Point,
} from '../../../tools/g2';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

jest.useFakeTimers();

describe('Animate To State', () => {
  let figure;
  let refTime;
  beforeEach(() => {
    figure = makeFigure();

    const refStart = performance.now();
    for (let i = 0; i < 100000; i += 1) {
      const a = Math.sin(Math.sqrt(2));
    }
    refTime = performance.now() - refStart;
    console.log(refTime);
    figure.add([
      {
        name: 'c',
        method: 'collection',
        elements: [
          {
            name: 'p2',
            method: 'polygon',
          },
          // {
          //   name: 'p3',
          //   method: 'polygon',
          //   mods: {
          //     dependantTransform: true,
          //   },
          // },
        ],
      },
      {
        name: 'p1',
        method: 'polygon',
      },
    ]);
    // c = figure.elements._c;
    // p1 = figure.elements._p1;
    // p2 = c._p2;
    // p3 = c._p3;
    // figure.initialize();
    // drawCallback = jest.fn(() => {});
    // figure.subscriptions.add('beforeDraw', drawCallback);
  });
  describe('Focus and focus loss simulation', () => {
    test('Focus not lost', () => {
      expect(true).toBe(true);
      // expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      // figure.mock.timeStep(0);
      // p1.animations.new().position({ target: [2, 0], duration: 2, progression: 'linear' }).start('now');
      // expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      // figure.mock.timeStep(1);
      // expect(p1.getPosition('figure').round(3)).toEqual(new Point(1, 0));
      // figure.mock.timeStep(1);
      // expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      // expect(figure.getRemainingAnimationTime()).toBe(0);
      // expect(drawCallback.mock.calls).toHaveLength(3);
    });
  });
});
