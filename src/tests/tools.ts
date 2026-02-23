/* eslint-disable import/prefer-default-export */
import { round } from '../js/tools/math';

const simpleElement = (element) => {
  const out = {};
  const roundArray = b => b.map(bb => [round(bb.x, 3), round(bb.y, 3)]);
  const roundBorder = b => b.map(bb => roundArray(bb));
  out.border = roundBorder(element.getBorder('figure', 'border'));
  out.touchBorder = roundBorder(element.getBorder('figure', 'touchBorder'));
  if (element.elements != null) {
    out.elements = {};
    element.drawOrder.forEach((name) => {
      out.elements[name] = simpleElement(element.elements[name]);
    });
  }
  if (element.drawingObject != null && element.drawingObject.points != null) {
    out.points = round(element.drawingObject.points, 3);
  }
  return out;
};

export {
  simpleElement,
};
