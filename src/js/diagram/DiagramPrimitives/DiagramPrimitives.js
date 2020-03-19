// @flow
import {
  Rect, Point, Transform, getPoint,
} from '../../tools/g2';
import type {
  TypeParsablePoint,
} from '../../tools/g2';
import { setHTML } from '../../tools/htmlGenerator';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';
import WebGLInstance from '../webgl/webgl';
import DrawContext2D from '../DrawContext2D';
import * as tools from '../../tools/math';
import { generateUniqueId, joinObjects } from '../../tools/tools';
import VertexObject from '../DrawingObjects/VertexObject/VertexObject';
// import {
//   PolyLine, PolyLineCorners,
// } from '../DiagramElements/PolyLine';
import Fan from '../DiagramElements/Fan';
import {
  Polygon, PolygonFilled, PolygonLine,
} from '../DiagramElements/Polygon';
import RadialLines from '../DiagramElements/RadialLines';
import HorizontalLine from '../DiagramElements/HorizontalLine';
import DashedLine from '../DiagramElements/DashedLine';
import RectangleFilled from '../DiagramElements/RectangleFilled';
import Rectangle from '../DiagramElements/Rectangle';
import Generic from '../DiagramElements/Generic';
import Box from '../DiagramElements/Box';
// import type { TypeRectangleFilledReference } from '../DiagramElements/RectangleFilled';
import Lines from '../DiagramElements/Lines';
import Arrow from '../DiagramElements/Arrow';
import { AxisProperties } from '../DiagramElements/Plot/AxisProperties';
import Axis from '../DiagramElements/Plot/Axis';
import Text from '../DiagramElements/Text';
import {
  DiagramText, DiagramFont, TextObject,
} from '../DrawingObjects/TextObject/TextObject';
import HTMLObject from '../DrawingObjects/HTMLObject/HTMLObject';
import type { TypeSpaceTransforms } from '../Diagram';
import { makePolyLine, makePolyLineCorners } from '../DrawingObjects/Geometries/lines/lines';

/**
 * Polygon or partial polygon shape options object
 *
 * ![](./assets1/polygon.png)
 *
 * @property {number} [sides] (`4`)
 * @property {number} [radius] (`1`)
 * @property {number} [width] line width - line will be drawn on inside of radius (`0.01`)
 * @property {number} [rotation] (`0`)
 * @property {boolean} [clockwise] (`false`)
 * @property {number} [sidesToDraw] number of sides to draw (all sides)
 * @property {number} [angleToDraw] same as `sidesToDraw` but using angle for
 * the definition (2π)
 * @property {Array<number>} [color] (`[1, 0, 0, 1`])
 * @property {boolean} [fill] (`false`)
 * @property {TypeParsablePoint} [center] vertex space location of polygon
 * center. This is different to position or transform as these translate the
 * vertices on each draw. (`[0, 0]`)
 * @property {Point} [position] convenience to override Transform translation
 * @property {Transform} [transform] (`Transform('polygon').standard()`)
 * @property {string} [textureLocation] location of the texture file
 * @property {Rect} [textureCoords] normalized coordinates of the texture
 * within the file (`Rect(0, 0, 1, 1)`)
 * @property {Function} [onLoad] callback to exectute after textures have loaded
 * (`[0, 0]`)
 * @property {boolean} [trianglePrimitives] `true` to use `TRIANGLES`
 * instead of `TRIANGLE_STRIP` as GL primitive ('false`)
 * @property {boolean} [linePrimitives] `true` to use `LINES` instead of
 * `TRIANGLE_STRIP` as GL primitive - this will disable width (`false`)
 * used with filled polygons
 * @property {number} [pulse] set the default pulse scale
 * @example
 * // Simple filled polygon
 * diagram.addElement(
 *   {
 *     name: 'p',
 *     method: 'polygon',
 *     options: {
 *       radius: 0.5,
 *       fill: true,
 *       sides: 6,
 *     },
 *   },
 * );
 * @example
 * // Quarter circle
 * diagram.addElement(
 *   {
 *     name: 'p',
 *     method: 'polygon',
 *     options: {
 *       radius: 0.4,
 *       sides: 100,
 *       width: 0.08,
 *       angleToDraw: Math.PI / 2,
 *       color: [1, 1, 0, 1],
 *     },
 *   },
 * );
 */
export type OBJ_Polygon = {
  sides?: number,
  radius?: number,
  width?: number,
  rotation?: number,
  clockwise?: boolean,
  sidesToDraw?: number,
  color?: Array<number>,
  fill?: boolean,
  transform?: Transform,
  position?: TypeParsablePoint,
  textureLocation?: string,
  textureCoords?: Rect,
  onLoad?: Function,
  pulse?: number;
  trianglePrimitives?: boolean,
  linePrimitives?: boolean,
  center?: TypeParsablePoint,
};

/**
  Curved Corner Definition
 */
export type OBJ_CurvedCorner = {
  radius?: number,
  sides?: number,
};

/**
 * Rectangle shape options object
 *
 * ![](./assets1/rectangle.png)
 *
 * @property {'bottom' | 'middle' | 'top' | number} [yAlign] (`'middle'`)
 * @property {'left' | 'center' | 'right' | number} [xAlign] (`'center'`)
 * @property {number} [width] (`1`)
 * @property {number} [height] (`1`)
 * @property {boolean} [fill] (`false`)
 * @property {OBJ_CurvedCorner} [corner] define for rounded corners
 * @property {Array<number>} [color] (`[1, 0, 0, 1]`)
 * @property {Point} [position] convenience to override Transform translation
 * @property {Transform} [transform] (`Transform('rectangle').standard()`)
 * @property {number} [pulse] set the default pulse scale
 * @example
 * // Filled rectangle
 * diagram.addElement(
 *  {
 *    name: 'r',
 *    method: 'rectangle',
 *    options: {
 *      width: 0.4,
 *      height: 0.2,
 *      fill: true,
 *    },
 *  },
 * );
 * @example
 * // Rectangle with rounded corners
 */
export type OBJ_Rectangle = {
  yAlign?: 'bottom' | 'middle' | 'top' | number,
  xAlign?: 'left' | 'center' | 'right' | number,
  width?: number,
  height?: number,
  fill?: boolean,
  corner?: {
    radius?: number,
    sides?: number,
  },
  color?: Array<number>,
  transform?: Transform,
  position?: Point,
  pulse?: number,
}


