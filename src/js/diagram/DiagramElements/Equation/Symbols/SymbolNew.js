// @flow
import { DiagramElementPrimitive } from '../../../Element';
import {
  Point, Transform, Rect,
} from '../../../../tools/g2';
import VertexSymbol from './VertexSymbol';
import WebGLInstance from '../../../webgl/webgl';
import Bounds from '../Elements/Bounds';


export default class Symbol extends DiagramElementPrimitive {
  constructor(
    webgl: Array<WebGLInstance>,
    color: Array<number>,
    transformOrLocation: Transform | Point,
    diagramLimits: Rect,
    symbolOptions: Object,
    triangles: 'strip' | 'triangles' | 'fan',
  ) {
    const vertexObject = new VertexSymbol(webgl, triangles);

    let initialT;
    if (transformOrLocation instanceof Transform) {
      initialT = transformOrLocation;
    } else {
      initialT = new Transform('Symbol').scale(1, 1).translate(0, 0);
    }
    super(vertexObject, initialT, color, diagramLimits);
    this.custom.options = symbolOptions;
    if (this.custom.options.draw === 'dynamic') {
      this.custom.scale = new Point(1, 1);
      this.internalSetTransformCallback = () => {
        const s = this.getScale();
        if (this.custom.scale.isNotEqualTo(s, 8)) {
          const [
            pointsNew, widthNew, heightNew,
          ] = this.getPoints(this.custom.options, s.x, s.y);
          this.drawingObject.updatePoints(
            pointsNew,
            widthNew,
            heightNew,
          );
          this.custom.scale = s;
        }
      };
    }

    // eslint-disable-next-line max-len
    this.custom.setSize = (location: Point, widthIn: number, heightIn: number) => {
      const t = this.transform._dup();
      if (
        this.custom.options.draw === 'static'
        && this.drawingObject.points.length === 0
      ) {
        let points;
        let width;
        let height;
        if (
          this.custom.options.staticHeight === 'first'
          || this.custom.options.staticWidth === 'first'
        ) {
          ([points, width, height] = this.getPoints(symbolOptions, widthIn, heightIn));
        } else if (this.custom.options.staticHeight != null
          || this.custom.options.staticWidth != null) {
          ([points, width, height] = this.getPoints(
            symbolOptions,
            this.custom.options.staticWidth,
            this.custom.options.staticHeight,
          ));
        }
        this.drawingObject.updatePoints(points, width, height);
        this.custom.options.staticHeight = height;
        this.custom.options.staticWidth = width;
        t.updateScale(width, height);
      } else {
        t.updateScale(widthIn, heightIn);
      }
      t.updateTranslation(location.x, location.y);
      this.setTransform(t);
    };
  }

  getTransform() {
    if (this.custom.options.draw === 'static') {
      const t = this.transform._dup();
      const s = t.s();
      if (s != null) {
        t.updateScale(
          s.x / this.custom.options.staticWidth,
          s.y / this.custom.options.staticHeight,
        );
      }
      return t;
    }
    const t = this.transform._dup();
    t.updateScale(1, 1);
    return t;
  }

  // eslint-disable-next-line class-methods-use-this
  getWidth(options: Object, height: number) {
    let width;
    if (options.draw === 'static') {
      let { staticHeight } = options;
      const { staticWidth } = options;
      if (staticHeight === 'first') {
        staticHeight = height;
      }
      ({ width } = this.getDefaultValues(staticHeight, staticWidth, options));
      if (width == null) {
        width = height;
      }
      return width / staticHeight * height;
    }
    ({ width } = options);
    ({ width } = this.getDefaultValues(height, width, options));
    return width;
  }

  // eslint-disable-next-line class-methods-use-this
  getHeight(options: Object, width: number) {
    let height;
    if (options.draw === 'static') {
      let { staticWidth } = options;
      const { staticHeight } = options;
      if (staticWidth === 'first') {
        staticWidth = width;
      } // ????
      ({ height } = this.getDefaultValues(staticHeight, staticWidth, options));
      if (height == null) {
        height = width;
      }
      return height / staticWidth * width;
    }
    ({ height } = options);
    ({ height } = this.getDefaultValues(height, width, options));
    return height;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  getBounds(options: Object, leftIn: number, bottomIn: number, widthIn: number, heightIn: number, side?: 'left' | 'right' | 'bottom' | 'top') {
    return new Bounds();
  }

  // eslint-disable-next-line class-methods-use-this
  getPoints(options: Object, width: number, height: number) {
    const points = [
      new Point(0, 0),
      new Point(width, 0),
      new Point(width, height),
      new Point(0, height),
    ];

    return [points, width, height];
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  getDefaultValues(height: ?number, width: ?number, options: {}) {
    // const out: {
    //   height?: number,
    //   width?: number,
    //   lineWidth?: number,
    //   tipWidth?: number,
    //   arrowWidth?: number,
    //   arrowHeight?: number,
    // } = {};
    // return out;
    return {};
  }
}
