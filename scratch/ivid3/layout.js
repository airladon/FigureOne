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
];

figure.recorder.events.autoTouch.list = [
  [12.1055, ['down', -0.048, -0.336]],
  [15.9975, ['up']],
];

figure.recorder.events.autoExec.list = [
  [17, ['circToRot']],
];
figure.recorder.events.autoCursorMove.list = [
  [10.3498, [-1.152, 0.036]],
  [10.361, [-1.146, 0.036]],
  [10.3723, [-1.14, 0.03]],
  [10.3833, [-1.134, 0.03]],
  [10.3942, [-1.128, 0.024]],
  [10.4054, [-1.122, 0.024]],
  [10.417, [-1.116, 0.024]],
  [10.428, [-1.11, 0.018]],
  [10.4412, [-1.11, 0.018]],
  [10.4506, [-1.11, 0.018]],
  [10.4617, [-1.104, 0.018]],
  [10.4731, [-1.098, 0.018]],
  [10.4844, [-1.098, 0.012]],
  [10.4959, [-1.092, 0.012]],
  [10.507, [-1.08, 0.006]],
  [10.5182, [-1.074, 0.006]],
  [10.5293, [-1.062, 0]],
  [10.5523, [-1.056, 0]],
  [10.5531, [-1.05, -0.006]],
  [10.5633, [-1.038, -0.006]],
  [10.5747, [-1.032, -0.012]],
  [10.5861, [-1.026, -0.012]],
  [10.5969, [-1.014, -0.012]],
  [10.6081, [-1.008, -0.018]],
  [10.6199, [-0.996, -0.018]],
  [10.6306, [-0.99, -0.024]],
  [10.6425, [-0.984, -0.024]],
  [10.6532, [-0.972, -0.024]],
  [10.68, [-0.972, -0.03]],
  [10.687, [-0.96, -0.03]],
  [10.6877, [-0.954, -0.036]],
  [10.6979, [-0.948, -0.036]],
  [10.7135, [-0.942, -0.042]],
  [10.7207, [-0.93, -0.042]],
  [10.7318, [-0.918, -0.048]],
  [10.7472, [-0.906, -0.048]],
  [10.7547, [-0.894, -0.054]],
  [10.766, [-0.882, -0.06]],
  [10.7806, [-0.876, -0.06]],
  [10.788, [-0.87, -0.06]],
  [10.7998, [-0.858, -0.066]],
  [10.8143, [-0.846, -0.066]],
  [10.8219, [-0.834, -0.072]],
  [10.8328, [-0.822, -0.072]],
  [10.8468, [-0.81, -0.078]],
  [10.8559, [-0.798, -0.078]],
  [10.8669, [-0.786, -0.084]],
  [10.8807, [-0.774, -0.084]],
  [10.8896, [-0.756, -0.09]],
  [10.901, [-0.744, -0.096]],
  [10.913, [-0.726, -0.096]],
  [10.9234, [-0.702, -0.102]],
  [10.9347, [-0.684, -0.108]],
  [10.946, [-0.666, -0.114]],
  [10.957, [-0.648, -0.114]],
  [10.9686, [-0.63, -0.12]],
  [10.9803, [-0.612, -0.126]],
  [10.9913, [-0.6, -0.126]],
  [11.0329, [-0.564, -0.138]],
  [11.037, [-0.558, -0.138]],
  [11.047, [-0.546, -0.144]],
  [11.0585, [-0.54, -0.144]],
  [11.0695, [-0.534, -0.144]],
  [11.0807, [-0.528, -0.15]],
  [11.0919, [-0.522, -0.15]],
  [11.103, [-0.516, -0.15]],
  [11.1145, [-0.51, -0.15]],
  [11.1258, [-0.51, -0.15]],
  [11.1368, [-0.504, -0.15]],
  [11.148, [-0.498, -0.156]],
  [11.1596, [-0.492, -0.156]],
  [11.1718, [-0.486, -0.156]],
  [11.1819, [-0.48, -0.156]],
  [11.1932, [-0.48, -0.156]],
  [11.2044, [-0.474, -0.156]],
  [11.2157, [-0.468, -0.162]],
  [11.2271, [-0.462, -0.162]],
  [11.2386, [-0.456, -0.162]],
  [11.2496, [-0.45, -0.168]],
  [11.2626, [-0.444, -0.168]],
  [11.2723, [-0.438, -0.168]],
  [11.2831, [-0.426, -0.174]],
  [11.2946, [-0.42, -0.174]],
  [11.3063, [-0.408, -0.18]],
  [11.3169, [-0.402, -0.18]],
  [11.3282, [-0.396, -0.186]],
  [11.3398, [-0.384, -0.186]],
  [11.3506, [-0.372, -0.192]],
  [11.3621, [-0.36, -0.192]],
  [11.3736, [-0.354, -0.198]],
  [11.3844, [-0.348, -0.198]],
  [11.3954, [-0.336, -0.204]],
  [11.4071, [-0.324, -0.204]],
  [11.4182, [-0.318, -0.21]],
  [11.4292, [-0.306, -0.216]],
  [11.4404, [-0.3, -0.216]],
  [11.4518, [-0.294, -0.222]],
  [11.4635, [-0.288, -0.222]],
  [11.4745, [-0.276, -0.228]],
  [11.4857, [-0.27, -0.234]],
  [11.4967, [-0.258, -0.24]],
  [11.5082, [-0.246, -0.24]],
  [11.5195, [-0.234, -0.246]],
  [11.5305, [-0.222, -0.252]],
  [11.5463, [-0.21, -0.258]],
  [11.5532, [-0.204, -0.264]],
  [11.5645, [-0.198, -0.264]],
  [11.5869, [-0.186, -0.27]],
  [11.5884, [-0.18, -0.27]],
  [11.5979, [-0.174, -0.276]],
  [11.613, [-0.168, -0.276]],
  [11.6206, [-0.156, -0.276]],
  [11.6321, [-0.15, -0.282]],
  [11.6471, [-0.144, -0.282]],
  [11.6544, [-0.138, -0.288]],
  [11.6655, [-0.132, -0.288]],
  [11.6799, [-0.12, -0.294]],
  [11.6885, [-0.114, -0.3]],
  [11.6992, [-0.102, -0.3]],
  [11.7126, [-0.096, -0.306]],
  [11.7217, [-0.084, -0.312]],
  [11.7347, [-0.078, -0.318]],
  [11.7472, [-0.072, -0.318]],
  [11.7557, [-0.066, -0.324]],
  [11.7673, [-0.06, -0.324]],
  [11.7806, [-0.054, -0.33]],
  [11.7893, [-0.054, -0.33]],
  [11.8009, [-0.054, -0.33]],
  [11.8141, [-0.048, -0.33]],
  [11.823, [-0.048, -0.33]],
  [11.8344, [-0.048, -0.336]],
  [11.8464, [-0.048, -0.336]],
  [12.0032, [-0.048, -0.336]],
  [12.0337, [-0.048, -0.336]],
  [12.2401, [-0.048, -0.336]],
  [12.262, [-0.048, -0.336]],
  [12.2734, [-0.048, -0.336]],
  [12.2844, [-0.042, -0.336]],
  [12.2958, [-0.042, -0.336]],
  [12.3071, [-0.042, -0.336]],
  [12.3183, [-0.036, -0.342]],
  [12.3294, [-0.03, -0.348]],
  [12.341, [-0.024, -0.354]],
  [12.3519, [-0.018, -0.354]],
  [12.3631, [-0.012, -0.36]],
  [12.3744, [-0.006, -0.366]],
  [12.3857, [0, -0.372]],
  [12.3967, [0.006, -0.378]],
  [12.408, [0.012, -0.384]],
  [12.4194, [0.018, -0.384]],
  [12.4309, [0.018, -0.39]],
  [12.4478, [0.024, -0.39]],
  [12.4531, [0.024, -0.396]],
  [12.4645, [0.03, -0.402]],
  [12.4811, [0.03, -0.402]],
  [12.4871, [0.03, -0.408]],
  [12.4983, [0.036, -0.408]],
  [12.5129, [0.036, -0.414]],
  [12.5207, [0.042, -0.42]],
  [12.5319, [0.042, -0.42]],
  [12.5464, [0.042, -0.426]],
  [12.5544, [0.048, -0.426]],
  [12.5659, [0.048, -0.432]],
  [12.5805, [0.048, -0.438]],
  [12.5882, [0.048, -0.438]],
  [12.5994, [0.048, -0.444]],
  [12.6133, [0.048, -0.444]],
  [12.6218, [0.054, -0.45]],
  [12.6333, [0.054, -0.456]],
  [12.6472, [0.054, -0.462]],
  [12.6559, [0.054, -0.468]],
  [12.667, [0.06, -0.474]],
  [12.6813, [0.06, -0.48]],
  [12.6894, [0.06, -0.48]],
  [12.7004, [0.066, -0.486]],
  [12.7132, [0.066, -0.492]],
  [12.7234, [0.066, -0.498]],
  [12.7346, [0.072, -0.504]],
  [12.7479, [0.072, -0.504]],
  [12.7572, [0.072, -0.51]],
  [12.7684, [0.078, -0.516]],
  [12.7863, [0.078, -0.522]],
  [12.8024, [0.078, -0.522]],
  [12.8046, [0.078, -0.528]],
  [12.8131, [0.084, -0.528]],
  [12.8245, [0.084, -0.534]],
  [12.8358, [0.084, -0.54]],
  [12.8472, [0.084, -0.546]],
  [12.8586, [0.09, -0.546]],
  [12.8696, [0.09, -0.552]],
  [12.8814, [0.09, -0.558]],
  [12.8924, [0.09, -0.558]],
  [12.9032, [0.09, -0.564]],
  [12.9141, [0.096, -0.564]],
  [12.9257, [0.096, -0.57]],
  [12.9372, [0.096, -0.576]],
  [12.9481, [0.102, -0.582]],
  [12.9595, [0.102, -0.582]],
  [12.971, [0.102, -0.588]],
  [12.9819, [0.102, -0.588]],
  [12.9931, [0.102, -0.594]],
  [13.0351, [0.108, -0.6]],
  [13.0409, [0.108, -0.606]],
  [13.0507, [0.108, -0.606]],
  [13.0608, [0.108, -0.612]],
  [13.0719, [0.108, -0.612]],
  [13.0832, [0.114, -0.618]],
  [13.0946, [0.114, -0.618]],
  [13.1056, [0.114, -0.624]],
  [13.1171, [0.114, -0.63]],
  [13.1283, [0.114, -0.63]],
  [13.1393, [0.114, -0.636]],
  [13.1508, [0.114, -0.636]],
  [13.162, [0.114, -0.642]],
  [13.1732, [0.114, -0.648]],
  [13.1844, [0.114, -0.654]],
  [13.1957, [0.114, -0.654]],
  [13.2069, [0.114, -0.66]],
  [13.2201, [0.114, -0.666]],
  [13.2296, [0.114, -0.666]],
  [13.2413, [0.114, -0.666]],
  [13.2521, [0.114, -0.672]],
  [13.2634, [0.114, -0.672]],
  [13.2745, [0.12, -0.672]],
  [13.2859, [0.12, -0.678]],
  [13.2973, [0.12, -0.678]],
  [13.3085, [0.12, -0.684]],
  [13.3196, [0.12, -0.684]],
  [13.3306, [0.12, -0.684]],
  [13.3469, [0.12, -0.684]],
  [13.3648, [0.12, -0.684]],
  [13.7471, [0.12, -0.684]],
  [13.7587, [0.12, -0.684]],
  [13.7692, [0.12, -0.684]],
  [13.7862, [0.12, -0.684]],
  [13.7927, [0.12, -0.684]],
  [13.8032, [0.12, -0.678]],
  [13.8146, [0.12, -0.678]],
  [13.8256, [0.126, -0.678]],
  [13.837, [0.126, -0.678]],
  [13.8592, [0.126, -0.678]],
  [13.8703, [0.126, -0.678]],
  [13.8818, [0.126, -0.678]],
  [13.8935, [0.126, -0.678]],
  [13.9042, [0.126, -0.672]],
  [13.9156, [0.126, -0.672]],
  [13.9267, [0.126, -0.672]],
  [13.9379, [0.126, -0.666]],
  [13.9493, [0.126, -0.666]],
  [13.9605, [0.126, -0.666]],
  [13.9717, [0.12, -0.66]],
  [13.9847, [0.12, -0.66]],
  [13.9947, [0.12, -0.654]],
  [14.0333, [0.114, -0.642]],
  [14.0413, [0.114, -0.642]],
  [14.0505, [0.114, -0.636]],
  [14.0619, [0.108, -0.63]],
  [14.0748, [0.108, -0.63]],
  [14.0843, [0.108, -0.63]],
  [14.0956, [0.108, -0.624]],
  [14.1069, [0.102, -0.624]],
  [14.1183, [0.102, -0.618]],
  [14.1292, [0.102, -0.618]],
  [14.1405, [0.102, -0.612]],
  [14.1519, [0.096, -0.612]],
  [14.1631, [0.096, -0.606]],
  [14.1742, [0.09, -0.6]],
  [14.1856, [0.09, -0.6]],
  [14.197, [0.084, -0.594]],
  [14.2081, [0.084, -0.588]],
  [14.2195, [0.078, -0.588]],
  [14.2309, [0.078, -0.582]],
  [14.242, [0.072, -0.582]],
  [14.2532, [0.072, -0.576]],
  [14.2646, [0.072, -0.576]],
  [14.2793, [0.066, -0.57]],
  [14.287, [0.066, -0.564]],
  [14.3004, [0.06, -0.558]],
  [14.3151, [0.06, -0.558]],
  [14.3206, [0.054, -0.552]],
  [14.3329, [0.054, -0.546]],
  [14.3466, [0.048, -0.54]],
  [14.3544, [0.042, -0.54]],
  [14.3659, [0.042, -0.534]],
  [14.38, [0.036, -0.528]],
  [14.3884, [0.036, -0.522]],
  [14.3994, [0.03, -0.522]],
  [14.4143, [0.03, -0.516]],
  [14.4218, [0.024, -0.51]],
  [14.4329, [0.018, -0.504]],
  [14.4463, [0.018, -0.498]],
  [14.4557, [0.012, -0.498]],
  [14.4672, [0.006, -0.492]],
  [14.4804, [0.006, -0.486]],
  [14.4894, [0, -0.486]],
  [14.5009, [0, -0.48]],
  [14.513, [-0.006, -0.474]],
  [14.5231, [-0.012, -0.474]],
  [14.5343, [-0.012, -0.468]],
  [14.5475, [-0.012, -0.468]],
  [14.557, [-0.018, -0.462]],
  [14.5685, [-0.018, -0.462]],
  [14.5795, [-0.024, -0.456]],
  [14.5907, [-0.03, -0.456]],
  [14.6024, [-0.03, -0.45]],
  [14.6132, [-0.036, -0.444]],
  [14.6243, [-0.036, -0.444]],
  [14.6358, [-0.042, -0.438]],
  [14.6468, [-0.042, -0.438]],
  [14.6581, [-0.048, -0.432]],
  [14.6695, [-0.054, -0.426]],
  [14.681, [-0.054, -0.426]],
  [14.6918, [-0.054, -0.426]],
  [14.7031, [-0.06, -0.42]],
  [14.7142, [-0.06, -0.42]],
  [14.7254, [-0.06, -0.42]],
  [14.7366, [-0.066, -0.42]],
  [14.7482, [-0.066, -0.414]],
  [14.7591, [-0.066, -0.414]],
  [14.7708, [-0.072, -0.414]],
  [14.7819, [-0.072, -0.408]],
  [14.7927, [-0.078, -0.408]],
  [14.8045, [-0.084, -0.402]],
  [14.8156, [-0.09, -0.402]],
  [14.8266, [-0.09, -0.396]],
  [14.8383, [-0.096, -0.396]],
  [14.8494, [-0.102, -0.39]],
  [14.8603, [-0.108, -0.384]],
  [14.8719, [-0.114, -0.384]],
  [14.8831, [-0.114, -0.378]],
  [14.8947, [-0.12, -0.378]],
  [14.906, [-0.126, -0.372]],
  [14.9283, [-0.126, -0.372]],
  [14.93, [-0.132, -0.366]],
  [14.9396, [-0.138, -0.366]],
  [14.9507, [-0.138, -0.366]],
  [14.9622, [-0.144, -0.36]],
  [14.9734, [-0.144, -0.36]],
  [14.9845, [-0.144, -0.36]],
  [14.9958, [-0.144, -0.36]],
  [15.0341, [-0.15, -0.36]],
  [15.9747, [-0.15, -0.36]],
  [15.9987, [-0.15, -0.36]],
  [16.0325, [-0.15, -0.36]],
];

