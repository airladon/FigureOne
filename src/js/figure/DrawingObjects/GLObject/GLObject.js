// @flow

// import * as g2 from '../g2';
// import { round } from '../../../tools/math';
import * as m3 from '../../../tools/m3';
// import type Scene from '../../Figure';
import Scene from '../../../tools/geometry/scene';
import type { Type3DMatrix } from '../../../tools/m3';
import WebGLInstance from '../../webgl/webgl';
import type { TypeFragmentShader, TypeVertexShader } from '../../webgl/shaders';
import { Rect, getPoint, getRect } from '../../../tools/g2';
// import type { TypeParsablePoint } from '../../../tools/g2';
import DrawingObject from '../DrawingObject';
// import type { CPY_Step } from '../../geometries/copy/copy';
import type { TypeColor } from '../../../tools/types';
// import { colorToInt } from '../../../tools/color';
import { Console } from '../../../tools/tools';

/**
 * `'BYTE' | 'UNSIGNED_BYTE' | 'SHORT' | 'UNSIGNED_SHORT' | 'FLOAT'`
 */
export type TypeGLBufferType = 'BYTE' | 'UNSIGNED_BYTE' | 'SHORT' | 'UNSIGNED_SHORT' | 'FLOAT';

/**
 * `'STATIC' | 'DYNAMIC'`
 */
export type TypeGLBufferUsage = 'STATIC' | 'DYNAMIC';

/**
 * `'FLOAT' | 'FLOAT_VECTOR' | 'INT' | 'INT_VECTOR'`
 */
export type TypeGLUniform = 'FLOAT' | 'FLOAT_VECTOR' | 'INT' | 'INT_VECTOR';

/**
 * FigureElementPrimitive that can be used to utilize custom shaders for WebGL.
 *
 */
class GLObject extends DrawingObject {
  gl: WebGLRenderingContext;
  webgl: WebGLInstance;
  glPrimitive: number;

  z: number;

  texture: ?{
    id: string;
    src?: string;
    // data?: ?Object;
    points: Array<number>;
    buffer?: ?WebGLBuffer;
    // type: 'canvasText' | 'image';
    repeat?: boolean;
    mapTo: Rect,
    mapFrom: Rect,
    data?: ?Image,
    loadColor: TypeColor,
  };

  attributes: {
    [attributeName: string]: {
      buffer: WebGLBuffer,
      size: number,
      type: number,
      normalize: boolean,
      stride: number,
      offset: number,
      usage: number,
      data: Array<number>
      // len: number,
    };
  };

  points: Array<number>;

  uniforms: {
    [uniformName: string]: {
      value: Array<number>,
      method: (location: WebGLUniformLocation, name: string) => void,
    },
  }

  numVertices: number;

  state: 'loading' | 'loaded';

  programIndex: number;
  selectorProgramIndex: number;
  onLoad: ?(() => void);

  vertexShader: TypeVertexShader;
  fragmentShader: TypeFragmentShader;
  selectorVertexShader: TypeVertexShader;
  selectorFragmentShader: TypeFragmentShader;


  constructor(
    webgl: WebGLInstance,
    vertexShader: TypeVertexShader = {
      color: 'uniform', dimension: 2, normals: false, light: null,
    },
    fragmentShader: TypeFragmentShader = { color: 'uniform', light: null },
    selectorVertexShader: TypeVertexShader = 'selector',
    selectorFragShader: TypeFragmentShader = 'selector',
  ) {
    super();
    this.gl = webgl.gl;
    this.glPrimitive = this.gl.TRIANGLES;
    this.webgl = webgl;
    this.z = 0;
    // this.programIndex = this.webgl.getProgram(vertexShader, fragmentShader);
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.selectorVertexShader = selectorVertexShader;
    this.selectorFragmentShader = selectorFragShader;
    this.type = 'glPrimitive';
    this.attributes = {};
    this.numVertices = 0;
    this.uniforms = {};
    this.texture = null;
    // this.selectorProgramIndex = this.webgl.getProgram(selectorVertexShader, selectorFragShader);
    this.initProgram();
  }

  init(webgl: WebGLInstance) {
    this.webgl = webgl;
    this.gl = this.webgl.gl;
    this.initProgram();
    this.initAttributes();
    this.initTexture();
  }

