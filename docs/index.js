const { Point, Figure } = Fig;
const figure = new Figure({
  limits: [-2, -1.5, 4, 3],
  color: [0.5, 0.5, 0.5, 1],
});

{  const origin = new Point(-1, -0.5);
  const radius = 2;
  // Create the shape
  figure.add([
    {
      name: 'line',
      method: 'collections.line',
      options: {
        p1: origin,
        length: radius,
        angle: 1,
        touchBorder: 0.5,
        width: 0.001,
        // color: [0, 0, 0, 0],
        label: {
          text: '1',
          offset: 0.05,
          update: true,
        },
      },
      mods: {
        isMovable: true,
        move: {
          type: 'rotation',
          bounds: {
            rotation: { min: 0.07, max: 1.1 },
          },
        },
      },
    },
    {
      name: 'angle',
      method: 'collections.angle',
      options: {
        corner: { length: 2 },
        curve: {
          radius: 0.35,
          width: 0.01,
          sides: 200,
        },
        label: {
          text: 'x',
          offset: 0.05,
          autoHide: 0.2,
        },
        position: origin,
      },
    },
    {
      name: 'arc',
      method: 'collections.angle',
      options: {
        curve: {
          radius: radius - 0.005,
          width: 0.01,
          sides: 800,
          dash: [0.1, 0.1],
        },
        label: {
          text: 'x',
          offset: 0.05,
        },
        color: [1, 0, 0, 1],
        position: origin,
      },
    },
    {
      name: 'sine',
      method: 'collections.line',
      options: {
        p1: [0, 0],
        p2: [0, 1],
        label: { text: 'sin x', offset: 0.05, linePosition: 0.5 },
        width: 0.01,
        color: [1, 0, 0, 1],
      },
    },
    {
      name: 'eqn',
      method: 'collections.equation',
      options: {
        elements: {
          lim: { style: 'normal' },
          sin: { style: 'normal', color: [1, 0, 0, 1] },
          x_1: { color: [1, 0, 0, 1] },
          x_2: { color: [1, 0, 0, 1] },
          equals: '   =   ',
        },
        forms: {
          0: [
            {
              annotate: {
                content: 'lim',
                annotation: {
                  content: 'x \u2192 0',
                  xPosition: 'center',      // Position is relative to content
                  xAlign: 'center',         // Alignment is relative to annotation
                  yPosition: 'bottom',
                  yAlign: 'top',
                  scale: 0.6,
                },
              },
            },
            '  ', { frac: [['sin', ' ', 'x_1'], 'vinculum', 'x_2'] },
            'equals', '_1',
          ],
        },
        position: origin.add(0.5, -0.4),
      },
    },
    {
      name: 'description',
      method: 'textLines',
      options: {
        text: [
          'As the angle x gets very small, the |arc length| and the',
          'vertical component approach equality',
        ],
        font: {
          size: 0.08,
        },
        justify: 'center',
        xAlign: 'center',
        position: [0, origin.y - 0.8],
      },
      modifiers: {
        'arc length': {
          color: [1, 0, 0, 1],
          isTouchable: true,
          onClick: () => figure.getElement('arc').pulse(),
        },
      },
      mods: {
        isTouchable: true,
      },
    },
  ]);

  const angle = figure.getElement('angle');
  const arc = figure.getElement('arc');
  const line = figure.getElement('line');
  const sine = figure.getElement('sine');

  line.subscriptions.add('setTransform', () => {
    const a = line.getRotation();
    angle.setAngle({ angle: a });
    arc.setAngle({ angle: a });
    sine.setEndPoints(
      new Point(radius * Math.cos(a) - 0.005, 0).add(origin),
      new Point(radius * Math.cos(a) - 0.005, radius * Math.sin(a)).add(origin),
    );
  });
  line.setRotation(1);
}