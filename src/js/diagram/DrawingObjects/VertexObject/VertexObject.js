// @flow

// import * as g2 from '../g2';
import * as m2 from '../../../tools/m2';
import WebGLInstance from '../../webgl/webgl';
import * as g2 from '../../../tools/g2';
import DrawingObject from '../DrawingObject';

// Base clase of all shape objects made from verteces for webgl.
// The job of a VertexObject is to:
//  - Have the points of a object/shape
//  - Have the shape's border (used to determine whether a location is
//    within the shape)
//  - Setup the webgl buffer
//  - Draw the shape
class VertexObject extends DrawingObject {
  gl: Array<WebGLRenderingContext>;    // shortcut for the webgl context
  webgl: Array<WebGLInstance>;         // webgl instance for a html canvas
  glPrimitive: number;                  // primitive tyle (e.g. TRIANGLE_STRIP)
  buffer: Array<WebGLBuffer>;          // Vertex buffer
  // textureBuffer: WebGLBuffer;

  points: Array<number>;        // Primitive vertices of shape
  numPoints: number;            // Number of primative vertices
  border: Array<Array<g2.Point>>; // Border vertices
  z: number;
  texture: ?{
    id: string;
    src?: ?string;
    data?: ?Object;
    points: Array<number>;
    buffer?: Array<WebGLBuffer>;
    type: 'canvasText' | 'image';
  };

  state: 'loading' | 'loaded';

  +change: (Array<g2.Point>) => void;
  programIndex: Array<number>;

  constructor(
    webgl: Array<WebGLInstance> | WebGLInstance,
    vertexShader: string = 'simple',
    fragmentShader: string = 'simple',
  ) {
    super();
    this.numPoints = 0;
    let webglArray;
    if (Array.isArray(webgl)) {
      webglArray = webgl;
    } else {
      webglArray = [webgl];
    }
    this.gl = webglArray.map(w => w.gl);
    this.webgl = webglArray;
    this.glPrimitive = webglArray[0].gl.TRIANGLES;
    this.points = [];
    this.z = 0;
    this.buffer = webglArray.map(() => null);
    // this.textureLocation = '';
    // this.texturePoints = [];
    this.texture = null;
    this.programIndex = webglArray.map(w => w.getProgram(vertexShader, fragmentShader));
    this.type = 'vertexPrimitive';
  }

  addTextureToBuffer(
    glIndex: number,
    glTexture: WebGLTexture,
    image: Object, // image data
  ) {
    function isPowerOf2(value) {
      // eslint-disable-next-line no-bitwise
      return (value & (value - 1)) === 0;
    }
    const gl = this.gl[glIndex];
    const webgl = this.webgl[glIndex];
    const { texture } = this;
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
      } else {
        // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    }
  }

