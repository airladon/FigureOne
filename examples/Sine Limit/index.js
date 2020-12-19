const { Point, Figure } = Fig;
const figure = new Figure({
  limits: [-2, -1.5, 4, 3],
  color: [0.5, 0.5, 0.5, 1],
});

const origin = new Point(-1, -0.4);
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
        bounds: { rotation: { min: 0.07, max: 1.1 } },
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
      width: 0.01,
      color: [0, 0.5, 1, 1],
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
        simple: true,
      },
      label: {
        text: 'x',
        offset: 0.05,
        autoHide: 0.2,
        touchBorder: 0.1,
        isTouchable: true,
        color: [1, 0, 0, 1 ],
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
        simple: true,
      },
      label: {
        text: ['arc', 'x'],
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
        text: ['vert', 'sin x'],
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
    name: 'nextButton',
    method: 'collections.rectangle',
    options: {
      width: 0.5,
      height: 0.25,
      line: { width: 0.005 },
      corner: { radius: 0.03, sides: 5 },
      button: true,
      position: [1.5, -1.25],
      label: 'Next'
    },
    mods: { isTouchable: true, touchBorder: 0.1 },
  },
  {
    name: 'prevButton',
    method: 'collections.rectangle',
    options: {
      width: 0.5,
      height: 0.25,
      line: { width: 0.005 },
      corner: { radius: 0.03, sides: 5 },
      button: true,
      position: [-1.5, -1.25],
      label: 'Prev'
    },
    mods: { isTouchable: true, touchBorder: 0.1 },
  },
  {
    name: 'description',
    method: 'primitives.textLines',
    options: {
      font: { color: [0.5, 0.5, 0.5, 1], size: 0.1 },
      justify: 'left',
      xAlign: 'center',
      yAlign: 'middle',
      position: [0, origin.y - 0.85],
      lineSpace: 0.15,
    },
    mods: {
      isTouchable: true,
    },
  },
]);

const bot = (content, comment, space = 0.05) => ({
  bottomComment: {
    content,
    comment,
    commenSpace: space,
    inSize: false,
  },
});
const frac = (numerator, symbol, denominator, offsetY = 0.07) => ({
  frac: { numerator, denominator, symbol, offsetY },
});
const cont = (content, width) => ({
  container: { content, width },
});
figure.add([
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
        equals: '   =  ',
        limBox: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
        sinBox: { symbol: 'tBox', touchBorder: [0.1, 0.02, 0.1, 0.1], isTouchable: true },
        vert: { color: [1, 0, 0, 1] },
        arc: { color: [1, 0, 0, 1] },
        arc_1: { color: [1, 0, 0, 1] },
        arc_2: { color: [1, 0, 0, 1] },
        xTo: 'x \u2192 ',
        _0: '0',
        s: { symbol: 'strike', style: 'back' },
        // asXTo0: 'as       ',
      },
      phrases: {
        sinx: { tBox: [
          { container: [['sin', ' ', 'x_1'], 0.25] }, 'sinBox'
        ] },
        limit: { tBox: [bot('lim', 'xTo0', '   '), 'limBox']},
        cvert: { container: { content: 'vert', width: 0.25 } },
        xTo0: ['xTo', '_0'],
        asXTo0: ['as ', 'xTo0', ':   ']
      },
      formDefaults: {
        alignment: {
          fixTo: 'equals',
        },
      },
      forms: {
        0: [],
        1: ['asXTo0', 'cvert', 'equals', 'arc' ],
        2: [
          'asXTo0', frac('cvert', 'vinculum', 'arc_1'),
          'equals', frac('arc', 'v2_vinculum', 'arc_2'),
        ],
        3: [
          'asXTo0', frac('cvert', 'vinculum', 'arc_1'),
          'equals', {
            sub: {
              content: { strike: {
                  content: [frac('arc', 'v2', 'arc_2')],
                  symbol: 's',
                },
              },
              subscript: '_1',
              scale: 0.8,
              offset: [0.03, -0.06],
            },
          },
        ],
        4: ['asXTo0', frac('cvert', 'vinculum', 'arc_1'), 'equals', '_1'],
        5: ['limit', '  ', frac('cvert', 'vinculum', 'arc_1'), 'equals', '_1'],
        6: ['limit', '  ', frac('sinx', 'vinculum', 'arc_1'), 'equals', '_1'],
        7: ['limit', '  ', frac('sinx', 'vinculum', 'x_2'), 'equals', '_1'],
        8: ['limit', '  ', frac('sinx', 'vinculum', 'x_2'), 'equals', '_1'],
      },
      formSeries: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
      position: origin.add(1.3, -0.4),
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
const eqn = figure.getElement('eqn');
// const oneLabel = figure.getElement('radius.label');

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
  radiusLine.setEndPoints(origin, end.add(origin));
});

