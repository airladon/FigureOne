/* eslint-disable camelcase, object-curly-newline */
/* globals figure makeEquation, layoutRight, centerText, leftText */

function layout() {
  figure.add([
    // centerText('angleSum', 'A triangle\'s angles sum to 180\u00b0', {}, [0, 1]),
    centerText('trig', 'Trigonmetric Functions', {}, [0, 1]),
    // leftText('similarTriangles', 'Similar Triangles', {}, [0, 1], 0.2, {
    //   left: { position: [-2.2, 0.9] },
    //   center: { position: [-0.5, 0.9] },
    // }),
    // leftText('similarTrianglesEq', 'Similar Triangles: equal corresponding side ratios', {}, [-2.2, 0.9]),
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
layoutCirc();
layoutLines();
layout();

function makeSlides() {
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [3.8, 0], width: 0.2, height: 0.2 },
      prevButton: { position: [-3.8, 0], width: 0.2, height: 0.2 },
      equation: ['eqn', 'eqn2'],
    },
  });
  const slides = [];

  const nav = figure.getElement('nav');
  const lines = figure.getElement('lines');

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
    scenarioCommon: 'center',
    addReference,
    show: 'trig',
    form: 'final',
    exec: [
      ['0:10', 'eqnPulseSin'],
      ['0:10', 'eqnPulseCos'],
      ['0:10', 'eqnPulseTan'],
      ['0:10', 'eqnPulseSec'],
      ['0:10', 'eqnPulseCsc'],
      ['0:10', 'eqnPulseCot'],
    ],
  });

  slides.push({
    addReference,
    form: 'ratios',
    enterStateCommon: 'circDefault',
    enterState: 'circTriToCos',
    transition: [
      { out: 'trig' },
      [
        { scenario: 'eqn', target: 'eqnLeft', duration: 3 },
        { goToForm: 'eqn', target: 'ratios', duration: 2.5 },
      ],
      { in: { circ: ['x', 'y', 'arc'] } },
      [
        { in: 'circ.point' },
        { pulse: 'circ.point', scale: 5 },
      ],
      { in: { circ: ['tri', 'rightSin', 'theta', 'xSide', 'ySide'] } },
    ],
    steadyStateCommon: 'circTriToCos',
  });

  slides.push({
    addReference,
    scenarioCommon: ['center', 'eqnLeft'],
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightSin', 'theta', 'unitHyp'] },
    show: ['circ.xSide', 'circ.ySide'],
    transition: [
      [
        { in: 'circ.unitHyp' },
        { pulseWidth: 'circ.unitHyp', label: { scale: 1.5, xAlign: 'right', yAlign: 'bottom' }, line: 6 },
      ],
      { delay: 1 },
      [
        { goToForm: 'eqn', target: 'sinCos' },
        { scenario: 'eqn', target: 'eqnCenterLeft' },
        { scenario: 'circ', target: 'circRight' },
      ],
      { goToForm: 'eqn', target: 'xyOnOne', delay: 1 },
      { goToForm: 'eqn', target: 'xyOnOneStk', delay: 1 },
      { goToForm: 'eqn', target: 'xy', delay: 1 },
    ],
    form: 'xy',
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
    addReference,
    scenarioCommon: ['circRight', 'eqnCenterLeft', 'linesCenter'],
    enterState: 'linesSetChord',
    transition: [
      { out: ['eqn', 'circ.xSide', 'circ.ySide'] },
      { in: { lines: ['circle', 'line'] }, delay: 1 },
      { delay: 1.3 },
      [
        { in: 'lines.chord' },
        { pulse: 'lines.chord', duration: 1.5, delay: 0.2 },
      ],
      { scenario: 'lines.chord', target: 'linesDefault', delay: 0 },
      [
        { in: 'lines.chordDef', delay: 0.5 },
        { trigger: 'showBow', duration: 2.5, delay: 1 },
      ],
    ],
    form: null,
  });

  // Show sine line, half chord, translation explanation, sineTheta
  slides.push({
    addReference,
    scenarioCommon: ['circRight', 'eqnCenterLeft', 'linesDefault'],
    enterState: 'linesSetChord',
    show: { lines: ['circle', 'line'] },
    transition: [
      [
        { in: 'circ.sin.line' },
        { pulseWidth: 'circ.sin', line: 6, duration: 1.5, delay: 0.2 },
      ],
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
      { in: 'lines.sine', delay: 3 },
      { delay: 3 },
      [
        { in: 'circ.sin.label' },
        { pulse: 'circ.sin.label', delay: 0.2, xAlign: 'left' },
        { in: 'circ.sinTheta.label' },
        { pulse: 'circ.sinTheta.label', delay: 0.2, xAlign: 'left' },
      ],
      { out: 'lines.halfChordLabel', show: false },
    ],
    form: null,
    steadyState: () => {
      lines._line.hide();
      lines._dullChord.show();
      figure.fnMap.exec('setHalfChordLength');
      lines._halfChord.showAll();
    },
  });

  // Opposite over Hypotenuse = sin
  slides.push({
    addReference,
    scenarioCommon: ['circRight', 'eqnCenterLeftSingle', 'linesDefault'],
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightSin', 'theta', 'unitHyp', 'sin', 'sinTheta'] },
    enterState: 'linesSetChord',
    fromForm: 'oppHyp',
    transition: [
      { out: { lines: ['circle', 'dullChord', 'halfChord', 'jya', 'sine'] } },
      { in: 'eqn' },
      { goToForm: 'eqn', target: 'sinOnOne', delay: 1 },
      { goToForm: 'eqn', target: 'sinOnOneStk', delay: 1 },
      { goToForm: 'eqn', target: 'sin', delay: 1 },
    ],
    form: 'sin',
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
    addReference,
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightSin', 'theta', 'unitHyp', 'sin', 'sinTheta', 'thetaCompSin'] },
    fromForm: { eqn: 'sin', eqn2: 'sinComp' },
    transition: [
      [
        { pulse: 'circ.sin.label', delay: 0.2, xAlign: 'left' },
        { pulse: 'circ.sinTheta.label', delay: 0.2, xAlign: 'left' },
      ],
      { pulseAngle: 'circ.theta', curve: 1.8, label: 1.8 },
      [
        { in: 'circ.cos.line' },
        { pulseWidth: 'circ.cos', delay: 0.2, line: 6 },
      ],
      [
        { in: 'circ.thetaCompSin' },
        { pulseAngle: 'circ.thetaCompSin', curve: 1.2, label: 1.2 },
      ],
      { delay: 1 },
      [
        { in: 'circ.sinThetaComp' },
        { pulse: 'circ.sinThetaComp', yAlign: 'top', scale: 1.3 },
      ],
      { out: 'eqn' },
      { in: 'eqn2' },
      { goToForm: 'eqn2', target: 'complementarySine', delay: 1 },
      { goToForm: 'eqn2', target: 'cosine', delay: 1 },
      { goToForm: 'eqn2', target: 'cos', delay: 1 },
      { out: 'circ.sinThetaComp', show: false },
      [
        { in: 'circ.cos.label' },
        { pulse: 'circ.cos.label', delay: 0.2, yAlign: '0.3o' },
        { in: 'circ.cosTheta.label' },
        { pulse: 'circ.cosTheta.label', delay: 0.2, yAlign: '0.3o' },
      ],
    ],
    form: { eqn: null, eqn2: 'cos' },
  });

  slides.push({
    addReference,
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightSin', 'theta', 'unitHyp', 'sin', 'sinTheta', 'thetaCompSin', 'cosTheta', 'cos'] },
    fromForm: { eqn: 'adjHyp', eqn2: 'cos' },
    transition: [
      [
        { out: 'circ.thetaCompSin' },
        { out: 'eqn2' },
      ],
      { in: 'eqn' },
      { goToForm: 'eqn', target: 'cos', delay: 1 },
    ],
    form: { eqn: 'cos', eqn2: null },
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
    addReference,
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightTan', 'theta', 'unitAdj'] },
    fromForm: 'adjHyp',
    transition: [
      [
        { out: { circ: ['sin', 'cos', 'cosTheta', 'sinTheta', 'rightSin', 'unitHyp'] } },
        { out: 'eqn' },
      ],
      { trigger: 'circTriAnimateToTan', duration: 2 },
      { in: 'circ.rightTan' },
      { in: 'circ.unitAdj' },
    ],
    form: null,
    steadyStateCommon: 'circTriToTan',
  });

  // slides.push({
  //   time: '0:21',
  //   addReference,
  //   fromForm: 'values',
  //   form: 'values',
  //   transition: { in: 'eqn' },
  //   exec: ['0:50', 'triResetPad'],
  // });

  // /*
  // ..######..####.##.....##.####.##..........###....########.
  // .##....##..##..###...###..##..##.........##.##...##.....##
  // .##........##..####.####..##..##........##...##..##.....##
  // ..######...##..##.###.##..##..##.......##.....##.########.
  // .......##..##..##.....##..##..##.......#########.##...##..
  // .##....##..##..##.....##..##..##.......##.....##.##....##.
  // ..######..####.##.....##.####.########.##.....##.##.....##
  // */
  // slides.push({
  //   addReference,
  //   time: '0:52',
  //   fromForm: 'values',
  //   form: null,
  //   transition: [
  //     {
  //       out: [
  //         { 'rightTri.tri': ['side01', 'side12', 'side20', 'angle2.label'] },
  //         'eqn',
  //       ],
  //     },
  //     { trigger: 'triToNames' },
  //     { in: 'rightTri.tri.angle2.label', show: true },
  //     { in: 'angleSum' },
  //   ],
  //   steadyState: () => {
  //     figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
  //   },
  //   exec: [
  //     ['0:58.5', 'triPulseRight'],
  //     ['0:59.3', 'triPulseTheta'],
  //   ],
  // });

  // slides.push({
  //   addReference,
  //   time: '1:01.5',
  //   showCommon: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.angle0'] },
  //   show: 'angleSum',
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
  //   },
  //   transition: [
  //     { in: 'rightTri.tri.angle0' },
  //   ],
  // });

  // slides.push({
  //   addReference,
  //   time: '1:02',
  //   scenario: 'center',
  //   transition: [
  //     { out: 'angleSum' },
  //     { scenario: 'rightTri', target: 'twoTri' },
  //     { in: { 'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'] } },
  //     { trigger: 'triPulseThetas', duration: 1.5, delay: 1.8 },
  //     { trigger: 'triPulseAllAngles', duration: 1.5, delay: 0.5 },
  //     { in: 'similarTriangles', delay: 0 },
  //     { scenario: 'similarTriangles', target: 'left', delay: 3.5, duration: 3 },
  //     { in: 'similarTrianglesEq' },
  //   ],
  // });

  // slides.push({
  //   time: '1:22',
  //   addReference,
  //   scenarioCommon: 'twoTri',
  //   fromForm: 'AonB',
  //   form: 'AonCEq',
  //   showCommon: [
  //     { 'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'] },
  //     { 'rightTri.tri2': ['line', 'angle1', 'angle2', 'angle0'] },
  //   ],
  //   transition: [
  //     { out: 'similarTrianglesEq' },
  //     { in: { 'rightTri.tri1': ['side01', 'side12'] } },
  //     { in: 'eqn', delay: 2 },
  //     { in: { 'rightTri.tri2': ['side01', 'side12'] }, delay: 3 },
  //     { goToForm: 'eqn', target: 'AonBEq', delay: 2 },
  //     { in: { rightTri: ['tri1.side20', 'tri2.side20'] }, delay: 3.5 },
  //     { goToForm: 'eqn', target: 'AonCEq', delay: 2 },
  //   ],
  //   leaveState: () => {
  //     rightTri._tri1.undim();
  //     rightTri._tri2.undim();
  //   },
  // });

  // /*
  // .########.##.....##.##....##..######.
  // .##.......##.....##.###...##.##....##
  // .##.......##.....##.####..##.##......
  // .######...##.....##.##.##.##.##......
  // .##.......##.....##.##..####.##......
  // .##.......##.....##.##...###.##....##
  // .##........#######..##....##..######.
  // */
  // slides.push({
  //   time: '1:45',
  //   addReference,
  //   showCommon: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.side01', 'tri.side12', 'tri.side20'] },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('triSetup', [2, 1.453], 'values', true);
  //   },
  //   enterState: () => {
  //     rightTri._tri2.dim();
  //   },
  //   fromForm: 'BonC',
  //   form: 'values',
  //   transition: [
  //     [
  //       { scenario: 'rightTri', target: 'oneTri', duration: 2 },
  //       { undim: { 'rightTri.tri2': ['angle1', 'angle2'] } },
  //       {
  //         out: { 'rightTri.tri1': ['side01', 'side12', 'side20', 'line', 'angle1', 'angle2', 'angle0'] },
  //       },
  //       {
  //         out: { 'rightTri.tri2': ['side01', 'side12', 'side20', 'angle0', 'angle2.label'] },
  //       },
  //       { out: 'eqn', final: false },
  //     ],
  //     { scenario: 'eqn', target: 'oneTri', duration: 0 },
  //     {
  //       in: { 'rightTri.tri': ['side01', 'side12', 'side20', 'angle2.label'], delay: 0.5 },
  //     },
  //     { out: { 'rightTri.tri2': ['side01', 'side12', 'side20', 'line', 'angle1', 'angle2', 'angle0'], duration: 0, delay: 0.5 } },
  //     { trigger: 'eqnInToValues' },
  //   ],
  //   leaveState: () => {
  //     rightTri._tri1.undim();
  //     rightTri._tri2.undim();
  //   },
  //   exec: ['2:00.5', 'triResetPad'],
  // });

  // slides.push({
  //   time: '2:02',
  //   addReference,
  //   scenarioCommon: 'oneTri',
  //   fromForm: 'values',
  //   form: 'functions',
  //   transition: [
  //     { goToForm: 'eqn', target: 'functions' },
  //     { trigger: 'triAnimateToNames', duration: 1, delay: 1 },
  //   ],
  //   steadyState: () => {
  //     figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
  //   },
  // });

  // slides.push({
  //   time: '2:09.5',
  //   addReference,
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('triSetup', [2, 1.453], 'names', true);
  //   },
  //   fromForm: 'functions',
  //   form: 'trig',
  //   exec: [
  //     ['2:11', 'eqnPulseSin'],
  //     ['2:12.2', 'eqnPulseCos'],
  //     ['2:13', 'eqnPulseTan'],
  //     ['2:14', 'eqnPulseSec'],
  //     ['2:15', 'eqnPulseCsc'],
  //     ['2:16', 'eqnPulseCot'],
  //   ],
  // });
  // slides.push({
  //   time: '2:17.5',
  //   addReference,
  //   fromForm: 'trig',
  //   form: 'final',
  //   transition: [
  //     { out: { rightTri: ['tri.line', 'tri.angle1', 'tri.angle2', 'movePad', 'rotLine', 'tri.side01', 'tri.side12', 'tri.side20'] } },
  //     [
  //       { scenario: 'eqn', target: 'center', duration: 3 },
  //       { goToForm: 'eqn', target: 'final', duration: 2.5 },
  //       { in: 'trig', delay: 2 },
  //     ],
  //   ],
  // });

  nav.loadSlides(slides);
  nav.goToSlide(0);
}
makeSlides();
