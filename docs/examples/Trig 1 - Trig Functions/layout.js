/* eslint-disable camelcase, object-curly-newline */
/* globals figure makeEquation, layoutRight, centerText, leftText */

function layout() {
  figure.add([
    centerText('angleSum', 'A triangle\'s angles sum to 180\u00b0', {}, [0, 1]),
    centerText('trig', 'Trigonmetric Functions', {}, [0, 1]),
    leftText('similarTriangles', 'Similar Triangles', {}, [0, 1], 0.2, {
      left: { position: [-2.2, 0.9] },
      center: { position: [-0.5, 0.9] },
    }),
    leftText('similarTrianglesEq', 'Similar Triangles: equal corresponding side ratios', {}, [-2.2, 0.9]),
  ]);
  figure.add({
    name: 'cursor',
    method: 'collections.cursor',
    options: {
      color: [0, 0.5, 1, 0.7],
      radius: 0.15,
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

  const addReference = true;
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
    addReference,
    showCommon: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.side01', 'tri.side12', 'tri.side20'] },
    enterStateCommon: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'values', true);
    },
    exec: ['0:15', 'triResetPad'],
  });

  slides.push({
    time: '0:21',
    addReference,
    fromForm: 'values',
    form: 'values',
    transition: { in: 'eqn' },
    exec: ['0:50', 'triResetPad'],
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
    addReference,
    time: '0:52',
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
      ['0:58.5', 'triPulseRight'],
      ['0:59.3', 'triPulseTheta'],
    ],
  });

  slides.push({
    addReference,
    time: '1:01.5',
    showCommon: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.angle0'] },
    show: 'angleSum',
    enterStateCommon: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
    },
    transition: [
      { in: 'rightTri.tri.angle0' },
    ],
  });

  slides.push({
    addReference,
    time: '1:02',
    scenario: 'center',
    transition: [
      { out: 'angleSum' },
      { scenario: 'rightTri', target: 'twoTri' },
      { in: { 'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'] } },
      { trigger: 'triPulseThetas', duration: 1.5, delay: 1.8 },
      { trigger: 'triPulseAllAngles', duration: 1.5, delay: 0.5 },
      { in: 'similarTriangles', delay: 0 },
      { scenario: 'similarTriangles', target: 'left', delay: 3.5, duration: 3 },
      { in: 'similarTrianglesEq' },
    ],
  });

  slides.push({
    time: '1:22',
    addReference,
    scenarioCommon: 'twoTri',
    fromForm: 'AonB',
    form: 'AonCEq',
    showCommon: [
      { 'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'] },
      { 'rightTri.tri2': ['line', 'angle1', 'angle2', 'angle0'] },
    ],
    transition: [
      { out: 'similarTrianglesEq' },
      { in: { 'rightTri.tri1': ['side01', 'side12'] } },
      { in: 'eqn', delay: 2 },
      { in: { 'rightTri.tri2': ['side01', 'side12'] }, delay: 3 },
      { goToForm: 'eqn', target: 'AonBEq', delay: 2 },
      { in: { rightTri: ['tri1.side20', 'tri2.side20'] }, delay: 3.5 },
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
    time: '1:45',
    addReference,
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
        // { undim: { 'rightTri.tri2': ['angle1', 'angle2'] } },
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
    exec: ['2:00.5', 'triResetPad'],
  });

  slides.push({
    time: '2:02',
    addReference,
    scenarioCommon: 'oneTri',
    fromForm: 'values',
    form: 'functions',
    transition: [
      { goToForm: 'eqn', target: 'functions' },
      { trigger: 'triAnimateToNames', duration: 1, delay: 1 },
    ],
    steadyState: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
    },
  });

  slides.push({
    time: '2:09.5',
    addReference,
    enterStateCommon: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
    },
    fromForm: 'functions',
    form: 'trig',
    exec: [
      ['2:11.5', 'eqnPulseSin'],
      ['2:12.2', 'eqnPulseCos'],
      ['2:13', 'eqnPulseTan'],
      ['2:14', 'eqnPulseCot'],
      ['2:15', 'eqnPulseSec'],
      ['2:16', 'eqnPulseCsc'],
    ],
  });
  slides.push({
    time: '2:17.5',
    addReference,
    fromForm: 'trig',
    form: 'final',
    transition: [
      { out: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.side01', 'tri.side12', 'tri.side20'] } },
      [
        { scenario: 'eqn', target: 'center', duration: 3 },
        { goToForm: 'eqn', target: 'final', duration: 2.5 },
        { in: 'trig', delay: 2 },
      ],
    ],
  });

  nav.loadSlides(slides);
  nav.goToSlide(0);

  // figure.recorder.fetchAndLoad('http://localhost:8080/docs/examples/Trig%201%20-%20Trig%20Functions/ivid_data.json');
  figure.recorder.fetchAndLoad('http://localhost:8080/docs/examples/Trig%201%20-%20Trig%20Functions/ivid_data.json');
  figure.recorder.loadAudio(new Audio('./audio.mp3'));
}
makeSlides();
