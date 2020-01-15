// @flow

import VertexBox from '../DrawingObjects/VertexObject/VertexBox';
import { DiagramElementPrimitive } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';

export default function Box(
  webgl: Array<WebGLInstance>,
  width: number,
  height: number,
  lineWidth: number,
  fill: boolean,
  color: Array<number>,
  transformOrLocation: Transform | Point,
  diagramLimits: Rect,
) {
  const vertexRectangle = new VertexBox(
    webgl,
    width,
    height,
    lineWidth,
    fill,
  );
  let transform = new Transform();
  if (transformOrLocation instanceof Point) {
    transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  } else {
    transform = transformOrLocation._dup();
  }
  const element = new DiagramElementPrimitive(vertexRectangle, transform, color, diagramLimits);

  element.surround = (parent, children, space = 0, drawingSpace = 'diagram') => {
    let elements = [parent];
    if (children != null && children !== '') {
      elements = parent.getElements(children);
    }
    if (elements.length === 0) {
      return;
    }
    const maxBounds = elements[0].getBoundingRect(drawingSpace);
    for (let i = 1; i < elements.length; i += 1) {
      const bounds = elements[i].getBoundingRect(drawingSpace);
      if (bounds.left < maxBounds.left) {
        maxBounds.left = bounds.left;
      }
      if (bounds.bottom < maxBounds.bottom) {
        maxBounds.bottom = bounds.bottom;
      }
      if (bounds.right - maxBounds.left > maxBounds.width) {
        maxBounds.width = bounds.right - maxBounds.left;
      }
      if (bounds.top - maxBounds.bottom > maxBounds.height) {
        maxBounds.height = bounds.top - maxBounds.bottom;
      }
    }
    maxBounds.left -= space;
    maxBounds.bottom -= space;
    maxBounds.height += 2 * space;
    maxBounds.width += 2 * space;
    maxBounds.right = maxBounds.left + maxBounds.width;
    maxBounds.top = maxBounds.bottom + maxBounds.height;

    element.drawingObject.updateBox(
      maxBounds.width,
      maxBounds.height,
    );
    element.setPosition(
      maxBounds.left + maxBounds.width / 2,
      maxBounds.bottom + maxBounds.height / 2,
    );
  };
  return element;
}