  initProgram() {
    this.programIndex = this.webgl.getProgram(
      this.vertexShader,
      this.fragmentShader,
    );
    this.selectorProgramIndex = this.webgl.getProgram(
      this.selectorVertexShader, this.selectorFragmentShader,
    );
  }

  showShaders() {
    Console(this.webgl.programs[this.programIndex].vertexShader.src);
    Console(this.webgl.programs[this.programIndex].fragmentShader.src);
  }

  showSelectorShaders() {
    Console(this.webgl.programs[this.selectorProgramIndex].vertexShader.src);
    Console(this.webgl.programs[this.selectorProgramIndex].fragmentShader.src);
  }

  getCanvas() {
    return this.gl.canvas;
  }

  setPrimitive(primitiveType: 'TRIANGLES' | 'POINTS' | 'TRIANGLE_FAN' | 'TRIANGLE_STRIP' | 'LINES' | 'LINE_LOOP' | 'LINE_STRIP' | 'FAN' | 'STRIP') {
    if (primitiveType === 'TRIANGLES') {
      this.glPrimitive = this.gl.TRIANGLES;
    } else if (primitiveType === 'LINES') {
      this.glPrimitive = this.gl.LINES;
    } else if (primitiveType === 'TRIANGLE_FAN' || primitiveType === 'FAN') {
      this.glPrimitive = this.gl.TRIANGLE_FAN;
    } else if (primitiveType === 'TRIANGLE_STRIP' || primitiveType === 'STRIP') {
      this.glPrimitive = this.gl.TRIANGLE_STRIP;
    } else if (primitiveType === 'POINTS') {
      this.glPrimitive = this.gl.POINTS;
    } else if (primitiveType === 'LINE_LOOP') {
      this.glPrimitive = this.gl.LINE_LOOP;
    } else if (primitiveType === 'LINE_STRIP') {
      this.glPrimitive = this.gl.LINE_STRIP;
    } else {
      throw new Error(`Primitive type can only be ['TRIANGLES' | 'POINTS' | 'TRIANGLE_FAN' | 'TRIANGLE_STRIP' | 'LINES' | 'LINE_LOOP' | 'LINE_STRIP']. Input primitive type was: ${primitiveType}`);
    }
  }

  initAttributes() {
    Object.keys(this.attributes).forEach((name) => {
      this.fillBuffer(name, this.attributes[name].data);
    });
  }

  setZ(z: number) {
    this.z = z;
  }

  // addTextureToBuffer(
  //   glTexture: WebGLTexture,
  //   image: Object, // image data
  //   repeat?: boolean,
  // ) {
  //   function isPowerOf2(value) {
  //     // eslint-disable-next-line no-bitwise
  //     return (value & (value - 1)) === 0;
  //   }
  //   const { texture, gl, webgl } = this;
  //   if (texture != null) {
  //     const { index } = webgl.textures[texture.id];
  //     gl.activeTexture(gl.TEXTURE0 + index);
  //     // console.log(glTexture)
  //     gl.bindTexture(gl.TEXTURE_2D, glTexture);
  //     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  //     gl.texImage2D(
  //       gl.TEXTURE_2D, 0, gl.RGBA,
  //       gl.RGBA, gl.UNSIGNED_BYTE, image,
  //     );
  //     // Check if the image is a power of 2 in both dimensions.
  //     if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
  //       // Yes, it's a power of 2. Generate mips.
  //       gl.generateMipmap(gl.TEXTURE_2D);
  //       if (repeat != null && repeat === true) {
  //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  //       } else {
  //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //       }
  //     } else {
  //       // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
  //       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  //       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //     }
  //   }
  // }
  contextLost() {
    Object.keys(this.attributes).forEach((attributeName) => {
      this.attributes[attributeName].buffer = null;
    });
    const { texture } = this;
    if (texture == null) {
      return;
    }
    if (texture.buffer != null) {
      texture.buffer = null;
    }
  }

  updateTextureMap(points: Array<number> = []) {
    const { texture } = this;
    if (texture == null) {
      return;
    }
    if (texture.buffer != null) {
      this.gl.deleteBuffer(texture.buffer);
    }
    texture.buffer = this.gl.createBuffer();
    if (points.length === 0) {
      this.createTextureMap(
        texture.mapTo.left, texture.mapTo.right,
        texture.mapTo.bottom, texture.mapTo.top,
        texture.mapFrom.left, texture.mapFrom.right,
        texture.mapFrom.bottom, texture.mapFrom.top,
      );
    } else {
      texture.points = points;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texture.buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(texture.points),
      this.gl.STATIC_DRAW,
    );
  }

