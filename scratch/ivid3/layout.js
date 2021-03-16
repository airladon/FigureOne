/* eslint-disable camelcase, object-curly-newline */
/* globals figure, colTan, colCot, colCsc, color2, colSec, colTheta
   colCsc, centerText, leftText */

function layout() {
  figure.add([
    centerText('title', 'The Trigonometric Functions', {}, [0, 1]),
    centerText('subTitle', 'An interactive video', {}, [0, 0.7], 0.1),
    leftText('background1', 'Similar Triangles', {}, [-1.8, 0], 0.2, {
      default: { position: [-1.8, 0] },
      center: { position: [-0.5, 0] },
    }),
    leftText('background2', 'Similar Triangles  \u2192  Right Angle Triangles', {}, [-1.8, 0]),
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
layoutCirc();
makeEquation();
// t2 = performance.now()
// console.log('t2', t2 - t1)
layoutLines();
// t3 = performance.now()
// console.log('t3', t3 - t2)
layoutRight();
// t4 = performance.now()
// console.log('t4', t4 - t3)
layout();
// t5 = performance.now()
// console.log('t5', t5 - t4)
similarLayout();
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
  // const similar = figure.getElement('similar');
  // const rightTri = figure.getElement('rightTri');
  const circ = figure.getElement('circ');
  const eqn = figure.getElement('eqn');
  const lines = figure.getElement('lines');

  /*
  .########.####.########.##.......########
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......######..
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......##......
  ....##....####....##....########.########
  */
  slides.push({
    scenarioCommon: ['default', 'title'],
    showCommon: [
      'title', 'subTitle',
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc'] }],
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'title']);
      figure.shortCuts = { 0: 'circToRot' };
    },
    addReference: true,
    exec: [17, 'circToRot'],
  });

  slides.push({
    show: ['title'],
    transition: [
      [
        { out: 'subTitle' },
        { out: { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc'] } },
      ],
    ],
    time: 22.5,
  });

  slides.push({
    scenarioCommon: ['default'],
    showCommon: ['title'],
    transition: { in: 'background1' },
    time: 26.6,
  });
  slides.push({
    showCommon: ['background1', 'title'],
    transition: { in: 'background2' },
    time: 28,
  });
  slides.push({
    transition: [
      [{ out: ['background2', 'title'] }, { scenario: 'background1', target: 'center' }],
    ],
    time: 33,
  });

  // /*
  // ..######..####.##.....##.####.##..........###....########.
  // .##....##..##..###...###..##..##.........##.##...##.....##
  // .##........##..####.####..##..##........##...##..##.....##
  // ..######...##..##.###.##..##..##.......##.....##.########.
  // .......##..##..##.....##..##..##.......#########.##...##..
  // .##....##..##..##.....##..##..##.......##.....##.##....##.
  // ..######..####.##.....##.####.########.##.....##.##.....##
  // */
  slides.push({
    clear: true,
    scenarioCommon: 'similarLarge',
    addReference: true,
    transition: [
      { out: 'background1' },
      { in: { 'similar.tris.tri1': ['line', 'angle0', 'angle1', 'angle2'] }, duration: 1 },
      { in: { 'similar.tris.tri2': ['line', 'angle0', 'angle1', 'angle2'] }, duration: 1 },
      { in: { 'similar.tris.tri3': ['line', 'angle0', 'angle1', 'angle2'] }, duration: 1 },
      // { in: 'similar.allAngles' },
    ],
    time: 35,
  });

  slides.push({
    show: {
      similar: [{
        'tris.tri1': ['line', 'angle0', 'angle1', 'angle2'],
        'tris.tri2': ['line', 'angle0', 'angle1', 'angle2'],
        'tris.tri3': ['line', 'angle0', 'angle1', 'angle2'],
      }],
    },
    fromForm: { 'similar.eqn': 'AB' },
    form: { 'similar.eqn': 'AB' },
    transition: [
      // { out: 'similar.allAngles' },
      { in: 'similar.allRatios' },
      { in: { 'similar.tris': ['tri1.side20', 'tri1.side12', 'tri2.side20', 'tri2.side12', 'tri3.side20', 'tri3.side12'] }, delay: 0.5 },
      { delay: 0.5 },
      [
        { scenario: 'similar.tris', target: 'similarSmall', duration: 0.8 },
        { in: 'similar.eqn', delay: 0.3 },
      ],
    ],
    time: 43,
  });

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
    clear: true,
    scenarioCommon: 'center',
    fromForm: { 'similar.eqn': 'CA' },
    form: null,
    addReference: true,
    transition: [
      {
        out: ['similar.eqn', 'similar.allRatios', {
          'similar.tris': {
            tri1: ['side01', 'side12', 'line', 'angle0', 'angle1', 'angle2'],
            tri2: ['side01', 'side12', 'line', 'angle0', 'angle1', 'angle2'],
            tri3: ['side01', 'side12', 'line', 'angle0', 'angle1', 'angle2'],
          },
        }],
      },
      { in: { 'rightTri.tri': ['line', 'angle1'] } },
    ],
    enterStateCommon: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'names');
    },
    time: '1:02',
    execDelta: [6, 'triPulseRight'],
  });

  // Theta and complementary
  slides.push({
    showCommon: { 'rightTri.tri': ['line', 'angle1', 'angle2', 'angle0'] },
    transition: [
      [
        { in: 'rightTri.tri.angle2' },
        { pulseAngle: 'rightTri.tri.angle2', label: { scale: 1.7 }, curve: { scale: 1.7, delay: 0.2 } },
      ],
      { delay: 0.7 },
      { in: 'rightTri.tri.angle0' },
    ],
    time: '1:11',
  });

  slides.push({
    transition: [
      { scenario: 'rightTri', target: 'similar', duration: 1.5 },
      { in: { 'rightTri.tri2': ['line', 'angle2', 'angle0', 'angle1'] } },
      { in: { 'rightTri.tri1': ['line', 'angle2', 'angle0', 'angle1'] } },
      { in: 'rightTri.allTriangles', duration: 1, delay: 0 },
      { in: 'rightTri.haveSameAngles', duration: 1, delay: 1 },
    ],
    time: '1:19',
  });

  // All right triangles are similar
  slides.push({
    addReference: true,
    scenarioCommon: 'similar',
    showCommon: {
      'rightTri.tri': ['line', 'angle1', 'angle2', 'angle0'],
      'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'],
      'rightTri.tri2': ['line', 'angle1', 'angle2', 'angle0'],
      rightTri: ['allTriangles', 'areSimilar'],
    },
    transition: [
      { out: 'rightTri.haveSameAngles' },
      { in: 'rightTri.areSimilar' },
    ],
    time: '1:26',
  });

  // Show corresponding ratios eqn
  slides.push({
    transition: [
      [
        { out: ['rightTri.areSimilar', 'rightTri.allTriangles'] },
        { out: { rightTri: ['tri1.angle0', 'tri2.angle0', 'tri.angle0'] } },
        {
          in: [
            { 'rightTri.tri1': ['side01', 'side12', 'side20'] },
            { 'rightTri.tri2': ['side01', 'side12', 'side20'] },
            { 'rightTri.tri3': ['side01', 'side12', 'side20'] },
            'rightTri.eqn',
          ],
        },
      ],
    ],
    time: '1:31.5',
  });

  // Named sides
  slides.push({
    // scenarioCommon: 'similar',
    // fromForm: 'ratios',
    // form: 'ratios',
    showCommon: {
      rightTri: [
        { tri1: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'] },
        { tri2: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'] },
        { tri3: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'] },
        { tri: ['line', 'angle1', 'angle2'] },
      ],
    },
    transition: [
      {
        out: [
          {
            rightTri: {
              tri1: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
              tri2: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
              tri3: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
            },
          },
          { rightTri: ['eqn'] },
        ],
      },
      { scenario: 'rightTri', target: 'ratioValues', duration: 2.5 },
      { in: { 'rightTri.tri': ['side01'] }, duration: 0.8 },
      { in: { 'rightTri.tri': ['side12'] }, duration: 0.8 },
      { in: { 'rightTri.tri': ['side20'] }, duration: 0.8 },
      // { in: 'eqn', delay: 0.5 },
    ],
    time: '1:38',
  });

  /*
  .########.....###....########.####..#######...######.
  .##.....##...##.##......##.....##..##.....##.##....##
  .##.....##..##...##.....##.....##..##.....##.##......
  .########..##.....##....##.....##..##.....##..######.
  .##...##...#########....##.....##..##.....##.......##
  .##....##..##.....##....##.....##..##.....##.##....##
  .##.....##.##.....##....##....####..#######...######.
  */
  slides.push({
    scenarioCommon: 'ratioValues',
    addReference: true,
    showCommon: {
      'rightTri.tri': ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
      rightTri: ['rotLine', 'movePad'],
    },
    fromForm: 'ratios',
    form: 'ratioValues',
    transition: (done) => {
      figure.animations.new()
        .dissolveIn({ element: 'eqn', duration: 0.5 })
        .delay(3)
        .trigger({ callback: 'triAnimateToValues', duration: 0.4 })
        .then(eqn.animations.goToForm({ target: 'ratioValues', animate: 'move' }))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'values', true);
    },
    time: '1:45.5',
    // exec: ['1:43.7', 'triAnimatePadTo'],
  });

  slides.push({
    showCommon: {
      'rightTri.tri': ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
    },
    form: 'functions',
    transition: (done) => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'values', false);
      figure.animations.new()
        .trigger({ callback: 'triAnimateToNames' })
        .then(eqn.animations.goToForm({ target: 'functions', animate: 'move', dissolveOutTime: 0.5, dissolveInTime: 0.5 }))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.fnMap.exec('triSetup', [2, 1.453], 'names', false);
    },
    time: '2:28',
  });
  slides.push({
    form: 'names',
    time: '2:36',
    exec: [
      ['2:38.5', 'eqnPulseSin'],
      ['2:39', 'eqnPulseCos'],
      ['2:39.5', 'eqnPulseTan'],
      ['2:40.5', 'eqnPulseCsc'],
      ['2:41.5', 'eqnPulseSec'],
      ['2:42.2', 'eqnPulseCot'],
    ],
  });

  /*
  .########.########...#######..##.....##
  .##.......##.....##.##.....##.###...###
  .##.......##.....##.##.....##.####.####
  .######...########..##.....##.##.###.##
  .##.......##...##...##.....##.##.....##
  .##.......##....##..##.....##.##.....##
  .##.......##.....##..#######..##.....##
  */
  slides.push({
    from: null,
    time: '2:48',
    transition: [
      {
        out: [
          'eqn',
          { 'rightTri.tri': ['side01', 'side12', 'side20'] },
        ],
      },
      {
        in: ['lines.circleLarge'], delay: 0.5,
      },
      [
        { scenario: 'rightTri', duration: 2, target: 'circ', delay: 1 },
        { in: ['lines.line1'], delay: 1.5 },
      ],
      { out: ['lines.line1'], show: false, delay: 1 },
      [
        { in: 'lines.p5' },
        { in: ['lines.tri0'] },
      ],
      { delay: 1 },
      [
        { out: 'lines.p5', show: false },
        { out: ['lines.tri0'], show: false },
      ],
      { in: ['lines.tri1'] },
      { out: ['lines.tri1'], show: false, delay: 1 },
      { in: ['lines.tangentLine'], duration: 0.7 },
      { in: ['lines.radiusLine'], duration: 0.7 },
    ],
  });
  slides.push({
    showCommon: {
      'rightTri.tri': ['line', 'angle1', 'angle2'],
      lines: ['circleLarge', 'tangentLine', 'radiusLine'],
    },
    fromForm: { eqn1: 'tanOnOne' },
    form: { eqn1: 'tanOppAdj' },
    scenario: ['eqn1Right', 'circ'],
    transition: [
      { in: 'eqn1' },
      { goToForm: 'eqn1', target: 'TangentOneOppAdj', delay: 1 },
      { goToForm: 'eqn1', target: 'tanOppAdj', delay: 3 },
      // { goToForm: 'eqn1', target: 'oppOnAdjTan', delay: 1 },
    ],
    time: '3:00.5',
  });
  /*
  .########....###....##....##
  ....##......##.##...###...##
  ....##.....##...##..####..##
  ....##....##.....##.##.##.##
  ....##....#########.##..####
  ....##....##.....##.##...###
  ....##....##.....##.##....##
  */
  slides.push({
    addReference: true,
    scenario: 'circQ1',
    enterState: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      figure.shortCuts = {
        0: 'circToRot',
      };
    },
    transition: [
      { out: { 'rightTri.tri': ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'] } },
      { in: { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta'] } },
    ],
    // time: '3:02.5',
  });

  slides.push({
    scenario: ['circQ1', 'linesCenter'],
    showCommon: { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc', 'sinLight', 'tanLight', 'cscLight', 'secLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'radiusLight'] },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      figure.shortCuts = { 0: 'circToRot' };
    },
    enterState: 'linesSetOutside',
    transition: [
      [
        { out: 'eqn' },
        { scenario: 'circ', target: 'nameDefs', duration: 1.5 },
        { out: { circ: ['triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc'] } },
        { in: 'lines.circle' },
      ],
      { in: 'lines.line' },
      { trigger: 'linesToTan', duration: 3 },
      { in: ['lines.radius', 'lines.rightAngle'], delay: 2.2 },
      { delay: 3.5 },
      [
        { in: 'lines.tangent' },
        { pulse: 'lines.tangent', duration: 1.5, delay: 0.2 },
      ],
      { scenario: 'lines.tangent', target: 'linesDefault', delay: 1 },
      { in: 'lines.tangentDef' },
    ],
    steadyState: () => {
      figure.fnMap.exec('linesSetTan');
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
    },
    leaveStateCommon: () => {
      circ.undim();
    },
    // time: '2:12',
  });

  slides.push({
    scenarioCommon: 'nameDefs',
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'sinLight', 'tanLight', 'cscLight', 'secLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.tan', 'theta', 'tanTheta.label'],
      lines: ['circle', 'line'],
    },
    show: { lines: ['tangentDef', 'radius', 'rightAngle'] },
    fromForm: null,
    form: null,
    enterState: 'linesSetTan',
    transition: [
      { pulseWidth: 'circ.triTanSec.tan', line: 6 },
      { pulse: 'circ.triTanSec.rightTan', xAlign: 'right', yAlign: 'bottom', delay: 1.3 },
      { delay: 0 },
      [
        { in: ['circ.triTanSec.tan.label', 'circ.tanTheta.label'] },
        { pulse: ['circ.triTanSec.tan.label', 'circ.tanTheta.label'], xAlign: 'left', delay: 0.2 },
      ],
    ],
    // time: '2:32',
    exec: ['2:43.5', 'circToRot'],
  });

  slides.push({
    scenarioCommon: 'nameDefs',
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'sinLight', 'tanLight', 'cscLight', 'secLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.tan', 'theta'],
      lines: ['circle', 'line'],
    },
    show: { lines: ['tangentDef', 'radius', 'rightAngle'] },
    enterState: 'linesSetTan',
    transition: { out: 'circ.tanTheta.label' },
    // time: '2:48.5',
  });

  /*
  ..######..########..######.
  .##....##.##.......##....##
  .##.......##.......##......
  ..######..######...##......
  .......##.##.......##......
  .##....##.##.......##....##
  ..######..########..######.
  */
  slides.push({
    addReference: true,
    scenario: 'linesCenter',
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      circ.highlight(['triTanSec.sec', 'theta']);
    },
    enterState: 'linesSetTan',
    transition: [
      { out: { lines: ['tangentDef', 'radius', 'rightAngle'] } },
      { trigger: 'linesToSec', duration: 2 },
      { delay: 2 },
      [
        { in: 'lines.secant' },
        { pulse: 'lines.secant', duration: 1.5, delay: 0.2 },
      ],
      { scenario: 'lines.secant', target: 'linesDefault', delay: 0.6 },
      { in: 'lines.secantDef' },
    ],
    steadyState: 'linesSetSec',
    // time: '2:53.5',
  });

  slides.push({
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'sinLight', 'cscLight', 'secLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'triTanSec.tan', 'triTanSec.sec'],
      lines: ['circle', 'line'],
    },
    show: { lines: ['secantDef'] },
    fromForm: null,
    form: null,
    enterState: 'linesSetSec',
    transition: [
      { pulseWidth: 'circ.triTanSec.sec', line: 6 },
      // {
      //   pulse: 'circ.arc', translation: 0.01, angle: Math.PI / 4, frequency: 3, min: -0.01, delay: 1.2, duration: 1,
      // },
      { delay: 1.3 },
      [
        { in: ['circ.triTanSec.sec.label'] },
        { pulse: ['circ.triTanSec.sec.label'], xAlign: 'left', delay: 0.2 },
      ],
    ],
    steadyState: 'linesSetSec',
    // time: '3:06',
  });

  /*
  ..######..####.##....##
  .##....##..##..###...##
  .##........##..####..##
  ..######...##..##.##.##
  .......##..##..##..####
  .##....##..##..##...###
  ..######..####.##....##
  */
  slides.push({
    addReference: true,
    scenario: 'linesCenter',
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      circ.highlight(['triSinCos.sin', 'theta']);
    },
    transition: [
      { out: 'secantDef' },
      { trigger: 'linesToChord', duration: 3 },
      { delay: 1.3 },
      [
        { in: 'lines.chord' },
        { pulse: 'lines.chord', duration: 1.5, delay: 0.2 },
      ],
      { scenario: 'lines.chord', target: 'linesDefault', delay: 0 },
      [
        { in: 'lines.chordDef', delay: 0.5 },
        { trigger: 'showBow', duration: 3.5 },
      ],
    ],
    steadyState: 'linesSetChord',
    // time: '3:13.5',
  });


  slides.push({
    show: ['lines.chordDef', 'circ.triSinCos.sin.line'],
    enterState: 'linesSetChord',
    transition: [
      { pulseWidth: 'circ._triSinCos._sin', line: 6, duration: 1.5 },
      [
        { trigger: 'showHalfChord', duration: 0.5 },
      ],
      [
        { in: 'lines.halfChordLabel' },
        {
          pulse: 'lines.halfChordLabel', scale: 1.3, duration: 1.5, xAlign: 'right',
        },
      ],
      { out: 'lines.chordDef', delay: 0.5 },
      { in: 'lines.jya' },
      { in: 'lines.sine', delay: 5 },
      [
        { in: 'circ.triSinCos.sin.label', delay: 1 },
        { pulse: 'circ.triSinCos.sin.label', delay: 1.2, xAlign: 'left' },
      ],
      { out: 'lines.halfChordLabel', show: false },
    ],
    steadyState: 'linesSetChord',
    // time: '3:25.5',
  });


  /*
  ..######...#######..########
  .##....##.##.....##....##...
  .##.......##.....##....##...
  .##.......##.....##....##...
  .##.......##.....##....##...
  .##....##.##.....##....##...
  ..######...#######.....##...
  */
  slides.push({
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'cscLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'thetaComp'],
      lines: ['circle'],
    },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      circ.highlight(['triCotCsc.cot', 'thetaComp', 'eqn']);
      circ._cotLight.show();
    },
    transition: [
      { out: ['lines.jya', 'lines.dullChord', 'lines.sine', 'lines.circle', 'lines.halfChord'] },
      { delay: 0.5 },
      [
        { pulse: 'circ.triSinCos.sin.label', duration: 1.5, xAlign: 'left' },
        { pulse: 'circ.triTanSec.tan.label', duration: 1.5, xAlign: 'left' },
        {
          pulse: 'circ.triTanSec.sec.label', duration: 1.5, xAlign: 'left', yAlign: 'top',
        },
      ],
      { in: 'circ.thetaComp', delay: 0.5 },
    ],
    // time: '3:47',
  });

  slides.push({
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'cscLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triCotCsc.cot.line', 'thetaComp'],
    },
    fromForm: { 'circ.eqn': 'tanComp' },
    form: { 'circ.eqn': 'cotTheta' },
    // enterState: () => {
    //   window.asdf = true;
    //   figure.subscriptions.add('afterDraw', () => {
    //     // console.log('asdf')
    //     if (window.asdf) {
    //       console.log(
    //         figure.animations.animations[0].steps[0].state,
    //         figure.animations.animations[0].steps[1].state,
    //         figure.animations.animations[0].steps[2].state,
    //         figure.animations.animations[0].steps[3].state,
    //         figure.animations.animations[0].steps[4].state,
    //         figure.animations.animations[0].steps[3].duration,
    //         figure.animations.animations[0].steps[4].duration,
    //         figure.lastDrawTime - figure.animations.animations[0].steps[3].startTime,
    //       )
    //       // console.log(figure.animations.animations[0].steps[3].duration)
    //     }
    //   });
    // },
    // steadyState: () => window.asdf = false,
    transition: [
      { pulseWidth: 'circ.triCotCsc.cot', line: 6, duration: 1.5 },
      { in: 'circ.eqn', delay: 0.5 },
      { goToForm: 'circ.eqn', target: 'complementaryTangent', delay: 2.8 },
      { goToForm: 'circ.eqn', target: 'cotangent', delay: 2 },
      { goToForm: 'circ.eqn', target: 'cotan', delay: 0.5 },
      [
        { goToForm: 'circ.eqn', target: 'cotTheta', delay: 0.5 },
        { in: 'circ.triCotCsc.cot.label', delay: 0.3 },
        { pulse: 'circ.triCotCsc.cot.label', delay: 0.5, yAlign: 'bottom' },
      ],
    ],
    // time: '3:54.5',
  });

  /*
  ..######...######...######.
  .##....##.##....##.##....##
  .##.......##.......##......
  .##........######..##......
  .##.............##.##......
  .##....##.##....##.##....##
  ..######...######...######.
  */
  slides.push({
    addReference: true,
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'cscLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triCotCsc.cot', 'thetaComp', 'triCotCsc.csc.line'],
    },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      circ.highlight(['triCotCsc.csc', 'thetaComp', 'eqn']);
    },
    fromForm: { 'circ.eqn': 'complementarySecant' },
    form: { 'circ.eqn': 'csc' },
    transition: [
      [
        { pulseWidth: 'circ.triCotCsc.csc', line: 6, duration: 1.5 },
        { in: 'circ.eqn' },
      ],
      { goToForm: 'circ.eqn', target: 'cosecant', delay: 2 },
      { goToForm: 'circ.eqn', target: 'cosec', delay: 0.2 },
      { delay: 0.3 },
      [
        { goToForm: 'circ.eqn', target: 'csc' },
        { in: 'circ.triCotCsc.csc.label', delay: 0.5 },
        {
          pulse: 'circ.triCotCsc.csc.label', delay: 0.7, xAlign: 'right', yAlign: 'bottom',
        },
      ],
    ],
    // time: '4:10.5',
  });


  /*
  ..######...#######...######.
  .##....##.##.....##.##....##
  .##.......##.....##.##......
  .##.......##.....##..######.
  .##.......##.....##.......##
  .##....##.##.....##.##....##
  ..######...#######...######.
  */
  slides.push({
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triCotCsc.cot', 'thetaComp', 'triCotCsc.csc', 'triSinCos.cos.line'],
    },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      circ.highlight(['triSinCos.cos', 'thetaComp', 'eqn']);
    },
    enterState: 'circSetCosUp',
    fromForm: { 'circ.eqn': 'complementarySine' },
    form: { 'circ.eqn': 'cos' },
    transition: [
      [
        { pulseWidth: 'circ.triSinCos.cos', line: 6, duration: 1.5 },
        { in: 'circ.eqn' },
      ],
      { goToForm: 'circ.eqn', target: 'cosine', delay: 2 },
      [
        { goToForm: 'circ.eqn', target: 'cos', delay: 0.2 },
        { trigger: 'circToCosDown', duration: 1.5, delay: 0.2 },
      ],
      [
        { in: 'circ.triSinCos.cos.label' },
        {
          pulse: 'circ.triSinCos.cos.label', delay: 0, yAlign: 'top',
        },
      ],
    ],
    steadyState: 'circSetCosDown',
    leaveStateCommon: () => {
      circ.undim();
      figure.fnMap.exec('circSetCosDown');
    },
    // time: '4:22.5',
  });


  /*
  ..######..########..##.......####.########
  .##....##.##.....##.##........##.....##...
  .##.......##.....##.##........##.....##...
  ..######..########..##........##.....##...
  .......##.##........##........##.....##...
  .##....##.##........##........##.....##...
  ..######..##........########.####....##...
  */
  // Setup
  slides.push({
    addReference: true,
    clear: true,
    scenario: ['circQ1', 'nameDefs'],
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
    },
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.rightTan', 'theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triSinCos.cos', 'triCotCsc.cot', 'triCotCsc.csc'],
    },
    fromForm: 'ratios',
    form: 'ratios',
    enterState: () => circ.highlight(['triSinCos.cos', 'thetaComp', 'eqn']),
    transition: [
      [
        { scenario: 'circ', target: 'circQ1', duration: 1.5 },
        { out: ['circ.eqn', 'circ.thetaComp'] },
        { undim: { circ: ['theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triSinCos.cos', 'triCotCsc.cot', 'thetaComp', 'triCotCsc.csc'] }, duration: 1 },
        { in: 'eqn' },
      ],
    ],
    // time: '4:35',
  });

  // Split
  slides.push({
    addReference: true,
    scenario: ['circQ1'],
    transition: [
      [
        { trigger: 'circToSplit', duration: 6 },
        { scenario: 'circ', target: 'split', duration: 6 },
      ],
    ],
    steadyState: () => figure.fnMap.exec('circSetup', [0.9, 'quarter']),
    leaveStateCommon: () => {
      circ.setScenarios('noSplit');
      circ.undim();
    },
    // time: '4:39',
  });

  // Sin Column
  slides.push({
    showCommon: { circ: ['triTanSec', 'triSinCos', 'triCotCsc'] },
    enterStateCommon: () => {
      circ.highlight('triSinCos');
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
    },
    scenarioCommon: 'split',
    form: 'build3',
    transition: [
      {
        pulse: 'circ.triSinCos', scale: 1.2, xAlign: 'right', yAlign: 'bottom', duration: 2,
      },
      // { pulse: 'eqn', scale: 1.05, delay: 1.5 },
      { delay: 0.5 },
      [
        { goToForm: 'eqn', target: 'ratiosEq', duration: 0.5 },
        {
          pulse: 'eqn', elements: ['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6'], duration: 1.5, delay: 0.2, centerOn: 'this',
        },
      ],
      { delay: 1.5 },
      [
        { pulse: 'eqn', elements: ['opp_1', 'opp_1s'], yAlign: 'bottom', duration: 1.5, centerOn: 'opp_1', xAlign: 'left', scale: 1.4 },
        { pulse: 'circ.triSinCos.sin.label', xAlign: 'left', duration: 1.3, scale: 1.7 },
      ],
      [
        { pulse: 'eqn', elements: ['hyp_1', 'hyp_1s'], yAlign: 'top', duration: 1.3, scale: 1.5, centerOn: 'hyp_1', xAlign: 'left' },
        { pulse: 'circ.triSinCos.unit.label', xAlign: 'right', yAlign: 'bottom', duration: 1.3, scale: 2 },
      ],
      { goToForm: 'eqn', target: 'build0', duration: 1 },
      { goToForm: 'eqn', target: 'build1', delay: 2.5, duration: 1 },
      { delay: 2 },
      [
        { pulse: 'eqn', elements: ['adj_1', 'adj_1s'], yAlign: 'bottom', duration: 1.5, centerOn: 'adj_1', xAlign: 'left', scale: 1.3 },
        { pulse: 'circ.triSinCos.cos.label', xAlign: 'left', duration: 1.5, scale: 1.7 },
      ],
      [
        { pulse: 'eqn', elements: ['hyp_2', 'hyp_2s'], yAlign: 'top', duration: 1.5, scale: 1.3, centerOn: 'hyp_2', xAlign: 'left' },
        { pulse: 'circ.triSinCos.unit.label', xAlign: 'right', yAlign: 'bottom', duration: 1.5, scale: 2 },
      ],
      { goToForm: 'eqn', target: 'build2', delay: 0, duration: 1 },
      { goToForm: 'eqn', target: 'build3', delay: 2.3, duration: 1 },
    ],
    // time: '4:48.5',
  });
  slides.push({
    addReference: true,
    enterStateCommon: () => figure.fnMap.exec('circSetup', [0.9, 'quarter']),
    transition: [
      { pulseAngle: { circ: ['triSinCos.theta', 'triTanSec.theta', 'triCotCsc.theta', 'triSinCos.rightSin', 'triTanSec.rightTan', 'triCotCsc.rightCot'] }, duration: 1.5 },
    ],
    // time: '5:15.2',
  });
  slides.push({
    transition: [
      // {
      //   pulse: 'circ.triSinCos', scale: 1.2, xAlign: 'right', yAlign: 'bottom', duration: 1.5,
      // },
      // {
      //   pulse: 'circ.triCotCsc', scale: 1.2, xAlign: 'center', yAlign: 'middle', duration: 1.5, delay: 0.5,
      // },
      { out: 'circ.triSinCos' },
    ],
    // time: '5:26.5',
  });
  // slides.push({ form: 'build1' });
  // slides.push({ form: 'build2' });
  // slides.push({ form: 'build3' });
  // slides.push({ form: 'build4' });

  // Cot Column
  slides.push({
    showCommon: { circ: ['triTanSec', 'triCotCsc'] },
    form: 'build4',
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      circ.highlight('triCotCsc');
    },
    transition: [
      { goToForm: 'eqn', target: 'build4' },
    ],
    // time: '5:27.5',
  });

  // Tan Column
  slides.push({
    form: 'full',
    showCommon: {
      circ: ['triTanSec'],
    },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      // circ.highlight('triTanSec');
      circ.highlight('triCotCsc');
    },
    transition: [
      { out: 'circ.triCotCsc', delay: 1 },
      [
        { undim: ['circ.triTanSec.tan', 'circ.triTanSec.sec', 'circ.triTanSec.unit'], duration: 1 },
        { scenario: 'circ', target: 'tanSecTri', duration: 1.5 },
      ],
      { goToForm: 'eqn', target: 'full' },
    ],
    // time: '5:29',
  });

  slides.push({
    addReference: true,
    // time: '5:34',
    scenarioCommon: 'tanSecTri',
    showCommon: { circ: ['theta', 'triTanSec.tan', 'triTanSec.sec', 'triTanSec.rightTan', 'rotator', 'xQ1'] },
    enterStateCommon: () => figure.fnMap.exec('circSetup', [0.9, 'quarter']),
    transition: [
      [
        { out: 'circ.triTanSec.unit' },
        { in: { circ: [
          'triSinCos.sin', 'triSinCos.cos', 'triSinCos.rightSin',
          'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.rightCot',
          'arc', 'yQ1',
        ] } },
        { trigger: 'updateRotation' },
      ],
    ],
    // dissolve: {
    //   out: 'circ.triTanSec.unit',
    //   in: {
    //     circ: [
    //       'triSinCos.sin', 'triSinCos.cos', 'triSinCos.rightSin',
    //       'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.rightCot',
    //       'arc', 'yQ1',
    //     ],
    //   },
    // },
  });

  // Simplify
  slides.push({
    // time: '5:36',
    showCommon: { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.rightTan', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triSinCos.cos', 'triCotCsc.cot', 'triCotCsc.csc', 'radius', 'xRadius', 'secLight', 'cscLight', 'cotLight', 'tanLight', 'sinLight', 'theta'] },
    form: 'fullBoxes',
  });
  slides.push({
    // time: '5:38',
    form: 'fullNamesBoxes',
    transition: { goToForm: 'eqn', target: 'fullNamesBoxes', duration: 3 },
  });
  slides.push({ time: '5:42', form: 'fullNames' });
  slides.push({ time: '5:54', form: 'keep' });
  slides.push({
    // time: '5:59',
    form: 'final',
    transition: [
      [
        { goToForm: 'eqn', target: 'finalPreK', duration: 3, dissolveOutTime: 0.5, delay: 0 },
        { scenario: 'circ', target: 'circQ1Values', duration: 2.5, delay: 1 },
      ],
      { goToForm: 'eqn', target: 'final', duration: 0.5 },
    ],
  });
  // slides.push({ time: '5:50', form: 'final' });
  // slides.push({
  //   scenarioCommon: 'circQ1Values',
  //   time: '6:02.5',
  //   form: 'final',
  //   transition: { goToForm: 'eqn', target: 'final', duration: 0.5 },
  // });

  // // Simplify
  // slides.push({
  //   addReference: true,
  //   time: '5:50',
  //   form: 'final',
  //   transition: [
  //     { goToForm: 'eqn', target: 'strike', duration: 0.5 },
  //     { delay: 1 },
  //     [
  //       { goToForm: 'eqn', target: 'finalPre', duration: 3, dissolveOutTime: 1, delay: 0 },
  //       { scenario: 'circ', target: 'circQ1', duration: 3, delay: 1 },
  //     ],
  //     { goToForm: 'eqn', target: 'final', duration: 0.5 },
  //   ],
  //   // transition: (done) => {
  //   //   eqn.animations.new()
  //   //     // .goToForm({ target: 'fullBoxes', animate: 'move', duration: 1 })
  //   //     // .delay(2)
  //   //     .goToForm({ target: 'strike', animate: 'move', duration: 1 })
  //   //     // .dim({
  //   //     //   elements: eqn.getPhraseElements(['cosSin', 'oneCsc', 'cotCsc', 'oneCot', 'cscCot']),
  //   //     //   duration: 1,
  //   //     // })
  //   //     .inParallel([
  //   //       eqn.animations.goToForm({
  //   //         target: 'finalPre', duration: 3, animate: 'move', dissolveOutTime: 2, delay: 1,
  //   //       }),
  //   //       circ.animations.scenario({ target: 'circQ1', duration: 3, delay: 3 }),
  //   //     ])
  //   //     .goToForm({
  //   //       target: 'final', duration: 0.4, animate: 'move', dissolveOutTime: 0.5, delay: 0,
  //   //     })
  //   //     .whenFinished(done)
  //   //     .start();
  //   // },
  //   // steadyState: () => {
  //   //   eqn.undim();
  //   //   circ.setScenario('circQ1');
  //   // },
  // });

  // Values
  slides.push({
    // time: '6:22',
    scenarioCommon: ['circQ1Values', 'eqn1TopRight'],
    form: 'value',
    addReference: true,
    transition: (done) => {
      eqn.showForm('value');
      circ.show('thetaVal');
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      eqn.showForm('final');
      circ.hide('thetaVal');
      eqn.animations.new()
        .inParallel([
          eqn.animations.goToForm({ target: 'value', duration: 1, animate: 'move' }),
          circ.animations.dissolveOut({ element: 'theta.label', duration: 0.2 }),
          circ.animations.dissolveIn({ element: 'thetaVal.label', duration: 0.2, delay: 0.2 }),
        ])

        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.hide('theta');
      circ.show('thetaVal');
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
    },
    leaveState: () => eqn.undim(),
    exec: [
      ['6:43.5', 'eqn1SinCosOne'],
      ['6:53', 'eqn1SinCosMag'],
      ['7:09', 'eqn1TanSecOne'],
      ['7:16', 'eqn1SecTan'],
      ['7:36.5', 'eqn1Lim'],
      ['7:53.5', 'eqn1CscSec'],
      ['8:00.5', 'eqn1SinCos'],
      ['8:03.5', 'eqn1TanCot'],
    ],
  });

  /*
  ..######..####.########...######..##.......########
  .##....##..##..##.....##.##....##.##.......##......
  .##........##..##.....##.##.......##.......##......
  .##........##..########..##.......##.......######..
  .##........##..##...##...##.......##.......##......
  .##....##..##..##....##..##....##.##.......##......
  ..######..####.##.....##..######..########.########
  */
  slides.push({
    show: 'circ.thetaVal',
    hide: 'circ.theta',
    // time: '8:09',
    addReference: true,
    transition: (done) => {
      // figure.fnMap.exec('circSetup', 0.9, 'circle');
      circ.animations.new()
        .scenario({ target: 'circFull', duration: 2 })
        .trigger({ callback: 'circSetup', payload: [0.9, 'circle'] })
        .dissolveIn({ elements: ['circle', 'x', 'y', 'rotatorFull'], duration: 0.5 })
        .dissolveOut({ elements: ['rotator'], duration: 0 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.setScenario('circFull');
      circ.hide('rotator');
      circ.show(['x', 'y', 'circle', 'rotatorFull']);
      figure.fnMap.exec('circSetup', [0.9, 'circle']);
      // console.log('adding Reference')
      // circ.animations.cleanAnimations();
      // figure.recorder.addCurrentStateAsReference();
    },
    leaveState: () => eqn.undim(),
  });

  slides.push({
    scenarioCommon: 'circFull',
    showCommon: { circ: ['circle', 'x', 'y', 'rotatorFull', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.rightTan', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triSinCos.cos', 'triCotCsc.cot', 'triCotCsc.csc', 'radius', 'xRadius', 'secLight', 'cscLight', 'cotLight', 'tanLight', 'sinLight', 'thetaVal', 'radiusAlt.line'] },
    show: 'circ.thetaVal',
    hide: { circ: ['theta', 'secLight', 'cscLight', 'cotLight', 'tanLight', 'sinLight'] },
    // time: '8:12.5',
    transition: (done) => {
      figure.fnMap.exec('circSetup', [0.9, 'circle']);
      circ.hasTouchableElements = false;
      circ.hide(['secLight', 'cscLight', 'cotLight', 'tanLight', 'sinLight']);
      circ.animations.new()
        .dissolveOut({
          elements: [
            'triTanSec.tan.label', 'triTanSec.sec.label',
            'triCotCsc.cot.label', 'triCotCsc.csc.label',
            'triSinCos.cos.label',
          ],
        })
        .trigger({ callback: 'circToCosUp' })
        .scenarios({ target: 'trans1', duration: 2 })
        .scenarios({ target: 'trans2', duration: 2 })
        // .trigger({ callback: 'circToAlt' })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.hasTouchableElements = true;
      eqn.showForm('valueAlt');
      figure.fnMap.exec('circToAlt', 0.9, 'circle');
      figure.fnMap.exec('circSetup', [0.9, 'circle']);
      // circ.animations.cleanAnimations();
      // figure.recorder.addCurrentStateAsReference();
    },
    leaveState: () => {
      circ.setScenarios('noSplit');
      eqn.undim();
    },
  });

  slides.push({
    scenarioCommon: ['circFull', 'eqn1Left'],
    showCommon: { circ: ['circle', 'x', 'y', 'rotator', 'sinAlt', 'cosAlt', 'tanAlt', 'secAlt', 'cscAlt', 'cotAlt', 'rightSinAlt', 'rightTanAlt', 'rightCotAlt', 'thetaVal', 'radiusAlt', 'triSym', 'theta'] },
    // enterState: 'circToQuad1',
    hide: ['circ.triSym.point'],
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      figure.fnMap.exec('circToQuad1');
    },
    // time: '8:41',
    // exec: [
      
    // ],
    transition: [
      {
        out: [
          'eqn',
          {
            circ: ['tanAlt', 'secAlt', 'cscAlt', 'cotAlt', 'radiusAlt.label', 'tanLightAlt', 'rightSinAlt', 'rightTanAlt', 'rightCotAlt', 'thetaVal'],
          },
        ],
      },
      { in: ['circ.theta.label', 'circ.triSym.theta.label'] },
    ],
    // exec: [
    //   ['8:51', 'eqn1Coord'],
    //   ['9:24', 'circToQuad2'],
    // ],
  });

  slides.push({
    showCommon: { circ: ['circle', 'x', 'y', 'rotator', 'sinAlt', 'cosAlt', 'triSym', 'theta', 'radiusAlt.line', 'point'] },
    hide: ['circ.point', 'circ.triSym.point'],
    form: { eqn1: 'coord' },
    fromForm: { eqn1: 'xy' },
    transition: [
      { in: 'eqn1' },
      { goToForm: 'eqn1', target: 'coord', delay: 2.7, duration: 2 },
    ],
    // time: '8:50',
    exec: ['8:52.5', 'circPulsePoint'],
  });
  slides.push({
    form: { eqn1: 'sinCosDef' },
    transition: [
      { goToForm: 'eqn1', target: 'sinCosDef', duration: 2.5 },
    ],
    // time: '8:58.5',
  });
  slides.push({
    form: { eqn1: 'coord1' },
    transition: [
      { goToForm: 'eqn1', target: 'coord1', duration: 1.5 },
    ],
    // time: '9:14.5',
  });
  slides.push({
    fromForm: { eqn1: 'coord1' },
    form: { eqn1: null },
    // time: '9:35',
    transition: [
      { out: 'eqn1' },
    ],
    exec: [
      ['9:36', 'circToQuad2'],
      ['9:42', 'circPulsePointSym'],
      ['9:47.5', 'circPulseWidthSinSym'],
      ['9:49.5', 'circPulseWidthCosSym'],
      ['9:52', 'circPulsePoint'],
      ['9:55.5', 'eqn1Q2Sin'],
      ['9:55.5', 'circPulseWidthSinSym'],
      ['9:56.5', 'eqn1Q2SinEq'],
      ['9:59.5', 'circPulseWidthSin'],
      ['10:02', 'eqn1Q2'],
      ['10:02', 'circPulseWidthCosSym'],
      ['10:05', 'circPulseWidthCos'],
    ],
  });
  slides.push({
    fromForm: { eqn1: 'q2' },
    form: { eqn1: null },
    // time: '10:18',
    transition: [
      { out: 'eqn1' },
    ],
    exec: [
      ['10:22', 'circToQuad3'],
      ['10:30.5', 'circPulseWidthSinSym'],
      ['10:31.3', 'circPulseWidthCosSym'],
      ['10:37', 'eqn1Q3Sin'],
      ['10.37', 'circPulseWidthSinSym'],
      ['10:38', 'eqn1Q3SinEq'],
      ['10:40', 'circPulseWidthSin'],
      ['10:41', 'eqn1Q3'],
      ['10:43', 'circPulseWidthCosSym'],
      ['10:46', 'circPulseWidthCos'],
    ],
  });
  slides.push({
    fromForm: { eqn1: 'q3' },
    form: { eqn1: null },
    // time: '10:49',
    transition: [
      { out: 'eqn1' },
    ],
    exec: [
      ['10:50', 'circToQuad4'],

      ['10:59', 'eqn1Q4Sin'],
      ['10:59', 'circPulseWidthSinSym'],
      ['11:01', 'eqn1Q4SinEq'],
      ['11:02.5', 'circPulseWidthSin'],
      ['11:04', 'eqn1Q4'],
      ['11:04.5', 'circPulseWidthCosSym'],
      ['11:07', 'circPulseWidthCos'],
      ['11:17', 'eqn1Q4Neg'],
    ],
  });

  slides.push({
    scenarioCommon: ['circFull', 'eqn1Left'],
    showCommon: { circ: ['circle', 'x', 'y', 'rotatorFull', 'sinAlt', 'cosAlt', 'tanAlt', 'secAlt', 'cscAlt', 'cotAlt', 'rightSinAlt', 'rightTanAlt', 'rightCotAlt', 'thetaVal', 'radiusAlt', 'triSym', 'theta.label'] },
    hide: ['circ.triSym.point'],
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      figure.fnMap.exec('circToQuad1');
    },
    // time: '11:21',
    fromForm: { eqn: 'valueAlt', eqn1: 'q4Neg' },
    form: { eqn: 'valueAlt' },
    transition: [
      { out: ['circ.triSym', 'circ.theta.label', 'eqn1'] },
      {
        in: [
          'eqn',
          {
            circ: ['tanAlt', 'secAlt', 'cscAlt', 'cotAlt', 'radiusAlt.label', 'tanLightAlt', 'rightSinAlt', 'rightTanAlt', 'rightCotAlt', 'thetaVal', 'thetaVal'],
          },
        ],
      },
    ],
  });
  // slides.push({
  //   fromForm: { eqn1: 'q2Sin' },
  //   form: { eqn1: 'q2' },
  //   time: '9:59',
  //   transition: [
  //     { in: 'eqn1' },
  //     { goToForm: 'eqn1', target: 'q2', duration: 1.5, delay: 5 },
  //   ],
  // });
  
  // slides.push({
  //   form: null,
  //   time: '9:24',
  //   transition: 'circToQuad2',
  // });

  nav.loadSlides(slides);
  // nav.goToSlide(53);
  nav.goToSlide(0);
}
makeSlides();
