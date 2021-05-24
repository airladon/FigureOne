import * as morph from './morph';
import getImageData from './getImageData';
import { round } from './math';

import 'regenerator-runtime/runtime';
// import { round } from './math';
jest.mock('./getImageData');

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

const black = round([0, 0, 0, 1]);
const red = round([128 / 255, 0, 0, 1]);
const blue = round([0, 0, 253 / 255, 128 / 255]);
const transparent = round([0, 0, 0, 0]);

const fourByFourNorm = fourByFour.map(c => c / 255);

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

// morph.getImageData = () => fourByFour;
describe('Morph', () => {
  describe('getPixels', () => {
    test('No Filter 4x4', () => {
      const {
        max, min, pixels, pixelColors,
      } = morph.getPixels(fourByFour, 4, 4, () => true);
      expect(max).toEqual([3, 3]);
      expect(min).toEqual([0, 0]);
      expect(pixels).toEqual([
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [1, 1], [2, 1], [3, 1],
        [0, 2], [1, 2], [2, 2], [3, 2],
        [0, 3], [1, 3], [2, 3], [3, 3],
      ]);
      expect(round(pixelColors)).toEqual([
        black, black, red, red,
        black, black, red, red,
        blue, blue, transparent, transparent,
        blue, blue, transparent, transparent,
      ]);
    });
    test('Red Filter 2x2', () => {
      const {
        max, min, pixels, pixelColors,
      } = morph.getPixels(fourByFour, 4, 4, c => c[0] >= 127 / 255);
      expect(max).toEqual([3, 1]);
      expect(min).toEqual([2, 0]);
      expect(pixels).toEqual([
        [2, 0], [3, 0],
        [2, 1], [3, 1],
      ]);
      expect(round(pixelColors)).toEqual([
        red, red, red, red,
      ]);
    });
    test('Too Red Filter 2x2', () => {
      const {
        max, min, pixels, pixelColors,
      } = morph.getPixels(fourByFour, 4, 4, c => c[0] >= 0.51);
      expect(max).toEqual([0, 0]);
      expect(min).toEqual([4, 4]);
      expect(pixels).toEqual([]);
      expect(pixelColors).toEqual([]);
    });
    test('Opaque Filter', () => {
      const {
        max, min, pixels, pixelColors,
      } = morph.getPixels(fourByFour, 4, 4, c => c[3] === 1);
      expect(max).toEqual([3, 1]);
      expect(min).toEqual([0, 0]);
      expect(pixels).toEqual([
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [1, 1], [2, 1], [3, 1],
      ]);
      expect(round(pixelColors)).toEqual([
        black, black,
        red, red,
        black, black,
        red, red,
      ]);
    });
    test('Semi Transparent Filter 2x2', () => {
      const {
        max, min, pixels, pixelColors,
      } = morph.getPixels(fourByFour, 4, 4, c => c[3] >= 128 / 255);
      expect(max).toEqual([3, 3]);
      expect(min).toEqual([0, 0]);
      expect(pixels).toEqual([
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [1, 1], [2, 1], [3, 1],
        [0, 2], [1, 2],
        [0, 3], [1, 3],
      ]);
      expect(round(pixelColors)).toEqual([
        black, black,
        red, red,
        black, black,
        red, red,
        blue, blue,
        blue, blue,
      ]);
    });
    test('No Filter 2x4', () => {
      const {
        max, min, pixels, pixelColors,
      } = morph.getPixels(twoByFour, 4, 2, () => true);
      expect(max).toEqual([3, 1]);
      expect(min).toEqual([0, 0]);
      expect(pixels).toEqual([
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [1, 1], [2, 1], [3, 1],
      ]);
      expect(pixelColors).toEqual([
        [0, 0, 0, 1], [0, 0, 0, 1],
        [128 / 255, 0, 0, 1], [128 / 255, 0, 0, 1],
        [0, 0, 253 / 255, 128 / 255], [0, 0, 253 / 255, 128 / 255],
        [0, 0, 0, 0], [0, 0, 0, 0],
      ]);
    });
    test('Red Filter 2x4', () => {
      const {
        max, min, pixels, pixelColors,
      } = morph.getPixels(twoByFour, 4, 2, c => c[0] > 0.5 / 255);
      expect(max).toEqual([3, 0]);
      expect(min).toEqual([2, 0]);
      expect(pixels).toEqual([
        [2, 0], [3, 0],
      ]);
      expect(round(pixelColors)).toEqual([
        red, red,
      ]);
    });
  });
  describe('4x4', () => {
    beforeAll(() => {
      getImageData.mockImplementation(() => fourByFour);
    });
    test('raster, no filter', () => {
      const [points, colors] = morph.getImage({
        image: { width: 4, height: 4 },
        makeVertices: p => p,
        distribution: 'raster',
      });
      const expectedPoints = [
        -0.5, 0.5, -0.25, 0.5, 0, 0.5, 0.25, 0.5,
        -0.5, 0.25, -0.25, 0.25, 0, 0.25, 0.25, 0.25,
        -0.5, 0, -0.25, 0, 0, 0, 0.25, 0,
        -0.5, -0.25, -0.25, -0.25, 0, -0.25, 0.25, -0.25,
      ];
      expect(expectedPoints).toEqual(points);
      expect(colors).toEqual(fourByFourNorm);
    });
    test('random, no filter', () => {
      const [points, colors] = morph.getImage({
        image: { width: 4, height: 4 },
        makeVertices: p => p,
        distribution: 'random',
      });
      const expectedPoints = [
        [-0.5, 0.5], [-0.25, 0.5], [0, 0.5], [0.25, 0.5],
        [-0.5, 0.25], [-0.25, 0.25], [0, 0.25], [0.25, 0.25],
        [-0.5, 0], [-0.25, 0], [0, 0], [0.25, 0],
        [-0.5, -0.25], [-0.25, -0.25], [0, -0.25], [0.25, -0.25],
      ];
      const pointPairs = [];
      for (let i = 0; i < points.length; i += 2) {
        pointPairs.push([points[i], points[i + 1]]);
      }

      const indeces = {};
      for (let i = 0; i < pointPairs.length; i += 1) {
        for (let j = 0; j < expectedPoints.length; j += 1) {
          if (
            pointPairs[i][0] === expectedPoints[j][0]
            && pointPairs[i][1] === expectedPoints[j][1]
          ) {
            indeces[j] = i;
            expect(round(colors[i * 4])).toBe(round(fourByFour[j * 4] / 255));
            expect(round(colors[i * 4 + 1])).toBe(round(fourByFour[j * 4 + 1] / 255));
            expect(round(colors[i * 4 + 2])).toBe(round(fourByFour[j * 4 + 2] / 255));
            expect(round(colors[i * 4 + 3])).toBe(round(fourByFour[j * 4 + 3] / 255));
          }
        }
      }

      expect(Object.keys(indeces)).toHaveLength(expectedPoints.length);
      expect(colors.length).toEqual(fourByFour.length);
    });
    test('raster, maxPoints', () => {
      const [points, colors] = morph.getImage({
        image: { width: 4, height: 4 },
        makeVertices: p => p,
        distribution: 'raster',
        maxPoints: 5,
      });
      const expectedPoints = [
        -0.5, 0.5, -0.25, 0.5, 0, 0.5, 0.25, 0.5,
        -0.5, 0.25,
      ];
      expect(expectedPoints).toEqual(points);
      expect(round(colors)).toEqual(round(fourByFourNorm.slice(0, 5 * 4)));
    });
    test('random, maxPoints', () => {
      const [points, colors] = morph.getImage({
        image: { width: 4, height: 4 },
        makeVertices: p => p,
        distribution: 'random',
        maxPoints: 5,
      });
      const expectedPoints = [
        [-0.5, 0.5], [-0.25, 0.5], [0, 0.5], [0.25, 0.5],
        [-0.5, 0.25], [-0.25, 0.25], [0, 0.25], [0.25, 0.25],
        [-0.5, 0], [-0.25, 0], [0, 0], [0.25, 0],
        [-0.5, -0.25], [-0.25, -0.25], [0, -0.25], [0.25, -0.25],
      ];
      const pointPairs = [];
      for (let i = 0; i < points.length; i += 2) {
        pointPairs.push([points[i], points[i + 1]]);
      }

      const indeces = {};
      for (let i = 0; i < pointPairs.length; i += 1) {
        for (let j = 0; j < expectedPoints.length; j += 1) {
          if (
            pointPairs[i][0] === expectedPoints[j][0]
            && pointPairs[i][1] === expectedPoints[j][1]
          ) {
            indeces[j] = i;
            expect(round(colors[i * 4])).toBe(round(fourByFour[j * 4] / 255));
            expect(round(colors[i * 4 + 1])).toBe(round(fourByFour[j * 4 + 1] / 255));
            expect(round(colors[i * 4 + 2])).toBe(round(fourByFour[j * 4 + 2] / 255));
            expect(round(colors[i * 4 + 3])).toBe(round(fourByFour[j * 4 + 3] / 255));
          }
        }
      }

      expect(Object.keys(indeces)).toHaveLength(5);
      expect(colors.length).toEqual(20);
    });
    test('raster, filter', () => {
      const [points, colors] = morph.getImage({
        image: { width: 4, height: 4 },
        makeVertices: p => p,
        distribution: 'raster',
        filter: c => c[3] < 200 / 255,
      });
      const expectedPoints = [
        -0.5, 0, -0.25, 0, 0, 0, 0.25, 0,
        -0.5, -0.25, -0.25, -0.25, 0, -0.25, 0.25, -0.25,
      ];
      expect(expectedPoints).toEqual(points);
      expect(colors).toEqual(fourByFourNorm.slice(32));
    });
    test('raster, pointSize default', () => {
      const [points, colors] = morph.getImage({
        image: { width: 4, height: 4 },
        distribution: 'raster',
      });
      console.log(points)
      // const expectedPoints = [
      //   -0.5, 0, -0.25, 0, 0, 0, 0.25, 0,
      //   -0.5, -0.25, -0.25, -0.25, 0, -0.25, 0.25, -0.25,
      // ];
      // expect(expectedPoints).toEqual(points);
      // expect(colors).toEqual(fourByFour.slice(32));
    });
  });
});

