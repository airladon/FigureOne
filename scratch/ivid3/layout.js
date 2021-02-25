/* eslint-disable camelcase */
/* globals figure, colTan, colCot, colCsc, color2, colSec, colTheta
   colCsc, centerText */

function layout() {
  

  figure.add([
    {
      name: 'title',
      method: 'textLines',
      options: {
        text: [
          'The Trigonmetric Functions',
          {
            text: 'Why they exist and where they come from',
            font: { size: 0.1 },
          },
        ],
        position: [0, 1],
        xAlign: 'center',
        justify: 'center',
        font: { size: 0.2, color: [0.3, 0.3, 0.3, 1] },
        fixColor: true,
      },
    },
    centerText('similarTriangles', 'Similar Triangles'),
    // centerText('similarQuestion', 'Are these triangles similar?'),
    centerText('chord', '|chord|: from Latin |chorda| - "bowstring"', {
      chord: { font: { style: 'italic', family: 'Times New Roman', color: colSin } },
      chorda: { font: { style: 'italic', family: 'Times New Roman' } },
    }, [1.3, 0], 0.15),
    centerText('tangent', '|tangent|: from Latin |tangere| - "to touch"', {
      tangent: { font: { style: 'italic', family: 'Times New Roman', color: colTan } },
      tangere: { font: { style: 'italic', family: 'Times New Roman' } },
    }, [1.3, 0], 0.15),
    centerText('secant', '|secant|: from Latin |secare| - "to cut"', {
      secant: { font: { style: 'italic', family: 'Times New Roman', color: colSec } },
      secare: { font: { style: 'italic', family: 'Times New Roman' } },
    }, [1.3, 0], 0.15),
  ]);
  figure.add({
    name: 'cursor',
    method: 'collections.cursor',
    options: {
      color: [0.5, 0.5, 0, 0.7],
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
  const similar = figure.getElement('similar');
  const rightTri = figure.getElement('rightTri');
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
    scenarioCommon: ['title'],
    showCommon: [
      'title',
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc'] }],
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', 0.9, 'title');
    },
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
    dissolve: { in: 'similar.allAngles' },
  });
  slides.push({
    clear: true,
    show: 'similar.allAngles',
    scenario: 'similarLarge',
    dissolve: {
      in: {
        'similar.tris': [
          'tri1.line', 'tri1.angle0', 'tri1.angle1', 'tri1.angle2',
          'tri2.line', 'tri2.angle0', 'tri2.angle1', 'tri2.angle2',
          'tri3.line', 'tri3.angle0', 'tri3.angle1', 'tri3.angle2',
        ],
      },
    },
  });
  slides.push({
    clear: true,
    scenario: 'similarLarge',
    show: {
      similar: [{
        tris: [
          'tri1.line', 'tri1.angle0', 'tri1.angle1', 'tri1.angle2',
          'tri2.line', 'tri2.angle0', 'tri2.angle1', 'tri2.angle2',
          'tri3.line', 'tri3.angle0', 'tri3.angle1', 'tri3.angle2',
        ],
      }, 'allAngles'],
    },
    fromForm: { 'similar.eqn': 'AB' },
    form: { 'similar.eqn': 'AB' },
    transition: (done) => {
      similar._eqn.hide();
      similar.animations.new()
        .dissolveOut({ element: 'allAngles', duration: 0.4 })
        .dissolveIn({ element: 'allRatios', duration: 0.4 })
        .dissolveIn({ elements: { tris: ['tri1.side20', 'tri1.side12', 'tri2.side20', 'tri2.side12', 'tri3.side20', 'tri3.side12'] }, delay: 0.5, duration: 0.5 })
        .inParallel([
          similar.animations.scenario({ element: 'tris', target: 'similarSmall', delay: 0.5, duration: 0.8 }),
          similar.animations.dissolveIn({ element: 'eqn', delay: 0.8, duration: 0.5 }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      similar._tris.show(['tri1.side20', 'tri1.side12', 'tri2.side20', 'tri2.side12', 'tri3.side20', 'tri3.side12']);
      similar.show(['allRatios']);
      similar.hide('allAngles');
      similar._tris.setScenario('similarSmall');
    },
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
    show: ['rightTri.tri.line', 'rightTri.tri.angle1'],
    enterStateCommon: () => {
      figure.fnMap.exec('triSetup', [2, 1.5], 'names');
      figure.shortCuts = {
        1: 'triPulseRight',
        2: 'triPulseTheta',
        3: 'triPulseOpp',
        4: 'triPulseHyp',
        5: 'triPulseAdj',
        0: 'triAnimatePadTo',
      };
    },
  });

  // Theta
  slides.push({
    showCommon: ['rightTri.tri.line', 'rightTri.tri.angle1', 'rightTri.tri.angle2'],
    dissolve: { in: 'rightTri.tri.angle2' },
  });

  // Complementary
  slides.push({
    showCommon: { 'rightTri.tri': ['line', 'angle1', 'angle2', 'angle0'] },
    dissolve: { in: 'rightTri.tri.angle0' },
  });


  slides.push({
    transition: (done) => {
      rightTri.animations.new()
        .scenario({ target: 'similar', duration: 1 })
        .dissolveIn({
          elements: [
            'tri1.line', 'tri2.line',
            'tri1.angle2', 'tri2.angle2',
            'tri1.angle0', 'tri2.angle0',
            'tri1.angle1', 'tri2.angle1',
            'allTriangles', 'haveSameAngles',
          ],
          duration: 0.8,
        })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      rightTri.show([
        'tri1.line', 'tri2.line',
        'tri1.angle2', 'tri2.angle2',
        'tri1.angle0', 'tri2.angle0',
        'tri1.angle1', 'tri2.angle1',
        'allTriangles', 'haveSameAngles',
      ]);
      rightTri.setScenario('similar');
    },
  });
  slides.push({
    scenarioCommon: 'similar',
    showCommon: {
      'rightTri.tri': ['line', 'angle1', 'angle2', 'angle0'],
      'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'],
      'rightTri.tri2': ['line', 'angle1', 'angle2', 'angle0'],
      rightTri: ['allTriangles', 'haveSameAngles'],
    },
    transition: (done) => {
      rightTri.animations.new()
        .dissolveOut({ element: 'haveSameAngles', duration: 0.5 })
        .dissolveIn({ element: 'areSimilar', duration: 0.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      rightTri.show(['areSimilar']);
    },
  });
  slides.push({
    scenarioCommon: 'similar',
    showCommon: {
      'rightTri.tri': ['line', 'angle1', 'angle2', 'angle0'],
      'rightTri.tri1': ['line', 'angle1', 'angle2', 'angle0'],
      'rightTri.tri2': ['line', 'angle1', 'angle2', 'angle0'],
      rightTri: ['allTriangles', 'areSimilar'],
    },
    transition: (done) => {
      rightTri.animations.new()
        .dissolveIn({
          elements: [
            'tri1.side01', 'tri1.side12', 'tri1.side20',
            'tri2.side01', 'tri2.side12', 'tri2.side20',
            'tri3.side01', 'tri3.side12', 'tri3.side20',
            'eqn',
          ],
          duration: 0.5,
        })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      rightTri.show([
        'tri1.side01', 'tri1.side12', 'tri1.side20',
        'tri2.side01', 'tri2.side12', 'tri2.side20',
        'tri3.side01', 'tri3.side12', 'tri3.side20',
        'eqn',
      ]);
    },
  });

  slides.push({
    scenarioCommon: 'similar',
    form: 'ratios',
    fromForm: 'ratios',
    transition: (done) => {
      eqn.hide();
      eqn.setScenario('ratioValues');
      rightTri.animations.new()
        .dissolveOut({
          elements: [
            'tri1', 'tri2', 'tri3', 'eqn', 'allTriangles', 'areSimilar', 'tri.angle0',
          ],
          duration: 0.5,
        })
        .scenario({ start: 'similar', target: 'ratioValues', duration: 1.5 })
        .inParallel([
          rightTri._tri.animations.dissolveIn({ elements: ['side01', 'side12', 'side20'], duration: 0.8 }),
          eqn.animations.dissolveIn(0.8),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      rightTri.hide([
        'tri1', 'tri2', 'tri3', 'eqn', 'allTriangles', 'areSimilar', 'tri.angle0',
      ]);
      rightTri.setScenario('ratioValues');
      rightTri.show(['tri.side01', 'tri.side12', 'tri.side20']);
    },
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
  });
  slides.push({ form: 'names' });

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
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
      figure.shortCuts = {
        0: 'circToRot',
      };
    },
    dissolve: {
      out: { 'rightTri.tri': ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'] },
      in: { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta'] },
    },
    steadyState: () => {
      circ.show(['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc']);
    },
  });

  slides.push({
    scenario: 'circQ1',
    showCommon: { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc', 'sinLight', 'tanLight', 'cscLight', 'secLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta'] },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
      figure.shortCuts = { 0: 'circToRot' };
    },
    transition: (done) => {
      figure.fnMap.exec('linesSetOutside');
      figure.animations.new()
        .inParallel([
          eqn.animations.dissolveOut(0.5),
          circ.animations.scenario({ target: 'nameDefs', duration: 1 }),
          circ.animations.dissolveOut({ elements: ['triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc'], duration: 1 }),
          lines.animations.dissolveIn({ elements: ['circle', 'line'] }),
        ])
        .trigger({ callback: 'linesToTan', duration: 1.5 })
        .dissolveIn({ element: 'lines.tangent', duration: 0.5 })
        .dissolveIn({ elements: ['lines.radius', 'lines.rightAngle'], duration: 0.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.setScenario('nameDefs');
      circ.hide(['triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc']);
      lines.show(['circle', 'line', 'tangent', 'radius', 'rightAngle']);
      figure.fnMap.exec('linesSetTangent');
      eqn.hide();
    },
    leaveStateCommon: () => {
      circ.undim();
    },
  });

  slides.push({
    scenarioCommon: 'nameDefs',
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'sinLight', 'tanLight', 'cscLight', 'secLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.tan', 'theta'],
      lines: ['circle', 'line'],
    },
    show: { lines: ['tangent', 'radius', 'rightAngle'] },
    fromForm: null,
    form: null,
    transition: (done) => {
      circ.animations.new()
        .dissolveIn({ element: 'triTanSec.tan', duration: 0.5 })
        .trigger({ callback: 'circPulseTan', duration: 1.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ._triTanSec._tan.show();
      figure.fnMap.exec('linesSetTan');
    },
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
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
      figure.shortCuts = { 0: 'circToRot' };
      circ.highlight(['triTanSec.sec', 'theta']);
    },
    transition: (done) => {
      lines.animations.new()
        .dissolveOut({ elements: ['tangent', 'radius', 'rightAngle'], duration: 0.5 })
        .trigger({ callback: 'linesToSec', duration: 1.5 })
        .dissolveIn({ element: 'secant', duration: 0.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      lines.show(['circle', 'line', 'secant']);
      figure.fnMap.exec('linesSetSec');
    },
  });

  slides.push({
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'sinLight', 'cscLight', 'secLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'triTanSec.tan', 'triTanSec.sec'],
      lines: ['circle', 'line'],
    },
    show: { lines: ['secant'] },
    fromForm: null,
    form: null,
    transition: (done) => {
      circ.animations.new()
        .dissolveIn({ element: 'triTanSec.sec', duration: 0.5 })
        .trigger({ callback: 'circPulseSec', duration: 1.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ._triTanSec._sec.show();
      figure.fnMap.exec('linesSetSec');
    },
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
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
      figure.shortCuts = { 0: 'circToRot' };
      circ.highlight(['triSinCos.sin', 'theta']);
    },
    transition: (done) => {
      lines.animations.new()
        .dissolveOut({ elements: ['secant'], duration: 0.5 })
        .trigger({ callback: 'linesToChord', duration: 1.5 })
        .dissolveIn({ element: 'chord', duration: 0.5 })
        .trigger({ callback: 'showBow', duration: 3 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      lines.show(['chord']);
      figure.fnMap.exec('linesSetChord');
    },
  });


  slides.push({
    show: ['lines.chord'],
    // dissolve: { in: 'circ.triSinCos.sin.line' },
    transition: (done) => {
      circ.animations.new()
        .inParallel([
          circ.animations.dissolveIn({ element: 'triSinCos.sin.line', duration: 0.5 }),
          lines.animations.trigger({ callback: 'showHalfChord', duration: 0.5 }),
        ])
        .inParallel([
          circ._triSinCos._sin.animations.pulseWidth({ line: 4, duration: 1 }),
          lines._halfChord.animations.pulseWidth({ line: 4, duration: 1 }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.fnMap.exec('linesSetChord');
      circ.show('triSinCos.sin.line');
      lines.show(['halfChord', 'dullChord']);
      lines.hide('line');
    },
  });

  slides.push({
    show: ['lines.halfChord', 'lines.dullChord', 'circ.triSinCos.sin.line'],
    hide: ['lines.line'],
    dissolve: {
      out: ['lines.chord'],
      in: ['lines.sine', 'lines.jya'],
    },
    steadyState: () => {
      lines.show(['sine', 'jya']);
      figure.fnMap.exec('linesSetChord');
    },
  });

  slides.push({
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'sinLight', 'cscLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin'],
      lines: ['circle'],
    },
    show: ['lines.halfChord', 'lines.dullChord', 'lines.sine', 'lines.jya'],
    transition: (done) => {
      circ.animations.new()
        .dissolveIn({ element: 'triSinCos.sin.label', duration: 0.5 })
        .trigger({ callback: 'circPulseSin', duration: 1.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ._triSinCos._sin.showAll();
      figure.fnMap.exec('linesSetChord');
    },
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
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
      figure.shortCuts = { 0: 'circToRot' };
      circ.highlight(['triCotCsc.cot', 'thetaComp', 'eqn']);
    },
    dissolve: {
      out: ['lines.halfChord', 'lines.dullChord', 'lines.sine', 'lines.jya', 'lines.circle'],
      in: ['circ.thetaComp'],
    },
  });

  slides.push({
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'cscLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triCotCsc.cot.line', 'thetaComp'],
    },
    fromForm: { 'circ.eqn': 'tanComp' },
    form: { 'circ.eqn': 'tanComp' },
    transition: (done) => {
      circ._eqn.hide();
      circ.animations.new()
        .dissolveIn({ element: 'triCotCsc.cot.line', duration: 0.5 })
        .then(circ._triCotCsc._cot.animations.pulseWidth({ line: 4, duration: 1 }))
        .dissolveIn({ element: 'eqn', duration: 0.5 })
        .whenFinished(done)
        .start();
    },
  });

  slides.push({ form: { 'circ.eqn': 'complementaryTangent' } });
  slides.push({ form: { 'circ.eqn': 'cotangent' } });
  slides.push({ form: { 'circ.eqn': 'cotan' } });
  slides.push({ form: { 'circ.eqn': 'cotTheta' } });

  slides.push({
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'cscLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triCotCsc.cot', 'thetaComp'],
    },
    transition: (done) => {
      circ.animations.new()
        .dissolveIn({ element: 'triCotCsc.cot.label', duration: 0.5 })
        .trigger({ callback: 'circPulseCot', duration: 1.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ._triCotCsc._cot.showAll();
    },
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
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
      figure.shortCuts = { 0: 'circToRot' };
      circ.highlight(['triCotCsc.csc', 'thetaComp', 'eqn']);
    },
    fromForm: { 'circ.eqn': 'secComp' },
    form: { 'circ.eqn': 'secComp' },
    transition: (done) => {
      circ._eqn.hide();
      circ.animations.new()
        // .dissolveOut({ element: 'eqn', duration: 0.5 })
        .dissolveIn({ element: 'triCotCsc.csc.line', duration: 0.5 })
        .then(circ._triCotCsc._csc.animations.pulseWidth({ line: 4, duration: 1 }))
        .dissolveIn({ element: 'eqn', duration: 0.5 })
        .whenFinished(done)
        .start();
    },
  });

  slides.push({ form: { 'circ.eqn': 'complementarySecant' } });
  slides.push({ form: { 'circ.eqn': 'cosecant' } });
  slides.push({ form: { 'circ.eqn': 'cosec' } });
  slides.push({ form: { 'circ.eqn': 'csc' } });

  slides.push({
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'sinLight', 'tanLight', 'cscLight', 'secLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triCotCsc.cot', 'thetaComp', 'triCotCsc.csc'],
    },
    transition: (done) => {
      circ.animations.new()
        .dissolveIn({ element: 'triCotCsc.csc.label', duration: 0.5 })
        .trigger({ callback: 'circPulseCsc', duration: 1.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ._triCotCsc._csc.showAll();
    },
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
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
      figure.shortCuts = { 0: 'circToRot' };
      circ.highlight(['triSinCos.cos', 'thetaComp', 'eqn']);
    },
    fromForm: { 'circ.eqn': 'sinComp' },
    form: { 'circ.eqn': 'sinComp' },
    transition: (done) => {
      circ._eqn.hide();
      circ.animations.new()
        // .dissolveOut({ element: 'eqn', duration: 0.5 })
        .dissolveIn({ element: 'triSinCos.cos.line', duration: 0.5 })
        .then(circ._triSinCos._cos.animations.pulseWidth({ line: 4, duration: 1 }))
        // .then(circ._triSinCos._cos.animations.position({ target: [0, 1], duration: 1 }))
        .trigger({ callback: 'circToCosUp', duration: 1.5 })
        .dissolveIn({ element: 'eqn', duration: 0.5 })
        .whenFinished(done)
        .start();
    },
    leaveStateCommon: () => {
      circ.undim();
      figure.fnMap.exec('circSetCosDown');
    },
  });

  slides.push({ enterState: 'circSetCosUp', form: { 'circ.eqn': 'complementarySine' } });
  slides.push({ enterState: 'circSetCosUp', form: { 'circ.eqn': 'cosine' } });
  slides.push({ enterState: 'circSetCosUp', form: { 'circ.eqn': 'cos' } });

  slides.push({
    enterState: 'circSetCosDown',
    transition: (done) => {
      figure.fnMap.exec('circSetCosUp');
      circ.animations.new()
        .trigger({ callback: 'circToCosDown', duration: 1.5 })
        .dissolveIn({ element: 'triSinCos.cos.label', duration: 0.5 })
        .trigger({ callback: 'circPulseCos', duration: 1.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ._triSinCos._cos.showAll();
      figure.fnMap.exec('circSetCosDown');
    },
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
  slides.push({
    clear: true,
    scenario: ['circQ1', 'nameDefs'],
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
      figure.shortCuts = { 0: 'circToRot' };
    },
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.rightTan', 'theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triSinCos.cos', 'triCotCsc.cot', 'triCotCsc.csc'],
    },
    fromForm: 'ratios',
    form: 'ratios',
    transition: (done) => {
      circ.highlight(['triSinCos.cos', 'thetaComp', 'eqn']);
      circ.animations.new()
        .inParallel([
          circ.animations.scenario({ target: 'tanSecTri', duration: 1.5 }),
          circ.animations.dissolveOut({ elements: ['eqn', 'thetaComp'], duration: 0.5 }),
          circ.animations.undim({ elements: ['theta', 'triTanSec.tan', 'triTanSec.sec', 'triSinCos.sin', 'triSinCos.cos', 'triCotCsc.cot', 'thetaComp', 'triCotCsc.csc'], duration: 1 }),
          eqn.animations.dissolveIn(0.5),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.undim();
      circ.hide(['eqn', 'thetaComp']);
      circ.setScenario('tanSecTri');
    },
  });

  slides.push({
    scenario: ['circQ1'],
    transition: (done) => {
      circ.animations.new()
        .trigger({ callback: 'circToSplit', duration: 6 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.undim();
      circ.hide(['eqn', 'thetaComp']);
      circ.setScenarios('split');
      circ.hide(['arc', 'xQ1', 'yQ1', 'rotator', 'theta']);
      circ.show(['triSinCos', 'triTanSec', 'triCotCsc']);
    },
    leaveStateCommon: () => {
      circ.setScenarios('noSplit');
      circ.undim();
    },
  });

  slides.push({
    showCommon: {
      circ: ['triTanSec', 'triSinCos', 'triCotCsc'],
    },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
      circ.highlight('triSinCos');
    },
    scenarioCommon: ['split', 'circQ1'],
    form: 'build0',
  });
  slides.push({ form: 'build1' });
  slides.push({ form: 'build2' });
  slides.push({ form: 'build3' });
  slides.push({
    form: 'build4',
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
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
  slides.push({
    form: 'full',
    showCommon: {
      circ: ['triTanSec', 'triCotCsc'],
    },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
      circ.highlight('triTanSec');
    },
    transition: (done) => {
      circ.highlight('triCotCsc');
      circ.animations.new()
        .dissolveOut({ element: 'triCotCsc', duration: 0.5 })
        .inParallel([
          circ._triTanSec.animations.undim({ elements: ['tan', 'sec', 'theta', 'unit'], duration: 0.5 }),
          circ.animations.scenarios({ duration: 1.5, target: 'tanSecTri' }),
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
  // slides.push({ form: 'full' });
  slides.push({ form: 'strike' });
  slides.push({ form: 'final' });

  // slides.push({
  //   clear: true,
  //   scenarioCommon: ['default', 'left', 'top'],
  //   showCommon: ['rightTri'],
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('triToValues');
  //     rightTri._tri.hideSides();
  //     rightTri._tri._angle2.hide();
  //     rightTri.hasTouchableElements = true;
  //     figure.fnMap.exec('triToRot', 1);
  //   },
  //   form: 'functions',
  //   // dissolve: { in: ['rightTri', 'rightTri'] },
  //   steadyStateCommon: () => {
  //     figure.shortCuts = {
  //       1: 'triPulseRight',
  //       2: 'triPulseTheta',
  //       3: 'triPulseOpp',
  //       4: 'triPulseHyp',
  //       5: 'triPulseAdj',
  //     };
  //   },
  //   steadyState: () => {
  //     rightTri.showAll();
  //     rightTri.hide(['tri.angle0']);
  //   },
  // });
  // slides.push({ form: 'names' });
  // slides.push({ form: 'ratios' });
  // slides.push({ form: 'build0' });
  // slides.push({ form: 'build1' });
  // slides.push({ form: 'build2' });
  // slides.push({ form: 'build3' });
  // slides.push({ form: 'build4' });
  // slides.push({ form: 'full' });
  // slides.push({
  //   form: 'full',
  //   enterState: () => {
  //     const elements = eqn.getPhraseElements(['tanSec', 'oneSec', 'secTan', 'cosSin', 'cotCsc', 'oneCot', 'oneCsc', 'oneSec', 'cscCot']);
  //     eqn.dim(elements);
  //   },
  //   leaveState: () => eqn.undim(),
  // });
  // slides.push({
  //   enterState: () => {
  //     const elements = eqn.getPhraseElements(['tanSec', 'oneSec', 'secTan', 'cosSin', 'cotCsc', 'oneCot', 'oneCsc', 'oneSec', 'cscCot']);
  //     eqn.dim(elements);
  //   },
  //   fromForm: 'full',
  //   transition: (done) => {
  //     eqn.animations.new()
  //       .goToForm({
  //         target: 'final', duration: 2.5, dissolveOutTime: 1.5, animate: 'move',
  //       })
  //       .whenFinished(done)
  //       .start();
  //   },
  //   form: 'final',
  //   leaveState: () => eqn.undim(),
  // });
  // slides.push({
  //   form: 'value',
  // });

  // // dissolve in theta
  // slides.push({
  //   show: ['rightTri.tri.line', 'rightTri.tri.angle1'],
  //   dissolve: { in: 'rightTri.tri.angle2' },
  // });

  // // Dissolve in third angle
  // slides.push({
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('triToNames');
  //     rightTri._tri.hideSides();
  //     rightTri.hasTouchableElements = false;
  //     figure.fnMap.exec('triToRot', initialAngle);
  //   },
  //   show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle1'],
  //   dissolve: { in: 'rightTri.tri.angle0' },
  // });

  // // Dissolve in All Triangles
  // slides.push({
  //   show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle0', 'rightTri.tri.angle1'],
  //   dissolve: { in: 'allTriangles' },
  // });

  // // Dissolve in Have the Same Angles
  // slides.push({
  //   show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle0', 'allTriangles', 'rightTri.tri.angle1'],
  //   dissolve: { in: 'haveSameAngles' },
  // });

  // // Dissolve Are Similar
  // slides.push({
  //   show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle0', 'rightTri.tri.angle1', 'allTriangles', 'haveSameAngles'],
  //   dissolve: {
  //     out: ['haveSameAngles', 'rightTri.tri.angle0'],
  //     in: 'areSimilar',
  //   },
  // });

  // // Dissolve Have equal corresponding side ratios
  // slides.push({
  //   show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle1', 'allTriangles'],
  //   dissolve: {
  //     out: ['areSimilar'],
  //     in: ['haveEqualCorr', 'sideRatios'],
  //   },
  // });

  // // Dissolve in sides
  // slides.push({
  //   scenarioCommon: ['default', 'eqnTri'],
  //   show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle1', 'allTriangles', 'haveEqualCorr', 'sideRatios'],
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('triToNames');
  //     rightTri.hasTouchableElements = false;
  //     figure.fnMap.exec('triToRot', initialAngle);
  //   },
  //   fromForm: { eqn3: 'r1Constant' },
  //   form: { eqn3: 'r1Constant' },
  //   transition: (done) => {
  //     // eqn3.showForm('oppOnHyp');
  //     eqn3.hide();
  //     figure.animations.new()
  //       .inParallel([
  //         // eqn3.animations.scenario({ target: 'eqnTri', duration: 2 }),
  //         rightTri.animations.scenario({ start: 'default', target: 'eqnTri', duration: 2 }),
  //         figure.getElement('haveEqualCorr').animations.dissolveOut(0.4),
  //         figure.getElement('sideRatios').animations.dissolveOut(0.4),
  //         figure.getElement('allTriangles').animations.dissolveOut(0.4),
  //         figure.getElement('rightTri.tri.side01').animations.dissolveIn(0.4),
  //         figure.getElement('rightTri.tri.side12').animations.dissolveIn(0.4),
  //         figure.getElement('rightTri.tri.side20').animations.dissolveIn(0.4),
  //       ])
  //       .inParallel([
  //         eqn3.animations.dissolveIn(0.4),
  //         // figure.getElement('hasTheSameValue').animations.dissolveIn(0.4),
  //       ])
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     figure.hide(['haveEqualCorr', 'sideRatios', 'allTriangles']);
  //     figure.getElement('rightTri.tri').show(['side01', 'side12', 'side20']);
  //     // figure.getElement('hasTheSameValue').show();
  //   },
  // });

  // // Dissolve in all ratios the same with opp on hyp
  // slides.push({
  //   showCommon: ['rightTri'],
  //   hideCommon: ['rightTri.tri.angle0'],
  //   form: { eqn3: 'r2Constant' },
  //   // transition: (done) => {
  //   //   figure.animations.new()
  //   //     .inParallel([
  //   //       eqn3.animations.goToForm({ target: 'r2', duration: 2, animate: 'move' }),
  //   //       figure.getElement('hasTheSameValue1').animations.dissolveIn(0.4),
  //   //     ])
  //   //     .whenFinished(done)
  //   //     .start();
  //   // },
  //   // steadyState: () => {
  //   //   figure.getElement('hasTheSameValue1').show();
  //   //   // eqn.showForm('twoSideRatios');
  //   // },
  // });

  // // Dissolve in two ratios
  // slides.push({
  //   form: { eqn3: 'rConstant' },
  //   // transition: (done) => {
  //   //   figure.animations.new()
  //   //     .inParallel([
  //   //       eqn3.animations.goToForm({ target: 'r3', duration: 2, animate: 'move' }),
  //   //       figure.getElement('hasTheSameValue2').animations.dissolveIn(0.4),
  //   //       figure.getElement('hasTheSameValue3').animations.dissolveIn(0.4),
  //   //       figure.getElement('hasTheSameValue4').animations.dissolveIn(0.4),
  //   //       figure.getElement('hasTheSameValue5').animations.dissolveIn(0.4),
  //   //       rightTri.animations.dissolveOut(0.4),
  //   //     ])
  //   //     .whenFinished(done)
  //   //     .start();
  //   // },
  //   // steadyState: () => {
  //   //   figure.getElement('hasTheSameValue2').show();
  //   //   figure.getElement('hasTheSameValue3').show();
  //   //   figure.getElement('hasTheSameValue4').show();
  //   //   figure.getElement('hasTheSameValue5').show();
  //   //   eqn.showForm('sixSideRatios');
  //   //   rightTri.hide();
  //   // },
  // });

  // // slides.push({
  // //   form: { eqn3: 'rValues' },
  // //   steadyState: () => {
  // //     rightTri.hasTouchableElements = true;
  // //     figure.shortCuts = {
  // //       1: 'triAnimateToRot',
  // //     };
  // //   },
  // // });

  // // // Dissolve second ratio
  // // slides.push({
  // //   fromForm: 'sixSideRatios',
  // //   form: 'sixSideRatios',
  // //   show: ['rightTri', 'hasTheSameValue', 'hasTheSameValue1', 'hasTheSameValue2', 'hasTheSameValue3', 'hasTheSameValue4', 'hasTheSameValue5'],
  // //   hideCommon: ['rightTri.tri.angle0'],
  // //   transition: (done) => {
  // //     figure.animations.new()
  // //       .inParallel([
  // //         figure.getElement('hasTheSameValue').animations.dissolveOut(0.4),
  // //         figure.getElement('hasTheSameValue1').animations.dissolveOut(0.4),
  // //         figure.getElement('hasTheSameValue2').animations.dissolveOut(0.4),
  // //         figure.getElement('hasTheSameValue3').animations.dissolveOut(0.4),
  // //         figure.getElement('hasTheSameValue4').animations.dissolveOut(0.4),
  // //         figure.getElement('hasTheSameValue5').animations.dissolveOut(0.4),
  // //         rightTri.animations.dissolveIn(0.4),
  // //       ])
  // //       .whenFinished(done)
  // //       .start();
  // //   },
  // //   steadyState: () => {
  // //     figure.getElement('hasTheSameValue').hide();
  // //     figure.getElement('hasTheSameValue1').hide();
  // //     figure.getElement('hasTheSameValue2').hide();
  // //     figure.getElement('hasTheSameValue3').hide();
  // //     figure.getElement('hasTheSameValue4').hide();
  // //     figure.getElement('hasTheSameValue5').hide();
  // //     rightTri.show();
  // //   },
  // // });

  // // // Dissolve in all ratios
  // // slides.push({
  // //   fromForm: 'sixSideRatios',
  // //   form: 'sixSideRatios',
  // //   show: ['rightTri', 'hasTheSameValue', 'hasTheSameValue1'],
  // //   dissolve: { out: ['hasTheSameValue', 'hasTheSameValue1'] },
  // // });

  // const circle1 = figure.getElement('circle1');
  // /*
  // .########.##.....##.##....##..######..########.####..#######..##....##
  // .##.......##.....##.###...##.##....##....##.....##..##.....##.###...##
  // .##.......##.....##.####..##.##..........##.....##..##.....##.####..##
  // .######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##
  // .##.......##.....##.##..####.##..........##.....##..##.....##.##..####
  // .##.......##.....##.##...###.##....##....##.....##..##.....##.##...###
  // .##........#######..##....##..######.....##....####..#######..##....##
  // */
  // slides.push({
  //   clear: true,
  //   scenarioCommon: ['default', 'eqnTri'],
  //   show: ['rightTri'],
  //   hideCommon: ['rightTri.tri.angle0'],
  //   fromForm: { eqn3: 'rConstant' },
  //   form: { eqn3: 'rValues' },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('triToNames');
  //     // rightTri._tri._side20.hide();
  //     rightTri.hasTouchableElements = false;
  //     figure.fnMap.exec('triToRot', initialAngle);
  //   },
  //   transition: (done) => {
  //     figure.animations.new()
  //       .inParallel([
  //         figure.animations.trigger({ callback: 'triAnimateToValues', duration: 0.8 }),
  //         eqn3.animations.goToForm({ target: 'rValues', animate: 'move' }),
  //       ])
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     figure.fnMap.exec('triToValues');
  //     // figure.getElement('haveTheSame').hide();
  //     // figure.getElement('allTriangles').hide();
  //     // eqn.showForm('sixSideRatiosWithValue');
  //     // figure.fnMap.exec('triToRot', initialAngle);
  //     rightTri.hasTouchableElements = true;
  //     figure.shortCuts = {
  //       1: 'triAnimateToRot',
  //     };
  //   },
  // });

  // slides.push({
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('triToValues');
  //     rightTri.hasTouchableElements = false;
  //     figure.fnMap.exec('triToRot', initialAngle);
  //   },
  //   show: ['rightTri'],
  //   // fromForm: 'sixSideRatiosWithValue',
  //   form: { eqn3: 'rFunctions' },
  //   transition: (done) => {
  //     figure.animations.new()
  //       .inParallel([
  //         figure.animations.trigger({ callback: 'triAnimateToNames', duration: 0.8 }),
  //         eqn3.animations.goToForm({ delay: 0.4, target: 'rFunctions', animate: 'move' }),
  //       ])
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     figure.fnMap.exec('triToNames');
  //     // eqn.showForm('sixSideRatiosFunction');
  //     rightTri.hasTouchableElements = true;
  //   },
  // });
  // slides.push({
  //   show: ['rightTri'],
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('triToNames');
  //     rightTri.hasTouchableElements = false;
  //     figure.fnMap.exec('triToRot', initialAngle);
  //   },
  //   form: { eqn3: 'rNames' },
  // });

  // /*
  // .##.......####.##....##.########..######.
  // .##........##..###...##.##.......##....##
  // .##........##..####..##.##.......##......
  // .##........##..##.##.##.######....######.
  // .##........##..##..####.##.............##
  // .##........##..##...###.##.......##....##
  // .########.####.##....##.########..######.
  // */
  // slides.push({
  //   clear: true,
  //   scenarioCommon: 'circLines',
  //   showCommon: { circ: 'circle' },
  //   fromForm: null,
  //   form: null,
  //   dissolve: { in: 'circ.circle' },
  // });

  // slides.push({
  //   showCommon: ['circ.chord', 'circ.circle'],
  //   dissolve: { in: 'circ.chord' },
  // });
  // slides.push({ dissolve: { in: 'chord' } });
  // slides.push({ show: ['chord'], dissolve: { in: 'circ.bow' } });

  // slides.push({
  //   showCommon: { circ: ['chord', 'circle', 'tangent'] },
  //   dissolve: { out: ['chord', 'circ.bow'], in: 'circ.tangent' },
  // });
  // slides.push({ dissolve: { in: 'tangent' } });
  // slides.push({
  //   show: 'tangent',
  //   dissolve: { in: { circ: ['radius', 'rightAngle', 'center'] } },
  // });
  // slides.push({
  //   showCommon: { circ: ['chord', 'circle', 'tangent', 'secant'] },
  //   dissolve: {
  //     out: { circ: ['radius', 'rightAngle', 'center'] },
  //     in: 'circ.secant',
  //   },
  // });
  // slides.push({
  //   dissolve: {
  //     in: 'secant',
  //   },
  // });

  // /*
  // .##.....##.##....##.####.########.....######..####.########...######.
  // .##.....##.###...##..##.....##.......##....##..##..##.....##.##....##
  // .##.....##.####..##..##.....##.......##........##..##.....##.##......
  // .##.....##.##.##.##..##.....##.......##........##..########..##......
  // .##.....##.##..####..##.....##.......##........##..##...##...##......
  // .##.....##.##...###..##.....##.......##....##..##..##....##..##....##
  // ..#######..##....##.####....##........######..####.##.....##..######.
  // */

  // slides.push({
  //   scenarioCommon: 'circQuarter',
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('cSetAngle', initialAngle);
  //   },
  //   showCommon: { circ: ['arc', 'x', 'y', 'rightOrigin', 'unitCsc'] },
  //   dissolve: { in: { circ: ['arc', 'x', 'y', 'rightOrigin', 'unitCsc'] } },
  //   leaveStateCommon: () => circ.undim(),
  // });
  // slides.push({
  //   showCommon: { circ: ['arc', 'x', 'y', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'rightOrigin', 'unitCsc'] },
  //   dissolve: {
  //     in: { circ: ['tanLight', 'secLight', 'cotLight', 'cscLight'] },
  //   },
  // });
  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'rightTanAlt'] },
  //   dissolve: {
  //     out: { circ: ['rightOrigin', 'unitCsc'] },
  //     in: { circ: ['hypAlt', 'hypLabel', 'rightTanAlt'] },
  //   },
  // });
  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'rightTanAlt'] },
  //   dissolve: {
  //     in: { circ: ['theta'] },
  //   },
  // });


  // /*
  // .########....###....##....##.....######..########..######.
  // ....##......##.##...###...##....##....##.##.......##....##
  // ....##.....##...##..####..##....##.......##.......##......
  // ....##....##.....##.##.##.##.....######..######...##......
  // ....##....#########.##..####..........##.##.......##......
  // ....##....##.....##.##...###....##....##.##.......##....##
  // ....##....##.....##.##....##.....######..########..######.
  // */
  // slides.push({
  //   scenarioCommon: ['circQuarter', 'eqnCirc'],
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanAlt', 'rightTanAlt'] },
  //   dissolve: {
  //     in: { circ: ['tanAlt'], pulse: { translation: 0.05 } },
  //   },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('cSetAngle', initialAngle);
  //     circ.highlight(['tanAlt', 'tanLabelAlt', 'hypAlt', 'hypLabel', 'theta', 'secLabelAlt', 'tanAltEqn', 'secAlt', 'thetaCot']);
  //     figure.fnMap.exec('circSetBounds', 'circle');
  //   },
  // });
  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanAlt', 'tanAltEqn', 'rightTanAlt'] },
  //   dissolve: {
  //     in: { circ: ['tanAltEqn'] },
  //   },
  //   fromForm: { 'circ.tanAltEqn': null },
  //   form: { 'circ.tanAltEqn': 'tangent' },
  // });
  // slides.push({ form: { 'circ.tanAltEqn': 'tanTheta' } });
  // slides.push({ form: { 'circ.tanAltEqn': 'tan' } });


  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanAlt', 'tanLabelAlt', 'secAlt', 'rightTanAlt'] },
  //   dissolve: { in: { circ: ['secAlt'] } },
  //   fromForm: { 'circ.tanAltEqn': null },
  //   form: { eqn3: null, 'circ.tanAltEqn': null },
  // });

  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanAlt', 'tanLabelAlt', 'secAlt', 'secLabelAlt', 'rightTanAlt'] },
  //   dissolve: { in: { circ: ['secLabelAlt'] } },
  //   steadyStateCommon: () => {
  //     figure.shortCuts = {
  //       1: 'eqnPulseOppAdj',
  //       2: 'eqnPulseHypAdj',
  //       3: 'eqnPulseTanAdj',
  //       4: 'eqnPulseSecAdj',
  //       5: 'circPulseTanAlt',
  //       6: 'circPulseSecAlt',
  //       7: 'circPulseRad',
  //       8: 'circPulseTheta',
  //     };
  //   },
  // });

  // slides.push({
  //   form: { eqn3: '0', 'circ.tanAltEqn': null },
  // });

  // slides.push({ form: { eqn3: '1' } });
  // slides.push({ form: { eqn3: '2' } });
  // slides.push({ form: { eqn3: '3' } });
  // slides.push({ form: { eqn3: '4' } });

  // /*
  // ..######...#######..########.....######...######...######.
  // .##....##.##.....##....##.......##....##.##....##.##....##
  // .##.......##.....##....##.......##.......##.......##......
  // .##.......##.....##....##.......##........######..##......
  // .##.......##.....##....##.......##.............##.##......
  // .##....##.##.....##....##.......##....##.##....##.##....##
  // ..######...#######.....##........######...######...######.
  // */
  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'thetaComp', 'rightCotAlt'] },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('cSetAngle', initialAngle);
  //     circ.highlight(['cotAlt', 'cotLabelAlt', 'hypAlt', 'hypLabel', 'thetaComp', 'cscAlt', 'cscLabelAlt', 'cotAltEqn', 'cscAltEqn', 'thetaCot']);
  //     figure.fnMap.exec('circSetBounds', 'circle');
  //   },
  //   dissolve: { in: { circ: ['thetaComp'] } },
  //   steadyStateCommon: () => {
  //     figure.shortCuts = {
  //       1: 'circPulseThetaComp',
  //     };
  //   },
  // });

  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'thetaComp', 'rightCotAlt', 'thetaCot'] },
  //   dissolve: { in: { circ: ['thetaCot'] } },
  // });

  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotAlt', 'thetaComp', 'rightCotAlt', 'thetaCot'] },
  //   dissolve: { in: { circ: ['cotAlt'] } },
  // });
  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotAlt', 'thetaComp', 'rightCotAlt', 'cotAltEqn', 'thetaCot'] },
  //   fromForm: { eqn3: '4', 'circ.cotAltEqn': null },
  //   form: { eqn3: '4', 'circ.cotAltEqn': 'tanComp' },
  // });

  // slides.push({ form: { eqn3: '4', 'circ.cotAltEqn': 'complementaryTangent' } });
  // slides.push({ form: { eqn3: '4', 'circ.cotAltEqn': 'cotangent' } });
  // slides.push({ form: { eqn3: '4', 'circ.cotAltEqn': 'cotTheta' } });
  // slides.push({ form: { eqn3: '4', 'circ.cotAltEqn': 'cot' } });

  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotAlt', 'thetaComp', 'rightCotAlt', 'cotLabelAlt', 'cscAlt', 'cscAltEqn', 'thetaCot'] },
  //   fromForm: { eqn3: '4', 'circ.cotAltEqn': null, 'circ.cscAltEqn': 'secComp' },
  //   form: { eqn3: '4', 'circ.cscAltEqn': 'secComp' },
  //   dissolve: { in: { circ: ['cscAlt', 'cscAltEqn'] } },
  // });
  // // slides.push({ form: { eqn3: '4', 'circ.cscAltEqn': 'cosec' } });
  // slides.push({ form: { eqn3: '4', 'circ.cscAltEqn': 'cosecant' } });
  // slides.push({ form: { eqn3: '4', 'circ.cscAltEqn': 'cosec' } });
  // slides.push({ form: { eqn3: '4', 'circ.cscAltEqn': 'csc' } });
  // slides.push({
  //   dissolve: { out: { circ: ['thetaComp'] } },
  //   steadyStateCommon: () => {
  //     figure.shortCuts = {
  //       1: 'eqnPulseAdjOpp',
  //       2: 'eqnPulseHypOpp',
  //       3: 'eqnPulseCotOpp',
  //       4: 'eqnPulseCscOpp',
  //       5: 'circPulseCotAlt',
  //       6: 'circPulseCscAlt',
  //       7: 'circPulseRad',
  //       8: 'circPulseTheta',
  //       9: 'circPulseThetaCot',
  //     };
  //   },
  // });

  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotAlt', 'rightCotAlt', 'cotLabelAlt', 'cscAlt', 'cscLabelAlt', 'thetaCot'] },
  //   fromForm: { eqn3: '5', 'circ.cscAltEqn': null },
  //   form: { eqn3: '5' },
  // });
  // slides.push({ form: { eqn3: '6' } });
  // slides.push({ form: { eqn3: '7' } });
  // slides.push({ form: { eqn3: '8' } });

  // /*
  // ..######..####.##....##.....######...#######...######.
  // .##....##..##..###...##....##....##.##.....##.##....##
  // .##........##..####..##....##.......##.....##.##......
  // ..######...##..##.##.##....##.......##.....##..######.
  // .......##..##..##..####....##.......##.....##.......##
  // .##....##..##..##...###....##....##.##.....##.##....##
  // ..######..####.##....##.....######...#######...######.
  // */
  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'cscLabelAlt', 'rightSin', 'sin'] },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('cSetAngle', initialAngle);
  //     circ.highlight(['sin', 'sinLabel', 'sinEqn', 'hypLabel', 'hypAlt', 'rightSin', 'cosAlt', 'cosEqnAlt', 'cosLabelAlt', 'thetaComp', 'cosAltEqn', 'thetaCos', 'theta']);
  //   },
  //   dissolve: { in: { circ: ['sin', 'rightSin'] } },
  // });
  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinEqn', 'sin'] },
  //   dissolve: { in: { circ: ['sinEqn'] } },
  //   fromForm: { eqn3: '8', 'circ.sinEqn': 'halfChord' },
  //   form: { eqn3: '8', 'circ.sinEqn': 'halfChord' },
  // });

  // // slides.push({ form: { eqn3: '8', 'circ.sinEqn': 'sinus' } });
  // slides.push({ form: { eqn3: '8', 'circ.sinEqn': 'sine' } });
  // slides.push({
  //   form: { eqn3: '8', 'circ.sinEqn': 'sin' },
  //   steadyStateCommon: () => {
  //     figure.shortCuts = {
  //       1: 'circPulseTheta',
  //       2: 'circPulseSinEqn',
  //       3: 'circPulseRad',
  //       4: 'eqnPulseOppAdj',
  //     };
  //   },
  // });
  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin'] },
  //   fromForm: { eqn3: '8', 'circ.sinEqn': null },
  //   form: { eqn3: '9' },
  // });
  // slides.push({ form: { eqn3: '10' } });

  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin', 'cosAlt', 'thetaComp', 'cosAltEqn', 'rightCosAlt'] },
  //   fromForm: { eqn3: '10', 'circ.sinEqn': null, 'circ.cosAltEqn': 'sinComp' },
  //   form: { eqn3: '10', 'circ.sinEqn': null, 'circ.cosAltEqn': 'sinComp' },
  //   dissolve: { in: { circ: ['thetaComp', 'cosAlt', 'cosAltEqn', 'rightCosAlt'] } },
  // });
  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin', 'cosAlt', 'cosAltEqn', 'rightCosAlt'] },
  //   form: { eqn3: '10', 'circ.cosAltEqn': 'cosine' },
  // });
  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin', 'cosAlt', 'cosAltEqn', 'rightCosAlt'] },
  //   form: { eqn3: '10', 'circ.cosAltEqn': 'cos' },
  // });
  // slides.push({
  //   dissolve: { in: 'circ.thetaCos' },
  //   form: { eqn3: '10', 'circ.cosAltEqn': 'cos' },
  // });
  // // slides.push({ form: { eqn3: '9' } });
  // // slides.push({ form: { eqn3: '10' } });
  // slides.push({
  //   showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin', 'cosAlt', 'cosLabelAlt', 'rightCosAlt'] },
  //   fromForm: { eqn3: '10', 'circ.cosAltEqn': null },
  //   form: { eqn3: '11' },
  //   // steadyStateCommon: () => {
  //   //   figure.shortCuts = {
  //   //     1: 'eqnPulseAdjOpp',
  //   //     2: 'eqnPulseHypOpp',
  //   //     3: 'eqnPulseCotOpp',
  //   //     4: 'eqnPulseCscOpp',
  //   //     5: 'circPulseCotAlt',
  //   //     6: 'circPulseCscAlt',
  //   //     7: 'circPulseRad',
  //   //     8: 'circPulseTheta',
  //   //     9: 'circPulseThetaCot',
  //   //   };
  //   // },
  // });
  // slides.push({ form: { eqn3: '12' } });

  // slides.push({
  //   showCommon: { circ: ['x', 'y', 'arc', 'rotator', 'tanAlt', 'secAlt', 'cotAlt', 'cscAlt', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin', 'cosAlt', 'cosLabelAlt', 'rightCosAlt'] },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('cSetAngle', initialAngle);
  //     figure.fnMap.exec('circSetBounds', 'circle');
  //   },
  //   transition: (done) => {
  //     figure.animations.new()
  //       .inParallel([
  //         eqn3.animations.scenario({ target: 'eqnCirc', duration: 1 }),
  //         circ.animations.scenario({ target: 'circQuarterRight', duration: 1 }),
  //       ])
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     eqn3.setScenario('eqnCirc');
  //     circ.setScenario('circQuarterRight');
  //   },
  // });

  // slides.push({
  //   scenarioCommon: ['circQuarterRight', 'eqnCirc'],
  //   form: { eqn3: 'compRearrange' },
  // });
  // slides.push({ form: { eqn3: 'compHalf' } });
  // // slides.push({ form: { eqn3: 'compHalf2' } });
  // slides.push({ form: { eqn3: 'comp' } });

  // slides.push({ form: { eqn3: 'recRearrange' } });
  // slides.push({ form: { eqn3: 'recHalf' } });
  // slides.push({ form: { eqn3: 'rec' } });

  // slides.push({ form: { eqn3: 'tanRearrange' } });

  // slides.push({ form: { eqn3: '13' } });
  // slides.push({ form: { eqn3: '14' } });
  // slides.push({ form: { eqn3: '15' } });
  // slides.push({ form: { eqn3: '16' } });
  // slides.push({ form: { eqn3: '17' } });
  // // slides.push({ form: { eqn3: '18' } });
  // // slides.push({ form: { eqn3: '19' } });
  // // slides.push({ form: { eqn3: '20' } });
  // slides.push({ form: { eqn3: 'values' } });
  // slides.push({
  //   // scenarioCommon: 'circValues',
  //   showCommon: { circ: ['rotatorFull', 'arc', 'hypAlt', 'hypLabel', 'thetaVal', 'tanAlt', 'tanLabelAlt', 'secAlt', 'secLabelAlt', 'cotAlt', 'cotLabelAlt', 'cscAlt', 'cscLabelAlt', 'sinLabel', 'sin', 'cosAlt', 'cosLabelAlt', 'x', 'y'] },
  //   form: { eqn3: 'values' },
  //   transition: (done) => {
  //     figure.animations.new()
  //       .inParallel([
  //         eqn3.animations.goToForm({ target: 'values', duration: 1 }),
  //         circ.animations.scenario({ target: 'circValues', duration: 1 }),
  //       ])
  //       .inParallel([
  //         circ._circleLight.animations.dissolveIn(0.4),
  //         circ._xFull.animations.dissolveIn(0.4),
  //         circ._yFull.animations.dissolveIn(0.4),
  //         circ._arc.animations.dissolveOut(0.4),
  //         // circ._circleLight.animations.dissolveIn(0.4),
  //       ])
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     circ.show(['xFull', 'yFull', 'circleLight']);
  //     circ.hide(['arc']);
  //     circ.setScenario('circValues');
  //   },
  //   // leaveStateCommon: () => eqn3.undim(),
  // });

  // slides.push({
  //   scenarioCommon: ['circValues', 'eqnCirc'],
  //   showCommon: { circ: ['rotatorFull', 'thetaVal', 'tan', 'tanLabel', 'sec', 'secLabel', 'cot', 'cotLabel', 'csc', 'cscLabel', 'sinLabel', 'sin', 'cos', 'cosLabel', 'x', 'y'] },
  //   form: { eqn3: 'values' },
  //   steadyState: () => {
  //     circ.show(['xFull', 'yFull', 'circleLight']);
  //   },
  //   // leaveStateCommon: () => eqn3.undim(),
  // });

  // slides.push({
  //   form: { eqn3: 'comp' },
  // });
  // // showCommon: { circ: ['circle', 'rotatorFull', 'hypAlt', 'hypLabel', 'thetaVal', 'tanAlt', 'tanLabelAlt', 'secAlt', 'secLabelAlt', 'cotAlt', 'cotLabelAlt', 'cscAlt', 'cscLabelAlt', 'sinLabel', 'sin', 'cosAlt', 'cosLabelAlt', 'xFull', 'yFull'] },


  nav.loadSlides(slides);
  nav.goToSlide(45);
}
makeSlides();
