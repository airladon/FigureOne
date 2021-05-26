// @flow

import type { TypeColor } from './types';
import { rand, randInt } from './math';
import { joinObjectsWithOptions, joinObjects } from './tools';
import { Point, getPoint } from './g2';
import type { TypeParsablePoint } from './g2';
import type { TypeHAlign, TypeVAlign } from '../figure/Equation/EquationForm';
import getImageData from './getImageData';
import { makeFastPolyLine } from '../figure/geometries/lines/lines';

/**
 * Create a square with two triangles, centered at some point with some
 * side length.
 *
 * @param {TypeParsablePoint} center
 * @param {number} sideLength
 * @return {Array<number>} array of interlaced x and y components of 6 vertices
 * (12 numbers total)
 */
function makeSquare(center: TypeParsablePoint, sideLength: number = 0.01) {
  const c = getPoint(center);
  return [
    c.x - sideLength / 2, c.y - sideLength / 2,
    c.x + sideLength / 2, c.y - sideLength / 2,
    c.x + sideLength / 2, c.y + sideLength / 2,
    c.x - sideLength / 2, c.y - sideLength / 2,
    c.x + sideLength / 2, c.y + sideLength / 2,
    c.x - sideLength / 2, c.y + sideLength / 2,
  ];
}

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
 * `imageToPoints` maps the pixels of an image to points of a shape that will be
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
 *
 * @param {OBJ_ImageToPoints} options
 * @return {[Array<number>, Array<number>]} [vertices, colors]
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
    let pointColors = [];
    if (o.makeColors != null) {
      pointColors = o.makeColors(color, pointVertices.length / 2);
    }
    points.push(...pointVertices);
    colors.push(...pointColors);
  }
  return [points, colors];
}

// function pointsToVertices(points, rad = 0.015) {
//   const vertices = [];
//   for (let i = 0; i < points.length; i += 1) {
//     vertices.push(...makeSquare(points[i], rad));
//   }
//   return vertices;
// }

function getPolylineStats(polyline: Array<Point>, close: boolean) {
  const linePoints = polyline;
  let cumDistance = 0;
  const distances = Array(linePoints.length).fill(0);
  const cumDistances = Array(linePoints.length).fill(0);
  for (let i = 1; i < linePoints.length; i += 1) {
    const p = [linePoints[i].x, linePoints[i].y];
    const q = [linePoints[i - 1].x, linePoints[i - 1].y];
    const distance = Math.sqrt(((p[0] - q[0]) ** 2) + ((p[1] - q[1]) ** 2));
    cumDistance += distance;
    distances[i] = distance;
    cumDistances[i] = cumDistance;
  }
  if (close) {
    const p = [linePoints[0].x, linePoints[0].y];
    const q = [linePoints[linePoints.length - 1].x, linePoints[linePoints.length - 1].y];
    const distance = Math.sqrt(((p[0] - q[0]) ** 2) + ((p[1] - q[1]) ** 2));
    cumDistance += distance;
    distances[0] = distance;
    cumDistances[0] = cumDistance;
  }
  return [cumDistance, cumDistances, distances];
}

function _segmentPolyline(
  polyline: Array<Point>,
  maxPoints: null | number = null,
  close: boolean = false,
): [Array<Point>, number, number] {
  const linePoints = polyline;

  const [cumDistance, cumDistances, distances] = getPolylineStats(linePoints, close);

  // Get the number of points to output, and the distance between them
  let numPoints = linePoints.length;
  if (maxPoints != null) {
    numPoints = maxPoints;
  }
  const distanceStep = cumDistance / (numPoints - 1);

  // Final points
  const points = [];
  // const colors = [];
  let nextLinePointIndex = 1;
  let currLinePointIndex = 0;
  for (let i = 0; i < numPoints; i += 1) {
    // Current cumulative distance for this point
    const currentCumDist = i * distanceStep;
    let point;
    if (i === 0) {
      point = new Point(linePoints[i].x, linePoints[i].y);
      // eslint-disable-next-line no-continue
      // continue;
    } else {
      // Increment `nextLinePointIndex` until it is larger than the
      // current cumulative distance (taking into account a close)
      while (cumDistances[nextLinePointIndex] < currentCumDist && nextLinePointIndex > 0) {
        if (nextLinePointIndex === linePoints.length - 1) {
          nextLinePointIndex = 0;
        } else {
          nextLinePointIndex += 1;
        }
        currLinePointIndex += 1;
      }
      // Remaining distance between the current cumulative distance and the next
      // polyline point cumulative distance
      const remainingDistance = cumDistances[nextLinePointIndex] - currentCumDist;
      // Percent of distance between current and next polyline point
      const remainingPercent = 1 - remainingDistance / distances[nextLinePointIndex];
      const q = linePoints[currLinePointIndex];
      const p = linePoints[nextLinePointIndex];
      // points[i] = [
      point = new Point(
        (p.x - q.x) * remainingPercent + q.x,
        (p.y - q.y) * remainingPercent + q.y,
      );
    }
    points.push(point);
  }
  return [points, cumDistance, distanceStep];
}

