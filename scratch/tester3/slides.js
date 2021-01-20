/* globals figure, layout */

function addSlides() {
  const nav = figure.getElement('nav');
  const medium = figure.getElement('medium');
  const medium1 = figure.getElement('medium1');
  const medium2 = figure.getElement('medium2');
  // const title = figure.getElement('title');
  const sideEqn = figure.getElement('sideEqn');
  const eqn = figure.getElement('eqn');

  const slides = [];

  let lastDisturbance = 0;
  let timerId = null;

  const stopDisturbances = () => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
  };
  const disturb = (med) => {
    if (Array.isArray(med)) {
      med.forEach(m => layout.pulse(m, 0.6));
    } else {
      layout.pulse(med, 0.6);
    }
    lastDisturbance = layout.time.now();
    // stopDisturbances();
    // startDisturbances();
  };

  const startDisturbances = (m, timeTillNext = 10) => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
    const now = layout.time.now();
    if (now - lastDisturbance > timeTillNext) {
      disturb(m);
    }
    timerId = setTimeout(() => {
      startDisturbances(m, timeTillNext);
    }, 1000);
  };

  medium.custom.movePad.subscriptions.add('setTransform', () => {
    if (medium.custom.movePad.state.isBeingMoved) {
      // stopDisturbances();
      lastDisturbance = layout.time.now();
    }
  });

  medium1.custom.movePad.subscriptions.add('setTransform', () => {
    if (medium1.custom.movePad.state.isBeingMoved) {
      // stopDisturbances();
      lastDisturbance = layout.time.now();
    }
  });

  medium2.custom.movePad.subscriptions.add('setTransform', () => {
    if (medium2.custom.movePad.state.isBeingMoved) {
      // stopDisturbances();
      lastDisturbance = layout.time.now();
    }
  });

  const modifiersCommon = {
    x: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    f: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    y: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    t: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    v: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    k: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    1: {
      font: { family: 'Times New Roman', size: 0.09 },
      offset: [0, -0.03],
    },
    0: {
      font: { family: 'Times New Roman', size: 0.09 },
      offset: [0, -0.03],
    },
    r0: {
      text: '0',
      font: { family: 'Times New Roman', size: 0.09, color: color0 },
      offset: [0, -0.03],
    },
    b1: {
      text: '1',
      font: { family: 'Times New Roman', size: 0.09, color: color1 },
      offset: [0, -0.03],
    },
    disturbance: {
      onClick: () => disturb(medium),
      font: { color: color1 },
      touchBorder: 0.1,
    },
    'first particle': {
      onClick: () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 }),
      font: { color: color0 },
      touchBorder: 0.15,
    },
    x1: {
      text: 'x',
      font: {
        family: 'Times New Roman', style: 'italic', size: 0.17, color: color1,
      },
      onClick: () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 }),
      touchBorder: 0.15,
    },
  };
  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiersCommon,
    showCommon: ['medium'],
    show: 'title',
    scenario: ['title'],
    form: 'title',
    steadyState: () => {
      medium.custom.balls.dim();
      layout.reset();
      layout.unpause();
      medium.custom.recording.reset((timeStep, num) => {
        const y = Array(num);
        for (let i = 0; i < num; i += 1) {
          y[i] = 0.6 * 0.8 * Math.sin(2 * Math.PI * 0.2 * (timeStep * i) + Math.PI);
        }
        return y.reverse();
      });
      layout.sineWave(medium);
    },
    leaveState: () => {
      layout.reset();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    scenarioCommon: ['default'],
    modifiers: {
      disturbance: {
        onClick: () => disturb(medium),
        font: { color: color1 },
        touchBorder: 0.15,
      },
    },
    text: [
      'A wave is a |disturbance| that propagates through a medium or field',
      'with some velocity.',
      {
        text: 'Touch the word |disturbance| or manually move the |first particle|.',
        font: { size: 0.08 },
        lineSpace: 0.2,
      },
    ],
    form: null,
    enterStateCommon: () => {
      medium.custom.movePad.setMovable(true);
      medium.custom.balls.highlight(['ball0']);
      layout.unpause();
    },
    steadyState: () => {
      disturb(medium);
      startDisturbances(medium);
    },
    leaveState: () => stopDisturbances(),
    leaveStateCommon: () => {
      stopDisturbances();
      medium.custom.balls.undim();
    },
  });

  const action = (text, onClick, touchBorder = 0, color = color1) => ({
    text, font: { color }, onClick, touchBorder,
  });
  const pulse = (text, element, scale = 1.5, touchBorder = 0, xAlign = 'center', yAlign = 'middle', color = color1) => ({
    text,
    font: { color },
    touchBorder,
    onClick: () => figure.getElement(element).pulse({ scale, xAlign, yAlign }),
  });
  const highlight = (text) => ({
    text, font: { style: 'italic' },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    scenarioCommon: ['default'],
    modifiers: {
      disturbance: action('disturbance', () => disturb([medium1, medium2]), 0.15),
    },
    text: [
      'The velocity of the |disturbance| changes how the disturbance is',
      'distirbuted in space.',
    ],
    form: null,
    showCommon: ['medium1', 'medium2', 'timePlot1', 'timePlot2', 'vFast', 'vSlow'],
    scenario: 'default',
    steadyState: () => {
      disturb([medium1, medium2]);
      startDisturbances([medium1, medium2], 5.5);
    },
    leaveStateCommon: () => {
      stopDisturbances();
      medium.custom.balls.undim();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      fast: pulse('fast', 'vFast', 2.5, 0.05, 'right'),
      slow: pulse('slow', 'vSlow', 2.5, 0.05, 'right'),
      slowing: pulse('slowing', 'slowTimeButton', 1.8, 0.05, 0.3, 0.3),
      freezing: pulse('freezing', 'freezeTimeButton', 1.8, 0.05, 0.3, 0.3),
      Pulse: action('Pulse', () => disturb([medium1, medium2]), 0.03),
      particle: action('particle', () => {
        medium1.custom.ball0.pulse({ scale: 4 });
        medium2.custom.ball0.pulse({ scale: 4 });
      }, 0.03, color0),
    },
    text: [
      '|Pulse| a disturbance, or drag the first |particle|. Compare |fast| and',
      '|slow| disturbance velocities while |slowing| or |freezing| time.',
    ],
    showCommon: ['medium1', 'medium2', 'timePlot1', 'timePlot2', 'vFast', 'vSlow', 'freezeTimeButton', 'slowTimeButton', 'slowTimeLabel', 'freezeTimeLabel'],
    scenario: 'default',
    steadyState: () => {
      startDisturbances([medium1, medium2], 5.5);
    },
    leaveStateCommon: () => {
      stopDisturbances();
      medium.custom.balls.undim();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      faster: pulse('faster', 'vFast', 2.5, 0.05, 'right'),
      disturbance: action('disturbance', () => disturb([medium1, medium2]), 0.03),
      'spread out': highlight('spread out'),
    },
    text: [
      'And so we see, for |faster| velocities, the |disturbance| is more  ',
      '|spread out| in space.',
    ],
    steadyState: () => {
      startDisturbances([medium1, medium2], 5.5);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: [
      'The |disturbance| moves with a velocity |v|.',
      '',
      {
        text: 'Thus, the time it takes to move some distance |x||1| can be calculated.',
        // lineSpace: 0.2,
      },
    ],
    steadyState: () => {
      startDisturbances(medium);
    },
    leaveState: () => stopDisturbances(),
  });
  slides.push({
    fromForm: null,
    form: 't1',
    steadyState: () => {
      startDisturbances(medium);
    },
    leaveState: () => stopDisturbances(),
  });
  slides.push({
    form: null,
    transition: (done) => {
      sideEqn.showForm('t1');
      sideEqn.animations.new()
        .scenario({ target: 'side', duration: 2 })
        .goToForm({ target: 't11', animate: 'move' })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
      startDisturbances(medium);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      x0: {
        text: 'x',
        font: {
          family: 'Times New Roman', style: 'italic', size: 0.17, color: color0,
        },
        onClick: () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 }),
        touchBorder: 0.2,
      },
    },
    text: [
      'Now, let\'s say we know the |disturbance| as a function of time at |x0||r0|.',
      '',
    ],
    show: ['x0'],
    steadyState: () => {
      eqn.getElement('x0Box').onClick = () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 });
      startDisturbances(medium);
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
    },
  });
  slides.push({
    fromForm: null,
    form: 'yx0t',
    show: ['x0'],
    enterState: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
    },
    steadyState: () => {
      eqn.getElement('x0Box').onClick = () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 });
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
      startDisturbances(medium);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      x0: {
        text: 'x',
        font: {
          family: 'Times New Roman', style: 'italic', size: 0.17, color: color0,
        },
        onClick: () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 }),
        touchBorder: 0.15,
      },
    },
    text: [
      'Then the |disturbance| at |x1||b1| is the disturbance at |x0||r0| from time |t||1| ago.',
    ],
    show: ['x0', 'x1'],
    enterStateCommon: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
      medium.custom.balls.highlight(['ball0', 'ball40']);
      eqn.getElement('x0Box').onClick = () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 });
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
    },
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  slides.push({
    show: ['x0', 'x1'],
    fromForm: 'yx0t',
    form: 'yx0tAndft',
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  slides.push({
    show: ['x0', 'x1'],
    fromForm: 'yx0tAndft',
    form: 'yx1tTemp',
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      one: {
        text: '(1)',
        font: {
          family: 'Times New Roman', size: 0.17,
        },
        onClick: () => sideEqn.pulse({ xAlign: 'right' }),
        touchBorder: 0.15,
      },
    },
    text: [
      'We can now substitute in equation |one|.',
    ],
    form: 'yx1t',
    show: ['x0', 'x1'],
    enterStateCommon: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
      medium.custom.balls.highlight(['ball0', 'ball40']);
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
      eqn.getElement('x1Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
    },
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  slides.push({
    show: ['x0', 'x1'],
    fromForm: 'yx1t',
    form: 'yx1tSub',
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  slides.push({
    show: ['x0', 'x1'],
    fromForm: 'yx1tSub',
    form: 'yx1tx1',
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      one: {
        text: '(1)',
        font: {
          family: 'Times New Roman', size: 0.17,
        },
        onClick: () => sideEqn.pulse({ xAlign: 'right' }),
        touchBorder: 0.15,
      },
    },
    text: [
      '|x1||b1| can be any point, and so we can generalize it by simply calling it |x|.',
    ],
    show: ['x0', 'x1'],
    enterStateCommon: () => {
      // sideEqn.showForm('t11');
      // sideEqn.setScenario('side');
      medium.custom.balls.highlight(['ball0', 'ball40']);
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
      eqn.getElement('x1Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
    },
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  slides.push({
    show: ['x0', 'x1'],
    fromForm: 'yx1tx1',
    form: 'yxtx',
    steadyState: () => {
      startDisturbances(medium);
    },
  });



  nav.loadSlides(slides);
  nav.goToSlide(2);
}

addSlides();
// nav.goToSlide()