// @flow

import {
  Point, Rect, getBoundingRect,
} from '../../tools/g2';
import { getState } from '../state';

// A Drawing object can be:
//  - GL primitive vertices
//  - Text object for 2D drawing contexts
//  - HTML Object in the diagram_html div
//
// It must have:
//
//   Properties:
//     - location     A reference location where relative boundaries are
//                    calculated from
//     - border       Array of borders in Diagram Units
//
//   Methods:
//     - drawWithTransformMatrix(transformMatrix)
//     - calcBorder(lastDrawTransformMatrix, glToDiagramTransform)
//
class DrawingObject {
  // numPoints: number;           // Number of primative vertices
  border: Array<Array<Point>>; // Border vertices
  location: Point;
  holeBorder: Array<Array<Point>>;  // Border of any holes inside of main border
  +change: (any, any, any) => void;
  onLoad: Function | null;   // Only used for drawing objects with asynchronous
  //                            loading (like textures)
  type: string;
  state: 'loading' | 'loaded';

  constructor() {
    // this.numPoints = 0;
    this.location = new Point(0, 0);
    this.border = [[]];
    this.holeBorder = [[]];
    this.onLoad = null;
    this.type = 'drawingObject';
    this.state = 'loading';
  }

  _dup() {
    return this;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  setText(text: string) {
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  update(options: Object) {
  }

  getGLBoundaries(lastDrawTransformMatrix: Array<number>): Array<Array<Point>> {
    const glBoundaries = [];
    this.border.forEach((boundary) => {
      const glBorder = [];
      boundary.forEach((point) => {
        glBorder.push(point.transformBy(lastDrawTransformMatrix));
      });
      glBoundaries.push(glBorder);
    });
    return glBoundaries;
  }

  getGLBoundaryHoles(lastDrawTransformMatrix: Array<number>): Array<Array<Point>> {
    const glBoundaries = [];
    this.holeBorder.forEach((boundary) => {
      const glBorder = [];
      boundary.forEach((point) => {
        glBorder.push(point.transformBy(lastDrawTransformMatrix));
      });
      glBoundaries.push(glBorder);
    });
    return glBoundaries;
  }
  /* eslint-enable */

  /* eslint-disable class-methods-use-this, no-unused-vars */
  drawWithTransformMatrix(
    transformMatrix: Array<number>,
    color: Array<number>,
    canvasIndex: number,
    numPoints: number,
  ) {
  }
  /* eslint-enable */

  getGLBoundingRect(lastDrawTransformMatrix: Array<number>): Rect {
    const boundaries = this.getGLBoundaries(lastDrawTransformMatrix);
    // const min = new Point(0, 0);
    // const max = new Point(0, 0);
    // let firstPoint = true;

    // boundaries.forEach((boundary) => {
    //   boundary.forEach((point) => {
    //     if (firstPoint) {
    //       min.x = point.x;
    //       min.y = point.y;
    //       max.x = point.x;
    //       max.y = point.y;
    //       firstPoint = false;
    //     } else {
    //       min.x = point.x < min.x ? point.x : min.x;
    //       min.y = point.y < min.y ? point.y : min.y;
    //       max.x = point.x > max.x ? point.x : max.x;
    //       max.y = point.y > max.y ? point.y : max.y;
    //     }
    //   });
    // });
    // return new Rect(min.x, min.y, max.x - min.x, max.y - min.y);
    return getBoundingRect(boundaries);
  }

  getVertexSpaceBoundingRect() {
    return getBoundingRect(this.border);
  }

  getLocation(): Point {
    return this.location;
  }

  // eslint-disable-next-line class-methods-use-this
  getGLLocation(lastDrawTransformMatrix: Array<number>): Point {
    return this.getLocation().transformBy(lastDrawTransformMatrix);
  }

  getRelativeGLBoundingRect(lastDrawTransformMatrix: Array<number>): Rect {
    const glLocation = this.getGLLocation(lastDrawTransformMatrix);
    const glAbsoluteBoundaries =
      this.getGLBoundingRect(lastDrawTransformMatrix);
    const glRelativeBoundaries = new Rect(
      glAbsoluteBoundaries.left - glLocation.x,
      glAbsoluteBoundaries.bottom - glLocation.y,
      glAbsoluteBoundaries.width,
      glAbsoluteBoundaries.height,
    );
    return glRelativeBoundaries;
  }

  getRelativeVertexSpaceBoundingRect() {
    const absoluteBoundaries =
      this.getVertexSpaceBoundingRect();
    const relativeBoundaries = new Rect(
      absoluteBoundaries.left - this.location.x,
      absoluteBoundaries.bottom - this.location.y,
      absoluteBoundaries.width,
      absoluteBoundaries.height,
    );
    return relativeBoundaries;
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  change(drawingPrimitive: any, border: Array<Array<Point>>, holes: Array<Array<Point>>) {
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [];
  }

  _state() {
    return getState(this, this._getStateProperties());
  }
}

export default DrawingObject;
