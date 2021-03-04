/* eslint-disable camelcase */
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
layoutLines();
layoutRight();
layout();
similarLayout();

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
    time: 21,
  });

  slides.push({
    scenarioCommon: ['default'],
    showCommon: ['title'],
    transition: { in: 'background1' },
    time: 24.5,
  });
  slides.push({
    showCommon: ['background1', 'title'],
    transition: { in: 'background2' },
    time: 26,
  });
  slides.push({
    transition: [
      [{ out: ['background2', 'title'] }, { scenario: 'background1', target: 'center' }],
    ],
    time: 28.5,
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
    transition: [
      { out: 'background1' },
      { in: { 'similar.tris.tri1': ['line', 'angle0', 'angle1', 'angle2'] }, duration: 0.7 },
      { in: { 'similar.tris.tri2': ['line', 'angle0', 'angle1', 'angle2'] }, duration: 0.7 },
      { in: { 'similar.tris.tri3': ['line', 'angle0', 'angle1', 'angle2'] }, duration: 0.7 },
      { in: 'similar.allAngles' },
    ],
    time: 33,
  });

  slides.push({
    show: {
      similar: [{
        'tris.tri1': ['line', 'angle0', 'angle1', 'angle2'],
        'tris.tri2': ['line', 'angle0', 'angle1', 'angle2'],
        'tris.tri3': ['line', 'angle0', 'angle1', 'angle2'],
      }, 'allAngles'],
    },
    fromForm: { 'similar.eqn': 'AB' },
    form: { 'similar.eqn': 'AB' },
    transition: [
      { out: 'similar.allAngles' },
      { in: 'similar.allRatios' },
      { in: { 'similar.tris': ['tri1.side20', 'tri1.side12', 'tri2.side20', 'tri2.side12', 'tri3.side20', 'tri3.side12'] }, delay: 0.5 },
      { delay: 0.5 },
      [
        { scenario: 'similar.tris', target: 'similarSmall', duration: 0.8 },
        { in: 'similar.eqn', delay: 0.3 },
      ],
    ],
    time: 38.5,
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
      figure.fnMap.exec('triSetup', [2, 1.5], 'names');
    },
    time: 49,
    execDelta: [2.5, 'triPulseRight'],
  });

  // Theta and complementary
  slides.push({
    showCommon: { 'rightTri.tri': ['line', 'angle1', 'angle2', 'angle0'] },
    transition: [
      { in: 'rightTri.tri.angle2' },
      { pulseAngle: 'rightTri.tri.angle2', label: { scale: 1.7 }, curve: { scale: 1.7 } },
      { delay: 0.5 },
      { in: 'rightTri.tri.angle0' },
    ],
    time: 53.5,
  });

  slides.push({
    transition: [
      { scenario: 'rightTri', target: 'similar', duration: 1.5 },
      { in: { 'rightTri.tri2': ['line', 'angle2', 'angle0', 'angle1'] } },
      { in: { 'rightTri.tri1': ['line', 'angle2', 'angle0', 'angle1'] } },
      { in: 'rightTri.allTriangles', duration: 1 },
      { in: 'rightTri.haveSameAngles', duration: 1 },
    ],
    time: 60,
  });

  // All right triangles are similar
  slides.push({
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
    time: 66,
  });

  // Show corresponding ratios eqn
  slides.push({
    transition: [
      [
        {
          in: [
            { 'rightTri.tri1': ['side01', 'side12', 'side20'] },
            { 'rightTri.tri2': ['side01', 'side12', 'side20'] },
            { 'rightTri.tri3': ['side01', 'side12', 'side20'] },
            'rightTri.eqn',
          ],
        },
        { out: { rightTri: ['tri1.angle0', 'tri2.angle0', 'tri.angle0'] } },
      ],
    ],
    time: 71.5,
  });

  // Named sides
  slides.push({
    // scenarioCommon: 'similar',
    fromForm: 'ratios',
    form: 'ratios',
    showCommon: {
      rightTri: [
        { tri1: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'] },
        { tri2: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'] },
        { tri3: ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'] },
        { tri: ['line', 'angle1', 'angle2'] },
        'allTriangles', 'areSimilar',
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
          { rightTri: ['eqn', 'allTriangles', 'areSimilar'] },
        ],
      },
      { scenario: 'rightTri', target: 'ratioValues', duration: 1.5 },
      { in: { 'rightTri.tri': ['side01', 'side12', 'side20'] } },
      { in: 'eqn', delay: 0.5 },
    ],
    time: '1:16',
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
    showCommon: {
      'rightTri.tri': ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
      rightTri: ['rotLine', 'movePad'],
    },
    form: 'ratioValues',
    transition: (done) => {
      figure.animations.new()
        .trigger({ callback: 'triAnimateToValues', duration: 0.4 })
        .then(eqn.animations.goToForm({ target: 'ratioValues', animate: 'move' }))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.fnMap.exec('triSetup', [2, 1.5], 'values', true);
    },
    time: '1:22.2',
    exec: ['1:45.7', 'triAnimatePadTo'],
  });

  slides.push({
    showCommon: {
      'rightTri.tri': ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
    },
    form: 'functions',
    transition: (done) => {
      figure.fnMap.exec('triSetup', [2, 1.5], 'values', false);
      figure.animations.new()
        .trigger({ callback: 'triAnimateToNames' })
        .then(eqn.animations.goToForm({ target: 'functions', animate: 'move' }))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.fnMap.exec('triSetup', [2, 1.5], 'names', false);
    },
    time: '1:48',
  });
  slides.push({ form: 'names', time: '1:52', exec: ['1:53.5', 'eqnPulseTrig'] });

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
    time: '2:01',
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
      { in: ['lines.radius', 'lines.rightAngle'], delay: 2.5 },
      { in: 'lines.tangent', delay: 3 },
      { pulse: 'lines.tangent', duration: 1 },
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
    time: '2:09.5',
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
      { pulse: 'circ.triTanSec.rightSin', xAlign: 'right', yAlign: 'bottom' },
      { in: ['circ.triTanSec.tan.label', 'circ.tanTheta.label'], delay: 1 },
      { pulse: ['circ.triTanSec.tan.label', 'circ.tanTheta.label'], xAlign: 'left' },
    ],
    time: '2:28.5',
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
    time: '2:44.5',
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
    scenario: 'linesCenter',
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      circ.highlight(['triTanSec.sec', 'theta']);
    },
    enterState: 'linesSetTan',
    transition: [
      { out: { lines: ['tangentDef', 'radius', 'rightAngle'] } },
      { trigger: 'linesToSec', duration: 2 },
      [
        { in: 'lines.secant', delay: 1 },
        { pulse: 'lines.secant', duration: 1.5, delay: 1.2 },
      ],
      { scenario: 'lines.secant', target: 'linesDefault', delay: 0.6 },
      { in: 'lines.secantDef' },
    ],
    steadyState: 'linesSetSec',
    time: '2:49.5',
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
      {
        pulse: 'circ.arc', translation: 0.01, angle: Math.PI / 4, frequency: 3, min: -0.01, delay: 1.2, duration: 1,
      },
      [
        { in: ['circ.triTanSec.sec.label'] },
        { pulse: ['circ.triTanSec.sec.label'], xAlign: 'left', delay: 0.2 },
      ],
    ],
    steadyState: 'linesSetSec',
    time: '3:00.5',
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
    scenario: 'linesCenter',
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      circ.highlight(['triSinCos.sin', 'theta']);
    },
    transition: [
      { out: 'secantDef' },
      { trigger: 'linesToChord', duration: 3 },
      [
        { in: 'lines.chord', delay: 1.8 },
        { pulse: 'lines.chord', duration: 1.5, delay: 1.8 },
      ],
      { scenario: 'lines.chord', target: 'linesDefault', delay: 0.5 },
      [
        { in: 'lines.chordDef', delay: 0.5 },
        { trigger: 'showBow', duration: 3.5, delay: 0.5 },
      ],
    ],
    steadyState: 'linesSetChord',
    time: '3:12',
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
    time: '3:24.5',
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
      { in: 'circ.thetaComp', delay: 1 },
    ],
    time: '3:46',
  });

  slides.push({
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'cscLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triCotCsc.cot.line', 'thetaComp'],
    },
    fromForm: { 'circ.eqn': 'tanComp' },
    form: { 'circ.eqn': 'cotTheta' },
    transition: [
      { pulseWidth: 'circ.triCotCsc.cot', line: 6, duration: 1.5 },
      { in: 'circ.eqn', delay: 0.5 },
      { goToForm: 'circ.eqn', target: 'complementaryTangent', delay: 2.8 },
      { goToForm: 'circ.eqn', target: 'cotangent', delay: 2 },
      { goToForm: 'circ.eqn', target: 'cotan', delay: 0.5 },
      { goToForm: 'circ.eqn', target: 'cotTheta', delay: 0.5 },
      [
        { in: 'circ.triCotCsc.cot.label' },
        { pulse: 'circ.triCotCsc.cot.label', delay: 0.2, yAlign: 'bottom' },
      ],
    ],
    time: '3:53.5',
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
        { in: 'circ.triCotCsc.csc.label' },
        {
          pulse: 'circ.triCotCsc.csc.label', delay: 0, xAlign: 'right', yAlign: 'bottom',
        },
      ],
    ],
    time: '4:09.8',
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
    time: '4:22.5',
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
    time: '4:35',
  });

  // Split
  slides.push({
    scenario: ['circQ1'],
    transition: [
      [
        { trigger: 'circToSplit', duration: 6 },
        { scenario: 'circ', target: 'split' },
      ],
    ],
    // transition: (done) => {
    //   circ.animations.new()
    //     .inParallel([
    //       circ.animations.trigger({ callback: 'circToSplit', duration: 6 }),
    //       circ.animations.scenario({ target: 'split', duration: 6 }),
    //     ])
    //     .whenFinished(done)
    //     .start();
    // },
    steadyState: () => figure.fnMap.exec('circSetup', [0.9, 'quarter']),
    // steadyState: () => {
    //   circ.undim();
    //   circ.hide(['eqn', 'thetaComp']);
    //   circ.setScenarios('split');
    //   circ.hide(['arc', 'xQ1', 'yQ1', 'rotator', 'theta']);
    //   circ.show(['triSinCos', 'triTanSec', 'triCotCsc']);
    //   figure.fnMap.exec('circSetup', [0.9, 'quarter']);
    // },
    leaveStateCommon: () => {
      circ.setScenarios('noSplit');
      circ.undim();
    },
    time: '4:39',
  });

  // Sin Column
  slides.push({
    showCommon: {
      circ: ['triTanSec', 'triSinCos', 'triCotCsc'],
    },
    enterStateCommon: () => {
      circ.highlight('triSinCos');
      figure.shortCuts = { 0: 'circToRot' };
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
    },
    scenarioCommon: 'split',
    form: 'build0',
  });
  slides.push({ form: 'build1' });
  slides.push({ form: 'build2' });
  slides.push({ form: 'build3' });
  // slides.push({ form: 'build4' });

  // Cot Column
  slides.push({
    form: 'build4',
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      figure.shortCuts = { 0: 'circToRot' };
      circ.highlight('triCotCsc');
    },
    transition: (done) => {
      circ.highlight('triSinCos');
      circ.animations.new()
        .dissolveOut({ element: 'triSinCos', duration: 0.5 })
        .then(circ._triCotCsc.animations.undim({ elements: ['cot', 'csc', 'theta', 'unit'], duration: 0.5 }))
        .then(eqn.animations.goToForm({
          target: 'build4', duration: 0.5, animate: 'move', delay: 1,
        }))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.highlight('triCotCsc');
      circ.hide('triSinCos');
    },
  });

  // Tan Column
  slides.push({
    form: 'full',
    showCommon: {
      circ: ['triTanSec', 'triCotCsc'],
    },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      figure.shortCuts = { 0: 'circToRot' };
      circ.highlight('triTanSec');
    },
    transition: (done) => {
      circ.highlight('triCotCsc');
      circ.animations.new()
        .dissolveOut({ element: 'triCotCsc', duration: 0.5 })
        .inParallel([
          circ._triTanSec.animations.undim({ elements: ['tan', 'sec', 'theta', 'unit'], duration: 0.5 }),
          circ.animations.scenarios({ duration: 1, target: 'tanSecTri' }),
        ])
        .then(eqn.animations.goToForm({
          target: 'full', duration: 0.5, animate: 'move', delay: 1,
        }))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.highlight('triTanSec');
      circ.hide('triCotCsc');
      circ.setScenario('tanSecTri');
    },
  });

  slides.push({
    scenarioCommon: 'tanSecTri',
    showCommon: { circ: ['theta', 'triTanSec.tan', 'triTanSec.sec', 'triTanSec.rightTan', 'rotator', 'xQ1'] },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      figure.shortCuts = { 0: 'circToRot' };
    },
    dissolve: {
      out: 'circ.triTanSec.unit',
      in: {
        circ: [
          'triSinCos.sin', 'triSinCos.cos', 'triSinCos.rightSin',
          'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.rightCot',
          'arc', 'yQ1',
        ],
      },
    },
  });

  // Simplify
  slides.push({
    showCommon: { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.rightTan', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triSinCos.cos', 'triCotCsc.cot', 'triCotCsc.csc', 'radius', 'xRadius', 'secLight', 'cscLight', 'cotLight', 'tanLight', 'sinLight', 'theta'] },
    form: 'fullBoxes',
  });
  slides.push({ form: 'fullNames' });

  // Simplify
  slides.push({
    form: 'final',
    transition: (done) => {
      eqn.animations.new()
        // .goToForm({ target: 'fullBoxes', animate: 'move', duration: 1 })
        // .delay(2)
        .goToForm({ target: 'strike', animate: 'move', duration: 1 })
        // .dim({
        //   elements: eqn.getPhraseElements(['cosSin', 'oneCsc', 'cotCsc', 'oneCot', 'cscCot']),
        //   duration: 1,
        // })
        .inParallel([
          eqn.animations.goToForm({
            target: 'finalPre', duration: 3, animate: 'move', dissolveOutTime: 2, delay: 1,
          }),
          circ.animations.scenario({ target: 'circQ1', duration: 3, delay: 3 }),
        ])
        .goToForm({
          target: 'final', duration: 0.4, animate: 'move', dissolveOutTime: 0.5, delay: 0,
        })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      eqn.undim();
      circ.setScenario('circQ1');
    },
  });

  // Values
  slides.push({
    scenarioCommon: 'circQ1',
    form: 'value',
    transition: (done) => {
      eqn.showForm('value');
      circ.show('thetaVal');
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      eqn.showForm('final');
      circ.hide('thetaVal');
      eqn.animations.new()
        .inParallel([
          eqn.animations.goToForm({ target: 'value', duration: 1, animate: 'move' }),
          circ.animations.dissolveOut({ element: 'theta', duration: 0.5 }),
          circ.animations.dissolveIn({ element: 'thetaVal', duration: 0.5, delay: 0.5 }),
        ])

        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.hide('theta');
      circ.show('thetaVal');
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      figure.shortCuts = {
        1: 'eqn1SinCosOne',
        2: 'eqn1TanSecOne',
        3: 'eqn1SecTan',
        4: 'eqn1CscSec',
        0: 'circToRot',
      };
      // figure.recorder.addCurrentStateAsReference();
    },
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
  });

  slides.push({
    scenarioCommon: 'circFull',
    showCommon: { circ: ['circle', 'x', 'y', 'rotatorFull', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.rightTan', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triSinCos.cos', 'triCotCsc.cot', 'triCotCsc.csc', 'radius', 'xRadius', 'secLight', 'cscLight', 'cotLight', 'tanLight', 'sinLight', 'thetaVal', 'radiusAlt.line'] },
    show: 'circ.thetaVal',
    hide: { circ: ['theta', 'secLight', 'cscLight', 'cotLight', 'tanLight', 'sinLight'] },
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
    },
  });


  nav.loadSlides(slides);
  // nav.goToSlide(53);
  nav.goToSlide(0);
}
makeSlides();
