/* globals Fig */
/* eslint-disable camelcase, object-curly-newline */

/*
This figure has a plot of a sine function with a variable amplitude,
and the associated equation.

The amplitude of the sine function can be changed by dragging the plot up or
down.

A transparent, movable `mover` figure element is overlaid on the plot. When it
is moved, the amount it moves is added to an `offset` property that tracks the
total amount the `mover` has been dragged up or down. The mover is then
reset to its original position covering only the plot. This means only the plot
area will capture touch events, and the space around the plot can be used to
scroll on touch devices.

All the logic is encased within a function `fig2` so variables are
scoped locally and not globally, allowing for easier reuse of variables between
figures. Several methods are returned from the function (exposed globally) so
links within the text can pulse parts of the figure.
*/
function fig2() {
  const { Point } = Fig;
  const { range } = Fig.tools.math;

  const fig = new Fig.Figure({
    limits: [-2, -0.8, 4, 2],
    htmlId: 'figureOneContainer2',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, Math.PI * 4.12, 0.1);
  const sine = A => thetaValues.map(theta => new Point(theta, A * Math.sin(theta)));

  fig.add([
    // Add plot of sine function
    {
      name: 'plot',
      method: 'collections.plot',
      options: {
        width: 3.5,
        height: 1.5,
        position: [-1.75, -0.75],
        trace: {
          name: 'trace',
          points: sine(1),
          line: { width: 0.01 },
          color: [1, 0, 0, 1],
        },
        xAxis: {
          grid: { values: [0, 13], width: 0.004, dash: [], color: [0.7, 0.7, 0.7, 1] },
          position: [0, 0.75],
          line: { width: 0.006 },
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
          line: { width: 0.006 },
          grid: { width: 0.004, dash: [], color: [0.7, 0.7, 0.7, 1] },
          start: -2,
          stop: 2,
          ticks: { values: range(-2, 2, 0.5), offset: -0.035, length: 0.07 },
          labels: { precision: 1 },
          title: {
            text: 'y',
            font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
            offset: [0.27, 0.8],
            rotation: 0,
          },
        },
      },
    },
    // Add mover figure element
    {
      name: 'mover',
      method: 'rectangle',
      options: {
        width: 3.5,
        height: 1.5,
        color: [0, 0, 0, 0],
      },
      mods: {
        isMovable: true,
      },
    },
    // Add equation
    {
      name: 'eqn',
      method: 'equation',
      options: {
        elements: {
          sin: { style: 'normal' },
          lb: { symbol: 'bracket', side: 'left' },
          rb: { symbol: 'bracket', side: 'right' },
          theta: '\u03b8',
          A: { text: '0.0', color: [1, 0, 0, 1] },
          sign: { text: '\u2212', color: [1, 0, 0, 1] },
        },
        formDefaults: { alignment: { xAlign: 'center' } },
        forms: {
          0: ['y', '_  = ', 'sign', 'A', ' ', 'sin', { brac: ['lb', 'theta', 'rb'] }],
        },
        position: [0, 0.9],
      },
    },
  ]);

  // Commonly used figure elements
  const [mover, trace, eqn] = fig.getElements(['mover', 'plot.trace', 'eqn']);

  // Holds the amount the plot has been dragged up or down
  let offset = 0.5;

  // Each time the mover is moved, the offset needs to be updated,
  // and the amplitude of the trace and in the equation needs to be updated.
  mover.subscriptions.add('setTransform', () => {
    offset += mover.getPosition().y * 2;
    mover.transform.updateTranslation(0, 0);
    if (offset > 1) { offset = 1; }
    if (offset < -1) { offset = -1; }
    let sign = '';
    if (offset < 0) {
      sign = '\u2212';
    }
    const newA = offset * 2;
    trace.update(sine(newA));
    eqn.updateElementText({ A: `${Math.abs(newA).toFixed(1)}`, sign });
  });

  // Initialize
  mover.setPosition(0, 0);

  // Globally available methods
  const pulseTrace = () => trace.pulse({
    translation: 0.02, min: -0.02, angle: Math.PI / 2, frequency: 2,
  });
  const pulseAmplitude = () => eqn.pulse({ elements: ['A'], scale: 2 });
  return { pulseTrace, pulseAmplitude };
}

const figure2 = fig2();