import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
// import * as math from '../../../../tools/math';
import { Point } from '../../../../tools/g2';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Scale Animation Step', () => {
  let elem1;
  let diagram;
  beforeEach(() => {
    diagram = makeDiagram();
    elem1 = diagram.objects.line();
    diagram.elements.add('elem1', elem1);
    elem1.setScale(1, 1);
  });
  test('Simple scale', () => {
    elem1.animations.new()
      .pulse({ scale: 2, duration: 1 })
      .start();
    diagram.draw(0);
    expect(elem1.getScale().round()).toEqual(new Point(1, 1));
    diagram.draw(0.5);
    expect(elem1.lastDrawTransform.s()).toEqual(new Point(2, 2));
    diagram.draw(0.75);
    expect(elem1.lastDrawTransform.s().round(3)).toEqual(new Point(1.707, 1.707));
  });
});
