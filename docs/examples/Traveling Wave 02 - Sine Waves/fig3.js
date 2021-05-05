/* globals Fig */
/* eslint-disable camelcase, object-curly-newline */

/*
This figure has a plot of a sine function with a variable frequency/wavelength,
and the associated equation.

The frequency/wavelength of the sine function can be changed by dragging the
plot left or right.

A transparent, movable `mover` figure element is overlaid on the plot. When it
is moved, the amount it moves is added to an `offset` property that tracks the
total amount the `mover` has been dragged left or right. The mover is then
reset to its original position covering only the plot. This means only the plot
area will capture touch events, and the space around the plot can be used to
scroll on touch devices.

All the logic is encased within a function `fig3` so variables are
scoped locally and not globally, allowing for easier reuse of variables between
figures. Several methods are returned from the function (exposed globally) so
links within the text can pulse parts of the figure.
*/
function fig3() {
  const { Point } = Fig;
  const { range } = Fig.tools.math;

  const fig = new Fig.Figure({
    limits: [-2, -0.6, 4, 2],
    htmlId: 'figureOneContainer3',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, 13, 0.05);
  const sine = r => thetaValues.map(theta => new Point(theta, Math.sin(2 * Math.PI / r * theta)));

  // Add sine plot
  fig.add({
    name: 'plot',
    method: 'collections.plot',
    options: {
      width: 3.5,
      height: 1.3,
      position: [-1.75, -0.5],
      trace: {
        name: 'trace',
        points: sine(2),
        line: { width: 0.01 },
        color: [1, 0, 0, 1],
      },
      xAxis: {
        line: { width: 0.006 },
        grid: { width: 0.004, dash: [], color: [0.7, 0.7, 0.7, 1] },
        position: [0, 0.65],
        start: 0,
        stop: 13,
        title: {
          text: '\u03b8',
          font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
          offset: [1.85, 0.22],
        },
        ticks: {
          values: range(1, 13, 1),
          length: 0.05,
          offset: -0.025,
        },
        labels: { precision: 0, offset: [0, 0] },
      },
      yAxis: {
        grid: { values: [-1, 1], width: 0.004, dash: [], color: [0.7, 0.7, 0.7, 1] },
        start: -1,
        stop: 1,
        line: { width: 0.006 },
        ticks: { values: range(-1, 1, 1), offset: -0.035, length: 0.07 },
        labels: { precision: 0 },
        title: {
          text: 'y',
          font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
          offset: [0.25, 0.7],
          rotation: 0,
        },
      },
    },
  });

  // Add mover figure element
  fig.add([
    {
      name: 'mover',
      method: 'rectangle',
      options: {
        width: 3.5,
        height: 1.3,
        color: [0, 0, 0, 0],
      },
      mods: {
        isMovable: true,
      },
    },
  ]);

  // Add equation
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
        value: { text: '0.0', color: [1, 0, 0, 1] },
      },
      formDefaults: { alignment: { xAlign: 'center' } },
      forms: {
        0: ['y', '_ = ', 'sin', { brac: ['lb', [{ frac: ['twoPi', 'vinculum', 'value'] }, ' ', 'theta'], 'rb'] }],
      },
      position: [0, 1.05],
    },
  });

  // Commonly used figure elements
  const [mover, trace, eqn] = fig.elements.getElements(
    ['mover', 'plot.trace', 'eqn'],
  );

  // Holds the amount the plot has been dragged left or right
  let offset = 0;

  // Each time the mover is moved, the offset needs to be updated,
  // and the frequency/wavelength of the trace and in the equation
  // needs to be updated.
  mover.notifications.add('setTransform', () => {
    offset += mover.getPosition().x;
    mover.transform.updateTranslation(0, 0.15);
    if (offset > 1) { offset = 1; }
    if (offset < -1) { offset = -1; }
    const newR = offset * 3 + 5;
    trace.update(sine(newR));
    eqn.updateElementText({ value: `${newR.toFixed(1)}` });
  });

  // Initialize
  mover.setPosition(0, 0.15);

  // Globally available methods
  const pulseTrace = () => trace.pulse({
    translation: 0.02, min: -0.02, frequency: 2,
  });
  const pulseEqn = () => eqn.pulse({ scale: 1.5, yAlign: 'bottom' });
  return { pulseTrace, pulseEqn, fig };
}

const figure3 = fig3();
