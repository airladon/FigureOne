import {
  Point,
} from '../../../tools/g2';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';

const perf = require('perf_hooks').performance;


tools.isTouchDevice = jest.fn();

jest.useFakeTimers();

describe('Performance Testing', () => {
  let figure;
  let refTime;
  let setTransformCount;
  beforeEach(() => {
    figure = makeFigure();

    const start = perf.now();
    for (let i = 0; i < 3e6; i += 1) {
      Math.sqrt(2.532);
    }
    refTime = perf.now() - start;

    setTransformCount = 0;
    const addToCount = () => { setTransformCount += 1; };
    for (let i = 0; i < 100; i += 1) {
      const [e] = figure.add({
        name: `p${i}`,
        method: 'primitives.polygon',
        options: {
          sides: 100,
          position: [0, 0],
        },
        mods: {
          scenarios: {
            final: { position: [1, 1] },
          },
        },
      });
      e.subscriptions.add('setTransform', () => addToCount());
    }
  });
  describe('Animation', () => {
    test('Time', () => {
      figure.elements.animations.new()
        .scenarios({ target: 'final', duration: 1 })
        .start();
      figure.mock.timeStep(0);
      let durations = [];
      for (let i = 0; i < 99; i += 1) {
        setTransformCount = 0;
        const start = perf.now();
        figure.mock.timeStep(0.01);
        const duration = perf.now() - start;
        durations.push(duration);
        expect(setTransformCount).toBe(100);
      }
      durations = durations.sort().slice(5, 95);
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      const ave = durations.reduce((d, sum) => sum + d) / 100;
      // console.log(min, max, ave, refTime / 10, refTime / 35)
      expect(max).toBeLessThan(refTime / 10);
      expect(min).toBeGreaterThan(refTime / 35);
      expect(ave).toBeLessThan(refTime / 20);
    });
    // test('Number SetTransforms', () => {
    //   figure.elements.animations.new()
    //     .scenarios({ target: 'final', duration: 1 })
    //     .start();
    //   figure.mock.timeStep(0);
    //   const start = perf.now();
    //   figure.mock.timeStep(0.5);
    //   const duration = perf.now() - start;
    //   expect(duration).toBeLessThan(refTime / 10);
    //   expect(duration).toBeGreaterThan(refTime / 15);
      
    // });
  });
});
