// @flow

import type { TypeColor } from './types';
import { rand, randInt } from './math';
import { joinObjectsWithOptions } from './tools';
import { Point, getPoint } from './g2';
import type { TypeParsablePoint } from './g2';
import type { TypeHAlign, TypeVAlign } from '../figure/Equation/EquationForm';
import getImageData from './getImageData';

const makeShape = (center, r = 0.015) => [
  center[0] - r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] + r / 2,
  center[0] - r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] + r / 2,
  center[0] - r / 2, center[1] + r / 2,
];
const makeColors = (c, num) => {
  const colors = [];
  for (let i = 0; i < num; i += 1) {
    colors.push(...c);
  }
  return colors;
};

function getPixels(
  data: Uint8ClampedArray,
  imageWidth: number,
  imageHeight: number,
  filter: ([number, number, number, number]) => boolean,
) {
  const pixels = [];
  const pixelColors = [];
  const min = [imageWidth, imageHeight];
  const max = [0, 0];
  for (let h = 0; h < imageHeight; h += 1) {
    for (let w = 0; w < imageWidth; w += 1) {
      const pixelIndex = h * imageWidth * 4 + w * 4;
      const pixelColor = [
        data[pixelIndex] / 255,
        data[pixelIndex + 1] / 255,
        data[pixelIndex + 2] / 255,
        data[pixelIndex + 3] / 255,
      ];
      if (filter(pixelColor)) {
        // filter[0] <= pixelColor[0]
        // && filter[1] <= pixelColor[1]
        // && filter[2] <= pixelColor[2]
        // && filter[3] <= pixelColor[3]
      // ) {
        pixels.push([w, h]);
        pixelColors.push(pixelColor);
        min[0] = w < min[0] ? w : min[0];
        min[1] = h < min[1] ? h : min[1];
        max[0] = w > max[0] ? w : max[0];
        max[1] = h > max[1] ? h : max[1];
      }
    }
  }
  return {
    max,  // relative to top left
    min,  // relative to top left
    pixels,
    pixelColors,
  };
}


// function getImageData(image: Image) {
//   const imageWidth = image.width;
//   const imageHeight = image.height;
//   const canvas = document.createElement('canvas');
//   canvas.width = imageWidth;
//   canvas.height = imageHeight;
//   const context = canvas.getContext('2d');
//   context.drawImage(image, 0, 0);
//   return context.getImageData(0, 0, imageWidth, imageHeight).data;
// }


/**
 * @property {Image} [image]
 * @property {number | null} [maxPoints]
 * @property {TypeHAlign} [xAlign]
 * @property {TypeVAlign} [yAlign]
 * @property {'image' | 'filter'} [alignFrom]
 * @property {'raster' | 'random'} [distribution]
 * @property {'none' | Array<number>} [filter]
 * @property {TypeParsablePoint} [offset]
 * @property {number} [dither]
 * @property {number | null} [width]
 * @property {number | null} [height]
 * @property {number} [pointSize]
 * @property {function([number, number], number): Array<number>} [makeVertices]
 * @property {function([number, number, number, number], number): Array<number>} [makeColors]
 */
export type OBJ_GetImage = {
 image: Image,
 maxPoints?: number | null,
 xAlign?: TypeHAlign,
 yAlign?: TypeVAlign,
 alignFrom?: 'image' | 'filter',
 distribution?: 'raster' | 'random',
 filter?: 'none' | Array<number>,
 offset?: TypeParsablePoint,
 dither?: number,
 width?: number | null,
 height?: number | null,
 pointSize?: number,
};

