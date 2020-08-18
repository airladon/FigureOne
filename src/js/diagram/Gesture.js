// @flow

import { Point } from '../tools/g2';
// eslint-disable-next-line import/no-cycle
import Diagram from './Diagram';

class Gesture {
  previousPoint: Point;
  diagram: Diagram;
  mouseDown: boolean;
  enable: boolean;
  start: (Point) => boolean;
  end: void => void;
  move: (Point, Point) => boolean;
  free: (Point) => void;
  // cursor: () => void;
  toggleCursor: () => void;

  constructor(diagram: Diagram) {
    this.diagram = diagram;
    // console.log(diagram.canvas.offsetWidth)
    // this.diagram.canvas.onmousedown = this.mouseDownHandler.bind(this);
    // this.diagram.canvas.onmouseup = this.mouseUpHandler.bind(this);
    // this.diagram.canvas.onmousemove = this.mouseMoveHandler.bind(this);
    // Override these if you want to use your own touch handlers
    this.start = this.diagram.touchDownHandler.bind(this.diagram);
    this.end = this.diagram.touchUpHandler.bind(this.diagram);
    this.move = this.diagram.touchMoveHandler.bind(this.diagram);
    this.free = this.diagram.touchFreeHandler.bind(this.diagram);
    this.toggleCursor = this.diagram.toggleCursor.bind(this.diagram);

    this.addEvent('mousedown', this.mouseDownHandler, false);
    this.addEvent('mouseup', this.mouseUpHandler, false);
    this.addEvent('mousemove', this.mouseMoveHandler, false);
    this.addEvent('touchstart', this.touchStartHandler, false);
    this.addEvent('touchend', this.touchEndHandler, false);
    this.addEvent('touchmove', this.touchMoveHandler, false);
    // this.addEvent('keypress', this.keypressHandler, false);
    document.addEventListener('keypress', this.toggleCursor, false);
    // this.diagram.canvas.addEventListener(
    //   'touchstart',
    //   this.touchStartHandler.bind(this), false,
    // );
    // this.diagram.canvas.addEventListener(
    //   'touchend',
    //   this.touchEndHandler.bind(this), false,
    // );
    // this.diagram.canvas.addEventListener(
    //   'touchmove',
    //   this.touchMoveHandler.bind(this), false,
    // );
    this.enable = true;
  }

  addEvent(event: string, method: Object, flag: boolean) {
    this.diagram.gestureCanvas.addEventListener(
      event,
      method.bind(this),
      flag,
    );
  }

  removeEvent(event: string, method: Object, flag: boolean) {
    this.diagram.gestureCanvas.removeEventListener(
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
    this.end();
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
    // event.preventDefault();
  }

  touchStartHandler(event: TouchEvent) {
    const touch = event.touches[0];
    const disableEvent = this.startHandler(new Point(touch.clientX, touch.clientY));
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
  }

  mouseMoveHandler(event: MouseEvent) {
    this.moveHandler(event, new Point(event.clientX, event.clientY));
  }

  mouseUpHandler() {
    this.endHandler();
  }

  touchEndHandler() {
    this.endHandler();
  }

  keypressHandler(event: KeyboardEvent) {
    // console.log(event.code, event.keyCode, String.fromCharCode(event.keyCode))
    // console.log(this.toggleCursor)
    if (String.fromCharCode(event.keyCode) === 'n' && this.toggleCursor) {
      // console.log('toggling')
      this.toggleCursor();
    }
  }

  destroy() {
    this.removeEvent('mousedown', this.mouseDownHandler, false);
    this.removeEvent('mouseup', this.mouseUpHandler, false);
    this.removeEvent('mousemove', this.mouseMoveHandler, false);
    this.removeEvent('touchstart', this.touchStartHandler, false);
    this.removeEvent('touchend', this.touchEndHandler, false);
    this.removeEvent('touchmove', this.touchMoveHandler, false);
    // this.removeEvent('keypress', this.keypressHandler, false);
    // $FlowFixMe
    if (document.removeEvent != null) {
      document.removeEvent('keypress', this.keypressHandler, false);
    }
  }
}

export default Gesture;
