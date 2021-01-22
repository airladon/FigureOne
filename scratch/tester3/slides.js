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
  const disturb = (med, style = 'pulse', parameter = 0.6) => {
    if (Array.isArray(med)) {
      med.forEach(m => layout[style](m, parameter));
    } else {
      layout[style](med, parameter);
    }
    lastDisturbance = layout.time.now();
  };

  const startDisturbances = (med, timeTillNext = 10, immediately = true, style = 'pulse', parameter) => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
    const now = layout.time.now();
    if (Array.isArray(med)) {
      med.forEach((m) => {
        if (m.custom.movePad.isAnimating() && style === 'sineWave') {
          lastDisturbance = now;
        }
      });
    } else if (med.custom.movePad.isAnimating() && style === 'sineWave') {
      lastDisturbance = now;
    }
    if (now - lastDisturbance > timeTillNext || immediately) {
      disturb(med, style, parameter);
    }
    timerId = setTimeout(() => {
      startDisturbances(med, timeTillNext, false, style, parameter);
    }, 1000);
  };

  // const startSineWaves = (med, timeTillNext = 5, immediately = true) => {
  //   if (timerId != null) {
  //     clearTimeout(timerId);
  //   }
  //   const now = layout.time.now();
  //   if (Array.isArray(med)) {
  //     med.forEach((m) => {
  //       if (m.custom.movePad.isAnimating()) {
  //         lastDisturbance = now;
  //       }
  //     });
  //   } else if (med.custom.movePad.isAnimating()) {
  //       lastDisturbance = now;
  //     }
  //   }

  //   if (now - lastDisturbance > timeTillNext || immediately) {
  //     disturb(med, 'sineWave', 0);
  //   }
  //   timerId = setTimeout(() => {
  //     startSineWaves(medium, timeTillNext, false);
  //   });
  // }

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
  const eqnPulse = (text, elements, touchBorder = 0, color = color1) => ({
    text,
    font: { color },
    touchBorder,
    onClick: () => eqn.pulse({
      elements,
      frequency: 3,
      translation: 0.02,
      min: -0.02,
      angle: Math.PI / 2,
    }),
  });
  const highlight = text => ({
    text, font: { style: 'italic' },
  });
  const math = (text, color = colorText, size = 0.17) => ({
    text,
    font: {
      family: 'Times New Roman', style: 'italic', size, color,
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
    div: math(' \u2215 '),
    w: math('\u03c9'),
    pi: math('\u03c0'),
    twoPi: math('2\u03c0'),
    lambda: math('\u03bb'),
    piSmall: math('\u03c0', colorText, 0.11),
    vS: math('v', colorText, 0.11),
    fS: math('f', colorText, 0.11),
    divS: math(' \u2215 ', colorText, 0.11),
    twoPiS: math('2\u03c0', colorText, 0.11),
    xS: math('x', colorText, 0.11),
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
    steadyStateCommon: (from) => {
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
    steadyStateCommon: (from) => {
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
    steadyStateCommon: (from) => {
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
    steadyStateCommon: (from) => {
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
    // showCommon: [],
    text: 'Now, let\'s make our |initial disturbance| a |sine| function.',
    steadyStateCommon: (from) => {
      if (from === 'prev') {
        layout.reset();
        layout.unpause();
        startDisturbances(medium, 10, true, 'sineWave', 0);
      } else {
        startDisturbances(medium, 10, false, 'sineWave', 0);
      }
    },
  });
  slides.push({
    fromForm: 'yxtx',
    form: 'yxtxAndSine',
    steadyStateCommon: () => {
      startDisturbances(medium, 10, false, 'sineWave', 0);
    },
  });
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
      { element: eqn.getElement('t_4'), space: 0.02 },
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
      // eqn.showForm('yxtxAndSineBotCom');
      // figure.setFirstTransform();
      // console.log(eqn.getElement('t_1').lastDrawTransform._dup());
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
    // form: 'yxtxAndSineBotComXOnV',
    form: 'yxtxAndSineXOnV',
    // enterState: () => {
    //   setArrows();
    //   arrow1.showAll();
    //   arrow2.showAll();
    //   eqn.getElement('t_4').setColor(color1);
    //   eqn.getElement('t_1').setColor(color1);
    // },
    // leaveState: () => {
    //   eqn.getElement('t_4').setColor(colorText);
    //   eqn.getElement('t_1').setColor(colorText);
    // },
  });

  // slides.push({
  //   fromForm: 'yxtxAndSineBotComXOnV',
  //   form: 'yxtxAndSineXOnV',
  // });

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

  slides.push({
    fromForm: 'yxtxAndSineXOnV',
    transition: (done) => {
      eqn.animations.new()
        .inParallel([
          eqn.animations.goToForm({ target: 'yxtxSine', animate: 'move' }),
          eqn.animations.scenario({ target: 'left', duration: 1, delay: 0.5 }),
        ])
        .whenFinished(done)
        .start();
    },
    form: 'yxtxSine',
    steadyState: () => {
      eqn.setScenario('left');
    },
  });
  slides.push({
    showCommon: ['medium'],
    scenarioCommon: ['default', 'left'],
  });

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
  /*
  ....###....##....##....###....##.......##....##..######..####..######.
  ...##.##...###...##...##.##...##........##..##..##....##..##..##....##
  ..##...##..####..##..##...##..##.........####...##........##..##......
  .##.....##.##.##.##.##.....##.##..........##.....######...##...######.
  .#########.##..####.#########.##..........##..........##..##........##
  .##.....##.##...###.##.....##.##..........##....##....##..##..##....##
  .##.....##.##....##.##.....##.########....##.....######..####..######.
  */
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: [
      'Similar to before, this equation tells us the disturbance at any point',
      'in space, at any snapshot in time.',
    ],
    enterStateCommon: () => {
      // medium.custom.balls.highlight(['ball0', 'ball40']);
      // medium.custom.movePad.setMovable(true);
      layout.unpause();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      'phase offset': eqnPulse('phase offset', [
        ...eqn.getPhraseElements('wOnV1'), 'x_3', 'min1',
      ]),
      time: eqnPulse('time', ['sin', 'w2', 't_2']),
      'fixed position': eqnPulse('fixed position', ['constant_1']),
    },
    text: [
      'If we look at a |fixed position|, we see a sine function dependent on |time|',
      'with a constant |phase offset|.',
    ],
    form: 'sineConstX',
    enterState: () => {
      medium.custom.balls.highlight(['ball40']);
    },
    steadyState: () => {
      eqn.dim([...eqn.getPhraseElements('wOnV1'), 'x_3', 'min1', 'x_1']);
    },
    leaveStateCommon: () => eqn.undim(),
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      'phase offset': eqnPulse('phase offset', ['w2', 't_2']),
      space: eqnPulse('space', [
        'sin', ...eqn.getPhraseElements('wOnV1'), 'x_3', 'min1',
      ]),
      'time snapshot': eqnPulse('time snapshot', ['constant_1']),
      'minus sign': eqnPulse('minus sign', ['min1']),
    },
    text: [
      'Similarly, if we look at a |time snapshot|, we see a sine function in',
      '|space| with a constant |phase offset|.',
      {
        text: 'NB: The |minus sign| is a phase offset of |piSmall|.',
        font: { size: 0.09 },
        lineSpace: 0.2,
      },
    ],
    form: 'sineConstT',
    enterStateCommon: () => {
      eqn.dim(['w2', 't_2', 't_y3']);
      layout.pause();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: [
      'When we disturb a medium with a time dependent sine wave at some point',
      'the disturbance will distribute through space as a traveling sine wave.',
    ],
    enterStateCommon: () => {
      eqn.dim(['w2', 't_2', 't_y3', 'line1', 'line2', 'constant', 'constant_1']);
      layout.pause();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      wavelength: highlight('wavelength'),
    },
    text: [
      'The distance over which a spatial sine function repeats is commonly called',
      'the |wavelength| |lambda|. Can we see the wavelength in this equation?',
    ],
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: [
      'To find it, we need to expand the angular frequency |w|, and rearrange the',
      'equation.',
    ],
  });

  slides.push({ fromForm: 'sineConstT', form: 'sineExpandW' });
  slides.push({ fromForm: 'sineExpandW', form: 'sine2PiF' });
  slides.push({ fromForm: 'sine2PiF', form: 'sine2PiFTimesF' });
  slides.push({ fromForm: 'sine2PiFTimesF', form: 'sine2PiFTimesFCancel' });
  slides.push({ fromForm: 'sine2PiFTimesFCancel', form: 'sine2PiOnfv' });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: [
      'Let\'s look at the units of |v||div||f|.',
    ],
  });

  slides.push({
    fromForm: 'sine2PiOnfv',
    transition: (done) => {
      eqn.animations.new()
        .scenario({ target: 'farLeft', duration: 1, delay: 0.4 })
        .goToForm({ target: 'sine2PiOnfvUnits', animate: 'move' })
        .whenFinished(done)
        .start();
    },
    form: 'sine2PiOnfvUnits',
    steadyState: () => {
      eqn.setScenario('farLeft');
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      length: eqnPulse('length', ['f_5', 'vin3', 'v_1', 'm_2']),
    },
    scenarioCommon: ['default', 'farLeft'],
    text: [
      'So |v||div||f|  is a measure of distance or |length|.',
    ],
  });

  slides.push({
    fromForm: 'sine2PiOnfvUnits',
    text: [
      'A sine function repeats every time its input value progresses |twoPi|.',
    ],
    transition: (done) => {
      eqn.animations.new()
        .inParallel([
          eqn.animations.goToForm({ target: 'sine2PiOnfv', animate: 'move' }),
          eqn.animations.scenario({ target: 'left', duration: 1, delay: 0.4 }),
        ])
        .whenFinished(done)
        .start();
    },
    form: 'sine2PiOnfv',
    steadyState: () => {
      eqn.setScenario('left');
    },
  });


  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      'input value': eqnPulse('input value', ['twoPi', 'vin2', 'v_2', 'div2', 'f_6', 'x_3']),
    },
    scenarioCommon: ['default', 'left'],
    text: [
      'In our case, the sine |input value| changes by |twoPi| each time |x| changes',
      'by the distance |v||div||f|.',
      {
        text: 'As when |xS| = |vS||divS||fS|   \u21d2   |twoPiS||xS||divS|(|vS||divS||fS| ) = |twoPiS|.',
        font: { size: 0.09 },
      },
    ],
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      is: highlight('is'),
    },
    text: [
      'Wavelength is defined as the distance over which the sine wave repeats.',
      'Our wave repeats every |v||div||f|, and so |v||div||f|  |is| the wavelength |lambda|.',
    ],
  });
  slides.push({ fromForm: 'sine2PiOnfv', form: 'sine2PiOnfvL' });
  slides.push({ fromForm: 'sine2PiOnfvL', form: 'sine2PiOnL' });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: 'And so in general we have',
  });
  slides.push({
    fromForm: 'sine2PiOnL',
    form: 'sineGeneral',
    steadyStateCommon: () => {
      startDisturbances(medium, 10, false, 'sineWave', 0);
      layout.unpause();
      eqn.undim();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    enterStateCommon: () => {
      layout.unpause();
    },
    text: [
      'And so we see the travelling sine wave has a wavelength proportional to',
      'the disturbance\'s propagation velocity.',
    ],
  });
  slides.push({
    fromForm: 'sineGeneral',
    form: 'vOnFLambda',
    transition: (done) => {
      eqn.animations.new()
        .dissolveOut(0.4)
        .trigger(() => {
          eqn.setScenario('default');
          eqn.showForm('vOnFLambda');
        })
        .dissolveIn(0.4)
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      eqn.setScenario('default');
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    scenarioCommon: 'default',
    text: 'Which is often rearranged to be inline.',
  });
  slides.push({ fromForm: 'vOnFLambda', form: 'cLambdaF' });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: [
      'As velocity and wavelength are proportional, then increasing one will increase',
      'the other. This is consistent with our initial observation that a faster',
      'propagation velocity results in a more spread out pulse or wave.',
    ],
  });

  // ///////////////////////////////////////////////////////////////////////////
  /*
  ..######...#######..##.....##.########.....###....########..########
  .##....##.##.....##.###...###.##.....##...##.##...##.....##.##......
  .##.......##.....##.####.####.##.....##..##...##..##.....##.##......
  .##.......##.....##.##.###.##.########..##.....##.########..######..
  .##.......##.....##.##.....##.##........#########.##...##...##......
  .##....##.##.....##.##.....##.##........##.....##.##....##..##......
  ..######...#######..##.....##.##........##.....##.##.....##.########
  */
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: [
      'Experiment and compare waves when different velocities, or different disturbance',
      'frequencies are used.',
    ],
    form: null,
    showCommon: [
      'medium1', 'medium2', 'vFast', 'vSlow', 'timePlot1', 'timePlot2',
      'freezeTimeButton', 'slowTimeButton', 'slowTimeLabel', 'freezeTimeLabel',
      'velocityButton1', 'velocityButton2',
    ],
    steadyStateCommon: () => {
      layout.reset();
      startDisturbances([medium1, medium2], 5.5, true, 'sineWave', 0);
    },
  });

  // slides.push({ fromForm: 'sine2PiOnfvL', form: 'sine2PiOnL' });

  // slides.push({ fromForm: 'sineExpandW', form: 'sine2PiF' });
  // slides.push({ fromForm: 'sine2PiF', form: 'sine2PiFTimesF' });
  // slides.push({ fromForm: 'sine2PiFTimesF', form: 'sine2PiFTimesFCancel' });
  // slides.push({ fromForm: 'sine2PiFTimesFCancel', form: 'sine2PiOnfv' });

  // // ///////////////////////////////////////////////////////////////////////////
  // // ///////////////////////////////////////////////////////////////////////////
  // slides.push({
  //   text: [
  //     'Let\'s look at the sine wave in space more closely by expanding the',
  //     'angular frequency.',
  //   ],
  //   form: 'sineConstT',
  //   steadyStateCommon: () => {
  //     eqn.dim(['w2', 't_2', 't_y3', 'line1', 'line2', 'constant', 'constant_1']);
  //     layout.pause();
  //   },
  //   leaveState: () => eqn.undim(),
  // });



  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  nav.loadSlides(slides);
  nav.goToSlide(66);
}

addSlides();
// nav.goToSlide()
