import {
  getPixels,
} from './morph';
import 'regenerator-runtime/runtime';
// import { round } from './math';

/**
  Image:
    Bk Bk Re Re
    Bk Bk Re Re
    Bl Bl Tr Tr
    Bl Bl Tr Tr

  In data array read from top left to bottom right:
    Bk Bk Re Re Bk Bk Re Re Bl Bl Tr Tr Bl Bl Tr Tr
 */
const fourByFour = [
  // row 1
  0, 0, 0, 255,     // black
  0, 0, 0, 255,
  128, 0, 0, 255,   // dark red
  128, 0, 0, 255,
  // row 2
  0, 0, 0, 255,
  0, 0, 0, 255,
  128, 0, 0, 255,
  128, 0, 0, 255,
  // row 3
  0, 0, 253, 128,   // blue semi-transparent
  0, 0, 253, 128,
  0, 0, 0, 0,       // black transparent
  0, 0, 0, 0,
  // row 4
  0, 0, 253, 128,
  0, 0, 253, 128,
  0, 0, 0, 0,
  0, 0, 0, 0,
];

const twoByFour = [
  // row 1
  0, 0, 0, 255,     // black
  0, 0, 0, 255,
  128, 0, 0, 255,   // dark red
  128, 0, 0, 255,
  // row 2
  0, 0, 253, 128,   // blue semi-transparent
  0, 0, 253, 128,
  0, 0, 0, 0,       // black transparent
  0, 0, 0, 0,
];

// const sixBySix = [
//   // row 1
//   0, 0, 0, 255,
//   0, 0, 0, 255,
//   0, 0, 0, 255,
//   128, 0, 0, 255,
//   128, 0, 0, 255,
//   128, 0, 0, 255,
//   // row 2
//   0, 0, 0, 255,
//   0, 0, 0, 255,
//   0, 0, 0, 255,
//   128, 0, 0, 255,
//   128, 0, 0, 255,
//   128, 0, 0, 255,
//   // row 3
//   0, 0, 0, 255,
//   0, 0, 0, 255,
//   0, 0, 0, 255,
//   128, 0, 0, 255,
//   128, 0, 0, 255,
//   128, 0, 0, 255,
//   // row 4
//   0, 0, 253, 128,
//   0, 0, 253, 128,
//   0, 0, 253, 128,
//   0, 0, 0, 0,
//   0, 0, 0, 0,
//   0, 0, 0, 0,
//   // row 5
//   0, 0, 253, 128,
//   0, 0, 253, 128,
//   0, 0, 253, 128,
//   0, 0, 0, 0,
//   0, 0, 0, 0,
//   0, 0, 0, 0,
//   // row 6
//   0, 0, 253, 128,
//   0, 0, 253, 128,
//   0, 0, 253, 128,
//   0, 0, 0, 0,
//   0, 0, 0, 0,
//   0, 0, 0, 0,
// ];

