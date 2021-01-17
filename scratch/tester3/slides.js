/* globals figure, layout */

function addSlides() {
  const nav = figure.getElement('nav');
  const medium = figure.getElement('medium');
  // const title = figure.getElement('title');
  const sideEqn = figure.getElement('sideEqn');

  const slides = [];

  let lastDisturbance = 0;
  let timerId = null;
  const disturb = (m) => {
    layout.pulse(medium, 0.6);
    lastDisturbance = layout.time.now();
  };
  const startDisturbances = (m) => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
    const now = layout.time.now();
    if (now - lastDisturbance > 4) {
      disturb();
    }
    timerId = setTimeout(() => {
      startDisturbances(m);
    }, 5000);
  };

  const stopDisturbances = () => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
  };

  const modifiersCommon = {
    x: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    f: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    y: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    t: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    v: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    k: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    1: {
      font: { family: 'Times New Roman', size: 0.06 },
      offset: [0, -0.03],
    },
    0: {
      font: { family: 'Times New Roman', size: 0.06 },
      offset: [0, -0.03],
    },
    disturbance: {
      onClick: () => disturb(medium),
      font: { color: color1 },
      touchBorder: 0.2,
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
        touchBorder: 0.2,
      },
    },
    text: [
      'A wave is a |disturbance| that propagates through a medium or field.',
      {
        text: 'Touch the word |disturbance| or move the |first particle| manually.',
        font: { size: 0.08 },
        lineSpace: 0.2,
      },
    ],
    form: null,
    steadyState: () => {
      medium.custom.movePad.setMovable(true);
      medium.custom.balls.highlight(['ball0']);
      // layout.pulse(medium, 0.6);
      disturb(medium);
      startDisturbances(medium);
    },
    leaveState: () => stopDisturbances(),
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
      // layout.reset();
      startDisturbances(medium);
      // layout.pulse(medium, 0.6);
    },
    leaveState: () => stopDisturbances(),
  });
  slides.push({
    fromForm: null,
    form: 't1',
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
    }
  });

  nav.loadSlides(slides);
  nav.goToSlide(1);
}

addSlides();
// nav.goToSlide()
