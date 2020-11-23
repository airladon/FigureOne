import {
  Transform,
} from '../tools/g2';
import {
  t,
} from '../tools/m2';
// import {
//   round,
// } from '../tools/math';
import * as tools from '../tools/tools';
import makeFigure from '../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');
jest.useFakeTimers();

describe('Element Drawing', () => {
  let figure;
  let a;
  // let b;
  // let c;
  beforeEach(() => {
    figure = makeFigure();
    figure.addElements([
      {
        name: 'a',
        method: 'polygon',
      },
    ]);
    //   c = figure.elements._c;
    a = figure.elements._a;
    //   b = c._b;
    figure.initialize();
    figure.webglLow.gl.uniformMatrix3fv.mockClear();
  });
  test('Simple', () => {
    a.setPosition(1, 1);
    expect(figure.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(0);
    figure.setFirstTransform();
    figure.mock.timeStep(0);
    const expectedDrawTransform = new Transform()
      .scale(1, 1, 'polygon')
      .rotate(0, 'polygon')
      .translate(1, 1, 'polygon')
      .scale(1, 1, 'collection')
      .rotate(0, 'collection')
      .translate(0, 0, 'collection')
      .scale(1, 1, 'Figure')
      .translate(0, 0, 'Figure');
    // LastDrawTransform
    expect(a.lastDrawTransform.order).toEqual(expectedDrawTransform.order);
    // Actual transform(s) drawn (in this case just one as no copies or pulse multipliers)
    expect(a.drawTransforms[0].order).toEqual(expectedDrawTransform.order);
    // Transform matrix sent to gl
    expect(figure.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(1);
    expect(figure.webglLow.gl.uniformMatrix3fv.mock.calls[0][2])
      .toEqual(t(expectedDrawTransform.matrix()));
  });
  test('Pulse', () => {
    a.setPosition(1, 1);
    expect(figure.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(0);
    figure.setFirstTransform();
    a.pulse({ duaration: 1, scale: 1.5 });
    figure.mock.timeStep(0);
    figure.mock.timeStep(0.5);
    const expectedLastDrawTransform = new Transform()
      .scale(1, 1, 'polygon')
      .rotate(0, 'polygon')
      .translate(1, 1, 'polygon')
      .scale(1, 1, 'collection')
      .rotate(0, 'collection')
      .translate(0, 0, 'collection')
      .scale(1, 1, 'Figure')
      .translate(0, 0, 'Figure');
    const expectedDrawTransform = expectedLastDrawTransform.transform(
      new Transform()
        .translate(-0, -0)
        .scale(1.5, 1.5)
        .translate(0, 0),
    );

    // LastDrawTransform
    expect(a.lastDrawTransform.order).toEqual(expectedLastDrawTransform.order);
    // Actual transform(s) drawn (in this case just one as no copies or pulse multipliers)
    expect(a.drawTransforms[0].order).toEqual(expectedDrawTransform.order);
    // Transform matrix sent to gl
    expect(figure.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(2);
    expect(figure.webglLow.gl.uniformMatrix3fv.mock.calls[1][2])
      .toEqual(t(expectedDrawTransform.matrix()));
  });
  test('Copies', () => {
    const t1 = new Transform().translate(1, 1);
    const t2 = new Transform().translate(2, 2);
    a.copyTransforms = [
      t1._dup(),
      t2._dup(),
    ];
    expect(figure.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(0);
    figure.setFirstTransform();
    figure.mock.timeStep(0);
    const expectedLastDrawTransform = new Transform()
      .scale(1, 1, 'polygon')
      .rotate(0, 'polygon')
      .translate(0, 0, 'polygon')
      .scale(1, 1, 'collection')
      .rotate(0, 'collection')
      .translate(0, 0, 'collection')
      .scale(1, 1, 'Figure')
      .translate(0, 0, 'Figure');
    const expectedDrawTransforms = [
      expectedLastDrawTransform.transform(t1),
      expectedLastDrawTransform.transform(t2),
    ];

    // LastDrawTransform
    expect(a.lastDrawTransform.order).toEqual(expectedLastDrawTransform.order);
    // Actual transform(s) drawn (in this case just one as no copies or pulse multipliers)
    expect(a.drawTransforms[0].order).toEqual(expectedDrawTransforms[0].order);
    expect(a.drawTransforms[1].order).toEqual(expectedDrawTransforms[1].order);
    // Transform matrix sent to gl
    expect(figure.webglLow.gl.uniformMatrix3fv.mock.calls).toHaveLength(2);
    expect(figure.webglLow.gl.uniformMatrix3fv.mock.calls[0][2])
      .toEqual(t(expectedDrawTransforms[0].matrix()));
    expect(figure.webglLow.gl.uniformMatrix3fv.mock.calls[1][2])
      .toEqual(t(expectedDrawTransforms[1].matrix()));
  });
});