  setupBuffer(numPoints: number = 0) {
    for (let glIndex = 0; glIndex < this.webgl.length; glIndex += 1) {
      const gl = this.gl[glIndex];
      const webgl = this.webgl[glIndex];
      // const texture = this.texture[glIndex];
      // const buffer = this.buffer[glIndex];
      this.state = 'loaded';
      if (numPoints === 0) {
        this.numPoints = this.points.length / 2.0;
      } else {
        this.numPoints = numPoints;
      }

      // if (this.texture && this.texture.points == null) {
      //   this.texture.points = [];
      //   this.createTextureMap();
      // }

      const { texture } = this;
      if (texture != null) {
        if (texture.points == null) {
          texture.points = [];
        }
        if (texture.points.length === 0) {
          this.createTextureMap();
        }

        if (texture.buffer == null) {
          texture.buffer = this.gl.map(() => null);
        }

        // $FlowFixMe
        texture.buffer[glIndex] = gl.createBuffer();
        // $FlowFixMe
        gl.bindBuffer(gl.ARRAY_BUFFER, texture.buffer[glIndex]);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(texture.points),
          gl.STATIC_DRAW,
        );

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
          if (src) {
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
              texture.data = image;
              this.addTextureToBuffer(glIndex, glTexture, texture.data);
              // if (this.onLoad != null) {
              webgl.onLoad(texture.id);
              // this.onLoad();
              // }
              this.state = 'loaded';
              webgl.textures[texture.id].state = 'loaded';
            });
          } else if (texture.data != null) {
            this.addTextureToBuffer(glIndex, glTexture, texture.data);
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

      this.buffer[glIndex] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer[glIndex]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.points), gl.STATIC_DRAW);
    }
  }

  executeOnLoad() {
    if (this.onLoad != null) {
      this.onLoad();
    }
  }

  resetBuffer(numPoints: number = 0) {
    for (let glIndex = 0; glIndex < this.webgl.length; glIndex += 1) {
      const gl = this.gl[glIndex];
      const webgl = this.webgl[glIndex];
      const { texture } = this;
      if (texture) {
        // this.gl.activeTexture(this.gl.TEXTURE0 + texture.index);
        // this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        if (webgl.textures[texture.id].glTexture != null) {
          gl.deleteTexture(webgl.textures[texture.id].glTexture);
          webgl.textures[texture.id].glTexture = null;
        }
        if (texture.buffer != null) {
          gl.deleteBuffer(texture.buffer[glIndex]);
          // $FlowFixMe
          texture.buffer[glIndex] = null;
        }
        // texture.glTexture = null;
      }
      // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
      gl.deleteBuffer(this.buffer[glIndex]);
      this.setupBuffer(numPoints);
    }
  }

  // eslint-disable-next-line no-unused-vars
  change(coords: Array<g2.Point>) {
    this.resetBuffer();
  }

  // eslint-disable-next-line no-unused-vars
  update(options: Object) {
    this.resetBuffer();
  }

  changeVertices(coords: Array<g2.Point>, border: Array<Array<g2.Point>> = []) {
    this.points = [];
    this.border = [];
    let minX = null;
    let minY = null;
    let maxX = null;
    let maxY = null;
    coords.forEach((p) => {
      this.points.push(p.x);
      this.points.push(p.y);
      if (minX === null || p.x < minX) {
        minX = p.x;
      }
      if (minY === null || p.y < minY) {
        minY = p.y;
      }
      if (maxY === null || p.y > maxY) {
        maxY = p.y;
      }
      if (maxX === null || p.x > maxX) {
        maxX = p.x;
      }
    });
    if (border.length === 0) {
      if (minX != null && minY != null && maxX != null && maxY != null) {
        this.border[0] = [
          new g2.Point(minX, minY),
          new g2.Point(minX, maxY),
          new g2.Point(maxX, maxY),
          new g2.Point(maxX, minY),
        ];
      }
    } else {
      this.border = border;
    }
    this.resetBuffer();
  }

  // Abstract method - should be reimplemented for any vertexObjects that
  getPointCountForAngle(drawAngle: number = Math.PI * 2) {
    return this.numPoints * drawAngle / (Math.PI * 2);
  }

  // Abstract method - should be reimplemented for any vertexObjects that
  // eslint-disable-next-line no-unused-vars
  getPointCountForLength(drawLength: number) {
    return this.numPoints;
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

  draw(
    translation: g2.Point,
    rotation: number,
    scale: g2.Point,
    count: number,
    color: Array<number>,
    glIndex: number = 0,
    // webGLInstance: WebGLInstance = this.webgl,
  ) {
    let transformation = m2.identity();
    transformation = m2.translate(transformation, translation.x, translation.y);
    transformation = m2.rotate(transformation, rotation);
    transformation = m2.scale(transformation, scale.x, scale.y);
    this.drawWithTransformMatrix(m2.t(transformation), color, glIndex, count);
  }

  drawWithTransformMatrix(
    transformMatrix: Array<number>,
    color: Array<number>,
    glIndex: number,
    count: number,
    // webglInstance: WebGLInstance = this.webgl,
  ) {
    const gl = this.gl[glIndex];
    const webglInstance = this.webgl[glIndex];

    const size = 2;         // 2 components per iteration
    const type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false;    // don't normalize the data
    // 0 = move forward size * sizeof(type) each iteration to get
    // the next position
    const stride = 0;
    const offset = 0;       // start at the beginning of the buffer

    const locations = webglInstance.useProgram(this.programIndex[glIndex]);

    if (
      this.texture
      && webglInstance.textures[this.texture.id].type === 'canvasText'
    ) {
      // this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      // this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    } else {
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    // Turn on the attribute
    gl.enableVertexAttribArray(locations.a_position);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer[glIndex]);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(
      locations.a_position,
      size, type, normalize, stride, offset,
    );

    gl.uniformMatrix3fv(
      locations.u_matrix,
      false,
      m2.t(transformMatrix),
    );  // Translate

    gl.uniform1f(locations.u_z, this.z);

    gl.uniform4f(
      locations.u_color,
      color[0], color[1], color[2], color[3],
    );  // Translate

    const { texture } = this;
    if (texture != null) {
      // Textures
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
      gl.bindBuffer(gl.ARRAY_BUFFER, texture.buffer[glIndex]);
      gl.vertexAttribPointer(
        locations.a_texcoord, texSize, texType,
        texNormalize, texStride, texOffset,
      );
    }
    if (texture) {
      gl.uniform1i(locations.u_use_texture, 1);
      const { index } = webglInstance.textures[texture.id];
      // console.log(texture.id, index, webglInstance.textures)
      gl.uniform1i(locations.u_texture, index);
    } else {
      gl.uniform1i(locations.u_use_texture, 0);
    }

    gl.drawArrays(this.glPrimitive, offset, count);

    if (texture) {
      gl.disableVertexAttribArray(locations.a_texcoord);
    }
  }

  transform(transformMatrix: Array<number>) {
    for (let i = 0; i < this.points.length; i += 2) {
      let p = new g2.Point(this.points[i], this.points[i + 1]);
      p = p.transformBy(transformMatrix);
      this.points[i] = p.x;
      this.points[i + 1] = p.y;
    }
    for (let b = 0; b < this.border.length; b += 1) {
      for (let p = 0; p < this.border[b].length; p += 1) {
        this.border[b][p] = this.border[b][p].transformBy(transformMatrix);
      }
    }
  }

  // calcBorder(lastDrawTransformMatrix: Array<number>) {
  //   const glBorders = [];
  //   this.border.forEach(border => {
  //     const glBorder = [];
  //     border.forEach(p => {
  //       glBorder.push(p.transformBy(lastDrawTransformMatrix));
  //     })
  //     glBorders.push(glBorder);
  //   });
  //   return glBorders;
  // }
}

export default VertexObject;
