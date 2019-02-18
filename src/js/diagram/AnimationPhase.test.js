import { TransformAnimationUnit } from './AnimationPhase';
import {
  Transform,
} from '../tools/g2';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('./Gesture');
jest.mock('./webgl/webgl');
jest.mock('./DrawContext2D');


describe('Transfrom Animation Unit', () => {
  let element;
  beforeEach(() => {
    const diagram = makeDiagram();
    element = diagram.objects.line(new Transform().scale(1, 1).rotate(0).translate(0, 0));
  });
  test('Instantiation', () => {
    const onFinish = () => {};
    const finishOnCancel = false;
    const type = 'transform';
    const progression = 'easeinout';
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    const unit = new TransformAnimationUnit({
      onFinish,
      finishOnCancel,
      type,
      progression,
      transform: {
        start,
        target,
      },
    });
    console.log(unit);
  });
});
