// @flow

// import VertexPolygon from '../DrawingObjects/VertexObject/VertexPolygon';
import VertexText from '../DrawingObjects/VertexObject/VertexText';
// import VertexPolygonLine from '../DrawingObjects/VertexObject/VertexPolygonLine';
import { DiagramElementPrimative } from '../Element';
import {
  Point, Transform, Rect,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';
import { joinObjects } from '../../tools/tools';

type TypeTextInputOptions = {
  text: ?string;
  size: ?number;
  family: ?string;
  weight: ?number;
  style: ?'normal' | 'italic',
  alignH: ?'left' | 'center' | 'right',
  alignV: ?'top' | 'bottom' | 'middle' | 'alphabetic',
  color: ?Array<number>,
  transform: ?Transform,
  position: ?Point,
};

function Text(
  webgl: WebGLInstance,
  diagramLimits: Rect,
  diagramToPixelSpaceScale: Point,
  diagramToGLSpaceTransformMatrix: Array<number>,
  optionsIn: TypeTextInputOptions,
) {
  const defaultOptions = {
    position: new Point(0, 0),
    color: [1, 0, 0, 1],
  };
  const options = joinObjects({}, defaultOptions, optionsIn);

  if (options.transform == null) {
    options.transform = new Transform('Text').translate(0, 0);
  }

  if (options.position != null) {
    options.transform.updateTranslation(options.position);
  }

  const vertexText = new VertexText(
    webgl,
    diagramToPixelSpaceScale,
    diagramToGLSpaceTransformMatrix,
    options,
  );
  // let transform = new Transform();
  // if (transformOrLocation instanceof Point) {
  //   transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  // } else {
  //   transform = transformOrLocation._dup();
  // }
  return new DiagramElementPrimative(vertexText, options.transform, options.color, diagramLimits);
}

export default Text;
