/* eslint-disable object-curly-newline, object-property-newline */
import makeFigure from '../../../__mocks__/makeFigure';
import Scene from '../../../tools/geometry/scene';
import * as m3 from '../../../tools/m3';
import { getPoint, getTransform } from '../../../tools/g2';
import { round } from '../../../tools/math';

jest.useFakeTimers();

describe('rotateControl primitive', () => {
  let figure;
  let cube;
  let rc;
  const P0 = [1, 0.6, 1.5];
  const L = getPoint([0, 0, 0]);
  const U = [0, 1, 0];
  const axis = getPoint(U);

  beforeEach(() => {
    figure = makeFigure();
    figure.scene = new Scene({
      style: 'orthographic',
      near: 0.1,
      far: 10,
      camera: { position: P0, lookAt: [0, 0, 0], up: [0, 1, 0] },
    });
    figure.elements.scene = figure.scene;
    cube = figure.add({ name: 'cube', make: 'cube', side: 0.6 });
    rc = figure.add({ name: 'rc', make: 'rotateControl', controlElement: 'cube' });
  });

  // Independent reference: cameraControl's exact per-frame camera step + the
  // object transform that reproduces that view from the fixed camera.
  const expectedMatrixForDrag = (drags) => {
    let P = getPoint(P0);
    const camMatrix0 = m3.lookAt(P0, L.toArray(), U);
    drags.forEach(([dx, dy]) => {
      const deltaAz = -dx * 5;
      let deltaEl = dy * 5;
      const tiltAxis = axis.crossProduct(P.sub(L)).normalize();
      let angleToLock = Math.abs(Math.acos(
        P.sub(L).normalize().dotProduct(L.add(axis).normalize()),
      ));
      const da = 0.001;
      if (deltaEl < 0 && angleToLock < Math.PI / 2) {
        if (deltaEl < -angleToLock + da) deltaEl = -angleToLock + da;
      }
      if (deltaEl > 0 && angleToLock > Math.PI / 2) {
        angleToLock = Math.PI - angleToLock;
        deltaEl = round(Math.min(angleToLock - da, deltaEl), 4);
      }
      const t = [['r', deltaEl, ...tiltAxis.toArray()], ['r', deltaAz, ...axis.toArray()]];
      P = P.transformBy(getTransform(t).matrix());
    });
    return m3.mul(camMatrix0, m3.inverse(m3.lookAt(P.toArray(), L.toArray(), U)));
  };

  // Drive one drag frame through the control's gesture notifications.
  const dragFrame = (dx, dy) => {
    const start = rc.getPosition();
    rc.notifications.publish('beforeMove'); // captures start, moving = true
    rc.transform.updateTranslation([start.x + dx, start.y + dy]);
    rc.notifications.publish('setTransform');
  };

  test('rotateControl resolves and registers', () => {
    expect(rc).not.toBe(null);
    expect(typeof rc.getPosition).toBe('function');
  });

  test('single drag matches cameraControl-equivalent object rotation', () => {
    dragFrame(0.05, 0.03);
    const expected = expectedMatrixForDrag([[0.05, 0.03]]);
    expect(round(cube.transform.matrix(), 6)).toEqual(round(expected, 6));
  });

  test('multi-frame diagonal drag matches', () => {
    const drags = [];
    for (let i = 0; i < 5; i += 1) { dragFrame(0.02, 0.015); drags.push([0.02, 0.015]); }
    const expected = expectedMatrixForDrag(drags);
    expect(round(cube.transform.matrix(), 6)).toEqual(round(expected, 6));
  });

  test('closed circular drag returns object to start', () => {
    const N = 32;
    for (let i = 0; i < N; i += 1) {
      dragFrame(0.01 * Math.cos((2 * Math.PI * i) / N), 0.01 * Math.sin((2 * Math.PI * i) / N));
    }
    // The cube returns ~to its start. The discrete circular stepping leaves a
    // tiny (~1e-4) residual - the same holonomy cameraControl itself has - so
    // this is an approximate return, matching cameraControl's behaviour.
    const identity = m3.identity();
    expect(round(cube.transform.matrix(), 3)).toEqual(round(identity, 3));
  });
});
