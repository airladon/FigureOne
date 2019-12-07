// @flow

// import VertexSquareBracket from './VertexSquareBracket';
import { DiagramElementPrimitive } from '../../../Element';
import DiagramPrimitives from '../../../DiagramPrimitives/DiagramPrimitives';
import {
  Point, Transform,
} from '../../../../tools/g2';
// import WebGLInstance from '../../../webgl/webgl';

function updatePoints(
  symbol: {
    _line: DiagramElementPrimitive,
    _end1: DiagramElementPrimitive,
    _end2: DiagramElementPrimitive,
  },
  side: 'top' | 'bottom' | 'left' | 'right',
  height: number,
  lineWidth: number,
  endLength: number,
) {
  const line = [
    new Point(0, 0),
    new Point(lineWidth, 0),
    new Point(lineWidth, height),
    new Point(0, height),
  ];
  const end1 = [
    new Point(lineWidth, height),
    new Point(lineWidth + endLength, height),
    new Point(lineWidth + endLength, height - lineWidth),
    new Point(lineWidth, height - lineWidth),
  ];
  const end2 = [
    new Point(lineWidth, 0),
    new Point(lineWidth + endLength, 0),
    new Point(lineWidth + endLength, lineWidth),
    new Point(lineWidth, lineWidth),
  ];
  // console.log(height, lineWidth, endLength)
  // console.log(line, end1, end2)
  const maxX = lineWidth + endLength;
  let t;
  if (side === 'right') {
    t = new Transform().scale(-1, 1).translate(maxX, 0);
  } else if (side === 'top') {
    t = new Transform()
      .translate(0, -height / 2)
      .rotate(-Math.PI / 2)
      .translate(height / 2, maxX);
  } else if (side === 'bottom') {
    t = new Transform()
      .translate(0, -height / 2)
      .rotate(Math.PI / 2)
      .translate(height / 2, -maxX);
  } else {
    t = new Transform();
  }
  const tLine = line.map(p => p.transformBy(t.m()));
  const tEnd1 = end1.map(p => p.transformBy(t.m()));
  const tEnd2 = end2.map(p => p.transformBy(t.m())); // $FlowFixMe
  symbol._line.drawingObject.changeVertices(tLine);  // $FlowFixMe
  symbol._end1.drawingObject.changeVertices(tEnd1);  // $FlowFixMe
  symbol._end2.drawingObject.changeVertices(tEnd2);
}

const fan = (color: Array<number>) => ({
  points: [new Point(0, 0), new Point(0, 1), new Point(1, 1), new Point(1, 0)],
  color,
});

export default function SquareBracket(
  shapes: DiagramPrimitives,
  color: Array<number>,
  side: 'left' | 'right' | 'top' | 'bottom',
  lineWidth: number,
  endLength: number,
  staticSize: ?number,
) {
  const symbol = shapes.collection({ color, transform: new Transform('squareBracket').scale(1, 1).translate(0, 0) });
  symbol.add('line', shapes.fan(fan(color)));
  symbol.add('end1', shapes.fan(fan(color)));
  symbol.add('end2', shapes.fan(fan(color)));
  updatePoints(symbol, side, 1, lineWidth, endLength);
  symbol.custom.lineWidth = lineWidth;
  symbol.custom.endLength = endLength;
  symbol.custom.width = lineWidth + endLength;

  if (staticSize != null) {
    symbol.custom.type = 'static';
    updatePoints(symbol, side, staticSize, lineWidth, endLength);
  } else {
    symbol.custom.scale = new Point(1, 1);
    symbol.internalSetTransformCallback = () => {
      const s = symbol.getScale();
      if (symbol.custom.scale.isNotEqualTo(s, 8)) {
        updatePoints(
          symbol,
          side,
          s.y,
          symbol.custom.lineWidth,
          symbol.custom.endLength,
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
  symbol.custom.setSize = (location: Point, height: number) => {
    const t = symbol.transform._dup();
    t.updateScale(
      height,
      height,
    );
    t.updateTranslation(
      location.x,
      location.y,
    );
    symbol.setTransform(t);
  };
  return symbol;
}
