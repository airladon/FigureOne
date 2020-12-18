const { Point, Figure } = Fig;
const figure = new Figure({
  limits: [-2, -1.5, 4, 3],
  color: [0.5, 0.5, 0.5, 1],
});

const origin = new Point(-1, -0.5);
const radius = 2;
// Create the shape
figure.add([
  {
    name: 'movePad',
    method: 'collections.line',
    options: {
      p1: origin,
      length: radius,
      angle: 1,
      touchBorder: 0.5,
      width: 0.001,
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
    name: 'radius',
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
        isTouchable: true,
        touchBorder: 0.1,
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
        width: 0.005,
        sides: 200,
      },
      label: {
        text: 'x',
        offset: 0.05,
        autoHide: 0.2,
        touchBorder: 0.1,
        isTouchable: true,
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
        touchBorder: 0.1,
        isTouchable: true,
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
      label: {
        text: 'sin x',
        offset: 0.05,
        linePosition: 0.5,
        touchBorder: 0.1,
        isTouchable: true,
      },
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
        x_2: { color: [1, 0, 0, 1], isTouchable: true, touchBorder: 0.1 },
        _1: { isTouchable: true, touchBorder: 0.1 },
        equals: '   =   ',
        limBox: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
        sinBox: { symbol: 'tBox', touchBorder: [0.1, 0.02, 0.1, 0.1], isTouchable: true },
      },
      phrases: {
        sinx: { tBox: [['sin', ' ', 'x_1'], 'sinBox'] },
      },
      forms: {
        0: [
          {
            tBox: [
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
              'limBox',
            ],
          },
          '  ', { frac: ['sinx', 'vinculum', 'x_2'] },
          'equals', '_1',
        ],
      },
      position: origin.add(0.5, -0.4),
    },
    // mods: {
    //   isTouchable: true,
    // },
  },
  {
    name: 'description',
    method: 'primitives.textLines',
    options: {
      text: [
        'As the |angle x| gets very small, the |arc length| and the',
        'vertical component approach equality',
      ],
      font: { color: [1, 0, 0, 1], size: 0.08 },
      justify: 'left',
      xAlign: 'center',
      position: [0, origin.y - 0.8],
      modifiers: {
        'angle x': {
          font: { weight: 'bold' },
          onClick: () => figure.getElement('angle.label').pulse(),
          touchBorder: 0.1,
        },
        'arc length': {
          font: { color: [1, 0, 0, 1] },
          onClick: () => figure.getElement('arc.label').pulse(),
          touchBorder: 0.1,
        },
      },
    },
    mods: {
      isTouchable: true,
      isShown: false,
    },
  },
  {
    name: 'rect',
    method: 'collections.rectangle',
    options: {
      line: { width: 0.005 },
      color: [1, 0, 0, 1],
    },
    mods: {
      custom: { tieTo: null, offset: [0, 0] },
      isShown: false,
    },
  },
]);

const angle = figure.getElement('angle');
const arc = figure.getElement('arc');
const movePad = figure.getElement('movePad');
const sine = figure.getElement('sine');
const rect = figure.getElement('rect');
const description = figure.getElement('description');
const radiusLine = figure.getElement('radius');
const oneLabel = figure.getElement('radius.label');

movePad.subscriptions.add('setTransform', () => {
  const a = movePad.getRotation();
  angle.setAngle({ angle: a });
  arc.setAngle({ angle: a });
  const end = new Point(
    radius * Math.cos(a), radius * Math.sin(a),
  );
  sine.setEndPoints(
    new Point(end.x - 0.005, 0).add(origin),
    new Point(end.x - 0.005, end.y).add(origin),
  );
  figure.setFirstTransform();
  if (rect.isShown && rect.custom.tieTo != null) {
    rect.setPosition(rect.custom.tieTo.getCenterFigurePosition());
  }
  // rect.hide();
  // description.hide();
  radiusLine.setEndPoints(origin, end.add(origin));
});


const highlight = (element, position, text) => {
  rect.animations.cancel();
  description.animations.cancel();
  description.show();
  rect.show();
  description.drawingObject.clear();
  rect.custom.tieTo = element;
  rect.surround(element, 0.05);
  description.pulse({ scale: 1.1, duration: 0.5 });
  rect.pulse({ scale: 1.2, duration: 0.5 });
  description.setPosition(position);
  description.custom.updateText({ text });
  rect.animations.new()
    .dissolveOut({ delay: 3, duration: 0.5 })
    .start();
  description.animations.new()
    .dissolveOut({ delay: 3, duration: 0.5 })
    .start();
};

const arcLabel = figure.getElement('arc.label');
arcLabel.onClick = () => {
  highlight(arcLabel, [1.2, 1], [
    'arc length = angle',
    {
      text: 'as radius = 1',
      font: { size: 0.06 },
      justify: 'center',
    },
  ]);
};

const sineLabel = figure.getElement('sine.label');
sineLabel.onClick = () => {
  highlight(sineLabel, [-1.2, 0.7], [
    'The sine of the angle is the vertical',
    'component of the arc',
  ]);
};

oneLabel.onClick = () => {
  highlight(oneLabel, [-1.2, 0.9], [
    'As arc length is the product of angle',
    'and radius, having a radius of 1',
    'means the values of arc length and',
    'angle are equal (x)',
  ]);
};

const angleLabel = figure.getElement('angle.label');
angleLabel.onClick = () => {
  highlight(angleLabel, [-1.1, -0.2], [
    'Arc angle x',
  ]);
};

const limit = figure.getElement('eqn.limBox');
limit.onClick = () => {
  highlight(limit, [0, -1.4], [
    'As the angle x approaches 0',
  ]);
};

const eqnSine = figure.getElement('eqn.sinBox');
eqnSine.onClick = () => {
  highlight(eqnSine, [0, -1.3], [
    'Vertical component of the arc, and sine of angle x',
  ]);
  sineLabel.pulse({ scale: 1.5, duration: 1 });
};

const eqnX = figure.getElement('eqn.x_2');
eqnX.onClick = () => {
  highlight(eqnX, [0, -1.3], [
    'Arc length, which is equal to angle x',
  ]);
  arcLabel.pulse({ scale: 1.5, duration: 1 });
};

const eqn1 = figure.getElement('eqn._1');
eqn1.onClick = () => {
  highlight(eqn1, [0, -1.3], [
    'The ratio of arc length and sin x is 1',
    'And so they are equal',
  ]);
  arcLabel.pulse({ scale: 1.5, duration: 1 });
};

movePad.setRotation(1);
