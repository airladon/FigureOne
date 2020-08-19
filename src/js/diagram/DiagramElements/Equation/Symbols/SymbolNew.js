// @flow
import { DiagramElementPrimitive } from '../../../Element';
import {
  Point, Transform, Rect,
} from '../../../../tools/g2';
import {
  duplicate,
} from '../../../../tools/tools';
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
          this.pointsDefinition = {
            points: duplicate(pointsNew),
            width: widthNew,
            height: heightNew,
          };
          // $FlowFixMe
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
        // && this.drawingObject.points.length === 0
      ) {
        let points;
        let width = 0;
        let height = 0;
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
        this.pointsDefinition = {
          points: duplicate(points),
          width,
          height,
        };
        // $FlowFixMe
        this.drawingObject.updatePoints(points, width, height);
        this.custom.options.staticHeight = height;
        this.custom.options.staticWidth = width;
        // console.log('a', width, height)
        t.updateScale(width, height);
      } else {
        const [
          pointsNew, widthNew, heightNew,
        ] = this.getPoints(this.custom.options, widthIn, heightIn);
        this.pointsDefinition = {
          points: duplicate(pointsNew),
          width: widthNew,
          height: heightNew,
        };
        // $FlowFixMe
        this.drawingObject.updatePoints(
          pointsNew,
          widthNew,
          heightNew,
        );
        this.custom.scale = new Point(widthIn, heightIn);
        // console.log('b', widthIn, heightIn, this.getPath())
        t.updateScale(widthIn, heightIn);
      }
      t.updateTranslation(location.x, location.y);
      this.setTransform(t);
    };

    this.setPointsFromDefinition = () => {
      if (Object.keys(this.pointsDefinition).length === 0) {
        return;
      }
      const { points, width, height } = this.pointsDefinition;
      // $FlowFixMe
      this.drawingObject.updatePoints(points, width, height);
      // // if (width == null || height == null || location == null) {
      // //   return;
      // // }
      // this.custom.setSize(this.getPosition(), width, height);
    };
  }

  // // eslint-disable-next-line class-methods-use-this, no-unused-vars
  // updatePoints(points: Array<Point>, width: Number, height: number) {
  // }

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

  getBounds(
    options: Object,
    contentX: number,
    contentY: number,
    contentWidth: number,
    contentHeight: number,
    side?: 'left' | 'right' | 'bottom' | 'top',
  ) {
    // const contentWidth = contentWidthIn == null ? 0 : contentWidthIn;
    // const contentHeight = contentHeightIn == null ? 0 : contentHeightIn;
    const { width, height } = this.getDefaultValues(
      contentHeight, contentWidth, options,
    );
    const bounds = new Bounds();
    if (side === 'left') {
      bounds.left = contentX - width;
      bounds.bottom = contentY;
      bounds.top = bounds.bottom + height;
      bounds.right = bounds.left + width;
    } else if (side === 'right') {
      bounds.left = contentX;
      bounds.bottom = contentY;
      bounds.top = bounds.bottom + height;
      bounds.right = bounds.left + width;
    } else if (side === 'top') {
      bounds.bottom = contentY;
      bounds.top = contentY + height;
      bounds.left = contentX + contentWidth / 2 - width / 2;
      bounds.right = bounds.left + width;
    } else {
      bounds.top = contentY;
      bounds.bottom = contentY - height;
      bounds.left = contentX + contentWidth / 2 - width / 2;
      bounds.right = bounds.left + width;
    }
    bounds.width = width;
    bounds.height = height;
    bounds.ascent = height;
    bounds.descent = 0;
    return bounds;
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
  getDefaultValues(height: number, width: number, options: Object) {
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
