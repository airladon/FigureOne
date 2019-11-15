// @flow

// import VertexBar from './VertexBar';
import { DiagramElementCollection, DiagramElement } from '../../../Element';
import DiagramPrimitives from '../../../DiagramPrimitives/DiagramPrimitives';
import {
  Point, Transform, Rect,
} from '../../../../tools/g2';
// import WebGLInstance from '../../../webgl/webgl';

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

export default function Box(
  shapes: DiagramPrimitives,
  color: Array<number>,
  fill: boolean,
  width: number,
  // transformOrLocation: Transform | Point,
  // diagramLimits: Rect,
) {
  let box;
  if (fill) {
    box = shapes.rectangle({
      color,
      transform: new Transform('box').scale(1, 1).translate(0, 0),
    });
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

    box.internalSetTransformCallback = () => {
      const s = box.getScale();
      // box.custom.scale(s.x, s.y);
      box.drawingObject.change([
        new Point(-s.x / 2, -s.y / 2),
        new Point(-s.x / 2, s.y / 2),
        new Point(s.x / 2, s.y / 2),
        new Point(s.x / 2, -s.y / 2),
      ]);
    };
    box.getTransform = () => {
      const t = box.transform._dup();
      t.updateScale(1, 1);
      return t;
    };
  }

  // eslint-disable-next-line max-len
  box.custom.setSize = (rectOrParent: Rect | DiagramElementCollection, childrenOrSpace: ?Array<string | DiagramElement> = null, space: ?number = null) => {
    const [rectToUse, spaceToUse] = getRectAndSpace(
      rectOrParent, childrenOrSpace, space,
    );
    box.setScale(rectToUse.width + spaceToUse * 2, rectToUse.height + spaceToUse * 2);
    box.setPosition(
      rectToUse.left + rectToUse.width / 2,
      rectToUse.bottom + rectToUse.height / 2,
    );
  };
  return box;
}