const modifiers = {
  'blue line': {
    font: { color: [0, 0.5, 1, 1] },
    onClick: () => figure.getElement('radius').pulseWidth(),
    touchBorder: [0.1, 0.03, 0.1, 0.1],
  },
  'radius': {
    font: { color: [0, 0.5, 1, 1] },
    onClick: () => figure.getElement('radius').pulseWidth(),
    touchBorder: 0.1,
  },
  'arc': {
    font: { color: [1, 0, 0, 1] },
    onClick: () => figure.getElement('arc.label').pulse(),
    touchBorder: 0.1,
  },
  'angle': {
    font: { color: [1, 0, 0, 1] },
    onClick: () => figure.getElement('angle.label').pulse({ scale: 1.8 }),
    touchBorder: [0.1, 0.01, 0.1, 0.1],
  },
  'vertical': {
    font: { color: [1, 0, 0, 1] },
    onClick: () => figure.getElement('sine.label').pulse(),
    touchBorder: [0.1, 0.1, 0.1, 0.03],
  },
  limit: {
    font: { color: [0, 0.5, 1, 1] },
    onClick: () => eqn.pulse({ elements: ['as ', 'xTo', '_0'], centerOn: '_0', xAlign: 'right' }),
  }
};

const descriptions = [
  {
    text: [
      'Touch and move the |blue line|, and compare',
      'the |arc| and |vertical| line lengths',
    ],
    modifiers,
  },
  {
    text: [
     'As the |angle| gets smaller, the |arc| and',
      '|vertical| line get closer in length',
    ],
    modifiers,
  },
  {
    text: 'Divide both sides by the arc length',
    modifiers,
  },
  { text: 'The right hand side simplifies to 1', },
  { text: 'Use mathematical notation for the |limit|' },
  { text: 'The vertical line is actually the sine of x' },
  { text: ['The |radius| is 1, so the |arc length| equals', 'the |angle|'] },
  {
    text: [
      'In other words: for very small angles, the angle and',
      'the sine of the angle are the same',
    ],
  },
];

const slides = [
  {
    description: 0,
    form: '0',
    state: () => {
      figure.getElement('arc.label').showForm('0');
      figure.getElement('sine.label').showForm('0');
    },
  },
  { description: 1 },
  { form: '1' },
  { description: 2 },
  { form: '2' },
  { description: 3, form: '3' },
  { form: '4' },
  { description: 4 },
  { form: '5' },
  {
    description: 5,
    state: () => {
      figure.getElement('sine.label').showForm('0');
    },
  },
  {
    form: '6',
    state: () => {
      figure.getElement('sine.label').nextForm();
    },
  },
  {
    description: 6,
    state: () => {
      figure.getElement('arc.label').showForm('0');
    },
  },
  {
    form: '7',
    state: () => {
      figure.getElement('arc.label').nextForm();
    },
  },
  { description: 7, form: '8' },
];

let slideIndex = 0;
const nextButton = figure.getElement('nextButton');
const prevButton = figure.getElement('prevButton');
const showSlide = (index) => {
  const slide = slides[index];
  if (slide.form != null) {
    eqn.goToForm({ form: slide.form, animate: 'move' });
  }
  description.stop();
  if (slide.description != null) {
    description.custom.updateText({
          text: descriptions[slide.description].text,
          modifiers: descriptions[slide.description].modifiers,
    })
    description.animations.new()
      .dissolveIn(0.2)
      .start();
  }
  if (slide.state != null) {
    slide.state();
  }
  if (index === 0) {
    prevButton.setOpacity(0.7)
    prevButton.isTouchable = false;
  } else if (prevButton.isTouchable === false) {
    prevButton.setOpacity(1)
    prevButton.isTouchable = true;
  }
}
figure.getElement('nextButton').onClick = () => {
  if (figure.isAnimating()) {
    figure.stop('complete');
    return;
  }
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);  
}
figure.getElement('prevButton').onClick = () => {
  if (figure.isAnimating()) {
    figure.stop('complete');
    return;
  }
  slideIndex = (slideIndex - 1) < 0 ? slides.length - 1 : slideIndex - 1;
  showSlide(slideIndex);  
}

movePad.setRotation(1);
showSlide(0);
