// @flow
import {
  Point, getBoundingRect, Rect,
} from '../../../tools/g2';
// import { joinObjects } from '../../../tools/tools';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';
import { copyPoints } from '../Geometries/copy/copy';
import type { CPY_Step } from '../Geometries/copy/copy';


class VertexGeneric extends VertexObject {
  width: number;
  close: boolean;
  // borderToPoint: TypeBorderToPoint;

  constructor(
    webgl: Array<WebGLInstance>,
    vertices: Array<Point>,
    border: ?Array<Array<Point>>,
    holeBorder: ?Array<Array<Point>>,
    drawType: 'triangles' | 'strip' | 'fan' | 'lines',
    textureLocation: string = '',
    textureVertexSpace: Rect = new Rect(-1, -1, 2, 2),
    textureCoords: Rect = new Rect(0, 0, 1, 1),
    textureRepeat: boolean = false,
    copy: ?Array<CPY_Step>,
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

    this.setupPoints(vertices, border, holeBorder, copy);
    this.setupTexture(textureLocation, textureVertexSpace, textureCoords, textureRepeat);
    this.setupBuffer();
  }

  change(
    vertices: Array<Point>,
    border: ?Array<Array<Point>>,
    holeBorder: ?Array<Array<Point>>,
  ) {
    this.setupPoints(vertices, border, holeBorder);
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
    border: ?Array<Array<Point>>,
    holeBorder: ?Array<Array<Point>>,
    copy: ?Array<CPY_Step>,
  ) {
    this.points = [];
    let newVerts = vertices;
    newVerts = copyPoints(vertices, copy);
    newVerts.forEach((v) => {
      this.points.push(v.x);
      this.points.push(v.y);
    });
    if (border == null) {
      const bounds = getBoundingRect(newVerts);
      this.border[0] = [
        new Point(bounds.left, bounds.bottom),
        new Point(bounds.right, bounds.bottom),
        new Point(bounds.right, bounds.top),
        new Point(bounds.left, bounds.top),
      ];
    } else {
      this.border = border;
    }
    if (holeBorder != null) {
      this.holeBorder = holeBorder;
    }
  }
}

export default VertexGeneric;
