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

export default function Root(
  shapes: DiagramPrimitives,
  color: Array<number>,
  width: number,
) {
  const element = this.shapes.collection({ color });
  const horizontalLine = this.shapes.rectangle({ color });
  const verticalLine = this.shapes.rectangle({ color });
  element.add('v', verticalLine);
  element.add('h', horizontalLine);

  element.custom.resize = (rect: Rect) {
    
  }

  if (fill) {
    box = shapes.rectangle({
      color,
      transform: new Transform('box').scale(1, 1).translate(0, 0),
    });
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
    // eslint-disable-next-line max-len
    box.custom.setSize = (rectOrParent: Rect | DiagramElementCollection, childrenOrSpace: ?Array<string | DiagramElement> = null, space: ?number = null) => {
      const [rectToUse, spaceToUse] = getRectAndSpace(
        rectOrParent, childrenOrSpace, space,
      );
      box.drawingObject.change([
        new Point(-rectToUse.width / 2 - spaceToUse, -rectToUse.height / 2 - spaceToUse),
        new Point(-rectToUse.width / 2 - spaceToUse, rectToUse.height / 2 + spaceToUse),
        new Point(rectToUse.width / 2 + spaceToUse, rectToUse.height / 2 + spaceToUse),
        new Point(rectToUse.width / 2 + spaceToUse, -rectToUse.height / 2 - spaceToUse),
      ]);
      box.setPosition(
        rectToUse.left + rectToUse.width / 2,
        rectToUse.bottom + rectToUse.height / 2,
      );
    };
  }
  return box;
}
