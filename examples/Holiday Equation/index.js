const figure = new Fig.Figure({
  limits: [-2, -1.5, 4, 3], color: [0.5, 0.5, 0.5, 1],
});

const button = (name, position, label) => ({
  name,
  method: 'collections.rectangle',
  options: {
    width: 0.4,
    height: 0.2,
    line: { width: 0.005 },
    corner: { radius: 0.03, sides: 5 },
    button: true,
    position,
    label,
  },
  mods: { isTouchable: true, touchBorder: 0.1 },
});

figure.add([
  {
    name: 'description',
    method: 'primitives.textLines',
    options: {
      font: { color: [0.5, 0.5, 0.5, 1], size: 0.1, weight: 100 },
      xAlign: 'center',
      yAlign: 'middle',
      position: [0, -1],
      lineSpace: 0.15,
    },
    mods: {
      isTouchable: true,
    },
  },
  button('nextButton', [1.5, -1], 'Next'),
  button('prevButton', [-1.5, -1], 'Prev'),
]);

const topCom = (content, comment, symbol) => ({
  topComment: {
    content,
    comment,
    inSize: false,
    symbol,
  },
});
const s = (content, symbol) => ({
  strike: {
    content, symbol, inSize: false,
  },
});
const sup = (content, superscript, offsetY = 0.05) => ({
  sup: {
    content, superscript, offset: [0, offsetY],
  },
});

figure.add([
  {
    name: 'eqn',
    method: 'collections.equation',
    options: {
      scale: 1.1,
      color: [0.5, 0.5, 0.5, 1],
      elements: {
        log: { font: { style: 'normal' } },
        min: ' \u2212 ',
        equals: '  =  ',
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        v1: { symbol: 'vinculum', draw: 'static' },
        v2: { symbol: 'vinculum' },
        mul1: '  \u00d7  ',
        mul2: '  \u00d7  ',
        mul3: '  \u00d7  ',
        st1: { symbol: 'strike', lineWidth: 0.005 },
        st2: { symbol: 'strike', lineWidth: 0.005 },
        brace: { symbol: 'brace', side: 'top' },
      },
      phrases: {
        loge: { sub: ['log', 'e'] },
        xOnM: { frac: ['x', 'v1', 'm'] },
        xOnMStrk: { frac: ['x', 'v1', s('m', 'st1')] },
        xomsa: ['xOnM', 'min', 's', 'a'],
        xsam: ['x', 'min', 's', 'a', 'm_4'],
        xmas: ['x', 'min', 'm_4', 'a', 's'],
        r2: { sup: ['r', '_2'] },
        r21: { sup: ['r_1', '_2_1'] },
        r22: { sup: ['r_2', '_2_2'] },
        logeXomsa: ['loge', { brac: ['lb', 'xomsa', 'rb'] }],
        logeOnr2: { frac: ['logeXomsa', 'v2', 'r2'] },
        logeOnr2Strk: { frac: ['logeXomsa', 'v2', s('r2', 'st1')] },
        logeXomsaStrk: [s('loge', 'st2'), { brac: ['lb', 'xomsa', 'rb'] }],
        eyr2: sup('e_1', ['r21', 'y']),
        eyr2rry: sup('e_1', [topCom('r21', ['r_3', 'r_4'], 'brace'), 'y']),
        erry: sup('e_1', ['r_3', 'r_4', 'y']),
      },
      formDefaults: {
        alignment: { xAlign: 'center' },
        translation: {
          a: { style: 'linear' },
          m_4: { style: 'linear' },
          s: { style: 'linear' },
        },
        duration: 1,
      },
      forms: {
        0: ['y', 'equals', 'logeOnr2'],
        1: ['r21', 'mul1', 'y', 'equals', 'logeOnr2', 'mul2', 'r22'],
        2: ['r21', 'mul1', 'y', 'equals', 'logeOnr2Strk', 'mul2', s('r22', 'st2')],
        3: ['r21', 'y', 'equals', 'logeXomsa'],
        4: [sup('e_1', ['r21', 'y']), 'equals', sup('e_2', 'logeXomsa')],
        5: [
          sup('e_1', ['r21', 'y']),
          'equals',
          sup(s('e_2', 'st1'), 'logeXomsaStrk'),
        ],
        6: ['eyr2', 'equals', 'xomsa'],
        7: ['m_2', 'mul1', 'eyr2', 'equals', 'xOnM', 'mul2', 'm_3', '   ', 'min', '   ', 's', 'a', 'mul3', 'm_4'],
        8: ['m_2', 'mul1', 'eyr2', 'equals', 'xOnMStrk', 'mul2', s('m_3', 'st2'), '   ', 'min', '   ', 's', 'a', 'mul3', 'm_4'],
        9: ['m_2', 'eyr2', 'equals', 'xsam'],
        10: ['m_2', 'eyr2rry', 'equals', 'xsam'],
        11: ['m_2', 'erry', 'equals', 'xsam'],
        12: {
          content: ['m_2', 'erry', 'equals', 'xmas'],
          translation: {
            m_4: { style: 'curved', direction: 'up', mag: 0.8 },
            s: { style: 'curved', direction: 'down', mag: 0.8 },
          },
        },
        13: {
          content: ['m_2', 'erry', 'equals', 'xmas'],
          alignment: {
            fixTo: [0, 0],
          },
        },
      },
    },
  },
]);

