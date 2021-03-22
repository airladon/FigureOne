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
    enterStateCommon: () => {
      figure.fnMap.exec('circDefault');
      figure.fnMap.exec('circTriToCos');
    },
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
        { in: 'circ.sinTheta' },
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
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightSin', 'theta', 'unitHyp', 'sin.line', 'sinTheta'] },
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
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightSin', 'theta', 'unitHyp', 'sin.line', 'sinTheta', 'thetaCompSin'] },
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
        { in: 'circ.cosTheta' },
        { pulse: 'circ.cosTheta', delay: 0.2, yAlign: 'top' },
      ],
    ],
    form: { eqn: null, eqn2: 'cos' },
  });

  slides.push({
    addReference,
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightSin', 'theta', 'unitHyp', 'sin.line', 'sinTheta', 'thetaCompSin', 'cosTheta', 'cos.line'] },
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
        { out: { circ: ['sin.line', 'cos', 'cosTheta', 'sinTheta', 'rightSin', 'unitHyp'] } },
        { out: 'eqn' },
      ],
      { trigger: 'circTriAnimateToTan', duration: 2 },
      { in: 'circ.rightTan' },
      { in: 'circ.unitAdj' },
    ],
    form: null,
    steadyStateCommon: 'circTriToTan',
  });

  slides.push({
    addReference,
    scenarioCommon: ['circRight', 'eqnCenterLeftSingle', 'linesCenter'],
    enterStateCommon: () => {
      figure.fnMap.exec('circDefault');
      figure.fnMap.exec('circTriToTan');
    },
    enterState: 'linesSetOutside',
    transition: [
      [
        { in: 'lines.circle' },
        { in: 'lines.line' },
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
      [
        { in: 'circ.tan.line' },
        { pulseWidth: 'circ.tan', delay: 0.2, line: 6 },
      ],
      [
        { in: 'circ.tanTheta' },
        { pulse: 'circ.tanTheta', delay: 0.2, xAlign: 'left' },
      ],
    ],
    steadyState: 'linesSetTan',
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
    enterState: 'linesSetTan',
    show: ['circ.tan.line', 'circ.tanTheta', 'lines.circle', 'lines.line'],
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
      [
        { in: 'circ.sec.line' },
        { pulseWidth: 'circ.sec', delay: 0.2, line: 6 },
      ],
      [
        { in: 'circ.secTheta' },
        { pulse: 'circ.secTheta', delay: 0.2, xAlign: 'left', yAlign: 'bottom' },
      ],
    ],
    steadyState: 'linesSetSec',
    // time: '3:53',
    // exec: ['4:14', 'circToRot'],
  });

  slides.push({
    scenario: ['linesDefault', 'eqnCenterLeft'],
    enterState: 'linesSetSec',
    show: ['circ.tan.line', 'circ.sec.line', 'circ.tanTheta', 'circ.secTheta'],
    fromForm: 'adjDen',
    form: 'tanSec',
    transition: [
      { out: { lines: ['secantDef', 'circle', 'line'] } },
      { in: 'eqn' },
      { goToForm: 'eqn', target: 'tan', delay: 1 },
      { goToForm: 'eqn', target: 'tanSec', delay: 1 },
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
    addReference,
    scenario: ['eqnCenterLeft'],
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightUnit', 'theta', 'unitOpp'] },
    fromForm: { eqn: 'tanSec', eqn2: 'tanComp' },
    transition: [
      [
        { out: { circ: ['tan.line', 'tanTheta', 'sec.line', 'secTheta', 'rightTan', 'unitAdj'] } },
        { out: 'eqn' },
      ],
      { trigger: 'circTriAnimateToCot', duration: 2 },
      { in: 'circ.rightUnit' },
      { in: 'circ.unitOpp' },
      [
        { in: 'circ.thetaCompCot' },
        { pulseAngle: 'circ.thetaCompCot', curve: 1.3, label: 1.3 },
      ],
      [
        { in: 'circ.cot.line' },
        { pulseWidth: 'circ.cot', line: 6, delay: 0.2 },
      ],
      [
        { in: 'circ.tanThetaComp.label' },
        { pulseWidth: 'circ.tanThetaComp', line: 6, delay: 0.2 },
      ],
      { in: 'eqn2' },
      { goToForm: 'eqn2', target: 'complementaryTangent', delay: 1 },
      { goToForm: 'eqn2', target: 'cotangent', delay: 1 },
      { goToForm: 'eqn2', target: 'cotan', delay: 1 },
      { goToForm: 'eqn2', target: 'cot', delay: 1 },
      { out: 'circ.tanThetaComp', show: false },
      [
        { in: 'circ.cotTheta' },
        { pulse: 'circ.cotTheta', delay: 0.2, yAlign: 'top' },
      ],
    ],
    form: { eqn: null, eqn2: 'cot' },
    steadyStateCommon: 'circTriToCot',
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
    addReference,
    scenario: ['eqnCenterLeft'],
    show: { circ: ['thetaCompCot', 'cot.line', 'cotTheta'] },
    fromForm: { eqn2: 'tanComp' },
    enterState: 'circTriToCot',
    transition: [
      { out: 'eqn2' },
      [
        { in: 'circ.csc.line' },
        { pulseWidth: 'circ.csc', line: 6, delay: 0.2 },
      ],
      [
        { in: 'circ.secThetaComp.label' },
        { pulseWidth: 'circ.secThetaComp', line: 6, delay: 0.2 },
      ],
      { goToForm: 'eqn2', target: 'secComp', delay: 1, duration: 0 },
      { in: 'eqn2' },
      { goToForm: 'eqn2', target: 'complementarySecant', delay: 1 },
      { goToForm: 'eqn2', target: 'cosecant', delay: 1 },
      { goToForm: 'eqn2', target: 'cosec', delay: 1 },
      { goToForm: 'eqn2', target: 'csc', delay: 1 },
      { out: 'circ.secThetaComp', show: false },
      [
        { in: 'circ.cscTheta' },
        { pulse: 'circ.cscTheta', delay: 0.2, yAlign: 'bottom' },
      ],
    ],
    form: { eqn: null, eqn2: 'csc' },
  });

  slides.push({
    scenario: ['eqnCenterLeft'],
    enterState: 'circTriToCot',
    show: ['circ.csc.line', 'circ.cot.line', 'circ.cscTheta', 'circ.cotTheta'],
    fromForm: { eqn2: 'csc', eqn: 'oppDen' },
    form: 'cotCsc',
    transition: [
      { out: ['eqn2', 'circ.thetaCompCot'] },
      { in: 'eqn' },
      { goToForm: 'eqn', target: 'cot', delay: 1 },
      { goToForm: 'eqn', target: 'cotCsc', delay: 1 },
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
    scenario: ['eqnCenterLeft'],
    enterState: 'circTriToCot',
    showCommon: { circ: ['x', 'y', 'arc', 'sin', 'cos', 'tan', 'sec', 'cot', 'csc', 'unitOpp', 'rotator', 'theta', 'rightSin', 'rightTan', 'rightUnit'] },
    transition: [
      { out: ['eqn', 'circ.cscTheta', 'circCotTheta'] },
      { scenario: 'circ', target: 'center' },
      { in: { circ: ['sin', 'cos', 'tan', 'sec', 'csc.label', 'cot.label', 'rightSin', 'rightTan'] } },
    ],
  });

  nav.loadSlides(slides);
  nav.goToSlide(0);
}
makeSlides();