/**
 * Texture definition object
 *
 * A texture file is an image file like a jpg, or png.
 *
 * Textures can be used instead of colors to fill a shape in WebGL.
 *
 * Textures are effectively overlaid on a shape. Therefore, to overlay the
 * texture with the correct offset, magnification and aspect ratio the texture
 * must be mapped to the space the shape's vertices are defined in
 * (vertex space).
 *
 * This is done by defining a window, or rectangle, for the texture file
 * (`mapFrom`) and a similar window in vertex space (`mapTo`).
 * The texture is then offset and scaled such that its window aligns with the
 * vertex space window.
 *
 * The texture file has coordinates of (0, 0) in the bottom left corner and
 * (1, 1) in the top right corner.
 *
 * Therefore, to make a 1000 x 500 image fill a 2 x 1 rectangle in vertex space
 * centered at (0, 0) you would define:
 *
 * ```
 * mapFrom: new Rect(0, 0, 1, 1)
 * mapTo: new Rect(-1, -0.5, 2, 1)
 * ```
 *
 * If instead you wanted to zoom the image in the same rectange by a factor of 2
 * you could either:
 *
 * ```
 * mapFrom: new Rect(0.25, 0.25, 0.5, 0.5)
 * mapTo: new Rect(-1, -0.5, 2, 1)
 * ```
 *
 * or
 *
 * ```
 * mapFrom: new Rect(0, 0, 1, 1)
 * mapTo: new Rect(-2, -1, 4, 2)
 * ```
 *
 * Two ways of doing this are provided as sometimes it is more convenient to
 * think about the window on the image, and other times the window in vertex
 * space.
 *
 * If the shape has fill outside the texture boundaries then either the
 * texture can be repeated, or a pixel from the border of the image is used
 * (called clamping to edge).
 * WebGL only allows images that are square with a side length that is a
 * power of 2 (such as 16, 32, 64, 128 etc) to be repeated. All other images
 * can only be clamped to their edge.
 *
 * To repeat all other image resolutions, a texture can be mapped to a rectangle
 * and then the rectangle repeated throughout the diagram.

 * @property {string} src The url or location of the image
 * @property {Rect} [mapTo] vertex space window (`new Rect(-1, -1, 2, 2)`)
 * @property {Rect} [mapFrom] image space window (`new Rect(0, 0, 1, 1)`)
 * @property {boolean} [repeat] `true` will tile the image. Only works with
 * images that are square whose number of side pixels is a power of 2 (`false`)
 * @property {() => void} [onLoad] textures are loaded asynchronously, so this
 * callback can be used to execute code after the texture is loaded. At a
 * minimum, any custom function here should include a call to animate the next
 * frame (`diagram.animateNextFrame`)
 */
export type OBJ_Texture = {
  src?: string,
  mapTo?: Rect,
  mapFrom?: Rect,
  repeat?: boolean,
  onLoad?: () => void,
}

/**
 * Polyline shape options object
 *
 * ![](./assets1/polyline.png)
 *
 * A polyline is a series of lines that are connected end to end. It is defined
 * by a series of points which are the ends and corners of the polyline.
 *
 * The series of points is a zero width ideal polyline, and so to see it we must
 * give it some width. This width can either be grown on one side of the
 * ideal polyline or grown on both sides of it equally.
 *
 * Here we define a line's side as either the *positive* side, or *negative*
 * side. If a line is defined from p1 to p2, then the *positive* side is the
 * side where the line moves if it is rotated around p1 in the positive (counter
 * clockwise) direction. Thus the order of the points that define the line
 * defines which side is positive and negative. A polyline is made up of many
 * lines end to end, and thus itself will have a positive and negative side
 * dependent on the order of points.
 *
 * Each point, or line connection, creates a corner that will have an *inside*
 * angle (<180º) and an *outside* angle (>180º or reflex angle).
 *
 * Growing width on an outside corner can be challenging. As the corner becomes
 * sharper, the outside width joins at a point further and further from the
 * ideal corner. Eventually trucating the corner makes more visual sense
 * and therefore, a minimum angle (`minAutoCornerAngle`) is used to
 * specify when the corner should be drawn, and when it should be truncated.
 *
 *
 * @property {Array<TypeParsablePoint>} points
 * @property {number} [width] (`0.01`)
 * @property {boolean} [close] close the polyline on itself (`false`)
 * @property {'mid' | 'outside' | 'inside' | 'positive' | 'negative'} [widthIs]
 * defines how the width is grown from the polyline's points.
 * Only `"mid"` is fully compatible with all options in
 * `cornerStyle` and `dash`. (`"mid"`)
 * @property {'auto' | 'none' | 'radius' | 'fill'} [cornerStyle] - `"auto"`:
 * sharp corners sharp when angle is less than `minAutoCornerAngle`, `"none"`: no
 * corners, `"radius"`: curved corners, `"fill"`: fills the gapes between the line
 * ends, (`"auto"`)
 * @property {number} [cornerSize] only used when `cornerStyle` = `radius` (`0.01`)
 * @property {number} [cornerSides] number of sides in curve - only used when
 *  `cornerStyle` = `radius` (`10`)
 * @property {boolean} [cornersOnly] draw only the corners with size `cornerSize` (`false`)
 * @property {number} [cornerLength] use only with `cornersOnly` = `true` -
 * length of corner to draw (`0.1`)
 * @property {number} [minAutoCornerAngle] see `cornerStyle` = `auto` (`π/7`)
 * @property {Array<number>} [dash] leave empty for solid line - use array of
 * numbers for dash line where first number is length of line, second number is
 * length of gap and then the pattern repeats - can use more than one dash length
 * and gap  - e.g. [0.1, 0.01, 0.02, 0.01] produces a lines with a long dash,
 * short gap, short dash, short gap and then repeats.
 * @property {Array<number>} [color] (`[1, 0, 0, 1]`)
 * @property {OBJ_Texture} [texture] Override color with a texture
 * @property {number} [pulse] set the default pulse scale
 * @property {Point} [position] convenience to override Transform translation
 * @property {Transform} [transform] (`Transform('polyline').standard()`)
 * @example
 * // Line
 * diagram.addElement(
 *   {
 *     name: 'p',
 *     method: 'shapes.polyline',
 *     options: {
 *       points: [[-0.5, -0.5], [-0.1, 0.5], [0.3, -0.2], [0.5, 0.5]],
 *       width: 0.05,
 *   },
 * );
 *
 * @example
 * // Square with rounded corners and dot-dash line
 * diagram.addElement(
 *   {
 *     name: 'p',
 *     method: 'shapes.polyline',
 *     options: {
 *       points: [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]],
 *       width: 0.05,
 *       dash: [0.17, 0.05, 0.05, 0.05],
 *       close: true,
 *       cornerStyle: 'radius',
 *       cornerSize: 0.1,
 *     },
 *   },
 * );
 * @example
 * // Corners only of a triangle
 * diagram.addElement(
 *  {
 *    name: 'p',
 *    method: 'shapes.polyline',
 *    options: {
 *      points: [[-0.5, -0.5], [0.5, -0.5], [0, 0.5]],
 *      width: 0.05,
 *      close: true,
 *      cornersOnly: true,
 *      cornerLength: 0.2,
 *    },
 *  },
 *);
 */
