/* globals Fig */
/* eslint-disable camelcase, object-curly-newline */

/*
This figure traces a sine wave onto cartesian axes from a movable radius line
on a unit circle.

The user drags the radius line, changing its angle. The sine of the angle is
both shown on the unit circle, and on the cartesian plot.

All the logic is encased within a function `fig1` so variables are
scoped locally and not globally, allowing for easier reuse of variables between
figures. Several methods are returned from the function (exposed globally) so
links within the text can pulse and animate parts of the figure.
*/
function fig1() {
  const { Point, range } = Fig;

  const fig = new Fig.Figure({
    scene: [-2 * 0.86, -1 * 0.85, -2 * 0.86 + 4 * 0.85, -1 * 0.85 + 2 * 0.85],
    htmlId: 'figureOneContainer1',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, Math.PI * 2, 0.01);
  const getSine = max => thetaValues
    .filter(theta => theta < max)
    .map(theta => new Point(theta, Math.sin(theta)));

  // The unit circle will have draw radius r
  const r = 0.6;

  // Add the unit circle
  fig.add([
    {
      name: 'unitCircle',
      make: 'collection',
      options: {
        position: [0.9, 0],
      },
      elements: [
        {
          name: 'x',
          make: 'line',
          options: {
            length: r * 2,
            position: [-r, 0],
            width: 0.005,
            color: [0.7, 0.7, 0.7, 1],
          },
        },
        {
          name: 'y',
          make: 'line',
          options: {
            length: r * 2,
            position: [0, -r],
            width: 0.005,
            angle: Math.PI / 2,
            color: [0.7, 0.7, 0.7, 1],
          },
        },
        {
          name: 'circle',
          make: 'polygon',
          options: {
            radius: r,
            sides: 200,
            line: { width: 0.005 },
            color: [0.7, 0.7, 0.7, 1],
          },
        },
        {
          name: 'sine',
          make: 'collections.line',
          options: {
            maxLength: 3,
            width: 0.003,
            color: [1, 0, 0, 1],
            label: {
              text: {
                elements: { sin: { font: { style: 'normal' } }, theta: '\u03b8' },
                forms: { 0: ['sin', 'theta'] },
              },
              scale: 0.4,
              location: 'right',
            },
          },
        },
        {
          name: 'theta',
          make: 'collections.angle',
          options: {
            color: [0, 0.4, 1, 1],
            curve: {
              radius: 0.1,
              width: 0.005,
              sides: 200,
            },
            label: {
              text: {
                elements: {
                  theta: '\u03b8',
                  equals: ' = ',
                  value: '0.0',
                },
                forms: { 0: ['theta', 'equals', 'value'] },
              },
              scale: 0.4,
              offset: 0.01,
              curvePosition: 0.4,
              autoHide: 0.3,
            },
          },
        },
        // Horizontal line connecting the unit circle sine value to the
        // cartesian axes
        {
          name: 'tracer',
          make: 'collections.line',
          options: {
            width: 0.003,
            color: [1, 0, 0, 1],
          },
        },
        // Movable radius line
        {
          name: 'line',
          make: 'collections.line',
          options: {
            length: r,
            width: 0.015,
            touchBorder: 0.3,
          },
          mods: {
            isMovable: true,
            move: { type: 'rotation' },
          },
        },
      ],
    },
  ]);

  // Add cartesian plot
  fig.add([
    {
      name: 'plot',
      make: 'collections.plot',
      options: {
        position: [-1.6, -r * 1],
        width: 1.6,
        height: r * 2,
        trace: {
          name: 'sineWave',
          points: getSine(2 * Math.PI),
          line: { simple: true, color: [1, 0, 0, 1], width: 0.01 },
        },
        font: { size: 0.06 },
        x: {
          grid: false,
          color: [0, 0.4, 1, 1],
          position: [0, r],
          line: { width: 0.006 },
          step: 1,
          start: 0,
          stop: 7,
          title: {
            text: '\u03b8',
            font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
            location: 'right',
          },
          ticks: [
            {
              length: 0.05,
              offset: -0.025,
            },
          ],
          labels: { hide: [0] },
        },
        y: {
          grid: [false, {
            length: 1.5 + 1, width: 0.004, dash: [], color: [0.7, 0.7, 0.7, 1],
          }],
          start: -1,
          stop: 1,
          step: [1, 2],
          line: { width: 0.006 },
          ticks: [
            { offset: -0.025, length: 0.05, location: 'center' },
          ],
          labels: { precision: 0, space: 0.013 },
          title: {
            text: 'y',
            font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
            location: 'top',
            rotation: 0,
          },
        },
        axes: [
          {
            step: Math.PI / 2,
            start: 0,
            stop: 7,
            grid: { width: 0.004, dash: [], color: [0.7, 0.7, 0.7, 1] },
            ticks: false,
            line: false,
            labels: {
              text: ['', '\u03C0/2', '\u03C0', '3\u03C0/2', '2\u03C0'],
              font: { color: [0, 0.4, 1, 1] },
            },
          },
        ],
      },
    },
  ]);

  // Add equation
  fig.add({
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

  // Commonly used figure elements
  const [line, theta, sineLine, tracer, sineWave, xAxis] = fig.getElements([
    { unitCircle: ['line', 'theta', 'sine', 'tracer'] },
    { plot: ['sineWave', 'x'] },
  ]);

  // Get the current line rotation and update:
  //   - Unit circle angle annotation
  //   - Unit circle vertical sine line and annotation
  //   - Tracer element between unit circle and plot
  //   - Sine wave trace on plot
  const update = () => {
    const angle = line.getRotation('0to360');
    theta.setAngle({ angle });
    const endX = r * Math.cos(angle);
    const endY = r * Math.sin(angle);
    sineLine.setEndPoints([endX, 0], [endX, endY]);
    const newTrace = getSine(angle + 0.01);
    sineWave.update(newTrace);
    const xAxisDraw = xAxis.valueToDraw(angle);
    tracer.setEndPoints([xAxisDraw - 1.5 - 1, endY], [endX, endY]);
    theta.label.eqn.updateElementText({ value: `${angle.toFixed(1)}` });
  };

  // Update the figure every time the line is rotated
  line.notifications.add('setTransform', () => update());

  // Initialization
  line.setRotation(5.2);

  // Globally shared methods
  const pulse = () => line.pulseWidth({ line: 4 });
  const drawFull = () => {
    let start = line.getRotation('0to360');
    if (start > Math.PI * 1.995) {
      start = 0.001;
    }
    line.animations.new()
      .rotation({ start, target: Math.PI * 1.999, direction: 1, duration: 2 })
      .start();
  };
  return { pulse, drawFull, fig };
}

const figure1 = fig1();
