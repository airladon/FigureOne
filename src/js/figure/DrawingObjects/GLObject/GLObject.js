// @flow

// import * as g2 from '../g2';
import * as m2 from '../../../tools/m2';
import WebGLInstance from '../../webgl/webgl';
import { Rect } from '../../../tools/g2';
// import type { TypeParsablePoint } from '../../../tools/g2';
import DrawingObject from '../DrawingObject';
// import type { CPY_Step } from '../../geometries/copy/copy';
import type { TypeColor } from '../../../tools/types';

/**
 * `'BYTE' | 'UNSIGNED_BYTE' | 'SHORT' | 'UNSIGNED_SHORT' | 'FLOAT'`
 */
export type TypeGLBufferType = 'BYTE' | 'UNSIGNED_BYTE' | 'SHORT' | 'UNSIGNED_SHORT' | 'FLOAT';

/**
 * `'STATIC' | 'DYNAMIC'`
 */
export type TypeGLBufferUsage = 'STATIC' | 'DYNAMIC';

/**
 * `'FLOAT' | 'FLOAT_ARRAY' | 'INT' | 'INT_ARRAY'`
 */
export type TypeGLUniform = 'FLOAT' | 'FLOAT_ARRAY' | 'INT' | 'INT_ARRAY';

class GLObject extends DrawingObject {
  gl: WebGLRenderingContext;
  webgl: WebGLInstance;
  glPrimitive: number;

  z: number;

  texture: ?{
    id: string;
    src?: ?string;
    data?: ?Object;
    points: Array<number>;
    buffer?: ?WebGLBuffer;
    type: 'canvasText' | 'image';
    repeat?: boolean;
    mapTo: Rect,
    mapFrom: Rect,
    data?: ?Image,
  };

