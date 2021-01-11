function fig4() {
  const { Point } = Fig;
  const { round, range } = Fig.tools.math;

  fig = new Fig.Figure({
    limits: [-2, -1.75, 4, 3],
    htmlId: 'figureOneContainer4',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, 12, 0.05);
  const sine = (A, r, phi, B) => thetaValues.map(
    theta => new Point(theta, A * Math.sin(2 * Math.PI / r * theta + phi) + B),
  );

  const mover = (name) => ({
    name,
    method: 'rectangle',
    options: {
      width: 10,
      height: 10,
      color: [0, 0, 0, 0],
    },
    mods: {
      move: {
        bounds: { translation: { left: -0.5, right: 0.5, bottom: -0.5, top: 0.5 } },
      },
    },
  });
  const arrow = (name, angle, position) => ({
    name,
    method: 'primitives.arrow',
    options: {
      color: [0.7, 0.7, 0.7, 1],
      head: 'triangle',
      tail: 0.1,
      length: 0.4,
      tailWidth: 0.2,
      line: { width: 0.005 },
      width: 0.4,
      align: 'start',
      angle,
      position,
    },
  });

  fig.add([
    mover('AMover'),
    mover('BMover'),
    mover('rMover'),
    mover('phiMover'),
    arrow('up', Math.PI / 2, [0, 0.4]),
    arrow('down', -Math.PI / 2, [0, -0.4]),
    arrow('left', Math.PI, [-1.1, -0.7]),
    arrow('right', 0, [1.1, -0.7]),
  ]);

  fig.add({
    name: 'plot',
    method: 'collections.plot',
    options: {
      width: 3.5,
      height: 2,
      position: [-1.75, -1],
      trace: {
        name: 'trace',
        points: sine(1, 4, 0, 0),
        line: { width: 0.01 },
        color: [1, 0, 0, 1],
      },
      xAxis: {
        position: [0, 1],
        start: 0,
        stop: 12,
        title: {
          text: '\u03b8',
          font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
          offset: [1.85, 0.22],
        },
        ticks: {
          values: range(1, 12, 1),
          length: 0.05,
          offset: -0.025,
        },
        labels: { precision: 0, offset: [0, 0], font: { size: 0.08 } },
      },
      yAxis: {
        start: -4,
        stop: 4,
        ticks: { values: range(-4, 4, 1), offset: -0.035, length: 0.07 },
        labels: { precision: 1, font: { size: 0.08 } },
        title: {
          text: 'y',
          font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
          offset: [0.3, 1.05],
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
        A: { text: '0.0', touchBorder: [0.2, 0.3], isTouchable: true },
        B: { text: '0.0', touchBorder: [0.16, 0.3], isTouchable: true },
        phi: { text: '0.0', touchBorder: [0.16, 0.3], isTouchable: true },
        r: { text: '0.0', touchBorder: [0.2, 0.2, 0.16, 0.4], isTouchable: true },
      },
      forms: {
        0: ['y', '_ = ', 'A', ' ', 'sin', { brac: ['lb', [{ frac: ['twoPi', 'vinculum', 'r'] }, ' ', 'theta', 'phiSign', 'phi', ' '], 'rb'] }, 'BSign', 'B'],
      },
      position: [-1, -1.4],
    }
  });
  const values = { A: 1, B: 0, phi: 0, r: 5 };
  const [A, B, phi, r] = fig.getElements({ eqn: ['A', 'B', 'phi', 'r'] });
   const [AMover, BMover, phiMover, rMover, left, right, up, down] = fig.elements.getElements([
    'AMover', 'BMover', 'phiMover', 'rMover', 'left', 'right', 'up', 'down',
  ]);
  const [trace, eqn] = fig.elements.getElements(['plot.trace', 'eqn']);

  const update = () => {
    trace.update(sine(values.A, values.r, values.phi, values.B));
    const BSign = values.B <= -0.1 ? ' \u2212 ' : ' + ';
    const phiSign = values.phi <= 0.1 ? ' \u2212 ' : ' + ';
    eqn.updateElementText({
      A: `${values.A.toFixed(1)}`,
      r: `${values.r.toFixed(1)}`,
      B: `${Math.abs(values.B).toFixed(1)}`,
      phi: `${Math.abs(values.phi).toFixed(1)}`,
      BSign,
      phiSign,
    });
  }

  let selected = null;
  const setupElement = (element, value, mover, initialPosition, moverFunc) => {
    element.onClick = () => {
      console.log(value)
      if (selected != null) {
        selected.isTouchable = false;
      }
      eqn.setColor([0.4, 0.4, 0.4, 1]);
      element.setColor([1, 0, 0, 1]);
      element.pulse({ scale: 1.5 });
      selected = mover;
      selected.setMovable();
      mover.setPosition(mover.getPosition());
      fig.animateNextFrame();
    };
    mover.subscriptions.add('setTransform', () => {
      const p = mover.getPosition().add(0.5, 0.5);
      values[value] = moverFunc(p);
      if (value === 'A' || value === 'B') {
        left.hide();
        right.hide();
        p.y > 0.1 ? down.show() : down.hide();
        p.y < 0.9 ? up.show() : up.hide();
      }
      if (value === 'phi' || value === 'r') {
        down.hide();
        up.hide();
        p.x > 0.1 ? left.show() : left.hide();
        p.x < 0.9 ? right.show() : right.hide();
      }
      update();
    });
    mover.setPosition(initialPosition);
  }
  setupElement(A, 'A', AMover, [0, -0.05], p => p.y * 1.8 + 0.2);
  setupElement(r, 'r', rMover, [0, 0], p => p.x * 5 + 2);
  setupElement(B, 'B', BMover, [0, 0], p => p.y * 4 - 2);
  setupElement(phi, 'phi', phiMover, [0, 0], p => -(p.x * 8 - 4));

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