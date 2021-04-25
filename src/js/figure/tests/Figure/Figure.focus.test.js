import {
  Point,
} from '../../../tools/g2';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

jest.useFakeTimers();

describe('Animate To State', () => {
  let figure;
  let p1;
  let p2;
  let p3;
  let c;
  let drawCallback;
  beforeEach(() => {
    figure = makeFigure();
    figure.add([
      {
        name: 'c',
        method: 'collection',
        elements: [
          {
            name: 'p2',
            method: 'polygon',
          },
          {
            name: 'p3',
            method: 'polygon',
            mods: {
              dependantTransform: true,
            },
          },
        ],
      },
      {
        name: 'p1',
        method: 'polygon',
      },
    ]);
    c = figure.elements._c;
    p1 = figure.elements._p1;
    p2 = c._p2;
    p3 = c._p3;
    figure.initialize();
    drawCallback = jest.fn(() => {});
    figure.subscriptions.add('beforeDraw', drawCallback);
  });
  describe('Focus and focus loss simulation', () => {
    test('Focus not lost', () => {
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(0);
      p1.animations.new().position({ target: [2, 0], duration: 2, progression: 'linear' }).start('now');
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(1);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(1, 0));
      figure.mock.timeStep(1);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(figure.getRemainingAnimationTime()).toBe(0);
      expect(drawCallback.mock.calls).toHaveLength(3);
    });
    test.only('Focus lost', () => {
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(0);
      p1.animations.new().position({ target: [2, 0], duration: 2, progression: 'linear' }).start('now');
      console.log('***** started *****')
      console.log(figure.elements.getNextAnimationFinishTime(), figure.elements.getRemainingAnimationTime());
      debugger;
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(3, null, false);
      // expect(p1.getPosition('figure').round(3)).toEqual(new Point(1, 0));
      // figure.mock.timeStep(1, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(figure.getRemainingAnimationTime()).toBe(0);
      expect(drawCallback.mock.calls).toHaveLength(1);
    });
  });
});
