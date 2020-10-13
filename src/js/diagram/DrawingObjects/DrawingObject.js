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

/**
 * Drawing Object
 *
 * Manages drawing an element to a WebGL or Context 2D canvas. Can also
 * be used to manage a HTML element on the screen.
 *
 * @property {Array<Array<Point>>} border each array of points defines a
 * closed boundary or border of the element. An element may have multiple
 * closed borders. A border defines where a shape can be touched, or how it
 * bounces of diagram boundaries
 * @property {Array<Array<Point>>} holeBorder areas where a shape cannot be
 * touched
 * @see {@link DiagramElementPrimitive}
 */
class DrawingObject {
  // numPoints: number;           // Number of primative vertices
  border: Array<Array<Point>>; // Border vertices
  location: Point;
  holeBorder: Array<Array<Point>>;  // Border of any holes inside of main border
  +change: (any, any, any) => void;
  // onLoad: Function | null;   // Only used for drawing objects with asynchronous
  //                            loading (like textures)
  type: string;
  state: 'loading' | 'loaded';

  constructor() {
    // this.numPoints = 0;
    this.location = new Point(0, 0);
    this.border = [[]];
    this.holeBorder = [[]];
    // this.onLoad = null;
    this.type = 'drawingObject';
    // this.state = 'loading';
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

  getBoundaries(transformMatrix: null | Array<number> = null): Array<Array<Point>> {
    if (transformMatrix == null) {
      return this.border;
    }
    const boundaries = [];
    this.border.forEach((boundary) => {
      const border = [];
      boundary.forEach((point) => {
        border.push(point.transformBy(transformMatrix));
      });
      boundaries.push(border);
    });
    return boundaries;
  }

  getBoundaryHoles(transformMatrix: null | Array<number> = null): Array<Array<Point>> {
    if (transformMatrix == null) {
      return this.holeBorder;
    }
    const boundaries = [];
    this.holeBorder.forEach((boundary) => {
      const border = [];
      boundary.forEach((point) => {
        if (transformMatrix != null) {
          border.push(point.transformBy(transformMatrix));
        } else {
          border.push(point._dup());
        }
      });
      boundaries.push(border);
    });
    return boundaries;
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

  getBoundingRect(transformMatrix: Array<number> | null = null): Rect {
    const boundaries = this.getBoundaries(transformMatrix);
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

  // getVertexSpaceBoundingRect() {
  //   return getBoundingRect(this.border);
  // }

  // getLocation(): Point {
  //   return this.location;
  // }

  getLocation(transformMatrix: Array<number> | null = null): Point {
    if (transformMatrix == null) {
      return this.location;
    }
    return this.getLocation().transformBy(transformMatrix);
  }

  getRelativeBoundingRect(transformMatrix: Array<number> | null = null): Rect {
    const location = this.getLocation(transformMatrix);
    const absoluteBoundaries =
      this.getBoundingRect(transformMatrix);
    const relativeBoundaries = new Rect(
      absoluteBoundaries.left - location.x,
      absoluteBoundaries.bottom - location.y,
      absoluteBoundaries.width,
      absoluteBoundaries.height,
    );
    return relativeBoundaries;
  }

  // getRelativeVertexSpaceBoundingRect() {
  //   const absoluteBoundaries =
  //     this.getVertexSpaceBoundingRect();
  //   const relativeBoundaries = new Rect(
  //     absoluteBoundaries.left - this.location.x,
  //     absoluteBoundaries.bottom - this.location.y,
  //     absoluteBoundaries.width,
  //     absoluteBoundaries.height,
  //   );
  //   return relativeBoundaries;
  // }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  change(drawingPrimitive: any, border: Array<Array<Point>>, holes: Array<Array<Point>>) {
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [];
  }

  _state(options: Object) {
    return getState(this, this._getStateProperties(), options);
  }
}

export default DrawingObject;
