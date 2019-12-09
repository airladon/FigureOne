// @flow
import { DiagramElementPrimitive } from '../../../Element';
import {
  Point, Transform,
} from '../../../../tools/g2';
import VertexBracket from './VertexBracketNew';
import WebGLInstance from '../../../webgl/webgl';


function getPoints(
  height: number,
  lineWidth: number,
  endLength: number,
) {
  const leftPoints = [
    new Point(lineWidth + endLength, 0),
    new Point(0, 0),
    new Point(0, height),
    new Point(lineWidth + endLength, height),
  ];
  const rightPoints = [
    new Point(lineWidth + endLength, lineWidth),
    new Point(0, lineWidth),
    new Point(0, height - lineWidth),
    new Point(lineWidth + endLength, height - lineWidth),
  ];
  return [leftPoints, rightPoints, lineWidth + endLength, height];
}

export default function Bracket(
  webgl: Array<WebGLInstance>,
  color: Array<number>,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
  side: 'left' | 'right' | 'top' | 'bottom',
  lineWidth: number,
  endLength: number,
  staticSize: ?boolean,
) {
  const vertexObject = new VertexBracket(webgl, side);
  const [leftPoints, rightPoints, width, height] = getPoints(1, lineWidth, endLength);
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
  symbol.custom.lineWidth = lineWidth;
  symbol.custom.endLength = endLength;

  if (staticSize) {
    symbol.custom.type = 'static';
    symbol.custom.getWidth = heightIn => heightIn * (lineWidth + endLength);
  } else {
    symbol.custom.getWidth = () => lineWidth + endLength;
    symbol.custom.scale = new Point(1, 1);
    symbol.internalSetTransformCallback = () => {
      const s = symbol.getScale();
      if (symbol.custom.scale.isNotEqualTo(s, 8)) {
        const [
          leftPointsNew, rightPointsNew, widthNew, heightNew,
        ] = getPoints(s.y, symbol.custom.lineWidth, symbol.custom.endLength);
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
  return symbol;
}