  // addAtlas(
  //   location: string,
  //   points: Array<number> = [],
  //   onLoad: null | (() => void) = null,
  //   loadColor: TypeColor = [0, 0, 1, 0.5],
  // ) {
  //   if (this.atlas == null) {
  //     this.atlas = {
  //       id: location,
  //       src: location,
  //       points,
  //       buffer: null,
  //       type: 'image',
  //       loadColor,
  //     };
  //   }
  //   this.onLoad = onLoad;
  // }

  /**
   * Buffer a texture for the shape to be painted with.
   */
  addTexture(
    location: string,
    mapFrom: Rect = new Rect(0, 0, 1, 1),
    mapTo: Rect = new Rect(-1, -1, 2, 2),
    mapToBuffer: string = 'a_vertex',
    points: Array<number> = [],
    repeat: boolean = false,
    onLoad: null | (() => void) = null,
    loadColor: TypeColor = [0, 0, 1, 0.5],
    // isAtlas: boolean = false,
  ) {
    if (this.texture == null) {
      this.texture = {
        id: location,
        mapTo: getRect(mapTo),
        mapFrom: getRect(mapFrom),
        repeat,
        src: location,
        points,
        buffer: this.gl.createBuffer(),
        type: 'image',
        data: null,
        mapToBuffer,
        loadColor,
        // isAtlas,
      };
    }
    this.onLoad = onLoad;
  }

  updateTexture(data: Image) {
    const { texture } = this;
    if (texture == null) {
      throw new Error('FigureOne GLObject Error: Cannot update an uninitialized texture');
    }
    texture.data = data;
    this.initTexture(true);
  }

  initTexture(force: boolean = false) {
    const {
      texture, webgl,
    } = this;

    if (texture == null) {
      return;
    }

    const {
      loadColor, points, id, data, repeat, src,
    } = texture;

    // texture.buffer = this.gl.createBuffer();

    // $FlowFixMe
    this.updateTextureMap(points);
    // gl.bindBuffer(gl.ARRAY_BUFFER, texture.buffer);
    // gl.bufferData(
    //   gl.ARRAY_BUFFER,
    //   new Float32Array(texture.points),
    //   gl.STATIC_DRAW,
    // );
    webgl.addTexture(
      id, data || src, loadColor, repeat, this.executeOnLoad.bind(this), force,
    );
    this.state = webgl.textures[texture.id].state;
    // if (
    //   !(texture.id in webgl.textures)
    //   || (
    //     texture.id in webgl.textures
    //     && webgl.textures[texture.id].glTexture == null
    //   )
    // ) {
    //   const glTexture = gl.createTexture();
    //   webgl.addTexture(texture.id, glTexture, texture.type);
    //   gl.activeTexture(
    //     gl.TEXTURE0 + webgl.textures[texture.id].index,
    //   );
    //   gl.bindTexture(gl.TEXTURE_2D, glTexture);
    //   const { src } = texture;
    //   if (src && texture.data == null) {
    //     // Fill the texture with a 1x1 blue pixel.
    //     gl.texImage2D(
    //       gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
    //       gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(colorToInt(loadColor)),
    //     );
    //     const image = new Image();
    //     image.src = src;

    //     this.state = 'loading';
    //     webgl.textures[texture.id].state = 'loading';
    //     webgl.textures[texture.id].onLoad.push(this.executeOnLoad.bind(this));
    //     image.addEventListener('load', () => {
    //       // Now that the image has loaded make copy it to the texture.
    //       // $FlowFixMe
    //       texture.data = image;
    //       this.addTextureToBuffer(
    //         glTexture, texture.data, texture.repeat,
    //       );
    //       // if (this.onLoad != null) {
    //       webgl.onLoad(texture.id);
    //       // this.onLoad();
    //       // }
    //       this.state = 'loaded';
    //       webgl.textures[texture.id].state = 'loaded';
    //     });
    //   } else if (texture.data != null) {
    //     this.addTextureToBuffer(
    //       glTexture, texture.data, texture.repeat,
    //     );
    //   }
    // } else if (texture.id in webgl.textures) {
    //   if (webgl.textures[texture.id].state === 'loading') {
    //     this.state = 'loading';
    //     webgl.textures[texture.id].onLoad.push(this.executeOnLoad.bind(this));
    //   } else {
    //     this.state = 'loaded';
    //   }
    // }
  }

