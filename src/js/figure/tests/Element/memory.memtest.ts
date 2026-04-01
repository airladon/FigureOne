import makeFigure from '../../../__mocks__/makeFigure';

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
});
