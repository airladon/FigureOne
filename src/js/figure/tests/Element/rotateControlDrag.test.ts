/* eslint-disable object-curly-newline, object-property-newline */
import makeFigure from '../../../__mocks__/makeFigure';
import Scene from '../../../tools/geometry/scene';
import * as m3 from '../../../tools/m3';
import { getPoint } from '../../../tools/g2';
import { round } from '../../../tools/math';

jest.useFakeTimers();

// Measure per-frame rotation magnitude of a tracked cube vertex during a steady
// drag. A "jump" would show as a per-step angle far larger than its neighbours.
describe('rotateControl drag smoothness', () => {
  let figure;
  let cube;

  beforeEach(() => {
    figure = makeFigure();
    figure.scene = new Scene({
      style: 'orthographic',
      near: 0.1,
      far: 10,
      camera: { position: [1, 0.6, 1.5], lookAt: [0, 0, 0], up: [0, 1, 0] },
    });
    figure.elements.scene = figure.scene;
    cube = figure.add({ name: 'cube', make: 'cube', side: 0.6 });
    figure.add({ name: 'rc', make: 'rotateControl', controlElement: 'cube' });
  });

  const trackedAngles = (path) => {
    const ref = getPoint([0.3, 0.2, 0.1]);
    figure.mock.touchElement('rc', path[0]);
    let prev = ref.transformBy(cube.transform.matrix());
    const steps = [];
    for (let i = 1; i < path.length; i += 1) {
      figure.mock.touchMove(path[i]);
      const cur = ref.transformBy(cube.transform.matrix());
      const cosA = Math.max(-1, Math.min(1,
        prev.dotProduct(cur) / (prev.distance() * cur.distance())));
      steps.push(Math.acos(cosA));
      prev = cur;
    }
    figure.mock.touchUp();
    return steps;
  };

  test('uniform horizontal drag gives uniform per-frame rotation', () => {
    const path = [];
    for (let i = 0; i <= 20; i += 1) path.push([-0.5 + i * 0.05, 0]);
    const steps = trackedAngles(path);
    const max = Math.max(...steps);
    const min = Math.min(...steps.filter(s => s > 1e-6));
    // no step should be wildly larger than the others (a jump)
    expect(round(max / min, 2)).toBeLessThan(3);
  });

  test('uniform vertical drag gives uniform per-frame rotation', () => {
    const path = [];
    for (let i = 0; i <= 20; i += 1) path.push([0, -0.5 + i * 0.05]);
    const steps = trackedAngles(path);
    const max = Math.max(...steps);
    const min = Math.min(...steps.filter(s => s > 1e-6));
    expect(round(max / min, 2)).toBeLessThan(3);
  });

  test('first drag frame is a no-op baseline (no start flash)', () => {
    figure.mock.touchElement('rc', [0, 0]);
    figure.mock.touchMove([0.2, 0.05]); // first frame: swallowed as baseline
    expect(round(cube.transform.matrix(), 6)).toEqual(round(m3.identity(), 6));
    figure.mock.touchMove([0.4, 0.1]); // second frame: now it rotates
    const notIdentity = round(cube.transform.matrix(), 6)
      .some((v, i) => v !== round(m3.identity(), 6)[i]);
    expect(notIdentity).toBe(true);
    figure.mock.touchUp();
  });

  test('no controlElement is a safe no-op (does not rotate the parent)', () => {
    const fig2 = makeFigure();
    fig2.scene = new Scene({
      style: 'orthographic',
      near: 0.1,
      far: 10,
      camera: { position: [1, 0.6, 1.5], lookAt: [0, 0, 0], up: [0, 1, 0] },
    });
    fig2.elements.scene = fig2.scene;
    const cube2 = fig2.add({ name: 'cube', make: 'cube', side: 0.6 });
    fig2.add({ name: 'rc', make: 'rotateControl' }); // no controlElement
    fig2.mock.touchElement('rc', [0, 0]);
    fig2.mock.touchMove([0.2, 0.1]);
    fig2.mock.touchMove([0.4, 0.2]);
    fig2.mock.touchUp();
    // nothing should have rotated
    expect(round(cube2.transform.matrix(), 6)).toEqual(round(m3.identity(), 6));
  });

  test('diagonal drag gives uniform per-frame rotation', () => {
    const path = [];
    for (let i = 0; i <= 20; i += 1) path.push([-0.5 + i * 0.05, -0.5 + i * 0.05]);
    const steps = trackedAngles(path);
    const max = Math.max(...steps);
    const min = Math.min(...steps.filter(s => s > 1e-6));
    expect(round(max / min, 2)).toBeLessThan(3);
  });
});
