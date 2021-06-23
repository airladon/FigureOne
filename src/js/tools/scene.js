// @flow
import type { TypeParsablePoint } from './g2';
import { getPoint, Plane } from './g2';
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
}