  // A texture map is a texture coords point that lines up with the texture
  // vertex point. So, if the vertex shape is rectangular, centered at the
  // origin and wants to incorporate the entire texture, then the map would
  // be:
  // vertex space            texture space
  // this.points         this.texture.points
  //    -1,  -1,                  0,  0
  //    -1,   1,                  0,  1
  //     1,   1,                  1,  1
  //     1,  -1,                  1,  0
  createTextureMap(
    xMinGL: number = -1,
    xMaxGL: number = 1,
    yMinGL: number = -1,
    yMaxGL: number = 1,
    xMinTex: number = 0,
    xMaxTex: number = 1,
    yMinTex: number = 0,
    yMaxTex: number = 1,
  ) {
    const glWidth = xMaxGL - xMinGL;
    const glHeight = yMaxGL - yMinGL;
    const texWidth = xMaxTex - xMinTex;
    const texHeight = yMaxTex - yMinTex;
    const { texture } = this;
    if (texture == null) {
      return;
    } // $FlowFixMe
    const buffer = this.attributes[texture.mapToBuffer];
    if (buffer == null) { // $FlowFixMe
      throw new Error(`FigureOne mapToAttribute buffer ('${texture.mapToBuffer}') does not exist. Available attributes: ${JSON.stringify(Object.keys(this.attributes))}.`);
    }
    if (texture != null) {
      texture.points = [];
      for (let i = 0; i < buffer.data.length; i += buffer.size) {
        const x = buffer.data[i];
        const y = buffer.data[i + 1];
        const texNormX = (x - xMinGL) / glWidth;
        const texNormY = (y - yMinGL) / glHeight;
        texture.points.push(texNormX * texWidth + xMinTex);
        texture.points.push(texNormY * texHeight + yMinTex);
      }
    }
  }

  addVertices(vertices: Array<number>, dimension: 2 | 3 = 2, usage: TypeGLBufferUsage = 'STATIC') {
    this.points = vertices;
    this.addAttribute('a_vertex', dimension, vertices, 'FLOAT', false, 0, 0, usage);
    // this.numVertices = vertices.length / 2;
  }

  addVertices3(vertices: Array<number>, usage: TypeGLBufferUsage = 'STATIC') {
    this.points = vertices;
    this.addAttribute('a_vertex', 3, vertices, 'FLOAT', false, 0, 0, usage);
    // this.numVertices = vertices.length / 3;
  }

  addNormals(normals: Array<number>, usage: TypeGLBufferUsage = 'STATIC') {
    this.addAttribute('a_normal', 3, normals, 'FLOAT', false, 0, 0, usage);
  }

  addColors(colors: Array<number>, normalized: boolean = false, usage: TypeGLBufferUsage = 'STATIC') {
    if (normalized) {
      this.addAttribute('a_color', 4, colors, 'UNSIGNED_BYTE', true, 0, 0, usage);
    } else {
      this.addAttribute('a_color', 4, colors, 'FLOAT', false, 0, 0, usage);
    }
  }

  // addColorsNorm(colors: Array<number>, usage: TypeGLBufferUsage = 'STATIC') {
  //   this.addAttribute('a_color', 4, colors, 'UNSIGNED_BYTE', true, 0, 0, usage);
  // }

