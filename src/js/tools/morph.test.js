/* eslint-disable jest/no-conditional-expect */
import * as morph from './morph';
import getImageData from './getImageData';
import { round } from './math';

import 'regenerator-runtime/runtime';
// import { round } from './math';
jest.mock('./getImageData');

/*
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

const offset = (points, offsetBy) => {
  const offsetPoints = [];
  for (let i = 0; i < points.length; i += 2) {
    offsetPoints.push(round(points[i] + offsetBy[0]));
    offsetPoints.push(round(points[i + 1] + offsetBy[1]));
  }
  return offsetPoints;
};

// morph.imageToShapesData = () => fourByFour;
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
      const [points, colors] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        shape: p => [p.x, p.y],
        distribution: 'raster',
        width: 1,
      });
      const expectedPoints = [
        -0.5, 0.5, -0.17, 0.5, 0.17, 0.5, 0.5, 0.5,
        -0.5, 0.17, -0.17, 0.17, 0.17, 0.17, 0.5, 0.17,
        -0.5, -0.17, -0.17, -0.17, 0.17, -0.17, 0.5, -0.17,
        -0.5, -0.5, -0.17, -0.5, 0.17, -0.5, 0.5, -0.5,
      ];
      expect(expectedPoints).toEqual(round(points, 2));
      expect(colors).toEqual(fourByFourNorm);
    });
    test('random, no filter', () => {
      const [points, colors] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        shape: p => [p.x, p.y],
        distribution: 'random',
      });
      const expectedPoints = [
        [-0.5, 0.5], [-0.17, 0.5], [0.17, 0.5], [0.5, 0.5],
        [-0.5, 0.17], [-0.17, 0.17], [0.17, 0.17], [0.5, 0.17],
        [-0.5, -0.17], [-0.17, -0.17], [0.17, -0.17], [0.5, -0.17],
        [-0.5, -0.5], [-0.17, -0.5], [0.17, -0.5], [0.5, -0.5],
      ];
      const pointPairs = [];
      for (let i = 0; i < points.length; i += 2) {
        pointPairs.push([points[i], points[i + 1]]);
      }

      const indeces = {};
      for (let i = 0; i < pointPairs.length; i += 1) {
        for (let j = 0; j < expectedPoints.length; j += 1) {
          if (
            round(pointPairs[i][0], 2) === expectedPoints[j][0]
            && round(pointPairs[i][1], 2) === expectedPoints[j][1]
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
    test('raster, num', () => {
      const [points, colors] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        shape: p => [p.x, p.y],
        distribution: 'raster',
        num: 5,
        // size: 0,
      });
      const expectedPoints = [
        -0.5, 0.5, -0.17, 0.5, 0.17, 0.5, 0.5, 0.5,
        -0.5, 0.17,
      ];
      expect(expectedPoints).toEqual(round(points, 2));
      expect(round(colors)).toEqual(round(fourByFourNorm.slice(0, 5 * 4)));
    });
    test('random, num', () => {
      const [points, colors] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        shape: p => [p.x, p.y],
        distribution: 'random',
        num: 5,
        // size: 0,
      });
      const expectedPoints = [
        [-0.5, 0.5], [-0.17, 0.5], [0.17, 0.5], [0.5, 0.5],
        [-0.5, 0.17], [-0.17, 0.17], [0.17, 0.17], [0.5, 0.17],
        [-0.5, -0.17], [-0.17, -0.17], [0.17, -0.17], [0.5, -0.17],
        [-0.5, -0.5], [-0.17, -0.5], [0.17, -0.5], [0.5, -0.5],
      ];
      const pointPairs = [];
      for (let i = 0; i < points.length; i += 2) {
        pointPairs.push([points[i], points[i + 1]]);
      }

      const indeces = {};
      for (let i = 0; i < pointPairs.length; i += 1) {
        for (let j = 0; j < expectedPoints.length; j += 1) {
          if (
            round(pointPairs[i][0], 2) === expectedPoints[j][0]
            && round(pointPairs[i][1], 2) === expectedPoints[j][1]
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
      const [points, colors] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        shape: p => [p.x, p.y],
        distribution: 'raster',
        filter: c => c[3] < 200 / 255,
        width: 1,
      });
      const expectedPoints = [
        -0.5, -0.17, -0.17, -0.17, 0.17, -0.17, 0.5, -0.17,
        -0.5, -0.5, -0.17, -0.5, 0.17, -0.5, 0.5, -0.5,
      ];
      expect(expectedPoints).toEqual(round(points, 2));
      expect(colors).toEqual(fourByFourNorm.slice(32));
    });
    test('raster, pointSize default', () => {
      const [points] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1.2,
      });
      // image is 4 x 4 pixels
      // image will be drawn to figure width/height of 1.2 / 1.2
      // from center of pixels
      // Therefore each pixel will have a 0.4 side length
      // with centers at -0.6, -0.2, 0.2, 0.6
      // and boundaries at -0.8, -0.4, 0, 0.4, 0.8
      //
      // NB: pixels are drawn as:
      //     6 ---- 3,5
      //     |    /  |
      //     |  /    |
      //    1,4 ---- 2
      //
      // And the order of pixels is from top left to bottom right
      expect(round(points.slice(0, 12))).toEqual([
        -0.8, 0.4, -0.4, 0.4, -0.4, 0.8,
        -0.8, 0.4, -0.4, 0.8, -0.8, 0.8,
      ]);
      expect(round(points.slice(180, 192))).toEqual([
        0.4, -0.8, 0.8, -0.8, 0.8, -0.4,
        0.4, -0.8, 0.8, -0.4, 0.4, -0.4,
      ]);
    });
    test('raster, pointSize smaller', () => {
      const [points] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1.2,
        size: 0.2,
      });
      expect(round(points.slice(0, 12))).toEqual([
        -0.7, 0.5, -0.5, 0.5, -0.5, 0.7,
        -0.7, 0.5, -0.5, 0.7, -0.7, 0.7,
      ]);
      expect(round(points.slice(180, 192))).toEqual([
        0.5, -0.7, 0.7, -0.7, 0.7, -0.5,
        0.5, -0.7, 0.7, -0.5, 0.5, -0.5,
      ]);
    });
    test('raster, pointSize larger', () => {
      const [points] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1.2,
        size: 0.6,
      });
      expect(round(points.slice(0, 12))).toEqual([
        -0.9, 0.3, -0.3, 0.3, -0.3, 0.9,
        -0.9, 0.3, -0.3, 0.9, -0.9, 0.9,
      ]);
      expect(round(points.slice(180, 192))).toEqual([
        0.3, -0.9, 0.9, -0.9, 0.9, -0.3,
        0.3, -0.9, 0.9, -0.3, 0.3, -0.3,
      ]);
    });
    test('raster, center at [0.5, 0.1]', () => {
      const [points] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1.2,
        position: [0.5, 0.1],
      });
      expect(round(points.slice(0, 12))).toEqual(offset([
        -0.8, 0.4, -0.4, 0.4, -0.4, 0.8,
        -0.8, 0.4, -0.4, 0.8, -0.8, 0.8,
      ], [0.5, 0.1]));
      expect(round(points.slice(180, 192))).toEqual(offset([
        0.4, -0.8, 0.8, -0.8, 0.8, -0.4,
        0.4, -0.8, 0.8, -0.4, 0.4, -0.4,
      ], [0.5, 0.1]));
    });
    test('raster, left, bottom', () => {
      const [points] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1.2,
        xAlign: 'left',
        yAlign: 'bottom',
      });
      expect(round(points.slice(0, 12))).toEqual(offset([
        -0.8, 0.4, -0.4, 0.4, -0.4, 0.8,
        -0.8, 0.4, -0.4, 0.8, -0.8, 0.8,
      ], [0.6, 0.6]));
      expect(round(points.slice(180, 192))).toEqual(offset([
        0.4, -0.8, 0.8, -0.8, 0.8, -0.4,
        0.4, -0.8, 0.8, -0.4, 0.4, -0.4,
      ], [0.6, 0.6]));
    });
    test('raster, top, right', () => {
      const [points] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1.2,
        xAlign: 'right',
        yAlign: 'top',
      });
      expect(round(points.slice(0, 12))).toEqual(offset([
        -0.8, 0.4, -0.4, 0.4, -0.4, 0.8,
        -0.8, 0.4, -0.4, 0.8, -0.8, 0.8,
      ], [-0.6, -0.6]));
      expect(round(points.slice(180, 192))).toEqual(offset([
        0.4, -0.8, 0.8, -0.8, 0.8, -0.4,
        0.4, -0.8, 0.8, -0.4, 0.4, -0.4,
      ], [-0.6, -0.6]));
    });
    test('raster, align to filter', () => {
      const [points] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1,
        xAlign: 'center',
        yAlign: 'middle',
        align: 'filteredImage',
        filter: c => c[0] > 0.4,
      });
      // red part of image is 2 x 2 pixels
      // image will be drawn to figure width/height of 1 / 1
      // from center of pixels
      // Therefore each pixel will have a 1.0 side length
      // with centers at -0.5, 0.5
      // and boundaries at -1, 0, 1
      //
      expect(round(points.slice(0, 12))).toEqual(offset([
        -1, 0, 0, 0, 0, 1,
        -1, 0, 0, 1, -1, 1,
      ], [0, 0]));
      expect(round(points.slice(36, 48))).toEqual(offset([
        0, -1, 1, -1, 1, 0,
        0, -1, 1, 0, 0, 0,
      ], [0, 0]));
    });
    test('raster, align to filter 2', () => {
      const [points] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1.2,
        xAlign: 'center',
        yAlign: 'middle',
        align: 'filteredImage',
      });
      expect(round(points.slice(0, 12))).toEqual([
        -0.8, 0.4, -0.4, 0.4, -0.4, 0.8,
        -0.8, 0.4, -0.4, 0.8, -0.8, 0.8,
      ]);
      expect(round(points.slice(180, 192))).toEqual([
        0.4, -0.8, 0.8, -0.8, 0.8, -0.4,
        0.4, -0.8, 0.8, -0.4, 0.4, -0.4,
      ]);
    });
    test('raster, align to filter 3', () => {
      const [points] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1,
        xAlign: 'center',
        yAlign: 'middle',
        align: 'filteredImage',
        filter: c => c[3] < 0.1,
      });
      // transparent part of image is 2 x 2 pixels
      // image will be drawn to figure width/height of 1 / 1
      // from center of pixels
      // Therefore each pixel will have a 1.0 side length
      // with centers at -0.5, 0.5
      // and boundaries at -1, 0, 1
      //
      expect(round(points.slice(0, 12))).toEqual(offset([
        -1, 0, 0, 0, 0, 1,
        -1, 0, 0, 1, -1, 1,
      ], [0, 0]));
      expect(round(points.slice(36, 48))).toEqual(offset([
        0, -1, 1, -1, 1, 0,
        0, -1, 1, 0, 0, 0,
      ], [0, 0]));
    });
    test('excessPoints, raster, repeat', () => {
      const [points, colors] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1,
        excess: 'repeat',
        num: 16 * 2,
        shape: p => [p.x, p.y],
      });
      const expectedPoints = [
        -0.5, 0.5, -0.17, 0.5, 0.17, 0.5, 0.5, 0.5,
        -0.5, 0.17, -0.17, 0.17, 0.17, 0.17, 0.5, 0.17,
        -0.5, -0.17, -0.17, -0.17, 0.17, -0.17, 0.5, -0.17,
        -0.5, -0.5, -0.17, -0.5, 0.17, -0.5, 0.5, -0.5,
        -0.5, 0.5, -0.17, 0.5, 0.17, 0.5, 0.5, 0.5,
        -0.5, 0.17, -0.17, 0.17, 0.17, 0.17, 0.5, 0.17,
        -0.5, -0.17, -0.17, -0.17, 0.17, -0.17, 0.5, -0.17,
        -0.5, -0.5, -0.17, -0.5, 0.17, -0.5, 0.5, -0.5,
      ];
      expect(expectedPoints).toEqual(round(points, 2));
      expect(colors).toEqual([...fourByFourNorm, ...fourByFourNorm]);
    });
    test('excessPoints, raster, repeatOpaqueOnly', () => {
      const [points, colors] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1,
        excess: 'repeatOpaqueOnly',
        num: 16 * 2,
        shape: p => [p.x, p.y],
      });
      const expectedPoints = [
        -0.5, 0.5, -0.17, 0.5, 0.17, 0.5, 0.5, 0.5,
        -0.5, 0.17, -0.17, 0.17, 0.17, 0.17, 0.5, 0.17,
        -0.5, -0.17, -0.17, -0.17, 0.17, -0.17, 0.5, -0.17,
        -0.5, -0.5, -0.17, -0.5, 0.17, -0.5, 0.5, -0.5,
        //
        -0.5, 0.5, -0.17, 0.5, 0.17, 0.5, 0.5, 0.5,
        -0.5, 0.17, -0.17, 0.17, 0.17, 0.17, 0.5, 0.17,
        -0.5, 0.5, -0.17, 0.5, 0.17, 0.5, 0.5, 0.5,
        -0.5, 0.17, -0.17, 0.17, 0.17, 0.17, 0.5, 0.17,
      ];
      expect(expectedPoints).toEqual(round(points, 2));
      expect(colors).toEqual([
        ...fourByFourNorm,
        ...fourByFourNorm.slice(0, 32),
        ...fourByFourNorm.slice(0, 32),
      ]);
    });
    test('excessPoints, raster, lastOpaque', () => {
      const [points, colors] = morph.imageToShapes({
        image: { width: 4, height: 4 },
        distribution: 'raster',
        width: 1,
        excess: 'lastOpaque',
        num: 16 * 2,
        shape: p => [p.x, p.y],
      });
      const expectedPoints = [
        -0.5, 0.5, -0.17, 0.5, 0.17, 0.5, 0.5, 0.5,
        -0.5, 0.17, -0.17, 0.17, 0.17, 0.17, 0.5, 0.17,
        -0.5, -0.17, -0.17, -0.17, 0.17, -0.17, 0.5, -0.17,
        -0.5, -0.5, -0.17, -0.5, 0.17, -0.5, 0.5, -0.5,
        //
        0.5, 0.17, 0.5, 0.17, 0.5, 0.17, 0.5, 0.17,
        0.5, 0.17, 0.5, 0.17, 0.5, 0.17, 0.5, 0.17,
        0.5, 0.17, 0.5, 0.17, 0.5, 0.17, 0.5, 0.17,
        0.5, 0.17, 0.5, 0.17, 0.5, 0.17, 0.5, 0.17,
      ];
      expect(expectedPoints).toEqual(round(points, 2));
      const fillRed = [];
      for (let i = 0; i < 16; i += 1) {
        fillRed.push(...red);
      }
      expect(round(colors)).toEqual(round([
        ...fourByFourNorm,
        ...fillRed,
      ]));
    });
  });
  describe('lineToPoints', () => {
    test('simple', () => {
      const points = [[0, 0], [1, 0]];
      const [out] = morph.polylineToShapes({
        points, num: 3, shape: p => [p.x, p.y],
      });
      expect(out).toEqual([0, 0, 0.5, 0, 1, 0]);
    });
  });
});

