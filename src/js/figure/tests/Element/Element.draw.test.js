import {
  Transform,
} from '../../../tools/g2';
import {
  transpose,
} from '../../../tools/m3';
// import {
//   round,
// } from '../tools/math';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

// jest.mock('../../Recorder/recorder.worker');
jest.useFakeTimers();

describe('Element Drawing', () => {
  let figure;
  let a;
  // let b;
  // let c;
  beforeEach(() => {
    figure = makeFigure();
    figure.add([
      {
        name: 'a',
        make: 'polygon',
      },
    ]);
    //   c = figure.elements._c;
    a = figure.elements._a;
    //   b = c._b;
    figure.initialize();
    figure.webglLow.gl.uniformMatrix4fv.mockClear();
  });
  test('Simple', () => {
    a.setPosition(1, 1);
    expect(figure.webglLow.gl.uniformMatrix4fv.mock.calls).toHaveLength(0);
    figure.setFirstTransform();
    figure.mock.timeStep(0);
    const expectedDrawTransform = new Transform()
      .scale(1, 1)
      .rotate(0)
      .translate(1, 1)
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0)
      .scale(1, 1)
      .translate(0, 0);
    // LastDrawTransform
    expect(a.lastDrawTransform.def).toEqual(expectedDrawTransform.def);
    // Actual transform(s) drawn (in this case just one as no copies or pulse multipliers)
    expect(a.drawTransforms[0].def).toEqual(expectedDrawTransform.def);
    // Transform matrix sent to gl
    expect(figure.webglLow.gl.uniformMatrix4fv.mock.calls).toHaveLength(1);
    expect(figure.webglLow.gl.uniformMatrix4fv.mock.calls[0][2])
      .toEqual(transpose(expectedDrawTransform.matrix()));
  });
  test('Pulse', () => {
    a.setPosition(1, 1);
    expect(figure.webglLow.gl.uniformMatrix4fv.mock.calls).toHaveLength(0);
    figure.setFirstTransform();
    a.pulse({ duaration: 1, scale: 1.5 });
    figure.mock.timeStep(0);
    figure.mock.timeStep(0.5);
    const expectedLastDrawTransform = new Transform()
      .scale(1, 1)
      .rotate(0)
      .translate(1, 1)
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0)
      .scale(1, 1)
      .translate(0, 0);
    const expectedDrawTransform = expectedLastDrawTransform.transform(
      new Transform()
        .translate(-0, -0)
        .scale(1.5, 1.5)
        .translate(0, 0),
    );

    // LastDrawTransform
    expect(a.lastDrawTransform.def).toEqual(expectedLastDrawTransform.def);
    // Actual transform(s) drawn (in this case just one as no copies or pulse multipliers)
    expect(a.drawTransforms[0].def).toEqual(expectedDrawTransform.def);
    // Transform matrix sent to gl
    expect(figure.webglLow.gl.uniformMatrix4fv.mock.calls).toHaveLength(2);
    expect(figure.webglLow.gl.uniformMatrix4fv.mock.calls[1][2])
      .toEqual(transpose(expectedDrawTransform.matrix()));
  });
  test('Copies', () => {
    const t1 = new Transform().translate(1, 1);
    const t2 = new Transform().translate(2, 2);
    a.copyTransforms = [
      t1._dup(),
      t2._dup(),
    ];
    expect(figure.webglLow.gl.uniformMatrix4fv.mock.calls).toHaveLength(0);
    figure.setFirstTransform();
    figure.mock.timeStep(0);
    const expectedLastDrawTransform = new Transform()
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0)
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0)
      .scale(1, 1)
      .translate(0, 0);
    const expectedDrawTransforms = [
      expectedLastDrawTransform.transform(t1),
      expectedLastDrawTransform.transform(t2),
    ];

    // LastDrawTransform
    expect(a.lastDrawTransform.def).toEqual(expectedLastDrawTransform.def);
    // Actual transform(s) drawn (in this case just one as no copies or pulse multipliers)
    expect(a.drawTransforms[0].def).toEqual(expectedDrawTransforms[0].def);
    expect(a.drawTransforms[1].def).toEqual(expectedDrawTransforms[1].def);
    // Transform matrix sent to gl
    expect(figure.webglLow.gl.uniformMatrix4fv.mock.calls).toHaveLength(2);
    expect(figure.webglLow.gl.uniformMatrix4fv.mock.calls[0][2])
      .toEqual(transpose(expectedDrawTransforms[0].matrix()));
    expect(figure.webglLow.gl.uniformMatrix4fv.mock.calls[1][2])
      .toEqual(transpose(expectedDrawTransforms[1].matrix()));
  });
});
