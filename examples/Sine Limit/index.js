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
        text: ['', '1'],
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
      position: [1.5, -1.3],
      label: 'Next'
    },
    mods: {
      isTouchable: true,
      touchBorder: 0.1,
      onClick: () => {
        const eqn = figure.getElement('eqn');
        eqn.nextForm({ animate: 'move' });
        const { description, modifiers } = eqn.getCurrentForm();
        figure.getElement('description').custom.updateText({
          text: description,
          modifiers,
        });
      }
    }
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
      position: [-1.5, -1.3],
      label: 'Prev'
    },
    mods: {
      isTouchable: true,
      touchBorder: 0.1,
      onClick: () => {
        figure.getElement('eqn').prevForm({ animate: 'dissolve' });
      }
    }
  },
  {
    name: 'description',
    method: 'primitives.textLines',
    options: {
      // text: [
      //   'Move the |blue line| and |observe|:',
      //   {
      //     text: 'As the |angle| gets smaller, the |arc| and',
      //     lineSpace: 0.2,
      //   },
      //   '|vertical| line get closer in length',
      // ],
      font: { color: [0.5, 0.5, 0.5, 1], size: 0.1 },
      justify: 'left',
      xAlign: 'center',
      yAlign: 'middle',
      position: [0, origin.y - 0.9],
      // modifiers: {
      //   'Observe': {
      //     font: { style: 'italic' },
      //   },
      //   'blue line': {
      //     font: { color: [0, 0.5, 1, 1] },
      //     onClick: () => figure.getElement('radius').pulseWidth(),
      //     touchBorder: 0.1,
      //   },
      //   'arc': {
      //     font: { color: [1, 0, 0, 1] },
      //     onClick: () => figure.getElement('arc.label').pulse(),
      //     touchBorder: 0.1,
      //   },
      //   'angle': {
      //     font: { color: [1, 0, 0, 1] },
      //     onClick: () => figure.getElement('angle.label').pulse(),
      //     touchBorder: 0.1,
      //   },
      //   'vertical': {
      //     font: { color: [1, 0, 0, 1] },
      //     onClick: () => figure.getElement('sine.label').pulse(),
      //     touchBorder: 0.1,
      //   },
      // },
    },
    mods: {
      isTouchable: true,
      // isShown: false,
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
figure.add([
  {
    name: 'eqn',
    method: 'collections.equation',
    options: {
      elements: {
        lim: { style: 'normal' },
        sin: { style: 'normal', color: [1, 0, 0, 1] },
        x_1: { color: [1, 0, 0, 1] },
        x_3: { color: [1, 0, 0, 1] },
        x_2: { color: [1, 0, 0, 1], isTouchable: true, touchBorder: 0.1 },
        _1: { isTouchable: true, touchBorder: 0.1 },
        equals: '   =  ',
        limBox: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
        sinBox: { symbol: 'tBox', touchBorder: [0.1, 0.02, 0.1, 0.1], isTouchable: true },
        vert: { color: [1, 0, 0, 1] },
        arc: { color: [1, 0, 0, 1] },
        arc_1: { color: [1, 0, 0, 1] },
        arc_2: { color: [1, 0, 0, 1] },
        asXTo0: 'as x \u2192 0:        ',
      },
      phrases: {
        sinx: { tBox: [['sin', ' ', 'x_1'], 'sinBox'] },
        sinx1: { tBox: [['sin', ' ', 'x_3'], 'sinBox'] },
        limit: { tBox: [bot('lim', 'x \u2192 0', '   '), 'limBox']},
      },
      formDefaults: {
        alignment: {
          fixTo: 'equals',
        },
      },
      forms: {
        0: [],
        1: ['asXTo0', 'vert', 'equals', 'arc' ],
        2: [
            'asXTo0', frac('vert', 'vinculum', 'arc_1'),
            'equals', frac('arc', 'v2_vinculum', 'arc_2'),
          ],
        3: ['asXTo0', frac('vert', 'vinculum', 'arc_1'), 'equals', '_1'],
        4: ['limit', '  ', frac('vert', 'vinculum', 'arc_1'), 'equals', '_1'],
        5: {
          content: [
            'limit',
            '  ', frac('sinx1', 'vinculum', 'arc_1'),
            'equals', '_1',
          ],
          // onTransition: () => {            
          //   figure.getElement('sine.label').nextForm();
          // },
          // onShow: () => {
          //   figure.getElement('sine.label').pulse();
          //   figure.getElement('eqn').pulse({
          //     elements: ['sin', 'x_3'],
          //     centerOn: figure.getElement('eqn.sin'),
          //     xAlign: 'right',
          //     yAlign: 'bottom',
          //   });
          // },
          // description: 'The vertical line is actually the sine of x'
        },
        6: {
          content: [
            'limit',
            '  ', frac('sinx1', 'vinculum', 'x_2'),
            'equals', '_1',
          ],
          // onTransition: () => {            
          //   figure.getElement('arc.label').nextForm();
          // },
          // onShow: () => {
          //   figure.getElement('arc.label').pulse();
          //   figure.getElement('eqn.x_2').pulse({ yAlign: 'top' });
          // },
          // description: 'The radius is 1, so the arc length equals the angle',
        },
        7: {
          content: [
            'limit',
            '  ', frac('sinx1', 'vinculum', 'x_2'),
            'equals', '_1',
          ],
          // description: [
          //   'This can be read as:',
          //   'For very small angles, the angle and',
          //   'the sine of the angle are the same',
          // ],
        },
      },
      formSeries: ['0', '1', '2', '3', '4', '5', '6', '7'],
      position: origin.add(1.3, -0.4),
    },
    // mods: {
    //   isTouchable: true,
    // },
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
  figure.setFirstTransform();
  if (rect.isShown && rect.custom.tieTo != null) {
    rect.setPosition(rect.custom.tieTo.getCenterFigurePosition());
  }
  // rect.hide();
  // description.hide();
  radiusLine.setEndPoints(origin, end.add(origin));
});

const descriptions = [
  {
    text: [
      'Move the |blue line| and |observe|:',
      {
        text: 'As the |angle| gets smaller, the |arc| and',
        lineSpace: 0.2,
      },
      '|vertical| line get closer in length',
    ],
    modifiers: {
      'Observe': {
        font: { style: 'italic' },
      },
      'blue line': {
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
        onClick: () => figure.getElement('angle.label').pulse(),
        touchBorder: 0.1,
      },
      'vertical': {
        font: { color: [1, 0, 0, 1] },
        onClick: () => figure.getElement('sine.label').pulse(),
        touchBorder: 0.1,
      },
    },
  },
  // { text: 'Lets make this an equation' },
  {
    text: 'Divide both sides by the |arc length|',
    modifiers: {
      'arc length': {
        font: { color: [1, 0, 0, 1] },
        onClick: () => {
          figure.getElement('eqn').pulse({ elements: ['arc_1', 'arc_2'], yAlign: 'top'});
        },
        touchBorder: 0.1,
      },
    },
  },
  { text: 'The right hand side simplifies to 1', },
  { text: 'Use mathematical notation for the limit' },
  { text: 'The vertical line is actually the sine of x' },
  { text: 'The radius is 1, so the arc length equals the angle' },
  {
    text: [
      'This can be read as:',
      'For very small angles, the angle and',
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
  { form: '1' },
  { description: 1 },
  { form: '2' },
  { description: 2 },
  { form: '3' },
  { description: 3 },
  { form: '4' },
  {
    description: 4,
    state: () => {
      figure.getElement('sine.label').showForm('0');
    },
  },
  {
    form: '5',
    state: () => {
      figure.getElement('sine.label').nextForm();
    },
  },
  {
    description: 5,
    state: () => {
      figure.getElement('arc.label').showForm('0');
    },
  },
  {
    form: '6',
    state: () => {
      figure.getElement('arc.label').nextForm();
    },
  },
  { description: 6, form: '6' },
];

let slideIndex = 0;
const showSlide = (index) => {
  const slide = slides[index];
  console.log(slide)
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
      .dissolveIn(0.4)
      .start();
  }
  if (slide.state != null) {
    slide.state();
  }
  console.log(index)
}
figure.getElement('nextButton').onClick = () => {
  if (figure.isAnimating()) {
    figure.stop();
    return;
  }
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);  
}
figure.getElement('prevButton').onClick = () => {
  if (figure.isAnimating()) {
    figure.stop();
    return;
  }
  slideIndex = (slideIndex - 1) < 0 ? slides.length - 1 : slideIndex - 1;
  showSlide(slideIndex);  
}
showSlide(0)
// const highlight = (element, position, text) => {
//   rect.animations.cancel();
//   description.animations.cancel();
//   description.show();
//   rect.show();
//   description.drawingObject.clear();
//   rect.custom.tieTo = element;
//   rect.surround(element, 0.05);
//   description.pulse({ scale: 1.1, duration: 0.5 });
//   rect.pulse({ scale: 1.2, duration: 0.5 });
//   description.setPosition(position);
//   description.custom.updateText({ text });
//   rect.animations.new()
//     .dissolveOut({ delay: 3, duration: 0.5 })
//     .start();
//   description.animations.new()
//     .dissolveOut({ delay: 3, duration: 0.5 })
//     .start();
// };

// const arcLabel = figure.getElement('arc.label');
// arcLabel.onClick = () => {
//   highlight(arcLabel, [1.2, 1], [
//     'arc length = angle',
//     {
//       text: 'as radius = 1',
//       font: { size: 0.06 },
//       justify: 'center',
//     },
//   ]);
// };

// const sineLabel = figure.getElement('sine.label');
// sineLabel.onClick = () => {
//   highlight(sineLabel, [-1.2, 0.7], [
//     'The sine of the angle is the vertical',
//     'component of the arc',
//   ]);
// };

// oneLabel.onClick = () => {
//   highlight(oneLabel, [-1.2, 0.9], [
//     'As arc length is the product of angle',
//     'and radius, having a radius of 1',
//     'means the values of arc length and',
//     'angle are equal (x)',
//   ]);
// };

// const angleLabel = figure.getElement('angle.label');
// angleLabel.onClick = () => {
//   highlight(angleLabel, [-1.1, -0.2], [
//     'Arc angle x',
//   ]);
// };

// const limit = figure.getElement('eqn.limBox');
// limit.onClick = () => {
//   highlight(limit, [0, -1.4], [
//     'As the angle x approaches 0',
//   ]);
// };

// const eqnSine = figure.getElement('eqn.sinBox');
// eqnSine.onClick = () => {
//   highlight(eqnSine, [0, -1.3], [
//     'Vertical component of the arc, and sine of angle x',
//   ]);
//   sineLabel.pulse({ scale: 1.5, duration: 1 });
// };

// const eqnX = figure.getElement('eqn.x_2');
// eqnX.onClick = () => {
//   highlight(eqnX, [0, -1.3], [
//     'Arc length, which is equal to angle x',
//   ]);
//   arcLabel.pulse({ scale: 1.5, duration: 1 });
// };

// const eqn1 = figure.getElement('eqn._1');
// eqn1.onClick = () => {
//   highlight(eqn1, [0, -1.3], [
//     'The ratio of arc length and sin x is 1',
//     'And so they are equal',
//   ]);
//   arcLabel.pulse({ scale: 1.5, duration: 1 });
// };

movePad.setRotation(1);
// const eqn = figure.getElement('eqn');
// const form = eqn.getCurrentForm();
// description.custom.updateText({
//   text: form.description,
//   modifiers: form.modifiers,
// });