  buffers: {
    [bufferName: string]: {
      buffer: WebGLBuffer,
      size: number,
      type: number,
      normalize: boolean,
      stride: number,
      offset: number,
      usage: number,
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
  onLoad: ?(() => void);


  constructor(
    webgl: WebGLInstance,
    vertexShader: string | { src: string, vars: Array<string> } = 'withTexture',
    fragmentShader: string | { src: string, vars: Array<string> } = 'withTexture',
  ) {
    super();
    this.gl = webgl.gl;
    this.glPrimitive = this.gl.TRIANGLES;
    this.webgl = webgl;
    this.z = 0;
    this.programIndex = this.webgl.getProgram(vertexShader, fragmentShader);
    this.type = 'glPrimitive';
    this.buffers = {};
    this.numVertices = 0;
    this.uniforms = {};
    this.texture = null;
  }

  setPrimitive(primitiveType: 'TRIANGLES' | 'POINTS' | 'TRIANGLE_FAN' | 'TRIANGLE_STRIP' | 'LINES' | 'LINE_LOOP' | 'LINE_STRIP') {
    if (primitiveType === 'TRIANGLES') {
      this.glPrimitive = this.gl.TRIANGLES;
    } else if (primitiveType === 'LINES') {
      this.glPrimitive = this.gl.LINES;
    } else if (primitiveType === 'TRIANGLE_FAN') {
      this.glPrimitive = this.gl.TRIANGLE_FAN;
    } else if (primitiveType === 'TRIANGLE_STRIP') {
      this.glPrimitive = this.gl.TRIANGLE_STRIP;
    } else if (primitiveType === 'POINTS') {
      this.glPrimitive = this.gl.POINTS;
    } else if (primitiveType === 'LINE_LOOP') {
      this.glPrimitive = this.gl.LINE_LOOP;
    } else if (primitiveType === 'LINE_STRIP') {
      this.glPrimitive = this.gl.LINE_STRIP;
    } else {
      throw new Error(`Primitive type can only be ['TRIANGLES' | 'POINTS' | 'TRIANGLE_FAN' | 'TRIANGLE_STRIP' | 'LINES' | 'LINE_LOOP' | 'LINE_STRIP']. Input primitive type was: '${primitiveType}'`);
    }
  }


  setZ(z: number) {
    this.z = z;
  }

  addTextureToBuffer(
    glTexture: WebGLTexture,
    image: Object, // image data
    repeat?: boolean,
  ) {
    function isPowerOf2(value) {
      // eslint-disable-next-line no-bitwise
      return (value & (value - 1)) === 0;
    }
    const { texture, gl, webgl } = this;
    if (texture != null) {
      const { index } = webgl.textures[texture.id];
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, image,
      );
      // Check if the image is a power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
        if (repeat != null && repeat === true) {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
      } else {
        // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
    }
  }

  updateTextureMap() {
    const { texture } = this;
    if (texture == null) {
      return;
    }
    if (texture.buffer != null) {
      this.gl.deleteBuffer(texture.buffer);
      texture.buffer = this.gl.createBuffer();
    }
    this.createTextureMap(
      texture.mapTo.left, texture.mapTo.right,
      texture.mapTo.bottom, texture.mapTo.top,
      texture.mapFrom.left, texture.mapFrom.right,
      texture.mapFrom.bottom, texture.mapFrom.top,
    );
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texture.buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(texture.points),
      this.gl.STATIC_DRAW,
    );
  }


  /**
   * Buffer a texture for the shape to be painted with.
   */
  addTexture(
    location: string,
    mapTo: Rect = new Rect(-1, -1, 2, 2),
    mapFrom: Rect = new Rect(0, 0, 1, 1),
    repeat: boolean = false,
  ) {
    if (this.texture == null) {
      this.texture = {
        id: location,
        mapTo,
        mapFrom,
        repeat,
        src: location,
        points: [],
        buffer: this.gl.createBuffer(),
        type: 'image',
        data: null,
      };
    }

    const { texture, gl, webgl } = this;
    if (texture == null) {
      return;
    }

    // $FlowFixMe
    this.updateTextureMap();
    // gl.bindBuffer(gl.ARRAY_BUFFER, texture.buffer);
    // gl.bufferData(
    //   gl.ARRAY_BUFFER,
    //   new Float32Array(texture.points),
    //   gl.STATIC_DRAW,
    // );
    if (
      !(texture.id in webgl.textures)
      || (
        texture.id in webgl.textures
        && webgl.textures[texture.id].glTexture == null
      )
    ) {
      const glTexture = gl.createTexture();
      webgl.addTexture(texture.id, glTexture, texture.type);
      gl.activeTexture(
        gl.TEXTURE0 + webgl.textures[texture.id].index,
      );
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      const { src } = texture;
      if (src && texture.data == null) {
        // Fill the texture with a 1x1 blue pixel.
        gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
          gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 100]),
        );
        const image = new Image();
        image.src = src;

        this.state = 'loading';
        webgl.textures[texture.id].state = 'loading';
        webgl.textures[texture.id].onLoad.push(this.executeOnLoad.bind(this));
        image.addEventListener('load', () => {
          // Now that the image has loaded make copy it to the texture.
          // $FlowFixMe
          texture.data = image;
          this.addTextureToBuffer(
            glTexture, texture.data, texture.repeat,
          );
          // if (this.onLoad != null) {
          webgl.onLoad(texture.id);
          // this.onLoad();
          // }
          this.state = 'loaded';
          webgl.textures[texture.id].state = 'loaded';
        });
      } else if (texture.data != null) {
        this.addTextureToBuffer(
          glTexture, texture.data, texture.repeat,
        );
      }
    } else if (texture.id in webgl.textures) {
      if (webgl.textures[texture.id].state === 'loading') {
        this.state = 'loading';
        webgl.textures[texture.id].onLoad.push(this.executeOnLoad.bind(this));
      } else {
        this.state = 'loaded';
      }
    }
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
    if (texture != null) {
      texture.points = [];
      for (let i = 0; i < this.points.length; i += 2) {
        const x = this.points[i];
        const y = this.points[i + 1];
        const texNormX = (x - xMinGL) / glWidth;
        const texNormY = (y - yMinGL) / glHeight;
        texture.points.push(texNormX * texWidth + xMinTex);
        texture.points.push(texNormY * texHeight + yMinTex);
      }
    }
  }

  addVertices(vertices: Array<number>, usage: TypeGLBufferUsage = 'STATIC') {
    this.points = vertices;
    this.addBuffer('a_position', 2, vertices, 'FLOAT', false, 0, 0, usage);
    this.numVertices = vertices.length / 2;
  }

  addBuffer(
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
      throw new Error(`GLObject addBuffer usage needs to be FLOAT, BYTE, SHORT, UNSIGNED_BYTE or UNSIGNED_SHORT - received: "${typeIn}"`);
    }
    this.buffers[name] = {
      // buffer: gl.createBuffer(),
      buffer: null,
      size,
      type,
      normalize,
      stride,
      offset,
      usage,
    };
    this.fillBuffer(name, data);
  }

  fillBuffer(
    name: string,
    data: Array<number>,
  ) {
    const { gl } = this;
    let processedData;
    const { type, usage } = this.buffers[name];
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
    this.buffers[name].buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[name].buffer);
    gl.bufferData(gl.ARRAY_BUFFER, processedData, usage);
  }

  executeOnLoad() {
    if (this.onLoad != null) {
      this.onLoad();
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
    Object.keys(this.buffers).forEach((bufferName) => {
      gl.deleteBuffer(this.buffers[bufferName].buffer);
      this.buffers[bufferName].buffer = null;
    });
    this.buffers = {};
    this.resetTextureBuffer();
  }

  updateVertices(vertices: Array<number>) {
    this.points = vertices;
    this.numVertices = vertices.length / 2;
    this.updateBuffer('a_position', vertices);
  }

  updateBuffer(name: string, data: Array<number>) {
    this.gl.deleteBuffer(this.buffers[name].buffer);
    this.buffers[name].buffer = null;
    this.fillBuffer(name, data);
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
    ];
  }

  /**
   * Get the current value of a uniform
   */
  getUniform(uniformName: string) {
    const uniform = this.uniforms[uniformName];
    return uniform.value;
  }

  /**
   * Add a uniform.
   *
   * @param {string} uniformName The variable name used in the shader
   * @param {1 | 2 | 3 | 4} length (1) number of values in uniform
   * @param {'FLOAT' | 'FLOAT_VECTOR' | 'INT' | 'INT_VECTOR'} type type of
   * value. Use '_VECTOR' suffix if using vector methods on the uniform in the
   * shader.
   */
  addUniform(
    uniformName: string,
    length: 1 | 2 | 3 | 4 = 1,
    type: TypeGLUniform = 'FLOAT',
  ) {
    this.uniforms[uniformName] = {
      value: Array(length).fill(0), // $FlowFixMe
      method: this[`uploadUniform${length.toString()}${type[0].toLowerCase()}${type.endsWith('VECTOR') ? 'v' : ''}`].bind(this),
    };
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
    transformMatrix: Array<number>,
    color: TypeColor,
    numDrawVertices: number = this.numVertices,
  ) {
    const { gl } = this;
    const webglInstance = this.webgl;

    const locations = webglInstance.useProgram(this.programIndex);

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    Object.keys(this.buffers).forEach((bufferName) => {
      const {
        buffer, size, type, stride, offset, normalize,
      } = this.buffers[bufferName];
      gl.enableVertexAttribArray(locations[bufferName]);
      // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      gl.vertexAttribPointer(
        locations[bufferName],
        size, type, normalize, stride, offset,
      );
    });

    gl.uniformMatrix3fv(
      locations.u_matrix,
      false,
      m2.t(transformMatrix),
    );

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
    if (texture != null) {
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
  }
}

export default GLObject;
