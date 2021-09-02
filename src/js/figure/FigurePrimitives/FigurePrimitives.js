// @flow
/* eslint-disable no-param-reassign */
import {
  Rect, Point, Transform, getPoint, getRect, getTransform,
  getBorder, getPoints,
  getBoundingBorder, isBuffer, toNumbers,
  sphere, cube, cylinder, cone, revolve, surface, prism,
} from '../../tools/g2';
// import {
//   round
// } from '../../tools/math';
import type {
  TypeParsablePoint, TypeParsableBorder,
} from '../../tools/g2';
import { setHTML } from '../../tools/htmlGenerator';
// eslint-disable-next-line import/no-cycle
import {
  FigureElementPrimitive, FigureElement,
} from '../Element';
import WebGLInstance from '../webgl/webgl';
import DrawContext2D from '../DrawContext2D';
import * as tools from '../../tools/math';
import { generateUniqueId, joinObjects } from '../../tools/tools';
// eslint-disable-next-line import/no-cycle
import DrawingObject from '../DrawingObjects/DrawingObject';
// eslint-disable-next-line import/no-cycle
import GLObject from '../DrawingObjects/GLObject/GLObject';
// eslint-disable-next-line import/no-cycle
import { CustomAnimationStep } from '../Animation/Animation';
// eslint-disable-next-line import/no-cycle
import FigureElementPrimitiveMorph from './FigureElementPrimitiveMorph';
// eslint-disable-next-line import/no-cycle
// import Generic from './Generic';
import Text from './Text';
// eslint-disable-next-line import/no-cycle
import {
  TextObject, TextLineObject, TextLinesObject,
} from '../DrawingObjects/TextObject/TextObject';
// eslint-disable-next-line import/no-cycle
import HTMLObject from '../DrawingObjects/HTMLObject/HTMLObject';
// eslint-disable-next-line import/no-cycle
import { makePolyLine, makePolyLineCorners, makeFastPolyLine } from '../geometries/lines/lines';
import { getPolygonPoints, getTrisFillPolygon } from '../geometries/polygon/polygon';
import { rectangleBorderToTris, getRectangleBorder } from '../geometries/rectangle';
// eslint-disable-next-line import/no-cycle
import { ellipseBorderToTris, getEllipseBorder } from '../geometries/ellipse';
// eslint-disable-next-line import/no-cycle
import { arcBorderToTris, getArcBorder } from '../geometries/arc';
import type { OBJ_Ellipse_Defined } from '../geometries/ellipse';
import type { OBJ_Arc_Defined } from '../geometries/arc';
import { getTriangleBorder, getTriangleDirection } from '../geometries/triangle';
import type { OBJ_Triangle_Defined } from '../geometries/triangle';
// eslint-disable-next-line import/no-cycle
import { getArrow, defaultArrowOptions, getArrowTris } from '../geometries/arrow';
import getLine from '../geometries/line';
import { copyPoints, getCopyCount } from '../geometries/copy/copy';
import type { CPY_Step } from '../geometries/copy/copy';
import type {
  TypeColor, OBJ_Font,
} from '../../tools/types';
import { getBufferBorder } from '../geometries/buffer';
import type TimeKeeper from '../TimeKeeper';
import type { Recorder } from '../Recorder/Recorder';
import Scene from '../../tools/scene';
import type {
  OBJ_LineStyleSimple, OBJ_GenericGL, OBJ_Morph,
} from './FigurePrimitiveTypes';
import type {
  OBJ_Generic,
  OBJ_Polyline,
  OBJ_Polygon,
  OBJ_Polygon_Defined,
  OBJ_Star,
  OBJ_Rectangle,
  OBJ_Rectangle_Defined,
  OBJ_Ellipse,
  OBJ_Arc,
  OBJ_Triangle,
  OBJ_Line,
  OBJ_Grid,
  OBJ_Arrow,
  OBJ_TextDefinition,
  OBJ_Text,
  OBJ_TextLine,
  OBJ_TextLines,
} from './FigurePrimitiveTypes2D';
import type {
  OBJ_Generic3,
  OBJ_Sphere,
  OBJ_Cube,
  OBJ_Cylinder,
  OBJ_Cone,
  OBJ_Revolve,
  OBJ_Surface,
} from './FigurePrimitiveTypes3D';


type OBJ_PolyLineTris = OBJ_LineStyleSimple & { drawBorderBuffer: number | Array<Array<Point>> };