describe('Morph', () => {
  describe('getPixels', () => {
    test('No Filter 4x4', () => {
      const {
        max, min, pixels, pixelColors,
      } = getPixels(fourByFour, 4, 4, [0, 0, 0, 0]);
      expect(max).toEqual([3, 3]);
      expect(min).toEqual([0, 0]);
      expect(pixels).toEqual([
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [1, 1], [2, 1], [3, 1],
        [0, 2], [1, 2], [2, 2], [3, 2],
        [0, 3], [1, 3], [2, 3], [3, 3],
      ]);
      expect(pixelColors).toEqual([
        [0, 0, 0, 255], [0, 0, 0, 255],
        [128, 0, 0, 255], [128, 0, 0, 255],
        [0, 0, 0, 255], [0, 0, 0, 255],
        [128, 0, 0, 255], [128, 0, 0, 255],
        [0, 0, 253, 128], [0, 0, 253, 128],
        [0, 0, 0, 0], [0, 0, 0, 0],
        [0, 0, 253, 128], [0, 0, 253, 128],
        [0, 0, 0, 0], [0, 0, 0, 0],
      ]);
    });
    test('Red Filter 2x2', () => {
      const {
        max, min, pixels, pixelColors,
      } = getPixels(fourByFour, 4, 4, [128, 0, 0, 0]);
      expect(max).toEqual([3, 1]);
      expect(min).toEqual([2, 0]);
      expect(pixels).toEqual([
        [2, 0], [3, 0],
        [2, 1], [3, 1],
      ]);
      expect(pixelColors).toEqual([
        [128, 0, 0, 255], [128, 0, 0, 255],
        [128, 0, 0, 255], [128, 0, 0, 255],
      ]);
    });
    test('Too Red Filter 2x2', () => {
      const {
        max, min, pixels, pixelColors,
      } = getPixels(fourByFour, 4, 4, [129, 0, 0, 0]);
      expect(max).toEqual([0, 0]);
      expect(min).toEqual([4, 4]);
      expect(pixels).toEqual([]);
      expect(pixelColors).toEqual([]);
    });
    test('Opaque Filter', () => {
      const {
        max, min, pixels, pixelColors,
      } = getPixels(fourByFour, 4, 4, [0, 0, 0, 255]);
      expect(max).toEqual([3, 1]);
      expect(min).toEqual([0, 0]);
      expect(pixels).toEqual([
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [1, 1], [2, 1], [3, 1],
      ]);
      expect(pixelColors).toEqual([
        [0, 0, 0, 255], [0, 0, 0, 255],
        [128, 0, 0, 255], [128, 0, 0, 255],
        [0, 0, 0, 255], [0, 0, 0, 255],
        [128, 0, 0, 255], [128, 0, 0, 255],
      ]);
    });
    test('Semi Transparent Filter 2x2', () => {
      const {
        max, min, pixels, pixelColors,
      } = getPixels(fourByFour, 4, 4, [0, 0, 0, 1]);
      expect(max).toEqual([3, 3]);
      expect(min).toEqual([0, 0]);
      expect(pixels).toEqual([
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [1, 1], [2, 1], [3, 1],
        [0, 2], [1, 2],
        [0, 3], [1, 3],
      ]);
      expect(pixelColors).toEqual([
        [0, 0, 0, 255], [0, 0, 0, 255],
        [128, 0, 0, 255], [128, 0, 0, 255],
        [0, 0, 0, 255], [0, 0, 0, 255],
        [128, 0, 0, 255], [128, 0, 0, 255],
        [0, 0, 253, 128], [0, 0, 253, 128],
        [0, 0, 253, 128], [0, 0, 253, 128],
      ]);
    });
    test('No Filter 2x4', () => {
      const {
        max, min, pixels, pixelColors,
      } = getPixels(twoByFour, 4, 2, [0, 0, 0, 0]);
      expect(max).toEqual([3, 1]);
      expect(min).toEqual([0, 0]);
      expect(pixels).toEqual([
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [1, 1], [2, 1], [3, 1],
      ]);
      expect(pixelColors).toEqual([
        [0, 0, 0, 255], [0, 0, 0, 255],
        [128, 0, 0, 255], [128, 0, 0, 255],
        [0, 0, 253, 128], [0, 0, 253, 128],
        [0, 0, 0, 0], [0, 0, 0, 0],
      ]);
    });
    test('Red Filter 2x4', () => {
      const {
        max, min, pixels, pixelColors,
      } = getPixels(twoByFour, 4, 2, [1, 0, 0, 0]);
      expect(max).toEqual([3, 0]);
      expect(min).toEqual([2, 0]);
      expect(pixels).toEqual([
        [2, 0], [3, 0],
      ]);
      expect(pixelColors).toEqual([
        [128, 0, 0, 255], [128, 0, 0, 255],
      ]);
    });
  });
});

