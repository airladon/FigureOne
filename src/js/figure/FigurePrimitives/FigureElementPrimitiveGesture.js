// @flow
import type { OBJ_FigureForElement } from '../Figure';
import { FigureElementPrimitive } from '../Element';
import {
  Point, getPoint, Line,
} from '../../tools/g2';
import type { FigureElement } from '../Element';
import type { TypeParsablePoint, Transform } from '../../tools/g2';
import type Scene from '../../tools/geometry/scene';
import { joinObjects } from '../../tools/tools';
import type { OBJ_Rectangle } from './FigurePrimitiveTypes2D';
import type TimeKeeper from '../TimeKeeper';
import type DrawingObject from '../DrawingObjects/DrawingObject';
import type { TypeColor } from '../../tools/types';
/**
 * Zoom options.
 *
 * @property {null | number} [max] maximum zoom if value defined, no
 * maximum if `null` (`null`)
 * @property {null | number} [min] minimum zoom if value defined, no
 * minimum if `null` (`null`)
 * @property {number} [scale] scale zoom value to make it most faster
 * (scale > 1) or slower (scale < 1) (`q`)
 */
export type OBJ_ZoomOptions = {
  min: null | number,
  max: null | number,
  sensitivity?: number,
}

export type OBJ_PanOptions = {
  left: null | number,
  right: null | number,
  bottom: null | number,
  top: null | number,
}
/**
 * Current zoom.
 *
 @property {number} zoom current zoom
 @property {Point} position figure space point where the last zoom gesture was
 * centered
 @property {number} angle when zooming with pinch touch gestures, the angle
 * difference between the latest gesture and the current gesture.
 @property {number} zooming `true` if two touches are currently zooming
 */
export type OBJ_Zoom = {
  zoom: number,
  position: Point,
  angle: number,
  zooming: boolean,
}

export type OBJ_Gesture = {
  zoom?: OBJ_ZoomOptions | boolean,
  pan?: OBJ_PanOptions | boolean,
  onlyWhenTouched?: boolean,
  scene?: Scene,
  back?: boolean,
} & OBJ_Rectangle;

// $FlowFixMe
export default class FigureElementPrimitiveGesture extends FigureElementPrimitive {
  zoom: {
    last: {
      mag: number,
      position: Point,
      angle: number,
      distance: number,
    },
    current: {
      position: Point,
      angle: number,
      distance: number,
    },
    min: null | number,
    max: null | number,
    sensitivity: number,
    mag: number,
    // cumOffset: Point,
    cumAngle: number,
    pinching: boolean,
    enabled: boolean,
  };

  pan: {
    enabled: boolean,
    offset: Point,
    left: null | number,
    right: null | number,
    bottom: null | number,
    top: null | number,
    delta: number,
  };

  mousePixelPosition: Point;
  onlyWhenTouched: boolean;
  relativeScene: null | Scene;

  notificationIDs: Array<number>;

  constructor(
    drawingObject: DrawingObject,
    transform: Transform,
    color: TypeColor,
    parent: FigureElement | null,
    name: string,
    timeKeeper: TimeKeeper,
  ) {
    super(drawingObject, transform, color, parent, name, timeKeeper);
    this.zoom = {
      min: null,
      max: null,
      last: {
        mag: 1,
        position: new Point(0, 0),
        angle: 0,
        distance: 0,
      },
      current: {
        position: new Point(0, 0),
        angle: 0,
        distance: 0,
      },
      mag: 1,
      cumAngle: new Point(0, 0),
      pinching: false,
      sensitivity: 1,
      enabled: false,
    };
    this.pan = {
      enabled: false,
      offset: new Point(0, 0),
      left: null,
      right: null,
      top: null,
      bottom: null,
      delta: 0,
    };
    this.onlyWhenTouched = true;
    this.notificationIDs = [];
  }

  setup(options: OBJ_Gesture) {
    if (options.zoom != null && typeof options.zoom !== 'boolean') {
      this.setZoomOptions(options.zoom);
    }
    if (options.zoom) {
      this.zoom.enabled = true;
    }
    if (options.pan) {
      this.pan.enabled = true;
    }
    if (options.pan != null && typeof options.pan !== 'boolean') {
      this.setPanOptions(options.pan);
    }
    if (options.onlyWhenTouched) {
      this.onlyWhenTouched = options.onlyWhenTouched;
    }
    this._custom.cameraControlBack = false;
    if (options.back) {
      this._custom.cameraControlBack = true;
    }
    this.setTouchable();
  }

  mousePosition(pixelPoint: Point) {
    this.mousePixelPosition = pixelPoint;
  }

  pixelToScene(pixelPoint: Point) {
    const glPoint = this.figure.pixelToGL(pixelPoint);
    const scene = this.relativeScene || this.getScene();
    if (scene == null) {
      throw new Error(`Gesture Primitive Error - Scene does not exist: ${this.getPath()}`);
    }
    return scene.glToFigure(glPoint);
  }

