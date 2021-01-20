/* globals figure, layout, color0, color1 */

function addSlides() {
  const nav = figure.getElement('nav');
  const medium = figure.getElement('medium');
  const medium1 = figure.getElement('medium1');
  const medium2 = figure.getElement('medium2');
  // const title = figure.getElement('title');
  const sideEqn = figure.getElement('sideEqn');
  const eqn = figure.getElement('eqn');
  const slowTimeButton = figure.getElement('slowTimeButton');
  const freezeTimeButton = figure.getElement('freezeTimeButton');
  const ballx0 = medium.custom.balls.getElement('ball0');
  const ballx1 = medium.custom.balls.getElement('ball40');

  const slides = [];

  let lastDisturbance = layout.time.now() - 100;
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

  const startDisturbances = (m, timeTillNext = 10, immediately = true) => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
    const now = layout.time.now();
    if (now - lastDisturbance > timeTillNext || immediately) {
      disturb(m);
    }
    timerId = setTimeout(() => {
      startDisturbances(m, timeTillNext, false);
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
      onClick: () => ballx0.pulse({ scale: 4 }),
      font: { color: color0 },
      touchBorder: 0.15,
    },
    x1: {
      text: 'x',
      font: {
        family: 'Times New Roman', style: 'italic', size: 0.17, color: color1,
      },
      onClick: () => ballx1.pulse({ scale: 4 }),
      touchBorder: 0.15,
    },
  };
  // ///////////////////////////////////////////////////////////////////////////
  /*
  .......########.####.########.##.......########
  ..........##.....##.....##....##.......##......
  ..........##.....##.....##....##.......##......
  ..........##.....##.....##....##.......######..
  ..........##.....##.....##....##.......##......
  ..........##.....##.....##....##.......##......
  ..........##....####....##....########.########
  */
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
      layout.reset();
      startDisturbances(medium, 10, true);
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
  const highlight = text => ({
    text, font: { style: 'italic' },
  });

  // ///////////////////////////////////////////////////////////////////////////
  /*
  .......##.....##.########.##........#######...######..####.########.##....##
  .......##.....##.##.......##.......##.....##.##....##..##.....##.....##..##.
  .......##.....##.##.......##.......##.....##.##........##.....##......####..
  .......##.....##.######...##.......##.....##.##........##.....##.......##...
  ........##...##..##.......##.......##.....##.##........##.....##.......##...
  .........##.##...##.......##.......##.....##.##....##..##.....##.......##...
  ..........###....########.########..#######...######..####....##.......##...
  */
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
    steadyState: (index, from) => {
      if (from === 'prev') {
        layout.reset();
        startDisturbances([medium1, medium2], 5.5, true);
      } else {
        startDisturbances([medium1, medium2], 5.5, false);
      }
    },
    leaveStateCommon: () => {
      stopDisturbances();
      medium.custom.balls.undim();
      layout.normalMotion();
      layout.unpause();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      fast: pulse('fast', 'vFast', 2.5, 0.05, 'right'),
      slow: pulse('slow', 'vSlow', 2.5, 0.05, 'right'),
      slowing: action('slowing', () => {
        slowTimeButton.click();
        slowTimeButton.pulse({ scale: 1.7, xAlign: 0.2, yAlign: 0.3 });
      }, 0.05),
      freezing: action('freezing', () => {
        freezeTimeButton.click();
        freezeTimeButton.pulse({ scale: 1.7, xAlign: 0.3, yAlign: 0.3 });
      }, 0.05),
      disturbance: action('disturbance', () => disturb([medium1, medium2]), 0.03),
      particle: action('particle', () => {
        medium1.custom.ball0.pulse({ scale: 4 });
        medium2.custom.ball0.pulse({ scale: 4 });
      }, 0.03, color0),
    },
    text: [
      'Create a |disturbance|, or drag the first |particle|. Compare |fast| and',
      '|slow| disturbance velocities while |slowing| or |freezing| time.',
    ],
    showCommon: ['medium1', 'medium2', 'timePlot1', 'timePlot2', 'vFast', 'vSlow', 'freezeTimeButton', 'slowTimeButton', 'slowTimeLabel', 'freezeTimeLabel'],
    scenario: 'default',
    steadyState: () => {
      startDisturbances([medium1, medium2], 5.5, false);
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
    steadyState: (index, from) => {
      if (from === 'prev') {
        startDisturbances([medium1, medium2], 5.5, false);
      } else {
        layout.reset();
        startDisturbances([medium1, medium2], 5.5, true);
      }
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  /*
  .......########.####.##.....##.########
  ..........##.....##..###...###.##......
  ..........##.....##..####.####.##......
  ..........##.....##..##.###.##.######..
  ..........##.....##..##.....##.##......
  ..........##.....##..##.....##.##......
  ..........##....####.##.....##.########
  */
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      disturbance: action('disturbance', () => disturb(medium), 0.1),
      when: highlight('when'),
      position: action('position', () => ballx1.pulse({ scale: 4 })),
    },
    text: [
      'The velocity also determines |when| the |disturbance| will reach some |position|.',
    ],
    showCommon: ['medium'],
    enterStateCommon: () => {
      medium.custom.balls.highlight(['ball0', 'ball40']);
      medium.custom.movePad.setMovable(true);
      layout.unpause();
    },
    steadyState: (index, from) => {
      if (from === 'prev') {
        layout.reset();
        startDisturbances(medium, 10, true);
      } else {
        startDisturbances(medium, 10, false);
      }
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      disturbance: action('disturbance', () => disturb(medium), 0.1),
      when: highlight('when'),
    },
    text: [
      'If the |disturbance| travels with velocity |v|, then the time it takes',
      'to travel distance |x1||b1| can be calculated.',
    ],
    showCommon: ['medium', 'x1'],
    steadyState: () => {
      startDisturbances(medium, 10, false);
    },
  });

  slides.push({
    fromForm: null,
    form: 't1',
    steadyState: () => {
      startDisturbances(medium, 10, false);
    },
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
      startDisturbances(medium, 10, false);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  /*
  .##....##......###....##.....##...#####......###..
  ..##..##......##.......##...##...##...##.......##.
  ...####......##.........##.##...##.....##.......##
  ....##.......##..........###....##.....##.......##
  ....##.......##.........##.##...##.....##.......##
  ....##........##.......##...##...##...##.......##.
  ....##.........###....##.....##...#####......###..
  */
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
      startDisturbances(medium, 10, false);
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
    },
  });
  slides.push({
    fromForm: null,
    form: 'yx0t',
    showCommon: ['medium', 'x0', 'x1'],
    enterState: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
    },
    steadyState: () => {
      eqn.getElement('x0Box').onClick = () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 });
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
      startDisturbances(medium, 10, false);
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
    // show: ['x0', 'x1'],
    enterStateCommon: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
      medium.custom.balls.highlight(['ball0', 'ball40']);
      eqn.getElement('x0Box').onClick = () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 });
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
    },
    steadyState: () => {
      startDisturbances(medium, 10, false);
    },
  });

  slides.push({
    // show: ['x0', 'x1'],
    fromForm: 'yx0t',
    form: 'yx0tAndft',
    steadyState: () => {
      startDisturbances(medium, 10, false);
    },
  });

  slides.push({
    // show: ['x0', 'x1'],
    fromForm: 'yx0tAndft',
    form: 'yx1tTemp',
    steadyState: () => {
      startDisturbances(medium, 10, false);
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
    // show: ['x0', 'x1'],
    enterStateCommon: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
      medium.custom.balls.highlight(['ball0', 'ball40']);
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
      eqn.getElement('x1Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
    },
    steadyState: () => {
      startDisturbances(medium, 10, false);
    },
  });

  slides.push({
    // show: ['x0', 'x1'],
    fromForm: 'yx1t',
    form: 'yx1tSub',
    steadyState: () => {
      startDisturbances(medium, 10, false);
    },
  });

  slides.push({
    // show: ['x0', 'x1'],
    fromForm: 'yx1tSub',
    form: 'yx1tx1',
    steadyState: () => {
      startDisturbances(medium, 10, false);
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
    form: 'yx1tx1HiddenX',
    // show: ['x0', 'x1'],
    enterStateCommon: () => {
      // sideEqn.showForm('t11');
      // sideEqn.setScenario('side');
      medium.custom.balls.highlight(['ball0', 'ball40']);
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
      eqn.getElement('x1Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
    },
    steadyState: () => {
      startDisturbances(medium, 10, false);
    },
  });

  slides.push({
    showCommon: ['medium', 'x0'],
    fromForm: 'yx1tx1HiddenX',
    form: 'yxtx',
    enterStateCommon: () => {
      medium.custom.balls.highlight(['ball0']);
    },
    steadyState: () => {
      startDisturbances(medium, 10, false);
    },
  });

  nav.loadSlides(slides);
  nav.goToSlide(17);
}

addSlides();
// nav.goToSlide()
