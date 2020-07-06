import {
  Point, Transform,
} from '../tools/g2';
import {
  t,
} from '../tools/m2';
import {
  round,
} from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');
jest.useFakeTimers();

describe('Element Drawing', () => {
  let diagram;
  let a
  let b;
  let c;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
    {
      name: 'a',
      method: 'polygon',
    }
    ]);
  //   c = diagram.elements._c;
    a = diagram.elements._a;
  //   b = c._b;
    diagram.initialize();
    diagram.webglLow.gl.uniformMatrix3fv.mockClear();
  });
  test('Simple', () => {
    a.setPosition(1, 1);
    expect(diagram.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(0);
    diagram.setFirstTransform();
    diagram.mock.timeStep(0);
    const expectedDrawTransform = new Transform()
      .scale(1, 1, 'polygon')
      .rotate(0, 'polygon')
      .translate(1, 1, 'polygon')
      .scale(1, 1, 'collection')
      .rotate(0, 'collection')
      .translate(0, 0, 'collection')
      .scale(1, 1, 'Diagram')
      .translate(0, 0, 'Diagram');
    // LastDrawTransform
    expect(a.lastDrawTransform.order).toEqual(expectedDrawTransform.order);
    // Actual transform(s) drawn (in this case just one as no copies or pulse multipliers)
    expect(a.drawTransforms[0].order).toEqual(expectedDrawTransform.order);
    // Transform matrix sent to gl
    expect(diagram.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(1);
    expect(diagram.webglLow.gl.uniformMatrix3fv.mock.calls[0][2])
      .toEqual(t(expectedDrawTransform.matrix()))
  });
  test('Pulse', () => {
    a.setPosition(1, 1);
    expect(diagram.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(0);
    diagram.setFirstTransform();
    a.pulseScaleNow(1, 1.5);
    diagram.mock.timeStep(0);
    diagram.mock.timeStep(0.5);
    const expectedLastDrawTransform = new Transform()
      .scale(1, 1, 'polygon')
      .rotate(0, 'polygon')
      .translate(1, 1, 'polygon')
      .scale(1, 1, 'collection')
      .rotate(0, 'collection')
      .translate(0, 0, 'collection')
      .scale(1, 1, 'Diagram')
      .translate(0, 0, 'Diagram');
    const expectedDrawTransform = expectedLastDrawTransform.transform(
      new Transform().scale(1.5, 1.5)
    );
    
    // LastDrawTransform
    expect(a.lastDrawTransform.order).toEqual(expectedLastDrawTransform.order);
    // Actual transform(s) drawn (in this case just one as no copies or pulse multipliers)
    expect(a.drawTransforms[0].order).toEqual(expectedDrawTransform.order);
    // Transform matrix sent to gl
    expect(diagram.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(2);
    expect(diagram.webglLow.gl.uniformMatrix3fv.mock.calls[1][2])
      .toEqual(t(expectedDrawTransform.matrix()))
  });
  test('Copies', () => {
    const t1 = new Transform().translate(1, 1);
    const t2 = new Transform().translate(2, 2);
    a.copyTransforms = [
      t1._dup(),
      t2._dup(),
    ];
    expect(diagram.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(0);
    diagram.setFirstTransform();
    diagram.mock.timeStep(0);
    const expectedLastDrawTransform = new Transform()
      .scale(1, 1, 'polygon')
      .rotate(0, 'polygon')
      .translate(0, 0, 'polygon')
      .scale(1, 1, 'collection')
      .rotate(0, 'collection')
      .translate(0, 0, 'collection')
      .scale(1, 1, 'Diagram')
      .translate(0, 0, 'Diagram');
    const expectedDrawTransforms = [
      expectedLastDrawTransform.transform(t1),
      expectedLastDrawTransform.transform(t2),
    ]
    
    // LastDrawTransform
    expect(a.lastDrawTransform.order).toEqual(expectedLastDrawTransform.order);
    // Actual transform(s) drawn (in this case just one as no copies or pulse multipliers)
    expect(a.drawTransforms[0].order).toEqual(expectedDrawTransforms[0].order);
    expect(a.drawTransforms[1].order).toEqual(expectedDrawTransforms[1].order);
    // Transform matrix sent to gl
    expect(diagram.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(2);
    expect(diagram.webglLow.gl.uniformMatrix3fv.mock.calls[0][2])
      .toEqual(t(expectedDrawTransforms[0].matrix()))
      expect(diagram.webglLow.gl.uniformMatrix3fv.mock.calls[1][2])
      .toEqual(t(expectedDrawTransforms[1].matrix()))
  });
});
