// @flow

import { DiagramElementCollection, DiagramElement, DiagramElementPrimitive } from '../../../Element';
import DiagramPrimitives from '../../../DiagramPrimitives/DiagramPrimitives';
import {
  Point, Transform, Rect, getPoint,
} from '../../../../tools/g2';

function getRectAndSpace(
  rectOrParent: Rect | DiagramElementCollection,
  childrenOrSpace: ?(Array<string | DiagramElement> | ?([number, number] | Point | number)) = null,
  space: ?([number, number] | Point | number) = null,
) {
  let rectToUse;
  let childrenToUse = null;
  let spaceToUse = new Point(0, 0);
  if (Array.isArray(childrenOrSpace)) {
    if (childrenOrSpace.length > 1) {
      if (typeof childrenOrSpace[0] === 'string' || childrenOrSpace[0] instanceof DiagramElement) {
        childrenToUse = childrenOrSpace;
      } else {  // $FlowFixMe
        spaceToUse = getPoint(childrenOrSpace);
      }
    }
  } if (typeof childrenOrSpace === 'number') {
    spaceToUse = getPoint(childrenOrSpace);
  }

  if (space != null) {
    spaceToUse = getPoint(space);
  }

  if (rectOrParent instanceof Rect) {
    rectToUse = rectOrParent;
  } else {  // $FlowFixMe
    rectToUse = rectOrParent.getBoundingRect('local', childrenToUse);
  }
  return [rectToUse, spaceToUse];
}

function updateStaticLinePoints(
  box: {
    _left: DiagramElementPrimitive,
    _top: DiagramElementPrimitive,
    _right: DiagramElementPrimitive,
    _bottom: DiagramElementPrimitive,
  },
  width: number,
  sizeIn: Point | [number, number],
) {
  const size = getPoint(sizeIn);
  const { x, y } = size;
  const xWidth = width / y / 2;
  const yWidth = width / x / 2;
  const points = [
    new Point(-0.5 - yWidth, -0.5 - xWidth),
    new Point(-0.5 + yWidth, -0.5 + xWidth),
    new Point(-0.5 - yWidth, 0.5 + xWidth),
    new Point(-0.5 + yWidth, 0.5 - xWidth),
    new Point(0.5 + yWidth, 0.5 + xWidth),
    new Point(0.5 - yWidth, 0.5 - xWidth),
    new Point(0.5 + yWidth, -0.5 - xWidth),
    new Point(0.5 - yWidth, -0.5 + xWidth),
  ];
  const getPoints = indexes => indexes.map(index => points[index]._dup());
  const left = box._left;
  const right = box._right;
  const top = box._top;
  const bottom = box._bottom;
  if (left == null || right == null || top == null || bottom == null) {
    return;
  }
  // $FlowFixMe
  left.drawingObject.changeVertices(getPoints([0, 1, 2, 1, 3, 2]));
  // $FlowFixMe
  top.drawingObject.changeVertices(getPoints([2, 3, 4, 3, 5, 4]));
  // $FlowFixMe
  right.drawingObject.changeVertices(getPoints([4, 5, 6, 5, 7, 6]));
  // $FlowFixMe
  bottom.drawingObject.changeVertices(getPoints([6, 7, 0, 7, 1, 0]));
}

export default function Box(
  shapes: DiagramPrimitives,
  color: Array<number>,
  fill: boolean,
  width: number,
  staticSize: ?(Point | [number, number]),
) {
  let box;
  // Defined once, just scaled
  if (fill) {
    box = shapes.rectangle({
      color,
      transform: new Transform('box').scale(1, 1).translate(0, 0),
    });
    box.custom.boxType = 'fill';
  // Defined every time a setSize event is called
  } else if (staticSize != null) {
    const poly = (p1, p2, w) => shapes.polyLine({
      points: [p1, p2],
      color,
      width: w,
      close: false,
    });
    box = shapes.collection({ color, transform: new Transform('box').scale(1, 1).translate(0, 0) });
    const points = [
      new Point(-0.5, -0.5), new Point(-0.5, 0.5),
      new Point(0.5, 0.5), new Point(0.5, -0.5),
    ];
    box.add('left', poly(points[0], points[1], 0.1));
    box.add('top', poly(points[0], points[1], 0.1));
    box.add('right', poly(points[0], points[1], 0.1));
    box.add('bottom', poly(points[0], points[1], 0.1));
    updateStaticLinePoints(box, width, staticSize);
    box.custom.boxType = 'line';
    box.custom.lineWidth = width;
  // defined everytime a setTransform event is called
  } else {
    box = shapes.polyLine({
      points: [
        new Point(-0.5, -0.5), new Point(-0.5, 0.5),
        new Point(0.5, 0.5), new Point(0.5, -0.5),
      ],
      color,
      width,
      close: true,
      transform: new Transform('box').scale(1, 1).translate(0, 0),
    });
    box.custom.scale = new Point(1, 1);
    box.custom.lineWidth = width;
    box.internalSetTransformCallback = () => {
      const s = box.getScale();
      if (box.custom.scale.isNotEqualTo(s, 8)) {
        box.drawingObject.change([
          new Point(-s.x / 2, -s.y / 2),
          new Point(-s.x / 2, s.y / 2),
          new Point(s.x / 2, s.y / 2),
          new Point(s.x / 2, -s.y / 2),
        ]);
        box.custom.scale = s;
      }
    };
    box.getTransform = () => {
      const t = box.transform._dup();
      t.updateScale(1, 1);
      return t;
    };
    box.custom.boxType = 'dynamic';
  }

  // eslint-disable-next-line max-len
  box.custom.setSize = (rectOrParent: Rect | DiagramElementCollection, childrenOrSpace: ?(Array<string | DiagramElement> | ?([number, number] | Point | number)) = null, space: ?([number, number] | Point | number) = null) => {
    const [rectToUse, spaceToUse] = getRectAndSpace(
      rectOrParent, childrenOrSpace, space,
    );
    if (box.custom.boxType === 'line') {
      updateStaticLinePoints(box, width, new Point(rectToUse.width, rectToUse.height));
    }
    const t = box.transform._dup();

    t.updateScale(
      rectToUse.width + spaceToUse.x * 2 + width,
      rectToUse.height + spaceToUse.y * 2 + width,
    );
    t.updateTranslation(
      rectToUse.left + rectToUse.width / 2,
      rectToUse.bottom + rectToUse.height / 2,
    );
    box.setTransform(t);
  };
  return box;
}