function parsePoints(
  options: Object,
  keysToParsePointsOrPointArrays: Array<string>,
) {
  const parseKey = (key) => {
    const value = options[key];
    if (value == null) {
      return;
    }
    if (typeof value === 'string') {
      return;
    }
    if (typeof value === 'number') {
      return;
    }
    const processArray = (a) => {
      for (let i = 0; i < a.length; i += 1) {
        if (Array.isArray(a[i]) && !(typeof a[i][0] === 'number')) {
          // eslint-disable-next-line no-param-reassign
          a[i] = processArray(a[i]);
        } else {
          // eslint-disable-next-line no-param-reassign
          a[i] = getPoint(a[i]);
        }
      }
      return a;
    };
    if (Array.isArray(value) && !(typeof value[0] === 'number')) {
      // eslint-disable-next-line no-param-reassign
      options[key] = processArray(value); // value.map(p => getPoint(p));
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

// function processOptions(...optionsIn: Array<Object>) {
//   const options = joinObjects({}, ...optionsIn);
//   if (options.position != null) {
//     const p = getPoint(options.position);
//     if (options.transform == null) {
//       options.transform = new Transform('processOptions')0, 0);
//     }
//     options.transform.updateTranslation(p);
//   }
//   return options;
// }

function setupPulse(element: FigureElement, options: Object) {
  if (options.pulse != null) {
    if (
      typeof element.pulseDefault !== 'function'
      && typeof element.pulseDefault !== 'string'
    ) {
      if (typeof options.pulse === 'number') {
        // eslint-disable-next-line no-param-reassign
        element.pulseDefault.scale = options.pulse;
      } else {
        // eslint-disable-next-line no-param-reassign
        element.pulseDefault = joinObjects({}, element.pulseDefault, options.pulse);
      }
    }
  }
}

/**
 * Built in figure primitives.
 *
 * Including simple shapes, grid and text.
 */
export default class FigurePrimitives {
  webgl: Array<WebGLInstance>;
  draw2D: Array<DrawContext2D>;
  htmlCanvas: HTMLElement;
  // spaceTransforms: OBJ_SpaceTransforms;
  animateNextFrame: Function;
  draw2DFigures: Object;
  defaultColor: Array<number>;
  defaultDimColor: Array<number>;
  defaultFont: OBJ_Font;
  defaultLineWidth: number;
  defaultLength: number;
  timeKeeper: TimeKeeper;
  recorder: Recorder;
  scene: Scene;

  /**
    * @hideconstructor
    */
  constructor(
    webgl: Array<WebGLInstance> | WebGLInstance,
    draw2D: Array<DrawContext2D> | DrawContext2D,
    // draw2DFigures: Object,
    htmlCanvas: HTMLElement,
    scene: Scene,
    // spaceTransforms: OBJ_SpaceTransforms,
    animateNextFrame: Function,
    defaultColor: Array<number>,
    defaultDimColor: Array<number>,
    defaultFont: OBJ_Font,
    defaultLineWidth: number,
    defaultLength: number,
    timeKeeper: TimeKeeper,
    recorder: Recorder,
  ) {
    if (Array.isArray(webgl)) {
      this.webgl = webgl;
    } else {
      this.webgl = [webgl];
    }

    if (Array.isArray(draw2D)) {
      this.draw2D = draw2D;
    } else {
      this.draw2D = [draw2D];
    }
    /**
     * @private {htmlElement}
     */
    this.htmlCanvas = htmlCanvas;
    this.scene = scene;
    this.animateNextFrame = animateNextFrame;
    // this.spaceTransforms = spaceTransforms;
    this.defaultColor = defaultColor;
    this.defaultDimColor = defaultDimColor;
    this.defaultFont = defaultFont;
    this.defaultLineWidth = defaultLineWidth;
    this.defaultLength = defaultLength;
    this.timeKeeper = timeKeeper;
    this.recorder = recorder;
    // this.draw2DFigures = draw2DFigures;
  }

  // dimension?: 2 | 3,
  // light?: 'directional' | 'point' | null,
  // colors?: 'texture' | 'vertex' | 'uniform' | Array<number> | {
  //   data: Array<number>,
  //   normalized?: boolean,
  //   size?: 3 | 4,
  // },
  // vertices?: OBJ_GLVertexBuffer,
  // normals?: OBJ_GLVertexBuffer,

  /**
   * {@link FigureElementPrimitive} that draws a generic shape.
   * @see {@link OBJ_Generic} for options and examples.
   */
  gl(...optionsIn: Array<OBJ_GenericGL>) {
    // Setup the default options
    const oIn = joinObjects({}, ...optionsIn);
    const defaultOptions: OBJ_GenericGL = {
      glPrimitive: 'TRIANGLES',
      vertexShader: { dimension: 2 },
      fragmentShader: { color: 'uniform' },
      attributes: [],
      texture: {
        src: '',
        mapTo: new Rect(-1, -1, 2, 2),
        mapFrom: new Rect(0, 0, 1, 1),
        mapToAttribute: 'a_vertex',
        repeat: false,
        onLoad: this.animateNextFrame,
        coords: [],
        loadColor: [0, 0, 1, 0.5],
      },
      name: generateUniqueId('primitive_'),
      color: this.defaultColor, // $FlowFixMe
      transform: [['s', 1], ['r', 0, 0, 0], ['t', 0, 0, 0]],
      dimension: 2,
    };
    // Setup shaders based on input options
    if (oIn.texture != null) { // $FlowFixMe
      defaultOptions.vertexShader.color = 'texture'; // $FlowFixMe
      defaultOptions.fragmentShader.color = 'texture';
    }
    if (oIn.dimension != null) { // $FlowFixMe
      defaultOptions.vertexShader.dimension = oIn.dimension;
    }
    if (oIn.glPrimitive === 'LINES') { // $FlowFixMe
      defaultOptions.vertexShader.light = null; // $FlowFixMe
      defaultOptions.fragmentShader.light = null;
    }
    if (oIn.light != null) { // $FlowFixMe
      defaultOptions.vertexShader.light = oIn.light; // $FlowFixMe
      defaultOptions.fragmentShader.light = oIn.light;
    }
    if (oIn.colors != null) { // $FlowFixMe
      defaultOptions.vertexShader.color = 'vertex'; // $FlowFixMe
      defaultOptions.fragmentShader.color = 'vertex';
    }

    // Combine default and input options
    const options = joinObjects({}, defaultOptions, oIn);
    options.transform = getTransform(options.transform);
    if (options.position != null) {
      options.position = getPoint(options.position);
      options.transform.updateTranslation(options.position);
    }

    // User shaders to create a gl drawing object
    const glObject = new GLObject(
      this.webgl[0],
      options.vertexShader,
      options.fragmentShader,
    );

    // Set the glPrimitive
    glObject.setPrimitive(options.glPrimitive.toUpperCase());

    // If vertices helper exists, then add the a_vertex attribute
    if (options.vertices != null) {
      if (Array.isArray(options.vertices)) {
        options.attributes.push({
          name: 'a_vertex', data: options.vertices, size: options.dimension,
        });
      } else {
        options.attributes.push({
          name: 'a_vertex',
          data: options.vertices.data,
          size: options.vertices.size || options.dimension,
          usage: options.vertices.usage,
        });
      }
    }

    // If a normals helper exists, then add the a_normal attribute
    if (options.normals != null) {
      if (Array.isArray(options.normals)) {
        options.attributes.push({
          name: 'a_normal', data: options.normals, size: 3,
        });
      } else {
        options.attributes.push({
          name: 'a_normal', data: options.normals.data, size: 3, usage: options.normals.usage,
        });
      }
    }

    // If a colors helper exits, then add the a_color attribute
    if (options.colors != null) {
      if (Array.isArray(options.colors)) {
        // glObject.addColors(options.colors);
        options.attributes.push({
          name: 'a_color', data: options.colors, size: 4,
        });
      } else if (options.colors.normalize) {
        options.attributes.push({
          name: 'a_color',
          data: options.colors.data,
          size: options.colors.size || 4,
          usage: options.colors.usage,
          type: 'UNSIGNED_BYTE',
          normalize: true,
        });
      } else {
        options.attributes.push({
          name: 'a_color',
          data: options.colors.data,
          size: options.colors.size || 4,
          usage: options.colors.usage,
          type: 'UNSIGNED_BYTE',
          normalize: false,
        });
      }
    }

    // Add all custom attributes
    if (options.attributes != null) {
      options.attributes.forEach((buffer) => {
        const defaultAttribute = {
          type: 'FLOAT',
          normalize: false,
          stride: 0,
          offset: 0,
          usage: 'STATIC',
          size: 2,
        };
        const b = joinObjects({}, defaultAttribute, buffer);
        glObject.addAttribute(
          b.name, b.size, b.data, b.type,
          b.normalize, b.stride, b.offset, b.usageIn,
        );
      });
    }

    // Add all custom uniforms
    if (options.uniforms != null) {
      options.uniforms.forEach((uniform) => {
        const defaultUniform = {
          type: 'FLOAT',
          length: 1,
        };
        const u = joinObjects({}, defaultUniform, uniform);
        glObject.addUniform(
          u.name, u.length, u.type, u.value,
        );
      });
    }

    // Add a texture - use mapFrom and mapTo if texture coords is not defined
    if (options.texture.src !== '') {
      const t = options.texture;
      glObject.addTexture(
        t.src, getRect(t.mapFrom), getRect(t.mapTo), t.mapToAttribute,
        t.coords || [], t.repeat, t.onLoad, t.loadColor,
      );
    }

    // Create th figure element primitive with the gl drawing object
    const element = new FigureElementPrimitive(
      glObject, options.transform, options.color, null, options.name,
    );

    // Add some custom methods to the FigureElementPrimitive to update
    // attributes, vertices, uniforms
    element.custom.updateAttribute =  // $FlowFixMe
      element.drawingObject.updateAttribute.bind(element.drawingObject);
    element.custom.updateVertices =
      element.drawingObject.updateVertices.bind(element.drawingObject);
    element.custom.updateUniform = element.drawingObject.updateUniform.bind(element.drawingObject);
    element.custom.getUniform = element.drawingObject.getUniform.bind(element.drawingObject);
    element.dimColor = this.defaultDimColor.slice();

    // Setup move, touch, scenarios, dim and default colors if defined in
    // options
    if (options.move != null && options.move !== false) {
      element.setTouchable();
      element.setMovable();
      element.setMove(options.move);
    }
    if (options.touch != null) {
      element.setTouchable(options.touch);
    }
    if (options.dimColor != null) {
      element.dimColor = options.dimColor;
    }
    if (options.defaultColor != null) {
      element.defaultColor = options.dimColor;
    }
    if (options.scenarios != null) {
      element.scenarios = options.scenarios;
    }

    if (options.scene != null) {
      if (options.scene instanceof Scene) {
        element.scene = options.scene;
      } else {
        element.setScene(options.scene);
      }
    }

    element.timeKeeper = this.timeKeeper;
    element.recorder = this.recorder;
    setupPulse(element, options);
    return element;
  }

  // Generic3 is an easy way to create generic 3D objects where just points,
  // normals, colors and texture helpers are used to create attributes in a
  // gl FigureElementPrimitive
  /**
   * {@link FigureElementPrimitive} that draws a generic shape.
   * @see {@link OBJ_Generic} for options and examples.
   */
  generic3(...optionsIn: Array<OBJ_Generic3>) {
    const oIn = joinObjects({}, ...optionsIn);
    const defaultOptions = {
      dimension: 3,
      light: oIn.lines ? null : 'directional',
      usage: 'STATIC',
    };
    const options = joinObjects({}, defaultOptions, oIn);
    const dim = options.dimension;

    const processOptions = (o: OBJ_Generic3, u) => {
      if (o.usage == null) {
        o.usage = u;
      }
      if (o.points != null) {
        o.vertices = o.points;
      }
      // If copy steps exist, then make copies of vertices, normals
      // and colors
      if (o.copy != null) {
        if (o.vertices != null) {
          o.vertices = copyPoints(o.vertices, o.copy, 'points');
        }
        if (o.normals != null) {
          o.normals = copyPoints(o.normals, o.copy, 'normals');
        }
        if (o.colors != null) {
          const count = getCopyCount(o.copy);
          const out = [];
          for (let i = 0; i < count; i += 1) {
            out.push(...o.colors.map(c => c.slice()));
          }
          o.colors = out;
        }
        if (o.texture != null && o.texture.coords != null) {
          const count = getCopyCount(o.copy);
          const out = [];
          for (let i = 0; i < count; i += 1) {
            out.push(...o.texture.coords.slice());
          }
          o.texture.coords = out;
        }
      }
      if (o.points != null) {
        o.vertices = toNumbers(getPoints(o.vertices), dim);
        o.vertices = { data: o.vertices, usage: o.usage, size: dim };
      }
      if (o.normals != null && Array.isArray(o.normals)) {
        o.normals = toNumbers(getPoints(o.normals), dim);
        o.normals = { data: o.normals, usage: o.usage, size: dim };
      }
      if (o.colors != null) {
        o.colors = toNumbers(o.colors, dim);
      }
      if (o.drawType != null) {
        o.glPrimitive = o.drawType.toUpperCase();
      }
    };
    processOptions(options, 'STATIC');
    const u = options.usage;
    const element = this.gl(options);

    element.custom.updateGeneric3 = function update(updateOptions: {
      points?: Array<TypeParsablePoint>,
      normals?: Array<TypeParsablePoint>,
      colors?: Array<number>,
      copy?: Array<CPY_Step>,
      drawType?: 'triangles' | 'strip' | 'fan' | 'lines',
    }) {
      const o = updateOptions;
      processOptions(o, u);
      if (o.vertices) {
        element.custom.updateVertices(o.vertices.data);
        if (o.texture != null && o.texture.coords != null) {
          element.drawingObject.updateTextureMap(o.texture.coords);
        } else if (o.texture != null && element.drawingObject.texture != null) {
          if (element.drawingObject.texture.points != null) {
            element.drawingObject.updateTextureMap(element.drawingObject.texture.points);
          } else {
            element.drawingObject.updateTextureMap([]);
          }
        }
      }
      if (o.normals) {
        element.custom.updateAttribute('a_normal', o.normals.data);
      }
      if (o.colors) {
        element.custom.updateAttribute('a_color', o.colors);
      }
      if (o.drawType != null) { // $FlowFixMe
        element.drawingObject.setPrimitive(o.drawType.toUpperCase());
      }
    };
    element.custom.updatePoints = element.custom.updateGeneric3;
    element.timeKeeper = this.timeKeeper;
    element.recorder = this.recorder;
    setupPulse(element, options);
    return element;
  }

  generic3DBase(
    defaultOptions: Object,
    optionsIn: Object,
    getPointsFn: (Object) => ([Array<Point>, Array<Point>] | [Array<Point>]),
  ) {
    const options = joinObjects({}, defaultOptions, optionsIn);
    const element = this.generic3(joinObjects(
      {},
      options,
      {
        points: [],
        normals: options.lines ? null : [],
        glPrimitive: options.lines ? 'LINES' : undefined,
      },
    ));
    // const element = this.generic3(optionsIn, {
    //   points: [],
    //   normals: [],
    // });
    element.custom.options = options;
    element.custom.getPoints = getPointsFn;
    element.custom.updatePoints = (updateOptions: Object) => {
      const o = joinObjects({}, element.custom.options, updateOptions);
      element.custom.options = o;
      if (o.transformPoints != null) {
        o.transform = o.transformPoints;
      }
      const [
        points, normals,
      ] = element.custom.getPoints(o);
      if (o.lines == null || o.lines === false) {
        element.custom.updateGeneric3(joinObjects({}, o, {
          points,
          normals,
        }));
      } else {
        element.custom.updateGeneric3(joinObjects({}, o, {
          points,
          normals: null,
        }));
      }
    };
    element.custom.updatePoints();
    return element;
  }

  sphere(...optionsIn: Array<OBJ_Sphere>) {
    return this.generic3DBase(
      {
        radius: this.defaultLength,
        sides: 10,
        normals: 'flat',
        center: [0, 0, 0],
      },
      joinObjects({}, ...optionsIn),
      o => sphere(o),
    );
  }

  cube(...optionsIn: Array<OBJ_Cube>) {
    return this.generic3DBase(
      {
        side: this.defaultLength,
      },
      joinObjects({}, ...optionsIn),
      o => cube(o),
    );
  }

  prism(...optionsIn: Array<OBJ_Prism>) {
    return this.generic3DBase(
      {
        side: this.defaultLength,
      },
      joinObjects({}, ...optionsIn),
      o => prism(o),
    );
  }

  cylinder(...optionsIn: Array<OBJ_Cylinder>) {
    return this.generic3DBase(
      {
        radius: this.defaultLength / 20,
        sides: 10,
        normals: 'flat',
      },
      joinObjects({}, ...optionsIn),
      o => cylinder(o),
    );
  }

  cone(...optionsIn: Array<OBJ_Cone>) {
    return this.generic3DBase(
      {
        radius: this.defaultLength / 20,
        sides: 10,
        normals: 'flat',
        length: 1,
      },
      joinObjects({}, ...optionsIn),
      o => cone(o),
    );
  }

  revolve(...optionsIn: Array<OBJ_Revolve>) {
    return this.generic3DBase(
      {
        sides: 10,
        normals: 'flat',
      },
      joinObjects({}, ...optionsIn),
      o => revolve(o),
    );
  }

  surface(...optionsIn: Array<OBJ_Surface>) {
    return this.generic3DBase(
      {
        normals: 'flat',
        lines: false,
      },
      joinObjects({}, ...optionsIn),
      o => surface.surface(o),
    );
  }
  // cube(...optionsIn: Array<OBJ_Cube>) {
  //   const options = joinObjects(
  //     {
  //       side: this.defaultLength,
  //     },
  //     ...optionsIn,
  //   );
  //   const [points, normals] = cube(options);
  //   return this.generic3D(options, {
  //     points,
  //     normals,
  //   });
  // }

  /**
   * {@link FigureElementPrimitive} that draws a generic shape.
   * @see {@link FigureElementPrimitiveMorph} and {@link OBJ_Morph} for
   * examples and options.
   */
  morph(...optionsIn: Array<OBJ_Morph>) {
    const defaultOptions = {
      name: generateUniqueId('primitive_'),
      color: this.defaultColor,
      points: [],
      glPrimitive: 'TRIANGLES',
      transform: new Transform('morph').scale(1, 1).rotate(0).translate(0, 0),
      position: [0, 0],
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);

    options.transform = getTransform(options.transform);
    if (options.position != null) {
      options.position = getPoint(options.position);
      options.transform.updateTranslation(options.position);
    }

    let colorVertex = false;
    let fragmentShader = 'simple';
    if (Array.isArray(options.color[0])) {
      colorVertex = true;
      fragmentShader = 'vertexColor';
    }

    const glObject = new GLObject(
      this.webgl[0],
      ['morpher', options.points.length, colorVertex],
      fragmentShader,
    );
    glObject.setPrimitive(options.glPrimitive.toUpperCase());

    const shapeNameMap = {};
    if (options.names != null) {
      options.names.forEach((name, index) => { shapeNameMap[name] = index; });
    }
    options.points.forEach((points, index) => {
      const attribute = `a_pos${index}`;
      glObject.numVertices = points.length / 2;
      const defaultBuffer = {
        type: 'FLOAT',
        normalize: false,
        stride: 0,
        offset: 0,
        usage: 'STATIC',
        size: 2,
      };
      const b = joinObjects({}, defaultBuffer);
      glObject.addAttribute(
        attribute, b.size, points, b.type,
        b.normalize, b.stride, b.offset, b.usageIn,
      );
    });
    if (colorVertex) {
      options.color.forEach((colorsIn, index) => {
        let colors = colorsIn;
        if (colors.length === 4) {
          colors = Array(4 * glObject.numVertices);
          for (let i = 0; i < colors.length; i += 4) {
            // eslint-disable-next-line
            colors[i] = colorsIn[0];      // eslint-disable-next-line
            colors[i + 1] = colorsIn[1];  // eslint-disable-next-line
            colors[i + 2] = colorsIn[2];  // eslint-disable-next-line
            colors[i + 3] = colorsIn[3];
          }
        }
        const attribute = `a_col${index}`;
        const defaultBuffer = {
          type: 'FLOAT',
          normalize: false,
          stride: 0,
          offset: 0,
          usage: 'STATIC',
          size: 4,
        };
        const b = joinObjects({}, defaultBuffer);
        glObject.addAttribute(
          attribute, b.size, colors, b.type,
          b.normalize, b.stride, b.offset, b.usageIn,
        );
      });
      options.color = this.defaultColor;
    }
    glObject.addUniform('u_from', 1, 'INT');
    glObject.addUniform('u_to', 1, 'INT');
    glObject.addUniform('u_percent', 1, 'FLOAT');

    const element = new FigureElementPrimitiveMorph(
      glObject, options.transform, options.color, null, options.name,
    );
    element.shapeNameMap = shapeNameMap;

    element.setPoints(0);

    element.fnMap.add('_morphCallback', (percentage: number, customProperties: Object) => {
      const { start, target } = customProperties;
      element.setPointsBetween(start, target, percentage);
    });
    element.animations.morph = (...opt) => {
      const o = joinObjects({}, {
        progression: 'easeinout',
        element,
      }, ...opt);
      o.customProperties = {
        start: o.start == null ? 0 : o.start,
        target: o.target == null ? 1 : o.target,
      };
      o.callback = '_morphCallback';
      o.timeKeeper = this.timeKeeper;
      return new CustomAnimationStep(o);
    };
    element.animations.customSteps.push({
      step: element.animations.morph.bind(this),
      name: 'morph',
    });
    element.timeKeeper = this.timeKeeper;
    element.recorder = this.recorder;
    setupPulse(element, options);
    return element;
  }

  // /**
  //  * {@link FigureElementPrimitive} that draws a generic shape.
  //  * @see {@link OBJ_Generic} for options and examples.
  //  */
  // genericLegacy(...optionsIn: Array<OBJ_Generic>) {
  //   const defaultOptions = {
  //     name: generateUniqueId('primitive_'),
  //     color: this.defaultColor,
  //     transform: new Transform('generic').scale(1).rotate(0).translate(),
  //     texture: {
  //       src: '',
  //       mapTo: new Rect(-1, -1, 2, 2),
  //       mapFrom: new Rect(0, 0, 1, 1),
  //       repeat: false,
  //       onLoad: this.animateNextFrame,
  //     },
  //   };
  //   const options = joinObjects({}, defaultOptions, ...optionsIn);
  //   options.transform = getTransform(options.transform);
  //   if (options.position != null) {
  //     options.position = getPoint(options.position);
  //     options.transform.updateTranslation(options.position);
  //   }

  //   const element = Generic(
  //     this.webgl[0],
  //     options.color,
  //     options.transform,
  //     options.texture.src,
  //     getRect(options.texture.mapTo),
  //     getRect(options.texture.mapFrom),
  //     options.texture.repeat,
  //     options.texture.onLoad,
  //     options.name,
  //     // this.scene,
  //   );

  //   element.dimColor = this.defaultDimColor.slice();
  //   if (options.move != null && options.move !== false) {
  //     element.setTouchable();
  //     element.setMovable();
  //     element.setMove(options.move);
  //   }
  //   if (options.touch != null) {
  //     element.setTouchable(options.touch);
  //   }
  //   if (options.dimColor != null) {
  //     element.dimColor = options.dimColor;
  //   }
  //   if (options.defaultColor != null) {
  //     element.defaultColor = options.dimColor;
  //   }
  //   if (options.scenarios != null) {
  //     element.scenarios = options.scenarios;
  //   }

  //   element.custom.updateGeneric = function update(updateOptions: {
  //     points?: Array<TypeParsablePoint>,
  //     drawBorder?: TypeParsableBorder,
  //     drawBorderBuffer?: TypeParsableBorder,
  //     border?: TypeParsableBorder | 'draw' | 'buffer' | 'rect' | number,
  //     touchBorder?: TypeParsableBorder | 'draw' | 'border' | 'rect' | number | 'buffer',
  //     copy?: Array<CPY_Step>,
  //     drawType?: 'triangles' | 'strip' | 'fan' | 'lines',
  //   }) {
  //     const o = updateOptions;
  //     if (o.copy != null && !Array.isArray(o.copy)) {
  //       o.copy = [o.copy];
  //     }
  //     if (o.points != null) { // $FlowFixMe
  //       o.points = getPoints(o.points);
  //     }
  //     if (o.drawBorder != null) { // $FlowFixMe
  //       element.drawBorder = getBorder(o.drawBorder);
  //     } else if (o.points != null) {
  //       element.drawBorder = [o.points];
  //     }
  //     if (o.drawBorderBuffer != null) { // $FlowFixMe
  //       element.drawBorderBuffer = getBorder(o.drawBorderBuffer);
  //     } else element.drawBorderBuffer = element.drawBorder;
  //     if (o.border != null) { // $FlowFixMe
  //       element.border = getBorder(o.border);
  //     }
  //     if (o.touchBorder != null) { // $FlowFixMe
  //       element.touchBorder = getBorder(o.touchBorder);
  //     }
  //     element.drawingObject.change(o);
  //   };
  //   element.custom.updateGeneric(options);
  //   element.custom.updatePoints = element.custom.updateGeneric;
  //   element.timeKeeper = this.timeKeeper;
  //   element.recorder = this.recorder;
  //   setupPulse(element, options);
  //   return element;
  // }

  /**
   * {@link FigureElementPrimitive} that draws a generic shape.
   * @see {@link OBJ_Generic} for options and examples.
   */
  generic(...optionsIn: Array<OBJ_Generic>) {
    const oIn = joinObjects({}, ...optionsIn);
    const element = this.generic3({
      dimension: 2,
      light: null,
      points: [],
    }, ...optionsIn);
    const processBorders = (o) => {
      if (o.drawBorder != null) { // $FlowFixMe
        element.drawBorder = getBorder(o.drawBorder);
      } else if (o.points != null) {
        element.drawBorder = [getPoints(o.points)];
      }
      if (o.drawBorderBuffer != null) { // $FlowFixMe
        element.drawBorderBuffer = getBorder(o.drawBorderBuffer);
      } else element.drawBorderBuffer = element.drawBorder;
      if (o.border != null) { // $FlowFixMe
        element.border = getBorder(o.border);
      }
      if (o.touchBorder != null) { // $FlowFixMe
        element.touchBorder = getBorder(o.touchBorder);
      }
    };

    element.custom.updateGeneric = function update(updateOptions: {
      points?: Array<TypeParsablePoint>,
      drawBorder?: TypeParsableBorder,
      drawBorderBuffer?: TypeParsableBorder,
      border?: TypeParsableBorder | 'draw' | 'buffer' | 'rect' | number,
      touchBorder?: TypeParsableBorder | 'draw' | 'border' | 'rect' | number | 'buffer',
      colors?: Array<number>,
      copy?: Array<CPY_Step>,
      drawType?: 'triangles' | 'strip' | 'fan' | 'lines',
    }) {
      const o = updateOptions;
      element.custom.updateGeneric3(o);
      processBorders(o);
      // processOptions(o, u);
      // if (o.drawBorder != null) { // $FlowFixMe
      //   element.drawBorder = getBorder(o.drawBorder);
      // } else if (o.points != null) {
      //   element.drawBorder = [getPoints(o.points)];
      // }
      // if (o.drawBorderBuffer != null) { // $FlowFixMe
      //   element.drawBorderBuffer = getBorder(o.drawBorderBuffer);
      // } else element.drawBorderBuffer = element.drawBorder;
      // if (o.border != null) { // $FlowFixMe
      //   element.border = getBorder(o.border);
      // }
      // if (o.touchBorder != null) { // $FlowFixMe
      //   element.touchBorder = getBorder(o.touchBorder);
      // }
    };
    element.custom.updatePoints = element.custom.updateGeneric;
    processBorders(oIn);
    // if (oIn.drawBorder != null) { // $FlowFixMe
    //   element.drawBorder = getBorder(oIn.drawBorder);
    // } else if (oIn.points != null) {
    //   element.drawBorder = [getPoints(oIn.points)];
    // }
    // if (oIn.drawBorderBuffer != null) { // $FlowFixMe
    //   element.drawBorderBuffer = getBorder(oIn.drawBorderBuffer);
    // } else element.drawBorderBuffer = element.drawBorder;
    // if (oIn.border != null) { // $FlowFixMe
    //   element.border = getBorder(oIn.border);
    // }
    // if (oIn.touchBorder != null) { // $FlowFixMe
    //   element.touchBorder = getBorder(oIn.touchBorder);
    // }
    // element.custom.updateGeneric({
    //   drawBorder: o.drawBorder,
    //   drawBorderBuffer: o.drawBorderBuffer,
    //   border: o.border,
    //   touchBorder: o.touchBorder,
    // });
    return element;
  }

  getPolylineTris(
    optionsIn: OBJ_PolyLineTris,
  ) {
    const defaultOptions = {
      points: [[0, 0], [1, 0]],
      width: this.defaultLineWidth,
      color: this.defaultColor,
      close: false,
      widthIs: 'mid',
      cornerStyle: 'auto',
      cornerSize: 0.01,
      cornerSides: 10,
      cornersOnly: false,
      cornerLength: 0.1,
      minAutoCornerAngle: Math.PI / 7,
      dash: [],
      linePrimitives: false,
      lineNum: 1,
      drawBorder: 'negative',
      drawBorderBuffer: 0,
      simple: false,
    };
    const o = joinObjects({}, defaultOptions, optionsIn);
    if (o.linePrimitives === false) {
      o.lineNum = 2;
    }
    parsePoints(o, ['points', 'border', 'touchBorder']);

    let points;
    let drawBorder;
    let drawBorderBuffer;
    if (o.simple) {
      [points, drawBorder, drawBorderBuffer] = makeFastPolyLine(
        o.points, o.width, o.close,
      );
    } else if (o.cornersOnly) {
      [points, drawBorder, drawBorderBuffer] = makePolyLineCorners(
        o.points, o.width, o.close, o.cornerLength, o.widthIs, o.cornerStyle,
        o.cornerSize, o.cornerSides, o.minAutoCornerAngle, o.linePrimitives,
        o.lineNum, o.drawBorderBuffer,
      );
    } else {
      [points, drawBorder, drawBorderBuffer] = makePolyLine(
        o.points, o.width, o.close, o.widthIs, o.cornerStyle, o.cornerSize,
        o.cornerSides, o.minAutoCornerAngle, o.dash, o.linePrimitives,
        o.lineNum, o.drawBorder, o.drawBorderBuffer, o.arrow,
      );
    }
    if (Array.isArray(o.drawBorderBuffer)) {
      drawBorderBuffer = getBorder(o.drawBorderBuffer);
    }
    if (Array.isArray(o.drawBorder)) {
      drawBorder = getBorder(o.drawBorder);
    }
    if (drawBorderBuffer == null) {
      drawBorderBuffer = drawBorder;
    }
    let drawType = 'triangles';
    if (o.linePrimitives) {
      drawType = 'lines';
    }
    if (o.simple) {
      drawType = 'strip';
    }
    return [o, points, drawBorder, drawBorderBuffer, drawType];
  }

  /**
   * {@link FigureElementPrimitive} that draws a polyline.
   * @see {@link OBJ_Polyline} for options and examples.
   */
  polyline(...optionsIn: Array<OBJ_Polyline>) {
    const options = joinObjects({}, ...optionsIn);
    const element = this.generic({
      transform: new Transform('polyline').scale(1).rotate(0).translate(),
      border: 'draw',
      touchBorder: 'border',   // $FlowFixMe
    }, ...optionsIn);

    element.custom.options = {
      points: [[0, 0], [1, 0]],
      width: this.defaultLineWidth,
      color: this.defaultColor,
      close: false,
      widthIs: 'mid',
      cornerStyle: 'auto',
      cornerSize: 0.01,
      cornerSides: 10,
      cornersOnly: false,
      cornerLength: 0.1,
      minAutoCornerAngle: Math.PI / 7,
      dash: [],
      linePrimitives: false,
      lineNum: 1,
      drawBorder: 'line',
      drawBorderBuffer: 0,
    };
    element.custom.updatePoints = (updateOptions: OBJ_Polyline) => {
      const [o, points, drawBorder, drawBorderBuffer, drawType] =
        this.getPolylineTris(joinObjects({}, element.custom.options, updateOptions));
      element.custom.options = o;
      element.custom.updateGeneric(joinObjects({}, o, {
        points, drawBorder, drawBorderBuffer, drawType,
      }));
    };

    element.custom.updatePoints(options);

    // getTris(options);
    // setupPulse(element, options);
    return element;
  }

  getPolygonBorder(optionsIn: OBJ_Polygon_Defined) {
    const o = optionsIn;
    parsePoints(o, ['offset']);
    if (o.angleToDraw != null) {
      o.sidesToDraw = Math.floor(
        o.angleToDraw / (Math.PI * 2 / o.sides),
      );
    }
    if (o.sidesToDraw == null) {
      o.sidesToDraw = o.sides;
    }
    if (o.sidesToDraw > o.sides) {
      o.sidesToDraw = o.sides;
    }
    const points = getPolygonPoints(o);
    // let { drawBorderBuffer } = o;
    let drawBorderOffset = 0;
    let drawBorder;
    if (o.line != null) {
      o.line = joinObjects({}, {
        width: this.defaultLineWidth,
        widthIs: 'mid',
      }, o.line);
      if (o.line.widthIs === 'inside' && o.direction === 1) {
        o.line.widthIs = 'positive';
      } else if (o.line.widthIs === 'inside' && o.direction === -1) {
        o.line.widthIs = 'negative';
      }
      if (o.line.widthIs === 'outside' && o.direction === 1) {
        o.line.widthIs = 'negative';
      } else if (o.line.widthIs === 'outside' && o.direction === -1) {
        o.line.widthIs = 'positive';
      }
      const { width, widthIs } = o.line;
      const dir = o.direction;
      if (
        (dir === 1 && (widthIs === 'negative' || widthIs === 'outside'))
        || (dir === -1 && (widthIs === 'positive' || widthIs === 'inside'))
      ) {
        drawBorderOffset = width;
      } else if (widthIs === 'mid') {
        drawBorderOffset = width / 2;
      }
      if (drawBorderOffset > 0) {
        const cornerAngle = (o.sides - 2) * Math.PI / o.sides;
        drawBorderOffset /= Math.sin(cornerAngle / 2);
      }
      if (o.sidesToDraw === o.sides) {
        o.line.close = true;
      } else {
        o.line.close = false;
      }
    } else if (o.sidesToDraw !== o.sides && o.line == null) {
      points.push(o.offset);
    }
    if (drawBorderOffset === 0) {
      drawBorder = [points];
    } else {
      drawBorder = [getPolygonPoints(joinObjects(
        {}, o, { radius: o.radius + drawBorderOffset },
      ))];
    }
    return [o, points, drawBorder, 'triangles'];
  }


  genericBase(
    name: string,
    defaultOptions: Object,
    optionsIn: Object,
  ) {
    const element = this.generic({
      transform: new Transform(name).scale(1).rotate(0).translate(),
      border: 'draw',
      touchBorder: 'border',   // $FlowFixMe
    }, optionsIn);

    element.custom.options = defaultOptions;

    element.custom.getFill = () => [];
    // element.custom.getLine = () => [];
    element.custom.close = true;
    element.custom.skipConcave = true;
    element.custom.bufferOffset = 'negative';
    element.custom.getLine = (o: OBJ_PolyLineTris) => {  // $FlowFixMe
      if (!element.custom.close && o.drawBorder == null) {   // $FlowFixMe
        o.drawBorder = 'line';
      }
      return this.getPolylineTris(o);
    };
    element.custom.getBorder = () => [];
    element.custom.updatePoints = (updateOptions: Object) => {
      const borderOptions = joinObjects({}, element.custom.options, updateOptions);
      const [o, border] = element.custom.getBorder(borderOptions);
      if (o.line == null) {
        const [
          points, drawType,
        ] = element.custom.getFill(border, o);
        element.custom.options = o;
        element.custom.updateGeneric(joinObjects({}, o, {
          points,
          drawBorder: border,
          drawBorderBuffer: getBufferBorder(
            [border],
            o.drawBorderBuffer,
            element.custom.skipConcave,
            element.custom.bufferOffset,
          ),
          drawType,
        }));
      } else {
        if (
          o.line.widthIs == null
        ) {
          o.line.widthIs = 'mid';
        }
        if (element.custom.close) {
          o.line.close = true;
        }
        let bufferOffsetToUse = 'negative';
        if (element.custom.bufferOffset === 'positive' && o.line.close) {
          o.line.drawBorder = 'positive';
          bufferOffsetToUse = 'positive';
        }
        const [
          polylineOptions, points, drawBorder, , drawType,
        ] = element.custom.getLine(joinObjects(
          {},
          o.line,
          {
            points: border,
          },
        ));
        element.custom.options = o;
        element.custom.options.line = polylineOptions;
        if (element.custom.bufferOffset === 'positive') {
          drawBorder.reverse();
        }
        const drawBorderBuffer = getBufferBorder(
          drawBorder,
          o.drawBorderBuffer,
          element.custom.skipConcave,
          bufferOffsetToUse,
        );
        element.custom.updateGeneric(joinObjects({}, o, {
          points, drawBorder, drawBorderBuffer, drawType,
        }));
      }
    };
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a regular polygon.
   * @see {@link OBJ_Polygon} for options and examples.
   */
  polygon(...options: Array<OBJ_Polygon>) {
    const element = this.genericBase('polygon', {
      radius: 1,
      sides: 4,
      direction: 1,
      rotation: 0,
      offset: new Point(0, 0),
    }, joinObjects({}, ...options));
    element.custom.getBorder = (o: OBJ_Polygon_Defined) => {
      const border = this.getPolygonBorder(o);
      if (o.sidesToDraw !== o.sides) {
        element.custom.close = false;
      } else {
        element.custom.close = true;
      }
      element.custom.skipConcave = false;
      if (o.direction === -1) {
        element.custom.bufferOffset = 'positive';
      } else {
        element.custom.bufferOffset = 'negative';
      }
      return border;
    };
    element.custom.getFill = (border: Array<Point>, fillOptions: OBJ_Polygon_Defined) => [
      getTrisFillPolygon(
        fillOptions.offset,
        border,
        fillOptions.sides, fillOptions.sidesToDraw,
      ),
      'triangles',
    ];
    // element.custom.getLine = (o: OBJ_PolyLineTris) => this.getPolylineTris(o);

    // $FlowFixMe
    element.drawingObject.getPointCountForAngle = (angle: number) => {
      const optionsToUse = element.custom.options;
      const sidesToDraw = Math.floor(
        tools.round(angle, 8) / tools.round(Math.PI * 2, 8) * optionsToUse.sides,
      );
      if (optionsToUse.line == null) {
        return sidesToDraw * 3;
      }
      if (optionsToUse.line && optionsToUse.line.linePrimitives) {
        return sidesToDraw * optionsToUse.line.lineNum * 2;
      }
      return sidesToDraw * 6;
    };
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a star.
   * @see {@link OBJ_Star} for options and examples.
   */
  star(...options: Array<OBJ_Star>) {
    const element = this.genericBase('star', {
      radius: 1,
      sides: 5,
      direction: 1,
      rotation: 0,
      offset: new Point(0, 0),
    }, joinObjects({}, ...options));
    element.custom.getBorder = (o: OBJ_Polygon_Defined) => {
      if (o.innerRadius == null) {
        o.innerRadius = o.radius / 3;
      }
      o.rotation += Math.PI / 2;
      o.sidesToDraw = o.sides;
      const result = this.getPolygonBorder(o);
      result[0].rotation -= Math.PI / 2;
      return result;
    };
    element.custom.getFill = (border: Array<Point>, fillOptions: OBJ_Polygon_Defined) => [
      getTrisFillPolygon(
        fillOptions.offset, border,
        fillOptions.sides, fillOptions.sidesToDraw,
      ),
      'triangles',
    ];

    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a rectangle.
   * @see {@link OBJ_Rectangle} for options and examples.
   */
  rectangle(...options: Array<OBJ_Rectangle>) {
    const element = this.genericBase('rectangle', {
      width: this.defaultLength,
      height: this.defaultLength / 2,
      xAlign: 'center',
      yAlign: 'middle',
      corner: {
        radius: 0,
        sides: 1,
      },
      offset: [0, 0],
    }, joinObjects({}, ...options));

    element.custom.getBorder = (o: OBJ_Rectangle_Defined) => {
      if (o.line != null && o.line.widthIs === 'inside') {
        o.line.widthIs = 'positive';
      }
      if (o.line != null && o.line.widthIs === 'outside') {
        o.line.widthIs = 'negative';
      }
      if (o.offset != null) {
        o.offset = getPoint(o.offset);
      }
      return [o, getRectangleBorder(o)];
    };
    element.custom.getFill = (border: Array<Point>) => [
      rectangleBorderToTris(border),
      'triangles',
    ];
    // element.custom.getLine = (o: OBJ_PolyLineTris) => this.getPolylineTris(o);
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws an ellipse.
   * @see {@link OBJ_Ellipse} for options and examples.
   */
  ellipse(...options: Array<OBJ_Ellipse>) {
    const element = this.genericBase('ellipse', {
      width: this.defaultLength,
      height: this.defaultLength / 2,
      xAlign: 'center',
      yAlign: 'middle',
      sides: 20,
    }, joinObjects({}, ...options));

    element.custom.getBorder = (o: OBJ_Ellipse_Defined) => {
      if (o.line != null && o.line.widthIs === 'inside') {
        o.line.widthIs = 'positive';
      }
      if (o.line != null && o.line.widthIs === 'outside') {
        o.line.widthIs = 'negative';
      }
      return [o, getEllipseBorder(o)];
    };
    element.custom.getFill = (border: Array<Point>) => [
      ellipseBorderToTris(border),
      'triangles',
    ];
    // element.custom.getLine = (o: OBJ_PolyLineTris) => this.getPolylineTris(o);
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws an ellipse.
   * @see {@link OBJ_Arc} for options and examples.
   */
  arc(...options: Array<OBJ_Arc>) {
    const element = this.genericBase('arc', {
      radius: this.defaultLength / 2,
      sides: 20,
      startAngle: 0,
      angle: 1,
      offset: [0, 0],
      fillCenter: false,
    }, joinObjects({}, ...options));

    element.custom.getBorder = (o: OBJ_Arc_Defined) => {
      if (o.line != null && o.line.widthIs === 'inside') {
        o.line.widthIs = 'positive';
      }
      if (o.line != null && o.line.widthIs === 'outside') {
        o.line.widthIs = 'negative';
      }
      if (o.offset != null) {
        o.offset = getPoint(o.offset);
      }
      element.custom.close = false;
      return [o, getArcBorder(o)];
    };
    element.custom.getFill = (border: Array<Point>) => [
      arcBorderToTris(border),
      'triangles',
    ];
    // element.custom.getLine = (o: OBJ_PolyLineTris) => this.getPolylineTris(o);
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a triangle.
   * @see {@link OBJ_Triangle} for options and examples.
   */
  triangle(...options: Array<OBJ_Triangle>) {
    const element = this.genericBase('triangle', {
      width: this.defaultLength,
      height: this.defaultLength,
      // xAlign: 'centroid',
      // yAlign: 'centroid',
      top: 'center',
      direction: 1,
      rotation: 0,
    }, joinObjects({}, ...options));

    element.custom.getBorder = (o: OBJ_Triangle_Defined) => {
      if (o.xAlign == null) {
        if (o.points != null) {
          o.xAlign = 'points';
        } else {
          o.xAlign = 'centroid';
        }
      }
      if (o.yAlign == null) {
        if (o.points != null) {
          o.yAlign = 'points';
        } else {
          o.yAlign = 'centroid';
        }
      }
      // if (o.line != null && o.line.widthIs === 'inside') {
      //   o.line.widthIs = 'positive';
      // }
      // if (o.line != null && o.line.widthIs === 'outside') {
      //   o.line.widthIs = 'negative';
      // }
      // if (o.direction === -1) {
      //   element.custom.bufferOffset = 'positive';
      // } else {
      //   element.custom.bufferOffset = 'negative';
      // }
      const border = getTriangleBorder(o);
      if (o.direction === -1 || getTriangleDirection(border) === -1) {
        border.reverse();
      }

      return [o, border];
    };

    // element.custom.getBorder = (o: OBJ_Triangle_Defined) => [
    //   o, ...getTriangleBorder(o),
    // ];
    element.custom.getFill = (border: Array<Point>) => [
      border,
      'triangles',
    ];
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a line.
   * @see {@link OBJ_Arrow} for options and examples.
   */
  arrow(...options: Array<OBJ_Arrow>) {
    const element = this.genericBase('arrow', {
      length: this.defaultLength / 2,
      width: this.defaultLength / 2,
      head: 'triangle',
      sides: 20,
      radius: this.defaultLength / 4,
      rotation: 0,
      angle: 0,
      tail: false,
      drawPosition: new Point(0, 0),
      // barb: this.defaultLength / 8,
    }, joinObjects({}, ...options));

    element.custom.getBorder = (o: OBJ_Triangle_Defined) => {
      if (o.line != null && o.line.widthIs === 'inside') {
        o.line.widthIs = 'positive';
      }
      if (o.line != null && o.line.widthIs === 'outside') {
        o.line.widthIs = 'negative';
      }
      const optionsWithDefaultArrow = defaultArrowOptions(o);
      const [border, borderBuffer] = getArrow(optionsWithDefaultArrow);
      return [
        optionsWithDefaultArrow, border, borderBuffer,
      ];
    };
    element.custom.getFill = (border: Array<Point>, o: Object) => [
      getArrowTris(border, o),
      'triangles',
    ];
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a grid.
   * @see {@link OBJ_Grid} for options and examples.
   */
  grid(...optionsIn: Array<OBJ_Grid>) {
    const element = this.generic({
      transform: new Transform('grid').scale(1).rotate(0).translate(),
      border: 'draw',
      touchBorder: 'border', // $FlowFixMe
    }, ...optionsIn);

    element.custom.options = {
      bounds: new Rect(
        this.scene.left,
        this.scene.bottom,
        this.scene.right - this.scene.left,
        this.scene.top - this.scene.bottom,
      ),
      line: {
        linePrimitives: false,
        width: this.defaultLineWidth,
        lineNum: 2,
        dash: [],
      },
    };

    const getTris = points => makePolyLine(
      points,
      element.custom.options.line.width,
      false,
      'mid',
      'auto', // cornerStyle doesn't matter
      0.1,    // cornerSize doesn't matter
      1,      // cornerSides,
      Math.PI / 7, // minAutoCornerAngle,
      element.custom.options.line.dash,
      element.custom.options.line.linePrimitives,
      element.custom.options.line.lineNum,
      [[]],
      0,
    );

    element.custom.updatePoints = (updateOptions: Object) => {
      const o = joinObjects({}, element.custom.options, updateOptions);
      element.custom.options = o;
      // Prioritize Num over Step. Only define Num from Step if Num is undefined.
      const bounds = getRect(o.bounds);

      let {
        xStep, xNum, yStep, yNum,
      } = o;
      let { width } = o.line;
      if (o.line.linePrimitives && o.line.lineNum === 1) {
        width = 0;
      }
      const totWidth = bounds.width;
      const totHeight = bounds.height;
      if (xStep != null && xNum == null) {
        xNum = xStep === 0 ? 1 : 1 + Math.floor((totWidth + xStep * 0.1) / xStep);
      }
      if (yStep != null && yNum == null) {
        yNum = yStep === 0 ? 1 : 1 + Math.floor((totHeight + yStep * 0.1) / yStep);
      }

      if (xNum == null) {
        xNum = 2;
      }
      if (yNum == null) {
        yNum = 2;
      }
      xStep = xNum < 2 ? 0 : totWidth / (xNum - 1);
      yStep = yNum < 2 ? 0 : totHeight / (yNum - 1);

      const start = new Point(
        bounds.left,
        bounds.bottom,
      );
      const xLineStart = start.add(-width / 2, 0);
      const xLineStop = start.add(totWidth + width / 2, 0);
      const yLineStart = start.add(0, -width / 2);
      const yLineStop = start.add(0, totHeight + width / 2);

      let xTris = [];
      let yTris = [];
      if (xNum > 0) {
        const [yLine] = getTris([yLineStart, yLineStop]);
        yTris = copyPoints(yLine, [
          { along: 'x', num: xNum - 1, step: xStep },
        ]);
      }

      if (yNum > 0) {
        const [xLine] = getTris([xLineStart, xLineStop]);
        xTris = copyPoints(xLine, [
          { along: 'y', num: yNum - 1, step: yStep },
        ]);
      }
      const border = [
        start.add(-width / 2, -width / 2),
        start.add(totWidth + width / 2, -width / 2),
        start.add(totWidth + width / 2, totHeight + width / 2),
        start.add(-width / 2, totHeight + width / 2),
      ];
      let drawBorder;
      if (o.drawBorder != null) {
        drawBorder = getBorder(o.drawBorder);
      } else {
        drawBorder = [border];
      }
      let { drawBorderBuffer } = o;
      if (typeof o.drawBorderBuffer === 'number') {
        drawBorderBuffer = drawBorder;
        if (o.drawBorderBuffer !== 0) {
          const buf = o.drawBorderBuffer;
          drawBorderBuffer = [[
            border[0].add(-buf, -buf),
            border[1].add(buf, -buf),
            border[2].add(buf, buf),
            border[3].add(-buf, buf),
          ]];
        }
      }
      element.custom.updateGeneric(joinObjects({}, o, {
        points: [...xTris, ...yTris],
        drawBorder,
        drawBorderBuffer,
        drawType: o.line.linePrimitives ? 'LINES' : 'TRIANGLES',
      }));
    };
    element.custom.updatePoints(joinObjects({}, ...optionsIn));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a line.
   * @see {@link OBJ_Line} for options and examples.
   */
  line(...options: OBJ_Line) { // $FlowFixMe
    const element = this.polyline(joinObjects(
      {},
      {
        transform: new Transform('line').scale(1).rotate(0).translate(),
      },
      ...options,
      {
        points: [[0, 0], [0, 1]],
        dash: [],
        arrow: null,
      },
    )); // $FlowFixMe
    const joinedOptions = joinObjects({}, ...options);
    element.custom.options = joinObjects(
      {},
      element.custom.options,
      {
        p1: [0, 0],
        angle: 0,
        length: this.defaultLength,
        width: this.defaultLineWidth,
      },
    );

    // element.custom.setupLine = (p, o) => {
    //   if (o.dash.length > 1) {
    //     const maxLength = p[0].distance(p[1]);
    //     const dashCumLength = [];
    //     let cumLength = 0;
    //     if (o.dash) {
    //       let dashToUse = o.dash;
    //       let offset = 0;
    //       if (o.dash % 2 === 1) {
    //         dashToUse = o.dash.slice(1);
    //         [offset] = o.dash;
    //         // cumLength = offset;
    //       }
    //       while (cumLength < maxLength) {
    //         for (let i = 0; i < dashToUse.length && cumLength < maxLength; i += 1) {
    //           let length = dashToUse[i];
    //           if (length + cumLength > maxLength) {
    //             length = maxLength - cumLength;
    //           }
    //           cumLength += length;
    //           dashCumLength.push(cumLength);
    //         }
    //       }
    //       element.custom.dashCumLength = dashCumLength;
    //       element.custom.maxLength = maxLength;
    //     }
    //   }
    // };

    element.custom.updatePolyline = element.custom.updatePoints;
    element.custom.updatePoints = (updateOptions) => {
      const o = joinObjects({}, element.custom.options, updateOptions);
      const [updatedPoints, updatedBorder, updatedTouchBorder] = getLine(o);
      // element.custom.setupLine(updatedPoints, o);
      element.custom.updatePolyline(joinObjects({}, o, {
        points: updatedPoints,
        border: updatedBorder,
        touchBorder: updatedTouchBorder,
      }));
    };
    // element.drawingObject.getPointCountForLength = (drawLength: number = this.maxLength) => {
    //   if (drawLength >= element.custom.maxLength) { // $FlowFixMe
    //     return element.drawingObject.numPoints;
    //   }
    //   if (drawLength < element.custom.dashCumLength[0]) {
    //     return 0;
    //   }
    //   for (let i = 0; i < element.custom.dashCumLength.length; i += 1) {
    //     const cumLength = element.custom.dashCumLength[i];
    //     if (cumLength > drawLength) {
    //       return (Math.floor((i - 1) / 2) + 1) * 6;
    //     }
    //   } // $FlowFixMe
    //   return element.drawingObject.numPoints;
    // };

    element.custom.updatePoints(joinedOptions);
    return element;
  }


  textGL(options: Object) {
    return Text(
      this.webgl[0],
      options,
    );
  }


  /*
  .......########.########.##.....##.########
  ..........##....##........##...##.....##...
  ..........##....##.........##.##......##...
  ..........##....######......###.......##...
  ..........##....##.........##.##......##...
  ..........##....##........##...##.....##...
  ..........##....########.##.....##....##...
  */
  // eslint-disable-next-line class-methods-use-this
  parseTextOptions(...optionsIn: Object) {
    const defaultOptions = {
      text: '',
      font: {
        family: this.defaultFont.family,
        style: this.defaultFont.style,
        size: this.defaultFont.size,
        weight: this.defaultFont.weight,
      },
      xAlign: 'left',
      yAlign: 'baseline',
      border: 'draw',
      touchBorder: 'buffer',
      defaultTextTouchBorder: 0,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);

    // Make default color
    if (options.color == null && options.font.color != null) {
      options.color = options.font.color;
    }
    if (options.font.color == null && options.color != null) {
      options.font.color = options.color;
    }
    if (options.color == null) {
      options.color = this.defaultFont.color;
    }

    // // Define standard transform if no transform was input
    // if (options.transform == null) {
    //   options.transform = new Transform('text').translate();
    // } else {
    //   options.transform = getTransform(options.transform);
    // }

    // // Override transform if position is defined
    // if (options.position != null) {
    //   const p = getPoint(options.position);
    //   options.transform.updateTranslation(p);
    // }

    if (options.text != null && !Array.isArray(options.text)) {
      options.text = [options.text];
    }
    if (options.line != null && !Array.isArray(options.line)) {
      options.line = [options.line];
    }
    if (options.lines != null && !Array.isArray(options.lines)) {
      options.lines = [options.lines];
    }

    if (options.touchBorder != null && Array.isArray(options.touchBorder)) {
      // parsePoints(options, ['touchBorder']);
      options.touchBorder = getBorder(options.touchBorder);
    }

    if (options.border != null && Array.isArray(options.border)) {
      // parsePoints(options, ['border']);
      options.border = getBorder(options.border);
    }

    return options;
  }

  genericTextPrimitive(
    drawingObject: DrawingObject, optionsIn: Object,
  ) {
    const options = optionsIn;
    // Define standard transform if no transform was input
    if (options.transform == null) {
      options.transform = new Transform('text').scale(1).rotate(0).translate();
    } else {
      options.transform = getTransform(options.transform);
    }

    // Override transform if position is defined
    if (options.position != null) {
      const p = getPoint(options.position);
      options.transform.updateTranslation(p);
    }

    const element = new FigureElementPrimitive(
      drawingObject,
      options.transform,
      options.color,
    );
    element.timeKeeper = this.timeKeeper;
    element.recorder = this.recorder;

    setupPulse(element, options);
    if (options.mods != null && options.mods !== {}) {
      element.setProperties(options.mods);
    }
    element.custom.updateBorders = (o) => {
      element.drawBorder = element.drawingObject.textBorder;
      if (o.drawBorder != null) {
        element.drawBorder = o.drawBorder;
      }
      element.drawBorderBuffer = element.drawingObject.textBorderBuffer;
      if (o.drawBorderBuffer != null) {
        element.drawBorderBuffer = o.drawBorderBuffer;
      }
      if (o.border != null) {
        element.border = o.border;
      }
      if (o.touchBorder != null) {
        element.touchBorder = o.touchBorder;
      }
    }; // $FlowFixMe
    element.getBorderPointsSuper = element.getBorderPoints; // $FlowFixMe
    element.getBorderPoints = (border: 'border' | 'touchBorder' = 'border') => {
      if (border === 'border') { // $FlowFixMe
        return element.getBorderPointsSuper(border);
      }
      // if (border === 'touchBorder') {
      if (element.touchBorder === 'draw') {
        return element.drawBorder;
      }
      if (element.touchBorder === 'buffer') {
        return element.drawBorderBuffer;
      }
      if (element.touchBorder === 'border') {
        return element.getBorderPoints('border');
      }
      if (element.touchBorder === 'rect') {
        return [getBoundingBorder(element.drawBorderBuffer)];
      }
      if (isBuffer(element.touchBorder)) {
        const b = element.drawBorderBuffer; // $FlowFixMe
        return [getBoundingBorder(b, element.touchBorder)];
      }
      return element.touchBorder;
      // }
    };
    element.custom.setText = (o: string | OBJ_TextDefinition, index: number = 0) => {
      element.drawingObject.setText(o, index);
      element.custom.updateBorders({});
    };
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a line of text.
   * @see {@link OBJ_TextLine} for options and examples.
   */
  textLine(...optionsIn: Array<OBJ_TextLine>) {
    const options = this.parseTextOptions({ border: 'rect', touchBorder: 'rect' }, ...optionsIn);
    const to = new TextLineObject(this.draw2D);
    to.loadText(options);
    const element = this.genericTextPrimitive(to, options);
    element.custom.options = to;
    element.custom.updateText = (o: OBJ_Text) => { // $FlowFixMe
      element.drawingObject.clear();
      const parsed = this.parseTextOptions(
        { border: 'rect', touchBorder: 'rect' },
        element.custom.options,
        o,
      ); // $FlowFixMe
      element.drawingObject.loadText(parsed);
      element.custom.options = parsed;
      element.custom.updateBorders({});
    };
    element.custom.updateBorders(options);
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws text lines.
   * @see {@link OBJ_TextLines} for options and examples.
   */
  textLines(...optionsIn: Array<OBJ_TextLines | string>) {
    const joinedOptions = joinObjects({}, { color: this.defaultColor }, ...optionsIn);
    const to = new TextLinesObject(this.draw2D);
    const element = this.genericTextPrimitive(to, joinedOptions);
    element.custom.options = joinedOptions;
    element.custom.updateText = (oIn: OBJ_Text) => {
      // $FlowFixMe
      element.drawingObject.clear();
      let oToUse = oIn; // $FlowFixMe
      if (oIn.length === 1 && typeof oIn[0] === 'string') {
        oToUse = [{ text: [optionsIn[0]] }];
      }
      const o = this.parseTextOptions(
        { border: 'rect', touchBorder: 'rect' },
        element.custom.options,
        oToUse,
      );
      if (o.justify == null) {
        o.justify = 'left';
      }
      if (o.lineSpace == null) {
        o.lineSpace = o.font.size * 1.2;
      }
      element.custom.options = o;  // $FlowFixMe
      element.drawingObject.loadText(o);
      element.custom.updateBorders(o);
    };
    element.custom.updateText(joinedOptions);
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws text.
   * @see {@link OBJ_Text} for options and examples.
   */
  text(...optionsIn: Array<OBJ_Text>) {
    const options = this.parseTextOptions(...optionsIn);
    const to = new TextObject(
      this.draw2D,
    );
    to.loadText(options);
    const element = this.genericTextPrimitive(to, options);
    element.custom.options = options;
    element.custom.updateText = (o: OBJ_Text) => { // $FlowFixMe
      element.drawingObject.clear(); // $FlowFixMe
      element.drawingObject.loadText(this.parseTextOptions(element.custom.options, o));
      element.custom.updateBorders({});
      element.animateNextFrame();
    };
    element.custom.updateBorders(options);
    return element;
  }

  html(optionsIn: {
    element: HTMLElement | Array<HTMLElement>,
    classes?: string,
    position?: TypeParsablePoint,
    xAlign?: 'left' | 'right' | 'center',
    yAlign?: 'top' | 'bottom' | 'middle',
    wrap?: boolean,
    id?: string,
  }) {
    const defaultOptions = {
      classes: '',
      position: [0, 0],
      xAlign: 'center',
      yAlign: 'middle',
      wrap: true,
      id: `id__temp_${Math.round(Math.random() * 10000)}`,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    options.element = optionsIn.element;
    let element;
    let parent;
    if (options.wrap || Array.isArray(options.element)) {
      element = document.createElement('div');
      element.setAttribute('id', options.id);
      if (Array.isArray(options.element)) {
        options.element.forEach(e => element.appendChild(e));
      } else {
        element.appendChild(options.element);
      }
      this.htmlCanvas.appendChild(element);
      parent = this.htmlCanvas;
    } else {
      element = options.element;
      const id = element.getAttribute('id');
      if (id === '') {
        element.setAttribute('id', options.id);
      } else {
        options.id = id;
      }
      parent = element.parentElement;
    }
    if (parent == null) {
      parent = this.htmlCanvas;
    }

    const hT = new HTMLObject(  // $FlowFixMe
      parent,
      options.id,
      new Point(0, 0),
      options.yAlign,
      options.xAlign,
    );
    const p = getPoint(options.position);
    const figureElement = new FigureElementPrimitive(
      hT,
      new Transform().scale(1, 1).translate(p.x, p.y),
      [1, 1, 1, 1],
    );
    figureElement.timeKeeper = this.timeKeeper;
    figureElement.recorder = this.recorder;
    return figureElement;
  }

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
    const figureElement = new FigureElementPrimitive(
      hT,
      new Transform().scale(1, 1).translate(location.x, location.y),
      [1, 1, 1, 1],
    );
    figureElement.timeKeeper = this.timeKeeper;
    figureElement.recorder = this.recorder;
    return figureElement;
  }


  htmlImage(...optionsIn: Array<{
    id?: string,
    classes?: string,
    position?: Point,
    yAlign?: 'top' | 'bottom' | 'middle',
    xAlign?: 'left' | 'right' | 'center',
    src?: string,
    color?: TypeColor,
    pulse?: number,
  }>) {
    const defaultOptions = {
      id: generateUniqueId('id__html_image_'),
      classes: '',
      position: new Point(0, 0),
      yAlign: 'middle',
      xAlign: 'left',
      src: '',
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    const image = document.createElement('img');
    image.src = options.src;

    const {
      id, classes, position, yAlign, xAlign,
    } = options;
    const element = this.htmlElement(image, id, classes, getPoint(position), yAlign, xAlign);
    if (options.color != null) {
      element.setColor(options.color);
    }
    setupPulse(element, options);
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
    color?: TypeColor,
    pulse?: number,
  }>) {
    const defaultOptions = {
      text: '',
      id: generateUniqueId('id__html_text_'),
      classes: '',
      position: new Point(0, 0),
      yAlign: 'middle',
      xAlign: 'left',
      // color: this.defaultColor,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    const inside = document.createElement('div');
    setHTML(inside, options.text, options.modifiers);
    const {
      id, classes, position, yAlign, xAlign,
    } = options;
    const element = this.htmlElement(inside, id, classes, getPoint(position), yAlign, xAlign);
    if (options.color != null) {
      element.setColor(options.color);
    }
    setupPulse(element, options);
    return element;
  }
}

export type TypeFigurePrimitives = FigurePrimitives;