  glToScene(glPoint: Point) {
    const scene = this.relativeScene || this.getScene();
    if (scene == null) {
      throw new Error(`Gesture Primitive Error - Scene does not exist: ${this.getPath()}`);
    }
    return scene.glToFigure(glPoint);
  }

  wheelHandler(deltaY: number) {
    if (!this.zoom.enabled) {
      return;
    }
    if (this.onlyWhenTouched) {
      if (!this.isBeingTouched(this.transformPoint(this.mousePixelPosition, 'pixel', 'gl'))) {
        return;
      }
    }
    // const oldZoom = this.zoom.last.mag;
    let mag = this.zoom.mag + deltaY / 10 * this.zoom.sensitivity * this.zoom.mag / 100;
    if (this.zoom.min != null) {
      mag = Math.max(mag, this.zoom.min);
    }
    if (this.zoom.max != null) {
      mag = Math.min(mag, this.zoom.max);
    }
    // mag = this.zoom.bounds.clip(mag);
    if (this.mousePixelPosition == null) {
      this.updateZoom(mag, this.transformPoint([0, 0], 'gl', 'figure'));
    } else {
      const mousePosition = this.pixelToScene(this.mousePixelPosition);
      this.updateZoom(mag, mousePosition, 0, 0);
    }
    this.notifications.publish('zoom', this.zoom.mag);
  }

  /**
   * Change the position and scale of an element to simulate it zooming.
   *
   * Note, the element will stay in the same space it was previous, and
   * therefore moving it will be moving it in the same space.
   *
   * Often a better way to zoom an element (especially if more than one and
   * interactivity is being used) is to zoom the scene the element(s) belong
   * to.
   *
   * @param {FigureElement} element element to zoom
   */
  zoomElement(
    element: FigureElement,
    originalPosition: TypeParsablePoint,
    scale: boolean = true,
  ) {
    const o = getPoint(originalPosition);
    element.setPosition(o.add(this.pan.offset).scale(this.zoom.mag));
    if (scale) {
      element.setScale(this.zoom.mag);
    }
  }

  /**
   * Changes a 2D scene to simulate zooming in and out
   */
  zoomScene(scene: Scene) {
    scene.setPanZoom(this.pan.offset, this.zoom.mag);
    this.animateNextFrame();
  }

  panScene(scene: Scene) {
    scene.setPan(this.pan.offset);
    this.animateNextFrame();
  }

  updateZoom(mag: number, zoomPosition: Point, distance: number = 0, angle: number = 0) {
    const oldMag = this.zoom.mag;
    this.zoom.last = {
      mag: this.zoom.mag,
      position: this.zoom.current.position,
      angle: this.zoom.current.angle,
      distance: this.zoom.current.distance,
    };
    this.zoom.mag = mag;
    this.zoom.current = { position: zoomPosition, angle, distance };
    const newPosition = zoomPosition.scale(mag / oldMag);
    // if (this.getScene() === this.relativeScene)
    this.pan.delta = zoomPosition.sub(newPosition).scale(1 / mag);
    this.setPanOffset(
      this.pan.offset.add(this.pan.delta),
    );
    this.zoom.cumAngle += angle - this.zoom.last.angle;
  }

  startPinchZoom(
    touch1PixelPos: Point,
    touch2PixelPos: Point,
    beingTouchedElement: null | FigureElement,
  ) {
    if (!this.zoom.enabled) {
      return;
    }
    if (this.onlyWhenTouched && beingTouchedElement !== this) {
      return;
    }
    const line = new Line(touch1PixelPos, touch2PixelPos);
    this.zoom.current.angle = line.angle();
    this.zoom.current.distance = line.length();
    this.zoom.current.position = this.transformPoint(line.pointAtPercent(0.5), 'pixel', 'figure');
    this.zoom.pinching = true;
  }

  pinchZoom(
    touch1PixelPos: Point,
    touch2PixelPos: Point,
    beingTouchedElement: null | FigureElement,
  ) {
    if (!this.zoom.enabled) {
      return;
    }
    if (this.onlyWhenTouched && beingTouchedElement !== this) {
      return;
    }
    // const oldZoom = this.zoom.last.mag;
    // const pixelPoints = this.clientsToPixel([touch1ClientPos, touch2ClientPos]);
    const line = new Line(touch1PixelPos, touch2PixelPos);

    const d = line.length();
    // const { current, lastDistance, scale } = this.zoom;
    let mag = this.zoom.mag
      + (d - this.zoom.current.distance) / 5 * this.zoom.sensitivity * this.zoom.mag / 100;
    if (this.zoom.min != null) {
      mag = Math.max(mag, this.zoom.min);
    }
    if (this.zoom.max != null) {
      mag = Math.min(mag, this.zoom.max);
    }
    const position = this.pixelToScene(line.pointAtPercent(0.5));
    this.updateZoom(mag, position, d, line.angle());
    this.notifications.publish('zoom', this.zoom.mag);
  }


