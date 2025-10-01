/* eslint-disable no-use-before-define */
import type { TypeParsablePoint } from './Point';
import { getPoint, Point } from './Point';
import { Plane } from './Plane';
import { joinObjects } from '../tools';
import * as m3 from '../m3';
import type { Type3DMatrix } from '../m3';

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

/**
  * @property {'orthographic' | 'perspective' | '2D'} [style]
  * @property {number} [left]
  * @property {number} [right]
  * @property {number} [bottom]
  * @property {number} [top]
  * @property {number} [aspectRatio]
  * @property {number} [fieldOfView]
  * @property {number} [near]
  * @property {number} [far]
 */
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

/**
 * @property {TypeParsablePoint} [position]
 * @property {TypeParsablePoint} [lookAt]
 * @property {TypeParsablePoint} [up]
 */
export type OBJ_Camera = {
  position?: TypeParsablePoint,
  lookAt?: TypeParsablePoint,
  up?: TypeParsablePoint,
};

/**
 * @property {TypeParsablePoint} [directional]
 * @property {number} [ambient]
 * @property {TypeParsablePoint} [point]
 */
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

/**
 * The Scene options object defines how the elements within the figure are
 * viewed.
 *
 * For 2D figures (`style: '2D'`), `left`, `right`, `bottom`, and `top` are
 * required to define the x-y expanse to view. Any elements or portions of
 * elements outside of this expanse will not be shown (be clipped).
 *
 * For 3D figures, a camera, lighting and the near/far clipping planes also
 * need definition.
 */
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
  // Pan/Zoom (runtime convenience)
  zoom?: number,
  pan?: Point,
}

/**
  * @property {number} [left]
  * @property {number} [right]
  * @property {number} [bottom]
  * @property {number} [top]
 */
export type OBJ_2DScene = {
  left?: number,
  right?: number,
  bottom?: number,
  top?: number,
};

/**
  * @property {number} [left]
  * @property {number} [right]
  * @property {number} [bottom]
  * @property {number} [top]
  * @property {number} [near]
  * @property {number} [far]
 */
export type OBJ_OrthographicScene = {
  left?: number,
  right?: number,
  bottom?: number,
  top?: number,
  near?: number,
  far?: number,
}

/**
  * @property {aspectRatio} [number]
  * @property {fieldOfView} [number]
  * @property {near} [number]
  * @property {far} [number]
 */
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


/**
  * Scene.
  *
  * @param {OBJ_Scene} options scene definition options
  * @param {null | (() => void)} onUpdate callback if scene is updated
  */
export default class Scene {
  style!: '2D' | 'orthographic' | 'perspective';
  left!: number;
  right!: number;
  bottom!: number;
  top!: number;

  // 3D
  near!: number;
  far!: number;
  camera!: OBJ_CameraDefined;

  // Perspective
  aspectRatio!: number;
  fieldOfView!: number;

  // Light
  light!: OBJ_LightDefined;

  projectionMatrix!: Type3DMatrix;
  viewMatrix!: Type3DMatrix;
  cameraMatrix!: Type3DMatrix;
  viewProjectionMatrix!: Type3DMatrix;
  onUpdate: null | (() => void);

  cameraPosition!: Point;
  cameraVector!: Point;
  inverseViewProjectionMatrix!: Type3DMatrix;
  rightVector!: Point;
  upVector!: Point;
  nearCenter!: Point;
  farCenter!: Point;
  nearPlane!: Plane;
  farPlane!: Plane;
  heightNear!: number;
  heightFar!: number;
  widthNear!: number;
  widthFar!: number;

  zoom!: number;
  pan!: Point;
  pannedCameraPosition!: Point;
  pannedLookAt!: Point;