export type OBJ_Polyline = {
  points: Array<TypeParsablePoint>,
  width?: number,
  close?: boolean,
  widthIs?: 'mid' | 'outside' | 'inside' | 'positive' | 'negative',
  cornerStyle?: 'auto' | 'none' | 'radius' | 'fill',
  cornerSize?: number,
  cornerSides?: number,
  cornersOnly?: boolean,
  cornerLength?: number,
  forceCornerLength?: boolean,
  minAutoCornerAngle?: number,
  dash?: Array<number>,
  color?: Array<number>,
  texture?: OBJ_Texture,
  pulse?: number,
  position?: ?Point,
  transform?: Transform,
};

export type TypeTextOptions = {
  text?: string;
  transform?: Transform;
  position?: Point;
  offset?: Point;
  font?: DiagramFont;
  family?: string;
  style?: string;
  size?: number;
  weight?: string;
  xAlign?: string;
  yAlign?: string;
  color?: Array<number>;
  pulse?: number;
  mods?: {},
};

export type TypeGridOptions = {
  bounds?: Rect,
  xStep?: number,
  yStep?: number,
  numLinesThick?: number,
  color?: Array<number>,
  position?: Point,
  transform?: Transform,
  pulse?: number,
};

export type TypeRepeatPatternVertex = {
  element?: DiagramElementPrimitive,
  xNum?: number,
  yNum?: number,
  xStep?: number,
  yStep?: number,
  pulse?: number;
  position?: Point,
  transform?: Transform,
};

function parsePoints(
  options: Object,
  keysToParsePointsOrPointArrays: Array<string>,
) {
  const parseKey = (key) => {
    const value = options[key];
    if (value == null) {
      return;
    }
    if (Array.isArray(value) && !(typeof value[0] === 'number')) {
      // eslint-disable-next-line no-param-reassign
      options[key] = value.map(p => getPoint(p));
    } else {
      // eslint-disable-next-line no-param-reassign
      options[key] = getPoint(value);
    }
  };

  if (typeof keysToParsePointsOrPointArrays === 'string') {
    parseKey(keysToParsePointsOrPointArrays);
  } else {
    keysToParsePointsOrPointArrays.forEach(key => parseKey(key));
  }
}

function processOptions(...optionsIn: Array<Object>) {
  const options = joinObjects({}, ...optionsIn);
  if (options.position != null) {
    const p = getPoint(options.position);
    if (options.transform == null) {
      options.transform = new Transform('processOptions').translate(0, 0);
    }
    options.transform.updateTranslation(p);
  }
  return options;
}

export default class DiagramPrimitives {
  webgl: Array<WebGLInstance>;
  draw2D: Array<DrawContext2D>;
  htmlCanvas: HTMLElement;
  limits: Rect;
  spaceTransforms: TypeSpaceTransforms;
  animateNextFrame: Function;
  draw2DFigures: Object;

  constructor(
    webgl: Array<WebGLInstance> | WebGLInstance,
    draw2D: Array<DrawContext2D> | DrawContext2D,
    // draw2DFigures: Object,
    htmlCanvas: HTMLElement,
    limits: Rect,
    spaceTransforms: TypeSpaceTransforms,
    animateNextFrame: Function,
  ) {
    if (Array.isArray(webgl)) {
      this.webgl = webgl;
    } else {
      this.webgl = [webgl];
    }
    // this.webgl = webgl;
    if (Array.isArray(draw2D)) {
      this.draw2D = draw2D;
    } else {
      this.draw2D = [draw2D];
    }
    this.htmlCanvas = htmlCanvas;
    this.limits = limits;
    this.animateNextFrame = animateNextFrame;
    this.spaceTransforms = spaceTransforms;
    // this.draw2DFigures = draw2DFigures;
  }

  generic(...optionsIn: Array<{
    points?: Array<TypeParsablePoint> | Array<Point>,
    border?: Array<Array<TypeParsablePoint>> | Array<Array<Point>>,
    holeBorder?: Array<Array<TypeParsablePoint>> | Array<Array<Point>>,
    drawType?: 'triangles' | 'strip' | 'fan' | 'lines',
    color?: Array<number>,
    texture?: {
      src?: string,
      mapTo?: Rect,
      mapFrom?: Rect,
      repeat?: boolean,
      onLoad?: () => void,
    },
    position?: TypeParsablePoint,
    transform?: Transform,
    pulse?: number,
  }>) {
    const defaultOptions = {
      points: [],
      border: null,
      holeBorder: null,
      drawType: 'triangles',
      color: [1, 0, 0, 1],
      transform: new Transform('generic').standard(),
      position: null,
      texture: {
        src: '',
        mapTo: new Rect(-1, -1, 2, 2),
        mapFrom: new Rect(0, 0, 1, 1),
        repeat: false,
        onLoad: this.animateNextFrame,
      },
    };

    const options = joinObjects(defaultOptions, ...optionsIn);

    if (options.position != null) {
      const p = getPoint(options.position);
      options.transform.updateTranslation(p);
    }
    const parsedPoints = options.points.map(p => getPoint(p));
    const parseBorder = (borders) => {
      if (borders == null) {
        return null;
      }
      const borderOut = [];
      borders.forEach((b) => {
        if (Array.isArray(b)) {
          borderOut.push(b.map(bElement => getPoint(bElement)));
        }
      });
      return borderOut;
    };
    const parsedBorder = parseBorder(options.border);
    const parsedBorderHoles = parseBorder(options.borderHoles);
    // console.log(parsedPoints)
    const element = Generic(
      this.webgl,
      parsedPoints,
      parsedBorder,
      parsedBorderHoles,
      options.drawType,
      options.color,
      options.transform,
      this.limits,
      options.texture.src,
      options.texture.mapTo,
      options.texture.mapFrom,
      options.texture.repeat,
      options.texture.onLoad,
    );

    if (options.pulse != null) {
      if (typeof element.pulseDefault !== 'function') {
        element.pulseDefault.scale = options.pulse;
      }
    }

    return element;
  }

