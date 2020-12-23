// @flow
import {
  Point, Rect, getRect, // getPoints,
} from '../../../tools/g2';
// import type { TypeParsablePoint } from '../../../tools/g2';
import { joinObjects } from '../../../tools/tools';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';
import { copyPoints } from '../../geometries/copy/copy';
import type { CPY_Step } from '../../geometries/copy/copy';


class VertexGeneric extends VertexObject {
  width: number;
  close: boolean;
  copy: Array<CPY_Step>;
  vertices: Array<Point>;
  texOptions: {
    location: string,
    mapFrom: Rect,
    mapTo: Rect,
    repeat: boolean,
  };

  // borderToPoint: TypeBorderToPoint;

  constructor(
    webgl: Array<WebGLInstance>,
    // vertices: Array<Point>,
    // drawType: 'triangles' | 'strip' | 'fan' | 'lines',
    textureLocation: string = '',
    textureVertexSpace: Rect = new Rect(-1, -1, 2, 2),
    textureCoords: Rect = new Rect(0, 0, 1, 1),
    textureRepeat: boolean = false,
    // copy: Array<CPY_Step> = [],
  ): void {
    if (textureLocation !== '') {
      super(webgl, 'withTexture', 'withTexture');
    } else {
      super(webgl);
    }
    this.vertices = [];
    this.copy = [];
    // this.change({
    //   points: vertices,
    //   copy,
    //   drawType,
    // });

    // this.setupTexture(textureLocation, textureVertexSpace, textureCoords, textureRepeat);
    if (textureLocation !== '') {
      this.texOptions = {
        location: textureLocation,
        mapTo: textureVertexSpace,
        mapFrom: textureCoords,
        repeat: textureRepeat,
      };
      this.texture = {
        id: this.texOptions.location,
        src: this.texOptions.location,
        type: 'image',
        points: [],
        repeat: this.texOptions.repeat,
      };
      this.setupTexture(
        // textureLocation, textureVertexSpace, textureCoords, textureRepeat
      );
    }

    this.setupBuffer();
  }

  // $FlowFixMe
  change(options: {
    points?: Array<Point>,
    copy?: Array<CPY_Step>,
    drawType?: 'triangles' | 'strip' | 'fan' | 'lines',
    texture?: {
      location?: string,
      mapFrom?: Rect,
      mapTo?: Rect,
      repeat?: boolean,
    }
  }) {
    const {
      points, drawType, copy, texture,
    } = options;

    if (points != null) {
      this.vertices = points;
    }
    if (drawType != null) {
      if (drawType === 'lines') {
        this.glPrimitive = this.gl[0].LINES;
      } else if (drawType === 'strip') {
        this.glPrimitive = this.gl[0].TRIANGLE_STRIP;
      } else if (drawType === 'fan') {
        this.glPrimitive = this.gl[0].TRIANGLE_FAN;
      } else {
        this.glPrimitive = this.gl[0].TRIANGLES;
      }
    }
    if (copy != null) {
      this.copy = copy;
    }
    const newVerts = copyPoints(this.vertices, this.copy);
    this.points = [];
    newVerts.forEach((v) => {
      this.points.push(v.x);
      this.points.push(v.y);
    });
    if (texture != null) {
      if (texture.mapTo != null) {
        texture.mapTo = getRect(texture.mapTo);
      }
      if (texture.mapFrom != null) {
        texture.mapFrom = getRect(texture.mapFrom);
      }
      this.texOptions = joinObjects({}, this.texOptions, texture);
      this.setupTexture();
    }

    this.resetBuffer();
  }

  setupTexture(
    // textureLocation: string = '',
    // textureVertexSpace: Rect = new Rect(-1, -1, 2, 2),
    // textureCoords: Rect = new Rect(0, 0, 1, 1),
    // textureRepeat: boolean = false,
  ) {
    if (this.texOptions.location) {
      // this.texture = {
      //   id: textureLocation,
      //   src: textureLocation,
      //   type: 'image',
      //   points: [],
      //   repeat: textureRepeat,
      // };

      this.createTextureMap(
        this.texOptions.mapTo.left, this.texOptions.mapTo.right,
        this.texOptions.mapTo.bottom, this.texOptions.mapTo.top,
        this.texOptions.mapFrom.left, this.texOptions.mapFrom.right,
        this.texOptions.mapFrom.bottom, this.texOptions.mapFrom.top,
      );
    }
  }

  // setupPoints(
  // ) {
  //   const newVerts = copyPoints(this.vertices, this.copy);
  //   this.points = [];
  //   newVerts.forEach((v) => {
  //     this.points.push(v.x);
  //     this.points.push(v.y);
  //   });
  //   // let bounds;
  //   // if (border === 'rect' || touchBorder === 'rect') {
  //   //   const boundingRect = getBoundingRect(newVerts);
  //   //   bounds = [
  //   //     new Point(boundingRect.left, boundingRect.bottom),
  //   //     new Point(boundingRect.right, boundingRect.bottom),
  //   //     new Point(boundingRect.right, boundingRect.top),
  //   //     new Point(boundingRect.left, boundingRect.top),
  //   //   ];
  //   // }
  //   // if (border === 'rect') {  // $FlowFixMe
  //   //   this.border = [bounds];
  //   // } else if (border === 'points') {
  //   //   this.border = [newVerts];
  //   // } else {
  //   //   this.border = border;
  //   // }
  //   // if (touchBorder === 'none') {
  //   //   this.touchBorder = [];
  //   // } else if (touchBorder === 'rect') {   // $FlowFixMe
  //   //   this.touchBorder = [bounds];
  //   // } else if (touchBorder === 'border') {  // $FlowFixMe
  //   //   this.touchBorder = this.border;
  //   // } else {
  //   //   this.touchBorder = touchBorder;
  //   // }
  //   // if (holeBorder === 'none') {
  //   //   this.hole = [];
  //   // } else {
  //   //   this.hole = holeBorder;
  //   // }
  // }
}

export default VertexGeneric;
