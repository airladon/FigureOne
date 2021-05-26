import {
  round, decelerate, easeinout, clipMag, clipValue, randInt, rand,
  randElement, removeRandElement, randElements, easein, easeout,
  sinusoid, roundNum, linear, randSign, rand2D, triangle, range,
} from './math';

describe('Math tools testing', () => {
  test('Round Num default precision', () => {
    expect(roundNum(10.123456)).toBe(10.12346);
  });
  // Rounding a value
  test('Round a value that doesn\'t need rounding', () => {
    expect(round(10.0)).toEqual(10.0);
  });

  test('Round a -0', () => {
    expect(round(-0)).toEqual(0);
  });

  test('Round a value up to nearest whole number', () => {
    expect(round(9.51, 0)).toEqual(10.0);
  });

  test('Round a value at half way mark up to nearest whole number', () => {
    expect(round(9.5, 0)).toEqual(10.0);
  });

  test('Round a value down to nearest whole number', () => {
    expect(round(10.49, 0)).toEqual(10.0);
  });

  // Round an array
  test('Round an array of numbers whole numbers', () => {
    expect(round([0.5, 0.9, 1.2, 2.3], 0)).toEqual([1, 1, 1, 2]);
  });

  test('Round 1 element array', () => {
    expect(round([0.2])).toEqual([0.2]);
  });
  describe('decelerate', () => {
    test('zero case', () => {
      const r = decelerate(1, 0, 1, 1, 0.1);
      expect(r).toEqual({ v: 0, p: 1 });
    });
    test('null cases', () => {
      const r = decelerate(0, 1, null, 1, null);
      expect(r).toEqual({ v: 1, p: 1 });
    });
    test('initial: 0m, 10m/s - dec 1m/s/s for 1s', () => {
      const p1 = 0;           // m
      const v1 = 10;          // m/s
      const time = 1;         // s
      const dec = 1;          // m/s/s
      const zT = 0.1;         // m/s
      const v2 = 9;
      const p2 = 9.5;
      let r = decelerate(p1, v1, dec, time, zT);
      expect(r).toEqual({ v: v2, p: p2 });

      r = decelerate(p1, v1, -dec, time, zT);
      expect(r).toEqual({ v: v2, p: p2 });

      r = decelerate(p1, -v1, -dec, time, zT);
      expect(r).toEqual({ v: -v2, p: -p2 });
    });
    test('initial: 0m, 10m/s - dec 1m/s/s for 2s', () => {
      const p1 = 0;           // m
      const v1 = 10;          // m/s
      const time = 2;         // s
      const dec = 1;          // m/s/s
      const zT = 0.1;         // m/s
      const v2 = 8;
      const p2 = 18;
      const r = decelerate(p1, v1, dec, time, zT);
      expect(r).toEqual({ v: v2, p: p2 });
    });
    test('initial: 0m, 10m/s - dec 1m/s/s for 11s', () => {
      const p1 = 0;           // m
      const v1 = 10;          // m/s
      const time = 11;         // s
      const dec = 1;          // m/s/s
      const zT = 0.0001;         // m/s
      const v2 = 0;
      const p2 = 50;
      const r = decelerate(p1, v1, dec, time, zT);
      expect({ v: round(r.v), p: round(r.p) }).toEqual({ v: v2, p: p2 });
    });
    test('initial: 0m, 10m/s - dec 1m/s/s for two lots of 1s', () => {
      const p1 = 0;           // m
      const v1 = 10;          // m/s
      const time = 1;         // s
      const dec = 1;          // m/s/s
      const zT = 0.1;         // m/s
      const v2 = 9;
      const p2 = 9.5;
      const v3 = 8;
      const p3 = 18;
      let r = decelerate(p1, v1, dec, time, zT);
      expect(r).toEqual({ v: v2, p: p2 });
      r = decelerate(p2, v2, dec, time, zT);
      expect(r).toEqual({ v: v3, p: p3 });
    });
    describe('zero threshold', () => {
      let p1;
      let v1;
      let dec;
      let zT;
      beforeEach(() => {
        p1 = 0;           // m
        v1 = 10;          // m/s
        dec = 1;          // m/s/s
        zT = 5;           // m/s
      });
      test('Within Threshold', () => {
        const r = decelerate(p1, v1, dec, 1, zT);
        expect(r).toEqual({ v: 9, p: 9.5 });
      });
      test('Threshold boundary', () => {
        const r = decelerate(p1, v1, dec, 5, zT);
        expect(r).toEqual({ v: 0, p: 37.5 });
      });
      test('Threshold boundary, negative v', () => {
        const r = decelerate(p1, -v1, dec, 5, zT);
        expect(r).toEqual({ v: 0, p: -37.5 });
      });
      test('Beyond Threshold', () => {
        const r = decelerate(p1, v1, dec, 10, zT);
        expect(r).toEqual({ v: 0, p: 37.5 });
      });
      test('Beyond Threshold, negative threshold', () => {
        const r = decelerate(p1, v1, dec, 10, -zT);
        expect(r).toEqual({ v: 0, p: 37.5 });
      });
      test('Beyond Threshold, negative dec and threshold', () => {
        const r = decelerate(p1, v1, -dec, 10, -zT);
        expect(r).toEqual({ v: 0, p: 37.5 });
      });
      test('Beyond Threshold, negative v, dec and threshold', () => {
        const r = decelerate(p1, -v1, -dec, 10, -zT);
        expect(r).toEqual({ v: 0, p: -37.5 });
      });
    });
  });
  describe('easeinout', () => {
    test('0', () => { expect(easeinout(0)).toBe(0); });
    test('1', () => { expect(easeinout(1)).toBe(1); });
    test('0.5', () => { expect(easeinout(0.5)).toBe(0.5); });
    test('0.25', () => { expect(easeinout(0.25)).toBe(0.1); });
    test('0.75', () => { expect(easeinout(0.75)).toBe(0.9); });
  });
  describe('invert easeinout', () => {
    test('0', () => { expect(round(easeinout(0, true))).toBe(0); });
    test('1', () => { expect(round(easeinout(1, true))).toBe(1); });
    test('0.5', () => { expect(round(easeinout(0.5, true))).toBe(0.5); });
    test('0.25', () => { expect(round(easeinout(0.1, true))).toBe(0.25); });
    test('0.75', () => { expect(round(easeinout(0.9, true))).toBe(0.75); });
  });
  describe('easein', () => {
    test('0', () => { expect(easein(0)).toBe(0); });
    test('1', () => { expect(easein(1)).toBe(1); });
    test('0.5', () => { expect(round(easein(0.5), 2)).toBe(0.2); });
    test('0.25', () => { expect(round(easein(0.25), 2)).toBe(0.04); });
    test('0.75', () => { expect(round(easein(0.75), 2)).toBe(0.53); });
  });
  describe('easein Invert', () => {
    test('1', () => { expect(round(easein(1, true))).toBe(1); });
    test('0', () => { expect(round(easein(0, true))).toBe(0); });
    test('0.5', () => { expect(round(easein(0.2, true), 2)).toBe(0.5); });
    test('0.25', () => { expect(round(easein(0.04, true), 2)).toBe(0.25); });
    test('0.75', () => { expect(round(easein(0.53, true), 2)).toBe(0.75); });
  });
  describe('easeout', () => {
    test('0', () => { expect(easeout(0)).toBe(0); });
    test('1', () => { expect(easeout(1)).toBe(1); });
    test('0.5', () => { expect(round(easeout(0.5), 2)).toBe(0.8); });
    test('0.25', () => { expect(round(easeout(0.25), 2)).toBe(0.47); });
    test('0.75', () => { expect(round(easeout(0.75), 2)).toBe(0.96); });
  });
  describe('easeout Invert', () => {
    test('0', () => { expect(round(easeout(0, true))).toBe(0); });
    test('1', () => { expect(round(easeout(1, true))).toBe(1); });
    test('0.5', () => { expect(round(easeout(0.8, true), 2)).toBe(0.5); });
    test('0.25', () => { expect(round(easeout(0.47, true), 2)).toBe(0.25); });
    test('0.75', () => { expect(round(easeout(0.96, true), 2)).toBe(0.75); });
  });
  describe('triangle', () => {
    test('0 time, 0 mag, 0 frequency, 0 bias, 0 phase', () => {
      expect(triangle(0, 0, 0, 0, 0)).toBe(0);
    });
    test('1 mag, 1 frequency, 0 bias, 0 phase', () => {
      expect(round(triangle(0, 1, 0, 1, 0), 3)).toBe(0);
      expect(round(triangle(0.125, 1, 0, 1, 0), 3)).toBe(0.5);
      expect(round(triangle(0.25, 1, 0, 1, 0), 3)).toBe(1);
      expect(round(triangle(0.375, 1, 0, 1, 0), 3)).toBe(0.5);
      expect(round(triangle(0.5, 1, 0, 1, 0), 3)).toBe(0);
      expect(round(triangle(0.625, 1, 0, 1, 0), 3)).toBe(-0.5);
      expect(round(triangle(0.75, 1, 0, 1, 0), 3)).toBe(-1);
      expect(round(triangle(0.875, 1, 0, 1, 0), 3)).toBe(-0.5);
      expect(round(triangle(1, 1, 0, 1, 0), 3)).toBe(0);
    });
    test('2 mag, 0.5 frequency, 1 bias, Math.PI phase', () => {
      expect(round(triangle(0, 0.5, 1, 2, Math.PI), 3)).toBe(1);
      expect(round(triangle(0.25, 0.5, 1, 2, Math.PI), 3)).toBe(0);
      expect(round(triangle(0.5, 0.5, 1, 2, Math.PI), 3)).toBe(-1);
      expect(round(triangle(0.75, 0.5, 1, 2, Math.PI), 3)).toBe(0);
      expect(round(triangle(1, 0.5, 1, 2, Math.PI), 3)).toBe(1);
      expect(round(triangle(1.25, 0.5, 1, 2, Math.PI), 3)).toBe(2);
      expect(round(triangle(1.5, 0.5, 1, 2, Math.PI), 3)).toBe(3);
      expect(round(triangle(1.75, 0.5, 1, 2, Math.PI), 3)).toBe(2);
      expect(round(triangle(2, 0.5, 1, 2, Math.PI), 3)).toBe(1);
    });
  });
  describe('sinusoid', () => {
    test('0', () => {
      expect(sinusoid(0, 1, 0, 0, 0)).toBe(0);
    });
    test('0.5', () => {
      expect(round(sinusoid(0.5, 2.1, -1, 0.5, -0.2), 2)).toBe(-0.94);
    });
    test('defaults', () => {
      expect(round(sinusoid(), 2)).toBe(0);
    });
  });
  describe('linear', () => {
    test('default', () => {
      expect(linear(0.5)).toBe(0.5);
    });
    test('0.5', () => {
      expect(round(sinusoid(0.5, 2.1, -1, 0.5, -0.2), 2)).toBe(-0.94);
    });
    test('defaults', () => {
      expect(round(sinusoid(), 2)).toBe(0);
    });
  });
  describe('Clip Value', () => {
    test('No clipping', () => {
      expect(clipValue(1, 0.5, 1.5)).toBe(1);
      expect(clipValue(1, -1.5, 1.5)).toBe(1);
      expect(clipValue(0, -1.5, 1.5)).toBe(0);
      expect(clipValue(-1, -1.5, 1.5)).toBe(-1);
      expect(clipValue(-1, -1.5, -0.5)).toBe(-1);
    });
    test('Clipping', () => {
      expect(clipValue(1, 0.5, 0.6)).toBe(0.6);
      expect(clipValue(1, -0.5, 0.6)).toBe(0.6);
      expect(clipValue(-1, 0.5, 1.5)).toBe(0.5);
      expect(clipValue(-1, -0.5, 1.5)).toBe(-0.5);
      expect(clipValue(1, -1, 0)).toBe(0);
      expect(clipValue(-1, 0, 1)).toBe(0);
    });
    test('Null case', () => {
      expect(clipValue(1, null, null)).toBe(1);
    });
  });
  describe('Clip Mag', () => {
    test('No clipping positive', () => {
      expect(clipMag(1, 0.1, 2)).toBe(1);
      expect(clipMag(1, -0.1, -2)).toBe(1);
    });
    test('No clipping negative', () => {
      expect(clipMag(-1, 0.1, 2)).toBe(-1);
      expect(clipMag(-1, -0.1, -2)).toBe(-1);
    });
    test('Max clipping positive', () => {
      expect(clipMag(3, 0.1, 2)).toBe(2);
      expect(clipMag(3, -0.1, -2)).toBe(2);
    });
    test('Max clipping negative', () => {
      expect(clipMag(-3, 0.1, 2)).toBe(-2);
      expect(clipMag(-3, -0.1, -2)).toBe(-2);
    });
    test('Min clipping positive', () => {
      expect(clipMag(0.05, 0.1, 2)).toBe(0);
      expect(clipMag(0.05, -0.1, -2)).toBe(0);
    });
    test('Min clipping negative', () => {
      expect(clipMag(-0.05, 0.1, 2)).toBe(0);
      expect(clipMag(-0.05, -0.1, -2)).toBe(0);
    });

    // Corner cases
    test('On max clipping positive', () => {
      expect(clipMag(2, 0.1, 2)).toBe(2);
      expect(clipMag(2, -0.1, -2)).toBe(2);
    });
    test('On max clipping negative', () => {
      expect(clipMag(-2, 0.1, 2)).toBe(-2);
      expect(clipMag(-2, -0.1, -2)).toBe(-2);
    });
    test('On min clipping positive', () => {
      expect(clipMag(0.1, 0.1, 2)).toBe(0);
      expect(clipMag(0.1, -0.1, -2)).toBe(0);
    });
    test('On min clipping negative', () => {
      expect(clipMag(-0.1, 0.1, 2)).toBe(0);
      expect(clipMag(-0.1, -0.1, -2)).toBe(0);
    });
    test('On zeroT and max is null', () => {
      expect(clipMag(1, null, null)).toBe(1);
    });
  });
  describe('Random Int', () => {
    test('0 to max', () => {
      let expected = true;
      const min = 0;
      const max = 20;
      for (let i = 0; i < 1000; i += 1) {
        const result = randInt(max);
        if (result < min || result > max - 1) {
          expected = false;
        }
      }
      expect(expected).toBe(true);
    });
    test('Range', () => {
      let expected = true;
      const min = 10;
      const max = 20;
      for (let i = 0; i < 1000; i += 1) {
        const result = randInt(min, max);
        if (result < min || result > max - 1) {
          expected = false;
        }
      }
      expect(expected).toBe(true);
    });
    test('Random Sign', () => {
      let gotValidValues = true;
      for (let i = 0; i < 50; i += 1) {
        const result = randSign();
        if (result !== 1 && result !== -1) {
          gotValidValues = false;
        }
      }
      expect(gotValidValues).toBe(true);
    });
    test('Random Int with Sign', () => {
      let gotNegative = false;
      let gotPositive = false;
      let inRange = true;
      let isInt = true;
      for (let i = 0; i < 100; i += 1) {
        const result = randInt(0, 10, true);
        if (result < 0) {
          gotNegative = true;
        }
        if (result > 0) {
          gotPositive = true;
        }
        if (result < -10 || result > 10) {
          inRange = false;
        }
        if (result % 1 !== 0) {
          isInt = false;
        }
      }
      expect(gotNegative).toBe(true);
      expect(gotPositive).toBe(true);
      expect(inRange).toBe(true);
      expect(isInt).toBe(true);
    });
  });
  describe('Random Float', () => {
    test('0 to max', () => {
      let expected = true;
      const min = 0;
      const max = 3.5;
      for (let i = 0; i < 1000; i += 1) {
        const result = rand(max);
        if (result < min || result >= max) {
          expected = false;
        }
      }
      expect(expected).toBe(true);
    });
    test('Range', () => {
      let expected = true;
      const min = 1.2;
      const max = 3.5;
      for (let i = 0; i < 1000; i += 1) {
        const result = rand(min, max);
        if (result < min || result >= max) {
          expected = false;
        }
      }
      expect(expected).toBe(true);
    });
    test('Random Float with Sign', () => {
      let gotNegative = false;
      let gotPositive = false;
      let inRange = true;
      for (let i = 0; i < 100; i += 1) {
        const result = rand(0, 10, true);
        if (result < 0) {
          gotNegative = true;
        }
        if (result > 0) {
          gotPositive = true;
        }
        if (result < -10 || result > 10) {
          inRange = false;
        }
      }
      expect(gotNegative).toBe(true);
      expect(gotPositive).toBe(true);
      expect(inRange).toBe(true);
    });
  });
  describe('Random Element in Array', () => {
    test('Get Element', () => {
      let expected = true;
      const inputArray = [1, 2, 3, 4, 5, 6, 7];
      const min = 1;
      const max = 7;
      for (let i = 0; i < 100; i += 1) {
        const result = randElement(inputArray);
        if (result < min || result > max) {
          expected = false;
        }
      }
      expect(expected).toBe(true);
    });
    test('Range', () => {
      let expected = true;
      const inputArray = [1, 2, 3, 4, 5, 6, 7];
      const len = inputArray.length;
      const min = 1;
      const max = 7;
      for (let i = 0; i < len; i += 1) {
        const result = removeRandElement(inputArray);
        if (result < min || result > max) {
          expected = false;
        }
        if (inputArray.length !== len - 1 - i) {
          expected = false;
        }
        if (inputArray.indexOf(result) !== -1) {
          expected = false;
        }
      }
      expect(expected).toBe(true);
    });
  });
  describe('Random Elements', () => {
    test('Get Element', () => {
      let expected = true;
      const inputArray = [1, 2, 3, 4, 5, 6, 7];
      let max = 1;
      let min = 8;
      for (let i = 0; i < 200; i += 1) {
        const result = randElements(4, inputArray);
        if (result.length !== 4) {
          expected = false;
        }
        if (inputArray.length !== 7) {
          expected = false;
        }
        const check = [];
        for (let j = 0; j < result.length; j += 1) {
          if (check.indexOf(result[j]) !== -1) {
            expected = false;
          }
          check.push(result[j]);
        }
        const resultMax = Math.max(...result);
        const resultMin = Math.min(...result);
        min = resultMin < min ? resultMin : min;
        max = resultMax > max ? resultMax : max;
      }
      if (max !== 7) {
        expected = false;
      }
      if (min !== 1) {
        expected = false;
      }
      expect(expected).toBe(true);
    });
  });
  describe('Random 2D', () => {
    test('Simple', () => {
      let isValidResult = true;
      for (let i = 0; i < 100; i += 1) {
        const result = rand2D(-10, -1, 10, 1);
        if (result.x < -10 || result.x > 10 || result.y < -1 || result.y > 1) {
          isValidResult = false;
        }
      }
      expect(isValidResult).toBe(true);
    });
  });
  describe('Range', () => {
    test('positive', () => {
      const r = range(0, 1, 0.5);
      expect(r).toEqual([0, 0.5, 1]);
    });
    test.only('negative', () => {
      const r = range(1, 0, -0.5);
      expect(r).toEqual([1, 0.5, 0]);
    });
  });
});