  polyline(...optionsIn: Array<OBJ_Polyline>) {
    const defaultOptions = {
      width: 0.01,
      color: [1, 0, 0, 1],
      close: false,
      widthIs: 'mid',
      cornerStyle: 'auto',
      cornerSize: 0.01,
      cornerSides: 10,
      cornersOnly: false,
      cornerLength: 0.1,
      // forceCornerLength: false,
      minAutoCornerAngle: Math.PI / 7,
      dash: [],
      transform: new Transform('polyline').standard(),
    };
    const options = processOptions(defaultOptions, ...optionsIn);
    parsePoints(options, ['points']);

    let getTris;
    if (options.cornersOnly) {
      getTris = points => makePolyLineCorners(
        points,
        options.width,
        options.close,
        options.cornerLength,
        // options.forceCornerLength,
        options.widthIs,
        options.cornerStyle,
        options.cornerSize,
        options.cornerSides,
        options.minAutoCornerAngle,
      );
    } else {
      getTris = points => makePolyLine(
        points,
        options.width,
        options.close,
        options.widthIs,
        options.cornerStyle,
        options.cornerSize,
        options.cornerSides,
        options.minAutoCornerAngle,
        options.dash,
      );
    }
    const [triangles, borders, holes] = getTris(options.points);
    // const element = Generic(
    //   this.webgl,
    //   triangles,
    //   borders,
    //   holes,
    //   'triangles',
    //   options.color,
    //   options.transform,
    //   this.limits,
    //   options.textureLocation,
    //   options.textureVertexSpace,
    //   options.textureCoords,
    // );
    const element = this.generic(options, {
      drawType: 'triangles',
      points: triangles,
      border: borders,
      holeBorder: holes,
    });

    element.custom.updatePoints = (points) => {
      element.drawingObject.change(...getTris(points));
    };

    if (options.pulse != null) {
      if (typeof element.pulseDefault !== 'function') {
        element.pulseDefault.scale = options.pulse;
      }
    }

    return element;
  }

  fan(...optionsIn: Array<{
    points?: Array<Point>,
    color?: Array<number>,
    transform?: Transform,
    position?: Point,
    pulse?: number,
    mods?: {},
  }>) {
    const defaultOptions = {
      points: [],
      color: [1, 0, 0, 1],
      transform: new Transform('fan').standard(),
      position: null,
    };
    const options = Object.assign({}, defaultOptions, ...optionsIn);

    if (options.position != null) {
      const p = getPoint(options.position);
      options.transform.updateTranslation(p);
    }

    const element = Fan(
      this.webgl,
      options.points.map(p => getPoint(p)),
      options.color,
      options.transform,
      this.limits,
    );

    if (options.pulse != null) {
      if (typeof element.pulseDefault !== 'function') {
        element.pulseDefault.scale = options.pulse;
      }
    }

    if (options.mods != null && options.mods !== {}) {
      element.setProperties(options.mods);
    }

    return element;
  }

  textGL(options: Object) {
    return Text(
      this.webgl,
      this.limits,
      options,
    );
  }

  text(textOrOptions: string | TypeTextOptions, ...optionsIn: Array<TypeTextOptions>) {
    const defaultOptions = {
      text: '',
      // position: new Point(0, 0),
      font: null,
      family: 'Times New Roman',
      style: 'italic',
      size: 0.2,
      weight: '200',
      xAlign: 'center',
      yAlign: 'middle',
      offset: new Point(0, 0),    // vertex space offset
      color: [1, 0, 0, 1],
      transform: new Transform('text').standard(),
      // draw2D: this.draw2D,
    };
    let options;
    if (typeof textOrOptions === 'string') {
      options = joinObjects(
        {}, defaultOptions, { text: textOrOptions }, ...optionsIn,
      );
    } else {
      options = joinObjects({}, defaultOptions, textOrOptions, ...optionsIn);
    }

    if (options.position != null) {
      const p = getPoint(options.position);
      options.transform.updateTranslation(p);
    }

    const o = options;
    const { text } = o;
    let fontToUse = o.font;
    if (fontToUse === null) {
      fontToUse = new DiagramFont(
        o.family, o.style, o.size, o.weight, o.xAlign, o.yAlign, o.color,
      );
    }
    const dT = new DiagramText(o.offset, text, fontToUse);
    const to = new TextObject(this.draw2D, [dT]);
    const element = new DiagramElementPrimitive(
      to,
      o.transform,
      o.color,
      this.limits,
    );

    if (options.pulse != null) {
      if (typeof element.pulseDefault !== 'function') {
        element.pulseDefault.scale = options.pulse;
      }
    }

    if (options.mods != null && options.mods !== {}) {
      element.setProperties(options.mods);
    }

    return element;
  }

  arrow(...optionsIn: Array<{
    width?: number;
    legWidth?: number;
    height?: number;
    legHeight?: number;
    color?: Array<number>;
    transform?: Transform;
    position?: Point;
    tip?: Point;
    rotation?: number;
    pulse?: number,
    mods?: {},
  }>) {
    const defaultOptions = {
      width: 0.5,
      legWidth: 0,
      height: 0.5,
      legHeight: 0,
      color: [1, 0, 0, 1],
      transform: new Transform('arrow').standard(),
      tip: new Point(0, 0),
      rotation: 0,
    };
    const options = Object.assign({}, defaultOptions, ...optionsIn);

    if (options.position != null) {
      const p = getPoint(options.position);
      options.transform.updateTranslation(p);
    }
    const element = new Arrow(
      this.webgl,
      options.width,
      options.legWidth,
      options.height,
      options.legHeight,
      getPoint(options.tip),
      options.rotation,
      options.color,
      options.transform,
      this.limits,
    );

    if (options.pulse != null) {
      if (typeof element.pulseDefault !== 'function') {
        element.pulseDefault.scale = options.pulse;
      }
    }

    if (options.mods != null && options.mods !== {}) {
      element.setProperties(options.mods);
    }

    return element;
  }

  // arrowLegacy(
  //   width: number = 1,
  //   legWidth: number = 0.5,
  //   height: number = 1,
  //   legHeight: number = 0.5,
  //   color: Array<number>,
  //   transform: Transform | Point = new Transform(),
  //   tip: Point = new Point(0, 0),
  //   rotation: number = 0,
  // ) {
  //   return Arrow(
  //     this.webgl, width, legWidth, height, legHeight,
  //     tip, rotation, color, transform, this.limits,
  //   );
  // }

  // textLegacy(
  //   textInput: string,
  //   location: Point,
  //   color: Array<number>,
  //   fontInput: DiagramFont | null = null,
  // ) {
  //   let font = new DiagramFont(
  //     'Times New Roman',
  //     'italic',
  //     0.2,
  //     '200',
  //     'center',
  //     'middle',
  //     color,
  //   );
  //   if (fontInput !== null) {
  //     font = fontInput;
  //   }
  //   const dT = new DiagramText(new Point(0, 0), textInput, font);
  //   const to = new TextObject(this.draw2D, [dT]);
  //   return new DiagramElementPrimitive(
  //     to,
  //     new Transform().scale(1, 1).translate(location.x, location.y),
  //     color,
  //     this.limits,
  //   );
  // }

