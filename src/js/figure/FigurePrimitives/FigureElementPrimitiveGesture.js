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
 * @property {number} [sensitivity] zoom sensitivity where values greater
 * than 1 are more sensitive resulting in faster zoom changes (`1`)
 * @property {number} [position] zoom around a fixed point (instead of the
 * mouse of pinch location) - leave undefined or use `null` to instead zoom
 * around mouse or pinch location (`null`)
 */
export type OBJ_ZoomOptions = {
  min?: null | number,
  max?: null | number,
  sensitivity?: number,
  position?: null | TypeParsablePoint
}

/**
 * Pan options.
 *
 * @property {null | number} [left] maximum left pan allowed, or `null` for no
 * limit (`null`)
 * @property {null | number} [right] maximum right pan allowed, or `null` for no
 * limit (`null`)
 * @property {null | number} [bottom] maximum bottom pan allowed, or `null` for
 * no limit (`null`)
 * @property {null | number} [top] maximum top pan allowed, or `null` for no
 * limit (`null`)
 * @property {number} [sensitivity] pan sensitivity for mouse wheel
 * panning where values greater than 1 are more sensitive resulting in faster
 * panning (`1`)
 * @property {boolean} [wheel] enable mouse wheel panning - only possible if
 * zoom gesture is disabled.
 * @property {boolean} [momentum] enable pan momentum for drag panning. NB,
 * mouse wheel panning mamemntum cannot be controlled and will be browser
 * dependent. (`true`)
 */
export type OBJ_PanOptions = {
  left?: null | number,
  right?: null | number,
  bottom?: null | number,
  top?: null | number,
  sensitivity?: number,
  wheel?: boolean,
  momentum?: boolean,
}

/**
 * Instantaneous zoom metrics.
 * @property {number} [mag] zoom magnification
 * @property {Point} [position] position around which zoom is happening
 * @property {number} [angle] (pinch zoom only) pinch angle delta to start of
 * pinch
 * @property {number} [distance] (pinch zoom only) distance between pinch points
 */
export type OBJ_ZoomInstant = {
  mag: number,
  position: Point,
  angle: number,
  distance: number,
}

/**
 * Current zoom.
 *
 @property {OBJ_ZoomInstant} last last zoom metrics
 @property {OBJ_ZoomInstant} current current zoom metrics
 @property {number} mag current zoom magnification
 @property {number} offset pan offset needed to keep the zoom position at a
 * fixed location
 */
export type OBJ_Zoom = {
  last: OBJ_ZoomInstant,
  current: OBJ_ZoomInstant,
  mag: number,
  offset: Point,
}

/**
 * @property {OBJ_ZoomOptions | boolean} [zoom] zoom options - if not `false`
 * then zoom will be enabled (`false`)
 * @property {OBJ_PanOptions | boolean} [pan] pan options - if not `false` then
 * pan will be enabled (`false`)
 * @property {boolean} [onlyWhenTouched] (mouse wheel zoom/pan and pinch zoom)
 * only notify when element gesture rectangle is being touched (`true`)
 * @property {boolean} [back] if `true` 3D shape interactivity will be
 * prioritized (`true`)
 * @property {number} [width] width of rectangle - defaults to full scene width
 * @property {number} [height] height of rectangle - defaults to full scene
 * height
 * @property {OBJ_Scene | Scene} [scene] define if gesture should be an
 * independeant scene (like if the gestures are being used to change the
 * default figure scene) - defaults to Figure scene
 * @property {OBJ_Scene} [changeScene] if defined, this scene will be
 * automatically updated with any pan and zoom events
 * @property {'left' | 'center' | 'right' | number} [xAlign] x alignment of
 * rectangle (`'center'`)
 * @property {'bottom' | 'middle' | 'top' | number} [yAlign] y alignment of
 * rectangle (`'middle'`)
 *
 * @extends OBJ_Generic
 */
export type OBJ_Gesture = {
  zoom?: OBJ_ZoomOptions | boolean,
  pan?: OBJ_PanOptions | boolean,
  onlyWhenTouched?: boolean,
  back?: boolean,
  width?: number,
  height?: number,
  scene?: OBJ_Scene | Scene,
  changeScene?: Scene,
  xAlign?: 'left' | 'center' | 'right' | number,
  yAlign?: 'bottom' | 'middle' | 'top' | number,
} & OBJ_Generic;


