// @flow
import { DiagramElementPrimitive } from '../../../Element';
import {
  Point, Transform, Rect, polarToRect,
} from '../../../../tools/g2';
import VertexBracket from './VertexBracketNew';
import WebGLInstance from '../../../webgl/webgl';


export default class Bracket {
  symbol: DiagramElementPrimitive;

  constructor(
    webgl: Array<WebGLInstance>,
    color: Array<number>,
    transformOrLocation: Transform | Point,
    diagramLimits: Rect,
    side: 'left' | 'right' | 'top' | 'bottom',
    staticSize: ?boolean,
    symbolOptions: Object,
  ) {
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
      t.updateScale(heightIn, heightIn);
      t.updateTranslation(location.x, location.y);
      symbol.setTransform(t);
    };
    this.symbol = symbol;
  }

  // eslint-disable-next-line class-methods-use-this
  getWidth() {
    return (type: 'static' | 'dynamic', options: Object, height: number) => {
      const { width } = options;
      if (type === 'static') {
        return height * width;
      }
      return width;
    };
  }

  // This is the same math as for Brace, but the outside radius is only a
  // portion of a half circle

  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    // eslint-disable-next-line no-unused-vars
    return (options: Object, height: number) => {
      const {
        lineWidth, width, sides, tipWidth,
      } = options;
      // width of bracket without linewidth - essentially width of inner radius
      const wInnerRadius = (width - lineWidth);
      const innerRadius = (wInnerRadius ** 2 + (height / 2) ** 2) / (2 * wInnerRadius);

      // top line width is half middle line width
      const wOuterRadius = (width - tipWidth);
      const outerRadius = (wOuterRadius ** 2 + (height / 2) ** 2) / (2 * wOuterRadius);

      const angleInner = Math.asin(height / 2 / innerRadius);
      const stepAngleInner = angleInner * 2 / sides;
      const angleOuter = Math.asin(height / 2 / outerRadius);
      const stepAngleOuter = angleOuter * 2 / sides;

      const innerPoints = [];
      const outerPoints = [];

      for (let i = 0; i < sides + 1; i += 1) {
        innerPoints.push(polarToRect(
          innerRadius, angleInner - stepAngleInner * i + Math.PI,
        ).add(innerRadius + lineWidth, height / 2));
        outerPoints.push(polarToRect(
          outerRadius, angleOuter - stepAngleOuter * i + Math.PI,
        ).add(outerRadius, height / 2));
      }

      return [outerPoints, innerPoints, innerPoints[0].x, height];
    };
  }
}
