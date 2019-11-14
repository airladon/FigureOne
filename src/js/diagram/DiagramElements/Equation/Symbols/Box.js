// @flow

// import VertexBar from './VertexBar';
import { DiagramElementCollection, DiagramElement } from '../../../Element';
import DiagramPrimitives from '../../../DiagramPrimitives/DiagramPrimitives';
import {
  Point, Transform, Rect,
} from '../../../../tools/g2';
// import WebGLInstance from '../../../webgl/webgl';

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
    box.custom.setSize = (rectOrParent: Rect | DiagramElementCollection, children: ?Array<string | DiagramElement> = null) => {
      let rectToUse;
      if (rectOrParent instanceof Rect) {
        rectToUse = rectOrParent;
      } else {
        rectToUse = rectOrParent.getBoundingRect('local', children);
      }
      box.setScale(rectToUse.width, rectToUse.height);
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
    box.custom.setSize = (rectOrParent: Rect | DiagramElementCollection, children: ?Array<string | DiagramElement> = null) => {
      let rectToUse;
      if (rectOrParent instanceof Rect) {
        rectToUse = rectOrParent;
      } else {
        rectToUse = rectOrParent.getBoundingRect('local', children);
      }
      box.drawingObject.change([
        new Point(-rectToUse.width / 2, -rectToUse.height / 2),
        new Point(-rectToUse.width / 2, rectToUse.height / 2),
        new Point(rectToUse.width / 2, rectToUse.height / 2),
        new Point(rectToUse.width / 2, -rectToUse.height / 2),
      ]);
      box.setPosition(
        rectToUse.left + rectToUse.width / 2,
        rectToUse.bottom + rectToUse.height / 2,
      );
    };
  }
  return box;
  // const vertices = new VertexBar(webgl, side, numLines);
  // let transform = new Transform();
  // if (transformOrLocation instanceof Point) {
  //   transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  // } else {
  //   transform = transformOrLocation._dup();
  // }

  // return new DiagramElementPrimitive(vertices, transform, color, diagramLimits);
}