/**
 * The Gesture primitive converts common gestures into `'zoom'` and `'pan'`
 * notifications.
 *
 * The guesture primitive handles the gestures:
 * - Mouse wheel change (often used for zooming and panning with a mouse)
 * - Drag (often used for panning with touch devices or a mouse)
 * - Pinching (often used for zooming and panning on touch devices)
 *
 * The primitive is a rectangle, usually transparant, that captures gestures.
 * Gestures can be limited to if they happen in the rectangle or not. The
 * rectangle can cover the whole figure, or just a portion of the figure if
 * only a portion needs to be zoomed/panned.
 *
 * # Pan
 *
 * A pan is an offset in xy.
 *
 * The gestures that can generate pan events are:
 * - Mouse click then drag
 * - Finger touch then drag (touch devices)
 * - Mouse wheel change
 *
 * For the mouse click and drage, and finger touch and drag gestures, the pan
 * value tracks the change in position of the mouse/finger in the gesture
 * primitive rectangle. For example, if the rectangle has a width of 2, and the
 * mouse or touch moves across half the width of the rectangle, then the pan
 * offset will be 1.
 *
 * For the mouse wheel change, a `sensitivity` value is used to speed up or
 * slow down the pan.
 *
 * When a pan event happens, a `'pan'` notification is published. The parameter
 * passed to any subscribers is the pan offset value, but if more information
 * is needed (like the pan delta for example) then `getPan()` can be called.
 *
 * # Zoom
 *
 * A zoom is a magnification at a point in the rectangle. The zoom point will
 * stay stationary, while the other points around it spread out (when zooming
 * in) or compress in (when zooming out). The zoom event thus includes a pan
 * offset to ensure the zoom point stays stationary, as well as a magnification
 * value.
 *
 * The gestures that can generate zoom events are:
 * - Mouse wheel vertical change
 * - Finger touch pinch
 *
 * A `sensitivity` value is used to speed up or slow down zooming.
 *
 * When a zoom event happens, a `'zoom'` notification is published. The
 * parameter passed to any subscribers is the zoom magnification value, but if
 * more information is needed (like the zoom delta or zoom position for
 * example) then `getZoom()` can be called.
 *
 * Zoom and pan events can be used in many ways. One of the most common ways
 * will be to change a {@link Scene} that contains one or more figure elements
 * allowing a user to pan or zoom through the scene.
 *
 * In such cases, the `zoomScene()` and `panScene()` methods can be used to do
 * this easily. If the scene of interest is the default scene of the figure,
 * then make sure the gesture primitive has its own separate scene so it is not
 * zoomed and panned itself.
 *
 * The gesture primitive can have its zoom and pan manually set using the
 * `setZoom()` and `setPan()` methods.
 */
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
    cumAngle: number,
    pinching: boolean,
    enabled: boolean,
    position: Point | null,
  };

  pan: {
    enabled: boolean,
    offset: Point,
    left: null | number,
    right: null | number,
    bottom: null | number,
    top: null | number,
    delta: Point,
    sensitivity: number,
    wheel: boolean,
    momentum: boolean,
  };

  justMoved: boolean;
  originalPosition: Point;

  mousePixelPosition: Point;
  onlyWhenTouched: boolean;
  relativeScene: null | Scene;

  notificationIDs: Array<number>;

  changeScene: Scene;

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
      position: null,
    };
    this.pan = {
      enabled: false,
      offset: new Point(0, 0),
      left: null,
      right: null,
      top: null,
      bottom: null,
      delta: new Point(0, 0),
      sensitivity: 1,
      wheel: false,
      momentum: false,
    };
    this.justMoved = false;
    this.onlyWhenTouched = true;
    this.notificationIDs = [];
    this.originalPosition = this.getPosition();
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
    if (options.changeScene != null) {
      this.changeScene = options.changeScene;
    }
    this.setMovable();
    if (!this.pan.momentum) {
      this.move.freely = false;
    }
    this.notifications.add('beforeMove', this.setupMove.bind(this));
    this.notifications.add('beforeMoveFreely', this.setupMove.bind(this));
    this.notifications.add('setTransform', this.dragPan.bind(this));
  }

  setupMove() {
    this.originalPosition = this.getPosition();
    this.justMoved = true;
  }

  dragPan() {
    if (!this.justMoved) {
      return;
    }
    this.justMoved = false;
    if (!this.pan.enabled) {
      return;
    }
    this.pan.delta = this.getPosition().sub(this.originalPosition);
    this.transform.updateTranslation(this.originalPosition);
    this.setPanOffset(this.pan.offset.add(this.pan.delta));
    this.notifications.publish('pan', this.pan.offset);
    if (this.changeScene != null) {
      this.panScene(this.changeScene);
    }
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

  wheelHandler(delta: Point) {
    if (!this.pan.enabled && !this.zoom.enabled) {
      return;
    }
    if (this.onlyWhenTouched) {
      if (this.mousePixelPosition == null || !this.isBeingTouched(this.transformPoint(this.mousePixelPosition, 'pixel', 'gl'))) {
        return;
      }
    }
    if (this.zoom.enabled) {
      let mag = this.zoom.mag + delta.y / 10 * this.zoom.sensitivity * this.zoom.mag / 100;
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
      if (this.changeScene != null) {
        this.zoomScene(this.changeScene);
      }
      return;
    }
    if (!this.pan.wheel) {
      return;
    }
    const scene = this.getScene();
    this.pan.delta = delta.scale(1 / 10 * (scene.right - scene.left) / 100 * this.pan.sensitivity);
    this.pan.delta.x *= -1;
    this.setPanOffset(this.pan.offset.add(this.pan.delta));
    this.notifications.publish('pan', this.pan.offset);
    if (this.changeScene != null) {
      this.panScene(this.changeScene);
    }
  }

  /**
   * Change the position and scale of an element to simulate it zooming.
   *
   * Note, the element will stay in the same space it was previously, and
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
    const s = this.getScene();
    // const p = this.pan.offset.scale(((scene.right - scene.left) * scene.zoom) / ((s.right - s.left)));
    // const unscaled = this.pan.offset.scale(1 / this.zoom.mag);
    // const p = unscaled.scale((scene.right - scene.left) / (s.right - s.left));
    const p = this.pan.offset.scale((scene.right - scene.left) / (s.right - s.left) / scene.zoom);
    scene.setPanZoom(p, this.zoom.mag);
    console.log(scene.zoom, p.round(2).toArray())
    this.animateNextFrame();
  }

  panScene(scene: Scene) {
    const s = this.getScene();
    const p = this.pan.offset.scale((scene.right - scene.left) / (s.right - s.left) / scene.zoom);
    scene.setPan(p);
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
    this.zoom.current = {
      position: zoomPosition, angle, distance, mag: this.zoom.mag,
    };
    if (this.zoom.position != null) {
      const newPosition = this.zoom.position.scale(mag / oldMag);
      this.pan.delta = this.zoom.position.sub(newPosition).scale(1 / mag);
    } else {
      const newPosition = zoomPosition.scale(mag / oldMag);
      this.pan.delta = zoomPosition.sub(newPosition).scale(1 / mag);
    }
    this.setPanOffset(
      this.pan.offset.sub(this.pan.delta),
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
    if (this.changeScene != null) {
      this.zoomScene(this.changeScene);
    }
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
    if (options.position != null) { this.zoom.position = getPoint(options.position); }
  }

  setPanOptions(options: OBJ_PanOptions) {
    if (options.left !== undefined) { this.pan.left = options.left; }
    if (options.bottom !== undefined) { this.pan.bottom = options.bottom; }
    if (options.top !== undefined) { this.pan.top = options.top; }
    if (options.right !== undefined) { this.pan.right = options.right; }
    if (options.sensitivity !== undefined) { this.pan.sensitivity = options.sensitivity; }
    if (options.wheel !== undefined) { this.pan.wheel = options.wheel; }
    if (options.momentum !== undefined) { this.pan.momentum = options.momentum; }
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
    if (this.changeScene != null) {
      this.zoomScene(this.changeScene);
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
    };
  }

  getPan() {
    return {
      offset: this.pan.offset,
      delta: this.pan.delta,
    };
  }

  // moveGesture(
  //   previousGLPoint: Point,
  //   currentGLPoint: Point,
  //   beingTouchedElement: FigureElement,
  // ) {
  //   if (!this.pan.enabled) {
  //     return;
  //   }
  //   if (this.onlyWhenTouched && beingTouchedElement !== this) {
  //     return;
  //   }
  //   const previousScenePoint = this.glToScene(previousGLPoint);
  //   const currentScenePoint = this.glToScene(currentGLPoint);
  //   const delta = currentScenePoint.sub(previousScenePoint);
  //   this.pan.delta = delta;
  //   this.setPanOffset(this.pan.offset.add(delta.scale(1 / this.zoom.mag)));
  //   this.notifications.publish('pan', this.pan.offset);
  // }

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
    this.notifications.publish('setFigure');
  }

  cleanupIDs() {  // $FlowFixMe
    this.notificationIDs.forEach(id => this.figure.notifications.remove(id));
    this.notificationIDs = [];
  }
}
