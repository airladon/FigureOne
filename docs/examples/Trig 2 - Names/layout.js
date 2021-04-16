/* eslint-disable camelcase, object-curly-newline */
/* globals figure makeEquation, centerText, layoutCirc, layoutLines */

function layout() {
  figure.add([
    centerText('trig', 'Trigonmetric Functions', {}, [0, 1]),
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
    enterState: 'eqnColGrey',
    exec: [
      ['0:00.5', 'eqnPulseSin'],
      ['0:00.5', 'eqnPulseCos'],
      ['0:00.5', 'eqnPulseTan'],
      ['0:00.5', 'eqnPulseSec'],
      ['0:00.5', 'eqnPulseCsc'],
      ['0:00.5', 'eqnPulseCot'],
    ],
  });

  slides.push({
    addReference,
    form: null,
    time: '0:07',
    enterStateCommon: 'circTriToCos',
    enterState: 'eqnColGrey',
    transition: [
      { out: ['trig', 'eqn'] },
      { in: { circ: ['x', 'y', 'arc'] }, duration: 1 },
      { delay: 3 },
      [
        { in: 'circ.xy' },
        { pulse: 'circ.xy', scale: 1.5, xAlign: 'left', yAlign: 'bottom' },
        { in: 'circ.point' },
      ],
      { delay: 3 },
      [
        { in: { circ: ['tri', 'rightSin', 'theta'] } },
        { in: { circ: ['xSide', 'ySide'] } },
      ],
    ],
    steadyStateCommon: 'circTriToCos',
  });

  slides.push({
    addReference,
    scenarioCommon: ['center', 'eqnCenterLeft'],
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightSin', 'theta', 'unitHyp'] },
    fromForm: 'sinCos',
    enterState: 'eqnColHyp',
    show: ['circ.xSide', 'circ.ySide', 'circ.xy'],
    time: '0:19.5',
    transition: [
      // [
      { in: 'circ.unitHyp' },
      [
        { pulseWidth: 'circ.unitHyp', label: 1, width: 6, delay: 1 },
        { pulse: 'circ.unitHyp.label', xAlign: 'right', yAlign: 'bottom', delay: 2.5 },
      ],
      { delay: 0.3 },
      [
        { in: 'eqn' },
        { scenario: 'circ', target: 'circRight' },
      ],
      { goToForm: 'eqn', target: 'xyOnOne', delay: 1.8 },
      { goToForm: 'eqn', target: 'xyOnOneStk', delay: 0.7 },
      { goToForm: 'eqn', target: 'xy', delay: 1 },
    ],
    form: 'xy',
    exec: [
      ['0:34.3', 'circPulseX'],
      ['0:34.3', 'circPulseY'],
      ['0:36.3', 'eqnPulseX'],
      ['0:36.3', 'eqnPulseY'],
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
    addReference,
    scenarioCommon: ['circRight', 'eqnCenterLeft', 'linesCenter'],
    enterState: () => {
      figure.fnMap.exec('linesSetChord');
      figure.fnMap.exec('eqnColHyp');
    },
    time: '0:38.5',
    transition: [
      { out: ['eqn', 'circ.xSide', 'circ.ySide'] },
      { in: { lines: ['circle', 'line'] }, delay: 1 },
      { delay: 2.2 },
      [
        { in: 'lines.chord' },
        { pulse: 'lines.chord', duration: 1.5, delay: 0.2 },
      ],
      { scenario: 'lines.chord', target: 'linesDefault', delay: 0 },
      [
        { in: 'lines.chordDef', delay: 0.5 },
        { trigger: 'showBow', duration: 2.5, delay: 0.5 },
      ],
    ],
    form: null,
  });

  // Show sine line, half chord, translation explanation, sineTheta
  slides.push({
    addReference,
    time: '0:48.5',
    scenarioCommon: ['circRight', 'eqnCenterLeft', 'linesDefault'],
    enterState: 'linesSetChord',
    show: { lines: ['circle', 'line'] },
    transition: [
      [
        { in: 'circ.sinTheta.line' },
        { pulseWidth: 'circ.sinTheta', line: 6, duration: 1.5, delay: 0.2 },
      ],
      [
        { trigger: 'showHalfChord', delay: 2.8, duration: 0.8 },
      ],
      [
        { in: 'lines.halfChordLabel' },
        {
          pulse: 'lines.halfChordLabel', scale: 1.3, duration: 1.5, xAlign: 'right',
        },
      ],
      { out: 'lines.chordDef', delay: 1 },
      { in: 'lines.jya' },
      { in: 'lines.latin', delay: 5.5 },
      { in: 'lines.sine', delay: 4.5 },
      { delay: 3.2 },
      [
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
    time: '1:14',
    addReference,
    scenarioCommon: ['circRight', 'eqnCenterLeftSingle', 'linesDefault'],
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightSin', 'theta', 'unitHyp', 'sinTheta'] },
    enterState: () => {
      figure.fnMap.exec('linesSetChord');
      figure.fnMap.exec('eqnColSinCos');
    },
    fromForm: 'oppHyp',
    transition: [
      { out: { lines: ['circle', 'dullChord', 'halfChord', 'jya', 'sine'] } },
      { in: 'eqn' },
      { goToForm: 'eqn', target: 'sinOnOne', delay: 2.5 },
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
    time: '1:23',
    addReference,
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightSin', 'theta', 'unitHyp', 'sinTheta', 'thetaCompSin'] },
    fromForm: { eqn: 'sin', eqn2: 'sinComp' },
    enterState: 'eqnColSinCos',
    transition: [
      [
        { pulse: 'circ.sin.label', xAlign: 'left' },
        { pulse: 'circ.sinTheta.label', xAlign: 'left' },
      ],  // 1:42.5
      { pulseAngle: 'circ.theta', curve: 1.8, label: 1.8, delay: 0.2 }, // 1:44.2
      { delay: 0.3 }, // 1:44.5
      [
        { in: 'circ.cosTheta.line' },
        { pulseWidth: 'circ.cosTheta', delay: 0.2, line: 6 },
      ],  // 1:46
      { delay: 0.7 },  // 1:46.2
      [
        { in: 'circ.thetaCompSin' },
        { pulseAngle: 'circ.thetaCompSin', curve: 1.2, label: 1.2 },
      ],  // 1:47.7
      { delay: 3 }, // 1:51.5
      [
        { in: 'circ.sinThetaComp' },
        { pulse: 'circ.sinThetaComp', yAlign: 'top', scale: 1.3 },
      ],
      { delay: 0.5 },
      { out: 'eqn' },
      { in: 'eqn2' },
      { goToForm: 'eqn2', target: 'complementarySine', delay: 1 },
      { goToForm: 'eqn2', target: 'cosine', delay: 1 },
      { delay: 1 },
      [
        { goToForm: 'eqn2', target: 'cos' },
        { out: 'circ.sinThetaComp', delay: 1, show: false },
        { in: 'circ.cosTheta.label', delay: 1 },
        { pulse: 'circ.cosTheta.label', delay: 1.2, yAlign: 'top' },
      ],
    ],
    form: { eqn: null, eqn2: 'cos' },
  });

  slides.push({
    addReference,
    time: '1:48.5',
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightSin', 'theta', 'unitHyp', 'sinTheta', 'thetaCompSin', 'cosTheta'] },
    fromForm: { eqn: 'adjHyp', eqn2: 'cos' },
    enterState: 'eqnColSinCos',
    transition: [
      [
        { out: 'circ.thetaCompSin' },
        { out: 'eqn2' },
      ],
      { in: 'eqn' },
      { goToForm: 'eqn', target: 'cos', delay: 2 },
    ],
    form: { eqn: 'cos', eqn2: null },
    exec: [
      ['2:00.3', 'circPulseUnitHyp'],
      ['2:02', 'circPulseCos'],
      ['2:02', 'circPulseSin'],
    ],
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
    time: '2:09.5',
    addReference,
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightTan', 'theta', 'unitAdj'] },
    fromForm: 'adjHyp',
    enterState: () => {
      figure.fnMap.exec('eqnColSinCos');
      figure.fnMap.exec('circTriToCos');
    },
    transition: [
      [
        { out: { circ: ['sinTheta', 'cosTheta', 'rightSin', 'unitHyp'] } },
        { out: 'eqn' },
      ],
      { trigger: 'circTriAnimateToTan', duration: 2.5 },
      { in: 'circ.rightTan' },
      { in: 'circ.unitAdj' },
    ],
    form: null,
    steadyStateCommon: 'circTriToTan',
  });

  slides.push({
    time: '2:15.5',
    addReference,
    scenarioCommon: ['circRight', 'eqnCenterLeftSingle', 'linesCenter'],
    enterStateCommon: 'circTriToTan',
    enterState: 'linesSetOutside',
    transition: [
      [
        { in: 'lines.circle' },
        { in: 'lines.line' },
      ],
      { trigger: 'linesToTan', duration: 1.5 },
      { in: ['lines.radius', 'lines.rightAngle'], delay: 1 },
      { delay: 3.5 },
      [
        { in: 'lines.tangent' },
        { pulse: 'lines.tangent', duration: 1.5, delay: 0.2 },
      ],
      { scenario: 'lines.tangent', target: 'linesDefault', delay: 1 },
      { in: 'lines.tangentDef' },
      { delay: 1.5 },
      [
        { in: 'circ.tanTheta.line' },
        { pulseWidth: 'circ.tanTheta', delay: 0.2, line: 6 },
      ],
      { delay: 1.3 },
      [
        { in: 'circ.tanTheta.label' },
        { pulse: 'circ.tanTheta.label', delay: 0.2, xAlign: 'left' },
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
    time: '2:35.5',
    addReference: true,
    scenario: 'linesCenter',
    enterState: 'linesSetTan',
    show: ['circ.tanTheta', 'lines.circle', 'lines.line'],
    transition: [
      { out: { lines: ['tangentDef', 'radius', 'rightAngle'] } },
      { trigger: 'linesToSec', duration: 2 },
      { delay: 0.8 },
      [
        { in: 'lines.secant' },
        { pulse: 'lines.secant', duration: 1.5 },
      ],
      { scenario: 'lines.secant', target: 'linesDefault', delay: 0.8 },
      { in: 'lines.secantDef' },
      { delay: 2.5 },
      [
        { in: 'circ.secTheta.line' },
        { pulseWidth: 'circ.secTheta', delay: 0.2, line: 6 },
      ],
      { delay: 1.2 },
      [
        { in: 'circ.secTheta.label' },
        { pulse: 'circ.secTheta.label', delay: 0.2, xAlign: 'right', yAlign: 'bottom' },
      ],
    ],
    steadyState: 'linesSetSec',
    // time: '3:53',
    // exec: ['4:14', 'circToRot'],
  });

  slides.push({
    time: '2:52',
    addReference,
    scenario: ['linesDefault', 'eqnCenterLeft'],
    enterState: () => {
      figure.fnMap.exec('linesSetSec');
      figure.fnMap.exec('eqnColTanSec');
    },
    show: ['circ.tanTheta', 'circ.secTheta'],
    fromForm: 'adjDen',
    form: 'tanSec',
    transition: [
      { out: { lines: ['secantDef', 'circle', 'line'] } },
      { in: 'eqn' },
      { goToForm: 'eqn', target: 'tan', delay: 1.5 },
      { goToForm: 'eqn', target: 'tanSec', delay: 4 },
    ],
    exec: [
      ['2:52.2', 'circPulseTan'],
      ['2:52.2', 'eqnPulseOpp2'],
      ['2:53', 'circPulseUnitAdj'],
      ['2:53', 'eqnPulseAdj2'],
      ['2:57', 'circPulseSec'],
      ['2:57', 'eqnPulseHyp4'],
      ['2:58', 'circPulseUnitAdj'],
      ['2:58', 'eqnPulseAdj3'],
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
    time: '3:03',
    addReference,
    scenario: ['eqnCenterLeft'],
    showCommon: { circ: ['point', 'x', 'y', 'arc', 'tri', 'rightUnit', 'theta', 'unitOpp'] },
    fromForm: 'tanSec',
    enterState: 'eqnColTanSec',
    transition: [
      [
        { out: { circ: ['tanTheta', 'secTheta', 'rightTan', 'unitAdj'] } },
        { out: 'eqn' },
      ],
      { trigger: 'circTriAnimateToCot', duration: 2.5 },
      { in: 'circ.rightUnit' },
      { in: 'circ.unitOpp' },
    ],
    form: null,
    steadyStateCommon: 'circTriToCot',
  });

  slides.push({
    time: '3:14.5',
    addReference,
    scenario: ['eqnCenterLeft'],
    fromForm: { eqn2: 'tanComp' },
    enterStateCommon: 'circTriToCot',
    transition: [
      { pulseWidth: 'circ.unitOpp', label: { xAlign: 'left', scale: 1.5 }, line: 6 },
      { delay: 1 },
      [
        { in: 'circ.thetaCompCot' },
        { pulseAngle: 'circ.thetaCompCot', curve: 1.3, label: 1.3 },
      ],
      { delay: 2 },
      [
        { in: 'circ.cotTheta.line' },
        { pulseWidth: 'circ.cotTheta', line: 6, delay: 0.2 },
      ],
      { delay: 0.7 },
      [
        { in: 'circ.tanThetaComp.label' },
        { pulse: 'circ.tanThetaComp', delay: 0.2, yAlign: 'top', scale: 1.3 },
      ],
      { in: 'eqn2' },
      { goToForm: 'eqn2', target: 'complementaryTangent', delay: 0.2 },
      { goToForm: 'eqn2', target: 'cotangent', delay: 1.5 },
      { goToForm: 'eqn2', target: 'cotan', delay: 1 },
      [
        { goToForm: 'eqn2', target: 'cot', delay: 1 },
        { out: 'circ.tanThetaComp', show: false, delay: 1 },
        { in: 'circ.cotTheta.label', delay: 1.5 },
        { pulse: 'circ.cotTheta.label', delay: 1.7, yAlign: 'top' },
      ],
    ],
    form: { eqn2: 'cot' },
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
    time: '3:39',
    scenario: ['eqnCenterLeft'],
    show: { circ: ['thetaCompCot', 'cotTheta'] },
    fromForm: { eqn2: 'tanComp' },
    transition: [
      { out: 'eqn2' },
      [
        { in: 'circ.cscTheta.line' },
        { pulseWidth: 'circ.cscTheta', line: 6, delay: 0.2 },
      ],
      { delay: 1 },
      [
        { in: 'circ.secThetaComp' },
        { pulse: 'circ.secThetaComp.label', delay: 0.2, xAlign: 'right', yAlign: 'bottom', scale: 1.3 },
      ],
      { goToForm: 'eqn2', target: 'secComp', delay: 1, duration: 0 },
      { in: 'eqn2' },
      { goToForm: 'eqn2', target: 'complementarySecant' },
      { goToForm: 'eqn2', target: 'cosecant', delay: 1.5 },
      { goToForm: 'eqn2', target: 'cosec', delay: 1 },
      [
        { goToForm: 'eqn2', target: 'csc', delay: 1 },
        { out: 'circ.secThetaComp', show: false },
        { in: 'circ.cscTheta.label', delay: 1 },
        { pulse: 'circ.cscTheta.label', delay: 1.2, yAlign: 'bottom', xAlign: 'right' },
      ],
    ],
    form: { eqn: null, eqn2: 'csc' },
  });

  slides.push({
    time: '3:57',
    addReference,
    scenario: ['eqnCenterLeft'],
    enterState: 'eqnColCotCsc',
    show: ['circ.cscTheta', 'circ.cotTheta'],
    fromForm: { eqn2: 'csc', eqn: 'oppDen' },
    form: 'cotCsc',
    transition: [
      { out: ['eqn2', 'circ.thetaCompCot'] },
      { in: 'eqn' },
      { goToForm: 'eqn', target: 'cot', delay: 2 },
      { goToForm: 'eqn', target: 'cotCsc', delay: 3.5 },
    ],
    exec: [
      ['3:58', 'circPulseCot'],
      ['3:58', 'eqnPulseAdj4'],
      ['3:58.7', 'circPulseUnitOpp'],
      ['3:58.7', 'eqnPulseOpp4'],
      ['4:01.5', 'circPulseCsc'],
      ['4:01.5', 'eqnPulseHyp3'],
      ['4:02.2', 'circPulseUnitOpp'],
      ['4:02.2', 'eqnPulseOpp3'],
    ],
  });

  /*
  ..######..##.....##.##.....##.##.....##....###....########..##....##
  .##....##.##.....##.###...###.###...###...##.##...##.....##..##..##.
  .##.......##.....##.####.####.####.####..##...##..##.....##...####..
  ..######..##.....##.##.###.##.##.###.##.##.....##.########.....##...
  .......##.##.....##.##.....##.##.....##.#########.##...##......##...
  .##....##.##.....##.##.....##.##.....##.##.....##.##....##.....##...
  ..######...#######..##.....##.##.....##.##.....##.##.....##....##...
  */
  slides.push({
    time: '4:09',
    addReference,
    scenario: ['eqnCenterLeft'],
    enterState: 'circTriToCot',
    fromForm: 'cotCsc',
    form: 'namesComp',
    transition: [
      [
        { out: { circ: ['x', 'y', 'arc', 'cscTheta', 'cotTheta', 'unitOpp', 'theta', 'rightUnit', 'point', 'tri'] } },
        { out: 'eqn' },
      ],
      { in: 'trig' },
      { delay: 2 },
      { scenario: 'eqn', target: 'summary', duration: 0 },
      { goToForm: 'eqn', start: null, target: 'namesSinTanSec', duration: 0 },
      { in: 'eqn', duration: 1 },
      { goToForm: 'eqn', target: 'namesAll', dissolveInTime: 1, delay: 4 },
      { goToForm: 'eqn', target: 'namesComp', delay: 3, dissolveInTime: 1 },
    ],
  });

  nav.loadSlides(slides);
  nav.goToSlide(0);

  figure.recorder.loadVideoTrack('./ivid_data.json');
  figure.recorder.loadAudioTrack(new Audio('./audio.mp3'));
}
makeSlides();