/**
 * Options obect for lineToShapes that evenly distributes shapes along a line
 *
 * @property {Array<TypeParsablePoint>} line array of points representing a
 * polyline where each point is a corner in the line
 * @property {number} num number of shapes to distribute along line
 * @property {boolean} close define open or closed polyline
 * @property {number} size size of point
 * @property {function([number, number], number): Array<number>} makeShape
 * function that makes the shape around each point. By default a square
 * centered at the point with side length `size` is made. Function input
 * parameters are the point coordinate tuple and `size`. Funciton must
 * return an array of numbers representing interlaced x, y values of each
 * vertex of the shape.
 * @property {function(number, [number, number], number, number, number): Array<number>} makeColors
 * function that makes the colors of each vertex of the shape around a point.
 * Function input parameters are the number of shape vertices to be colored,
 * the center point coordinate, the previous polyline point index, the
 * cumulative length from the start of the polyline, and the percentLength from
 * the start of the polyline. The function must return an array of rgba color
 * values for each shape vertex.
 */
export type OBJ_LineToPoints = {
  line: Array<TypeParsablePoint>,
  num?: number,
  close?: boolean,
  size?: number,
  makeShape?: ([number, number], number) => Array<number>,
  makeColors?: (number, [number, number], number, number, number) => Array<number>,
};

/**
 * `lineToShapes` divides a polyline into equall spaced points.
 *
 * The polyline (`line`) is defined by an array of points.
 *
 * The polyline can be closed or open.
 *
 * This method is useful for morphing between line shapes.
 *
 * @param {OBJ_LineToPoints} options
 * @return {[Array<number>, Array<number>]} [vertices, colors]
 */
function polylineToShapes(options: OBJ_LineToPoints) {
  const defaultOptions = {
    num: null,
    close: false,
    size: 0.01,
    makeShape: makeSquare.bind(this),
    makeColors: null,
  };
  const o = joinObjects({}, defaultOptions, options);
  const linePoints = o.polyline.map(p => getPoint(p));
  const vertices = [];
  const colors = [];
  const [centerPoints, cumDistance, distanceStep] = _segmentPolyline(linePoints, o.num, o.close);
  for (let i = 0; i < centerPoints.length; i += 1) {
    const center = centerPoints[i];
    const shapeVertices = o.makeShape(center, o.size);
    let vertexColors = [];
    const currentCumDist = i * distanceStep;
    if (o.makeColors != null) {
      vertexColors = o.makeColors(
        shapeVertices.length / 2, center, currentCumDist, currentCumDist / cumDistance,
      );
    }
    vertices.push(...shapeVertices);
    colors.push(...vertexColors);
  }
  return [vertices, colors];
}

function segmentPolyline(options: OBJ_LineToPoints) {
  const defaultOptions = {
    num: null,
    close: false,
    width: 0.01,
    makeColors: null,
  };
  const o = joinObjects({}, defaultOptions, options);
  const linePoints = o.polyline.map(p => getPoint(p));
  if (o.close) {
    linePoints.push(linePoints[0]._dup());
  }
  const [
    segmentedPolyline, cumDistance, distanceStep,
  ] = _segmentPolyline(linePoints, o.close ? o.num - 1 : o.num, false);

  const colors = [];
  const [stripPoints] = makeFastPolyLine(segmentedPolyline, o.width, false);
  const vertices = Array(stripPoints.length / 4 * 6 * 2);
  let index = 0;
  for (let i = 0; i < stripPoints.length - 2; i += 2) {
    // const p1 = stripPoints[i];
    // const p2 = stripPoints[i + 1];
    // const p3 = stripPoints[i + 2];
    // const p4 = stripPoints[i + 3];
    // let leftMostPair = [p1, p2];
    // if (p3.x < Math.min(p3.))
    vertices[index] = stripPoints[i].x;
    vertices[index + 1] = stripPoints[i].y;
    vertices[index + 2] = stripPoints[i + 1].x;
    vertices[index + 3] = stripPoints[i + 1].y;
    vertices[index + 4] = stripPoints[i + 2].x;
    vertices[index + 5] = stripPoints[i + 2].y;
    vertices[index + 6] = stripPoints[i + 1].x;
    vertices[index + 7] = stripPoints[i + 1].y;
    vertices[index + 8] = stripPoints[i + 3].x;
    vertices[index + 9] = stripPoints[i + 3].y;
    vertices[index + 10] = stripPoints[i + 2].x;
    vertices[index + 11] = stripPoints[i + 2].y;
    index += 12;
  }
  if (o.makeColors != null) {
    for (let i = 1; i < segmentedPolyline.length; i += 1) {
      const endPoint = segmentedPolyline[i];
      const currentCumDist = i * distanceStep;
      const vertexColors = o.makeColors(
        6, endPoint, currentCumDist, currentCumDist / cumDistance,
      );
      colors.push(...vertexColors);
    }
  }

  return [vertices, colors];
}

