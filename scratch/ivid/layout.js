/* eslint-disable camelcase, object-curly-newline */
/* globals figure makeEquation, layoutRight, centerText, leftText */

function layout() {
  figure.add([
    centerText('angleSum', 'A triangle\'s angles sum to 180\u00b0', {}, [0, 1]),
    centerText('trig', 'Trigonmetric Functions', {}, [0, 1]),
    // centerText('subTitle', 'An interactive video', {}, [0, 0.7], 0.1),
    leftText('similar1', 'Similar Triangles', {}, [0, 1], 0.2, {
      left: { position: [-2.2, 0.9] },
      center: { position: [-0.5, 0.9] },
    }),
    leftText('similar2', 'Similar Triangles: equal corresponding side ratios', {}, [-2.2, 0.9]),
  ]);
  figure.add({
    name: 'cursor',
    method: 'collections.cursor',
    options: {
      color: [0, 0.5, 1, 0.7],
    },
    mods: {
      isShown: false,
    },
  });
}
makeEquation();
layoutRight();
layout();

function makeSlides() {
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [3.8, 0], width: 0.2, height: 0.2 },
      prevButton: { position: [-3.8, 0], width: 0.2, height: 0.2 },
      equation: ['eqn', 'similar.eqn', 'circ.eqn'],
    },
  });
  const slides = [];

  const nav = figure.getElement('nav');
  const rightTri = figure.getElement('rightTri');


  // /*
  // .########..####..######...##.....##.########....########.########..####
  // .##.....##..##..##....##..##.....##....##..........##....##.....##..##.
  // .##.....##..##..##........##.....##....##..........##....##.....##..##.
  // .########...##..##...####.#########....##..........##....########...##.
  // .##...##....##..##....##..##.....##....##..........##....##...##....##.
  // .##....##...##..##....##..##.....##....##..........##....##....##...##.
  // .##.....##.####..######...##.....##....##..........##....##.....##.####
  // */
  slides.push({
    scenarioCommon: 'oneTri',
    addReference: true,
    showCommon: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.side01', 'tri.side12', 'tri.side20'] },
    enterStateCommon: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'values', true);
    },
    exec: [10, 'triResetPad'],
  });

  slides.push({
    addReference: true,
    fromForm: 'values',
    form: 'values',
    transition: { in: 'eqn' },
    exec: [30, 'triResetPad'],
  });

  /*
  ..######..####.##.....##.####.##..........###....########.
  .##....##..##..###...###..##..##.........##.##...##.....##
  .##........##..####.####..##..##........##...##..##.....##
  ..######...##..##.###.##..##..##.......##.....##.########.
  .......##..##..##.....##..##..##.......#########.##...##..
  .##....##..##..##.....##..##..##.......##.....##.##....##.
  ..######..####.##.....##.####.########.##.....##.##.....##
  */
  slides.push({
    addReference: true,
    fromForm: 'values',
    form: null,
    transition: [
      {
        out: [
          { 'rightTri.tri': ['side01', 'side12', 'side20', 'angle2.label'] },
          'eqn',
        ],
      },
      { trigger: 'triToNames' },
      { in: 'rightTri.tri.angle2.label', show: true },
      { in: 'angleSum' },
    ],
    steadyState: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
    },
    exec: [
      ['1:00', 'triPulseRight'],
      ['1:01', 'triPulseTheta'],
    ],
  });

  slides.push({
    showCommon: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.angle0'] },
    show: 'angleSum',
    enterStateCommon: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
    },
    addReference: true,
    transition: [
      { in: 'rightTri.tri.angle0' },
    ],
  });

  slides.push({
    addReference: true,
    scenario: 'center',
    transition: [
      { out: 'angleSum' },
      { scenario: 'rightTri', target: 'twoTri' },
      { in: { 'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'] } },
      { in: 'similar1' },
      { scenario: 'similar1', target: 'left', delay: 2 },
      { in: 'similar2' },
    ],
  });

  slides.push({
    addReference: true,
    scenarioCommon: 'twoTri',
    fromForm: 'AonB',
    form: 'AonCEq',
    showCommon: [
      { 'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'] },
      { 'rightTri.tri2': ['line', 'angle1', 'angle2', 'angle0'] },
    ],
    transition: [
      { out: 'similar2' },
      { in: { 'rightTri.tri1': ['side01', 'side12'] } },
      { in: 'eqn', delay: 1 },
      { in: { 'rightTri.tri2': ['side01', 'side12'] }, delay: 1 },
      { goToForm: 'eqn', target: 'AonBEq', delay: 1 },
      { in: { rightTri: ['tri1.side20', 'tri2.side20'] }, delay: 1 },
      { goToForm: 'eqn', target: 'AonCEq', delay: 2 },
    ],
    leaveState: () => {
      rightTri._tri1.undim();
      rightTri._tri2.undim();
    },
  });

  /*
  .########.##.....##.##....##..######.
  .##.......##.....##.###...##.##....##
  .##.......##.....##.####..##.##......
  .######...##.....##.##.##.##.##......
  .##.......##.....##.##..####.##......
  .##.......##.....##.##...###.##....##
  .##........#######..##....##..######.
  */
  slides.push({
    addReference: true,
    showCommon: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.side01', 'tri.side12', 'tri.side20'] },
    enterStateCommon: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'values', true);
    },
    enterState: () => {
      rightTri._tri2.dim();
    },
    fromForm: 'BonC',
    form: 'values',
    transition: [
      [
        { scenario: 'rightTri', target: 'oneTri', duration: 2 },
        { undim: { 'rightTri.tri2': ['angle1', 'angle2'] } },
        {
          out: { 'rightTri.tri1': ['side01', 'side12', 'side20', 'line', 'angle1', 'angle2', 'angle0'] },
        },
        {
          out: { 'rightTri.tri2': ['side01', 'side12', 'side20', 'angle0', 'angle2.label'] },
        },
        { out: 'eqn', final: false },
      ],
      { scenario: 'eqn', target: 'oneTri', duration: 0 },
      {
        in: { 'rightTri.tri': ['side01', 'side12', 'side20', 'angle2.label'], delay: 0.5 },
      },
      { out: { 'rightTri.tri2': ['side01', 'side12', 'side20', 'line', 'angle1', 'angle2', 'angle0'], duration: 0, delay: 0.5 } },
      { trigger: 'eqnInToValues' },
    ],
    leaveState: () => {
      rightTri._tri1.undim();
      rightTri._tri2.undim();
    },
  });

  slides.push({
    addReference: true,
    scenarioCommon: 'oneTri',
    fromForm: 'values',
    form: 'functions',
    transition: [
      { goToForm: 'eqn', target: 'functions' },
      { trigger: 'triAnimateToNames', duration: 1 },
    ],
    steadyState: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
    },
    exec: [
      ['2:38.5', 'eqnPulseSin'],
      ['2:39', 'eqnPulseCos'],
      ['2:39.5', 'eqnPulseTan'],
      ['2:40.5', 'eqnPulseCsc'],
      ['2:41.5', 'eqnPulseSec'],
      ['2:42.2', 'eqnPulseCot'],
    ],
  });

  slides.push({
    addReference: true,
    enterStateCommon: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
    },
    fromForm: 'functions',
    form: 'trig',
  });
  slides.push({
    addReference: true,
    fromForm: 'trig',
    form: 'final',
    transition: [
      { out: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.side01', 'tri.side12', 'tri.side20'] } },
      [
        { scenario: 'eqn', target: 'center', duration: 4 },
        { goToForm: 'eqn', target: 'final', duration: 3.5 },
        { in: 'trig', delay: 3 },
      ],
    ],
  });

  nav.loadSlides(slides);
  nav.goToSlide(0);
}
makeSlides();
