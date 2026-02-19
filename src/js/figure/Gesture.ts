import { Point } from '../tools/g2';
import type Figure from './Figure';

class Gesture {
  previousPoint!: Point;
  figure: Figure;
  mouseDown!: boolean;
  enable: boolean;
  start: (p: Point) => boolean;
  end: (a: boolean, b: boolean) => void;
  move: (prev: Point, curr: Point) => boolean;
  free: (p: Point) => void;
  toggleCursor: () => void;
  wheel: (deltaX: number, deltaY: number, deltaMode: 0x00 | 0x01 | 0x02) => any;
  binds: {
    mouseDownHandler: (e: MouseEvent) => void;
    mouseUpHandler: (e: MouseEvent) => void;
    mouseMoveHandler: (e: MouseEvent) => void;
    touchStartHandler: (e: TouchEvent) => void;
    touchEndHandler: (e: TouchEvent) => void;
    touchMoveHandler: (e: TouchEvent) => void;
    wheelHandler: (e: WheelEvent) => void;
  };

  constructor(figure: Figure) {
    this.figure = figure;

    // Override these if you want to use your own touch handlers
    this.start = this.figure.touchDownHandlerClient.bind(this.figure);
    this.end = this.figure.touchUpHandler.bind(this.figure);
    this.move = this.figure.touchMoveHandlerClient.bind(this.figure);
    this.free = this.figure.touchFreeHandler.bind(this.figure);
    this.toggleCursor = this.figure.toggleCursor.bind(this.figure);
    this.wheel = this.figure.wheelHandler.bind(this.figure);

    this.binds = {
      mouseDownHandler: this.mouseDownHandler.bind(this),
      mouseUpHandler: this.mouseUpHandler.bind(this),
      mouseMoveHandler: this.mouseMoveHandler.bind(this),
      touchStartHandler: this.touchStartHandler.bind(this),
      touchEndHandler: this.touchEndHandler.bind(this),
      touchMoveHandler: this.touchMoveHandler.bind(this),
      wheelHandler: this.wheelHandler.bind(this),
    };

    this.addEvent('mousedown', this.binds.mouseDownHandler, false);
    this.addWindowEvent('mouseup', this.binds.mouseUpHandler, false);
    this.addEvent('mousemove', this.binds.mouseMoveHandler, false);
    this.addEvent('touchstart', this.binds.touchStartHandler, false);
    this.addWindowEvent('touchend', this.binds.touchEndHandler, false);
    this.addEvent('touchmove', this.binds.touchMoveHandler, false);
    this.addEvent('wheel', this.binds.wheelHandler, false);
    this.enable = true;
  }

  addEvent(event: string, method: any, flag: boolean) {
    this.figure.gestureCanvas.addEventListener(
      event,
      method.bind(this),
      flag,
    );
  }

  addWindowEvent(event: string, method: any, flag: boolean) {
    window.addEventListener(
      event,
      method.bind(this),
      flag,
    );
  }

  removeEvent(event: string, method: any, flag: boolean) {
    this.figure.gestureCanvas.removeEventListener(
      event,
      method.bind(this),
      flag,
    );
  }

  startHandler(point: Point) {
    if (this.enable) {
      this.mouseDown = true;
      this.previousPoint = point;
      return this.start(point);
    }
    return false;
  }

  endHandler() {
    this.mouseDown = false;
    this.end(false, true);
  }

  moveHandler(event: MouseEvent | TouchEvent, point: Point) {
    if (this.enable && this.mouseDown) {
      const disableEvent = this.move(this.previousPoint, point);
      if (disableEvent) {
        event.preventDefault();
      }
      this.previousPoint = point;
    } else {
      this.free(point);
    }
  }

  wheelHandler(event: WheelEvent) {
    const preventDefault = this.wheel(event.deltaX, event.deltaY, event.deltaMode as 0x00 | 0x01 | 0x02);
    if (preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  touchStartHandler(event: TouchEvent) {
    const touch = event.touches[0];
    let disableEvent = this.startHandler(new Point(touch.clientX, touch.clientY));
    if (event.targetTouches.length === 2) {
      disableEvent = true;
      this.figure.startPinchZoom(
        new Point(event.targetTouches[0].clientX, event.targetTouches[0].clientY),
        new Point(event.targetTouches[1].clientX, event.targetTouches[1].clientY),
      );
    }
    if (disableEvent) {
      event.preventDefault();
    }
  }

  mouseDownHandler(event: MouseEvent) {
    const disableEvent = this.startHandler(new Point(event.clientX, event.clientY));
    if (disableEvent) {
      event.preventDefault();
    }
  }

  touchMoveHandler(event: TouchEvent) {
    const touch = event.touches[0];
    this.moveHandler(event, new Point(touch.clientX, touch.clientY));
    if (event.targetTouches.length > 1) {
      this.figure.pinchZoom(
        new Point(event.targetTouches[0].clientX, event.targetTouches[0].clientY),
        new Point(event.targetTouches[1].clientX, event.targetTouches[1].clientY),
      );
    }
  }

  mouseMoveHandler(event: MouseEvent) {
    this.figure.mousePosition(new Point(event.offsetX, event.offsetY));
    this.moveHandler(event, new Point(event.clientX, event.clientY));
  }

  mouseUpHandler() {
    this.endHandler();
  }

  touchEndHandler(event: TouchEvent) {
    if (event.targetTouches.length < 2) {
      this.figure.endPinchZoom();
    }
    this.endHandler();
  }

  destroy() {
    this.removeEvent('mousedown', this.binds.mouseDownHandler, false);
    this.removeEvent('mouseup', this.binds.mouseUpHandler, false);
    this.removeEvent('mousemove', this.binds.mouseMoveHandler, false);
    this.removeEvent('touchstart', this.binds.touchStartHandler, false);
    this.removeEvent('touchend', this.binds.touchEndHandler, false);
    this.removeEvent('touchmove', this.binds.touchMoveHandler, false);
    this.removeEvent('wheel', this.binds.wheelHandler, false);
  }
}

export default Gesture;
