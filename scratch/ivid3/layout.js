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
  const circ = figure.getElement('circ');
  const eqn = figure.getElement('eqn');

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
    exec: ['2:25', 'triAnimatePadTo'],
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

  slides.push({
    form: { eqn1: null },
    scenario: ['eqn1Right', 'circ', 'fromCirc'],
    enterState: () => figure.fnMap.exec('circSetup', [0.9, 'quarter']),
    transition: [
      [
        { out: [
          'eqn1',
          { 'rightTri.tri': ['line', 'angle1', 'angle2'] },
          { lines: ['circleLarge', 'tangentLine', 'radiusLine'] },
        ] },
        { in: { circ: ['arc', 'xQ1', 'yQ1'] } },
      ],
      { scenario: 'circ', target: 'circQ1' },
      [
        { in: ['circ.point', 'circ.rotator'] },
        { pulse: 'circ.point', scale: 3 },
      ],
      [
        { in: 'circ.triTanSec.unit' },
        { pulseWidth: 'circ.triTanSec.unit', line: 1, label: { scale: 2, yAlign: 'top' } },
      ],
      { in: 'circ.radius.line', delay: 0.5 },
      { delay: 1.5 },
      [
        { in: 'circ.theta' },
        { pulseAngle: 'circ.theta' },
      ],


      // { goToForm: 'eqn1', target: 'TangentOneOppAdj', delay: 1 },
      // { goToForm: 'eqn1', target: 'tanOppAdj', delay: 3 },
      // { goToForm: 'eqn1', target: 'oppOnAdjTan', delay: 1 },
    ],
    time: '3:07.5',
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
    scenario: ['circQ1', 'linesCenter'],
    showCommon: { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'radius.line', 'theta', 'point', 'triTanSec.unit'] },
    enterStateCommon: () => figure.fnMap.exec('circSetup', [0.9, 'quarter']),
    enterState: 'linesSetOutside',
    transition: [
      [
        { scenario: 'circ', target: 'nameDefs', duration: 2 },
        { in: 'lines.circle', delay: 1 },
        { in: 'lines.line', delay: 1 },
      ],
      { trigger: 'linesToTan', duration: 1.5 },
      { in: ['lines.radius', 'lines.rightAngle'], delay: 2.5 },
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
    time: '3:17.5',
  });

  slides.push({
    scenarioCommon: 'nameDefs',
    showCommon: [
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'radius.line', 'theta', 'point', 'triTanSec.unit', 'triTanSec.tan.line', 'secLight'] },
      { lines: ['circle', 'line'] },
    ],
    show: { lines: ['tangentDef', 'radius', 'rightAngle'] },
    fromForm: null,
    form: null,
    enterState: 'linesSetTan',
    transition: [
      [
        { length: 'circ.triTanSec.tan', start: 0, duration: 2.5 },
        { in: 'circ.secLight', delay: 2, duration: 1 },
        { in: 'circ.triTanSec.rightTan', delay: 0.5 },
      ],
      // { pulse: 'circ.triTanSec.rightTan', xAlign: 'right', yAlign: 'bottom', delay: 1.3 },
      { delay: 2.7 },
      [
        { in: ['circ.triTanSec.tan.label', 'circ.tanTheta.label'] },
        { pulse: ['circ.triTanSec.tan.label', 'circ.tanTheta.label'], xAlign: 'left', delay: 0.2 },
      ],
    ],
    time: '3:35.5',
    exec: ['3:48', 'circToRot'],
  });

  slides.push({
    scenarioCommon: 'nameDefs',
    showCommon: [
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'radius.line', 'theta', 'point', 'triTanSec.unit', 'triTanSec.tan', 'secLight', 'triTanSec.rightTan'] },
      { lines: ['circle', 'line'] },
    ],
    show: { lines: ['tangentDef', 'radius', 'rightAngle'] },
    enterState: 'linesSetTan',
    transition: { out: 'circ.tanTheta.label' },
    time: '3:50',
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
      circ.highlight(['triTanSec', 'theta']);
    },
    enterState: 'linesSetTan',
    transition: [
      { out: { lines: ['tangentDef', 'radius', 'rightAngle'] } },
      { trigger: 'linesToSec', duration: 2 },
      { delay: 2 },
      [
        { in: 'lines.secant' },
        { pulse: 'lines.secant', duration: 1.5 },
      ],
      { scenario: 'lines.secant', target: 'linesDefault', delay: 0.8 },
      { in: 'lines.secantDef' },
    ],
    steadyState: 'linesSetSec',
    time: '3:53',
    exec: ['4:14', 'circToRot'],
  });

  slides.push({
    showCommon: [
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'radius.line', 'theta', 'point', 'triTanSec.unit', 'triTanSec.tan', 'secLight', 'triTanSec.rightTan', 'triTanSec.sec'] },
      { lines: ['circle', 'line'] },
    ],
    show: { lines: ['secantDef'] },
    fromForm: null,
    form: null,
    enterState: 'linesSetSec',
    transition: [
      { pulseWidth: 'circ.triTanSec.sec', line: 6 },
      { delay: 1.3 },
      [
        { in: ['circ.triTanSec.sec.label'] },
        { pulse: ['circ.triTanSec.sec.label'], xAlign: 'left', delay: 0.2 },
      ],
    ],
    steadyState: 'linesSetSec',
    time: '4:05',
    exec: [
      ['4:19', 'circPulseTan'],
      ['4:20', 'circPulseSec'],
      ['4:21', 'circPulseTanSecUnit'],
    ],
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
    showCommon: [
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'radius.line', 'theta', 'point', 'triTanSec.unit', 'triTanSec.tan', 'secLight', 'triTanSec.rightTan', 'triTanSec.sec', 'tanLight'] },
      { lines: ['circle', 'line'] },
    ],
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      circ.highlight(['triSinCos', 'theta']);
    },
    show: { lines: ['secantDef'] },
    fromForm: null,
    form: null,
    enterState: 'linesSetSec',
    transition: [
      { out: ['lines.secantDef', 'circ.triTanSec.unit', 'circ.triTanSec.tan.line', 'circ.triTanSec.sec.line'] },
      { in: { 'circ.triSinCos': ['sin.line', 'cos.line', 'rightSin', 'unit'] } },
      { delay: 2.4 },
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
    time: '4:25',
  });

  slides.push({
    showCommon: [
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'radius.line', 'theta', 'point', 'triTanSec.tan.label', 'secLight', 'triTanSec.rightTan', 'triTanSec.sec.label', 'tanLight', 'triSinCos.rightSin', 'triSinCos.sin.line', 'triSinCos.cos.line', 'triSinCos.unit'] },
      { lines: ['circle', 'line', 'chordDef'] },
    ],
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
      { out: 'lines.chordDef', delay: 1 },
      { in: 'lines.jya' },
      { in: 'lines.sine', delay: 5 },
      { delay: 6 },
      [
        { in: 'circ.triSinCos.sin.label' },
        { pulse: 'circ.triSinCos.sin.label', delay: 0.2, xAlign: 'left' },
      ],
      { out: 'lines.halfChordLabel', show: false },
    ],
    steadyState: 'linesSetChord',
    time: '4:39.7',
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
    showCommon: [
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'radius.line', 'theta', 'point', 'triTanSec.tan.label', 'secLight', 'triTanSec.rightTan', 'triTanSec.sec.label', 'tanLight', 'triSinCos.rightSin', 'triSinCos.sin', 'triSinCos.cos.line', 'triSinCos.unit'] },
    ],
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      circ.highlight(['triSinCos', 'thetaComp', 'eqn', 'theta']);
    },
    enterState: 'linesSetChord',
    fromForm: { 'circ.eqn': 'sin' },
    form: { 'circ.eqn': 'cos' },
    transition: [
      { out: ['lines.jya', 'lines.dullChord', 'lines.sine', 'lines.circle', 'lines.halfChord'] },
      { pulseWidth: 'circ._triSinCos._cos', line: 6, duration: 1.5 },
      { trigger: 'circToCosUp', duration: 1.5, delay: 0.2 },
      { in: 'circ.eqn' },
      { delay: 1.5 },
      [
        { in: 'circ.thetaComp' },
        { goToForm: 'circ.eqn', target: 'sinComp' },
      ],
      { goToForm: 'circ.eqn', target: 'complementarySine', delay: 1.5 },
      { goToForm: 'circ.eqn', target: 'cosine', delay: 2 },
      [
        { goToForm: 'circ.eqn', target: 'cos', delay: 0.6 },
        { trigger: 'circToCosDown', duration: 1.5, delay: 0.2 },
        { out: 'circ.thetaComp' },
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
    time: '5:03',
    exec: [
      ['5:24', 'circPulseSin'],
      ['5:25', 'circPulseCos'],
      ['5:26', 'circPulseSinCosUnit'],
    ],
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
    showCommon: [
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'radius.line', 'theta', 'point', 'triTanSec.tan.label', 'secLight', 'triTanSec.rightTan', 'triTanSec.sec.label', 'tanLight', 'triSinCos.rightSin', 'triSinCos.sin.label', 'triSinCos.cos', 'sinLight', 'triCotCsc.unit', 'triCotCsc.rightCot'] },
    ],
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      circ.highlight(['triCotCsc', 'thetaComp', 'eqn']);
    },
    fromForm: { 'circ.eqn': 'tanComp' },
    form: { 'circ.eqn': 'cot' },
    transition: [
      // { out: ['circ.eqn'] },
      { in: { 'circ.triCotCsc': ['cot.line', 'csc.line', 'unit', 'rightCot'] }, duration: 1 },
      { in: 'circ.thetaComp', delay: 4 },
      { pulseWidth: 'circ.triCotCsc.cot', line: 6, duration: 1.5, delay: 2 },
      { in: 'circ.eqn', delay: 0.5 },
      { goToForm: 'circ.eqn', target: 'complementaryTangent', delay: 1.5 },
      { goToForm: 'circ.eqn', target: 'cotangent', delay: 1.4 },
      { goToForm: 'circ.eqn', target: 'cotan', delay: 0.5 },
      [
        { goToForm: 'circ.eqn', target: 'cotTheta', delay: 0 },
        { in: 'circ.triCotCsc.cot.label', delay: 0.3 },
        { pulse: 'circ.triCotCsc.cot.label', delay: 0.5, yAlign: 'bottom' },
      ],
    ],
    time: '5:28',
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
    showCommon: [
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'radius.line', 'theta', 'point', 'triTanSec.tan.label', 'secLight', 'triTanSec.rightTan', 'triTanSec.sec.label', 'tanLight', 'triSinCos.rightSin', 'triSinCos.sin.label', 'triSinCos.cos', 'sinLight', 'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.unit', 'triCotCsc.rightCot'] },
    ],
    fromForm: { 'circ.eqn': 'secComp' },
    form: { 'circ.eqn': 'csc' },
    transition: [
      [
        { pulseWidth: 'circ.triCotCsc.csc', line: 6, duration: 1.5 },
        { in: 'circ.eqn', delay: 0.5 },
      ],
      { goToForm: 'circ.eqn', target: 'complementarySecant', delay: 1.5 },
      { goToForm: 'circ.eqn', target: 'cosecant', delay: 1.4 },
      { goToForm: 'circ.eqn', target: 'cosec', delay: 0.5 },
      { delay: 0.3 },
      [
        { goToForm: 'circ.eqn', target: 'csc' },
        { in: 'circ.triCotCsc.csc.label', delay: 0.5 },
        {
          pulse: 'circ.triCotCsc.csc.label', delay: 0.7, xAlign: 'right', yAlign: 'bottom',
        },
      ],
    ],
    time: '5:50',
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

  // Split
  slides.push({
    addReference: true,
    // scenario: ['circQ1'],
    showCommon: [
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'radius.line', 'point', 'triTanSec.tan.label', 'secLight', 'triTanSec.rightTan', 'triTanSec.sec.label', 'triTanSec.theta', 'tanLight', 'triSinCos.rightSin', 'triSinCos.sin.label', 'triSinCos.cos', 'sinLight', 'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.unit', 'triCotCsc.rightCot', 'triSinCos.theta'] },
    ],
    form: null,
    enterStateCommon: () => figure.fnMap.exec('circSetup', [0.9, 'quarter']),
    transition: [
      [
        { in: { circ: ['triTanSec.tan.line', 'triTanSec.sec.line', 'triSinCos.sin.line', 'triSinCos.cos.line'] } },
        { out: { circ: ['sinLight', 'point', 'eqn'] } },
        { trigger: 'circToSplit', duration: 6 },
        { scenario: 'circ', target: 'centerSplit', duration: 6 },
      ],
      [
        { pulse: 'circ.triSinCos.unit.label', yAlign: 'bottom', xAlign: 'right' },
        { pulse: 'circ.triTanSec.unit.label' },
        { pulse: 'circ.triCotCsc.unit.label', yAlign: 'top' },
      ],
    ],
    steadyState: () => figure.fnMap.exec('circSetup', [0.9, 'quarter']),
    leaveStateCommon: () => {
      circ.setScenarios('noSplit');
      circ.undim();
    },
    time: '6:05.5',
    exec: [
      ['6:18', 'circPulseSinCosUnit'],
      ['6:20.5', 'circPulseCotCscUnit'],
      ['6:22', 'circPulseTanSecUnit'],
    ],
  });

  slides.push({
    addReference: true,
    // scenario: ['circQ1'],
    scenario: ['split', 'centerSplit'],
    showCommon: [
      { circ: ['triTanSec', 'triSinCos', 'triCotCsc'] },
    ],
    fromForm: 'ratios',
    form: 'ratios',
    enterStateCommon: () => figure.fnMap.exec('circSetup', [0.9, 'quarter']),
    transition: [
      [
        { scenario: 'circ', target: 'centerRightSplit' },
        { in: 'eqn' },
      ],
    ],
    time: '6:23.5',
    exec: [
      ['6:25', 'eqnPulseOppHypS'],
      ['6:25', 'eqnPulseAdjHypS'],
      ['6:27.5', 'eqnPulseHypOpp'],
      ['6:27.5', 'eqnPulseAdjOpp'],
      ['6:29.5', 'eqnPulseHypAdj'],
      ['6:29.5', 'eqnPulseOppAdj'],
      ['6:45.5', 'eqnPulseOppAdj'],
    ],
  });

  // Sin Column
  slides.push({
    showCommon: { circ: ['triTanSec', 'triSinCos', 'triCotCsc'] },
    enterStateCommon: () => {
      circ.highlight('triSinCos');
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
    },
    scenarioCommon: ['split', 'centerRightSplit'],
    form: 'build3',
    transition: [
      { scenario: 'circ', target: 'split', duration: 1 },
      { delay: 1 },
      [
        { pulse: 'eqn', elements: ['opp_1', 'opp_1s'], yAlign: 'bottom', duration: 1.5, centerOn: 'opp_1', xAlign: 'left', scale: 1.4 },
        { pulse: 'circ.triSinCos.sin.label', xAlign: 'left', duration: 1.3, scale: 1.7 },
      ],
      [
        { pulse: 'eqn', elements: ['hyp_1', 'hyp_1s'], yAlign: 'top', duration: 1.3, scale: 1.5, centerOn: 'hyp_1', xAlign: 'left' },
        { pulse: 'circ.triSinCos.unit.label', xAlign: 'right', yAlign: 'bottom', duration: 1.3, scale: 2 },
      ],
      { goToForm: 'eqn', target: 'build0', duration: 1, delay: 1.5 },
      { goToForm: 'eqn', target: 'build1', delay: 1, duration: 1 },
      { delay: 2.5 },
      [
        { pulse: 'eqn', elements: ['adj_1', 'adj_1s'], yAlign: 'bottom', duration: 1.5, centerOn: 'adj_1', xAlign: 'left', scale: 1.3 },
        { pulse: 'circ.triSinCos.cos.label', xAlign: 'left', duration: 1.5, scale: 1.7 },
      ],
      [
        { pulse: 'eqn', elements: ['hyp_2', 'hyp_2s'], yAlign: 'top', duration: 1.5, scale: 1.3, centerOn: 'hyp_2', xAlign: 'left' },
        { pulse: 'circ.triSinCos.unit.label', xAlign: 'right', yAlign: 'bottom', duration: 1.5, scale: 2 },
      ],
      { goToForm: 'eqn', target: 'build2', delay: 0, duration: 1 },
      { goToForm: 'eqn', target: 'build2a', delay: 4, duration: 1 },
      { goToForm: 'eqn', target: 'build3', delay: 2.3, duration: 1 },
    ],
    time: '6:56',
  });
  slides.push({
    addReference: true,
    form: 'fullBoxes',
    scenarioCommon: ['split'],
    enterStateCommon: () => figure.fnMap.exec('circSetup', [0.9, 'quarter']),
    transition: [
      { pulseAngle: { circ: ['triSinCos.theta', 'triTanSec.theta', 'triCotCsc.theta', 'triSinCos.rightSin', 'triTanSec.rightTan', 'triCotCsc.rightCot'] }, duration: 1.5 },
      { out: 'circ.triSinCos', duration: 1, delay: 1 },
      { goToForm: 'eqn', target: 'build4', delay: 1.5 },
      { out: 'circ.triCotCsc', delay: 1.5 },
      { scenario: 'circ', target: 'tanSecTri', duration: 1.5 },
      { goToForm: 'eqn', target: 'full', delay: 0.5 },
      { goToForm: 'eqn', target: 'fullBoxes', delay: 4.5 },
    ],
    time: '7:24.5',
  });


  slides.push({
    addReference: true,
    // time: '5:34',
    scenarioCommon: 'tanSecTri',
    showCommon: { circ: ['theta', 'triTanSec.tan', 'triTanSec.sec', 'triTanSec.rightTan', 'rotator', 'xQ1'] },
    enterStateCommon: () => figure.fnMap.exec('circSetup', [0.9, 'quarter']),
    fromForm: 'fullBoxes',
    form: 'fullNames',
    transition: [
      [
        { out: 'circ.triTanSec.unit' },
        { in: { circ: [
          'triSinCos.sin', 'triSinCos.cos', 'triSinCos.rightSin',
          'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.rightCot',
          'arc', 'yQ1',
        ] } },
        { trigger: 'updateRotation' },
        { goToForm: 'eqn', target: 'fullNamesBoxes', duration: 2 },
      ],
      { goToForm: 'eqn', target: 'fullNames', delay: 2 },
    ],
    time: '7:41',
  });

  slides.push({
    time: '7:56',
    form: 'final',
    showCommon: { circ: ['theta', 'triTanSec.tan', 'triTanSec.sec', 'triTanSec.rightTan', 'rotator', 'xQ1', 'triSinCos.sin', 'triSinCos.cos', 'triSinCos.rightSin', 'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.rightCot', 'arc', 'yQ1'] },
    transition: [
      { goToForm: 'eqn', target: 'keep' },
      { delay: 4 },
      [
        { goToForm: 'eqn', target: 'finalPreK', duration: 4, dissolveOutTime: 0.5, delay: 0 },
        { scenario: 'circ', target: 'circQ1Values', duration: 3.5, delay: 1 },
      ],
      { goToForm: 'eqn', target: 'final', duration: 0.5 },
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
    scenario: 'circQ1Values',
    addReference: true,
    transition: [
      { scenario: 'circ', target: 'circFull', duration: 3 },
      { trigger: 'circSetup', payload: [0.9, 'circle'] },
      [
        { in: { circ: ['circle', 'x', 'y', 'rotatorFull', 'xy.line', 'point'] } },
        { out: 'circ.rotator' },
      ],
      [
        { out: { circ: ['triTanSec.tan', 'triTanSec.sec', 'triTanSec.rightTan', 'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.rightCot'] }, delay: 3 },
      ],
      // { delay: 1 },
      [
        { pulse: 'circ.triSinCos.cos.label', yAlign: 'top' },
        { pulse: 'circ.triSinCos.sin.label', xAlign: 'left', delay: 0.7 },
      ],
      { delay: 0.8 },
      [
        { in: 'circ.xy.label' },
        { pulse: 'circ.xy.label', delay: 0.5, scale: 1.5, xAlign: 'left', yAlign: 'bottom' },
      ],
    ],
    time: '8:25.5',
  });

  slides.push({
    enterStateCommon: () => figure.fnMap.exec('circSetup', [0.9, 'circle']),
    time: '8:41',
    form: { eqn: 'final', eqn1: 'coord1' },
    showCommon: { circ: ['theta', 'rotatorFull', 'xQ1', 'triSinCos.sin', 'triSinCos.cos', 'triSinCos.rightSin', 'circle', 'x', 'y', 'point', 'xy'] },
    fromForm: {
      eqn: 'final',
      eqn1: 'cosSin',
    },
    scenarioCommon: ['eqn1Left', 'circFull'],
    transition: [
      { out: 'eqn' },
      { delay: 1 },
      { in: 'eqn1' },
      { goToForm: 'eqn1', target: 'cosSinDef', delay: 0.5 },
      { goToForm: 'eqn1', target: 'coord1', delay: 3.5, duration: 1 },
      { goToForm: 'eqn1', target: 'coord2', delay: 4.5, dissolveInTime: 0.5 },
      { goToForm: 'eqn1', target: 'coord1', delay: 6, dissolveOutTime: 0.5 },
    ],
  });
  slides.push({
    time: '9:08',
    form: { eqn: 'final', eqn1: null },
    fromForm: {
      eqn: 'final',
      eqn1: 'coord1',
    },
    transition: [
      { out: 'eqn1' },
      { delay: 1 },
      { in: 'eqn' },
      { delay: 0.5 },
      [
        { pulse: 'eqn.tan_1', xAlign: 'right', duration: 2 },
        { pulse: 'eqn.csc_1', xAlign: 'right', duration: 2 },
        { pulse: 'eqn.sec_1', xAlign: 'right', duration: 2 },
        { pulse: 'eqn.cot_1', xAlign: 'right', duration: 2 },
      ],
      { delay: 1.5 },
      [
        { pulse: 'eqn.sin_2', xAlign: 'right', yAlign: 'bottom', duration: 2 },
        { pulse: 'eqn.sin_3', xAlign: 'right', yAlign: 'top', duration: 2 },
        { pulse: 'eqn.cos_2', xAlign: 'right', yAlign: 'top', duration: 2 },
        { pulse: 'eqn.cos_3', xAlign: 'right', yAlign: 'top', duration: 2 },
        { pulse: 'eqn.tan_1', xAlign: 'right', duration: 2 },
        { pulse: 'eqn.tan_3', xAlign: 'right', yAlign: 'top', duration: 2 },
      ],
    ],
  });
  slides.push({
    time: '9:22',
    showCommon: { circ: ['circle', 'x', 'y', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triSinCos.rightSin', 'triSym', 'theta', 'xy', 'point'] },
    // hide: ['circ.point', 'circ.triSym.point'],
    fromForm: 'final',
    transition: [
      { out: 'eqn' },
      { pulse: { circ: ['x', 'y'] }, scale: 1.3, delay: 0.3 },
    ],
    exec: [
      ['9:26.5', 'circPulseWidthCosLabel'],
      ['9:27.5', 'circPulseWidthSinLabel'],
      ['9:33.5', 'circToQuad2'],
      ['9:43.5', 'circPulseY'],
      ['9:45', 'circPulseX'],
      ['9:50', 'eqn1Q2Sin'],
      ['9:50', 'circPulseWidthSinSym'],
      ['9:52', 'eqn1Q2SinEq'],
      ['9:53', 'circPulseWidthSin'],
      ['9:54.5', 'eqn1Q2'],
      ['9:56', 'circPulseWidthCosSym'],
      ['9:59', 'circPulseWidthCos'],
    ],
  });
  slides.push({
    time: '10:06',
    enterState: 'circToQuad1',
    fromForm: { eqn: null, eqn1: 'eqn1Q2' },
    form: null,
    transition: [
      { out: 'eqn1' },
    ],
    exec: [
      ['10:06.5', 'circToQuad3'],
      ['10:17.5', 'circPulseY'],
      ['10:17.5', 'circPulseX'],
      ['10:21', 'eqn1Q3Sin'],
      ['10:22', 'circPulseWidthSinSym'],
      ['10:22', 'eqn1Q3SinEq'],
      ['10:24', 'circPulseWidthSin'],
      ['10:25', 'eqn1Q3'],
      ['10:25.8', 'circPulseWidthCosSym'],
      ['10:29', 'circPulseWidthCos'],
    ],
  });
  slides.push({
    time: '10:33',
    enterState: 'circToQuad1',
    fromForm: { eqn: null, eqn1: 'eqn1Q3' },
    form: null,
    transition: [
      { out: 'eqn1' },
    ],
    exec: [
      ['10:33.5', 'circToQuad4'],
      ['10:42', 'eqn1Q4Sin'],
      ['10:43', 'circPulseY'],
      ['10:43.5', 'eqn1Q4SinEq'],
      ['10:45', 'circPulseWidthSin'],
      ['10:46', 'eqn1Q4'],
      ['10:47', 'circPulseX'],
      ['10:49', 'circPulseWidthCos'],
      ['10:59', 'eqn1Q4Neg'],
    ],
  });

  /*
  .########..##..........###....##....##
  .##.....##.##.........##.##....##..##.
  .##.....##.##........##...##....####..
  .########..##.......##.....##....##...
  .##........##.......#########....##...
  .##........##.......##.....##....##...
  .##........########.##.....##....##...
  */
  slides.push({
    time: '11:04',
    showCommon: { circ: ['theta', 'triTanSec.tan', 'triTanSec.sec', 'triTanSec.rightTan', 'rotatorFull', 'triSinCos.sin', 'triSinCos.cos', 'triSinCos.rightSin', 'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.rightCot', 'circle', 'x', 'y', 'radiusLight', 'tanLight', 'secLight', 'cscLight', 'sinLight', 'cotLight', 'radius.line'] },
    fromForm: { eqn: 'value' },
    form: 'value',
    transition: [
      { out: { circ: ['triSym.xy', 'triSym.point', 'point', 'theta.label'] } },
      [
        { in: [{ circ: ['triTanSec.tan', 'triTanSec.sec', 'triTanSec.rightTan', 'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.rightCot', 'tanLight', 'secLight', 'cscLight', 'sinLight', 'cotLight', 'thetaValue.label'] }, 'eqn'] },
      ],
      { out: 'circ.radiusLight', duration: 0 },
    ],
    exec: [
      ['11:35', 'eqn1SinCosOne'],
      ['11:45', 'eqn1TanSecOne'],
      ['12:05', 'eqn1Lim'],
      ['12:11', 'circToRot'],
    ],
  });

  slides.push({
    scenarioCommon: 'circFull',
    fromForm: 'valueAlt',
    form: 'valueAlt',
    showCommon: { circ: ['circle', 'x', 'y', 'rotatorFull', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.rightTan', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triSinCos.cos', 'triCotCsc.cot', 'triCotCsc.csc', 'radiusAlt.line', 'xRadius', 'thetaVal', 'radiusAlt.line'] },
    enterState: () => { circ.hasTouchableElements = false; },
    transition: [
      { out: { circ: ['triTanSec.tan.label', 'triTanSec.sec.label', 'triCotCsc.cot.label', 'triCotCsc.csc.label', 'triSinCos.cos.label', 'triSinCos.sin.label'] } },
      { trigger: 'circToCosUp', duration: 1.5 },
      { scenarios: 'circ', target: 'trans1', duration: 2 },
      { scenarios: 'circ', target: 'trans2', duration: 2 },
      [
        { out: { circ: ['triSinCos.sin', 'triSinCos.cos', 'triSinCos.rightSin', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.rightCot', 'triTanSec.rightTan'] }, duration: 0 },
        { in: { circ: ['sinAlt.line', 'cosAlt.line', 'tanAlt.line', 'secAlt.line', 'cscAlt.line', 'cotAlt.line', 'tanLightAlt', 'secLightAlt', 'cscLightAlt', 'cotLightAlt', 'rightSinAlt', 'rightTanAlt', 'rightCotAlt'] }, duration: 0 },
      ],
      { in: { circ: ['sinAlt.label', 'cosAlt.label', 'tanAlt.label', 'secAlt.label', 'cscAlt.label', 'cotAlt.label', 'radiusAlt.label'] } },
    ],
    steadyState: () => {
      circ.hasTouchableElements = true;
    },
    leaveState: () => {
      eqn.undim();
    },
    time: '12:15',
    exec: [
      ['12:57', 'eqn1SinBounds'],
      ['13:04', 'eqn1TanBounds'],
      ['13:15', 'eqn1SecBounds'],
    ],
  });

  slides.push({
    time: '13:56',
  });

  nav.loadSlides(slides);
  nav.goToSlide(0);
}
makeSlides();
