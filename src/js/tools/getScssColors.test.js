import { round } from './math';
import getScssColors from './getScssColors';

describe('Get colors from scss', () => {
  let getColors;
  beforeEach(() => {
    getColors = function getc(color) {
      return getScssColors({ colorRed: color });
    };
  });
  describe('Hex values', () => {
    test('#FF00FF = [1, 0, 1, 1]', () => {
      const cols = getColors('#ff00ff');
      expect(cols.red).toEqual([1, 0, 1, 1]);
      expect(Object.keys(cols)).toHaveLength(1);
    });

    test('#4d78a1 = [77/255, 120/255, 161/255, 1]', () => {
      const result = round(getColors('#4d78a1').red, 5);
      const exp = round([77, 120, 161, 255].map(x => x / 255.0), 5);
      expect(result).toEqual(exp);
    });

    test('#AF0 = [170/255, 255/255, 0/255, 1]', () => {
      const result = round(getColors('#AF0').red, 5);
      const exp = round([170, 255, 0, 255].map(x => x / 255.0), 5);
      expect(result).toEqual(exp);
    });
  });

  describe('RGB values', () => {
    test('Normal rgb', () => {
      const cols = getColors('rgb(255, 0, 255)');
      expect(cols.red).toEqual([1, 0, 1, 1]);
    });

    test('rgb with random spaces', () => {
      const result = round(getColors('rgb( 77,  120 , 161 )').red, 5);
      const exp = round([77, 120, 161, 255].map(x => x / 255.0), 5);
      expect(result).toEqual(exp);
    });

    test('rgb in upper case', () => {
      const cols = getColors('RGB(255, 0, 255)');
      expect(cols.red).toEqual([1, 0, 1, 1]);
    });

    test('rgba', () => {
      const result = round(getColors('rgb( 77,  120 , 161 , 0.1)').red, 5);
      const exp = round([77, 120, 161, 0.1 * 255].map(x => x / 255.0), 5);
      expect(result).toEqual(exp);
    });
  });

  describe('Predefined css colors', () => {
    test('red', () => {
      const cols = getColors('red');
      expect(cols.red).toEqual([1, 0, 0, 1]);
    });

    test('navy', () => {
      const cols = round(getColors('navy').red, 5);
      expect(cols).toEqual([0, 0, 0.50196, 1]);
    });
  });

  // describe('Non color css variable', () => {
  //   test('dimHeight', () => {
  //     cssColors.mockReturnValue({ dimHeight: '34' });
  //     const cols = getColors();
  //     expect(Object.keys(cols)).toHaveLength(0);
  //   });
  // });
});
