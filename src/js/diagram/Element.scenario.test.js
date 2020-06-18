import {
  Point, Transform,
} from '../tools/g2';
import {
  round,
} from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');

describe('Diagram Recorder', () => {
  let diagram;
  let timeStep;
  let initialTime;
  let duration;
  let a;
  let b;
  let c;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
        options: {
          color: [1, 0, 0, 1],
          radius: 1,
          width: 0.1,
        },
      },
      {
        name: 'c',
        method: 'collection',
        addElements: [
          {
            name: 'b',
            method: 'polygon',
            options: {
              color: [1, 0, 0, 1],
              radius: 1,
              width: 0.1,
            },
          },
        ],
      },
    ]);
    diagram.initialize();
    a = diagram.getElement('a');
    b = diagram.getElement('b');
    c = diagram.getElement('c');
    duration = 0;
    initialTime = 1;

    timeStep = (deltaTimeInSeconds) => {
      const newNow = (duration + deltaTimeInSeconds + initialTime) * 1000;
      global.performance.now = () => newNow;
      diagram.animateNextFrame();
      diagram.draw(newNow / 1000);
    };
  });
  describe('Scenario', () => {
    test('Position', () => {
      expect(a.getPosition()).toEqual(new Point(0, 0));
      a.setScenario({ position: [1, 1]});
      expect(a.getPosition()).toEqual(new Point(1, 1));
    });
    test('Rotation', () => {
      expect(a.getRotation()).toBe(0);
      a.setScenario({ rotation: 1 });
      expect(a.getRotation()).toBe(1);
    });
    test('Scale', () => {
      expect(a.getScale()).toEqual(new Point(1, 1));
      a.setScenario({ scale: [2, 2]});
      expect(a.getScale()).toEqual(new Point(2, 2));
    });
    test('Transform', () => {
      expect(a.getPosition()).toEqual(new Point(0, 0));
      expect(a.getScale()).toEqual(new Point(1, 1));
      expect(a.getRotation()).toBe(0);
      a.setScenario({ transform: new Transform().scale(2, 2).rotate(0.5).translate(1, 1)});
      expect(a.getPosition()).toEqual(new Point(1, 1));
      expect(a.getScale()).toEqual(new Point(2, 2));
      expect(a.getRotation()).toBe(0.5);
    });
  });
});