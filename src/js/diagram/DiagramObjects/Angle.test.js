import {
  Point,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

describe('Angle', () => {
  let diagram;

  beforeEach(() => {
    jest.useFakeTimers();
    diagram = makeDiagram();
  });
  test('Default Angle', () => {
    const angle = diagram.advanced.angle();
    expect(angle.angle).toBe(1);
    expect(angle.getRotation()).toBe(0);
  });
  test('By Angle', () => {
    const angle = diagram.advanced.angle({
      angle: 2,
      startAngle: 1,
    });
    expect(angle.angle).toBe(2);
    expect(angle.getRotation()).toBe(1);
  });
  test('By Points', () => {
    const angle = diagram.advanced.angle({
      p1: [0, 1],
      p2: [0, 0],
      p3: [1, 0],
    });
    expect(round(angle.angle * 180 / Math.PI, 5)).toBe(270);
  });
  test('By Points reverse direction', () => {
    const angle = diagram.advanced.angle({
      p1: [0, 1],
      p2: [0, 0],
      p3: [1, 0],
      direction: -1,
    });
    expect(round(angle.angle * 180 / Math.PI, 5)).toBe(270);
  });
  describe('Curve', () => {
    test('5 sides of 50 evenly', () => {
      diagram.addElement({
        name: 'a',
        method: 'angle',
        options: {
          angle: Math.PI / 5,
          curve: {
            radius: 1,
            width: 0.01,
            sides: 50,
          },
        },
      });
      const a = diagram.elements._a;
      expect(a._curve.getRotation()).toBe(0);
    });
    test('5 sides of 50 not even', () => {
      // For 50 sides, each side is 2 * Math.PI / 50 = Math.PI / 25
      // So make the angle one half of one side larger = Math.PI / 50
      diagram.addElement({
        name: 'a',
        method: 'angle',
        options: {
          angle: Math.PI / 5 + Math.PI / 50,
          curve: {
            radius: 1,
            width: 0.01,
            sides: 50,
          },
        },
      });
      const a = diagram.elements._a;
      expect(round(a._curve.getRotation())).toBe(round(Math.PI / 50 / 2));
    });
  });
  describe('Parametric', () => {
    let create;
    let a;
    beforeEach(() => {
      const diagramOptions = {
        positivePositive: {
          angle: Math.PI / 2,
          direction: 'positive',
          label: {
            text: null,
            radius: Math.sqrt(2),
            offset: 0,
            orientation: 'horizontal',
          },
        },
        positiveNegative: {
          angle: Math.PI / 2,
          direction: 'negative',
          label: {
            text: null,
            radius: Math.sqrt(2),
            offset: 0,
            orientation: 'horizontal',
          },
        },
        negativePositive: {
          angle: -Math.PI / 2,
          direction: 'positive',
          label: {
            text: null,
            radius: Math.sqrt(2),
            offset: 0,
            orientation: 'horizontal',
          },
        },
        negativeNegative: {
          angle: -Math.PI / 2,
          direction: 'negative',
          label: {
            text: null,
            radius: Math.sqrt(2),
            offset: 0,
            orientation: 'horizontal',
          },
        },
        horizontalOutsidePP: {
          angle: Math.PI / 2,
          startAngle: Math.PI / 4,
          direction: 'positive',
          label: {
            text: null,
            radius: 1,
            offset: 0.1,
            orientation: 'horizontal',
            location: 'outside',
            update: true,
          },
        },
        horizontalOutsidePN: {
          angle: Math.PI / 2,
          startAngle: Math.PI / 4,
          direction: 'negative',
          label: {
            text: null,
            radius: 1,
            offset: 0.1,
            orientation: 'horizontal',
            location: 'outside',
            update: true,
          },
        },
      };
      create = (option) => {
        diagram.addElement({
          name: 'a',
          method: 'advanced.angle',
          options: diagramOptions[option],
        });
        a = diagram.getElement('a');
      };
    });
    test('Positive angle, positive direction', () => {
      create('positivePositive');
      expect(a.getLabel()).toBe('90º');
      expect(a._label.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
    });
    test('Positive angle, negative direction', () => {
      create('positiveNegative');
      expect(a.getLabel()).toBe('270º');
      expect(a._label.getPosition('diagram').round(3)).toEqual(new Point(-1, -1));
    });
    test('Negative angle, negative direction', () => {
      create('negativeNegative');
      expect(a.getLabel()).toBe('270º');
      expect(a._label.getPosition('diagram').round(3)).toEqual(new Point(-1, 1));
    });
    test('Negative angle, positive direction', () => {
      create('negativePositive');
      expect(a.getLabel()).toBe('90º');
      expect(a._label.getPosition('diagram').round(3)).toEqual(new Point(1, -1));
    });
    test('Horiztonal, outside, Positive angle, positive direction', () => {
      create('horizontalOutsidePP');
      expect(a.getLabel()).toBe('90º');
      expect(a._label.getPosition('diagram').round(2)).toEqual(new Point(0, 1.18));
      expect(round(a._label.getRotation(), 3)).toBe(round(-Math.PI / 4, 3));
    });
    test('Horiztonal, outside, Positive angle, negative direction', () => {
      create('horizontalOutsidePN');
      expect(a.getLabel()).toBe('270º');
      expect(a._label.getPosition('diagram').round(2)).toEqual(new Point(0, -1.18));
      expect(round(a._label.getRotation(), 3)).toBe(round(-Math.PI / 4, 3));
    });
  });
});
