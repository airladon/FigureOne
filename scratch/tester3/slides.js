/* globals figure, layout, color0, color1, colorText */

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
  const arrow1 = figure.getElement('arrow1');
  const arrow2 = figure.getElement('arrow2');

  eqn.getElement('x1Box1').onClick = () => ballx1.pulse({ scale: 4 });
  eqn.getElement('x1Box2').onClick = () => ballx1.pulse({ scale: 4 });
  eqn.getElement('x0Box1').onClick = () => ballx0.pulse({ scale: 4 });
  eqn.getElement('x0Box2').onClick = () => ballx0.pulse({ scale: 4 });
  eqn.getElement('x0Box3').onClick = () => ballx0.pulse({ scale: 4 });
  sideEqn.getElement('x1Box').onClick = () => ballx1.pulse({ scale: 4 });

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
      lastDisturbance = layout.time.now();
    }
  });

  medium1.custom.movePad.subscriptions.add('setTransform', () => {
    if (medium1.custom.movePad.state.isBeingMoved) {
      lastDisturbance = layout.time.now();
    }
  });

  medium2.custom.movePad.subscriptions.add('setTransform', () => {
    if (medium2.custom.movePad.state.isBeingMoved) {
      lastDisturbance = layout.time.now();
    }
  });

  const action = (text, onClick, touchBorder = 0, color = color1) => ({
    text, font: { color }, onClick, touchBorder,
  });
  const actionMath = (text, onClick, touchBorder = 0, color = color1) => ({
    text,
    font: {
      family: 'Times New Roman', style: 'italic', size: 0.17, color,
    },
    onClick,
    touchBorder,
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
  const math = (text, color = colorText) => ({
    text,
    font: {
      family: 'Times New Roman', style: 'italic', size: 0.17, color,
    },
  });
  const subMath = (text, color = colorText) => ({
    text,
    font: {
      family: 'Times New Roman', style: 'italic', size: 0.09, color,
    },
    offset: [0, -0.03],
  });

  const modifiersCommon = {
    x: math('x'),
    f: math('f'),
    y: math('y'),
    t: math('t'),
    v: math('v'),
    k: math('k'),
    1: subMath('1'),
    0: subMath('1'),
    r0: subMath('0', color0),
    b1: subMath('1', color1),
    disturbance: action('disturbance', () => disturb(medium), 0.03),
    'first particle': action('first particle', () => medium.custom.ball0.pulse({ scale: 4 }), 0.15, color0),
    x1: actionMath('x', () => ballx1.pulse({ scale: 4 }, 0.15, color1)),
    x0: actionMath('x', () => ballx0.pulse({ scale: 4 }), 0.2, color0),
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
  /*
  ..######..########.########.##.....##.########.
  .##....##.##..........##....##.....##.##.....##
  .##.......##..........##....##.....##.##.....##
  ..######..######......##....##.....##.########.
  .......##.##..........##....##.....##.##.......
  .##....##.##..........##....##.....##.##.......
  ..######..########....##.....#######..##.......
  */
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    scenarioCommon: ['default'],
    modifiers: {
      string: action('string', () => medium.custom.balls.pulse({
        translation: 0.02, angle: Math.PI / 2, min: -0.02, frequency: 3,
      })),
      particle: action('particle', () => medium.custom.ball0.pulse({ scale: 4 }), 0.15, color0),
      medium: highlight('medium'),
      disturbing: highlight('disturbing'),
    },
    text: [
      'This |string| of connected particles represent a |medium|. Moving or',
      '|disturbing| one |particle| pulls its neighbor in the same direction.',
    ],
    form: null,
    enterStateCommon: () => {
      medium.custom.movePad.setMovable(true);
      medium.custom.balls.highlight(['ball0']);
      layout.unpause();
    },
    steadyState: () => {
      layout.reset();
      // startDisturbances(medium, 10, true);
    },
    // leaveState: () => stopDisturbances(),
    leaveState: () => {
      medium.custom.balls.undim();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    // modifiers: {
    // },
    text: [
      'How quickly particles pull their neighbors defines how quickly the',
      '|disturbance| propagates through the medium.',
    ],
    enterStateCommon: () => {
      medium.custom.movePad.setMovable(true);
      medium.custom.balls.highlight(['ball0']);
      layout.unpause();
    },
    steadyState: () => {
      layout.reset();
      startDisturbances(medium, 10, true);
    },
    // leaveState: () => stopDisturbances(),
    leaveStateCommon: () => {
      stopDisturbances();
      medium.custom.balls.undim();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      wave: highlight('wave'),
      velocity: highlight('velocity'),
    },
    text: [
      'A |wave| is a |disturbance| that propagates through a medium or field',
      'with some |velocity|.',
      // {
      //   text: 'Touch the word |disturbance| or manually move the |first particle|.',
      //   font: { size: 0.08 },
      //   lineSpace: 0.2,
      // },
    ],
    steadyStateCommon: () => {
      startDisturbances(medium, 10, false);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  /*
  .##.....##.########.##........#######...######..####.########.##....##
  .##.....##.##.......##.......##.....##.##....##..##.....##.....##..##.
  .##.....##.##.......##.......##.....##.##........##.....##......####..
  .##.....##.######...##.......##.....##.##........##.....##.......##...
  ..##...##..##.......##.......##.....##.##........##.....##.......##...
  ...##.##...##.......##.......##.....##.##....##..##.....##.......##...
  ....###....########.########..#######...######..####....##.......##...
  */
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      wave: highlight('wave'),
    },
    text: [
      'The velocity of the |disturbance| changes how the disturbance is',
      'distributed in space.',
    ],
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      'two mediums': highlight('two mediums'),
      different: highlight('different'),
    },
    text: [
      'To see this, let\'s look at |two mediums| where disturbances propagate',
      'with |different| velocities.',
    ],
  });

  slides.push({
    showCommon: ['medium1', 'medium2', 'vFast', 'vSlow'],
    steadyStateCommon: (index, from) => {
      if (from === 'prev') {
        layout.reset();
        startDisturbances([medium1, medium2], 5.5, true);
      } else {
        startDisturbances([medium1, medium2], 5.5, false);
      }
    },
  });

  slides.push({
    modifiers: {
      'first particle': action('first particle', () => {
        medium1.custom.ball0.pulse({ scale: 4 });
        medium2.custom.ball0.pulse({ scale: 4 });
      }, 0.03, color0),
      disturbance: action('disturbance', () => disturb([medium1, medium2]), 0.03),
    },
    text: [
      'To help compare, we can plot the disturbance of the |first particle|',
      'over time to see both mediums are being |disturbed| in the same way.',
    ],
    steadyStateCommon: () => {
      startDisturbances([medium1, medium2], 5.5, false);
    },
  });

  slides.push({
    showCommon: ['medium1', 'medium2', 'timePlot1', 'timePlot2', 'vFast', 'vSlow'],
    steadyStateCommon: (index, from) => {
      if (from === 'prev') {
        layout.reset();
        startDisturbances([medium1, medium2], 5.5, true);
      } else {
        startDisturbances([medium1, medium2], 5.5, false);
      }
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
    steadyStateCommon: () => {
      startDisturbances([medium1, medium2], 5.5, false);
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
      faster: pulse('faster', 'vFast', 2.5, 0.05, 'right'),
      disturbance: action('disturbance', () => disturb([medium1, medium2]), 0.03),
    },
    text: [
      'For a |faster| velocity, when the |disturbance| finishes the start of the',
      'disturbance has travelled |further| from the source.',
    ],
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
      'As such, for |faster| velocities, the |disturbance| is wider, or',
      'more |spread out| in space.',
    ],
    steadyStateCommon: (index, from) => {
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
      'The velocity also determines |when| the |disturbance| will reach a |position|.',
    ],
    showCommon: ['medium'],
    enterStateCommon: () => {
      medium.custom.balls.highlight(['ball0', 'ball40']);
      medium.custom.movePad.setMovable(true);
      layout.unpause();
    },
    steadyStateCommon: (index, from) => {
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
    steadyStateCommon: () => {
      startDisturbances(medium, 10, false);
    },
  });

  slides.push({ fromForm: null, form: 't1' });

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
    steadyStateCommon: () => {
      startDisturbances(medium, 10, false);
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
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
    text: 'Now, let\'s say we know the |disturbance| as a function of time at |x0||r0|.',
    showCommon: ['medium', 'x0', 'x1'],
    enterStateCommon: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
      medium.custom.balls.highlight(['ball0', 'ball40']);
    },
    steadyStateCommon: () => {
      startDisturbances(medium, 10, false);
    },
  });

  slides.push({ fromForm: null, form: 'yx0t' });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: 'Then the |disturbance| at |x1||b1| is the disturbance at |x0||r0| from time |t||1| ago.',
  });

  slides.push({ fromForm: 'yx0t', form: 'yx0tAndft' });
  slides.push({ fromForm: 'yx0tAndft', form: 'yx1tTemp' });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      one: action('(1)', () => sideEqn.pulse({ xAlign: 'right' }), 0.15),
    },
    text: 'We can now substitute in equation |one|.',
    form: 'yx1t',
  });

  slides.push({ fromForm: 'yx1t', form: 'yx1tSub' });
  slides.push({ fromForm: 'yx1tSub', form: 'yx1tx1' });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: '|x1||b1| can be any point, and so we can generalize it by simply calling it |x|.',
    form: 'yx1tx1HiddenX',
  });

  slides.push({
    modifiers: {
      x1: actionMath('x', () => {}, 0, colorText),
      b1: subMath('1'),
    },
    showCommon: ['medium', 'x0'],
    fromForm: 'yx1tx1HiddenX',
    form: 'yxtx',
    enterStateCommon: () => {
      medium.custom.balls.highlight(['ball0']);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      f: actionMath(
        'f', () => eqn.pulse({ elements: ['f_2', 'rx2', 'r02'], centerOn: 'f_2', xAlign: 2 }), 0.05, color0,
      ),
      function: action(
        'function', () => eqn.pulse({
          elements: [
            'f_2', 'lb5', 'rb5', 't_3', 'min2', 'x_2', 'vin1', 'v_1', 'rx2', 'r02',
          ],
          centerOn: 'f_2',
        }), 0.15,
      ),
      space: action('space', () => eqn.pulse({ elements: ['x_1', 'x_2'] }), 0.05, color1),
      time: action('time', () => eqn.pulse({ elements: ['t_y3', 't_3'] }), 0.05, color1),
    },
    text: [
      'If we know the time dependent disturbance |f| at |x0||r0|, then this ',
      '|function| tells us the disturbance at any point in |space|, at any |time|.',
    ],
    form: 'yxtx',
  });

  // ///////////////////////////////////////////////////////////////////////////
  /*
  ..######..####.##....##.########
  .##....##..##..###...##.##......
  .##........##..####..##.##......
  ..######...##..##.##.##.######..
  .......##..##..##..####.##......
  .##....##..##..##...###.##......
  ..######..####.##....##.########
  */
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      sine: highlight('sine'),
      'initial disturbance': action(
        'initial disturbance',
        () => eqn.pulse({ elements: ['f_2', 'rx2', 'r02'], centerOn: 'f_2', xAlign: 2 }),
        0.05, color0,
      ),
    },
    showCommon: [],
    text: 'Now, let\'s make our |initial disturbance| a |sine| function.',
  });
  slides.push({ fromForm: 'yxtx', form: 'yxtxAndSine' });
  slides.push({
    modifiers: {
      input: action(
        'input', () => eqn.pulse({
          elements: [
            't_3', 'min2', 'x_2', 'vin1', 'v_1',
          ],
          centerOn: 'min2',
          translation: 0.02,
          angle: Math.PI / 2,
          min: -0.02,
          frequency: 3,
        }), 0.15,
      ),
    },
    text: 'And substitute the |input|.',
  });

  const setArrows = () => {
    arrow1.pointFromTo(
      { element: eqn.getElement('bBrace'), space: 0.05 },
      { element: eqn.getElement('t_1'), space: 0.1 },
    );
    arrow2.pointFromTo(
      { element: eqn.getElement('bBrace'), space: 0.05 },
      { element: eqn.getElement('t_4'), space: 0.05 },
    );
  };

  slides.push({
    fromForm: 'yxtxAndSine',
    form: 'yxtxAndSineBotCom',
    transition: (done) => {
      eqn.animations.new()
        .goToForm({ target: 'yxtxAndSineBotCom', animate: 'move' })
        .trigger({
          callback: () => {
            setArrows();
            arrow1.showAll();
            arrow2.showAll();
          },
        })
        .inParallel([
          arrow1.animations.length({ start: 0, duration: 0.8 }),
          arrow2.animations.length({ start: 0, duration: 0.8 }),
        ])
        .trigger({
          callback: () => {
            eqn.getElement('t_4').setColor(color1);
            eqn.getElement('t_1').setColor(color1);
            // eqn.pulse({ elements: ['t_1', 't_4'], duration: 1, scale: 1.3 });
          },
          // duration: 1,
        })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      setArrows();
      arrow1.showAll();
      arrow2.showAll();
      eqn.getElement('t_4').setColor(color1);
      eqn.getElement('t_1').setColor(color1);
    },
    leaveState: () => {
      eqn.getElement('t_4').setColor(colorText);
      eqn.getElement('t_1').setColor(colorText);
    },
  });

  slides.push({
    fromForm: 'yxtxAndSineBotCom',
    form: 'yxtxAndSineBotComXOnV',
    enterState: () => {
      setArrows();
      arrow1.showAll();
      arrow2.showAll();
      eqn.getElement('t_4').setColor(color1);
      eqn.getElement('t_1').setColor(color1);
    },
    leaveState: () => {
      eqn.getElement('t_4').setColor(colorText);
      eqn.getElement('t_1').setColor(colorText);
    },
  });

  slides.push({
    fromForm: 'yxtxAndSineBotComXOnV',
    form: 'yxtxAndSineXOnV',
  });

  slides.push({
    modifiers: {
      equal: action('equal', () => {
        const ftx = eqn.getPhraseElements('ftx');
        const ftx3 = eqn.getPhraseElements('ftx3');
        eqn.pulse({
          elements: ftx, translation: 0.03, angle: Math.PI / 2, min: -0.03, frequency: 3,
        });
        eqn.pulse({
          elements: ftx3, translation: 0.03, angle: Math.PI / 2, min: -0.03, frequency: 3,
        });
      }, 0.15),
      terms: action('terms', () => {
        const ftx = eqn.getPhraseElements('yxt');
        const ftx3 = eqn.getPhraseElements('sinwtXOnV');
        eqn.pulse({
          elements: ftx, translation: 0.03, angle: Math.PI / 2, min: -0.03, frequency: 3,
        });
        eqn.pulse({
          elements: ftx3, translation: 0.03, angle: Math.PI / 2, min: -0.03, frequency: 3,
        });
      }, 0.15),
    },
    text: 'Both equations are |equal| and so we can equate |terms|.',
  });

  slides.push({ fromForm: 'yxtxAndSineXOnV', form: 'yxtxSine' });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: 'Now expand the terms inside the sine function.',
  });
  slides.push({ fromForm: 'yxtxSine', form: 'yxtxSineExpanded' });
  slides.push({ fromForm: 'yxtxSineExpanded', form: 'yxtxSinewtwxv' });
  slides.push({ fromForm: 'yxtxSinewtwxv', form: 'yxtxSinewtwxOnv' });
  slides.push({ fromForm: 'yxtxSinewtwxOnv', form: 'yxtxSinewtwvx' });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  nav.loadSlides(slides);
  nav.goToSlide(34);
}

addSlides();
// nav.goToSlide()
