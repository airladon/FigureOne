// @flow
import { DiagramElementPrimitive } from '../../../Element';
import {
  Point, Transform, Rect,
} from '../../../../tools/g2';
import VertexSymbol from './VertexSymbol';
import WebGLInstance from '../../../webgl/webgl';


export default class Symbol {
  symbol: DiagramElementPrimitive;

  // eslint-disable-next-line class-methods-use-this
  getTriangles() {
    return 'strip';
  }

  constructor(
    webgl: Array<WebGLInstance>,
    color: Array<number>,
    transformOrLocation: Transform | Point,
    diagramLimits: Rect,
    symbolOptions: Object,
  ) {
    const getPoints = this.getPoints();
    const getWidth = this.getWidth();
    const getHeight = this.getHeight();
    const triangles = this.getTriangles();

    const vertexObject = new VertexSymbol(webgl, triangles);
    // const widthFromheight = getWidth('static', symbolOptions, 1);
    // const [points, width, height] = getPoints(symbolOptions, 1, 1);
    // const [points, width, height] = getPoints(symbolOptions, 1, 1);
    // vertexObject.updatePoints(points, width, height, true);

    let initialT;
    if (transformOrLocation instanceof Transform) {
      initialT = transformOrLocation;
    } else {
      initialT = new Transform('Symbol').scale(1, 1).translate(0, 0);
    }
    const symbol = new DiagramElementPrimitive(
      vertexObject, initialT, color, diagramLimits,
    );
    symbol.custom.options = symbolOptions;
    symbol.custom.getWidth = getWidth;
    symbol.custom.getHeight = getHeight;

    if (symbol.custom.options.draw === 'static') {
      // symbol.custom.type = 'static';
      symbol.getTransform = () => {
        const t = symbol.transform._dup();
        const s = t.s();

        if (s != null) {
          t.updateScale(
            s.x / symbol.custom.options.staticWidth,
            s.y / symbol.custom.options.staticHeight,
          );
        }
        return t;
      };
    } else {
      symbol.custom.scale = new Point(1, 1);
      symbol.internalSetTransformCallback = () => {
        const s = symbol.getScale();
        if (symbol.custom.scale.isNotEqualTo(s, 8)) {
          const [
            pointsNew, widthNew, heightNew,
          ] = getPoints(symbol.custom.options, s.x, s.y);
          symbol.drawingObject.updatePoints(
            pointsNew,
            widthNew,
            heightNew,
          );
          symbol.custom.scale = s;
        }
      };
      symbol.getTransform = () => {
        const t = symbol.transform._dup();
        t.updateScale(1, 1);
        return t;
      };
      // symbol.custom.type = 'dynamic';
    }

    // eslint-disable-next-line max-len
    symbol.custom.setSize = (location: Point, widthIn: number, heightIn: number) => {
      if (
        symbol.custom.options.draw === 'static'
        && symbol.drawingObject.points.length === 0
      ) {
        let points;
        let width;
        let height;
        if (
          symbol.custom.options.staticHeight === 'first'
          || symbol.custom.options.staticWidth === 'first'
        ) {
          ([points, width, height] = getPoints(symbolOptions, widthIn, heightIn));
        } else if (symbol.custom.options.staticHeight != null
          || symbol.custom.options.staticWidth != null) {
          ([points, width, height] = getPoints(
            symbolOptions,
            symbol.custom.options.staticWidth,
            symbol.custom.options.staticHeight,
          ));
        }
        symbol.drawingObject.updatePoints(points, width, height);
        symbol.custom.options.staticHeight = height;
        symbol.custom.options.staticWidth = width;
      }
      const t = symbol.transform._dup();
      t.updateScale(widthIn, heightIn);
      t.updateTranslation(location.x, location.y);
      symbol.setTransform(t);
    };
    this.symbol = symbol;
  }

  // eslint-disable-next-line class-methods-use-this
  getWidth() {
    return (options: Object, height: number) => {
      let width;
      if (options.draw === 'static') {
        let { staticHeight } = options;
        const { staticWidth } = options;
        if (staticHeight === 'first') {
          staticHeight = height;
        }
        ({ width } = this.getDefaultValues(staticHeight, staticWidth, options));
        return width / staticHeight * height;
      }
      ({ width } = options);
      ({ width } = this.getDefaultValues(height, width, options));
      return width;
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getHeight() {
    return (options: Object, width: number) => {
      const { height } = options;
      if (options.draw === 'static') {
        return height * width;
      }
      return height;
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    // eslint-disable-next-line no-unused-vars
    return (options: Object, width: number, height: number) => {
      // const {
      //   lineWidth, width,
      // } = options;
      const points = [
        new Point(0, 0),
        new Point(width, 0),
        new Point(width, height),
        new Point(0, height),
      ];

      return [points, width, height];
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getDefaultValues(height: number, width: ?number, options: Object) {
    const out = {
      width: height,
    };
    if (width != null) {
      out.width = width;
    }
    if (options.width != null) {
      out.width = options.width;
    }
    return out;
  }
}
