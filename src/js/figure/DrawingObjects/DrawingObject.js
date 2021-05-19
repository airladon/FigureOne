// @flow

import {
  Point, // Rect, getBoundingRect,
} from '../../tools/g2';
// import type {
//   TypeParsablePoint
// } from '../../tools/g2';
import { getState } from '../Recorder/state';
import type { TypeColor } from '../../tools/types';
import type { CPY_Step } from '../geometries/copy/copy';
import type { OBJ_TextDefinition } from '../FigurePrimitives/FigurePrimitives';

// A Drawing object can be:
//  - GL primitive vertices
//  - Text object for 2D drawing contexts
//  - HTML Object in the figure_html div
//
// It must have:
//
//   Properties:
//     - location     A reference location where relative boundaries are
//                    calculated from
//     - border       Array of borders in Figure Units
//
//   Methods:
//     - drawWithTransformMatrix(transformMatrix)
//     - calcBorder(lastDrawTransformMatrix, glToFigureTransform)
//

// function getBounds(borderIn: null | Array<Array<Point>>, transformMatrix: Array<number> | null) {
//   if (transformMatrix == null) {
//     return borderIn;
//   }
//   if (
//     borderIn == null
//     || (borderIn.length === 1 && borderIn[0].length === 0)
//     || borderIn.length === 0
//   ) {
//     return [];
//   }

//   const boundaries = [];
//   borderIn.forEach((boundary) => {
//     const border = [];
//     boundary.forEach((point) => {
//       border.push(point.transformBy(transformMatrix));
//     });
//     boundaries.push(border);
//   });
//   return boundaries;
// }

/**
 * Drawing Object
 *
 * Manages drawing an element to a WebGL or Context 2D canvas. Can also
 * be used to manage a HTML element on the screen.
 *
 * @property {Array<Array<Point>>} border each array of points defines a
 * closed boundary or border of the element. An element may have multiple
 * closed borders. A border defines where a shape can be touched, or how it
 * bounces of figure boundaries
 * @property {Array<Array<Point>>} holeBorder areas where a shape cannot be
 * touched
 * @see {@link FigureElementPrimitive}
 */
class DrawingObject {
  // numPoints: number;           // Number of primative vertices
  location: Point;
  border: Array<Array<Point>>; // Border vertices
  textBorder: Array<Array<Point>>; // Border vertices
  textBorderBuffer: Array<Array<Point>>;
  // touchBorder: Array<Array<Point>>;
  // hole: Array<Array<Point>>;  // Border of any holes inside of main border
  // +change: (any, any, any) => void;
  // onLoad: Function | null;   // Only used for drawing objects with asynchronous
  //                            loading (like textures)
  type: string;
  state: 'loading' | 'loaded';

  constructor() {
    // this.numPoints = 0;
    this.location = new Point(0, 0);
    // this.border = [[]];
    // this.touchBorder = [[]];
    // this.hole = [[]];
    // this.onLoad = null;
    this.type = 'drawingObject';
    // this.state = 'loading';
  }

  _dup() {
    return this;
  }

  // // Helper function hack used in TextObject
  // // eslint-disable-next-line class-methods-use-this, no-unused-vars
  // transformBorder(
  //   borderIn: null | Array<Array<Point>>,
  //   transformMatrix: Array<number> | null,
  // ) {
  //   return getBounds(borderIn, transformMatrix);
  // }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  setText(textOrOptions: string | OBJ_TextDefinition, index: number = 1) {
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  update(options: Object) {
  }


  // getBoundaries(transformMatrix: null | Array<number> = null): Array<Array<Point>> {
  //   return getBounds(this.border, transformMatrix);
  // }

  // getTouchBoundaries(transformMatrix: null | Array<number> = null): Array<Array<Point>> {
  //   return getBounds(this.touchBorder, transformMatrix);
  // }

  // getBoundaryHoles(transformMatrix: null | Array<number> = null): Array<Array<Point>> {
  //   return getBounds(this.hole, transformMatrix);
  // }
  /* eslint-enable */

  /* eslint-disable class-methods-use-this, no-unused-vars */
  drawWithTransformMatrix(
    transformMatrix: Array<number>,
    color: TypeColor,
    // canvasIndex: number,
    numPoints: number,
  ) {
  }
  /* eslint-enable */

  // getBoundingRect(transformMatrix: Array<number> | null = null): Rect {
  //   const boundaries = this.getBoundaries(transformMatrix);
  //   return getBoundingRect(boundaries);
  // }

  getLocation(transformMatrix: Array<number> | null = null): Point {
    if (transformMatrix == null) {
      return this.location;
    }
    return this.getLocation().transformBy(transformMatrix);
  }

  // eslint-disable-next-line class-methods-use-this
  getPointCountForAngle() {
    return 0;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  updateVertices(vertices: Array<number>) {
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  updateBuffer(name: string, data: Array<number>) {
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  updateUniform(uniformName: string, value: number | Array<number>) {
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  getUniform(uniformName: string) {
  }

  // getRelativeBoundingRect(transformMatrix: Array<number> | null = null): Rect {
  //   const location = this.getLocation(transformMatrix);
  //   const absoluteBoundaries =
  //     this.getBoundingRect(transformMatrix);
  //   const relativeBoundaries = new Rect(
  //     absoluteBoundaries.left - location.x,
  //     absoluteBoundaries.bottom - location.y,
  //     absoluteBoundaries.width,
  //     absoluteBoundaries.height,
  //   );
  //   return relativeBoundaries;
  // }

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

  /* eslint-disable no-unused-vars, class-methods-use-this */
  change(
    drawingPrimitive: any,
    // border: Array<Array<Point>> | 'points' | 'rect',
    // touchBorder: Array<Array<Point>> | 'border' | 'rect' | 'none',
    // holes: Array<Array<Point>> | 'none',
    copy: Array<CPY_Step> = [],
  ) {
  }
  /* eslint-enable no-unused-vars, class-methods-use-this */

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [];
  }

  _state(options: Object) {
    return getState(this, this._getStateProperties(), options);
  }
}

export default DrawingObject;