  addAttribute(
    name: string,
    size: number,
    data: Array<number>,
    typeIn: TypeGLBufferType = 'FLOAT',
    normalize: boolean = false,
    stride: number = 0,
    offset: number = 0,
    usageIn: TypeGLBufferUsage = 'STATIC',
  ) {
    const { gl } = this;
    let usage = gl.STATIC_DRAW;
    if (usageIn === 'DYNAMIC') {
      usage = gl.DYNAMIC_DRAW;
    }
    let type;
    if (typeIn === 'FLOAT') {
      type = gl.FLOAT;
    } else if (typeIn === 'UNSIGNED_BYTE') {
      type = gl.UNSIGNED_BYTE;
    } else if (typeIn === 'BYTE') {
      type = gl.BYTE;
    } else if (typeIn === 'SHORT') {
      type = gl.SHORT;
    } else if (typeIn === 'UNSIGNED_SHORT') {
      type = gl.UNSIGNED_SHORT;
    } else {
      throw new Error(`GLObject addAttribute usage needs to be FLOAT, BYTE, SHORT, UNSIGNED_BYTE or UNSIGNED_SHORT - received: "${typeIn}"`);
    }
    this.attributes[name] = {
      // buffer: gl.createBuffer(),
      buffer: null,
      size,
      type,
      normalize,
      stride,
      offset,
      usage,
      // len: data.length,
      data,
    };
    const numVertices = data.length / size;
    if (this.numVertices !== 0 && numVertices !== this.numVertices) {
      throw new Error(`Figure One Error: Adding GL attribute ${name} with wrong length (${numVertices} vertices) when previously defined attributes used ${this.numVertices} vertices`);
    }
    if (this.numVertices === 0) {
      this.numVertices = numVertices;
    }
    if (name === 'a_vertex') {
      this.points = data;
    }
    this.fillBuffer(name, data);
  }