const descriptions = [
  ['Multiply both sides by |r||2|'],
  'Cancel |r||2|   terms',
  [
    'As both sides are equal, then any value raised',
    'to the power of either side must also be equal',
  ],
  'Raise Euler\'s number |e| to both sides',
  'Cancel |e| to the power of |log||sube|',
  'Muliply both sides by |m|',
  'Cancel |m| terms',
  '|r||2|   is the same as |r|\u00d7|r|',
  [
    'Multiplication is commutative',
    {
      text: 'Multiplication can happen in any order',
      font: { size: 0.06 },
    },
  ],
  ['Happy Holidays!!'],
];

const modifiers = {
  2: { text: '2', offset: [0.01, 0.03], inLine: false, font: { size: 0.07, family: 'Times New Roman' } },
  e: { font: { family: 'Times New Roman', style: 'italic' } },
  r: { font: { family: 'Times New Roman', style: 'italic' } },
  m: { font: { family: 'Times New Roman', style: 'italic' } },
  log: { font: { family: 'Times New Roman' } },
  sube: {
    text: 'e', offset: [0, -0.03], inLine: false, font: { size: 0.07, family: 'Times New Roman', style: 'italic' },
  },
};

const slides = [
  { description: 0, form: '0' },
  { description: 0, form: '1' },
  { description: 1, form: '1' },
  { description: 1, form: '2' },
  { description: 1, form: '3' },
  { description: 2, form: '3' },
  { description: 3, form: '3' },
  { description: 3, form: '4' },
  { description: 4, form: '4' },
  { description: 4, form: '5' },
  { description: 4, form: '6' },
  { description: 5, form: '6' },
  { description: 5, form: '7' },
  { description: 6, form: '7' },
  { description: 6, form: '8' },
  { description: 6, form: '9' },
  { description: 7, form: '9' },
  { description: 7, form: '10' },
  { description: 7, form: '11' },
  { description: 8, form: '11' },
  { description: 8, form: '12' },
  { description: 9, form: '13' },
];

// Slide management
let slideIndex = 0;
const nextButton = figure.getElement('nextButton');
const prevButton = figure.getElement('prevButton');
const description = figure.getElement('description');
const eqn = figure.getElement('eqn');

const showSlide = (index) => {
  const slide = slides[index];
  if (index === 0) {
    eqn.goToForm({ form: slide.form, animate: 'dissolve' });
  } else {
    eqn.goToForm({ form: slide.form, animate: 'move' });
  }
  description.stop();
  description.custom.updateText({
    text: descriptions[slide.description],
    modifiers,
  });
  if (slide.shapeState != null) {
    slide.shapeState();
  }
  if (index === 0) {
    prevButton.setOpacity(0.7);
    prevButton.isTouchable = false;
  } else if (prevButton.isTouchable === false) {
    prevButton.setOpacity(1)
    prevButton.isTouchable = true;
  }
};

nextButton.onClick = () => {
  if (eqn.eqn.isAnimating) {
    eqn.stop('complete');
    return;
  }
  const oldDescription = slides[slideIndex].description;
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);
  const newDescription = slides[slideIndex].description;
  if (newDescription != oldDescription) {
    description.animations.new()
      .dissolveIn(0.2)
      .start();
  }
};

prevButton.onClick = () => {
  if (eqn.eqn.isAnimating) {
    eqn.stop('complete');
    return;
  }
  slideIndex = (slideIndex - 1) < 0 ? slides.length - 1 : slideIndex - 1;
  showSlide(slideIndex);
};

showSlide(0);
