/* eslint-disable camelcase, object-curly-newline */
/* globals figure, colTan, colCot, colCsc, color2, colSec, colTheta
   colCsc, centerText, leftText */

function layout() {
  // figure.add([
  //   centerText('title', 'The Trigonometric Functions', {}, [0, 1]),
  //   centerText('subTitle', 'An interactive video', {}, [0, 0.7], 0.1),
  //   leftText('background1', 'Similar Triangles', {}, [-1.8, 0], 0.2, {
  //     default: { position: [-1.8, 0] },
  //     center: { position: [-0.5, 0] },
  //   }),
  //   leftText('background2', 'Similar Triangles  \u2192  Right Angle Triangles', {}, [-1.8, 0]),
  // ]);
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
// layoutCirc();
makeEquation();
// t2 = performance.now()
// console.log('t2', t2 - t1)
// layoutLines();
// t3 = performance.now()
// console.log('t3', t3 - t2)
layoutRight();
// t4 = performance.now()
// console.log('t4', t4 - t3)
layout();
// t5 = performance.now()
// console.log('t5', t5 - t4)
// similarLayout();
// t6 = performance.now()
// console.log('t6', t6 - t5)

function makeSlides() {
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [3.8, 0], width: 0.2, height: 0.2 },
      prevButton: { position: [-3.8, 0], width: 0.2, height: 0.2 },
      equation: ['eqn', 'similar.eqn', 'circ.eqn'],
      // equationDefaults: { duration: 4 },
    },
  });
  const slides = [];

  const nav = figure.getElement('nav');
  const rightTri = figure.getElement('rightTri');
  // const eqn = figure.getElement('eqn');


  // /*
  // .########..####..######...##.....##.########....########.########..####
  // .##.....##..##..##....##..##.....##....##..........##....##.....##..##.
  // .##.....##..##..##........##.....##....##..........##....##.....##..##.
  // .########...##..##...####.#########....##..........##....########...##.
  // .##...##....##..##....##..##.....##....##..........##....##...##....##.
  // .##....##...##..##....##..##.....##....##..........##....##....##...##.
  // .##.....##.####..######...##.....##....##..........##....##.....##.####
  // */
  // const initialAngle = 0.7;
  slides.push({
    scenarioCommon: 'oneTri',
    addReference: true,
    showCommon: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.side01', 'tri.side12', 'tri.side20'] },
    enterStateCommon: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'values', true);
    },
  });

  slides.push({
    addReference: true,
    fromForm: 'values',
    form: 'values',
    transition: { in: 'eqn' },
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
    ],
    steadyState: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
    },
  });

  slides.push({
    showCommon: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.angle0'] },
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
    transition: [
      { scenario: 'rightTri', target: 'twoTri' },
      { in: { 'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'] } },
    ],
  });

  slides.push({
    addReference: true,
    scenarioCommon: 'twoTri',
    fromForm: 'AonB',
    form: 'BonC',
    showCommon: [
      { 'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'] },
      { 'rightTri.tri2': ['line', 'angle1', 'angle2', 'angle0'] },
    ],
    transition: [
      [
        { in: { 'rightTri.tri1': ['side01', 'side12', 'side20'] } },
        { in: { 'rightTri.tri2': ['side01', 'side12', 'side20'] } },
        { dim: { 'rightTri.tri1': ['angle1', 'angle2', 'angle0'] } },
        { dim: { 'rightTri.tri2': ['angle1', 'angle2', 'angle0'] } },
      ],
      { in: 'eqn' },
      { goToForm: 'eqn', target: 'AonC', delay: 2 },
      { goToForm: 'eqn', target: 'BonC', delay: 2 },
    ],
    leaveStateCommon: () => {
      rightTri._tri1.undim();
      rightTri._tri2.undim();
    },
  });


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
        // [
        { undim: { 'rightTri.tri2': ['angle1', 'angle2'] } },
        {
          out: { 'rightTri.tri1': ['side01', 'side12', 'side20', 'line', 'angle1', 'angle2', 'angle0'] },
        },
        {
          out: { 'rightTri.tri2': ['side01', 'side12', 'side20', 'angle0', 'angle2.label'] },
        },
        { out: 'eqn' },
      ],
      {
        in: { 'rightTri.tri': ['side01', 'side12', 'side20', 'angle2.label'], delay: 0.5 },
      },
      { out: { 'rightTri.tri2': ['side01', 'side12', 'side20', 'line', 'angle1', 'angle2', 'angle0'], duration: 0, delay: 0.5 } },
      { goToForm: 'eqn', start: 'blank', target: 'values' },
    ],
  });

  // // Theta and complementary
  // slides.push({
  //   showCommon: { 'rightTri.tri': ['line', 'angle1', 'angle2', 'angle0'] },
  //   transition: [
  //     [
  //       { in: 'rightTri.tri.angle2' },
  //       { pulseAngle: 'rightTri.tri.angle2', label: { scale: 1.7 }, curve: { scale: 1.7, delay: 0.2 } },
  //     ],
  //     { delay: 0.7 },
  //     { in: 'rightTri.tri.angle0' },
  //   ],
  //   time: '1:11',
  // });

  // slides.push({
  //   transition: [
  //     { scenario: 'rightTri', target: 'similar', duration: 1.5 },
  //     { in: { 'rightTri.tri2': ['line', 'angle2', 'angle0', 'angle1'] } },
  //     { in: { 'rightTri.tri1': ['line', 'angle2', 'angle0', 'angle1'] } },
  //     { in: 'rightTri.allTriangles', duration: 1, delay: 0 },
  //     { in: 'rightTri.haveSameAngles', duration: 1, delay: 1 },
  //   ],
  //   time: '1:19',
  // });

  // // All right triangles are similar
  // slides.push({
  //   addReference: true,
  //   scenarioCommon: 'similar',
  //   showCommon: {
  //     'rightTri.tri': ['line', 'angle1', 'angle2', 'angle0'],
  //     'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'],
  //     'rightTri.tri2': ['line', 'angle1', 'angle2', 'angle0'],
  //     rightTri: ['allTriangles', 'areSimilar'],
  //   },
  //   transition: [
  //     { out: 'rightTri.haveSameAngles' },
  //     { in: 'rightTri.areSimilar' },
  //   ],
  //   time: '1:26',
  // });

  // // Show corresponding ratios eqn
  // slides.push({
  //   transition: [
  //     [
  //       { out: ['rightTri.areSimilar', 'rightTri.allTriangles'] },
  //       { out: { rightTri: ['tri1.angle0', 'tri2.angle0', 'tri.angle0'] } },
  //       {
  //         in: [
  //           { 'rightTri.tri1': ['side01', 'side12', 'side20'] },
  //           { 'rightTri.tri2': ['side01', 'side12', 'side20'] },
  //           { 'rightTri.tri3': ['side01', 'side12', 'side20'] },
  //           'rightTri.eqn',
  //         ],
  //       },
  //     ],
  //   ],
  //   time: '1:31.5',
  // });

  // // Named sides
  // slides.push({
  //   // scenarioCommon: 'similar',
  //   // fromForm: 'ratios',
  //   // form: 'ratios',
  //   showCommon: {
  //     rightTri: [
  //       { tri1: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'] },
  //       { tri2: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'] },
  //       { tri3: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'] },
  //       { tri: ['line', 'angle1', 'angle2'] },
  //     ],
  //   },
  //   transition: [
  //     {
  //       out: [
  //         {
  //           rightTri: {
  //             tri1: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
  //             tri2: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
  //             tri3: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
  //           },
  //         },
  //         { rightTri: ['eqn'] },
  //       ],
  //     },
  //     { scenario: 'rightTri', target: 'ratioValues', duration: 2.5 },
  //     { in: { 'rightTri.tri': ['side01'] }, duration: 0.8 },
  //     { in: { 'rightTri.tri': ['side12'] }, duration: 0.8 },
  //     { in: { 'rightTri.tri': ['side20'] }, duration: 0.8 },
  //     // { in: 'eqn', delay: 0.5 },
  //   ],
  //   time: '1:38',
  // });

  // /*
  // .########.....###....########.####..#######...######.
  // .##.....##...##.##......##.....##..##.....##.##....##
  // .##.....##..##...##.....##.....##..##.....##.##......
  // .########..##.....##....##.....##..##.....##..######.
  // .##...##...#########....##.....##..##.....##.......##
  // .##....##..##.....##....##.....##..##.....##.##....##
  // .##.....##.##.....##....##....####..#######...######.
  // */
  // slides.push({
  //   scenarioCommon: 'ratioValues',
  //   addReference: true,
  //   showCommon: {
  //     'rightTri.tri': ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
  //     rightTri: ['rotLine', 'movePad'],
  //   },
  //   fromForm: 'ratios',
  //   form: 'ratioValues',
  //   transition: (done) => {
  //     figure.animations.new()
  //       .dissolveIn({ element: 'eqn', duration: 0.5 })
  //       .delay(3)
  //       .trigger({ callback: 'triAnimateToValues', duration: 0.4 })
  //       .then(eqn.animations.goToForm({ target: 'ratioValues', animate: 'move' }))
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     figure.fnMap.exec('triSetup', [2, 1.453], 'values', true);
  //   },
  //   time: '1:45.5',
  //   exec: ['2:25', 'triAnimatePadTo'],
  // });

  // slides.push({
  //   showCommon: {
  //     'rightTri.tri': ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
  //   },
  //   form: 'functions',
  //   transition: (done) => {
  //     figure.fnMap.exec('triSetup', [2, 1.453], 'values', false);
  //     figure.animations.new()
  //       .trigger({ callback: 'triAnimateToNames' })
  //       .then(eqn.animations.goToForm({ target: 'functions', animate: 'move', dissolveOutTime: 0.5, dissolveInTime: 0.5 }))
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     figure.fnMap.exec('triSetup', [2, 1.453], 'names', false);
  //   },
  //   time: '2:28',
  // });
  // slides.push({
  //   form: 'names',
  //   time: '2:36',
  //   exec: [
  //     ['2:38.5', 'eqnPulseSin'],
  //     ['2:39', 'eqnPulseCos'],
  //     ['2:39.5', 'eqnPulseTan'],
  //     ['2:40.5', 'eqnPulseCsc'],
  //     ['2:41.5', 'eqnPulseSec'],
  //     ['2:42.2', 'eqnPulseCot'],
  //   ],
  // });
  nav.loadSlides(slides);
  nav.goToSlide(0);
}
makeSlides();
