/* eslint-disable camelcase */
/* globals figure, colTan, colCot, colCsc, color2, colSec, colTheta
   colCsc, centerText, leftText */

function layout() {
  figure.add([
    // {
    //   name: 'subTitle',
    //   method: 'textLines',
    //   options: {
    //     text: [
    //       // 'The Trigonmetric Functions',
    //       {
    //         // text: 'Where they come from, and how they relate',
    //         text: 'An interactive video',
    //         font: { size: 0.1 },
    //       },
    //     ],
    //     position: [0, 1],
    //     xAlign: 'center',
    //     justify: 'center',
    //     font: { size: 0.2, color: [0.3, 0.3, 0.3, 0.7] },
    //     fixColor: true,
    //   },
    // },
    centerText('title', 'The Trigonometric Functions', {}, [0, 1]),
    centerText('subTitle', 'An interactive video', {}, [0, 0.7], 0.1),
    leftText('background1', 'Similar Triangles', {}, [-1.8, 0]),
    leftText('background2', 'Similar Triangles  \u2192  Right Angle Triangles', {}, [-1.8, 0]),
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
      'title', 'subTitle',
      { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc'] }],
    enterStateCommon: () => {
      figure.fnMap.exec('circSetup', [0.9, 'title']);
      figure.shortCuts = { 0: 'circToRot' };
    },
    exec: [17, 'circToRot'],
  });

  slides.push({
    scenarioCommon: ['title'],
    show: ['title'],
    dissolve: {
      out: [
        'subTitle',
        { circ: ['arc', 'xQ1', 'yQ1', 'rotator', 'triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc'] },
      ],
      // in: 'background1',
    },
    time: 21,
  });

  slides.push({
    showCommon: ['title'],
    dissolve: { in: 'background1' },
    time: 24,
  });
  slides.push({
    showCommon: ['background1', 'title'],
    dissolve: { in: 'background2' },
    time: 26,
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
    dissolve: { out: ['background1', 'background2', 'title'], in: 'similar.allAngles' },
    time: 33,
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
    time: 36,
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
    time: 49,
  });

  // Theta
  slides.push({
    showCommon: ['rightTri.tri.line', 'rightTri.tri.angle1', 'rightTri.tri.angle2'],
    dissolve: { in: 'rightTri.tri.angle2' },
    time: 53.5,
  });

  // Complementary
  slides.push({
    showCommon: { 'rightTri.tri': ['line', 'angle1', 'angle2', 'angle0'] },
    dissolve: { in: 'rightTri.tri.angle0' },
    time: 56,
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
    time: 62,
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
    time: 66,
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
    time: 72,
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
      // figure.shortCuts = { 1: 'triAnimatePadTo' };
    },
    time: '1:22.2',
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
  slides.push({ form: 'names', time: '1:52' });

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
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
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
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
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
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
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
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
      figure.shortCuts = { 0: 'circToRot' };
      circ.highlight(['triSinCos.sin', 'theta']);
    },
    transition: (done) => {
      lines.animations.new()
        .dissolveOut({ elements: ['secant'], duration: 0.5 })
        .trigger({ callback: 'linesToChord', duration: 1.5 })
        .dissolveIn({ element: 'chord', duration: 0.5 })
        .trigger({ callback: 'showBow', duration: 4.5, delay: 1 })
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
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
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
        .then(circ._triCotCsc._cot.animations.pulseWidth({ line: 6, duration: 1 }))
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
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
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
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
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
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
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
      figure.fnMap.exec('circSetup', [0.9, 'quarter']);
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

figure.recorder.events.autoCursor.list = [
  [9.8328, ['show', -1.152, 0.036]],
  [16.8422, ['hide']],
  // Equal corresponding sides
  [45.0016, ['show', -0.228, 0.984]],
  [48.8371, ['hide']],
];

figure.recorder.events.autoTouch.list = [
  [12.1055, ['down', -0.048, -0.336]],
  [15.9975, ['up']],
  // Equal corresponding sides
  [45.7673, ['down', -0.18, 1.14]],
  [45.8715, ['up']],
  [47.2395, ['down', -0.18, 1.14]],
  [47.3855, ['up']],
];

// figure.recorder.events.autoExec.list = [
//   [17, ['circToRot']],
// ];
figure.recorder.events.autoCursorMove.list = [
  [10.3514, [-1.152, 0.036]],
  [10.3641, [-1.146, 0.036]],
  [10.3729, [-1.14, 0.03]],
  [10.3836, [-1.134, 0.03]],
  [10.3975, [-1.128, 0.024]],
  [10.4061, [-1.122, 0.024]],
  [10.4176, [-1.116, 0.024]],
  [10.4298, [-1.11, 0.018]],
  [10.4415, [-1.11, 0.018]],
  [10.4513, [-1.11, 0.018]],
  [10.4624, [-1.104, 0.018]],
  [10.4743, [-1.098, 0.018]],
  [10.4859, [-1.098, 0.012]],
  [10.4979, [-1.092, 0.012]],
  [10.5072, [-1.08, 0.006]],
  [10.5207, [-1.074, 0.006]],
  [10.5313, [-1.062, 0]],
  [10.5532, [-1.056, 0]],
  [10.5533, [-1.05, -0.006]],
  [10.5646, [-1.038, -0.006]],
  [10.5754, [-1.032, -0.012]],
  [10.5874, [-1.026, -0.012]],
  [10.5979, [-1.014, -0.012]],
  [10.6095, [-1.008, -0.018]],
  [10.6223, [-0.996, -0.018]],
  [10.6312, [-0.99, -0.024]],
  [10.6479, [-0.984, -0.024]],
  [10.6545, [-0.972, -0.024]],
  [10.6819, [-0.972, -0.03]],
  [10.6873, [-0.96, -0.03]],
  [10.6919, [-0.954, -0.036]],
  [10.702, [-0.948, -0.036]],
  [10.7151, [-0.942, -0.042]],
  [10.7231, [-0.93, -0.042]],
  [10.736, [-0.918, -0.048]],
  [10.7498, [-0.906, -0.048]],
  [10.7566, [-0.894, -0.054]],
  [10.7662, [-0.882, -0.06]],
  [10.7825, [-0.876, -0.06]],
  [10.7886, [-0.87, -0.06]],
  [10.8028, [-0.858, -0.066]],
  [10.8174, [-0.846, -0.066]],
  [10.8225, [-0.834, -0.072]],
  [10.8361, [-0.822, -0.072]],
  [10.8486, [-0.81, -0.078]],
  [10.8573, [-0.798, -0.078]],
  [10.8687, [-0.786, -0.084]],
  [10.8827, [-0.774, -0.084]],
  [10.8918, [-0.756, -0.09]],
  [10.9029, [-0.744, -0.096]],
  [10.9143, [-0.726, -0.096]],
  [10.9244, [-0.702, -0.102]],
  [10.9362, [-0.684, -0.108]],
  [10.9474, [-0.666, -0.114]],
  [10.959, [-0.648, -0.114]],
  [10.9701, [-0.63, -0.12]],
  [10.982, [-0.612, -0.126]],
  [10.9936, [-0.6, -0.126]],
  [11.0355, [-0.564, -0.138]],
  [11.0397, [-0.558, -0.138]],
  [11.0476, [-0.546, -0.144]],
  [11.0601, [-0.54, -0.144]],
  [11.0713, [-0.534, -0.144]],
  [11.0808, [-0.528, -0.15]],
  [11.0944, [-0.522, -0.15]],
  [11.1037, [-0.516, -0.15]],
  [11.1173, [-0.51, -0.15]],
  [11.127, [-0.51, -0.15]],
  [11.1374, [-0.504, -0.15]],
  [11.1504, [-0.498, -0.156]],
  [11.1612, [-0.492, -0.156]],
  [11.1728, [-0.486, -0.156]],
  [11.1824, [-0.48, -0.156]],
  [11.1963, [-0.48, -0.156]],
  [11.2046, [-0.474, -0.156]],
  [11.2173, [-0.468, -0.162]],
  [11.2297, [-0.462, -0.162]],
  [11.2391, [-0.456, -0.162]],
  [11.2497, [-0.45, -0.168]],
  [11.2644, [-0.444, -0.168]],
  [11.2728, [-0.438, -0.168]],
  [11.2841, [-0.426, -0.174]],
  [11.2979, [-0.42, -0.174]],
  [11.3105, [-0.408, -0.18]],
  [11.3171, [-0.402, -0.18]],
  [11.3308, [-0.396, -0.186]],
  [11.341, [-0.384, -0.186]],
  [11.3529, [-0.372, -0.192]],
  [11.3627, [-0.36, -0.192]],
  [11.3742, [-0.354, -0.198]],
  [11.3851, [-0.348, -0.198]],
  [11.3963, [-0.336, -0.204]],
  [11.4084, [-0.324, -0.204]],
  [11.4203, [-0.318, -0.21]],
  [11.4312, [-0.306, -0.216]],
  [11.4409, [-0.3, -0.216]],
  [11.4524, [-0.294, -0.222]],
  [11.4647, [-0.288, -0.222]],
  [11.4751, [-0.276, -0.228]],
  [11.4871, [-0.27, -0.234]],
  [11.4974, [-0.258, -0.24]],
  [11.5092, [-0.246, -0.24]],
  [11.5212, [-0.234, -0.246]],
  [11.5311, [-0.222, -0.252]],
  [11.5471, [-0.21, -0.258]],
  [11.5548, [-0.204, -0.264]],
  [11.5686, [-0.198, -0.264]],
  [11.5888, [-0.186, -0.27]],
  [11.5889, [-0.18, -0.27]],
  [11.5983, [-0.174, -0.276]],
  [11.6148, [-0.168, -0.276]],
  [11.6222, [-0.156, -0.276]],
  [11.6362, [-0.15, -0.282]],
  [11.6499, [-0.144, -0.282]],
  [11.6552, [-0.138, -0.288]],
  [11.6691, [-0.132, -0.288]],
  [11.6828, [-0.12, -0.294]],
  [11.6904, [-0.114, -0.3]],
  [11.7017, [-0.102, -0.3]],
  [11.713, [-0.096, -0.306]],
  [11.7223, [-0.084, -0.312]],
  [11.7356, [-0.078, -0.318]],
  [11.7483, [-0.072, -0.318]],
  [11.7572, [-0.066, -0.324]],
  [11.7706, [-0.06, -0.324]],
  [11.781, [-0.054, -0.33]],
  [11.7894, [-0.054, -0.33]],
  [11.8026, [-0.054, -0.33]],
  [11.8163, [-0.048, -0.33]],
  [11.8244, [-0.048, -0.33]],
  [11.8358, [-0.048, -0.336]],
  [11.8483, [-0.048, -0.336]],
  [12.0387, [-0.048, -0.336]],
  [12.0388, [-0.048, -0.336]],
  [12.2412, [-0.048, -0.336]],
  [12.2646, [-0.048, -0.336]],
  [12.2742, [-0.048, -0.336]],
  [12.2859, [-0.042, -0.336]],
  [12.2973, [-0.042, -0.336]],
  [12.3074, [-0.042, -0.336]],
  [12.3202, [-0.036, -0.342]],
  [12.3312, [-0.03, -0.348]],
  [12.3416, [-0.024, -0.354]],
  [12.3538, [-0.018, -0.354]],
  [12.3645, [-0.012, -0.36]],
  [12.3746, [-0.006, -0.366]],
  [12.387, [0, -0.372]],
  [12.3979, [0.006, -0.378]],
  [12.4087, [0.012, -0.384]],
  [12.4216, [0.018, -0.384]],
  [12.4358, [0.018, -0.39]],
  [12.4498, [0.024, -0.39]],
  [12.4566, [0.024, -0.396]],
  [12.4646, [0.03, -0.402]],
  [12.4813, [0.03, -0.402]],
  [12.4884, [0.03, -0.408]],
  [12.5021, [0.036, -0.408]],
  [12.5141, [0.036, -0.414]],
  [12.522, [0.042, -0.42]],
  [12.5321, [0.042, -0.42]],
  [12.5506, [0.042, -0.426]],
  [12.5579, [0.048, -0.426]],
  [12.5689, [0.048, -0.432]],
  [12.5818, [0.048, -0.438]],
  [12.5886, [0.048, -0.438]],
  [12.6025, [0.048, -0.444]],
  [12.6151, [0.048, -0.444]],
  [12.6237, [0.054, -0.45]],
  [12.6357, [0.054, -0.456]],
  [12.6482, [0.054, -0.462]],
  [12.6569, [0.054, -0.468]],
  [12.6689, [0.06, -0.474]],
  [12.6829, [0.06, -0.48]],
  [12.6912, [0.06, -0.48]],
  [12.7029, [0.066, -0.486]],
  [12.7149, [0.066, -0.492]],
  [12.7238, [0.066, -0.498]],
  [12.7351, [0.072, -0.504]],
  [12.7498, [0.072, -0.504]],
  [12.7586, [0.072, -0.51]],
  [12.77, [0.078, -0.516]],
  [12.7908, [0.078, -0.522]],
  [12.8053, [0.078, -0.522]],
  [12.8071, [0.078, -0.528]],
  [12.8139, [0.084, -0.528]],
  [12.8254, [0.084, -0.534]],
  [12.8364, [0.084, -0.54]],
  [12.8485, [0.084, -0.546]],
  [12.8602, [0.09, -0.546]],
  [12.8699, [0.09, -0.552]],
  [12.8829, [0.09, -0.558]],
  [12.8934, [0.09, -0.558]],
  [12.9036, [0.09, -0.564]],
  [12.9152, [0.096, -0.564]],
  [12.9285, [0.096, -0.57]],
  [12.9374, [0.096, -0.576]],
  [12.9501, [0.102, -0.582]],
  [12.9616, [0.102, -0.582]],
  [12.9719, [0.102, -0.588]],
  [12.9841, [0.102, -0.588]],
  [12.9936, [0.102, -0.594]],
  [13.0387, [0.108, -0.6]],
  [13.0458, [0.108, -0.606]],
  [13.0515, [0.108, -0.606]],
  [13.0623, [0.108, -0.612]],
  [13.072, [0.108, -0.612]],
  [13.086, [0.114, -0.618]],
  [13.0959, [0.114, -0.618]],
  [13.1061, [0.114, -0.624]],
  [13.1185, [0.114, -0.63]],
  [13.1293, [0.114, -0.63]],
  [13.1398, [0.114, -0.636]],
  [13.1524, [0.114, -0.636]],
  [13.164, [0.114, -0.642]],
  [13.1742, [0.114, -0.648]],
  [13.1852, [0.114, -0.654]],
  [13.1977, [0.114, -0.654]],
  [13.2083, [0.114, -0.66]],
  [13.225, [0.114, -0.666]],
  [13.2367, [0.114, -0.666]],
  [13.2432, [0.114, -0.666]],
  [13.2573, [0.114, -0.672]],
  [13.2645, [0.114, -0.672]],
  [13.2751, [0.12, -0.672]],
  [13.2869, [0.12, -0.678]],
  [13.2987, [0.12, -0.678]],
  [13.3089, [0.12, -0.684]],
  [13.3201, [0.12, -0.684]],
  [13.3311, [0.12, -0.684]],
  [13.3484, [0.12, -0.684]],
  [13.3689, [0.12, -0.684]],
  [13.7483, [0.12, -0.684]],
  [13.76, [0.12, -0.684]],
  [13.7695, [0.12, -0.684]],
  [13.7888, [0.12, -0.684]],
  [13.7947, [0.12, -0.684]],
  [13.8036, [0.12, -0.678]],
  [13.8155, [0.12, -0.678]],
  [13.8267, [0.126, -0.678]],
  [13.8373, [0.126, -0.678]],
  [13.8644, [0.126, -0.678]],
  [13.8708, [0.126, -0.678]],
  [13.884, [0.126, -0.678]],
  [13.8953, [0.126, -0.678]],
  [13.9046, [0.126, -0.672]],
  [13.9172, [0.126, -0.672]],
  [13.9281, [0.126, -0.672]],
  [13.9385, [0.126, -0.666]],
  [13.9514, [0.126, -0.666]],
  [13.9629, [0.126, -0.666]],
  [13.9769, [0.12, -0.66]],
  [13.9864, [0.12, -0.66]],
  [13.9958, [0.12, -0.654]],
  [14.0367, [0.114, -0.642]],
  [14.0438, [0.114, -0.642]],
  [14.0513, [0.114, -0.636]],
  [14.064, [0.108, -0.63]],
  [14.0758, [0.108, -0.63]],
  [14.0863, [0.108, -0.63]],
  [14.0975, [0.108, -0.624]],
  [14.1076, [0.102, -0.624]],
  [14.1202, [0.102, -0.618]],
  [14.1292, [0.102, -0.618]],
  [14.1418, [0.102, -0.612]],
  [14.1531, [0.096, -0.612]],
  [14.1643, [0.096, -0.606]],
  [14.1793, [0.09, -0.6]],
  [14.1873, [0.09, -0.6]],
  [14.198, [0.084, -0.594]],
  [14.2097, [0.084, -0.588]],
  [14.2214, [0.078, -0.588]],
  [14.2351, [0.078, -0.582]],
  [14.2439, [0.072, -0.582]],
  [14.2545, [0.072, -0.576]],
  [14.2651, [0.072, -0.576]],
  [14.2822, [0.066, -0.57]],
  [14.2881, [0.066, -0.564]],
  [14.3027, [0.06, -0.558]],
  [14.3172, [0.06, -0.558]],
  [14.3229, [0.054, -0.552]],
  [14.3359, [0.054, -0.546]],
  [14.3477, [0.048, -0.54]],
  [14.3554, [0.042, -0.54]],
  [14.3687, [0.042, -0.534]],
  [14.384, [0.036, -0.528]],
  [14.3898, [0.036, -0.522]],
  [14.4037, [0.03, -0.522]],
  [14.4159, [0.03, -0.516]],
  [14.4238, [0.024, -0.51]],
  [14.4358, [0.018, -0.504]],
  [14.4478, [0.018, -0.498]],
  [14.4564, [0.012, -0.498]],
  [14.4691, [0.006, -0.492]],
  [14.4817, [0.006, -0.486]],
  [14.4908, [0, -0.486]],
  [14.503, [0, -0.48]],
  [14.5145, [-0.006, -0.474]],
  [14.5232, [-0.012, -0.474]],
  [14.5364, [-0.012, -0.468]],
  [14.5494, [-0.012, -0.468]],
  [14.5578, [-0.018, -0.462]],
  [14.5687, [-0.018, -0.462]],
  [14.5811, [-0.024, -0.456]],
  [14.5927, [-0.03, -0.456]],
  [14.6026, [-0.03, -0.45]],
  [14.6157, [-0.036, -0.444]],
  [14.6248, [-0.036, -0.444]],
  [14.6363, [-0.042, -0.438]],
  [14.6479, [-0.042, -0.438]],
  [14.6596, [-0.048, -0.432]],
  [14.67, [-0.054, -0.426]],
  [14.6827, [-0.054, -0.426]],
  [14.6943, [-0.054, -0.426]],
  [14.7038, [-0.06, -0.42]],
  [14.7161, [-0.06, -0.42]],
  [14.7271, [-0.06, -0.42]],
  [14.7368, [-0.066, -0.42]],
  [14.7496, [-0.066, -0.414]],
  [14.7613, [-0.066, -0.414]],
  [14.7715, [-0.072, -0.414]],
  [14.7844, [-0.072, -0.408]],
  [14.7932, [-0.078, -0.408]],
  [14.8052, [-0.084, -0.402]],
  [14.8176, [-0.09, -0.402]],
  [14.8279, [-0.09, -0.396]],
  [14.8385, [-0.096, -0.396]],
  [14.8513, [-0.102, -0.39]],
  [14.8628, [-0.108, -0.384]],
  [14.8727, [-0.114, -0.384]],
  [14.8859, [-0.114, -0.378]],
  [14.8961, [-0.12, -0.378]],
  [14.9076, [-0.126, -0.372]],
  [14.9311, [-0.126, -0.372]],
  [14.9327, [-0.132, -0.366]],
  [14.9403, [-0.138, -0.366]],
  [14.9525, [-0.138, -0.366]],
  [14.9644, [-0.144, -0.36]],
  [14.974, [-0.144, -0.36]],
  [14.9852, [-0.144, -0.36]],
  [14.9979, [-0.144, -0.36]],
  [15.0434, [-0.15, -0.36]],
  [15.9765, [-0.15, -0.36]],
  [15.9993, [-0.15, -0.36]],
  [16.0507, [-0.15, -0.36]],
  [45.0453, [-0.222, 0.984]],
  [45.0565, [-0.222, 0.984]],
  [45.0696, [-0.222, 0.984]],
  [45.0789, [-0.222, 0.984]],
  [45.0902, [-0.222, 0.984]],
  [45.1027, [-0.222, 0.984]],
  [45.1131, [-0.216, 0.984]],
  [45.1242, [-0.216, 0.984]],
  [45.1359, [-0.216, 0.984]],
  [45.1463, [-0.216, 0.984]],
  [45.1577, [-0.216, 0.984]],
  [45.1696, [-0.216, 0.99]],
  [45.1802, [-0.21, 0.99]],
  [45.1915, [-0.21, 0.99]],
  [45.2037, [-0.21, 0.99]],
  [45.214, [-0.21, 0.996]],
  [45.2265, [-0.21, 1.002]],
  [45.2368, [-0.204, 1.008]],
  [45.2478, [-0.204, 1.008]],
  [45.2592, [-0.204, 1.014]],
  [45.2701, [-0.204, 1.014]],
  [45.2829, [-0.204, 1.014]],
  [45.293, [-0.204, 1.014]],
  [45.3046, [-0.204, 1.014]],
  [45.3154, [-0.204, 1.02]],
  [45.3268, [-0.204, 1.02]],
  [45.3377, [-0.204, 1.02]],
  [45.3607, [-0.204, 1.026]],
  [45.3612, [-0.198, 1.026]],
  [45.3715, [-0.198, 1.032]],
  [45.3829, [-0.198, 1.038]],
  [45.3942, [-0.198, 1.044]],
  [45.4067, [-0.198, 1.05]],
  [45.4167, [-0.198, 1.056]],
  [45.4279, [-0.198, 1.062]],
  [45.4389, [-0.198, 1.068]],
  [45.4505, [-0.192, 1.074]],
  [45.4618, [-0.192, 1.08]],
  [45.4728, [-0.192, 1.086]],
  [45.4851, [-0.192, 1.092]],
  [45.4958, [-0.192, 1.098]],
  [45.5077, [-0.192, 1.098]],
  [45.5178, [-0.192, 1.104]],
  [45.5292, [-0.192, 1.104]],
  [45.5401, [-0.192, 1.11]],
  [45.5513, [-0.186, 1.11]],
  [45.5632, [-0.186, 1.116]],
  [45.5744, [-0.186, 1.116]],
  [45.5866, [-0.186, 1.122]],
  [45.6076, [-0.18, 1.122]],
  [45.6087, [-0.18, 1.128]],
  [45.6186, [-0.18, 1.134]],
  [45.6304, [-0.18, 1.134]],
  [45.6413, [-0.18, 1.14]],
  [45.653, [-0.18, 1.14]],
  [45.6645, [-0.18, 1.14]],
  [45.6753, [-0.18, 1.14]],
  [45.6868, [-0.18, 1.14]],
  [47.7791, [-0.18, 1.14]],
  [47.7901, [-0.186, 1.14]],
  [47.8027, [-0.186, 1.14]],
  [47.8133, [-0.192, 1.14]],
  [47.8241, [-0.192, 1.14]],
  [47.8368, [-0.192, 1.14]],
  [47.8468, [-0.192, 1.14]],
  [47.858, [-0.198, 1.134]],
  [47.87, [-0.198, 1.134]],
  [47.8801, [-0.198, 1.128]],
  [47.8917, [-0.198, 1.128]],
  [47.9026, [-0.204, 1.122]],
  [47.9143, [-0.204, 1.122]],
  [47.9254, [-0.204, 1.122]],
  [47.9367, [-0.204, 1.116]],
  [47.9484, [-0.204, 1.116]],
  [47.9592, [-0.204, 1.11]],
  [47.9701, [-0.204, 1.104]],
  [47.9817, [-0.204, 1.104]],
  [47.9926, [-0.204, 1.092]],
  [48.0389, [-0.204, 1.068]],
  [48.0488, [-0.204, 1.062]],
  [48.0614, [-0.204, 1.056]],
  [48.0714, [-0.21, 1.05]],
  [48.0826, [-0.21, 1.044]],
  [48.094, [-0.21, 1.038]],
  [48.1054, [-0.21, 1.032]],
  [48.1165, [-0.21, 1.026]],
  [48.1279, [-0.21, 1.014]],
  [48.1389, [-0.21, 1.014]],
  [48.1503, [-0.21, 1.008]],
  [48.1613, [-0.21, 1.002]],
  [48.1727, [-0.21, 1.002]],
  [48.1839, [-0.21, 0.996]],
  [48.1953, [-0.21, 0.99]],
  [48.2066, [-0.21, 0.99]],
  [48.2178, [-0.216, 0.984]],
  [48.2289, [-0.216, 0.978]],
  [48.2402, [-0.216, 0.972]],
  [48.2517, [-0.216, 0.966]],
  [48.2627, [-0.216, 0.966]],
  [48.2742, [-0.216, 0.966]],
  [48.2854, [-0.216, 0.96]],
  [48.2969, [-0.216, 0.96]],
  [48.3083, [-0.216, 0.954]],
  [48.3193, [-0.216, 0.954]],
  [48.3302, [-0.216, 0.954]],
  [48.3414, [-0.216, 0.948]],
  [48.3532, [-0.216, 0.948]],
  [48.3691, [-0.216, 0.948]],
  [48.3752, [-0.216, 0.948]],
];

