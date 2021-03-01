/* eslint-disable camelcase */
/* globals figure, colTan, colCot, colCsc, color2, colSec, colTheta
   colCsc, centerText, leftText */

function layout() {
  figure.add([
    {
      name: 'title',
      method: 'textLines',
      options: {
        text: [
          'The Trigonmetric Functions',
          {
            // text: 'Where they come from, and how they relate',
            text: 'An interactive video',
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
    leftText('background1', 'Similar Triangles', {}, [-1.8, 0]),
    leftText('background2', 'Similar Triangles  +  Right Angle Triangles', {}, [-1.8, 0]),
    // centerText('chord', '|chord|: from Latin |chorda| - "bowstring"', {
    //   chord: { font: { style: 'italic', family: 'Times New Roman', color: colSin } },
    //   chorda: { font: { style: 'italic', family: 'Times New Roman' } },
    // }, [1.3, 0], 0.15),
    // centerText('tangent', '|tangent|: from Latin |tangere| - "to touch"', {
    //   tangent: { font: { style: 'italic', family: 'Times New Roman', color: colTan } },
    //   tangere: { font: { style: 'italic', family: 'Times New Roman' } },
    // }, [1.3, 0], 0.15),
    // centerText('secant', '|secant|: from Latin |secare| - "to cut"', {
    //   secant: { font: { style: 'italic', family: 'Times New Roman', color: colSec } },
    //   secare: { font: { style: 'italic', family: 'Times New Roman' } },
    // }, [1.3, 0], 0.15),
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

  slides.push({
    scenarioCommon: ['title'],
    dissolve: {
      out: [
        'title',
        { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc'] },
      ],
      in: 'background1',
    },
  });

  slides.push({
    showCommon: ['background1'],
    dissolve: { in: 'background2' },
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
    dissolve: { out: ['background1', 'background2'], in: 'similar.allAngles' },
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
          similar.animations.scenario({
            element: 'tris', target: 'similarSmall', delay: 0.5, duration: 0.8,
          }),
          similar.animations.dissolveIn({ element: 'eqn', delay: 0.8, duration: 0.5 }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      similar._tris.show([
        'tri1.side20', 'tri1.side12',
        'tri2.side20', 'tri2.side12',
        'tri3.side20', 'tri3.side12',
      ]);
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
    // show: ['rightTri.tri.line', 'rightTri.tri.angle1'],
    fromForm: { 'similar.eqn': 'CA' },
    form: null,
    dissolve: {
      out: [
        {
          'similar._tris': [
            'tri1.side12', 'tri1.side01',
            'tri2.side12', 'tri2.side01',
            'tri3.side12', 'tri3.side01',
            'tri1.line', 'tri1.angle0', 'tri1.angle1', 'tri1.angle2',
            'tri2.line', 'tri2.angle0', 'tri2.angle1', 'tri2.angle2',
            'tri3.line', 'tri3.angle0', 'tri3.angle1', 'tri3.angle2',
          ],
        },
        'similar.eqn',
        'similar.allRatios',
      ],
      in: ['rightTri.tri.line', 'rightTri.tri.angle1'],
    },
    enterStateCommon: () => {
      figure.fnMap.exec('triSetup', [2, 1.5], 'names');
      figure.shortCuts = {
        1: 'triPulseRight',
        2: 'triPulseTheta',
        3: 'triPulseComp',
        4: 'triPulseOpp',
        5: 'triPulseHyp',
        6: 'triPulseAdj',
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


  // All right trianlges have same angles
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

  // All right triangles are similar
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
      rightTri.hide('haveSameAngles');
    },
  });

  // Show corresponding ratios eqn
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
        .inParallel([
          rightTri.animations.dissolveIn({
            elements: [
              'tri1.side01', 'tri1.side12', 'tri1.side20',
              'tri2.side01', 'tri2.side12', 'tri2.side20',
              'tri3.side01', 'tri3.side12', 'tri3.side20',
              'eqn',
            ],
            duration: 0.5,
          }),
          rightTri.animations.dissolveOut({
            elements: [
              'tri1.angle0', 'tri2.angle0', 'tri.angle0',
            ],
            duration: 0.5,
          }),
        ])
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
      rightTri.hide([
        'tri1.angle0', 'tri2.angle0', 'tri.angle0',
      ]);
    },
  });

  // Named sides
  slides.push({
    scenarioCommon: 'similar',
    showCommon: {
      'rightTri.tri3': ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
      'rightTri.tri1': ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
      'rightTri.tri2': ['line', 'angle1', 'angle2', 'side01', 'side12', 'side20'],
      'rightTri.tri': ['line', 'angle1', 'angle2'],
      rightTri: ['allTriangles', 'areSimilar'],
    },
    form: 'ratios',
    fromForm: 'ratios',
    transition: (done) => {
      eqn.hide();
      eqn.setScenario('ratioValues');
      rightTri.animations.new()
        .dissolveOut({
          elements: [
            'tri1.side01', 'tri1.side12', 'tri1.side20', 'tri1.line',
            'tri2.side01', 'tri2.side12', 'tri2.side20', 'tri2.line',
            'tri3.side01', 'tri3.side12', 'tri3.side20', 'tri3.line',
            'tri1.angle1', 'tri2.angle1', 'tri3.angle1',
            'tri1.angle2', 'tri2.angle2', 'tri3.angle2',
            'eqn', 'allTriangles', 'areSimilar',
          ],
          duration: 1.5,
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
      // figure.shortCuts = { 1: 'triAnimatePadTo' };
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
      rightTri.hide();
    },
  });

  slides.push({
    scenario: 'circQ1',
    showCommon: { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc', 'sinLight', 'tanLight', 'cscLight', 'secLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'theta', 'radiusLight'] },
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
          lines.animations.dissolveIn({ elements: ['circle'], duration: 0.5 }),
          // figure.animations.trigger({ delay: 0.05, callback: 'circSetup' }),
        ])
        .then(lines.animations.dissolveIn({ elements: ['line'], duration: 0.5 }))
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
      figure.fnMap.exec('linesSetTan');
      eqn.hide();
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
    },
    leaveStateCommon: () => {
      circ.undim();
    },
  });

  slides.push({
    scenarioCommon: 'nameDefs',
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'sinLight', 'tanLight', 'cscLight', 'secLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.tan', 'theta', 'tanTheta'],
      lines: ['circle', 'line'],
    },
    show: { lines: ['tangent', 'radius', 'rightAngle'] },
    fromForm: null,
    form: null,
    transition: (done) => {
      circ.animations.new()
        .dissolveIn({ elements: ['triTanSec.tan', 'tanTheta'], duration: 0.5 })
        .trigger({ callback: 'circPulseTanTheta', duration: 0 })
        .trigger({ callback: 'circPulseTan', duration: 1.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ._triTanSec._tan.show();
      figure.fnMap.exec('linesSetTan');
    },
  });

  slides.push({
    scenarioCommon: 'nameDefs',
    showCommon: {
      circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'sinLight', 'tanLight', 'cscLight', 'secLight', 'cotLight', 'triTanSec.rightTan', 'triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.tan', 'theta'],
      lines: ['circle', 'line'],
    },
    show: { lines: ['tangent', 'radius', 'rightAngle'] },
    dissolve: { out: 'circ.tanTheta.label' },
    steadyState: () => {
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
      circ._cotLight.show();
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
  // Setup
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
          circ.animations.scenario({ target: 'circQ1', duration: 1.5 }),
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
      circ.setScenario('circQ1');
    },
  });

  // Split
  slides.push({
    scenario: ['circQ1'],
    transition: (done) => {
      circ.animations.new()
        .inParallel([
          circ.animations.trigger({ callback: 'circToSplit', duration: 6 }),
          circ.animations.scenario({ target: 'split', duration: 6 }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.undim();
      circ.hide(['eqn', 'thetaComp']);
      circ.setScenarios('split');
      circ.hide(['arc', 'xQ1', 'yQ1', 'rotator', 'theta']);
      circ.show(['triSinCos', 'triTanSec', 'triCotCsc']);
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
    },
    leaveStateCommon: () => {
      circ.setScenarios('noSplit');
      circ.undim();
    },
  });

  // Sin Column
  slides.push({
    showCommon: {
      circ: ['triTanSec', 'triSinCos', 'triCotCsc'],
    },
    enterStateCommon: () => {
      circ.highlight('triSinCos');
      figure.shortCuts = { 0: 'circToRot' };
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
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
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
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
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
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
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
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
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
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
      figure.fnMap.exec('circSetup', 0.9, 'quarter');
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
        .dissolveIn({ elements: ['circle', 'x', 'y', 'rotatorFull'], duration: 0.5 })
        .dissolveOut({ elements: ['rotator'], duration: 0 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.setScenario('circFull');
      circ.hide('rotator');
      circ.show(['x', 'y', 'circle', 'rotatorFull']);
      figure.fnMap.exec('circSetup', 0.9, 'circle');
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
      figure.fnMap.exec('circSetup', 0.9, 'circle');
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
      figure.fnMap.exec('circSetup', 0.9, 'circle');
      // circ.animations.cleanAnimations();
      // figure.recorder.addCurrentStateAsReference();
    },
    leaveState: () => {
      circ.setScenarios('noSplit');
    },
  });


  nav.loadSlides(slides);
  // nav.goToSlide(53);
  nav.goToSlide(11);
}
makeSlides();
