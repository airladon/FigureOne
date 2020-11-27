// @flow
import {
  Point, Rect, // getPoints,
} from '../../../tools/g2';
// import type { TypeParsablePoint } from '../../../tools/g2';
// import { joinObjects } from '../../../tools/tools';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';
import { copyPoints } from '../../geometries/copy/copy';
import type { CPY_Step } from '../../geometries/copy/copy';


class VertexGeneric extends VertexObject {
  width: number;
  close: boolean;
  // borderToPoint: TypeBorderToPoint;

  constructor(
    webgl: Array<WebGLInstance>,
    vertices: Array<Point>,
    // border: Array<Array<Point>>,
    // touchBorder: Array<Array<Point>> | 'border' | 'rect' | 'none',
    // holeBorder: Array<Array<Point>> | 'none',
    drawType: 'triangles' | 'strip' | 'fan' | 'lines',
    textureLocation: string = '',
    textureVertexSpace: Rect = new Rect(-1, -1, 2, 2),
    textureCoords: Rect = new Rect(0, 0, 1, 1),
    textureRepeat: boolean = false,
    copy: Array<CPY_Step> = [],
  ): void {
    if (textureLocation !== '') {
      super(webgl, 'withTexture', 'withTexture');
    } else {
      super(webgl);
    }
    // super(webgl);
    if (drawType === 'lines') {
      this.glPrimitive = this.gl[0].LINES;
    } else if (drawType === 'strip') {
      this.glPrimitive = this.gl[0].TRIANGLE_STRIP;
    } else if (drawType === 'fan') {
      this.glPrimitive = this.gl[0].TRIANGLE_FAN;
    }

    this.setupPoints(vertices, copy);
    this.setupTexture(textureLocation, textureVertexSpace, textureCoords, textureRepeat);
    this.setupBuffer();
  }

  change(
    vertices: Array<Point>,
    // border: Array<Array<Point>> | 'points' | 'rect' = 'rect',
    // touchBorder: Array<Array<Point>> | 'border' | 'rect' | 'none' = 'border',
    // holeBorder: Array<Array<Point>> | 'none' = 'none',
    copy: Array<CPY_Step> = [],
  ) {
    this.setupPoints(vertices, copy);
    this.resetBuffer();
  }

  setupTexture(
    textureLocation: string = '',
    textureVertexSpace: Rect = new Rect(-1, -1, 2, 2),
    textureCoords: Rect = new Rect(0, 0, 1, 1),
    textureRepeat: boolean = false,
  ) {
    if (textureLocation) {
      this.texture = {
        id: textureLocation,
        src: textureLocation,
        type: 'image',
        points: [],
        repeat: textureRepeat,
      };

      this.createTextureMap(
        textureVertexSpace.left, textureVertexSpace.right,
        textureVertexSpace.bottom, textureVertexSpace.top,
        textureCoords.left, textureCoords.right,
        textureCoords.bottom, textureCoords.top,
      );
    }
  }

  setupPoints(
    vertices: Array<Point>,
    // border: Array<Array<Point>> | 'points' | 'rect' = 'rect',
    // touchBorder: Array<Array<Point>> | 'border' | 'rect' | 'none' = 'border',
    // holeBorder: Array<Array<Point>> | 'none' = 'none',
    copy: Array<CPY_Step> = [],
  ) {
    this.points = [];
    let newVerts = vertices;
    newVerts = copyPoints(vertices, copy);
    newVerts.forEach((v) => {
      this.points.push(v.x);
      this.points.push(v.y);
    });
    // let bounds;
    // if (border === 'rect' || touchBorder === 'rect') {
    //   const boundingRect = getBoundingRect(newVerts);
    //   bounds = [
    //     new Point(boundingRect.left, boundingRect.bottom),
    //     new Point(boundingRect.right, boundingRect.bottom),
    //     new Point(boundingRect.right, boundingRect.top),
    //     new Point(boundingRect.left, boundingRect.top),
    //   ];
    // }
    // if (border === 'rect') {  // $FlowFixMe
    //   this.border = [bounds];
    // } else if (border === 'points') {
    //   this.border = [newVerts];
    // } else {
    //   this.border = border;
    // }
    // if (touchBorder === 'none') {
    //   this.touchBorder = [];
    // } else if (touchBorder === 'rect') {   // $FlowFixMe
    //   this.touchBorder = [bounds];
    // } else if (touchBorder === 'border') {  // $FlowFixMe
    //   this.touchBorder = this.border;
    // } else {
    //   this.touchBorder = touchBorder;
    // }
    // if (holeBorder === 'none') {
    //   this.hole = [];
    // } else {
    //   this.hole = holeBorder;
    // }
  }
}

export default VertexGeneric;
