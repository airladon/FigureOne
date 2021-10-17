// @flow
import { FigureElementPrimitive } from '../Element';
import { CustomAnimationStep } from '../Animation/AnimationStep/CustomStep';
import AnimationManager from '../Animation/AnimationManager';
import type { OBJ_AnimationStep } from '../Animation/AnimationStep';
import {
  Point, getPoint, Line, getRect,
} from '../../tools/g2';
import type { FigureElement } from '../Element';
import type { TypeParsablePoint, TypeParsableRect } from '../../tools/g2';
import type Scene from '../../tools/geometry/scene';
import { joinObjects } from '../../tools/tools';
import type { OBJ_Rectangle } from './FigurePrimitiveTypes2D';

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
  max?: null | number,
  min?: null | number,
  scale?: number,
}

export type OBJ_PanOptions = {
  bounds?: TypeParsableRect,
  scale?: number,
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
    max: null | number,
    min: null | number,
    scale: number,
    mag: number,
    cumOffset: Point,
    cumAngle: number,
    pinching: boolean,
    enabled: boolean,
  };

  mousePixelPosition: Point;

  animations: {
    zoom: (OBJ_AnimationStep) => CustomAnimationStep,
    pan: (OBJ_AnimationStep) => CustomAnimationStep,
  } & AnimationManager;

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
      cumOffset: new Point(0, 0),
      cumAngle: new Point(0, 0),
      pinching: false,
      scale: 1,
      enabled: false,
    };
  }

  setup(options: OBJ_Gesture) {
    if (options.zoom != null && typeof options.zoom !== 'boolean') {
      this.setZoomOptions(options.zoom);
    }
    if (options.zoom) {
      this.zoom.enabled = true;
    }
  }

  mousePosition(pixelPoint: Point) {
    this.mousePixelPosition = pixelPoint;
  }

  wheelHandler(deltaY: number) {
    // const oldZoom = this.zoom.last.mag;
    let mag = this.zoom.mag + deltaY / 10 * this.zoom.scale * this.zoom.mag / 100;
    if (this.zoom.min != null) {
      mag = Math.max(mag, this.zoom.min);
    }
    if (this.zoom.max != null) {
      mag = Math.min(mag, this.zoom.max);
    }
    if (this.mousePixelPosition == null) {
      this.updateZoom(mag, this.transformPoint([0, 0], 'gl', 'figure'));
    } else {
      const mousePosition = this.transformPoint(this.mousePixelPosition, 'pixel', 'figure');
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
    element.setPosition(o.add(this.zoom.cumOffset).scale(this.zoom.mag));
    if (scale) {
      element.setScale(this.zoom.mag);
    }
  }

  /**
   * Changes a 2D scene to simulate zooming in and out
   */
  zoom2DScene(scene: Scene, original: TypeParsableRect) {
    // Get original scene
    const r = getRect(original);
    const left = r.left / this.zoom.mag;
    const bottom = r.bottom / this.zoom.mag;
    const right = r.right / this.zoom.mag;
    const top = r.top / this.zoom.mag;
    scene.set2D({
      left: left - this.zoom.cumOffset.x,
      right: right - this.zoom.cumOffset.x,
      bottom: bottom - this.zoom.cumOffset.y,
      top: top - this.zoom.cumOffset.y,
    });
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
    this.zoom.cumOffset = this.zoom.cumOffset.add(
      zoomPosition.sub(newPosition).scale(1 / mag),
    );
    this.zoom.cumAngle += angle - this.zoom.last.angle;
  }

  startPinchZoom(
    touch1PixelPos: Point,
    touch2PixelPos: Point,
    beingTouchedElement: null | FigureElement,
  ) {
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
    // const oldZoom = this.zoom.last.mag;
    // const pixelPoints = this.clientsToPixel([touch1ClientPos, touch2ClientPos]);
    const line = new Line(touch1PixelPos, touch2PixelPos);

    const d = line.length();
    // const { current, lastDistance, scale } = this.zoom;
    let mag = this.zoom.mag
      + (d - this.zoom.current.distance) / 5 * this.zoom.scale * this.zoom.mag / 100;
    if (this.zoom.min != null) {
      mag = Math.max(mag, this.zoom.min);
    }
    if (this.zoom.max != null) {
      mag = Math.min(mag, this.zoom.max);
    }
    const position = this.transformPoint(line.pointAtPercent(0.5), 'pixel', 'figure');
    this.updateZoom(mag, position, d, line.angle());
    this.notifications.publish('zoom', [this.zoom.mag]);
  }


  endPinchZoom() {
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
    if (options.scale !== undefined) { this.zoom.scale = options.scale; }
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
    this.updateZoom(z.mag, z.position, z.distance, z.angle);
    this.zoom.pinching = z.pinching;
    if (notify) {
      this.notifications.publish('zoom', [this.zoom.mag]);
    }
  }

  /**
   * @return {OBJ_Zoom}
   */
  getZoom() {
    return {
      last: this.zoom.last,
      current: this.zoom.current,
      mag: this.zoom.mag,
      offset: this.zoom.cumOffset,
      angle: this.zoom.cumAngle,
    };
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
    this.figure.notifications.add('gestureWheel', this.wheelHandler.bind(this));
    this.figure.notifications.add('mousePosition', this.mousePosition.bind(this));
    this.figure.notifications.add('gestureStartPinch', this.startPinchZoom.bind(this));
    this.figure.notifications.add('gesturePinching', this.pinchZoom.bind(this));
    this.figure.notifications.add('gesturePinchEnd', this.endPinchZoom.bind(this));
    this.notifications.publish('setFigure');
  }
}
