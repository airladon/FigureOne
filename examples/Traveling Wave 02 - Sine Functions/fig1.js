function fig1() {
  const { Point } = Fig;
  const { round, range } = Fig.tools.math;

  fig = new Fig.Figure({
    limits: [-2 * 0.9, -1 * 0.9, 4 * 0.9, 2 * 0.9],
    htmlId: 'figureOneContainer1',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, Math.PI * 2, 0.01);
  const getSine = (max) => thetaValues
    .filter(theta => theta < max)
    .map(theta => new Point(theta, Math.sin(theta)));

  const r = 0.6;
  fig.add([
    {
      name: 'rotator',
      method: 'collection',
      options: {
        position: [1, 0],
      },
      elements: [
        {
          name: 'x',
          method: 'line',
          options: {
            length: r * 2,
            position: [-r, 0],
            width: 0.005,
            color: [0.7, 0.7, 0.7, 1],
          }
        },
        {
          name: 'y',
          method: 'line',
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
          method: 'polygon',
          options: {
            radius: r,
            sides: 200,
            line: { width: 0.005 },
            color: [0.7, 0.7, 0.7, 1],
          },
        },
        {
          name: 'sine',
          method: 'collections.line',
          options: {
            maxLength: 3,
            width: 0.003,
            // dash: [0.03, 0.007],
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
          method: 'collections.angle',
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
        {
          name: 'line',
          method: 'collections.line',
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
        {
          name: 'tracer',
          method: 'collections.line',
          options: {
            width: 0.003,
            dash: [0.01, 0.007],
            color: [1, 0, 0, 1],
          },
        }
      ],
    },
  ]);

  fig.add([
    {
      name: 'plot',
      method: 'collections.plot',
      options: {
        position: [-1.6, -r * 1],
        width: 1.6,
        height: r * 2,
        trace: {
          name: 'sineWave',
          points: getSine(2 * Math.PI),
          line: { simple: true, color: [1, 0, 0, 1], width: 0.01 },
        },
        xAxis: {
          color: [0, 0.4, 1, 1],
          position: [0, r],
          start: 0,
          stop: 7,
          title: {
            text: '\u03b8',
            font: { family: 'Times New Roman', style: 'italic', size: 0.09 },
            offset: [0.9, r * 1.3],
          },
          ticks: [
            {
              values: range(0, Math.PI * 2.1, Math.PI / 2),
              width: 0,
            },
            {
              values: range(1, 7, 1),
              length: 0.05,
              offset: -0.025,
            },
          ],
          labels: [
            {
              text: ['', 'π/2', 'π', '3π/2', '2π',],
              offset: [0, -r * 0.95],
            },
            {
              precision: 0,
              offset: [0, 0],
            },
          ],
        },
        yAxis: {
          grid: {
            length: 1.6 + 1,
          },
          ticks: false,
          start: -1,
          stop: 1,
          ticks: { values: [-1, 0, 1], offset: -0.025, length: 0.05 },
          labels: { precision: 0 },
          title: {
            text: 'y',
            font: { family: 'Times New Roman', style: 'italic', size: 0.09 },
            offset: [0.05, 0.2],
            rotation: 0,
          },
        },
      },
    },
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
      },
      forms: {
        0: ['y', '_ = ', 'sin', { brac: ['lb', 'theta', 'rb'] }]
      },
      scale: 0.6,
      position: [-0.4, 0.7],
    }
  })

  const [line, theta, sineLine, tracer, sineWave, xAxis] = fig.getElements([
    { rotator: ['line', 'theta', 'sine', 'tracer'] },
    { plot: ['sineWave', 'x'] },
  ]);
  const update = () => {
    const angle = line.getRotation('0to360');
    theta.setAngle({ angle });
    const endX = r * Math.cos(angle);
    const endY = r * Math.sin(angle);
    sineLine.setEndPoints([endX, 0], [endX, endY]);
    sineWave.update(getSine(angle));
    const xAxisDraw = xAxis.valueToDraw(angle);
    tracer.setEndPoints([xAxisDraw - 1.6 - 1, endY], [endX, endY]);
    theta.label.eqn.updateElementText({ value: `${angle.toFixed(1)}` });
  };
  line.subscriptions.add('setTransform', () => update());
  line.setRotation(5.2);

  const pulse = () => line.pulseWidth({ line: 4 });
  const drawFull = () => {
    let start = line.getRotation('0to360');
    if (start > Math.PI * 1.995) {
      start = 0.001;
    }
    line.animations.new()
    .rotation({ start, target: Math.PI * 1.999, velocity: 1, direction: 1 })
    .start();
  };
  return { pulse, drawFull };
}
const figure1 = fig1();
