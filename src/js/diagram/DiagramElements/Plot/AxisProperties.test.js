import { AxisProperties } from './AxisProperties';
// import { Point } from '../../g2';

describe('Axis Properties', () => {
  describe('Get major and minor num', () => {
    test('Get Number simple', () => {
      const props = new AxisProperties();
      props.limits = { min: 0, max: 1 };
      props.majorTicks.start = 0;
      props.majorTicks.step = 0.1;
      props.minorTicks.start = props.majorTicks.start;
      props.minorTicks.step = props.majorTicks.step;
      const result = 11;
      expect(props.getMajorNum()).toBe(result);
      expect(props.getMinorNum()).toBe(result);
    });
    test('Get Number offset', () => {
      const props = new AxisProperties();
      props.limits = { min: 0, max: 1 };
      props.majorTicks.start = 0.2;
      props.majorTicks.step = 0.1;
      props.minorTicks.start = props.majorTicks.start;
      props.minorTicks.step = props.majorTicks.step;
      const result = 9;
      expect(props.getMajorNum()).toBe(result);
      expect(props.getMinorNum()).toBe(result);
    });
    test('Get Number negative', () => {
      const props = new AxisProperties();
      props.limits = { min: -1, max: 1 };
      props.majorTicks.start = -1;
      props.majorTicks.step = 0.1;
      props.minorTicks.start = props.majorTicks.start;
      props.minorTicks.step = props.majorTicks.step;
      const result = 21;
      expect(props.getMajorNum()).toBe(result);
      expect(props.getMinorNum()).toBe(result);
    });
  });
  describe('Get Auto major and minor', () => {
    let check;
    beforeEach(() => {
      check = (limits, expectedStart, expectedStep) => {
        const props = new AxisProperties();
        props.limits = limits;
        props.generateAutoMajorTicks(10);
        props.generateAutoMinorTicks(10);
        expect(props.majorTicks.start).toBe(expectedStart);
        expect(props.majorTicks.step).toBe(expectedStep);
        expect(props.minorTicks.start).toBe(expectedStart);
        expect(props.minorTicks.step).toBe(expectedStep);
      };
    });
    test('0 to 1', () => {
      check({ min: 0, max: 1 }, 0, 0.1);
    });
    test('-1 to 1', () => {
      check({ min: -1, max: 1 }, -1, 0.2);
    });
    test('-1.01 to 1', () => {
      check({ min: -1, max: 1 }, -1, 0.2);
    });
    test('-0.99 to 1', () => {
      check({ min: -0.99, max: 1 }, -0.9, 0.2);
    });
    test('-0.91 to 1', () => {
      check({ min: -0.91, max: 1 }, -0.9, 0.2);
    });
    test('-0.71 to 1', () => {
      check({ min: -0.71, max: 1 }, -0.7, 0.2);
    });
    test('-0.1 to 1', () => {
      check({ min: -0.1, max: 1 }, -0.1, 0.2);
    });
    test('-0.09 to 1', () => {
      check({ min: -0.09, max: 1 }, 0, 0.1);
    });
  });
  describe('Value to Clip', () => {
    let check;
    beforeEach(() => {
      check = (start, length, limits, value, clip) => {
        const props = new AxisProperties();
        props.limits = limits;
        props.start.x = start;
        props.length = length;
        const calc = props.valueToClip(value);
        expect(calc).toBe(clip);
      };
    });
    test('Value and Clip align', () => {
      check(0, 1, { min: 0, max: 1 }, 0, 0);
      check(0, 1, { min: 0, max: 1 }, 0.5, 0.5);
      check(0, 1, { min: 0, max: 1 }, 1, 1);
    });
    test('Value and Clip are different', () => {
      check(0, 2, { min: 0, max: 1 }, 0, 0);
      check(0, 2, { min: 0, max: 1 }, 0.5, 1);
      check(0, 2, { min: 0, max: 1 }, 1, 2);
    });
    test('Negative clip space', () => {
      check(-1, 2, { min: 0, max: 1 }, 0, -1);
      check(-1, 2, { min: 0, max: 1 }, 0.5, 0);
      check(-1, 2, { min: 0, max: 1 }, 1, 1);
    });
    test('Negative axis space', () => {
      check(0, 2, { min: -1, max: 1 }, -1, 0);
      check(0, 2, { min: -1, max: 1 }, 0, 1);
      check(0, 2, { min: -1, max: 1 }, 1, 2);
    });
    test('Combinations', () => {
      check(-2, 4, { min: -1, max: 1 }, -1, -2);
      check(1, 2, { min: -1, max: 1 }, -1, 1);
      check(1, 2, { min: -1, max: 1 }, 0, 2);
      check(1, 2, { min: -1, max: 1 }, 1, 3);
    });
  });
  describe('Labels', () => {
    let check;
    beforeEach(() => {
      check = (limits, start, step, labels) => {
        const props = new AxisProperties();
        props.limits = limits;
        props.majorTicks.start = start;
        props.majorTicks.step = step;
        props.minorTicks.start = start;
        props.minorTicks.step = step;
        expect(props.getMajorLabels()).toEqual(labels);
        props.generateMajorLabels();
        props.generateMinorLabels();
        expect(props.majorTicks.labels).toEqual(labels);
        expect(props.minorTicks.labels).toEqual(labels);
      };
    });
    test('Simple', () => {
      check({ min: 0, max: 1 }, 0, 0.5, ['0', '0.5', '1']);
    });
    test('Negative', () => {
      check({ min: -1, max: 1 }, -1, 0.5, ['-1', '-0.5', '0', '0.5', '1']);
    });
  });
});
