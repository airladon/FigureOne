// @flow
import { DiagramElementPrimitive } from '../../../Element';
import {
  Point, Transform, Rect,
} from '../../../../tools/g2';
import VertexBracket from './VertexBracketNew';
import WebGLInstance from '../../../webgl/webgl';


export default class Bracket {
  symbol: DiagramElementPrimitive;
  // options: Object;

  constructor(
    webgl: Array<WebGLInstance>,
    color: Array<number>,
    transformOrLocation: Transform | Point,
    diagramLimits: Rect,
    side: 'left' | 'right' | 'top' | 'bottom',
    // lineWidth: number,
    // endLength: number,
    staticSize: ?boolean,
    symbolOptions: Object,
  ) {
    // this.options = symbolOptions;
    const getPoints = this.getPoints();
    const getWidth = this.getWidth();
    const vertexObject = new VertexBracket(webgl, side);
    const [leftPoints, rightPoints, width, height] = getPoints(symbolOptions, 1);
    vertexObject.updatePoints(leftPoints, rightPoints, width, height);
    let initialT;
    if (transformOrLocation instanceof Transform) {
      initialT = transformOrLocation;
    } else {
      initialT = new Transform('Bracket').scale(1, 1).translate(0, 0);
    }
    const symbol = new DiagramElementPrimitive(
      vertexObject, initialT, color, diagramLimits,
    );
    symbol.custom.options = symbolOptions;
    symbol.custom.getWidth = getWidth;

    if (staticSize) {
      symbol.custom.type = 'static';
    } else {
      symbol.custom.scale = new Point(1, 1);
      symbol.internalSetTransformCallback = () => {
        const s = symbol.getScale();
        if (symbol.custom.scale.isNotEqualTo(s, 8)) {
          const [
            leftPointsNew, rightPointsNew, widthNew, heightNew,
          ] = getPoints(symbol.custom.options, s.y);
          symbol.drawingObject.updatePoints(
            leftPointsNew,
            rightPointsNew,
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
      symbol.custom.type = 'dynamic';
    }

    // eslint-disable-next-line max-len
    symbol.custom.setSize = (location: Point, heightIn: number) => {
      const t = symbol.transform._dup();
      t.updateScale(
        heightIn,
        heightIn,
      );
      t.updateTranslation(
        location.x,
        location.y,
      );
      symbol.setTransform(t);
    };
    this.symbol = symbol;
  }

  // eslint-disable-next-line class-methods-use-this
  getWidth() {
    return (type: 'static' | 'dynamic', options: Object, height: number) => {
      const { lineWidth, endLength } = options;
      if (type === 'static') {
        return height * (lineWidth + endLength);
      }
      return lineWidth + endLength;
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    return (options: Object, height: number) => {
      const { lineWidth, endLength } = options;
      const leftPoints = [
        new Point(lineWidth + endLength, 0),
        new Point(0, 0),
        new Point(0, height),
        new Point(lineWidth + endLength, height),
      ];
      const rightPoints = [
        new Point(lineWidth + endLength, lineWidth),
        new Point(lineWidth, lineWidth),
        new Point(lineWidth, height - lineWidth),
        new Point(lineWidth + endLength, height - lineWidth),
      ];
      return [leftPoints, rightPoints, lineWidth + endLength, height];
    };
  }
}
