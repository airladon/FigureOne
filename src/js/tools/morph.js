// @flow

import type { TypeColor } from './types';
import { rand, randInt } from './math';
import { joinObjectsWithOptions, joinObjects } from './tools';
import { Point, getPoint } from './g2';
import type { TypeParsablePoint } from './g2';
import type { TypeHAlign, TypeVAlign } from '../figure/Equation/EquationForm';
import getImageData from './getImageData';

const makeSquare = (center, r = 0.015) => [
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
  filter: (TypeColor, [number, number]) => boolean,
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
      if (filter(pixelColor, [w, h])) {
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


/**
 * @property {Image} [image]
 * @property {number | null} [maxPoints] maximum number of points to return -
 * `null` defaults to the number of pixels (or filtered pixels if a filter is
 * used) (`null`)
 * @property {'repeatOpaqueOnly' | 'lastOpaque' | 'repeat'} [excessPoints] if
 * maxPoints is greater than the number of pixels, then either `'repeat'` the
 * points from the pixels, repeat only the opaque pixels `'repeatOpaqueOnly'`
 * or put all execess points on the `'lastOpaque'` pixel. Note, repeating
 * pixels that are semitransparent will effectively put multiple pixels on top
 * of each other, reducing the transparency of the pixel (`'repeatOpaqueOnly'`).
 * @property {function(TypeColor, [number, number]) => boolean} [filter]
 * filter function with pixel color and pixel position input parameters. Return
 * `true` to keep pixel. Pixel position is (0, 0) in top left corner
 * (`() => true`)
 * @property {'raster' | 'random'} [distribution] Returned points are randomly
 * distributed throughout shape (`'random'`) or rasterized in order from top
 * left to bottom right of image (or filtered image) (`random`)
 * @property {number | null} [width] width to map image pixels to. Width is
 * between center of most left to most right pixels
 * @property {number | null} [height] height to map image pixels to. Height is
 * between center of most bottom to most top pixels
 * @property {number} [pointSize] point size to map pixel to. Final points will
 * have a width of `width + pointSize` center of points are used to determine
 * `width` and `height`.
 * @property {TypeParsablePoint} [position] position to place points at
 * @property {TypeHAlign} [xAlign] align points horizontally around `position`
 * @property {TypeVAlign} [yAlign] align points vertically around `position`
 * @property {'image' | 'filteredImage'} [align] `image` will align the points
 * relative to all image pixels (even if some have been filtered out).
 * `filteredImage` will align the points to just the ones that were not
 * filtered out
 * @property {number} [dither] Add a random offset to each point to create a
 * dither effect
 * @property {function([number, number], number): Array<number>} [makePoints]
 * use this function to customize point creation. By default a square of two
 * triangles is created (six vertices). The function takes as input the [x, y]
 * position of the center point and `pointSize` and outputs an array of vertices
 * of triangles with x and y coordinates interlaced. For example:
 * [x1, y1, x2, y2, x3, y3, ....]
 * @property {function(TypeColor, number): Array<number>} [makeColors]
 * use this function to customze color mapping. The function takes as input the
 * pixel's color, and the number of vertices that need to be colored. It
 * outputs an array of colors for each vertex. For example:
 * [r1, b1, g1, a1, r2, g2, b, a2, ...]
 */
export type OBJ_ImageToPoints = {
 image: Image,
 maxPoints?: number | null,
 xAlign?: TypeHAlign,
 yAlign?: TypeVAlign,
 align?: 'image' | 'filteredImage',
 distribution?: 'raster' | 'random',
 filter?: 'none' | Array<number>,
 position?: TypeParsablePoint,
 dither?: number,
 width?: number | null,
 height?: number | null,
 pointSize?: number,
 excessPoints?: 'repeatOpaqueOnly' | 'lastOpaque' | 'repeat',
 makeColors?: (TypeColor, number) => Array<number>,
 makePoints?: ([number, number], number) => Array<number>,
};

/**
 * `getImage` maps the pixels of an image to points of a shape that will be
 * used to draw that pixel.
 *
 * All pixels in an image can be returned, or a `filter` function can be used
 * to only return desired pixels.
 *
 * The return points can be rasterized in order (raster from top left to bottom
 * right) or in a random order.
 *
 * The final points are mapped to a defined width and height, and aligned to a
 * position relative to either all pixels in the original image, or just the
 * filtered pixels.
 *
 * This method is useful for including images in morphing effects. It should
 * not be used to simply show an image (use a texture with some
 * FigureElementPrimitive for this).
 */
function imageToPoints(options: OBJ_ImageToPoints) {
  const defaultOptions = {
    maxPoints: null,
    xAlign: 'center',
    yAlign: 'middle',
    align: 'image',
    distribution: 'random',
    filter: () => true,
    position: [0, 0],
    dither: 0,
    width: null,
    height: null,
    excessPoints: 'repeatOpaqueOnly',
    makePoints: makeSquare.bind(this),
    makeColors: makeColors.bind(this),
  };
  const o = joinObjectsWithOptions({ except: 'image' }, {}, defaultOptions, options);
  const { image } = options;
  const imageHeight = image.height;
  const imageWidth = image.width;
  const { filter } = o;

  // Get array of pixel colors from top left to bottom right
  const data = getImageData(image);

  // Get the final pixels to use, as well as the max and min pixel
  // coordinates of the final pixels (useful when a filter has been applied)
  const {
    min, max, pixels, pixelColors,
  } = getPixels(data, imageWidth, imageHeight, filter);

  // By default, the maxPoints value is the number of pixels
  let maxPoints = pixels.length;
  if (o.maxPoints != null) {
    maxPoints = o.maxPoints;
  }

  // The pixel centers will be mapped to point centers.
  // The `width` and `height` of the final points is the dimension between point
  // centers.
  // Therefore, the number of pixels wide and high is the number of pixels
  // between pixel centers. Therefore, two half pixels will overhand the centers
  // and the total pixelWidth and pixelHeight will be the `imageWidth - 1` and
  // `imageHeight - 1`
  let pixelsWidth = imageWidth - 1;
  let pixelsHeight = imageHeight - 1;
  let pixelOffset = [0, 0];
  if (o.align === 'filteredImage') {
    pixelsWidth = max[0] - min[0];
    pixelsHeight = max[1] - min[1];
    pixelOffset = [-min[0], min[1]];
  }

  // If width and height are not defined, then calculate them based on the
  // aspect ratio of the original image (or filted pixels if a filter is used)
  let { width, height } = o;
  if (o.height == null && o.width == null) {
    height = 1;
    width = height / pixelsHeight * pixelsWidth;
  } else if (o.height != null && o.width == null) {
    width = o.height / pixelsHeight * pixelsWidth;
  } else if (o.width != null && o.height == null) {
    height = o.width / pixelsWidth * pixelsHeight;
  }

  // Width and height (in points space) of a pixel.
  const pixelWidth = width / pixelsWidth;
  const pixelHeight = height / pixelsHeight;

  // Reference position to align points to
  const position = getPoint(o.position);

  // Align points relative to reference position where p is bottom left corner
  // of the points
  const { xAlign, yAlign } = o;
  const p = new Point(0, 0);
  if (xAlign === 'left') {
    p.x = position.x;
  } else if (xAlign === 'right') {
    p.x = position.x - width;
  } else if (xAlign === 'center') {
    p.x = position.x - width / 2;
  } else if (typeof xAlign === 'number') {
    p.x = position.x + width * xAlign;
  } else if (xAlign != null && xAlign.slice(-1)[0] === 'o') {
    p.x = position.x + parseFloat(xAlign);
  }
  if (yAlign === 'top') {
    p.y = position.y - height;
  } else if (yAlign === 'bottom') {
    p.y = position.y;
  } else if (yAlign === 'middle') {
    p.y = position.y - height / 2;
  } else if (typeof yAlign === 'number') {
    p.y = position.y - height * yAlign;
  } else if (yAlign != null && yAlign.slice(-1)[0] === 'o') {
    p.y = position.y - parseFloat(yAlign);
  }

  // Final points and colors
  const points = [];
  const colors = [];

  // The final points will be taken from `pixels`. If
  // `distribution` === 'raster' then the final points will be in the same
  // order as `pixels`, as they were scanned in from top left to bottom right.
  // If `distribution` === 'random', then the final points will be `pixels` in a
  // randomly selected order.
  // If maxPoints is less than the number of pixels, then 'raster' will show
  // just the top portion of the image, and 'random' will show points sparesly
  // distributed throughout the image.
  // If maxPoints is greater than the number of pixels, then 'raster' will
  // output all the pixels and points, and then repeat from the top left again.
  // 'random' will randomly ouput all pixels as points, and then repeat pixels
  // overlaying them again randomly. Note, if pixels are semi-transparent, then
  // multiple pixels on top of each other will change the overall transparency.
  // Create an array of indeces pointing to each pixel
  const pixelIndeces = Array(pixels.length);
  const opaquePixelIndeces = [];
  for (let i = 0; i < pixels.length; i += 1) {
    pixelIndeces[i] = i;
    if (pixelColors[i][3] >= 0.99999999) {
      opaquePixelIndeces.push(i);
    }
  }
  let indeces = pixelIndeces.slice();

  // Create an array of dithering offsets. This array is needed so if there are
  // excess pixels, the overlapping pixels have the same dither.
  const dithering = Array(indeces.length);
  for (let i = 0; i < dithering.length; i += 1) {
    dithering[i] = [rand(-o.dither, o.dither), rand(-o.dither, o.dither)];
  }

  // Create the final points and colors
  for (let i = 0; i < maxPoints; i += 1) {
    // If the indeces have been depleted, then get new ones based on the
    // `excessPoints` option
    if (indeces.length === 0) {
      if (o.excessPoints === 'lastOpaque') {
        indeces = Array(maxPoints - i).fill(opaquePixelIndeces.slice(-1)[0]);
      } else if (o.excessPoints === 'repeatOpaqueOnly') {
        indeces = opaquePixelIndeces.slice();
      } else {
        indeces = pixelIndeces.slice();
      }
    }

    // Get the pixel index to create the point with
    let index = indeces[0];
    if (o.distribution === 'random') {
      const indecesIndex = randInt(0, indeces.length - 1);
      index = indeces[indecesIndex];
      indeces.splice(indecesIndex, 1);
    } else {
      indeces.splice(0, 1);
    }

    // Create the center point from the pixel position and color
    const pixel = pixels[index];
    const color = pixelColors[index];
    const point = [
      p.x + pixel[0] * pixelWidth + pixelOffset[0] * pixelWidth + dithering[index][0],
      p.y + height - pixel[1] * pixelHeight + pixelOffset[1] * pixelHeight + dithering[index][1],
    ];

    // Create the vertices from the center point
    const pointVertices = o.makePoints(point, o.pointSize || pixelWidth);
    const pointColors = o.makeColors(color, pointVertices.length / 2);
    points.push(...pointVertices);
    colors.push(...pointColors);
  }
  return [points, colors];
}

function pointsToVertices(points, rad = 0.015) {
  const vertices = [];
  for (let i = 0; i < points.length; i += 1) {
    vertices.push(...makeSquare(points[i], rad));
  }
  return vertices;
}

export type OBJ_LineToPoints = {
  line: Array<TypeParsablePoint>,
  maxPoints: number,
  close: boolean,
  pointSize: number,
  makeColors?: (TypeColor, number) => Array<number>,
  makePoints?: ([number, number], number) => Array<number>,
};
function lineToPoints(options: OBJ_LineToPoints) {
  const defaultOptions = {
    maxPoints: null,
    close: false,
    pointSize: null,
    makePoints: makeSquare.bind(this),
    makeColors: makeColors.bind(this),
  };
  const o = joinObjects({}, defaultOptions, options);
  const linePoints = o.line;
  const { close, maxPoints } = o;
  let cumDistance = 0;
  const distances = Array(linePoints.length).fill(0);
  const cumDistances = Array(linePoints.length).fill(0);
  for (let i = 1; i < linePoints.length; i += 1) {
    const p = [linePoints[i][0], linePoints[i][1]];
    const q = [linePoints[i - 1][0], linePoints[i - 1][1]];
    const distance = Math.sqrt(((p[0] - q[0]) ** 2) + ((p[1] - q[1]) ** 2));
    cumDistance += distance;
    distances[i] = distance;
    cumDistances[i] = cumDistance;
  }
  if (close) {
    const p = [linePoints[0][0], linePoints[0][1]];
    const q = [linePoints[linePoints.length - 1][0], linePoints[linePoints.length - 1][1]];
    const distance = Math.sqrt(((p[0] - q[0]) ** 2) + ((p[1] - q[1]) ** 2));
    cumDistance += distance;
    distances[0] = distance;
    cumDistances[0] = cumDistance;
  }
  const distanceStep = cumDistance / (numPoints - 1);
  const points = Array(numPoints);
  let nextLinePointIndex = 1;
  let currLinePointIndex = 0;
  for (let i = 0; i < numPoints; i += 1) {
    const currentCumDist = i * distanceStep;
    if (i === 0) {
      points[i] = linePoints[i];
      // eslint-disable-next-line no-continue
      continue;
    }
    while (cumDistances[nextLinePointIndex] < currentCumDist && nextLinePointIndex > 0) {
      if (nextLinePointIndex === linePoints.length - 1) {
        nextLinePointIndex = 0;
      } else {
        nextLinePointIndex += 1;
      }
      currLinePointIndex += 1;
    }
    const remainingDistance = cumDistances[nextLinePointIndex] - currentCumDist;
    const remainingPercent = 1 - remainingDistance / distances[nextLinePointIndex];
    const q = linePoints[currLinePointIndex];
    const p = linePoints[nextLinePointIndex];
    points[i] = [
      (p[0] - q[0]) * remainingPercent + q[0],
      (p[1] - q[1]) * remainingPercent + q[1],
    ];
  }
  return pointsToVertices(points, rad);
}

export {
  lineToPoints,
  getPixels,
  imageToPoints,
};
