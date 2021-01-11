function fig4() {
  const { Point } = Fig;
  const { round, range } = Fig.tools.math;

  fig = new Fig.Figure({
    limits: [-2, -1.5, 4, 3],
    htmlId: 'figureOneContainer4',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, 13, 0.05);
  const sine = (A, r, phi, B) => thetaValues.map(theta => new Point(theta, A * Math.sin(2 * Math.PI / r * theta + phi) + B));

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
        bounds: { translation: { left: -1.5, right: 1, bottom: -0.5, top: 1 } },
      },
    },
  });
  fig.add({
    name: 'plot',
    method: 'collections.plot',
    options: {
      width: 3,
      height: 2,
      position: [-1.75, -0.75],
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
          offset: [1.6, 0.22],
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

  fig.add([
    mover('AMover'),
    mover('BMover'),
    mover('rMover'),
    mover('phiMover'),
  ]);


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
        plus: ' + ',
        min: ' - ',
        A: { text: '0.0', touchBorder: [0.2, 0.3], isTouchable: true },
        B: { text: '0.0', touchBorder: [0.16, 0.3], isTouchable: true },
        phi: { text: '0.0', touchBorder: [0.16, 0.3], isTouchable: true },
        r: { text: '0.0', touchBorder: [0.2, 0.2, 0.16, 0.4], isTouchable: true },
      },
      forms: {
        0: ['y', '_ = ', 'A', ' ', 'sin', { brac: ['lb', [{ frac: ['twoPi', 'vinculum', 'r'] }, ' ', 'theta', 'min', 'phi'], 'rb'] }, 'plus', 'B'],
      },
      position: [-1, -1.2],
    }
  });

  let AValue = 1;
  let BValue = 0;
  let phiValue = 0;
  let rValue = 2 * Math.PI;
  const [A, B, phi, r] = fig.getElements({ eqn: ['A', 'B', 'phi', 'r'] });
   const [AMover, BMover, phiMover, rMover] = fig.elements.getElements([
    'AMover', 'BMover', 'phiMover', 'rMover',
  ]);
  let selected = null;

  const setupElement = (element, name, mover) => {
    element.onClick = () => {
      if (selected != null) {
        selected.isTouchable = false;
      }
      eqn.setColor([0.4, 0.4, 0.4, 1]);
      element.setColor([1, 0, 0, 1]);
      selected = mover;
      selected.setMovable();
    };
    selected = name;
  }
  setupElement(A, 'A', AMover);
  setupElement(r, 'r', rMover);
  setupElement(B, 'B', BMover);
  setupElement(phi, 'phi', phiMover);

  const [trace, xAxis, eqn] = fig.elements.getElements(
    ['plot.trace', 'plot.x', 'eqn']
  );
 
  const update = () => {
    trace.update(sine(AValue, rValue, phiValue, BValue));
    eqn.updateElementText({
      A: `${AValue.toFixed(1)}`,
      r: `${rValue.toFixed(1)}`,
      B: `${BValue.toFixed(1)}`,
      phi: `${phiValue.toFixed(1)}`,
    });
  }

  AMover.subscriptions.add('setTransform', () => {
    AValue = (AMover.getPosition().y + 0.5) / 1.5 * 1.8 + 0.2;
    update();
  });

  rMover.subscriptions.add('setTransform', () => {
    rValue = (rMover.getPosition().x + 1.5) / 2.5 * 6 + 2;
    update();
  });

  phiMover.subscriptions.add('setTransform', () => {
    phiValue = (phiMover.getPosition().x + 1.5) / 2.5 * 8 - 4;
    update();
  });

  BMover.subscriptions.add('setTransform', () => {
    BValue = (BMover.getPosition().y - 0.25) * 2.667;
    update();
  });

  // Initialize
  AMover.setPosition(-0.25, 0.25);
  BMover.setPosition(-0.25, 0.25);
  rMover.setPosition(-0.25, 0.25);
  phiMover.setPosition(-0.25, 0.25);

  // fig.debugShowTouchBorders(['eqn.A', 'eqn.B', 'eqn.phi', 'eqn.r']);

  const pulseTrace = () => trace.pulse({
    translation: 0.02, min: -0.02, frequency: 2,
  });
  const pulseEqn = () => eqn.pulse({ scale: 1.5, yAlign: 'bottom' });
  return { pulseTrace, pulseEqn };
}

const figure4 = fig4();