function fig4() {
  const { Point } = Fig;
  const { round, range } = Fig.tools.math;

  fig = new Fig.Figure({
    limits: [-1.9, -0.8, 4 * 0.95, 2],
    htmlId: 'figureOneContainer4',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, 12, 0.05);
  const sine = (A, r, phi, B) => thetaValues.map(
    theta => new Point(theta, A * Math.sin(2 * Math.PI / r * theta + phi) + B),
  );

  const arrow = (name, angle, position) => ({
    name,
    method: 'primitives.arrow',
    options: {
      color: [0.7, 0.7, 0.7, 0.9],
      head: 'triangle',
      tail: 0.1,
      length: 0.4,
      tailWidth: 0.2,
      width: 0.4,
      align: 'start',
      angle,
      position,
    },
  });

  fig.add([
    {
      name: 'mover',
      method: 'rectangle',
      options: {
        width: 3.3,
        height: 1.4,
        color: [0, 0, 0, 0],
      },
      mods: {
        isMovable: true,
      }
    },
    arrow('up', Math.PI / 2, [0, 0.2]),
    arrow('down', -Math.PI / 2, [0, -0.2]),
    arrow('left', Math.PI, [-1.1, -0.4]),
    arrow('right', 0, [1.1, -0.4]),
  ]);

  fig.add({
    name: 'plot',
    method: 'collections.plot',
    options: {
      width: 3.3,
      height: 1.4,
      position: [-3.3 / 2, -1.4 / 2],
      trace: {
        name: 'trace',
        points: sine(1, 4, 0, 0),
        line: { width: 0.01 },
        color: [1, 0, 0, 1],
      },
      xAxis: {
        position: [0, 0.7],
        start: 0,
        stop: 12,
        line: { width: 0.006 },
        grid: { width: 0.005, dash: [], color: [0.7, 0.7, 0.7, 1] },
        title: {
          text: '\u03b8',
          font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
          offset: [1.8, 0.22],
        },
        ticks: {
          values: range(1, 12, 1),
          length: 0.05,
          offset: -0.025,
        },
        labels: { precision: 0, offset: [0, 0], font: { size: 0.07 } },
      },
      yAxis: {
        start: -4,
        stop: 4,
        line: { width: 0.006 },
        grid: { values: [-4, -3, -2, -1, 1, 2, 3, 4], width: 0.005, dash: [], color: [0.7, 0.7, 0.7, 1] },
        ticks: { values: range(-4, 4, 1), offset: -0.025, length: 0.05 },
        labels: { precision: 0, font: { size: 0.07 }, offset: [-0.01, 0] },
        title: {
          text: 'y',
          font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
          offset: [0.28, 0.75],
          rotation: 0,
        },
      },
    },
  });

  fig.add({
    name: 'eqn',
    method: 'equation',
    options: {
      elements: {
        sin: { style: 'normal' },
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        theta: '\u03b8',
        twoPi: '2\u03c0',
        phiSign: ' + ',
        BSign: ' + ',
        ASign: ' ',
        A: { text: '0.0', touchBorder: [0.2, 0.3], isTouchable: true },
        B: { text: '0.0', touchBorder: [0.16, 0.3], isTouchable: true },
        phi: { text: '0.0', touchBorder: [0.16, 0.3], isTouchable: true },
        r: { text: '0.0', touchBorder: [0.2, 0.2, 0.16, 0.4], isTouchable: true },
      },
      forms: {
        0: [
          'y', '_  =', { container: ['ASign', 0.1] }, 'A', ' ', 'sin', { brac: ['lb', [{ frac: ['twoPi', 'vinculum', 'r'] }, ' ', 'theta', 'phiSign', 'phi', ' '], 'rb'] }, 'BSign', 'B'],
      },
      position: [-1, 0.9],
    }
  });
  const [A, B, phi, r] = fig.getElements({ eqn: ['A', 'B', 'phi', 'r'] });
   const [mover, left, right, up, down, trace, eqn] = fig.elements.getElements([
    'mover', 'left', 'right', 'up', 'down', 'plot.trace', 'eqn',
  ]);
  const elements = {
    A: { offset: 0.5, value: 1, element: A, calc: p => p * 2, sign: 'ASign' },
    B: { offset: 0, value: 0, element: B, calc: p => p * 2, sign: 'BSign' },
    phi: { offset: 0, value: 0, element: phi, calc: p => -p * 4, sign: 'phiSign' },
    r: { offset: 0, value: 5, element: r, calc: p => p * 3 + 5 },
  };
  const update = () => {
    trace.update(sine(elements.A.value, elements.r.value, elements.phi.value, elements.B.value));
    const BSign = elements.B.value <= -0.1 ? ' \u2212 ' : ' + ';
    const phiSign = elements.phi.value <= 0.1 ? ' \u2212 ' : ' + ';
    const ASign = elements.A.value <= -0.1 ? '\u2212' : '';
    eqn.updateElementText({
      A: `${Math.abs(elements.A.value).toFixed(1)}`,
      r: `${elements.r.value.toFixed(1)}`,
      B: `${Math.abs(elements.B.value).toFixed(1)}`,
      phi: `${Math.abs(elements.phi.value).toFixed(1)}`,
      BSign,
      phiSign,
      ASign,
    }, 'current');
  }

  let selected = null;
  mover.subscriptions.add('setTransform', () => {
    const p = mover.getPosition();
    mover.transform.updateTranslation(0, 0);
    if (selected == null) {
      return;
    }
    const e = elements[selected];
    if (selected === 'A' || selected === 'B') {
      e.offset += p.y * 2;
    } else {
      e.offset += p.x;
    }
    if (e.offset > 1) { e.offset = 1; }
    if (e.offset < -1) { e.offset = -1; }
    e.value = e.calc(e.offset);
    const { offset } = e;
    if (selected === 'A' || selected === 'B') {
      left.hide();
      right.hide();
      e.offset > -0.9 ? down.show() : down.hide();
      e.offset < 0.9 ? up.show() : up.hide();
    }
    if (selected === 'phi' || selected === 'r') {
      down.hide();
      up.hide();
      e.offset > -0.9 ? left.show() : left.hide();
      e.offset < 0.9 ? right.show() : right.hide();
    }
    update();
  });
  const setupElement = (name, moverFunc) => {
    const element = elements[name].element;
    element.onClick = () => {
      eqn.setColor([0.4, 0.4, 0.4, 1]);
      element.setColor([1, 0, 0, 1]);
      element.pulse({ scale: 1.5 });
      selected = name;
      mover.setPosition(0, 0);
      const { sign } = elements[name];
      console.log(sign)
      if (sign != null) {
        eqn.getElement(sign).setColor([1, 0, 0, 1]);
      }
    };
  }
  console.log(fig.elements._plot._x)
  setupElement('A');
  setupElement('B');
  setupElement('phi');
  setupElement('r');
  fig.elements.hide(['right', 'left', 'up', 'down']);
  update();

  const pulseTrace = () => trace.pulse({
    translation: 0.02, min: -0.02, frequency: 2,
  });
  const pulseEqn = () => eqn.pulse({ elements: ['phi', 'r', 'A', 'B'], scale: 1.5 });
  const pulseAmplitude = () => A.onClick();
  const pulseWavelength = () => r.onClick();
  const pulsePhase = () => phi.onClick();
  const pulseOffset = () => B.onClick();
  return { pulseTrace, pulseEqn, pulseAmplitude, pulseWavelength, pulsePhase, pulseOffset };
}

const figure4 = fig4();