/**
 * Options object to calculate vertices of a polygon
 *
 * @property {number} [radius] radius of polygon (`1`)
 * @property {number} [sides] number of polygon sides (`4`)
 * @property {TypeParsablePoint} [position] center position of polygon (`[0, 0]`)
 * @property {number} [rotation] polygon rotation (first vertex will be along
 * the positive x axis) (`0`)
 * @property {1 | -1} [direction] 1 is CCW, -1 is CW (`1`)
 */
export type OBJ_GetPolygonVertices = {
  radius: number,
  sides: number,
  position: TypeParsablePoint,
  rotation: number,
  direction: 1 | -1,
};

/**
 * Calculate vertices of a polygon
 *
 * @param {OBJ_GetPolygonVertices} options
 * @return {Array<[number, number]>} Array of vertices represented by [x, y]
 * tuples
 */
const getPolygonCorners = (options: OBJ_GetPolygonVertices) => {
  const defaultOptions = {
    sides: 4,
    rotation: 0,
    radius: 1,
    position: [0, 0],
    direction: 1,
  };
  const o = joinObjects({}, defaultOptions, options);
  const position = getPoint(o.position);
  const points = [];
  const dAngle = Math.PI * 2 / o.sides;
  for (let i = 0; i < o.sides; i += 1) {
    points.push([
      o.radius * Math.cos(o.direction * (dAngle * i + o.rotation)) + position.x,
      o.radius * Math.sin(o.direction * (dAngle * i + o.rotation)) + position.y,
    ]);
  }
  return points;
};

/**
 * Options object to generate random points within a polygon.
 *
 * @property {number} [maxPoints] number of points to generate (`10`)
 * @property {number} [pointSize] size of each point (`0.01`)
 * @property {number} [radius] radius of polygon (`1`)
 * @property {number} [sides] number of polygon sides (`4`)
 * @property {TypeParsablePoint} [position] center position of polygon (`[0, 0]`)
 * @property {number} [rotation] polygon rotation (first vertex will be along
 * the positive x axis) (`0`)
 * @property {function([number, number], number): Array<number>} [makePoints]
 * use this function to customize point creation. By default a square of two
 * triangles is created (six vertices). The function takes as input the [x, y]
 * position of the center point and `pointSize` and outputs an array of vertices
 * of triangles with interlaced x and y coordinates. For example:
 * [x1, y1, x2, y2, x3, y3, ....]
 */
export type OBJ_PolygonCloudPoints = {
  radius?: number,
  sides?: number,
  position?: TypeParsablePoint,
  rotation?: number,
  maxPoints?: number,
  pointSize?: number,
  makePoints?: ([number, number], number) => Array<number>,
};

/**
 * Generate random points within a polygon.
 *
 * @param {OBJ_PolygonCloudPoints} polygonCloudPoints
 * @return {Array<number>} array of interlaced x and y coordinates of vertices
 */
const polygonCloudPoints = (options: OBJ_PolygonCloudPoints) => {
  const defaultOptions = {
    sides: 4,
    rotation: 0,
    radius: 1,
    position: [0, 0],
    maxPoints: 10,
    pointSize: 0.01,
    makePoints: makeSquare.bind(this),
  };
  const o = joinObjects({}, defaultOptions, options);
  const position = getPoint(o.position);
  const points = [];
  const apothem = o.radius * Math.cos(Math.PI / o.sides);

  for (let i = 0; i < o.maxPoints; i += 1) {
    const angle = rand(0, Math.PI * 2);
    const sideAngle = Math.PI * 2 / o.sides;
    const lastVertex = Math.floor(angle / sideAngle) * sideAngle;
    const angleDelta = Math.abs(angle - lastVertex - sideAngle / 2);
    const radiusMax = apothem / Math.cos(angleDelta);
    // This is a dodgey way to try and even out the distribution so there isn't
    // clumping at the center. Todo in future is make a linear propbability
    // distribution
    const radius = rand(rand(0, radiusMax / 2), radiusMax);
    points.push(...o.makePoints([
      radius * Math.cos(angle + o.rotation) + position.x,
      radius * Math.sin(angle + o.rotation) + position.y,
    ]));
  }
  return points;
};

