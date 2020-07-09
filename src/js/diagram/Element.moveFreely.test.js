import {
  Point, Transform,
} from '../tools/g2';
import {
  round,
} from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';
import Worker from '../__mocks__/recorder.worker.mock';

// tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');
jest.useFakeTimers();

describe('Move Freely', () => {
  let diagram;
  let a;
  let click;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
        options: {
          radius: 1,
          sides: 4,
          rotation: Math.PI / 4,
        },
      },
    ]);
    a = diagram.elements._a;
    a.setMovable(true);
    click = jest.fn();
    a.onClick = click;
    diagram.initialize();
  });
  describe('Touch in bounds', () => {
    test('In Bounds', () => {
      expect(click.mock.calls.length).toBe(0);
      diagram.mock.touchDown([0, 0]);
      expect(click.mock.calls.length).toBe(1);
    });
    test('On Edge', () => {
      expect(click.mock.calls.length).toBe(0);
      diagram.mock.touchDown([1 / Math.sqrt(2) - 0.001, 0]);
      expect(click.mock.calls.length).toBe(1);
    });
    test('Out of bounds', () => {
      expect(click.mock.calls.length).toBe(0);
      diagram.mock.touchDown([1 / Math.sqrt(2) + 0.001, 0]);
      expect(click.mock.calls.length).toBe(0);
    });
  });
  describe('Move', () => {
    test('One Step', () => {
      expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
      diagram.mock.touchDown([0, 0]);
      diagram.mock.touchMove([1, 0]);
      expect(a.getPosition().round(3)).toEqual(new Point(1, 0));
    });
    test('One Step with time', () => {
      expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
      diagram.mock.touchDown([0, 0]);
      diagram.mock.timeStep(0.1);
      diagram.mock.touchMove([1, 0]);
      expect(a.getPosition().round(3)).toEqual(new Point(1, 0));
    });
    test('Two Steps with time', () => {
      expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
      diagram.mock.touchDown([0, 0]);
      diagram.mock.timeStep(0.1);
      diagram.mock.touchMove([1, 0]);
      expect(a.getPosition().round(3)).toEqual(new Point(1, 0));
      diagram.mock.timeStep(0.1);
      diagram.mock.touchMove([1, 1]);
      expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    });
    test('Release', () => {
      
    })
  });
})