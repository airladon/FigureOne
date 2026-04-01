import makeFigure from '../../../__mocks__/makeFigure';
import { Point } from '../../../tools/g2';
import { range } from '../../../tools/math';

// Force GC and yield to allow WeakRef targets to be cleared.
// Multiple gc() calls ensure both marking and sweeping complete.
async function forceGC() {
  global.gc!();
  global.gc!();
  await new Promise((resolve) => { setTimeout(resolve, 10); });
  global.gc!();
}

describe('Element Memory - remove', () => {
  test('baseline: plain object is GCd when unreachable', async () => {
    let obj: any = { data: new Array(1000).fill(0) };
    const ref = new WeakRef(obj);
    obj = null;

    await forceGC();
    expect(ref.deref()).toBeUndefined();
  });

  test('primitive is GCd after remove', async () => {
    const figure = makeFigure();
    figure.add({ name: 'a', make: 'polygon', radius: 0.5 });
    const ref = new WeakRef(figure.elements.elements.a);

    figure.elements.remove('a');

    await forceGC();
    expect(ref.deref()).toBeUndefined();
  });

  test('collection with children is GCd after remove', async () => {
    const figure = makeFigure();
    figure.add({
      name: 'col',
      make: 'collection',
      elements: [
        { name: 'p1', make: 'polygon', radius: 0.5 },
        { name: 'p2', make: 'polygon', radius: 0.3 },
      ],
    });
    const colRef = new WeakRef(figure.elements.elements.col);
    const p1Ref = new WeakRef(figure.get('col.p1'));
    const p2Ref = new WeakRef(figure.get('col.p2'));

    figure.elements.remove('col');

    await forceGC();
    expect(colRef.deref()).toBeUndefined();
    expect(p1Ref.deref()).toBeUndefined();
    expect(p2Ref.deref()).toBeUndefined();
  });

  test('element with notification closure referencing another element is GCd after remove', async () => {
    const figure = makeFigure();
    figure.add([
      { name: 'a', make: 'polygon', radius: 0.5 },
      { name: 'b', make: 'polygon', radius: 0.5 },
    ]);
    // Use figure.get() in the closure to avoid local strong refs to A
    figure.elements.elements.a.notifications.add('setTransform', () => {
      figure.get('b').setPosition(figure.get('a').getPosition());
    });
    const ref = new WeakRef(figure.elements.elements.a);

    figure.elements.remove('a');

    await forceGC();
    expect(ref.deref()).toBeUndefined();
  });

  test('cross-notification via string lookup: A is GCd after remove', async () => {
    const figure = makeFigure();
    figure.add([
      { name: 'a', make: 'polygon', radius: 0.5 },
      { name: 'b', make: 'polygon', radius: 0.5 },
    ]);
    figure.elements.elements.a.notifications.add('setTransform', () => {
      figure.get('b').setPosition(figure.get('a').getPosition());
    });
    // B references A via string lookup — no direct object reference
    figure.elements.elements.b.notifications.add('setTransform', () => {
      figure.get('a').setPosition(figure.get('b').getPosition());
    });
    const ref = new WeakRef(figure.elements.elements.a);

    figure.elements.remove('a');

    await forceGC();
    // String lookups (figure.get('a')) don't hold a strong reference to A,
    // so A is collected even though B's closure mentions it by name.
    expect(ref.deref()).toBeUndefined();
  });

  test('cross-notification via direct capture both ways: A is retained after remove', async () => {
    const figure = makeFigure();
    figure.add([
      { name: 'a', make: 'polygon', radius: 0.5 },
      { name: 'b', make: 'polygon', radius: 0.5 },
    ]);
    const A = figure.elements.elements.a;
    const B = figure.elements.elements.b;
    A.notifications.add('setTransform', () => {
      B.setPosition(A.getPosition());
    });
    B.notifications.add('setTransform', () => {
      A.setPosition(B.getPosition());
    });
    const ref = new WeakRef(figure.elements.elements.a);

    figure.elements.remove('a');

    await forceGC();
    // A is NOT collected: B is alive, B's notification closure holds
    // a direct reference to A via the captured const.
    expect(ref.deref()).toBeDefined();
  });

  test('cross-notification via direct capture both ways: A is GCd when defined as a const in a closure', async () => {
    const figure = makeFigure();
    figure.add([
      { name: 'a', make: 'polygon', radius: 0.5 },
      { name: 'b', make: 'polygon', radius: 0.5 },
    ]);
    figure.elements.elements.a.notifications.add('setTransform', () => {
      const A = figure.elements.elements.a;
      const B = figure.elements.elements.b;
      B.setPosition(A.getPosition());
    });
    figure.elements.elements.b.notifications.add('setTransform', () => {
      const A = figure.elements.elements.a;
      const B = figure.elements.elements.b;
      A.setPosition(B.getPosition());
    });
    const refA = new WeakRef(figure.elements.elements.a);

    figure.elements.remove('a');

    await forceGC();
    expect(refA.deref()).toBeUndefined();
  });

  test('cross-notification via direct capture: A is retained after remove', async () => {
    const figure = makeFigure();
    figure.add([
      { name: 'a', make: 'polygon', radius: 0.5 },
      { name: 'b', make: 'polygon', radius: 0.5 },
    ]);
    // Capture direct references for use in closures
    const capturedA = figure.elements.elements.a;
    const capturedB = figure.elements.elements.b;
    // B's closure captures capturedA directly — a strong reference
    capturedB.notifications.add('setTransform', () => {
      capturedA.setPosition(capturedB.getPosition());
    });
    const ref = new WeakRef(figure.elements.elements.a);

    figure.elements.remove('a');

    await forceGC();
    // A is NOT collected: B is alive, B's notification closure holds
    // a direct reference to A via capturedA.
    expect(ref.deref()).toBeDefined();
  });

  test('element with animation is GCd after remove', async () => {
    const figure = makeFigure();
    figure.add({ name: 'a', make: 'polygon', radius: 0.5 });
    figure.elements.elements.a.animations.new()
      .position({ target: [1, 0], duration: 1 }).start();
    const ref = new WeakRef(figure.elements.elements.a);

    figure.elements.remove('a');

    await forceGC();
    expect(ref.deref()).toBeUndefined();
  });
});