  // eslint-disable-next-line class-methods-use-this
  defaultOptions(): {
  aspectRatio: number,
  bottom: number,
  camera: {lookAt: number[] | TypeParsablePoint, position: number[] | TypeParsablePoint, up: number[] | TypeParsablePoint},
  far: number,
  fieldOfView: number,
  left: number,
  light: {ambient: number, directional: number[] | TypeParsablePoint, point: number[] | TypeParsablePoint},
  near: number,
  right: number,
  style: '2D' | 'orthographic' | 'perspective',
  top: number,
  zoom: number,
  pan: Point,
  } {
    return {
      style: '2D',
      left: -1,
      right: 1,
      bottom: -1,
      top: 1,
      near: 0.1,
      far: 10,
      zoom: 1,
      pan: new Point(0, 0),
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
    this.reset(options);
    this.onUpdate = onUpdate;
  }

  reset(options: OBJ_Scene) {
    this.camera = {} as any;
    this.light = {} as any;
    const defaultOptions = this.defaultOptions();
    const o = joinObjects<any>({}, defaultOptions, options);
    this.style = o.style;
    this.left = o.left;
    this.right = o.right;
    this.bottom = o.bottom;
    this.top = o.top;
    this.near = o.near;
    this.far = o.far;
    this.zoom = o.zoom;
    this.pan = o.pan;
    this.setCameraProperties(o.camera || {});
    this.setLight(o.light || {});
    this.aspectRatio = o.aspectRatio;
    this.fieldOfView = o.fieldOfView;
    this.calcProjectionMatrix();
    this.calcViewMatrix();
    this.calcViewProjectionMatrix();
  }

  // Note - a scene should NOT get the _dup() method as multiple links to the
  // same scene will mess up recording states (scenes will be doubly encoded
  // and then unencodable)
  dup() {
    const s = new Scene({
      style: this.style,
      left: this.left,
      right: this.right,
      bottom: this.bottom,
      top: this.top,
      near: this.near,
      far: this.far,
      aspectRatio: this.aspectRatio,
      fieldOfView: this.fieldOfView,
      light: this.light,
      camera: this.camera,
      zoom: this.zoom,
      pan: this.pan,
    });
    s.onUpdate = this.onUpdate;
    return s;
  }

  calcProjectionMatrix() {
    if (this.style === 'orthographic' || this.style === '2D') {
      const {
        left, right, near, far, bottom, top,
      } = this;
      this.projectionMatrix = m3.orthographic(
        left / this.zoom,
        right / this.zoom,
        bottom / this.zoom,
        top / this.zoom,
        near,
        far,
      );
      return;
    }

    const {
      fieldOfView, aspectRatio, near, far,
    } = this;
    this.projectionMatrix = m3.perspective(
      Math.min(fieldOfView / this.zoom, Math.PI), aspectRatio, near, far,
    );
  }

  calcViewMatrix() {
    this.cameraPosition = getPoint(this.camera.position);
    this.cameraVector = getPoint(this.camera.lookAt).sub(this.cameraPosition).normalize();
    this.rightVector = this.cameraVector
      .crossProduct(getPoint(this.camera.up)).normalize();
    this.upVector = this.rightVector.crossProduct(this.cameraVector).normalize();
    this.pannedCameraPosition = this.cameraPosition
      .add(this.upVector.scale(this.pan.y))
      .add(this.rightVector.scale(this.pan.x));
    this.pannedLookAt = getPoint(this.camera.lookAt)
      .add(this.upVector.scale(this.pan.y))
      .add(this.rightVector.scale(this.pan.x));
    this.cameraMatrix = m3.lookAt(
      getPoint(this.pannedCameraPosition).toArray() as [number, number, number],
      getPoint(this.pannedLookAt).toArray() as [number, number, number],
      getPoint(this.camera.up).toArray() as [number, number, number],
    );
    this.viewMatrix = m3.inverse(this.cameraMatrix);
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
    // this.rightVector = this.cameraVector
    //   .crossProduct(getPoint(this.camera.up)).normalize();
    // this.upVector = this.rightVector.crossProduct(this.cameraVector).normalize();

    if (this.style === 'perspective') {
      const fov = Math.min(Math.PI, this.fieldOfView / this.zoom);
      this.heightNear = Math.tan(fov * 0.5) * this.near * 2;
      this.heightFar = Math.tan(fov * 0.5) * this.far * 2;
      this.widthNear = this.aspectRatio * this.heightNear;
      this.widthFar = this.aspectRatio * this.heightFar;
      this.nearCenter = this.cameraPosition
        .add(this.cameraVector.scale(this.near));
      this.farCenter = this.cameraPosition
        .add(this.cameraVector.scale(this.far));
      this.nearPlane = new Plane(this.nearCenter, this.cameraVector);
      this.farPlane = new Plane(this.farCenter, this.cameraVector);
    } else {
      this.heightNear = (this.top - this.bottom) / this.zoom;
      this.widthNear = (this.right - this.left) / this.zoom;
      this.heightFar = this.heightNear;
      this.widthFar = this.widthNear;
      this.nearCenter = this.cameraPosition
        .add(this.cameraVector.scale(this.near))
        .add(this.rightVector.scale(this.left / this.zoom + this.widthNear / 2))
        .add(this.upVector.scale(this.bottom / this.zoom + this.heightNear / 2));
      this.farCenter = this.cameraPosition
        .add(this.cameraVector.scale(this.far))
        .add(this.rightVector.scale(this.left / this.zoom + this.widthFar / 2))
        .add(this.upVector.scale(this.bottom / this.zoom + this.heightFar / 2));
      this.nearPlane = new Plane(this.nearCenter, this.cameraVector);
      this.farPlane = new Plane(this.farCenter, this.cameraVector);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  dupMatrix(matrix: Type3DMatrix): Type3DMatrix {
    return matrix.slice() as Type3DMatrix;
  }

  /**
   * Set the pan and zoom of the scene.
   *
   * Pan is applied to `camera.position` and `camera.lookAt`, while
   * zoom is applied to
   * `camera.left`/`camera.bottom`/`camera.right`/`camera.top` (for 2D and
   * orthographic) or `camera.fov` (for perspective)
   *
   * The camera and projection variables are not changed by pan and zoom, but
   * the the view and projection matrices are.
   *
   * A pan in the positive direction will move the scene left and down.
   *
   * A zoom greater than 1 will reduce the left/right/bottom/top or fov
   * effectively magnifying the scene.
   *
   * @param {Point} pan
   * @param {number} zoom
   */
  setPanZoom(pan: Point, zoom: number) {
    this.zoom = zoom;
    this.pan = pan;
    this.calcProjectionMatrix();
    this.calcViewMatrix();
    this.calcViewProjectionMatrix();
  }

  /**
   * Set the pan of the scene.
   *
   * Pan is applied to `camera.position` and `camera.lookAt`.
   *
   * The camera is changed by pan and zoom, but the resulting view matrix is.
   *
   * A pan in the positive direction will move the scene left and down.
   *
   * @param {Point} pan
   */
  setPan(pan: Point) {
    this.pan = pan;
    this.calcProjectionMatrix();
    this.calcViewMatrix();
    this.calcViewProjectionMatrix();
  }

  /**
   * Set camera properties.
   */
  setCamera(options: OBJ_Camera) {
    this.setCameraProperties(options);
    this.calcViewMatrix();
    this.calcViewProjectionMatrix();
  }

  setCameraProperties(options: OBJ_Camera) {
    if (options.position != null) {
      this.camera.position = getPoint(options.position);
    }
    if (options.up != null) {
      this.camera.up = getPoint(options.up);
    }
    if (options.lookAt != null) {
      this.camera.lookAt = getPoint(options.lookAt);
    }
  }

  /**
   * Set projection properties.
   */
  setProjection(options: OBJ_Projection) {
    joinObjects(this, options);
    this.calcProjectionMatrix();
    this.calcViewProjectionMatrix();
  }

  /**
   * Set a 2D scene.
   */
  set2D(options: OBJ_2DScene) {
    joinObjects(this, { style: '2D' }, options);
    this.calcProjectionMatrix();
    this.calcViewProjectionMatrix();
  }

  /**
   * Set an orthographic scene.
   */
  setOrthographic(options: OBJ_OrthographicScene) {
    joinObjects(this, { style: 'orthographic' }, options);
    this.calcProjectionMatrix();
    this.calcViewProjectionMatrix();
  }

  /**
   * Set a perspective scene.
   */
  setPerspective(options: OBJ_PerspectiveScene) {
    joinObjects(this, { style: 'perspective' }, options);
    this.calcProjectionMatrix();
    this.calcViewProjectionMatrix();
  }

  /**
   * Set light properties
   */
  setLight(options: OBJ_Light) {
    // joinObjects(this.light, options);
    if (options.ambient != null) {
      this.light.ambient = options.ambient;
    }
    if (options.directional != null) {
      this.light.directional = getPoint(options.directional);
    }
    if (options.point != null) {
      this.light.point = getPoint(options.point);
    }
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
  glToFigure(glPoint: TypeParsablePoint): Point {
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
