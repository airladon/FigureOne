// // const { polygon } = Fig.tools.g2;
const { Figure, tools, range } = Fig;
const figure = new Figure({
  color: tools.color.HexToArray('#212529'),
  backgroundColor: tools.color.HexToArray('#f6f7f7'),
});

const questionInstanceIn = [
  [['27', 'T1']],
  [['2', 'T2']],
  [['7', 'T3']],
  [['20', 'T4']],
  [['7', 'T3']],
  [['20', 'T4'], ['+', 'T5'], ['7', 'T3']],
  [['27', 'T1']],
];

const instructionsIn = [
  ['In the number ', 'Q1', ', the first digit ', 'Q2', ' tells us how many <strong>tens</strong> there are in the number, while the second digit ', 'Q3', ' tells us how many <strong>ones</strong> there are in the number'],
  ['Q4'],
  ['Q5'],
  ['Q6'],
  ['So the number ', 'Q1', ' can be thought of as being made of ', 'Q2', ' <strong>tens</strong> and ', 'Q3', ' <strong>ones</strong>'],
];

const mediumIn = 'SYM | SYM | SYM | NCN | NCN | SYM | NCN';

/**
 * Create a number blocks equation element.
 */
function makeBlocks(num) {
  return figure.add({
    make: 'collection',
    elements: range(0, num - 1).map(n => ({
      make: 'rectangle',
      width: 0.07,
      height: 0.07,
      yAlign: 'bottom',
      xAlign: 'left',
      position: [(n % 10) * 0.1, 0.03 + Math.floor(n / 10) * 0.1],
    })),
  });
}

/**
 * Create an equation element based on the medium
 */
function getEquationElement(value, medium) {
  if (medium === 'NCN') {
    return makeBlocks(parseInt(value, 10));
  }
  return value;
}

// Convert the medium to an array
const medium = mediumIn.split(' | ');

// Populate equation elements and equation phrases
const phrases = {};
const phraseIndexes = [];
const elements = {};
questionInstanceIn.forEach((questionInstance, index) => {
  const phrase = [];
  questionInstance.forEach((questionElement) => {
    const [value, id] = questionElement;
    const idMedium = `${id}${medium[index]}`;
    elements[idMedium] = getEquationElement(value, medium[index]);
    phrase.push(idMedium);
  });
  const phraseId = `P${index}`;
  phrases[phraseId] = phrase;
  phraseIndexes.push(phraseId);
});

// Parse "Qx" instructions
function getQ(text) {
  if (text[0] !== 'Q' || isNaN(text.slice(1))) {
    return -1;
  }
  return parseInt(text.slice(1), 10) - 1;
}

// Create equation forms
const forms = {};
instructionsIn.forEach((step, index) => {
  const instruction = [];
  step.forEach((stepComponent, index2) => {
    const qIndex = getQ(stepComponent);
    if (qIndex === -1) {
      const splitStepComponent = stepComponent.split(/\<strong\>|\<\/strong\>/);
      splitStepComponent.forEach((s, i) => {
        const id = `I${index}-${index2}-${i}`;
        if (i % 2 === 0) {
          elements[id] = { text: s };
        } else {
          elements[id] = { text: s, weight: 'bold', color: [0, 0, 1, 1] };
        }
        instruction.push(id);
      })
    } else {
      instruction.push(phraseIndexes[qIndex]);
    }
  });
  forms[index] = (instruction);
});

const eqn = figure.add({
  make: 'collections.equation',
  elements,
  phrases,
  forms,
  position: [0, 0],
  scale: 0.2,
  textFont: { style: 'normal' },
  formDefaults: { alignment: { xAlign: 'center' } },
});

const next = figure.add({
  make: 'collections.button', label: { text: 'Next', font: { size: 0.07 } }, position: [0, -0.2],
});

next.notifications.add('touch', () => eqn.animations.new().nextForm(1).start());

