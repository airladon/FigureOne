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
    // eslint-disable-next-line max-len
    // box.custom.setSize = (rectOrParent: Rect | DiagramElementCollection, childrenOrSpace: ?Array<string | DiagramElement> = null, space: ?number = null) => {
    //   const [rectToUse, spaceToUse] = getRectAndSpace(
    //     rectOrParent, childrenOrSpace, space,
    //   );
    //   box.setScale(rectToUse.width + spaceToUse * 2, rectToUse.height + spaceToUse * 2);
    //   box.setPosition(
    //     rectToUse.left + rectToUse.width / 2,
    //     rectToUse.bottom + rectToUse.height / 2,
    //   );
    // };
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
    box.custom.lineWidth = width;
    box.custom.scale = (x, y) => {
      box.drawingObject.change([
        new Point(-x / 2, -y / 2),
        new Point(-x / 2, y / 2),
        new Point(x / 2, y / 2),
        new Point(x / 2, -y / 2),
      ]);
    };
    box.setTransform = (transform: Transform) => {
      box.transform = transform._dup().clip(
        box.move.minTransform,
        box.move.maxTransform,
        box.move.limitLine,
      );
      const s = box.getScale();
      // if (s.x !== 1 || s.y !== 1) {
      box.custom.scale(s.x, s.y);
      // box.setScale(1, 1);
      // }
      if (box.setTransformCallback) {
        box.setTransformCallback();
      }
    };
    box.getTransform = () => {
      const t = box.transform._dup();
      t.updateScale(1, 1);
      return t;
    };
    // eslint-disable-next-line max-len
    // box.custom.setSize = (rectOrParent: Rect | DiagramElementCollection, childrenOrSpace: ?Array<string | DiagramElement> = null, space: ?number = null) => {
    //   const [rectToUse, spaceToUse] = getRectAndSpace(
    //     rectOrParent, childrenOrSpace, space,
    //   );

    //   box.setScale(rectToUse.width + spaceToUse * 2, rectToUse.height + spaceToUse * 2);
    //   // box.drawingObject.change([
    //   //   new Point(-rectToUse.width / 2 - spaceToUse, -rectToUse.height / 2 - spaceToUse),
    //   //   new Point(-rectToUse.width / 2 - spaceToUse, rectToUse.height / 2 + spaceToUse),
    //   //   new Point(rectToUse.width / 2 + spaceToUse, rectToUse.height / 2 + spaceToUse),
    //   //   new Point(rectToUse.width / 2 + spaceToUse, -rectToUse.height / 2 - spaceToUse),
    //   // ]);


    //   box.setPosition(
    //     rectToUse.left + rectToUse.width / 2,
    //     rectToUse.bottom + rectToUse.height / 2,
    //   );
    // };
  }
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
