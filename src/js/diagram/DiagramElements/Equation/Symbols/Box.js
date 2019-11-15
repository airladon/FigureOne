// @flow

import { DiagramElementCollection, DiagramElement, DiagramElementPrimitive } from '../../../Element';
import DiagramPrimitives from '../../../DiagramPrimitives/DiagramPrimitives';
import {
  Point, Transform, Rect, getPoint,
} from '../../../../tools/g2';

function getRectAndSpace(
  rectOrParent: Rect | DiagramElementCollection,
  childrenOrSpace: ?Array<string | DiagramElement> = null,
  space: ?number = null,
) {
  let rectToUse;
  let spaceToUse = 0;
  if (rectOrParent instanceof Rect) {
    rectToUse = rectOrParent;
    if (typeof childrenOrSpace === 'number') {
      spaceToUse = childrenOrSpace;
    }
  } else if (typeof childrenOrSpace === 'number') {
    spaceToUse = childrenOrSpace;
    rectToUse = rectOrParent.getBoundingRect('local');
  } else {
    rectToUse = rectOrParent.getBoundingRect('local', childrenOrSpace);
    if (typeof space === 'number') {
      spaceToUse = space;
    }
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
  left.drawingObject.changeVertices(getPoints([0, 1, 2, 1, 3, 2]));
  top.drawingObject.changeVertices(getPoints([2, 3, 4, 3, 5, 4]));
  right.drawingObject.changeVertices(getPoints([4, 5, 6, 5, 7, 6]));
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
  box.custom.setSize = (rectOrParent: Rect | DiagramElementCollection, childrenOrSpace: ?Array<string | DiagramElement> = null, space: ?number = null) => {
    const [rectToUse, spaceToUse] = getRectAndSpace(
      rectOrParent, childrenOrSpace, space,
    );
    if (box.custom.boxType === 'line') {
      updateStaticLinePoints(box, width, new Point(rectToUse.width, rectToUse.height));
    }
    const t = box.transform._dup();
    t.updateScale(
      rectToUse.width + spaceToUse * 2,
      rectToUse.height + spaceToUse * 2,
    );
    t.updateTranslation(
      rectToUse.left + rectToUse.width / 2,
      rectToUse.bottom + rectToUse.height / 2,
    );
    box.setTransform(t);
  };
  return box;
}