function getImage(options: OBJ_GetImage) {
  const defaultOptions = {
    maxPoints: null,
    xAlign: 'center',
    yAlign: 'middle',
    alignFrom: 'image',
    distribution: 'random',
    filter: () => true,
    offset: [0, 0],
    dither: 0,
    width: null,
    height: null,
    // pointSize: null,
    makeVertices: makeShape.bind(this),
    makeColors: makeColors.bind(this),
  };
  const o = joinObjectsWithOptions({ except: 'image' }, {}, defaultOptions, options);
  const { image } = options;
  const imageHeight = image.height;
  const imageWidth = image.width;
  const { filter } = o;
  // let filter = () => true;
  // if (typeof o.filter === 'function') {
  //   filter = o.filter;
  // }

  const data = getImageData(image);

  const {
    min, max, pixels, pixelColors,
  } = getPixels(data, imageWidth, imageHeight, filter);

  let maxPoints = pixels.length;
  if (o.maxPoints != null) {
    maxPoints = o.maxPoints;
  }

  let pixelsWidth = imageWidth - 1;
  let pixelsHeight = imageHeight - 1;
  let pixelOffset = [0, 0];
  if (o.alignFrom === 'filter') {
    pixelsWidth = max[0] - min[0];
    pixelsHeight = max[1] - min[1];
    pixelOffset = [-min[0], -min[1]];
  }
  console.log(pixelsWidth, pixelsHeight, pixelOffset);

  let { width, height } = o;
  if (o.height == null && o.width == null) {
    height = 1;
    width = height / pixelsHeight * pixelsWidth;
  } else if (o.height != null && o.width == null) {
    width = o.height / pixelsHeight * pixelsWidth;
  } else if (o.width != null && o.height == null) {
    height = o.width / pixelsWidth * pixelsHeight;
  }
  console.log(width, height)

  const pixelWidth = width / pixelsWidth;
  const pixelHeight = height / pixelsHeight;

  const offset = getPoint(o.offset);
  const { xAlign, yAlign } = o;

  // const bounds = this.getBoundingRect(space, border, children, shownOnly);
  // p is Bottom left corner
  const p = new Point(0, 0);
  if (xAlign === 'left') {
    p.x = offset.x;
  } else if (xAlign === 'right') {
    p.x = offset.x - width;
  } else if (xAlign === 'center') {
    p.x = offset.x - width / 2;
  } else if (typeof xAlign === 'number') {
    p.x = offset.x + width * xAlign;
  } else if (xAlign != null && xAlign.slice(-1)[0] === 'o') {
    p.x = offset.x + parseFloat(xAlign);
  }
  if (yAlign === 'top') {
    p.y = offset.y - height;
  } else if (yAlign === 'bottom') {
    p.y = offset.y;
  } else if (yAlign === 'middle') {
    p.y = offset.y - height / 2;
  } else if (typeof yAlign === 'number') {
    p.y = offset.y - height * yAlign;
  } else if (yAlign != null && yAlign.slice(-1)[0] === 'o') {
    p.y = offset.y - parseFloat(yAlign);
  }

  // let pointSizeX = o.pointSize;
  // let pointSizeY = o.pointSize;
  // if (o.pointSize == null) {
  //   pointSizeX = pixelWidth;
  //   pointSizeY = pixelHeight;
  // }
  // p.x += pointSizeX / 2;
  // p.y += pointSizeY / 2;
  const points = [];
  const colors = [];
  const pixelIndeces = Array(pixels.length);
  for (let i = 0; i < pixels.length; i += 1) {
    pixelIndeces[i] = i;
  }
  let indeces = pixelIndeces.slice();
  for (let i = 0; i < maxPoints; i += 1) {
    if (indeces.length === 0) {
      indeces = pixelIndeces.slice();
    }
    let index = indeces[i]; // o.distribution = 'raster'
    if (o.distribution === 'random') {
      const indecesIndex = randInt(0, indeces.length - 1);
      index = indeces[indecesIndex];
      indeces.splice(indecesIndex, 1);
    }
    // console.log(i, index, indeces[i])
    const pixel = pixels[index];
    const color = pixelColors[index];
    const point = [
      p.x + pixel[0] * pixelWidth + pixelOffset[0] * pixelWidth + rand(-o.dither, o.dither),
      p.y + height - pixel[1] * pixelHeight + pixelOffset[1] * pixelHeight + rand(-o.dither, o.dither),
    ];

    const pointVertices = o.makeVertices(point, o.pointSize || pixelWidth);
    const pointColors = o.makeColors(color, pointVertices.length / 2);
    points.push(...pointVertices);
    colors.push(...pointColors);
  }
  return [points, colors];
}

export {
  // getImageData,
  getPixels,
  getImage,
};