  htmlElement(
    elementToAdd: HTMLElement | Array<HTMLElement>,
    id: string = `id__temp_${Math.round(Math.random() * 10000)}`,
    classes: string = '',
    location: Point = new Point(0, 0),
    yAlign: 'top' | 'bottom' | 'middle' = 'middle',
    xAlign: 'left' | 'right' | 'center' = 'left',
  ) {
    const element = document.createElement('div');
    if (classes && element) {
      const classArray = classes.split(' ');
      classArray.forEach(c => element.classList.add(c.trim()));
    }
    if (Array.isArray(elementToAdd)) {
      elementToAdd.forEach(e => element.appendChild(e));
    } else {
      element.appendChild(elementToAdd);
    }
    element.style.position = 'absolute';
    element.setAttribute('id', id);
    this.htmlCanvas.appendChild(element);
    const hT = new HTMLObject(this.htmlCanvas, id, new Point(0, 0), yAlign, xAlign);
    const diagramElement = new DiagramElementPrimitive(
      hT,
      new Transform().scale(1, 1).translate(location.x, location.y),
      [1, 1, 1, 1],
      this.limits,
    );
    // console.log('html', diagramElement.transform.mat, location)
    // diagramElement.setFirstTransform();
    return diagramElement;
  }

  // htmlText(
  //   textInput: string,
  //   id: string = generateUniqueId('id__html_text_'),
  //   classes: string = '',
  //   location: Point = new Point(0, 0),
  //   yAlign: 'top' | 'bottom' | 'middle' = 'middle',
  //   xAlign: 'left' | 'right' | 'center' = 'left',
  // ) {
  //   // const inside = document.createTextNode(textInput);
  //   const inside = document.createElement('div');
  //   inside.innerHTML = textInput;
  //   return this.htmlElement(inside, id, classes, location, yAlign, xAlign);
  // }

