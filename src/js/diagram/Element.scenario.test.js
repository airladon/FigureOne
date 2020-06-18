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
    b = diagram.getElement('c.b');
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
      a.setScenario({ transform: new Transform().scale(2, 2).rotate(0.5).translate(1, 1) });
      expect(a.getPosition()).toEqual(new Point(1, 1));
      expect(a.getScale()).toEqual(new Point(2, 2));
      expect(a.getRotation()).toBe(0.5);
    });
    test('Transform with overrides', () => {
      a.setScenario({
        transform: new Transform().scale(2, 2).rotate(0.5).translate(1, 1),
        position: [2, 2],
        scale: 3,
        rotation: 4,
      });
      expect(a.getPosition()).toEqual(new Point(2, 2));
      expect(a.getScale()).toEqual(new Point(3, 3));
      expect(a.getRotation()).toBe(4);
    });
    test('Name', () => {
      a.scenarios.s1 = { position: [2, 3] };
      a.setScenario('s1');
      expect(a.getPosition()).toEqual(new Point(2, 3));
    });
  });
  describe('Scenarios', () => {
    test('Set', () => {
      a.scenarios.s1 = { position: [2, 3] };
      b.scenarios.s1 = { position: [3, 4] };
      diagram.elements.setScenarios('s1');
      expect(a.getPosition()).toEqual(new Point(2, 3));
      expect(b.getPosition()).toEqual(new Point(3, 4));
    });
    test('Set only if visible', () => {
      a.scenarios.s1 = { position: [2, 3] };
      b.hide();
      b.scenarios.s1 = { position: [3, 4] };
      diagram.elements.setScenarios('s1', true);
      expect(a.getPosition()).toEqual(new Point(2, 3));
      expect(b.getPosition()).toEqual(new Point(0, 0));
    });
  });
  describe('Save', () => {
    beforeEach(() => {
      a.setPosition(1, 5);
      a.setRotation(3);
      a.setScale(2, 2);
      a.setColor([0, 1, 0, 1]);
      a.show();
      diagram.setFirstTransform();
    });
    test('Save Scenario default', () => {
      a.saveScenario('s1');
      expect(a.scenarios.s1.transform).toEqual(new Transform('polygon').scale(2, 2).rotate(3).translate(1, 5));
      expect(a.scenarios.s1.color).toEqual([0, 1, 0, 1]);
      expect(a.scenarios.s1.isShown).toEqual(true);
      expect(Object.keys(a.scenarios.s1)).toHaveLength(3);
    });
    test('Save Scenario everything', () => {
      a.saveScenario('s1', ['position', 'scale', 'rotation', 'color', 'isShown', 'transform']);
      expect(a.scenarios.s1.transform).toEqual(new Transform('polygon').scale(2, 2).rotate(3).translate(1, 5));
      expect(a.scenarios.s1.color).toEqual([0, 1, 0, 1]);
      expect(a.scenarios.s1.isShown).toEqual(true);
      expect(a.scenarios.s1.position).toEqual(new Point(1, 5));
      expect(a.scenarios.s1.scale).toEqual(new Point(2, 2));
      expect(a.scenarios.s1.rotation).toBe(3);
      expect(Object.keys(a.scenarios.s1)).toHaveLength(6);
    });
  });
  describe('Animation', () => {
    test('Simple Position', () => {
      a.animations.new()
        .scenario({ target: { position: [1, 1] }, duration: 1 })
        .start();
      timeStep(0);
      expect(a.getPosition()).toEqual(new Point(0, 0));
      timeStep(0.5);
      expect(a.getPosition()).toEqual(new Point(0.5, 0.5));
      timeStep(1);
      expect(a.getPosition()).toEqual(new Point(1, 1));
      expect(diagram.isAnimating()).toBe(false);
    });
    test('Position, Rotation, Scale, Color, isShown', () => {
      a.animations.new()
        .scenario({
          target: {
            position: [1, 1],
            isShown: false,
            rotation: 1,
            scale: 2,
            color: [0, 1, 0, 1],
          },
          duration: 1,
        })
        .start();
      timeStep(0);
      expect(a.getPosition()).toEqual(new Point(0, 0));
      expect(a.getScale()).toEqual(new Point(1, 1));
      expect(a.getRotation()).toBe(0);
      expect(a.opacity).toBe(1);
      expect(a.isShown).toBe(true);
      expect(a.color).toEqual([1, 0, 0, 1]);
      timeStep(0.5);
      expect(a.getPosition()).toEqual(new Point(0.5, 0.5));
      expect(a.getScale()).toEqual(new Point(1.5, 1.5));
      expect(a.getRotation()).toBe(0.5);
      expect(a.opacity).toBe(0.5005);
      expect(a.isShown).toBe(true);
      expect(a.color).toEqual([0.5, 0.5, 0, 1]);
      timeStep(1);
      expect(a.getPosition()).toEqual(new Point(1, 1));
      expect(a.getScale()).toEqual(new Point(2, 2));
      expect(a.getRotation()).toBe(1);
      expect(a.opacity).toBe(1);
      expect(a.isShown).toBe(false);
      expect(a.color).toEqual([0, 1, 0, 1]);
      expect(diagram.isAnimating()).toBe(false);
    });
  });
});
