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
 * Create a square fill from two triangles
 *
 * @param {TypeParsablePoint} center
 * @param {number} sideLength
 * @return {Array<number>} array of interlaced x and y components of 6 vertices
 * (12 numbers total)
 */
function squareFill(center: TypeParsablePoint, sideLength: number = 0.01) {
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

/**
 * Create a hexagon fill from four triangles (12 vertices)
 *
 * @param {TypeParsablePoint} center
 * @param {number} radius
 * @return {Array<number>} array of interlaced x and y components of 12 vertices
 * (24 numbers total)
 */
function hexFill(center: TypeParsablePoint, radius: number = 0.01) {
  const c = getPoint(center);
  const a = Math.PI * 2 / 6;
  const points = [
    [radius + c.x, c.y],
    [radius * Math.cos(a) + c.x, radius * Math.sin(a) + c.y],
    [radius * Math.cos(a * 2) + c.x, radius * Math.sin(a * 2) + c.y],
    [radius * Math.cos(a * 3) + c.x, radius * Math.sin(a * 3) + c.y],
    [radius * Math.cos(a * 4) + c.x, radius * Math.sin(a * 4) + c.y],
    [radius * Math.cos(a * 5) + c.x, radius * Math.sin(a * 5) + c.y],
  ];
  return [
    points[0][0], points[0][1],
    points[1][0], points[1][1],
    points[2][0], points[2][1],
    //
    points[0][0], points[0][1],
    points[2][0], points[2][1],
    points[3][0], points[3][1],
    //
    points[0][0], points[0][1],
    points[3][0], points[3][1],
    points[4][0], points[4][1],
    //
    points[0][0], points[0][1],
    points[4][0], points[4][1],
    points[5][0], points[5][1],
  ];
}

/**
 * Create a polygon fill with n sides from n-2 triangles - (3 * (n-2) vertices)
 *
 * @param {TypeParsablePoint} center
 * @param {number} sideLength
 * @return {Array<number>} array of interlaced x and y components of vertices
 */
function polygonFill(sides: number, center: TypeParsablePoint, radius: number = 0.01) {
  const c = getPoint(center);
  const a = Math.PI * 2 / sides;
  const points = [];
  for (let i = 0; i < sides; i += 1) {
    points.push(
      [radius * Math.cos(a * i) + c.x, radius * Math.sin(a * i) + c.y],
    );
  }
  const vertices = [];
  for (let i = 1; i < sides - 1; i += 1) {
    vertices.push(...[
      points[0][0], points[0][1],
      points[i][0], points[i][1],
      points[i + 1][0], points[i + 1][1],
    ]);
  }
  return vertices;
}

// Determine which shape function to use
function processShapeFunction(
  makePoints: ((TypeParsablePoint, number) => Array<number>) | 'square' | 'hex' | number,
) {
  if (typeof makePoints === 'number' && makePoints > 2) {
    if (makePoints === 4) {
      return squareFill.bind(this);
    }
    if (makePoints === 6) {
      return hexFill.bind(this);
    }
    return polygonFill.bind(this, makePoints);
  }
  if (makePoints === 'hex') {
    return hexFill.bind(this);
  }
  if (typeof makePoints === 'function') {
    return makePoints;
  }
  return squareFill.bind(this);
}

/**
 * Create an array of `num` copies of the same color
 *
 * @param {TypeColor} color
 * @param {number} numCopies
 * @return {Array<number>} color copies juxtaposed in single array
 */
const makeColors = (color: TypeColor, numCopies: number) => {
  const colors = [];
  for (let i = 0; i < numCopies; i += 1) {
    colors.push(...color);
  }
  return colors;
};

// Get pixels from image data, where pixels may be filtered.
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
 * @property {number | null} [num] maximum number of shapes to return -
 * `null` defaults to the number of pixels (or filtered pixels if a filter is
 * used) (`null`)
 * @property {'repeatOpaqueOnly' | 'lastOpaque' | 'repeat'} [excess] if
 * num is greater than the number of pixels, then either `'repeat'` the
 * shapes from all the pixels again, repeat the shapes from only the opaque
 * pixels `'repeatOpaqueOnly'` or put all execess shapes on the `'lastOpaque'`
 * pixel. Note, repeating pixels that are semitransparent will effectively put
 * multiple pixels on top of each other, reducing the transparency of the pixel
 * (`'repeatOpaqueOnly'`).
 * @property {function(TypeColor, [number, number]) => boolean} [filter]
 * filter function with pixel color and pixel position input parameters. Return
 * `true` to keep pixel. Pixel position is (0, 0) in top left corner and
 * (pixelsWidth, pixelsHeight) in the bottom right (`() => true`)
 * @property {'raster' | 'random'} [distribution] Returned shapes are randomly
 * distributed throughout shape (`'random'`) or rasterized in order from top
 * left to bottom right of image (or filtered image) (`random`)
 * @property {number | null} [width] width to map image pixels to. Width is
 * between center of most left to most right pixels
 * @property {number | null} [height] height to map image pixels to. Height is
 * between center of most bottom to most top pixels
 * @property {number} [size] shape size to map pixel to. Final points will
 * have a width of `width + size` center of points are used to determine
 * `width` and `height`. Default shape is a square, and default size
 * (if left undefined) is the size needed to make adjacent square shapes
 * touch
 * @property {TypeParsablePoint} [position] position to place shapes at
 * @property {TypeHAlign} [xAlign] align shapes horizontally around `position`
 * @property {TypeVAlign} [yAlign] align shapes vertically around `position`
 * @property {'image' | 'filteredImage'} [align] `image` will align the shapes
 * as if there were no pixels filtered out. `filteredImage` will align to only
 * the shapes that exist.
 * @property {number} [dither] Add a random offset to each shape to create a
 * dither effect
 * @property {function(Point, number): Array<number> | number} [shape]
 * By default a square of two triangles is created (six vertices). Use a
 * `number` to create a regular polygon with `number` sides. Use a custom
 * function to make a custom shape. The function takes as input the [x, y]
 * position of the point to build the shape around, and `size`. It outputs an
 * array of interlaced x and y coordinates of triangle vertices - i.e.:
 * [x1, y1, x2, y2, x3, y3, ....]
 * @property {function(TypeColor, number): Array<number>} [makeColors]
 * use this function to customze color mapping. The function takes as input the
 * pixel's color, and the number of vertices that need to be colored. It
 * outputs an array of colors for each vertex - i.e.:
 * [r1, b1, g1, a1, r2, g2, b, a2, ...]
 */
export type OBJ_ImageToShapes = {
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
 size?: number,
 excess?: 'repeatOpaqueOnly' | 'lastOpaque' | 'repeat',
 makeColors?: (TypeColor, number) => Array<number>,
 shape?: number | (Point, number) => Array<number>,
};

/**
 * `imageToShapes` maps the pixels of an image to shapes that will be
 * used to draw those pixels.
 *
 * All pixels in an image can be made shapes, or a `filter` function can be used
 * to only use desired pixels.
 *
 * The shapes can be rasterized in order (raster from top left to bottom
 * right) or be in a random order.
 *
 * The image pixel centers are mapped to some `width` and `height` and aligned
 * to a position relative to either all pixels in the original image, or just
 * the filtered pixels. The shapes are centered on the pixel centers.
 *
 * This method is useful for including images in morphing effects. It should
 * not be used to simply show an image (use a texture with some
 * FigureElementPrimitive for this).
 *
 * @param {OBJ_ImageToShapes} options
 * @return {[Array<number>, Array<number>]} [vertices, colors]
 */
function imageToShapes(options: OBJ_ImageToShapes) {
  const defaultOptions = {
    num: null,
    xAlign: 'center',
    yAlign: 'middle',
    align: 'image',
    distribution: 'random',
    filter: () => true,
    position: [0, 0],
    dither: 0,
    width: null,
    height: null,
    excess: 'repeatOpaqueOnly',
    shape: 'square',
    makeColors: makeColors.bind(this),
  };
  const o = joinObjectsWithOptions({ except: 'image' }, {}, defaultOptions, options);
  const { image } = options;
  const imageHeight = image.height;
  const imageWidth = image.width;
  const { filter } = o;
  const shape = processShapeFunction(o.shape);

  // Get array of pixel colors from top left to bottom right
  const data = getImageData(image);

  // Get the final pixels to use, as well as the max and min pixel
  // coordinates of the final pixels (useful when a filter has been applied)
  const {
    min, max, pixels, pixelColors,
  } = getPixels(data, imageWidth, imageHeight, filter);

  // By default, the maxPoints value is the number of pixels
  let maxPoints = pixels.length;
  if (o.num != null) {
    maxPoints = o.num;
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
    // `excess` option
    if (indeces.length === 0) {
      if (o.excess === 'lastOpaque') {
        indeces = Array(maxPoints - i).fill(opaquePixelIndeces.slice(-1)[0]);
      } else if (o.excess === 'repeatOpaqueOnly') {
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
    const point = new Point(
      p.x + pixel[0] * pixelWidth + pixelOffset[0] * pixelWidth + dithering[index][0],
      p.y + height - pixel[1] * pixelHeight + pixelOffset[1] * pixelHeight + dithering[index][1],
    );

    // Create the vertices from the center point
    const pointVertices = shape(point, o.size || pixelWidth);
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
//     vertices.push(...squareFill(points[i], rad));
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

// Break a polyline into a polyline with `num` equal length segments
function _segmentPolyline(
  polylinePoints: Array<Point>,
  num: null | number = null,
  close: boolean = false,
): [Array<Point>, number, number] {
  const linePoints = polylinePoints;

  const [cumDistance, cumDistances, distances] = getPolylineStats(linePoints, close);

  // Get the number of points to output, and the distance between them
  let numPoints = linePoints.length;
  if (num != null) {
    numPoints = num;
  }
  const distanceStep = cumDistance / (numPoints - 1);

  // Final points
  const points = [];
  let nextLinePointIndex = 1;
  let currLinePointIndex = 0;
  for (let i = 0; i < numPoints - 1; i += 1) {
    // Current cumulative distance for this point
    const currentCumDist = i * distanceStep;
    let point;
    if (i === 0) {
      point = new Point(linePoints[i].x, linePoints[i].y);
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
      point = new Point(
        (p.x - q.x) * remainingPercent + q.x,
        (p.y - q.y) * remainingPercent + q.y,
      );
    }
    points.push(point);
  }
  if (close) {
    // points.push(linePoints[0]._dup());
  } else {
    points.push(linePoints[linePoints.length - 1]._dup());
  }
  return [points, cumDistance, distanceStep];
}

/**
 * Options obect for {@link polylineToShapes} that evenly distributes shapes
 * along a line
 *
 * @property {Array<TypeParsablePoint>} points array of points representing a
 * polyline where each point is a corner in the line
 * @property {number} num number of shapes to distribute along line
 * @property {boolean} close `true` closes the polyline
 * @property {number} size size of shape
 * @property {function(Point, number): Array<number> | number} [shape]
 * By default a square of two triangles is created (six vertices). Use a
 * `number` to create a regular polygon with `number` sides. Use a custom
 * function to make a custom shape. The function takes as input the [x, y]
 * position of the point to build the shape around, and `size`. It outputs an
 * array of interlaced x and y coordinates of triangle vertices - i.e.:
 * [x1, y1, x2, y2, x3, y3, ....]
 * @property {function(number, Point, number, number, number): Array<number>} makeColors
 * function that creates colors for each vertex of the shape.
 * Function input parameters are the number of shape vertices to be colored,
 * the center point coordinate, the previous polyline point index, the
 * cumulative length from the start of the polyline, and the percentLength from
 * the start of the polyline. The function must return a single array
 * containing all vertex colors.
 */
export type OBJ_PolylineToShapes = {
  points: Array<TypeParsablePoint>,
  num?: number,
  close?: boolean,
  size?: number,
  shape?: number | (Point, number) => Array<number>,
  makeColors?: (number, Point, number, number, number) => Array<number>,
};

/**
 * `polylineToShapes` distributes a number of shapes equally along a polyline.
 *
 * The polyline is defined by an array of points, where each point is a corner
 * in the polyline
 *
 * The start and ends of the polyline each have a centered shape
 *
 * The polyline can be closed or open.
 *
 * This method is useful for morphing between shapes.
 *
 * @param {OBJ_PolylineToShapes} options
 * @return {[Array<number>, Array<number>]} [vertices, colors]
 */
function polylineToShapes(options: OBJ_PolylineToShapes) {
  const defaultOptions = {
    num: null,
    close: false,
    size: 0.01,
    shape: squareFill.bind(this),
    makeColors: null,
  };
  const o = joinObjects({}, defaultOptions, options);
  const shape = processShapeFunction(o.shape);
  const points = o.points.map(p => getPoint(p));
  const vertices = [];
  const colors = [];
  const [centerPoints, cumDistance, distanceStep] = _segmentPolyline(points, o.num, o.close);
  for (let i = 0; i < centerPoints.length; i += 1) {
    const center = centerPoints[i];
    const shapeVertices = shape(center, o.size);
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

/**
 * Options obect for {@link pointsToShapes} that creates a shape at each point
 *
 * @property {Array<TypeParsablePoint>} points array of points to create shapes
 * at
 * @property {number} size size of shape
 * @property {function(Point, number): Array<number> | number} [shape]
 * By default a square of two triangles is created (six vertices). Use a
 * `number` to create a regular polygon with `number` sides. Use a custom
 * function to make a custom shape. The function takes as input the [x, y]
 * position of the point to build the shape around, and `size`. It outputs an
 * array of interlaced x and y coordinates of triangle vertices - i.e.:
 * [x1, y1, x2, y2, x3, y3, ....]
 * @property {function(number, Point): Array<number>} makeColors
 * function that creates colors for each vertex of the shape.
 * Function input parameters are the number of shape vertices to be colored,
 * and the position of the shape. The function must return a single array
 * containing all vertex colors.
 */
export type OBJ_PointsToShapes = {
  points: Array<TypeParsablePoint>,
  size?: number,
  shape?: number | (Point, number) => Array<number>,
  makeColors?: (number, Point, number, number, number) => Array<number>,
};
/**
 * `pointsToShapes` creates shapes at each point input.
 *
 * This method is useful for morphing between shapes.
 *
 * @param {OBJ_PointsToShapes} options
 * @return {[Array<number>, Array<number>]} [vertices, colors]
 */
function pointsToShapes(options: OBJ_PointsToShapes) {
  const defaultOptions = {
    size: 0.01,
    shape: squareFill.bind(this),
    makeColors: null,
  };
  const o = joinObjects({}, defaultOptions, options);
  const shape = processShapeFunction(o.shape);
  const vertices = [];
  const colors = [];
  for (let i = 0; i < o.points.length; i += 1) {
    const point = getPoint(o.points[i]);
    const shapeVertices = shape(point, o.size);
    let vertexColors = [];
    if (o.makeColors != null) {
      vertexColors = o.makeColors(
        shapeVertices.length / 2, point,
      );
    }
    vertices.push(...shapeVertices);
    colors.push(...vertexColors);
  }
  return [vertices, colors];
}

function stripPolylineToTriangles(stripPointsIn: Array<Point>) {
  const stripPoints = stripPointsIn.map(p => p.round());
  const vertices = Array(stripPoints.length / 4 * 6 * 2);
  let index = 0;
  for (let i = 0; i < stripPoints.length - 2; i += 2) {
    const points = [
      stripPoints[i],
      stripPoints[i + 1],
      stripPoints[i + 2],
      stripPoints[i + 3],
    ];
    vertices[index] = points[0].x;
    vertices[index + 1] = points[0].y;
    vertices[index + 2] = points[1].x;
    vertices[index + 3] = points[1].y;
    vertices[index + 4] = points[2].x;
    vertices[index + 5] = points[2].y;
    vertices[index + 6] = points[1].x;
    vertices[index + 7] = points[1].y;
    vertices[index + 8] = points[3].x;
    vertices[index + 9] = points[3].y;
    vertices[index + 10] = points[2].x;
    vertices[index + 11] = points[2].y;
    index += 12;
  }
  return vertices;
}

function polyline(options: OBJ_SegmentPolyline) {
  const defaultOptions = {
    num: null,
    close: false,
    width: 0.01,
    makeColors: null,
  };
  const o = joinObjectsWithOptions({ except: 'points' }, {}, defaultOptions, options);
  const linePoints = options.points.map(p => getPoint(p));
  let num = 0;
  let segmentedPolyline;
  // debugger;
  if (o.num == null) {
    segmentedPolyline = linePoints;
    num = linePoints.length;
  } else {
    num = o.num;
    [segmentedPolyline] = _segmentPolyline(linePoints, num, o.close);
  }
  const colors = [];
  let [stripPoints] = makeFastPolyLine(segmentedPolyline, o.width, o.close);
  if (o.close) {
    stripPoints.splice(-2, 2);
  }
  stripPoints = stripPoints.map(p => p.round());
  const vertices = Array(stripPoints.length * 6 * 2);
  let index = 0;
  for (let i = 0; i < stripPoints.length - 2; i += 4) {
    const points = [
      stripPoints[i],
      stripPoints[i + 1],
      stripPoints[i + 2],
      stripPoints[i + 3],
    ];
    vertices[index] = points[0].x;
    vertices[index + 1] = points[0].y;
    vertices[index + 2] = points[1].x;
    vertices[index + 3] = points[1].y;
    vertices[index + 4] = points[2].x;
    vertices[index + 5] = points[2].y;
    vertices[index + 6] = points[1].x;
    vertices[index + 7] = points[1].y;
    vertices[index + 8] = points[3].x;
    vertices[index + 9] = points[3].y;
    vertices[index + 10] = points[2].x;
    vertices[index + 11] = points[2].y;
    index += 12;
  }
  if (o.makeColors != null) {
    for (let i = 1; i < segmentedPolyline.length; i += 1) {
      const endPoint = segmentedPolyline[i];
      // const currentCumDist = i * distanceStep;
      const vertexColors = o.makeColors(
        6, endPoint,
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
    makePoints: squareFill.bind(this),
  };
  const o = joinObjects({}, defaultOptions, options);
  const position = getPoint(o.position);
  const points = [];
  const apothem = o.radius * Math.cos(Math.PI / o.sides);
  const makePoints = processShapeFunction(o.makePoints);

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
    points.push(...makePoints([
      radius * Math.cos(angle + o.rotation) + position.x,
      radius * Math.sin(angle + o.rotation) + position.y,
    ], o.pointSize));
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
    makePoints: squareFill.bind(this),
  };
  const o = joinObjects({}, defaultOptions, options);
  const position = getPoint(o.position);
  const points = [];
  const makePoints = processShapeFunction(o.makePoints);

  for (let i = 0; i < o.maxPoints; i += 1) {
    const angle = rand(0, Math.PI * 2);
    // This is a dodgey way to try and even out the distribution so there isn't
    // clumping at the center. Todo in future is make a linear propbability
    // distribution
    const radius = rand(rand(0, o.radius / 2), o.radius);
    points.push(...makePoints([
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
const rectangleCloudShapes = (options: OBJ_RectangleCloudPoints) => {
  const defaultOptions = {
    width: 1,
    height: 1,
    position: [0, 0],
    maxPoints: 10,
    pointSize: 0.01,
    makePoints: squareFill.bind(this),
  };
  const o = joinObjects({}, defaultOptions, options);
  const position = getPoint(o.position);
  const points = [];
  const makePoints = processShapeFunction(o.makePoints);

  for (let i = 0; i < o.maxPoints; i += 1) {
    const x = rand(-o.width / 2, o.width / 2) + position.x;
    const y = rand(-o.height / 2, o.height / 2) + position.y;
    points.push(...makePoints([x, y], o.pointSize));
  }
  return points;
};

export {
  polyline,
  pointsToShapes,
  polylineToShapes,
  imageToShapes,
  getPixels,
  getPolygonCorners,
  polygonCloudPoints,
  circleCloudPoints,
  rectangleCloudShapes,
};