  htmlImage(...optionsIn: Array<{
    id?: string,
    classes?: string,
    position?: Point,
    yAlign?: 'top' | 'bottom' | 'middle',
    xAlign?: 'left' | 'right' | 'center',
    src?: string,
    color?: Array<number>,
    pulse?: number,
  }>) {
    const defaultOptions = {
      id: generateUniqueId('id__html_image_'),
      classes: '',
      position: new Point(0, 0),
      yAlign: 'middle',
      xAlign: 'left',
      src: '',
      // color: [1, 0, 0, 1],
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    const image = document.createElement('img');
    image.src = options.src;

    // setHTML(inside, options.text, options.modifiers);
    const {
      id, classes, position, yAlign, xAlign,
    } = options;
    const element = this.htmlElement(image, id, classes, getPoint(position), yAlign, xAlign);
    if (options.color != null) {
      element.setColor(options.color);
    }
    if (options.pulse != null) {
      if (typeof element.pulseDefault !== 'function') {
        element.pulseDefault.scale = options.pulse;
      }
    }
    return element;
  }

  htmlText(...optionsIn: Array<{
    textInput?: string,
    id?: string,
    classes?: string,
    position?: Point,
    yAlign?: 'top' | 'bottom' | 'middle',
    xAlign?: 'left' | 'right' | 'center',
    modifiers: Object;
    color?: Array<number>,
    pulse?: number,
  }>) {
    const defaultOptions = {
      text: '',
      id: generateUniqueId('id__html_text_'),
      classes: '',
      position: new Point(0, 0),
      yAlign: 'middle',
      xAlign: 'left',
      // color: [1, 0, 0, 1],
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    const inside = document.createElement('div');
    // const htmlText = toHTML(options.textInput, '', '', options.color);
    // console.log(options.textInput, htmlText)
    setHTML(inside, options.text, options.modifiers);
    const {
      id, classes, position, yAlign, xAlign,
    } = options;
    const element = this.htmlElement(inside, id, classes, getPoint(position), yAlign, xAlign);
    if (options.color != null) {
      element.setColor(options.color);
    }
    if (options.pulse != null) {
      if (typeof element.pulseDefault !== 'function') {
        element.pulseDefault.scale = options.pulse;
      }
    }
    return element;
  }

  lines(
    linePairs: Array<Array<Point>>,
    numLinesThick: number = 1,
    color: Array<number>,
    transform: Transform | Point = new Transform(),
  ) {
    return Lines(this.webgl, linePairs, numLinesThick, color, transform, this.limits);
  }

  grid(...optionsIn: Array<TypeGridOptions>) {
    const defaultOptions = {
      bounds: new Rect(-1, -1, 2, 2),
      xStep: 0.1,
      yStep: 0.1,
      xOffset: 0,
      yOffset: 0,
      numLinesThick: 1,
      color: [1, 0, 0, 1],
      position: null,
      transform: new Transform('grid').standard(),
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      const point = getPoint(options.position);
      options.transform.updateTranslation(point);
    }
    const linePairs = [];
    // const xLimit = tools.roundNum(bounds.righ + xStep);
    const {
      bounds, xStep, xOffset, yStep, yOffset, color, numLinesThick, transform,
    } = options;
    if (options.xStep !== 0) {
      for (let x = bounds.left + xOffset; tools.roundNum(x, 8) <= bounds.right; x += xStep) {
        linePairs.push([new Point(x, bounds.top), new Point(x, bounds.bottom)]);
      }
    }
    if (yStep !== 0) {
      for (let y = bounds.bottom + yOffset; tools.roundNum(y, 8) <= bounds.top; y += yStep) {
        linePairs.push([new Point(bounds.left, y), new Point(bounds.right, y)]);
      }
    }
    const element = this.lines(linePairs, numLinesThick, color, transform);
    if (options.pulse != null && typeof element.pulseDefault !== 'function') {
      element.pulseDefault.scale = options.pulse;
    }
    return element;
  }

  polygon(...optionsIn: Array<OBJ_Polygon>) {
    const defaultOptions = {
      sides: 4,
      radius: 1,
      width: 0.01,
      rotation: 0,
      clockwise: false,
      sidesToDraw: null,
      color: [1, 0, 0, 1],
      fill: false,
      textureLocation: '',        // If including a texture, make sure to use
      textureCoords: new Rect(0, 0, 1, 1),  // correct shader in diagram
      onLoad: this.animateNextFrame,
      mods: {},
      transform: new Transform('polygon').standard(),
      position: null,
      center: new Point(0, 0),
      trianglePrimitives: false,
      linePrimitives: false,
      angleToDraw: null,
    };
    const options = Object.assign({}, defaultOptions, ...optionsIn);
    // const o = optionsToUse;
    // let { transform } = options;
    // if (transform == null) {
    //   transform = new Transform('polygon').scale(1, 1).rotate(0).translate(0, 0);
    // }
    if (options.position != null) {
      const point = getPoint(options.position);
      options.transform.updateTranslation(point);
    }
    if (options.center != null) {
      options.center = getPoint(options.center);
    }
    if (options.sidesToDraw == null) {
      options.sidesToDraw = options.sides;
    }
    if (options.angleToDraw != null) {
      options.sidesToDraw = Math.max(
        0, Math.floor(options.angleToDraw / Math.PI / 2 * options.sides),
      );
    }

    let direction = 1;
    if (options.clockwise) {
      direction = -1;
    }
    let element;
    if (options.linePrimitives) {
      element = PolygonLine(
        this.webgl,
        options.sides,
        options.radius,
        options.rotation,
        direction,
        options.sidesToDraw,
        options.width,
        options.color,
        options.transform,
        this.limits,
      );
    } else if (options.fill) {
      element = PolygonFilled(
        this.webgl,
        options.sides,
        options.radius,
        options.rotation,
        direction,
        options.sidesToDraw,
        options.center,
        options.color,
        options.transform,
        this.limits,
        options.textureLocation,
        options.textureCoords,
        options.onLoad,
      );
    } else {
      element = Polygon(
        this.webgl,
        options.sides,
        options.radius,
        options.width,
        options.rotation,
        direction,
        options.sidesToDraw,
        options.center,
        options.color,
        options.transform,
        this.limits,
        options.trianglePrimitives,
      );
    }

    if (options.pulse != null && typeof element.pulseDefault !== 'function') {
      element.pulseDefault.scale = options.pulse;
    }

    if (options.mods != null && options.mods !== {}) {
      element.setProperties(options.mods);
    }
    return element;
  }

  polygonLine(
    numSides: number,
    radius: number,
    rotation: number,
    direction: -1 | 1,
    numSidesToDraw: number,
    numLines: number,     // equivalent to thickness - integer
    color: Array<number>,
    transform: Transform | Point = new Transform(),
  ) {
    return PolygonLine(
      this.webgl, numSides, radius,
      rotation, direction, numSidesToDraw, numLines, color, transform, this.limits,
    );
  }

  horizontalLine(
    start: Point,
    length: number,
    width: number,
    rotation: number,
    color: Array<number>,
    transform: Transform | Point = new Transform(),
  ) {
    return HorizontalLine(
      this.webgl, start, length, width,
      rotation, color, transform, this.limits,
    );
  }

  dashedLine(...optionsIn: Array<{
    start?: Point,
    length?: number,
    width?: number,
    rotation?: number,
    dashStyle?: Array<number>,
    color?: Array<number>,
    transform?: Transform,
    position?: Point,
    pulse?: number,
  }>) {
    const defaultOptions = {
      start: [0, 0],
      length: 1,
      width: 0.01,
      rotation: 0,
      dashStyle: [0.1, 0.1],
      transform: new Transform('dashedLine').scale(1, 1).rotate(0).translate(0, 0),
      position: null,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }
    const element = DashedLine(
      this.webgl, getPoint(options.start), options.length, options.width,
      options.rotation, options.dashStyle, options.color,
      options.transform, this.limits,
    );
    if (options.pulse != null && typeof element.pulseDefault !== 'function') {
      element.pulseDefault.scale = options.pulse;
    }
    return element;
  }

  // dashedLine(
  //   start: Point,
  //   length: number,
  //   width: number,
  //   rotation: number,
  //   dashStyle: Array<number>,
  //   color: Array<number>,
  //   transform: Transform | Point = new Transform(),
  // ) {
  //   return DashedLine(
  //     this.webgl, start, length, width,
  //     rotation, dashStyle, color, transform, this.limits,
  //   );
  // }

  rectangle(...optionsIn: Array<OBJ_Rectangle>) {
    const defaultOptions = {
      yAlign: 'middle',
      xAlign: 'center',
      width: 1,
      height: 1,
      lineWidth: 0.01,
      corner: {
        radius: 0,
        sides: 1,
      },
      fill: false,
      color: [1, 0, 0, 1],
      transform: new Transform('rectangle').scale(1, 1).rotate(0).translate(0, 0),
      position: null,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }
    if (typeof options.reference !== 'string') {
      options.reference = getPoint(options.reference);
    }
    let element;
    if (options.fill) {
      element = RectangleFilled(
        this.webgl, options.xAlign, options.yAlign, options.width, options.height,
        options.corner.radius, options.corner.sides, options.color, options.transform, this.limits,
      );
    } else {
      element = Rectangle(
        this.webgl, options.xAlign, options.yAlign, options.width,
        options.height, options.lineWidth, options.corner.radius,
        options.corner.sides, options.color, options.transform, this.limits,
      );
    }

    if (options.pulse != null && typeof element.pulseDefault !== 'function') {
      element.pulseDefault.scale = options.pulse;
    }
    return element;
  }

  box(...optionsIn: Array<{
    width?: number,
    height?: number,
    fill?: boolean,
    lineWidth?: number,
    colors?: Array<number>,
    transform?: Transform,
    position?: TypeParsablePoint,
    pulse?: number,
  }>) {
    const defaultOptions = {
      width: 1,
      height: 1,
      fill: false,
      lineWidth: 0.01,
      color: [1, 0, 0, 1],
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
      position: null,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }
    if (typeof options.reference !== 'string') {
      options.reference = getPoint(options.reference);
    }
    const element = Box(
      this.webgl, options.width, options.height, options.lineWidth,
      options.fill, options.color, options.transform, this.limits,
    );
    if (options.pulse != null && typeof element.pulseDefault !== 'function') {
      element.pulseDefault.scale = options.pulse;
    }
    return element;
  }

  radialLines(...optionsIn: Array<{
    innerRadius?: number,
    outerRadius?: number,
    width?: number,
    dAngle?: number,
    angle?: number,
    color?: Array<number>,
    transform?: Transform,
    position?: Point,
    pulse?: number,
  }>) {
    const defaultOptions = {
      innerRadius: 0,
      outerRadius: 1,
      width: 0.05,
      dAngle: Math.PI / 4,
      angle: Math.PI * 2,
      transform: new Transform().standard(),
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }
    const element = RadialLines(
      this.webgl, options.innerRadius, options.outerRadius,
      options.width, options.dAngle, options.angle, options.color,
      options.transform, this.limits,
    );

    if (options.pulse != null && typeof element.pulseDefault !== 'function') {
      element.pulseDefault.scale = options.pulse;
    }

    return element;
  }

  repeatPatternVertex(...optionsIn: Array<TypeRepeatPatternVertex>) {
    const defaultOptions = {
      element: null,
      xNum: 2,
      yNum: 2,
      xStep: 1,
      yStep: 1,
      transform: new Transform('repeatPattern').standard(),
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }
    const {
      element, transform, xNum, yNum, xStep, yStep,
    } = options;
    if (element == null) {
      return this.collection();
    }
    const copy = element._dup();
    const { drawingObject } = element;
    // console.log(element.drawingObject.points)
    if (drawingObject instanceof VertexObject) {
      copy.transform = transform._dup();
      const newPoints = [];
      const { points } = drawingObject;
      for (let x = 0; x < xNum; x += 1) {
        for (let y = 0; y < yNum; y += 1) {
          for (let p = 0; p < points.length; p += 2) {
            newPoints.push(new Point(
              points[p] + x * xStep,
              points[p + 1] + y * yStep,
            ));
            // console.log(points[p], points[p+1], newPoints.slice(-1))
          }
        }
      }
      // console.log(newPoints)
      copy.drawingObject.changeVertices(newPoints);
    }
    if (options.pulse != null && typeof element.pulseDefault !== 'function') {
      copy.pulseDefault.scale = options.pulse;
    }
    return copy;
  }

  collection(
    transformOrPointOrOptions: Transform | Point | {
      transform?: Transform,
      position?: Point,
      color?: Array<number>,
      pulse?: number,
    } = {},
    ...moreOptions: Array<{
      transform?: Transform,
      position?: Point,
      color?: Array<number>,
      pulse?: number,
    }>
  ) {
    let transform = new Transform('collection').scale(1, 1).rotate(0).translate(0, 0);
    let color = [1, 0, 0, 1];
    let pulse = null;
    if (transformOrPointOrOptions instanceof Point) {
      transform.updateTranslation(transformOrPointOrOptions);
    } else if (transformOrPointOrOptions instanceof Transform) {
      transform = transformOrPointOrOptions._dup();
    } else {
      const optionsToUse = joinObjects(transformOrPointOrOptions, ...moreOptions);
      if (optionsToUse.transform != null) {
        ({ transform } = optionsToUse);
      }
      if (optionsToUse.position != null) {
        transform.updateTranslation(getPoint(optionsToUse.position));
      }
      if (optionsToUse.color != null) {
        ({ color } = optionsToUse);
      }
      if (optionsToUse.pulse != null) {
        ({ pulse } = optionsToUse);
      }
    }
    const element = new DiagramElementCollection(transform, this.limits);
    element.setColor(color);
    if (pulse != null && typeof element.pulseDefault !== 'function') {
      element.pulseDefault.scale = pulse;
    }
    return element;
  }

  repeatPattern(
    element: DiagramElementPrimitive,
    xNum: number,
    yNum: number,
    xStep: number,
    yStep: number,
    transform: Transform | Point = new Transform(),
  ) {
    let group;
    if (transform instanceof Transform) {
      group = this.collection({ transform });
    } else {
      group = this.collection({ transform: new Transform().translate(transform) });
    }
    let t = element.transform.t();
    let transformToUse = element.transform._dup();
    if (t === null) {
      t = new Point(0, 0);
      transformToUse = transformToUse.translate(0, 0);
    }
    if (t) {
      for (let x = 0; x < xNum; x += 1) {
        for (let y = 0; y < yNum; y += 1) {
          const copy = element._dup();
          copy.transform = transformToUse._dup();
          copy.transform.updateTranslation(t.x + xStep * x, t.y + yStep * y);
          group.add(`xy${x}${y}`, copy);
        }
      }
    }
    return group;
  }

  // eslint-disable-next-line class-methods-use-this
  repeatPatternVertexLegacy(
    element: DiagramElementPrimitive,
    xNum: number,
    yNum: number,
    xStep: number,
    yStep: number,
    transform: Transform | Point = new Transform(),
  ) {
    const copy = element._dup();
    const { drawingObject } = element;
    // console.log(element.drawingObject.points)
    if (drawingObject instanceof VertexObject) {
      copy.transform = transform._dup();
      const newPoints = [];
      const { points } = drawingObject;
      for (let x = 0; x < xNum; x += 1) {
        for (let y = 0; y < yNum; y += 1) {
          for (let p = 0; p < points.length; p += 2) {
            newPoints.push(new Point(
              points[p] + x * xStep,
              points[p + 1] + y * yStep,
            ));
            // console.log(points[p], points[p+1], newPoints.slice(-1))
          }
        }
      }
      // console.log(newPoints)
      copy.drawingObject.changeVertices(newPoints);
    }
    return copy;
  }

  axes(...optionsIn: Array<{
    width?: number,
    height?: number,
    limits?: Rect,
    yAxisLocation?: number,
    xAxisLocation?: number,
    stepX?: number,
    stepY?: number,
    fontSize?: number,
    showGrid?: boolean,
    color?: Array<number>,
    fontColor?: Array<number>,
    gridColor?: Array<number>,
    location?: Transform | Point,
    decimalPlaces?: number,
    lineWidth?: number,
    pulse?: number,
  }>) {
    const defaultOptions = {
      width: 1,
      height: 1,
      limits: new Rect(-1, -1, 2, 2),
      yAxisLocation: 0,
      xAxisLocation: 0,
      stepX: 0.1,
      stepY: 0.1,
      fontSize: 0.13,
      showGrid: true,
      color: [1, 1, 1, 0],
      location: new Transform(),
      decimalPlaces: 1,
      lineWidth: 0.01,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);

    if (options.fontColor == null) {
      options.fontColor = options.color.slice();
    }
    if (options.gridColor == null) {
      options.gridColor = options.color.slice();
    }

    const {
      width, lineWidth, limits, color, stepX, decimalPlaces,
      yAxisLocation, xAxisLocation, fontSize, height, stepY,
      location, showGrid, gridColor, fontColor,
    } = options;

    const xProps = new AxisProperties('x', 0);

    xProps.minorTicks.mode = 'off';
    xProps.minorGrid.mode = 'off';
    xProps.majorGrid.mode = 'off';

    xProps.length = width;
    xProps.width = lineWidth;
    xProps.limits = { min: limits.left, max: limits.right };
    xProps.color = color.slice();
    xProps.title = '';

    xProps.majorTicks.start = limits.left;
    xProps.majorTicks.step = stepX;
    xProps.majorTicks.length = lineWidth * 5;
    xProps.majorTicks.offset = -xProps.majorTicks.length / 2;
    xProps.majorTicks.width = lineWidth * 2;
    xProps.majorTicks.labelMode = 'off';
    xProps.majorTicks.color = color.slice();
    xProps.majorTicks.labels = tools.range(
      xProps.limits.min,
      xProps.limits.max,
      stepX,
    ).map(v => v.toFixed(decimalPlaces)).map((v) => {
      if (v === yAxisLocation.toString() && yAxisLocation === xAxisLocation) {
        return `${v}     `;
      }
      return v;
    });

    // xProps.majorTicks.labels[xProps.majorTicks.labels / 2] = '   0';
    xProps.majorTicks.labelOffset = new Point(
      0,
      xProps.majorTicks.offset - fontSize * 0.1,
    );
    xProps.majorTicks.labelsHAlign = 'center';
    xProps.majorTicks.labelsVAlign = 'top';
    xProps.majorTicks.fontColor = fontColor.slice();
    xProps.majorTicks.fontSize = fontSize;
    xProps.majorTicks.fontWeight = '400';

    const xAxis = new Axis(
      this.webgl, this.draw2D, xProps,
      new Transform().scale(1, 1).rotate(0)
        .translate(0, xAxisLocation - limits.bottom * height / 2),
      this.limits,
    );

    const yProps = new AxisProperties('x', 0);
    yProps.minorTicks.mode = 'off';
    yProps.minorGrid.mode = 'off';
    yProps.majorGrid.mode = 'off';

    yProps.length = height;
    yProps.width = xProps.width;
    yProps.limits = { min: limits.bottom, max: limits.top };
    yProps.color = xProps.color;
    yProps.title = '';
    yProps.rotation = Math.PI / 2;

    yProps.majorTicks.step = stepY;
    yProps.majorTicks.start = limits.bottom;
    yProps.majorTicks.length = xProps.majorTicks.length;
    yProps.majorTicks.offset = -yProps.majorTicks.length / 2;
    yProps.majorTicks.width = xProps.majorTicks.width;
    yProps.majorTicks.labelMode = 'off';
    yProps.majorTicks.color = color.slice();
    yProps.majorTicks.labels = tools.range(
      yProps.limits.min,
      yProps.limits.max,
      stepY,
    ).map(v => v.toFixed(decimalPlaces)).map((v) => {
      if (v === xAxisLocation.toString() && yAxisLocation === xAxisLocation) {
        return '';
      }
      return v;
    });

    // yProps.majorTicks.labels[3] = '';
    yProps.majorTicks.labelOffset = new Point(
      yProps.majorTicks.offset - fontSize * 0.2,
      0,
    );
    yProps.majorTicks.labelsHAlign = 'right';
    yProps.majorTicks.labelsVAlign = 'middle';
    yProps.majorTicks.fontColor = xProps.majorTicks.fontColor;
    yProps.majorTicks.fontSize = fontSize;
    yProps.majorTicks.fontWeight = xProps.majorTicks.fontWeight;

    const yAxis = new Axis(
      this.webgl, this.draw2D, yProps,
      new Transform().scale(1, 1).rotate(0)
        .translate(yAxisLocation - limits.left * width / 2, 0),
      this.limits,
    );

    let transform = new Transform();
    if (location instanceof Point) {
      transform = transform.translate(location.x, location.y);
    } else {
      transform = location._dup();
    }
    const xy = this.collection(transform);
    if (showGrid) {
      const gridLines = this.grid({
        bounds: new Rect(0, 0, width, height),
        stepX: tools.roundNum(stepX * width / limits.width, 8),
        stepY: tools.roundNum(stepY * height / limits.height, 8),
        numThickLines: 1,
        color: gridColor,
        transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
      });
      xy.add('grid', gridLines);
    }
    xy.add('y', yAxis);
    xy.add('x', xAxis);
    if (options.pulse != null && typeof xy.pulseDefault !== 'function') {
      xy.pulseDefault.scale = options.pulse;
    }
    return xy;
  }

  parallelMarks(...optionsIn: Array<{
    num?: number,
    width?: number,
    length?: number,
    angle?: number,
    step?: number,
    rotation?: number,
    color?: Array<number>,
    pulse?: number,
    transform?: Transform,
    position?: Point,
  }>) {
    const defaultOptions = {
      width: 0.01,
      num: 1,
      length: 0.1,
      angle: Math.PI / 4,
      step: 0.04,
      rotation: 0,
      color: [1, 0, 0, 1],
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
      position: null,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }

    const x = options.length * Math.cos(options.angle);
    const y = options.length * Math.sin(options.angle);
    const wx = Math.abs(options.width * Math.cos(options.angle + Math.PI / 2));
    const wy = options.width * Math.sin(options.angle + Math.PI / 2);
    const single = [
      new Point(0, 0),
      new Point(0 - x, 0 - y),
      new Point(-x - wx, -y + wy),
      new Point(-Math.abs(options.width / Math.cos(options.angle + Math.PI / 2)), 0),
      new Point(-x - wx, y - wy),
      new Point(0 - x, 0 + y),
    ];

    const collection = this.collection(
      options.transform,
    );
    collection.setColor(options.color);
    if (options.pulse != null && typeof collection.pulseDefault !== 'function') {
      collection.pulseDefault.scale = options.pulse;
    }

    const start = -((options.num - 1) / 2) * options.step;
    for (let i = 0; i < options.num; i += 1) {
      const points = single.map(
        p => (new Point(p.x + start + i * options.step, p.y)).rotate(options.rotation),
      );
      collection.add(`${i}`, this.fan({
        points,
        color: options.color,
      }));
    }
    return collection;
  }

  marks(...optionsIn: Array<{
    num?: number,
    width?: number,
    length?: number,
    angle?: number,
    step?: number,
    rotation?: number,
    color?: Array<number>,
    pulse?: number,
    transform?: Transform,
    position?: Point,
  }>) {
    const defaultOptions = {
      width: 0.01,
      num: 1,
      length: 0.2,
      angle: Math.PI / 2,
      step: 0.04,
      rotation: 0,
      color: [1, 0, 0, 1],
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
      position: null,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }

    const single = [
      new Point(options.length / 2, options.width / 2),
      new Point(options.length / 2, -options.width / 2),
      new Point(-options.length / 2, -options.width / 2),
      new Point(-options.length / 2, options.width / 2),
    ];

    const collection = this.collection(
      options.transform,
    );
    collection.setColor(options.color);
    if (options.pulse != null && typeof collection.pulseDefault !== 'function') {
      collection.pulseDefault.scale = options.pulse;
    }

    const start = -((options.num - 1) / 2) * options.step;
    for (let i = 0; i < options.num; i += 1) {
      const t = new Transform()
        .rotate(options.angle)
        .translate(start + i * options.step, 0)
        .rotate(options.rotation);

      const points = single.map(
        p => (p._dup().transformBy(t.matrix())),
      );
      collection.add(`${i}`, this.fan({
        points,
        color: options.color,
      }));
    }
    return collection;
  }
}

export type TypeDiagramPrimitives = DiagramPrimitives;