describe('Element Memory - cleanup', () => {
  test('all elements GCd after figure.elements.cleanup', async () => {
    const figure = makeFigure();
    figure.add([
      { name: 'a', make: 'polygon', radius: 0.5 },
      { name: 'b', make: 'polygon', radius: 0.3 },
    ]);
    const refA = new WeakRef(figure.elements.elements.a);
    const refB = new WeakRef(figure.elements.elements.b);

    figure.elements.cleanup();

    await forceGC();
    expect(refA.deref()).toBeUndefined();
    expect(refB.deref()).toBeUndefined();
  });

  test('nested collections GCd after figure.elements.cleanup', async () => {
    const figure = makeFigure();
    figure.add({
      name: 'col',
      make: 'collection',
      elements: [
        { name: 'p1', make: 'polygon', radius: 0.5 },
        { name: 'p2', make: 'polygon', radius: 0.3 },
      ],
    });
    const colRef = new WeakRef(figure.elements.elements.col);
    const p1Ref = new WeakRef(figure.get('col.p1'));
    const p2Ref = new WeakRef(figure.get('col.p2'));

    figure.elements.cleanup();

    await forceGC();
    expect(colRef.deref()).toBeUndefined();
    expect(p1Ref.deref()).toBeUndefined();
    expect(p2Ref.deref()).toBeUndefined();
  });

  test('elements with cross-notifications GCd after cleanup', async () => {
    const figure = makeFigure();
    figure.add([
      { name: 'a', make: 'polygon', radius: 0.5 },
      { name: 'b', make: 'polygon', radius: 0.5 },
    ]);
    figure.elements.elements.a.notifications.add('setTransform', () => {
      const A = figure.elements.elements.a;
      const B = figure.elements.elements.b;
      B.setPosition(A.getPosition());
    });
    figure.elements.elements.b.notifications.add('setTransform', () => {
      const A = figure.elements.elements.a;
      const B = figure.elements.elements.b;
      A.setPosition(B.getPosition());
    });
    const refA = new WeakRef(figure.elements.elements.a);
    const refB = new WeakRef(figure.elements.elements.b);

    figure.elements.cleanup();

    await forceGC();
    expect(refA.deref()).toBeUndefined();
    expect(refB.deref()).toBeUndefined();
  });

  test('element with animation GCd after figure.elements.cleanup', async () => {
    const figure = makeFigure();
    figure.add({ name: 'a', make: 'polygon', radius: 0.5 });
    figure.elements.elements.a.animations.new()
      .position({ target: [1, 0], duration: 1 }).start();
    const ref = new WeakRef(figure.elements.elements.a);

    figure.elements.cleanup();

    await forceGC();
    expect(ref.deref()).toBeUndefined();
  });

  test('sine wave example: all elements GCd after cleanup', async () => {
    const figure = makeFigure();
    const r = 0.6;
    const thetaValues = range(0, Math.PI * 2, 0.01);
    const getSine = (max: number) => thetaValues
      .filter((theta: number) => theta < max)
      .map((theta: number) => new Point(theta, Math.sin(theta)));

    // Unit circle collection with lines, angle, and annotations
    figure.add([
      {
        name: 'unitCircle',
        make: 'collection',
        elements: [
          { name: 'x', make: 'line', options: { length: r * 2, position: [-r, 0], width: 0.005 } },
          { name: 'y', make: 'line', options: { length: r * 2, position: [0, -r], width: 0.005, angle: Math.PI / 2 } },
          { name: 'circle', make: 'polygon', options: { radius: r, sides: 200, line: { width: 0.005 } } },
          {
            name: 'sine',
            make: 'collections.line',
            options: { maxLength: 3, width: 0.003, color: [1, 0, 0, 1] },
          },
          {
            name: 'theta',
            make: 'collections.angle',
            options: { color: [0, 0.4, 1, 1], curve: { radius: 0.1, width: 0.005, sides: 200 } },
          },
          { name: 'tracer', make: 'collections.line', options: { width: 0.003 } },
          {
            name: 'line',
            make: 'collections.line',
            options: { length: r, width: 0.015 },
            mods: { isMovable: true, move: { type: 'rotation' } },
          },
        ],
      },
    ]);

    // Cartesian plot with sine trace
    figure.add([
      {
        name: 'plot',
        make: 'collections.plot',
        options: {
          position: [-1.6, -r],
          width: 1.6,
          height: r * 2,
          trace: {
            name: 'sineWave',
            points: getSine(2 * Math.PI),
            line: { simple: true, color: [1, 0, 0, 1], width: 0.01 },
          },
          x: { start: 0, stop: 7, step: 1 },
          y: { start: -1, stop: 1, step: [1, 2] },
        },
      },
    ]);

    // Equation
    figure.add({
      name: 'eqn',
      make: 'equation',
      options: {
        elements: {
          sin: { style: 'normal' },
          lb: { symbol: 'bracket', side: 'left' },
          rb: { symbol: 'bracket', side: 'right' },
          theta: '\u03b8',
        },
        forms: {
          0: ['y', '_ = ', 'sin', { brac: ['lb', 'theta', 'rb'] }],
        },
        scale: 0.6,
        position: [-0.4, 0.7],
      },
    });

    // Collect WeakRefs to ALL elements in the tree.
    // Use IIFE so the allElements array doesn't survive as a local strong ref.
    const refs = (() => {
      const allElements = figure.elements.getAllElements();
      // Skip the root collection itself (index 0) — it stays alive via figure.elements
      return allElements.slice(1).map(
        (el: any) => ({ name: el.name, ref: new WeakRef(el) }),
      );
    })();

    expect(refs.length).toBeGreaterThan(10);

    figure.elements.cleanup();

    await forceGC();

    const retained = refs.filter((r: any) => r.ref.deref() !== undefined);
    if (retained.length > 0) {
      // eslint-disable-next-line no-console
      console.log('retained elements:', retained.map((r: any) => r.name));
    }
    expect(retained).toHaveLength(0);
  });
});
