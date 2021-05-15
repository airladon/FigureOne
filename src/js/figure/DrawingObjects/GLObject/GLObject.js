// @flow

// import * as g2 from '../g2';
import * as m2 from '../../../tools/m2';
import WebGLInstance from '../../webgl/webgl';
import { Point } from '../../../tools/g2';
// import type { TypeParsablePoint } from '../../../tools/g2';
import DrawingObject from '../DrawingObject';
// import type { CPY_Step } from '../../geometries/copy/copy';
import type { TypeColor } from '../../../tools/types';

// Base clase of all shape objects made from verteces for webgl.
// The job of a VertexObject is to:
//  - Have the points of a object/shape
//  - Have the shape's border (used to determine whether a location is
//    within the shape)
//  - Setup the webgl buffer
//  - Draw the shape
class GLObject extends DrawingObject {
  gl: Array<WebGLRenderingContext>;    // shortcut for the webgl context
  webgl: Array<WebGLInstance>;         // webgl instance for a html canvas
  glPrimitive: number;                  // primitive tyle (e.g. TRIANGLE_STRIP)
  // buffer: Array<WebGLBuffer>;          // Vertex buffer

  // points: Array<number>;        // Primitive vertices of shape
  // numPoints: number;            // Number of primative vertices
  z: number;
  buffers: {
    [bufferName: string]: {
      buffer: Array<number>,
      size: number,
    };
  };

  uniforms: {
    [uniformName: string]: {
      value: Array<number>,
    },
  }

  numVertices: number;

  state: 'loading' | 'loaded';

  programIndex: Array<number>;
  onLoad: ?(() => void);


  constructor(
    webgl: WebGLInstance,
    vertexShader: string = 'simple',
    fragmentShader: string = 'simple',
  ) {
    super();
    // this.numPoints = 0;
    this.gl = webgl.gl;
    this.webgl = webgl;
    this.z = 0;
    this.programIndex = this.webgl.getProgram(vertexShader, fragmentShader);
    this.type = 'glPrimitive';
    this.buffers = {};
    this.numVertices = 0;
    this.uniforms = {};
  }

  addVertices(points: Array<number>) {
    this.addBuffer('a_position', 2, points);
    this.numVertices = points.length / 2;
  }

  addBuffer(name: string, size: number, data: Array<number>) {
    const { gl } = this;
    this.buffers[name] = {
      buffer: gl.createBuffer(),
      size,
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[name].buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  }

  setupBuffers(numVertices: number, buffers: {
    data: Array<number>,
    size: number,
    locationName: string
  }) {
    this.state = 'loading';
    Object.keys(buffers).forEach((bufferName) => {
      this.addBuffer(bufferName, size, buffers[bufferName].buffer);
    });
    this.numVertices = numVertices;
    this.state = 'loaded';
  }

  executeOnLoad() {
    if (this.onLoad != null) {
      this.onLoad();
    }
  }

  resetBuffers() {
    const { gl } = this;
    Object.keys(this.buffers).forEach((bufferName) => {
      const { buffer } = this.buffers[bufferName];
      gl.deleteBuffer(buffer);
    });
    this.buffers = {};
  }

  changeBuffer(name: string, data: Array<number>) {
    this.gl.deleteBuffer(this.buffers[name].buffer);
    this.addBuffer(name, data);
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
    ];
  }

  addUniform(uniformName: string, initialValue: Array<number>) {
    this.uniforms[uniformName] = initialValue;
  }

  drawWithTransformMatrix(
    transformMatrix: Array<number>,
    color: TypeColor,
    // glIndex: number,
    // count: number = this.numVertices,
    // webglInstance: WebGLInstance = this.webgl,
  ) {
    const { gl } = this;
    const webglInstance = this.webgl;
    const count = this.numVertices;

    // const size = 2;         // 2 components per iteration
    const type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false;    // don't normalize the data
    // 0 = move forward size * sizeof(type) each iteration to get
    // the next position
    const stride = 0;
    const offset = 0;       // start at the beginning of the buffer

    const locations = webglInstance.useProgram(this.programIndex);

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    Object.keys(this.buffers).forEach((bufferName) => {
      const { buffer, size } = this.buffers[bufferName];
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
      const value = this.uniforms[uniformName];
      if (value.length === 1) {
        gl.uniform1f(locations[uniformName], value[0]);
      } else if (value.length === 2) {
        gl.uniform2f(locations[uniformName], value[0], value[1]);
      } else if (value.length === 3) {
        gl.uniform3f(locations[uniformName], value[0], value[1], value[2]);
      } else if (value.length === 4) {
        gl.uniform4f(locations[uniformName], value[0], value[1], value[2], value[3]);
      }
    });

    gl.uniform1f(locations.u_z, this.z);

    gl.uniform4f(
      locations.u_color,
      color[0], color[1], color[2], color[3],
    );

    gl.drawArrays(gl.TRIANGLES, offset, count);
  }

  transform(transformMatrix: Array<number>) {
    for (let i = 0; i < this.points.length; i += 2) {
      let p = new Point(this.points[i], this.points[i + 1]);
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
}

export default GLObject;
