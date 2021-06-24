// @flow
import type { TypeParsablePoint } from './g2';
import { getPoint, Plane, Point } from './g2';
import { joinObjects } from './tools';
import * as m3 from './m3';
import type { Type3DMatrix } from './m3';

// export type OBJ_Projection = {
//   type: 'orthographic' | 'perspective',
//   // orthographic
//   left: number,
//   right: number,
//   bottom: number,
//   top: number,

//   // perspective
//   aspectRatio: number,
//   fieldOfView: number,

//   // both
//   near: number,
//   far: number,
// };

export type OBJ_Projection = {
  style?: 'orthographic' | 'perspective' | '2D',
  left?: number,
  right?: number,
  bottom?: number,
  top?: number,
  aspectRatio?: number,
  fieldOfView?: number,
  near?: number,
  far?: number,
};

export type OBJ_CameraDefined = {
  position: TypeParsablePoint,
  lookAt: TypeParsablePoint,
  up: TypeParsablePoint,
};

export type OBJ_Camera = {
  position?: TypeParsablePoint,
  lookAt?: TypeParsablePoint,
  up?: TypeParsablePoint,
};

export type OBJ_Light = {
  directional?: TypeParsablePoint,
  ambient?: number,
  point?: TypeParsablePoint,
}

export type OBJ_LightDefined = {
  directional: TypeParsablePoint,
  ambient: number,
  point: TypeParsablePoint,
}

export type OBJ_Scene = {
  style?: '2D' | 'orthographic' | 'perspective',
  left?: number,
  right?: number,
  bottom?: number,
  top?: number,

  // 3D
  near?: number,
  far?: number,

  // Perspective
  aspectRatio?: number,
  fieldOfView?: number,

  // Light
  light?: OBJ_Light,

  // View
  camera?: OBJ_Camera,
}

export type OBJ_2DScene = {
  left?: number,
  right?: number,
  bottom?: number,
  top?: number,
};

export type OBJ_OrthographicScene = {
  left?: number,
  right?: number,
  bottom?: number,
  top?: number,
  near?: number,
  far?: number,
}

export type OBJ_PerspectiveScene = {
  aspectRatio?: number,
  fieldOfView?: number,
  near?: number,
  far?: number,
}

export type OBJ_SceneDefined = {
  style: '2D' | 'orthographic' | 'perspective',
  left: number,
  right: number,
  bottom: number,
  top: number,

  // 3D
  near: number,
  far: number,
  camera: OBJ_Camera,

  // Perspective
  aspectRatio: number,
  fieldOfView: number,

  // Light
  light: OBJ_Light,

  projectionMatrix: Type3DMatrix,
  viewMatrix: Type3DMatrix,
}


export default class Scene {
  style: '2D' | 'orthographic' | 'perspective';
  left: number;
  right: number;
  bottom: number;
  top: number;

  // 3D
  near: number;
  far: number;
  camera: OBJ_CameraDefined;

  // Perspective
  aspectRatio: number;
  fieldOfView: number;

  // Light
  light: OBJ_LightDefined;

  projectionMatrix: Type3DMatrix;
  viewMatrix: Type3DMatrix;
  cameraMatrix: Type3DMatrix;
  viewProjectionMatrix: Type3DMatrix;
  onUpdate: null | (() => void);

  // eslint-disable-next-line class-methods-use-this
  defaultOptions() {
    return {
      style: '2D',
      left: -1,
      right: 1,
      bottom: -1,
      top: 1,
      near: 0.1,
      far: 10,
      camera: {
        position: [0, 0, 2],
        lookAt: [0, 0, 0],
        up: [0, 1, 0],
      },
      aspectRatio: 1,
      fieldOfView: 1,
      light: {
        directional: [1, 1, 1],
        ambient: 0.4,
        point: [10, 10, 10],
      },
    };
  }

  constructor(options: OBJ_Scene, onUpdate: null | (() => void) = null) {
    const defaultOptions = this.defaultOptions();
    joinObjects(this, defaultOptions, options);
    this.calcProjectionMatrix();
    this.calcViewMatrix();
    this.calcViewProjectionMatrix();
    this.onUpdate = onUpdate;
  }

