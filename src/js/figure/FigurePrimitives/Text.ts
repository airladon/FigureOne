import VertexText from '../DrawingObjects/VertexObject/VertexText';
import { FigureElementPrimitive } from '../Element';
import {
  Point, Transform,
} from '../../tools/g2';
import WebGLInstance from '../webgl/webgl';
import { joinObjects } from '../../tools/tools';

type TypeTextInputOptions = {
  text: string | null | undefined;
  size: number | null | undefined;
  family: string | null | undefined;
  weight: number | null | undefined;
  style: 'normal' | 'italic' | null | undefined,
  xAlign: 'left' | 'center' | 'right' | null | undefined,
  yAlign: 'top' | 'bottom' | 'middle' | 'baseline' | null | undefined,
  color: Array<number> | null | undefined,
  transform: Transform | null | undefined,
  position: Point | null | undefined,
};

function Text(
  webgl: WebGLInstance,
  optionsIn: TypeTextInputOptions,
) {
  const defaultOptions = {
    position: new Point(0, 0),
    color: [1, 0, 0, 1],
  };
  const options = joinObjects<any>({}, defaultOptions, optionsIn);

  if (options.transform == null) {
    options.transform = new Transform().translate(0, 0);
  }

  if (options.position != null) {
    options.transform.updateTranslation(options.position);
  }

  const vertexText = new VertexText(
    webgl,
    options,
  );
  // let transform = new Transform();
  // if (transformOrLocation instanceof Point) {
  //   transform = transform.translate(transformOrLocation.x, transformOrLocation.y);
  // } else {
  //   transform = transformOrLocation._dup();
  // }
  return new FigureElementPrimitive(vertexText, options.transform, options.color);
}

export default Text;
