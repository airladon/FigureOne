/* globals Fig */
/* eslint-disable camelcase, object-curly-newline */

/*
This figure has a plot of a general sine function, and its associated equation.

The general sine function includes variables:
 - `B`: y offset
 - `A`: amplitude
 - `r`: wavelength
 - `phi`: phase

Variables within the equation can be selected by pressing on them, and then
changed by dragging the diagram left, right, up or down depending on the
variable. The sine function traces changes with corresponding changes in the
variables. Additionally, hint arrows are drawn on the plot to show which way
the plot can be dragged to change the variables.

A data object called `variables` stores state and calculation information
for each variable including:
 - `offset`: state describing how much the variable has been changed
 - `value`: the current value of the variable (resulting from `offset`)
 - `calc`: the function that transforms `offset` into `value`
 - `sign`: some variables have an associated equation element that draws the
           sign of the value

At any one time, a single variable can be selected and changed.

A transparent, movable `mover` figure element is overlaid on the plot of the
sine function. When it is moved, the amount it moves is added to the currently
selected variable's `offset` property. The mover is then reset to its original
position covering only the plot. This means only the plot area will capture
touch events, and the space around the plot can be used to scroll on touch
devices.

All the logic is encased within a function `fig4` so variables it defines are
scoped locally and not globally, allowing for easier reuse of variables between
figures. Several methods are returned from the function (exposed globally) so
links within the text can pulse or select parts of the figure.
*/
function fig4() {
  const { Point } = Fig;
  const { range } = Fig.tools.math;

  const fig = new Fig.Figure({
    limits: [-1.9, -0.8, 4 * 0.95, 2],
    htmlId: 'figureOneContainer4',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, 12, 0.05);
  const sine = (A, r, phi, B) => thetaValues.map(
    theta => new Point(theta, A * Math.sin(2 * Math.PI / r * theta + phi) + B),
  );

  // Helper function to create the hint arrows
  const arrow = (name, angle, position) => ({
    name,
    make: 'primitives.arrow',
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

  // Add mover object for adjusting the graph, and hint arrows
  fig.add([
    {
      name: 'mover',
      make: 'rectangle',
      options: {
        width: 3.3,
        height: 1.4,
        color: [0, 0, 0, 0],
      },
      mods: {
        isMovable: true,
      },
    },
    arrow('up', Math.PI / 2, [0, 0.2]),
    arrow('down', -Math.PI / 2, [0, -0.2]),
    arrow('left', Math.PI, [-1.1, -0.4]),
    arrow('right', 0, [1.1, -0.4]),
  ]);

  // Main plot
  fig.add({
    name: 'plot',
    make: 'collections.plot',
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
        grid: {
          values: [-4, -3, -2, -1, 1, 2, 3, 4], width: 0.005, dash: [], color: [0.7, 0.7, 0.7, 1],
        },
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

  // Equation
  fig.add({
    name: 'eqn',
    make: 'equation',
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
    },
  });

  // Get commonly used figure elements
  const [A, B, phi, r] = fig.getElements({ eqn: ['A', 'B', 'phi', 'r'] });
  const [mover, left, right, up, down, trace, eqn] = fig.elements.getElements([
    'mover', 'left', 'right', 'up', 'down', 'plot.trace', 'eqn',
  ]);

  // Object that holds information about each equation variable
  const variables = {
    A: { offset: 0.5, value: 1, element: A, calc: p => p * 2, sign: 'ASign' },
    B: { offset: 0, value: 0, element: B, calc: p => p * 2, sign: 'BSign' },
    phi: { offset: 0, value: 0, element: phi, calc: p => -p * 4, sign: 'phiSign' },
    r: { offset: 0, value: 5, element: r, calc: p => p * 3 + 5 },
  };

  // Updates the trace and equation to the current `value`s of `variables`
  const update = () => {
    trace.update(
      sine(variables.A.value, variables.r.value, variables.phi.value, variables.B.value),
    );
    const BSign = variables.B.value <= -0.1 ? ' \u2212 ' : ' + ';
    const phiSign = variables.phi.value <= 0.1 ? ' \u2212 ' : ' + ';
    const ASign = variables.A.value <= -0.1 ? '\u2212' : '';
    eqn.updateElementText({
      A: `${Math.abs(variables.A.value).toFixed(1)}`,
      r: `${variables.r.value.toFixed(1)}`,
      B: `${Math.abs(variables.B.value).toFixed(1)}`,
      phi: `${Math.abs(variables.phi.value).toFixed(1)}`,
      BSign,
      phiSign,
      ASign,
    }, 'current');
  };

  // Holds which variable is currently selected
  let selected = null;

  // Whenever the mover figure element is moved, then the currently
  // selected variable's offset and value need to be updated.
  // In addition, hint arrows should be hidden there is dragging the plot
  // in their direction will not result in meaningful change to the variable.
  mover.notifications.add('setTransform', () => {
    const p = mover.getPosition();
    mover.transform.updateTranslation([0, 0]);
    if (selected == null) {
      return;
    }
    const e = variables[selected];
    if (selected === 'A' || selected === 'B') {
      e.offset += p.y * 2;
    } else {
      e.offset += p.x;
    }
    if (e.offset > 1) { e.offset = 1; }
    if (e.offset < -1) { e.offset = -1; }
    e.value = e.calc(e.offset);
    if (selected === 'A' || selected === 'B') {
      left.hide();
      right.hide();
      if (e.offset > -0.9) { down.show(); } else { down.hide(); }
      if (e.offset < 0.9) { up.show(); } else { up.hide(); }
    }
    if (selected === 'phi' || selected === 'r') {
      down.hide();
      up.hide();
      if (e.offset > -0.9) { left.show(); } else { left.hide(); }
      if (e.offset < 0.9) { right.show(); } else { right.hide(); }
    }
    update();
  });

  // Helper function to setup each variable
  const setupVariable = (name) => {
    const { element } = variables[name];
    element.onClick = () => {
      eqn.setColor([0.4, 0.4, 0.4, 1]);
      element.setColor([1, 0, 0, 1]);
      element.pulse({ scale: 1.5 });
      selected = name;
      mover.setPosition(0, 0);
      const { sign } = variables[name];
      if (sign != null) {
        eqn.getElement(sign).setColor([1, 0, 0, 1]);
      }
    };
  };
  setupVariable('A');
  setupVariable('B');
  setupVariable('phi');
  setupVariable('r');

  // Initialization
  fig.elements.hide(['right', 'left', 'up', 'down']);
  update();

  // Methods to share globally
  const pulseTrace = () => trace.pulse({
    translation: 0.02, min: -0.02, frequency: 2,
  });
  const pulseEqn = () => eqn.pulse({ elements: ['phi', 'r', 'A', 'B'], scale: 1.5 });
  const pulseAmplitude = () => A.onClick();
  const pulseWavelength = () => r.onClick();
  const pulsePhase = () => phi.onClick();
  const pulseOffset = () => B.onClick();
  return {
    pulseTrace, pulseEqn, pulseAmplitude, pulseWavelength, pulsePhase, pulseOffset, fig,
  };
}

const figure4 = fig4();