  reset(options: OBJ_Scene) {
    const defaultOptions = this.defaultOptions();
    joinObjects(this, defaultOptions, options);
    this.calcProjectionMatrix();
    this.calcViewMatrix();
    this.calcViewProjectionMatrix();
  }

  calcProjectionMatrix() {
    if (this.style === 'orthographic' || this.style === '2D') {
      const {
        left, right, near, far, bottom, top,
      } = this;
      this.projectionMatrix = m3.orthographic(
        left, right, bottom, top, near, far,
      );
      return;
    }

    const {
      fieldOfView, aspectRatio, near, far,
    } = this;
    this.projectionMatrix = m3.perspective(
      fieldOfView, aspectRatio, near, far,
    );
  }

  calcViewMatrix() {
    this.cameraMatrix = m3.lookAt(
      getPoint(this.camera.position).toArray(),
      getPoint(this.camera.lookAt).toArray(),
      getPoint(this.camera.up).toArray(),
    );
    this.viewMatrix = m3.inverse(this.cameraMatrix);
    this.cameraPosition = getPoint(this.camera.position);
    this.cameraVector = getPoint(this.camera.lookAt).sub(this.cameraPosition).normalize();
  }

  calcViewProjectionMatrix() {
    this.viewProjectionMatrix = m3.mul(this.projectionMatrix, this.viewMatrix);
    this.inverseViewProjectionMatrix = m3.inverse(this.viewProjectionMatrix);

    if (this.onUpdate != null) {
      this.onUpdate();
    }
    if (this.style === '2D') {
      this.viewProjectionMatrix[11] = 0;
    }
    this.rightVector = this.cameraVector
      .crossProduct(getPoint(this.camera.up)).normalize();
    this.upVector = this.rightVector.crossProduct(this.cameraVector).normalize();
    this.nearCenter = this.cameraPosition
      .add(this.cameraVector.scale(this.near));
    this.farCenter = this.cameraPosition
      .add(this.cameraVector.scale(this.far));
    this.nearPlane = new Plane(this.nearCenter, this.cameraVector);
    this.farPlane = new Plane(this.farCenter, this.cameraVector);

    if (this.style === 'perspective') {
      this.heightNear = Math.tan(this.fieldOfView * 0.5) * this.near * 2;
      this.heightFar = Math.tan(this.fieldOfView * 0.5) * this.far * 2;
      this.widthNear = this.aspectRatio * this.heightNear;
      this.widthFar = this.aspectRatio * this.heightFar;
    } else {
      this.heightNear = this.top - this.bottom;
      this.widthNear = this.right - this.left;
      this.heightFar = this.heightNear;
      this.widthFar = this.widthNear;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  dupMatrix(matrix: Type3DMatrix): Type3DMatrix { // $FlowFixMe
    return matrix.slice();
  }

  // setProjectionMatrix(matrix: Type3DMatrix) {
  //   this.projectionMatrix = this.dupMatrix(matrix);
  //   this.calcViewProjectionMatrix();
  // }

  // setCameraMatrix(matrix: Type3DMatrix) {
  //   this.cameraMatrix = this.dupMatrix(matrix);
  //   this.viewMatrix = m3.inverse(this.cameraMatrix);
  //   this.calcViewProjectionMatrix();
  // }

  // setViewMatrix(matrix: Type3DMatrix) {
  //   this.viewMatrix = this.dupMatrix(matrix);
  //   this.cameraMatrix = m3.inverse(this.viewMatrix);
  //   this.calcViewProjectionMatrix();
  // }

  setCamera(options: OBJ_Camera) {
    joinObjects(this.camera, options);
    this.calcViewMatrix();
    this.calcViewProjectionMatrix();
  }

  setProjection(options: OBJ_Projection) {
    joinObjects(this, options);
    this.calcProjectionMatrix();
    this.calcViewProjectionMatrix();
  }

  set2D(options: OBJ_2DScene) {
    joinObjects(this, { style: '2D' }, options);
    this.calcProjectionMatrix();
    this.calcViewProjectionMatrix();
  }

  setOrthographic(options: OBJ_OrthographicScene) {
    joinObjects(this, { style: 'orthographic' }, options);
    this.calcProjectionMatrix();
    this.calcViewProjectionMatrix();
  }

  setPerspective(options: OBJ_PerspectiveScene) {
    joinObjects(this, { style: 'perspective' }, options);
    this.calcProjectionMatrix();
    this.calcViewProjectionMatrix();
  }

  setLight(options: OBJ_Light) {
    joinObjects(this.light, options);
  }

  /*
  Consider several spaces:
  - model space: where the vertices are drawn
  - world space: how the model is oriented relative to the world
  - camera space: how the world is offset so a camera at (0, 0, 0) looks
    like a camera at some coordinate (x, y, z)
  - clip space: camera space projected into -1 to 1 for x, y, z

  For perspective projection, the coordinates of a point in clip space depend
  on the z value of the point in camera space. Therefore there isn't one
  matrix that can do any point conversion.

  This means mathematically you need a different projection matrix for each
  point in space on a different z plane relative to the camera.

  However, in WebGL, a single projectionMatrix (or viewProjectionMatrix) CAN be
  used beacuse:
  - WebGL uses homogenous coordinates
  - the perspective projection matrix is used to setup the w coordinate to be
    the negative z coordinate of the camera point (or world point) it is
    transforming
  - In the vertex shader, WebGL automatically divides gl_Position.xyz by
    gl_Position.w
  - So effectively each point's z value is handled.

  However, when a user wants to convert world space or camera space to clip
  space, then the division of the w coordinate will have to be done for each
  point.
  */
  figureToGL(figurePoint: TypeParsablePoint) {
    const fp = getPoint(figurePoint);
    if (this.style === '2D' || this.style === 'orthographic') {
      return getPoint(figurePoint).transformBy(this.viewProjectionMatrix);
    }
    const p = m3.transformVector(this.viewProjectionMatrix, [fp.x, fp.y, fp.z, 1]);
    return new Point(p[0] / p[3], p[1] / p[3], p[2] / p[3]);
  }

  /*
  When a user wants to convert clip space to world space, then it is not as
  simple as doing the reverse process for figureToGL (world space to clip
  space).

  This is because the w coorinate which scaled each component above is not
  known.

  A perspective projection matrix is an efficient way to convert a point
  in camera space, to clip space.

  The actual equations for doing this are:

  fovY = field of view in the y direction
  a = aspect ratio (width / height)
  x, y, z = camera space x, y, z coorindate
  f = 1 / tan(fovY / 2)
  far = z far
  near = z near

  clipY = yf / -z
  clipX = xf/a / -z
  clipZ = [2 * near * far / (near - far)  +  (far + near) / (near - far) * z] / -z

  if we make r = 1 / (near - far) we get:
  clipZ = [2 * near * far * r  +  (far + near) * r * z] / -z

  simplify further:
  nf2r = 2 * near * far * r
  npfr = (far + near) * r

  Thus:
  clipZ = [fn2r + fnpr * z] / -z

  And so we can solve of x, y, z from clipX, clipY, clipZ:
  z = -nf2r / (clipZ + npfr)
  x = -clipX / (f/a) * z
  y = -clipY / f * z

  The perspective matrix contains all of these terms:
  f/a     0          0                 0
  0       f          0                 0
  0       0     (near + far) * r       near * far * 2 * r
  0       0          -1                0

  This conversion is done from clip space to camera space. To move from
  camera space to world space, transform by the inverted viewMatrix (which
  is the camera matrix).

  More detailed information breaking down the perspective matrix
  https://stackoverflow.com/questions/28286057/trying-to-understand-the-math-behind-the-perspective-matrix-in-webgl/28301213#28301213
  */
  glToFigure(glPoint: TypeParsablePoint) {
    const clip = getPoint(glPoint);
    if (this.style === '2D' || this.style === 'orthographic') {
      return getPoint(clip).transformBy(this.inverseViewProjectionMatrix);
    }
    const fOna = this.projectionMatrix[0];
    const f = this.projectionMatrix[5];
    const npfr = this.projectionMatrix[10];
    const nf2r = this.projectionMatrix[11];

    const cameraZ = -nf2r / (clip.z + npfr);
    const cameraX = -clip.x * cameraZ / fOna;
    const cameraY = -clip.y * cameraZ / f;
    return new Point(cameraX, cameraY, cameraZ).transformBy(this.cameraMatrix);
  }
}