/**
 * Options object to generate random cloud of points within a circle.
 *
 * @property {number} [maxPoints] number of points to generate (`10`)
 * @property {number} [pointSize] size of each point (`0.01`)
 * @property {number} [radius] radius of polygon (`1`)
 * @property {TypeParsablePoint} [position] center position of polygon (`[0, 0]`)
 * @property {function([number, number], number): Array<number>} [makePoints]
 * use this function to customize point creation. By default a square of two
 * triangles is created (six vertices). The function takes as input the [x, y]
 * position of the center point and `pointSize` and outputs an array of vertices
 * of triangles with interlaced x and y coordinates. For example:
 * [x1, y1, x2, y2, x3, y3, ....]
 */
export type OBJ_CircleCloudPoints = {
  radius?: number,
  position?: TypeParsablePoint,
  maxPoints?: number,
  makePoints?: ([number, number], number) => Array<number>,
  pointSize?: number,
};

/**
 * Generate random points within a circle.
 *
 * @param {OBJ_CircleCloudPoints} options
 * @return {Array<number>} array of interlaced x and y coordinates of vertices
 */
const circleCloudPoints = (options: OBJ_CircleCloudPoints) => {
  const defaultOptions = {
    radius: 1,
    position: [0, 0],
    maxPoints: 10,
    pointSize: 0.01,
    makePoints: makeSquare.bind(this),
  };
  const o = joinObjects({}, defaultOptions, options);
  const position = getPoint(o.position);
  const points = [];

  for (let i = 0; i < o.maxPoints; i += 1) {
    const angle = rand(0, Math.PI * 2);
    // This is a dodgey way to try and even out the distribution so there isn't
    // clumping at the center. Todo in future is make a linear propbability
    // distribution
    const radius = rand(rand(0, o.radius / 2), o.radius);
    points.push(...o.makePoints([
      radius * Math.cos(angle) + position.x,
      radius * Math.sin(angle) + position.y,
    ], o.pointSize));
  }
  return points;
};


/**
 * Options object to generate random points within a circle.
 *
 * @property {number} [maxPoints] number of points to generate (`10`)
 * @property {number} [pointSize] size of each point (`0.01`)
 * @property {number} [width] width of rectangle (`1`)
 * @property {number} [height] height of rectangle (`1`)
 * @property {TypeParsablePoint} [position] center position of polygon (`[0, 0]`)
 * @property {function([number, number], number): Array<number>} [makePoints]
 * use this function to customize point creation. By default a square of two
 * triangles is created (six vertices). The function takes as input the [x, y]
 * position of the center point and `pointSize` and outputs an array of vertices
 * of triangles with interlaced x and y coordinates. For example:
 * [x1, y1, x2, y2, x3, y3, ....]
 */
export type OBJ_RectangleCloudPoints = {
  width?: number,
  height?: number,
  position?: TypeParsablePoint,
  maxPoints?: number,
  makePoints?: ([number, number], number) => Array<number>,
  pointSize?: number,
};

/**
 * Generate random points within a rectangle.
 *
 * @param {OBJ_RectangleCloudPoints} options
 * @return {Array<number>} array of interlaced x and y coordinates of vertices
 */
const rectangleCloudPoints = (options: OBJ_RectangleCloudPoints) => {
  const defaultOptions = {
    width: 1,
    height: 1,
    position: [0, 0],
    maxPoints: 10,
    pointSize: 0.01,
    makePoints: makeSquare.bind(this),
  };
  const o = joinObjects({}, defaultOptions, options);
  const position = getPoint(o.position);
  const points = [];

  for (let i = 0; i < o.maxPoints; i += 1) {
    const x = rand(-o.width / 2, o.width / 2) + position.x;
    const y = rand(-o.height / 2, o.height / 2) + position.y;
    points.push(...o.makePoints([x, y], o.pointSize));
  }
  return points;
};

export {
  polylineToShapes,
  getPixels,
  imageToPoints,
  getPolygonCorners,
  polygonCloudPoints,
  circleCloudPoints,
  rectangleCloudPoints,
  segmentPolyline,
};