  endPinchZoom() {
    this.zoom.pinching = false;
  }

  enableZoom() {
    this.zoom.enabled = true;
  }

  disableZoom() {
    this.zoom.enabled = false;
    this.zoom.pinching = false;
  }

  /**
   * Set zoom gesture options for figure.
   *
   * @param {OBJ_ZoomOptions} options
   */
  setZoomOptions(options: OBJ_ZoomOptions) {
    if (options.min !== undefined) { this.zoom.min = options.min; }
    if (options.max !== undefined) { this.zoom.max = options.max; }
    if (options.sensitivity !== undefined) { this.zoom.sensitivity = options.sensitivity; }
  }

  setPanOptions(options: OBJ_PanOptions) {
    if (options.left !== undefined) { this.pan.left = options.left; }
    if (options.bottom !== undefined) { this.pan.bottom = options.bottom; }
    if (options.top !== undefined) { this.pan.top = options.top; }
    if (options.right !== undefined) { this.pan.right = options.right; }
  }

  /**
   * Set zoom
   *
   * @param {OBJ_Zoom} zoom
   * @param {boolean} notify `true` to send `'zoom'` notification after set
   */
  setZoom(zoom: OBJ_Zoom, notify: boolean = false) {
    const z = joinObjects({
      mag: this.zoom.mag,
      angle: this.zoom.current.angle,
      distance: this.zoom.current.distance,
      pinching: this.zoom.pinching,
    }, zoom);
    this.updateZoom(z.mag, getPoint(z.position), z.distance, z.angle);
    this.zoom.pinching = z.pinching;
    if (notify) {
      this.notifications.publish('zoom', this.zoom.mag);
    }
  }

  setPan(offset: TypeParsablePoint) {
    this.setPanOffset(getPoint(offset));
  }

  /**
   * @return {OBJ_Zoom}
   */
  getZoom() {
    return {
      last: this.zoom.last,
      current: this.zoom.current,
      mag: this.zoom.mag,
      offset: this.pan.offset,
      angle: this.zoom.cumAngle,
    };
  }

  getPan() {
    return {
      offset: this.pan.offset,
      delta: this.pan.delta,
    };
  }

  moveGesture(
    previousGLPoint: Point,
    currentGLPoint: Point,
    beingTouchedElement: FigureElement,
  ) {
    if (!this.pan.enabled) {
      return;
    }
    if (this.onlyWhenTouched && beingTouchedElement !== this) {
      return;
    }
    const previousScenePoint = this.glToScene(previousGLPoint);
    const currentScenePoint = this.glToScene(currentGLPoint);
    const delta = currentScenePoint.sub(previousScenePoint);
    this.pan.delta = delta;
    this.setPanOffset(this.pan.offset.add(delta.scale(1 / this.zoom.mag)));
    this.notifications.publish('pan', this.pan.offset);
  }

  setPanOffset(offset: Point) {
    const o = offset;
    const {
      left, right, bottom, top,
    } = this.pan;
    if (left != null && left > o.x) {
      o.x = left;
    }
    if (right != null && right < o.x) {
      o.x = right;
    }
    if (bottom != null && bottom > o.y) {
      o.y = bottom;
    }
    if (top != null && top < o.y) {
      o.y = top;
    }
    this.pan.offset = o;
  }

  setFigure(figure: OBJ_FigureForElement) {
    this.figure = figure;
    if (figure != null) {
      this.recorder = figure.recorder;
      this.animationFinishedCallback = figure.animationFinished;
      this.timeKeeper = figure.timeKeeper;
      this.animations.timeKeeper = figure.timeKeeper;
      this.animations.recorder = figure.recorder;
    }
    if (this.isTouchable) {
      this.setTouchable();
    }
    if (this.isMovable) {
      this.setMovable();
    }
    this.cleanupIDs();
    this.notificationIDs.push(this.figure.notifications.add('gestureWheel', this.wheelHandler.bind(this)));
    this.notificationIDs.push(this.figure.notifications.add('mousePosition', this.mousePosition.bind(this)));
    this.notificationIDs.push(this.figure.notifications.add('gestureStartPinch', this.startPinchZoom.bind(this)));
    this.notificationIDs.push(this.figure.notifications.add('gesturePinching', this.pinchZoom.bind(this)));
    this.notificationIDs.push(this.figure.notifications.add('gesturePinchEnd', this.endPinchZoom.bind(this)));
    this.notificationIDs.push(this.figure.notifications.add('gestureMove', this.moveGesture.bind(this)));
    this.notifications.publish('setFigure');
  }

  cleanupIDs() {  // $FlowFixMe
    this.notificationIDs.forEach(id => this.figure.notifications.remove(id));
    this.notificationIDs = [];
  }
}