  fillBuffer(
    name: string,
    data: Array<number>,
  ) {
    const { gl } = this;
    let processedData;
    const { type, usage } = this.attributes[name];
    if (type === gl.FLOAT) {
      processedData = new Float32Array(data);
    } else if (type === gl.UNSIGNED_BYTE) {
      processedData = new Uint8Array(data);
    } else if (type === gl.BYTE) {
      processedData = new Int8Array(data);
    } else if (type === gl.SHORT) {
      processedData = new Int16Array(data);
    } else if (type === gl.UNSIGNED_SHORT) {
      processedData = new Uint16Array(data);
    }
    this.attributes[name].buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.attributes[name].buffer);
    gl.bufferData(gl.ARRAY_BUFFER, processedData, usage);
  }

  executeOnLoad(result: boolean, id: string) {
    if (this.onLoad != null) {
      this.onLoad(result, id);
    }
  }

  resetTextureBuffer() {
    const { texture, webgl, gl } = this;
    if (texture) {
      if (webgl.textures[texture.id].glTexture != null) {
        gl.activeTexture(gl.TEXTURE0 + webgl.textures[texture.id].index);
        gl.bindTexture(gl.TEXTURE_2D, null);
        // gl.deleteTexture(webgl.textures[texture.id].glTexture);
        webgl.textures[texture.id].glTexture = null;
      }
      if (texture.buffer != null) {
        gl.deleteBuffer(texture.buffer);
        // $FlowFixMe
        texture.buffer = null;
      }
      // texture.glTexture = null;
    }
  }

  resetBuffers() {
    const { gl } = this;
    Object.keys(this.attributes).forEach((attributeName) => {
      if (this.attributes[attributeName].buffer != null) {
        gl.deleteBuffer(this.attributes[attributeName].buffer);
      }
      this.attributes[attributeName].buffer = null;
    });
    this.attributes = {};
    this.resetTextureBuffer();
  }

  updateVertices(vertices: Array<number>) {
    this.points = vertices;
    this.updateAttribute('a_vertex', vertices);
  }

  updateVertices3(vertices: Array<number>) {
    this.points = vertices;
    // this.numVertices = vertices.length / 3;
    this.updateAttribute('a_vertex', vertices);
  }

  updateAttribute(name: string, data: Array<number>) {
    if (this.attributes[name].buffer != null) {
      this.gl.deleteBuffer(this.attributes[name].buffer);
    }
    this.attributes[name].buffer = null;
    this.fillBuffer(name, data);
    this.attributes[name].data = data;
    // this.attributes[name].len = data.length;
    this.numVertices = this.attributes[name].data.length / this.attributes[name].size;
    if (name === 'a_vertex') {
      this.points = data;
    }
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
    ];
  }

  /**
   * Get the current value of a uniform
   */
  getUniform(uniformName: string) {
    const uniform = this.uniforms[uniformName]; // $FlowFixMe
    return uniform.value;
  }

  /**
   * Add a uniform.
   *
   * Length 16 corresponds to a 4x4 matrix and can only be
   * `'FLOAT_VECTOR'` type.
   *
   * @param {string} uniformName The variable name used in the shader
   * @param {1 | 2 | 3 | 4 | 16} length (`1`) number of values in uniform
   * @param {'FLOAT' | 'FLOAT_VECTOR' | 'INT' | 'INT_VECTOR'} type type of
   * value. Use '_VECTOR' suffix if using vector methods on the uniform in the
   * shader (`'FLOAT'`).
   * @param {number | Array<number> | null} initialValue initial value to use
   * for uniform - if null then uniform will be all 0 (`null`)
   */
  addUniform(
    uniformName: string,
    length: 1 | 2 | 3 | 4 | 16 = 1,
    type: TypeGLUniform = 'FLOAT',
    initialValue: number | Array<number> | null = null,
  ) {
    let typeToUse = type;
    if (length === 16) {
      typeToUse = 'FLOAT_VECTOR';
    }
    this.uniforms[uniformName] = {
      value: Array(length).fill(0), // $FlowFixMe
      method: this[`uploadUniform${length.toString()}${typeToUse[0].toLowerCase()}${typeToUse.endsWith('VECTOR') ? 'v' : ''}`].bind(this),
    };
    if (initialValue != null) {
      this.updateUniform(uniformName, initialValue);
    }
  }

  uploadUniform1f(location: WebGLUniformLocation, name: string) {
    this.gl.uniform1f(location, this.uniforms[name].value[0]);
  }

  uploadUniform2f(location: WebGLUniformLocation, name: string) {
    this.gl.uniform2f(location, this.uniforms[name].value[0], this.uniforms[name].value[1]);
  }

  uploadUniform3f(location: WebGLUniformLocation, name: string) {
    // eslint-disable-next-line max-len
    this.gl.uniform3f(location, this.uniforms[name].value[0], this.uniforms[name].value[1], this.uniforms[name].value[2]);
  }

  uploadUniform4f(location: WebGLUniformLocation, name: string) {
    // eslint-disable-next-line max-len
    this.gl.uniform4f(location, this.uniforms[name].value[0], this.uniforms[name].value[1], this.uniforms[name].value[2], this.uniforms[name].value[3]);
  }

  uploadUniform1fv(location: WebGLUniformLocation, name: string) {
    this.gl.uniform1fv(location, this.uniforms[name].value);
  }

  uploadUniform2fv(location: WebGLUniformLocation, name: string) {
    this.gl.uniform2fv(location, this.uniforms[name].value);
  }

  uploadUniform3fv(location: WebGLUniformLocation, name: string) {
    this.gl.uniform3fv(location, this.uniforms[name].value);
  }

  uploadUniform4fv(location: WebGLUniformLocation, name: string) {
    this.gl.uniform4fv(location, this.uniforms[name].value);
  }

  uploadUniform1iv(location: WebGLUniformLocation, name: string) {
    this.gl.uniform1iv(location, new Int32Array(this.uniforms[name].value));
  }

  uploadUniform2iv(location: WebGLUniformLocation, name: string) {
    this.gl.uniform2iv(location, new Int32Array(this.uniforms[name].value));
  }

  uploadUniform3iv(location: WebGLUniformLocation, name: string) {
    this.gl.uniform3iv(location, new Int32Array(this.uniforms[name].value));
  }

  uploadUniform4iv(location: WebGLUniformLocation, name: string) {
    this.gl.uniform4iv(location, new Int32Array(this.uniforms[name].value));
  }

  uploadUniform16fv(location: WebGLUniformLocation, name: string) {
    // this.gl.uniformMatrix4fv(location, this.uniforms[name].value);
    // $FlowFixMe
    this.gl.uniformMatrix4fv(
      location,
      false,  // $FlowFixMe
      m3.transpose(this.uniforms[name].value),
    );
  }


  uploadUniform1i(location: WebGLUniformLocation, name: string) {
    this.gl.uniform1i(location, this.uniforms[name].value[0]);
  }

  uploadUniform2i(location: WebGLUniformLocation, name: string) {
    this.gl.uniform2i(location, this.uniforms[name].value[0], this.uniforms[name].value[1]);
  }

  uploadUniform3i(location: WebGLUniformLocation, name: string) {
    // eslint-disable-next-line max-len
    this.gl.uniform3i(location, this.uniforms[name].value[0], this.uniforms[name].value[1], this.uniforms[name].value[2]);
  }

  uploadUniform4i(location: WebGLUniformLocation, name: string) {
    // eslint-disable-next-line max-len
    this.gl.uniform4i(location, this.uniforms[name].value[0], this.uniforms[name].value[1], this.uniforms[name].value[2], this.uniforms[name].value[3]);
  }


  updateUniform(uniformName: string, value: number | Array<number>) {
    this.uniforms[uniformName].value = Array.isArray(value) ? value : [value];
  }

  drawWithTransformMatrix(
    scene: Scene,
    worldMatrix: Type3DMatrix,
    color: TypeColor,
    numDrawVertices: number = this.numVertices,
    targetTexture: boolean = false,
  ) {
    // if (targetTexture) {
    //   this.drawToSelectorTexture(drawGlobals, worldMatrix, color, numDrawVertices);
    //   return;
    // }
    const { gl } = this;
    const webglInstance = this.webgl;

    let locations;
    if (targetTexture) {
      locations = webglInstance.useProgram(this.selectorProgramIndex);
    } else {
      locations = webglInstance.useProgram(this.programIndex);
    }
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // gl.enable(gl.CULL_FACE);
    if (scene.style !== '2D') {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }

    Object.keys(this.attributes).forEach((attributeName) => {
      if (targetTexture && attributeName !== 'a_vertex') {
        return;
      }
      const {
        buffer, size, type, stride, offset, normalize,
      } = this.attributes[attributeName];
      gl.enableVertexAttribArray(locations[attributeName]);
      // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      gl.vertexAttribPointer(
        locations[attributeName],
        size, type, normalize, stride, offset,
      );
    });

    if (locations.u_directionalLight != null) {
      gl.uniform3fv(
        locations.u_directionalLight,
        getPoint(scene.light.directional).normalize().toArray(),
      );
    }

    if (locations.u_lightWorldPosition != null) {
      gl.uniform3fv(
        locations.u_lightWorldPosition,
        getPoint(scene.light.point).toArray(),
      );
    }

    if (locations.u_ambientLight != null) {
      gl.uniform1f(
        locations.u_ambientLight,
        scene.light.ambient,
      );
    }

    if (locations.u_worldInverseTranspose != null) {  // $FlowFixMe
      gl.uniformMatrix4fv(
        locations.u_worldInverseTranspose,
        false,
        m3.inverse(worldMatrix),
      );
    }

    if (locations.u_worldViewProjectionMatrix != null) {  // $FlowFixMe
      gl.uniformMatrix4fv(
        locations.u_worldViewProjectionMatrix,
        false,
        m3.transpose(m3.mul(scene.viewProjectionMatrix, worldMatrix)),
      );
    }

    if (locations.u_worldMatrix != null) {  // $FlowFixMe
      gl.uniformMatrix4fv(
        locations.u_worldMatrix,
        false,
        m3.transpose(worldMatrix),
      );
    }

    if (locations.u_projectionMatrix != null) {  // $FlowFixMe
      gl.uniformMatrix4fv(
        locations.u_projectionMatrix,
        false,
        m3.transpose(scene.projectionMatrix),
      );
    }

    if (locations.u_viewMatrix != null) {  // $FlowFixMe
      gl.uniformMatrix4fv(
        locations.u_viewMatrix,
        false,
        m3.transpose(scene.viewMatrix),
      );
    }

    Object.keys(this.uniforms).forEach((uniformName) => {
      const { method } = this.uniforms[uniformName];
      method(locations[uniformName], uniformName);
    });

    gl.uniform1f(locations.u_z, this.z);

    gl.uniform4f(
      locations.u_color,
      color[0], color[1], color[2], color[3],
    );

    const { texture } = this;
    if (texture != null && targetTexture === false) {
      // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      const texSize = 2;          // 2 components per iteration
      const texType = gl.FLOAT;   // the data is 32bit floats
      const texNormalize = false; // don't normalize the data
      const texStride = 0;
      // 0 = move forward size * sizeof(type) each iteration to get
      // the next position
      const texOffset = 0;        // start at the beginning of the buffer

      gl.enableVertexAttribArray(locations.a_texcoord);
      // $FlowFixMe
      gl.bindBuffer(gl.ARRAY_BUFFER, texture.buffer);
      gl.vertexAttribPointer(
        locations.a_texcoord, texSize, texType,
        texNormalize, texStride, texOffset,
      );
      gl.uniform1i(locations.u_use_texture, 1);
      const { index } = webglInstance.textures[texture.id];
      gl.uniform1i(locations.u_texture, index);
    } else {
      gl.uniform1i(locations.u_use_texture, 0);
    }

    gl.drawArrays(this.glPrimitive, 0, numDrawVertices);

    if (texture) {
      gl.disableVertexAttribArray(locations.a_texcoord);
    }
    Object.keys(this.attributes).forEach((attributeName) => {
      gl.disableVertexAttribArray(locations[attributeName]);
    });
  }

  // eslint-disable-next-line no-unused-vars
  getPointCountForAngle(drawAngle: number = Math.PI * 2) {
    return this.numVertices;
  }

  // Abstract method - should be reimplemented for any vertexObjects that
  // eslint-disable-next-line no-unused-vars
  getPointCountForLength(drawLength: number) {
    return this.numVertices;
  }

  // drawToSelectorTexture(
  //   drawGlobals: OBJ_DrawGlobals,
  //   worldMatrix: Type3DMatrix,
  //   color: TypeColor,
  //   numDrawVertices: number = this.numVertices,
  // ) {
  //   const { gl } = this;
  //   const webglInstance = this.webgl;

  //   const locations = webglInstance.useProgram(this.selectorProgramIndex);

  //   gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
  //   gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  //   // gl.enable(gl.CULL_FACE);
  //   gl.enable(gl.DEPTH_TEST);

  //   Object.keys(this.attributes).forEach((attributeName) => {
  //     if (attributeName !== 'a_vertex') {
  //       return;
  //     }
  //     const {
  //       buffer, size, type, stride, offset, normalize,
  //     } = this.attributes[attributeName];
  //     gl.enableVertexAttribArray(locations[attributeName]);
  //     // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  //     gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  //     // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  //     gl.vertexAttribPointer(
  //       locations[attributeName],
  //       size, type, normalize, stride, offset,
  //     );
  //   });

  //   if (locations.u_directionalLight != null) {
  //     gl.uniform3fv(
  //       locations.u_directionalLight,
  //       getPoint(drawGlobals.light.directional).normalize().toArray(),
  //     );
  //   }

  //   if (locations.u_lightWorldPosition != null) {
  //     gl.uniform3fv(
  //       locations.u_lightWorldPosition,
  //       getPoint(drawGlobals.light.point).toArray(),
  //     );
  //   }

  //   if (locations.u_ambientLight != null) {
  //     gl.uniform1f(
  //       locations.u_ambientLight,
  //       drawGlobals.light.min,
  //     );
  //   }

  //   if (locations.u_worldInverseTranspose != null) {  // $FlowFixMe
  //     gl.uniformMatrix4fv(
  //       locations.u_worldInverseTranspose,
  //       false,
  //       m3.inverse(worldMatrix),
  //     );
  //   }

  //   if (locations.u_worldViewProjectionMatrix != null) {  // $FlowFixMe
  //     gl.uniformMatrix4fv(
  //       locations.u_worldViewProjectionMatrix,
  //       false,
  //       m3.transpose(m3.mul(drawGlobals.viewProjectionMatrix, worldMatrix)),
  //     );
  //   }

  //   if (locations.u_worldMatrix != null) {  // $FlowFixMe
  //     gl.uniformMatrix4fv(
  //       locations.u_worldMatrix,
  //       false,
  //       m3.transpose(worldMatrix),
  //     );
  //   }

  //   if (locations.u_projectionMatrix != null) {  // $FlowFixMe
  //     gl.uniformMatrix4fv(
  //       locations.u_projectionMatrix,
  //       false,
  //       m3.transpose(drawGlobals.projectionMatrix),
  //     );
  //   }

  //   if (locations.u_viewMatrix != null) {  // $FlowFixMe
  //     gl.uniformMatrix4fv(
  //       locations.u_viewMatrix,
  //       false,
  //       m3.transpose(drawGlobals.viewMatrix),
  //     );
  //   }

  //   Object.keys(this.uniforms).forEach((uniformName) => {
  //     const { method } = this.uniforms[uniformName];
  //     method(locations[uniformName], uniformName);
  //   });

  //   gl.uniform1f(locations.u_z, this.z);

  //   console.log(color)
  //   gl.uniform4f(
  //     locations.u_color,
  //     color[0], color[1], color[2], color[3],
  //     // 1, 0, 0, 1,
  //   );

  //   gl.drawArrays(this.glPrimitive, 0, numDrawVertices);
  // }
}


export default GLObject;
