/* eslint-disable camelcase */
/* globals figure, colTan, colCot, colCsc, color2, colSec, colTheta
   colCsc */

function layout() {
  const centerText = (name, text, modifiers = {}, position = [0, 0], size = 0.2) => ({
    name,
    method: 'textLines',
    options: {
      text,
      modifiers,
      position,
      xAlign: 'center',
      justify: 'left',
      yAlign: 'middle',
      font: { size, color: [0.3, 0.3, 0.3, 1] },
      fixColor: true,
    },
    mods: {
      scenarios: {
        default: { position, scale: 1 },
        topHigh: { position: [0, 1.2], scale: 1 },
        top: { position: [0, 1], scale: 1 },
        // right: { position: [1, 0] },
      },
      isTouchable: true,
    },
  });

  const leftText = (name, position, text, modifiers = {}, size = 0.2) => ({
    name,
    method: 'textLines',
    options: {
      text,
      modifiers,
      position,
      xAlign: 'left',
      justify: 'left',
      yAlign: 'baseline',
      font: { size, color: [0.3, 0.3, 0.3, 1] },
      fixColor: true,
    },
    mods: {
      isTouchable: true,
    //   scenarios: {
    //     top: { position: [-2, 1], scale: 1 },
    //     default: { position: [-2, 0], scale: 1 },
    //   },
    },
  });

  // const link = (name, text, position, onClick = {}) => ({
  //   name,
  //   method: 'text',
  //   options: {
  //     text,
  //     position,
  //     font: { size: 0.1 },
  //     xAlign: 'center',
  //   },
  //   mods: {
  //     isTouchable: true,
  //     touchBorder: 0.1,
  //     onClick,
  //   },
  // });

  // const hint = (name, position, hints) => {
  //   const elements = [];
  //   elements.push({
  //     name: 'label',
  //     method: 'text',
  //     options: {
  //       text: 'Hint',
  //       xAlign: 'center',
  //       font: { size: 0.1 },
  //     },
  //     mods: {
  //       isTouchable: true,
  //       touchBorder: 0.1,
  //       onClick: () => {
  //         const hintElement = figure.getElement(name);
  //         for (let i = 0; i < hints.length; i += 1) {
  //           const hintText = hintElement.getElement(`hint${i}`);
  //           if (hintText.isShown) {
  //             hintText.hide();
  //             if (i < hints.length - 1) {
  //               hintElement.getElement(`hint${i + 1}`).show();
  //               return;
  //             }
  //             return;
  //           }
  //         }
  //         hintElement.getElement(`hint${0}`).show();
  //       },
  //     },
  //   });
  //   hints.forEach((h, index) => {
  //     elements.push({
  //       name: `hint${index}`,
  //       method: 'primitives.textLines',
  //       options: {
  //         text: h.text,
  //         modifiers: h.modifiers,
  //         position: [0, -0.2],
  //         xAlign: 'center',
  //       },
  //       mods: {
  //         isTouchable: true,
  //         hasTouchableElements: true,
  //       },
  //     });
  //   });
  //   return {
  //     name,
  //     method: 'collection',
  //     elements,
  //     options: {
  //       position,
  //     },
  //   };
  // };

  // const hint = (name, position, text, modifiers = {}) => ({
  //   name,
  //   method: 'collection',
  //   elements: [
  //     {
  //       name: 'label',
  //       method: 'text',
  //       options: {
  //         text: 'Hint',
  //         xAlign: 'center',
  //         font: { size: 0.1 },
  //       },
  //       mods: {
  //         isTouchable: true,
  //         touchBorder: 0.1,
  //         onClick: () => {
  //           const hintElement = figure.getElement(name);
  //           const hintText = hintElement.getElement('hint');
  //           if (hintText.isShown) {
  //             hintText.hide();
  //           } else {
  //             hintText.show();
  //           }
  //         },
  //       },
  //     },
  //     {
  //       name: 'hint',
  //       method: 'primitives.textLines',
  //       options: {
  //         text,
  //         modifiers,
  //         position: [0, -0.2],
  //         xAlign: 'center',
  //       },
  //     },
  //   ],
  //   options: {
  //     position,
  //   },
  // });

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
    centerText('firstCentury', '1|st| century CE', {
      // Geometry: {
      //   font: { style: 'italic', color: color2 },
      // },
      st: { font: { size: 0.1 }, offset: [0, 0.1] },
    }, [0, 0.8]),
    centerText('geometry', '|Geometry|', {
      Geometry: {
        font: { style: 'italic', color: color2 },
      },
    }, [0, 0]),
    centerText('fifteenth', '15|th| century CE', {
      th: { font: { size: 0.1 }, offset: [0, 0.1] },
    }, [0, 0.8]),
    centerText('lateTwentieth', 'Late 20|th| century CE', {
      th: { font: { size: 0.1 }, offset: [0, 0.1] },
    }, [0, 0.8]),
    centerText('calculators', 'Personal |Calculators| & |Computers|', {
      Calculators: { font: { style: 'italic', color: color2 } },
      Computers: { font: { style: 'italic', color: color2 } },
    }, [0, 0]),
    centerText('background', 'Background'),
    // centerText('sumOfAngles', 'Angles in a triangle always add to 180\u00b0'),
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
    centerText('compTangent', '|co|mplementary |t|angent', {
      co: { font: { color: colCot } },
      t: { font: { color: colCot } },
    }, [1.2, 1]),
    centerText('compSecant', '|c|omplementary |s|e|c|ant', {
      c: { font: { color: colCsc } },
      s: { font: { color: colCsc } },
    }, [1.2, 1]),
    centerText('cot', '|cot|', {
      cot: { font: { style: 'italic', family: 'Times New Roman', color: colCot } },
    }, [0.8, 0.6]),
    centerText('secant', '|secant|: from Latin |secare| - "to cut"', {
      secant: { font: { style: 'italic', family: 'Times New Roman', color: colSec } },
      secare: { font: { style: 'italic', family: 'Times New Roman' } },
    }, [1.3, 0], 0.15),
    leftText('allTriangles', [-2, 0.95], 'All right triangles with |theta|:', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }),
    leftText('haveSameAngles', [0.1, 0.95], ' have the |same angles|', {
      'same angles': {
        font: { color: colTheta },
        onClick: 'triPulseAngles',
        touchBorder: 0.1,
      },
    }),
    leftText('areSimilar', [0.1, 0.95], ' are similar'),
    leftText('haveTheSame', [0.1, 0.95], ' have the same'),
    leftText('haveEqualCorr', [0.1, 0.95], ' have equal corresponding'),
    leftText('sideRatios', [0.1, 0.7], ' side ratios'),
    leftText('hasTheSameValue', [-1.2, 1.2], 'for all right triangles with |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.12),
    leftText('hasTheSameValue1', [-1.2, 0.7], 'for all right triangles with |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.12),
    leftText('hasTheSameValue2', [-1.2, 0.2], 'for all right triangles with |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.12),
    leftText('hasTheSameValue3', [-1.2, -0.3], 'for all right triangles with |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.12),
    leftText('hasTheSameValue4', [-1.2, -0.8], 'for all right triangles with |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.12),
    leftText('hasTheSameValue5', [-1.2, -1.3], 'for all right triangles with |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.12),
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
layoutCircle();
// layoutCircle1();
layout();
// rightTris();
// const totalAngle = totalAngleLayout();
similarLayout();
// layoutTable();
// layoutBow();

function makeSlides() {
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [3.8, 0], width: 0.2, height: 0.2 },
      prevButton: { position: [-3.8, 0], width: 0.2, height: 0.2 },
      equation: ['eqn', 'bow.eqn', 'eqn1', 'circle1.bowStringLabel', 'circ.tanAltEqn', 'circ.cotAltEqn', 'circ.cscAltEqn', 'eqn2', 'circ.cosLabelEqn', 'eqn3', 'similar.eqn', 'circ.sinEqn', 'circ.cosAltEqn'],
      // equationDefaults: { duration: 4 },
    },
  });
  const slides = [];

  const nav = figure.getElement('nav');
  const rightTri = figure.getElement('rightTri');
  const circle = figure.getElement('circle');
  // const rightTris = figure.getElement('rightTris');
  const eqn = figure.getElement('eqn');
  const table = figure.getElement('table');
  const bow = figure.getElement('bow');
  const circ = figure.getElement('circ');
  const eqn3 = figure.getElement('eqn3');

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
    scenarioCommon: ['circTitle', 'title'],
    showCommon: ['title', { circ: ['arcLight', 'rotator', 'tanAlt', 'secAlt', 'cotAlt', 'cscAlt', 'hypLight', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'sinLabel', 'sin', 'cosAlt', 'cosLabelAlt'] }],
    show: 'title',
    enterStateCommon: () => {
      figure.fnMap.exec('cSetAngle', 1);
      figure.fnMap.exec('circSetBounds', 'title');
    },
  });
  slides.push({
    enterStateCommon: () => {
      figure.fnMap.exec('cSetAngle', 1);
      figure.fnMap.exec('circSetBounds', 'quarter');
    },
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          figure.getElement('title').animations.dissolveOut(0.4),
          circ.animations.scenario({ target: 'circPreview', duration: 1.5 }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.setScenario('circPreview');
      figure.hide('title');
    },
  });

  // slides.push({
  //   show: ['circle', 'title'],
  //   scenario: 'title',
  //   steadyState: () => {
  //     circle.getElement('line').setRotation(0.87);
  //   },
  // });


  /*
  ..######..####.##.....##.####.##..........###....########.
  .##....##..##..###...###..##..##.........##.##...##.....##
  .##........##..####.####..##..##........##...##..##.....##
  ..######...##..##.###.##..##..##.......##.....##.########.
  .......##..##..##.....##..##..##.......#########.##...##..
  .##....##..##..##.....##..##..##.......##.....##.##....##.
  ..######..####.##.....##.####.########.##.....##.##.....##
  */
  // const sTri1 = figure.getElement('similar.tri1');
  // const sTri2 = figure.getElement('similar.tri2');

  // slides.push({
  //   form: null,
  //   scenarioCommon: ['default', 'topHigh'],
  //   dissolve: { in: 'similarTriangles' },
  // });

  // slides.push({
  //   scenarioCommon: ['default', 'topHigh'],
  //   // show: ['similarTriangles'],
  //   transition: (done) => {
  //     figure.getElement('similarTriangles').animations.new()
  //       .dissolveIn(0.4)
  //       .inParallel([
  //         sTri1.getElement('line').animations.dissolveIn(0.8),
  //         sTri2.getElement('line').animations.dissolveIn(0.8),
  //       ])
  //       .then(figure.getElement('similar.summary1').animations.dissolveIn(0.8))
  //       .inParallel([
  //         sTri1.getElement('angle0').animations.dissolveIn(0.8),
  //         sTri1.getElement('angle1').animations.dissolveIn(0.8),
  //         sTri1.getElement('angle2').animations.dissolveIn(0.8),
  //       ])
  //       .inParallel([
  //         sTri2.getElement('angle0').animations.dissolveIn(0.8),
  //         sTri2.getElement('angle1').animations.dissolveIn(0.8),
  //         sTri2.getElement('angle2').animations.dissolveIn(0.8),
  //       ])
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     figure.getElement('similarTriangles').setScenario('topHigh');
  //     figure.show(['similar.tri1', 'similar.tri2', 'similar.summary1']);
  //     sTri1.hideSides();
  //     sTri2.hideSides();
  //   },
  // });

  // slides.push({
  //   show: ['similarTriangles', 'similar.tri1', 'similar.tri2', 'similar.summary1', 'similar.summary2'],
  //   transition: (done) => {
  //     sTri1.hideSides();
  //     sTri2.hideSides();
  //     figure.getElement('similar.summary2').animations.new()
  //       .dissolveIn(0.8)
  //       .inParallel([
  //         sTri1.getElement('side01').animations.dissolveIn(0.8),
  //         sTri1.getElement('side12').animations.dissolveIn(0.8),
  //         sTri1.getElement('side20').animations.dissolveIn(0.8),
  //       ])
  //       .inParallel([
  //         sTri2.getElement('side01').animations.dissolveIn(0.8),
  //         sTri2.getElement('side12').animations.dissolveIn(0.8),
  //         sTri2.getElement('side20').animations.dissolveIn(0.8),
  //       ])
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     sTri1.showAll();
  //     sTri2.showAll();
  //   },
  // });

  slides.push({
    scenarioCommon: ['default', 'topHigh'],
    showCommon: ['similarTriangles', 'similar.tri1', 'similar.tri2', 'similar.summary1', 'similar.summary2', 'similar.summary3'],
    dissolve: { in: ['similarTriangles', 'similar'] },
  });

  /*
  .########..####..######...##.....##.########....########.########..####
  .##.....##..##..##....##..##.....##....##..........##....##.....##..##.
  .##.....##..##..##........##.....##....##..........##....##.....##..##.
  .########...##..##...####.#########....##..........##....########...##.
  .##...##....##..##....##..##.....##....##..........##....##...##....##.
  .##....##...##..##....##..##.....##....##..........##....##....##...##.
  .##.....##.####..######...##.....##....##..........##....##.....##.####
  */
  const initialAngle = 0.7;
  slides.push({
    clear: true,
    scenarioCommon: ['default', 'left', 'top'],
    show: ['rightTri.tri.line'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      rightTri._tri.hideSides();
      rightTri._tri._angle2.hide();
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    dissolve: { in: ['rightTri.tri.line', 'rightTri.tri.angle1'] },
    steadyStateCommon: () => {
      figure.shortcuts = {
        1: 'triPulseRight',
        2: 'triPulseTheta',
        3: 'triPulseOpp',
        4: 'triPulseHyp',
        5: 'triPulseAdj',
      };
    },
  });

  // dissolve in theta
  slides.push({
    show: ['rightTri.tri.line', 'rightTri.tri.angle1'],
    dissolve: { in: 'rightTri.tri.angle2' },
  });

  // Dissolve in third angle
  slides.push({
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      rightTri._tri.hideSides();
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle1'],
    dissolve: { in: 'rightTri.tri.angle0' },
  });

  // Dissolve in All Triangles
  slides.push({
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle0', 'rightTri.tri.angle1'],
    dissolve: { in: 'allTriangles' },
  });

  // Dissolve in Have the Same Angles
  slides.push({
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle0', 'allTriangles', 'rightTri.tri.angle1'],
    dissolve: { in: 'haveSameAngles' },
  });

  // Dissolve Are Similar
  slides.push({
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle0', 'rightTri.tri.angle1', 'allTriangles', 'haveSameAngles'],
    dissolve: {
      out: ['haveSameAngles', 'rightTri.tri.angle0'],
      in: 'areSimilar',
    },
  });

  // Dissolve Have equal corresponding side ratios
  slides.push({
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle1', 'allTriangles'],
    dissolve: {
      out: ['areSimilar'],
      in: ['haveEqualCorr', 'sideRatios'],
    },
  });

  // Dissolve in sides
  slides.push({
    scenarioCommon: ['default', 'eqnTri'],
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle1', 'allTriangles', 'haveEqualCorr', 'sideRatios'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    fromForm: { eqn3: 'r1Constant' },
    form: { eqn3: 'r1Constant' },
    transition: (done) => {
      // eqn3.showForm('oppOnHyp');
      eqn3.hide();
      figure.animations.new()
        .inParallel([
          // eqn3.animations.scenario({ target: 'eqnTri', duration: 2 }),
          rightTri.animations.scenario({ start: 'default', target: 'eqnTri', duration: 2 }),
          figure.getElement('haveEqualCorr').animations.dissolveOut(0.4),
          figure.getElement('sideRatios').animations.dissolveOut(0.4),
          figure.getElement('allTriangles').animations.dissolveOut(0.4),
          figure.getElement('rightTri.tri.side01').animations.dissolveIn(0.4),
          figure.getElement('rightTri.tri.side12').animations.dissolveIn(0.4),
          figure.getElement('rightTri.tri.side20').animations.dissolveIn(0.4),
        ])
        .inParallel([
          eqn3.animations.dissolveIn(0.4),
          // figure.getElement('hasTheSameValue').animations.dissolveIn(0.4),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.hide(['haveEqualCorr', 'sideRatios', 'allTriangles']);
      figure.getElement('rightTri.tri').show(['side01', 'side12', 'side20']);
      // figure.getElement('hasTheSameValue').show();
    },
  });

  // Dissolve in all ratios the same with opp on hyp
  slides.push({
    showCommon: ['rightTri'],
    hideCommon: ['rightTri.tri.angle0'],
    form: { eqn3: 'r2Constant' },
    // transition: (done) => {
    //   figure.animations.new()
    //     .inParallel([
    //       eqn3.animations.goToForm({ target: 'r2', duration: 2, animate: 'move' }),
    //       figure.getElement('hasTheSameValue1').animations.dissolveIn(0.4),
    //     ])
    //     .whenFinished(done)
    //     .start();
    // },
    // steadyState: () => {
    //   figure.getElement('hasTheSameValue1').show();
    //   // eqn.showForm('twoSideRatios');
    // },
  });

  // Dissolve in two ratios
  slides.push({
    form: { eqn3: 'rConstant' },
    // transition: (done) => {
    //   figure.animations.new()
    //     .inParallel([
    //       eqn3.animations.goToForm({ target: 'r3', duration: 2, animate: 'move' }),
    //       figure.getElement('hasTheSameValue2').animations.dissolveIn(0.4),
    //       figure.getElement('hasTheSameValue3').animations.dissolveIn(0.4),
    //       figure.getElement('hasTheSameValue4').animations.dissolveIn(0.4),
    //       figure.getElement('hasTheSameValue5').animations.dissolveIn(0.4),
    //       rightTri.animations.dissolveOut(0.4),
    //     ])
    //     .whenFinished(done)
    //     .start();
    // },
    // steadyState: () => {
    //   figure.getElement('hasTheSameValue2').show();
    //   figure.getElement('hasTheSameValue3').show();
    //   figure.getElement('hasTheSameValue4').show();
    //   figure.getElement('hasTheSameValue5').show();
    //   eqn.showForm('sixSideRatios');
    //   rightTri.hide();
    // },
  });

  // slides.push({
  //   form: { eqn3: 'rValues' },
  //   steadyState: () => {
  //     rightTri.hasTouchableElements = true;
  //     figure.shortcuts = {
  //       1: 'triAnimateToRot',
  //     };
  //   },
  // });

  // // Dissolve second ratio
  // slides.push({
  //   fromForm: 'sixSideRatios',
  //   form: 'sixSideRatios',
  //   show: ['rightTri', 'hasTheSameValue', 'hasTheSameValue1', 'hasTheSameValue2', 'hasTheSameValue3', 'hasTheSameValue4', 'hasTheSameValue5'],
  //   hideCommon: ['rightTri.tri.angle0'],
  //   transition: (done) => {
  //     figure.animations.new()
  //       .inParallel([
  //         figure.getElement('hasTheSameValue').animations.dissolveOut(0.4),
  //         figure.getElement('hasTheSameValue1').animations.dissolveOut(0.4),
  //         figure.getElement('hasTheSameValue2').animations.dissolveOut(0.4),
  //         figure.getElement('hasTheSameValue3').animations.dissolveOut(0.4),
  //         figure.getElement('hasTheSameValue4').animations.dissolveOut(0.4),
  //         figure.getElement('hasTheSameValue5').animations.dissolveOut(0.4),
  //         rightTri.animations.dissolveIn(0.4),
  //       ])
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     figure.getElement('hasTheSameValue').hide();
  //     figure.getElement('hasTheSameValue1').hide();
  //     figure.getElement('hasTheSameValue2').hide();
  //     figure.getElement('hasTheSameValue3').hide();
  //     figure.getElement('hasTheSameValue4').hide();
  //     figure.getElement('hasTheSameValue5').hide();
  //     rightTri.show();
  //   },
  // });

  // // Dissolve in all ratios
  // slides.push({
  //   fromForm: 'sixSideRatios',
  //   form: 'sixSideRatios',
  //   show: ['rightTri', 'hasTheSameValue', 'hasTheSameValue1'],
  //   dissolve: { out: ['hasTheSameValue', 'hasTheSameValue1'] },
  // });

  const circle1 = figure.getElement('circle1');
  /*
  .########.##.....##.##....##..######..########.####..#######..##....##
  .##.......##.....##.###...##.##....##....##.....##..##.....##.###...##
  .##.......##.....##.####..##.##..........##.....##..##.....##.####..##
  .######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##
  .##.......##.....##.##..####.##..........##.....##..##.....##.##..####
  .##.......##.....##.##...###.##....##....##.....##..##.....##.##...###
  .##........#######..##....##..######.....##....####..#######..##....##
  */
  slides.push({
    clear: true,
    scenarioCommon: ['default', 'eqnTri'],
    show: ['rightTri'],
    hideCommon: ['rightTri.tri.angle0'],
    fromForm: { eqn3: 'rConstant' },
    form: { eqn3: 'rValues' },
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      // rightTri._tri._side20.hide();
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          figure.animations.trigger({ callback: 'triAnimateToValues', duration: 0.8 }),
          eqn3.animations.goToForm({ target: 'rValues', animate: 'move' }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.fnMap.exec('triToValues');
      // figure.getElement('haveTheSame').hide();
      // figure.getElement('allTriangles').hide();
      // eqn.showForm('sixSideRatiosWithValue');
      // figure.fnMap.exec('triToRot', initialAngle);
      rightTri.hasTouchableElements = true;
      figure.shortcuts = {
        1: 'triAnimateToRot',
      };
    },
  });

  slides.push({
    enterStateCommon: () => {
      figure.fnMap.exec('triToValues');
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    show: ['rightTri'],
    // fromForm: 'sixSideRatiosWithValue',
    form: { eqn3: 'rFunctions' },
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          figure.animations.trigger({ callback: 'triAnimateToNames', duration: 0.8 }),
          eqn3.animations.goToForm({ delay: 0.4, target: 'rFunctions', animate: 'move' }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.fnMap.exec('triToNames');
      // eqn.showForm('sixSideRatiosFunction');
      rightTri.hasTouchableElements = true;
    },
  });
  slides.push({
    show: ['rightTri'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    form: { eqn3: 'rNames' },
  });

  /*
  .##.......####.##....##.########..######.
  .##........##..###...##.##.......##....##
  .##........##..####..##.##.......##......
  .##........##..##.##.##.######....######.
  .##........##..##..####.##.............##
  .##........##..##...###.##.......##....##
  .########.####.##....##.########..######.
  */
  slides.push({
    clear: true,
    scenarioCommon: 'circLines',
    showCommon: { circ: 'circle' },
    fromForm: null,
    form: null,
    dissolve: { in: 'circ.circle' },
  });

  slides.push({
    showCommon: ['circ.chord', 'circ.circle'],
    dissolve: { in: 'circ.chord' },
  });
  slides.push({ dissolve: { in: 'chord' } });
  slides.push({ show: ['chord'], dissolve: { in: 'circ.bow' } });

  slides.push({
    showCommon: { circ: ['chord', 'circle', 'tangent'] },
    dissolve: { out: ['chord', 'circ.bow'], in: 'circ.tangent' },
  });
  slides.push({ dissolve: { in: 'tangent' } });
  slides.push({
    show: 'tangent',
    dissolve: { in: { circ: ['radius', 'rightAngle', 'center'] } },
  });
  slides.push({
    showCommon: { circ: ['chord', 'circle', 'tangent', 'secant'] },
    dissolve: {
      out: { circ: ['radius', 'rightAngle', 'center'] },
      in: 'circ.secant',
    },
  });
  slides.push({
    dissolve: {
      in: 'secant',
    },
  });

  /*
  .##.....##.##....##.####.########.....######..####.########...######.
  .##.....##.###...##..##.....##.......##....##..##..##.....##.##....##
  .##.....##.####..##..##.....##.......##........##..##.....##.##......
  .##.....##.##.##.##..##.....##.......##........##..########..##......
  .##.....##.##..####..##.....##.......##........##..##...##...##......
  .##.....##.##...###..##.....##.......##....##..##..##....##..##....##
  ..#######..##....##.####....##........######..####.##.....##..######.
  */

  slides.push({
    scenarioCommon: 'circQuarter',
    enterStateCommon: () => {
      figure.fnMap.exec('cSetAngle', initialAngle);
    },
    showCommon: { circ: ['arc', 'x', 'y', 'rightOrigin', 'unitCsc'] },
    dissolve: { in: { circ: ['arc', 'x', 'y', 'rightOrigin', 'unitCsc'] } },
    leaveStateCommon: () => circ.undim(),
  });
  slides.push({
    showCommon: { circ: ['arc', 'x', 'y', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'rightOrigin', 'unitCsc'] },
    dissolve: {
      in: { circ: ['tanLight', 'secLight', 'cotLight', 'cscLight'] },
    },
  });
  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'rightTanAlt'] },
    dissolve: {
      out: { circ: ['rightOrigin', 'unitCsc'] },
      in: { circ: ['hypAlt', 'hypLabel', 'rightTanAlt'] },
    },
  });
  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'rightTanAlt'] },
    dissolve: {
      in: { circ: ['theta'] },
    },
  });


  /*
  .########....###....##....##.....######..########..######.
  ....##......##.##...###...##....##....##.##.......##....##
  ....##.....##...##..####..##....##.......##.......##......
  ....##....##.....##.##.##.##.....######..######...##......
  ....##....#########.##..####..........##.##.......##......
  ....##....##.....##.##...###....##....##.##.......##....##
  ....##....##.....##.##....##.....######..########..######.
  */
  slides.push({
    scenarioCommon: ['circQuarter', 'eqnCirc'],
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanAlt', 'rightTanAlt'] },
    dissolve: {
      in: { circ: ['tanAlt'], pulse: { translation: 0.05 } },
    },
    enterStateCommon: () => {
      figure.fnMap.exec('cSetAngle', initialAngle);
      circ.highlight(['tanAlt', 'tanLabelAlt', 'hypAlt', 'hypLabel', 'theta', 'secLabelAlt', 'tanAltEqn', 'secAlt', 'thetaCot']);
      figure.fnMap.exec('circSetBounds', 'circle');
    },
  });
  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanAlt', 'tanAltEqn', 'rightTanAlt'] },
    dissolve: {
      in: { circ: ['tanAltEqn'] },
    },
    fromForm: { 'circ.tanAltEqn': null },
    form: { 'circ.tanAltEqn': 'tangent' },
  });
  slides.push({ form: { 'circ.tanAltEqn': 'tanTheta' } });
  slides.push({ form: { 'circ.tanAltEqn': 'tan' } });


  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanAlt', 'tanLabelAlt', 'secAlt', 'rightTanAlt'] },
    dissolve: { in: { circ: ['secAlt'] } },
    fromForm: { 'circ.tanAltEqn': null },
    form: { eqn3: null, 'circ.tanAltEqn': null },
  });

  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanAlt', 'tanLabelAlt', 'secAlt', 'secLabelAlt', 'rightTanAlt'] },
    dissolve: { in: { circ: ['secLabelAlt'] } },
    steadyStateCommon: () => {
      figure.shortcuts = {
        1: 'eqnPulseOppAdj',
        2: 'eqnPulseHypAdj',
        3: 'eqnPulseTanAdj',
        4: 'eqnPulseSecAdj',
        5: 'circPulseTanAlt',
        6: 'circPulseSecAlt',
        7: 'circPulseRad',
        8: 'circPulseTheta',
      };
    },
  });

  slides.push({
    form: { eqn3: '0', 'circ.tanAltEqn': null },
  });

  slides.push({ form: { eqn3: '1' } });
  slides.push({ form: { eqn3: '2' } });
  slides.push({ form: { eqn3: '3' } });
  slides.push({ form: { eqn3: '4' } });

  /*
  ..######...#######..########.....######...######...######.
  .##....##.##.....##....##.......##....##.##....##.##....##
  .##.......##.....##....##.......##.......##.......##......
  .##.......##.....##....##.......##........######..##......
  .##.......##.....##....##.......##.............##.##......
  .##....##.##.....##....##.......##....##.##....##.##....##
  ..######...#######.....##........######...######...######.
  */
  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'thetaComp', 'rightCotAlt'] },
    enterStateCommon: () => {
      figure.fnMap.exec('cSetAngle', initialAngle);
      circ.highlight(['cotAlt', 'cotLabelAlt', 'hypAlt', 'hypLabel', 'thetaComp', 'cscAlt', 'cscLabelAlt', 'cotAltEqn', 'cscAltEqn', 'thetaCot']);
      figure.fnMap.exec('circSetBounds', 'circle');
    },
    dissolve: { in: { circ: ['thetaComp'] } },
    steadyStateCommon: () => {
      figure.shortcuts = {
        1: 'circPulseThetaComp',
      };
    },
  });

  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'thetaComp', 'rightCotAlt', 'thetaCot'] },
    dissolve: { in: { circ: ['thetaCot'] } },
  });

  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotAlt', 'thetaComp', 'rightCotAlt', 'thetaCot'] },
    dissolve: { in: { circ: ['cotAlt'] } },
  });
  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotAlt', 'thetaComp', 'rightCotAlt', 'cotAltEqn', 'thetaCot'] },
    fromForm: { eqn3: '4', 'circ.cotAltEqn': null },
    form: { eqn3: '4', 'circ.cotAltEqn': 'tanComp' },
  });

  slides.push({ form: { eqn3: '4', 'circ.cotAltEqn': 'complementaryTangent' } });
  slides.push({ form: { eqn3: '4', 'circ.cotAltEqn': 'cotangent' } });
  slides.push({ form: { eqn3: '4', 'circ.cotAltEqn': 'cotTheta' } });
  slides.push({ form: { eqn3: '4', 'circ.cotAltEqn': 'cot' } });

  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotAlt', 'thetaComp', 'rightCotAlt', 'cotLabelAlt', 'cscAlt', 'cscAltEqn', 'thetaCot'] },
    fromForm: { eqn3: '4', 'circ.cotAltEqn': null, 'circ.cscAltEqn': 'secComp' },
    form: { eqn3: '4', 'circ.cscAltEqn': 'secComp' },
    dissolve: { in: { circ: ['cscAlt', 'cscAltEqn'] } },
  });
  // slides.push({ form: { eqn3: '4', 'circ.cscAltEqn': 'cosec' } });
  slides.push({ form: { eqn3: '4', 'circ.cscAltEqn': 'cosecant' } });
  slides.push({ form: { eqn3: '4', 'circ.cscAltEqn': 'cosec' } });
  slides.push({ form: { eqn3: '4', 'circ.cscAltEqn': 'csc' } });
  slides.push({
    dissolve: { out: { circ: ['thetaComp'] } },
    steadyStateCommon: () => {
      figure.shortcuts = {
        1: 'eqnPulseAdjOpp',
        2: 'eqnPulseHypOpp',
        3: 'eqnPulseCotOpp',
        4: 'eqnPulseCscOpp',
        5: 'circPulseCotAlt',
        6: 'circPulseCscAlt',
        7: 'circPulseRad',
        8: 'circPulseTheta',
        9: 'circPulseThetaCot',
      };
    },
  });

  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotAlt', 'rightCotAlt', 'cotLabelAlt', 'cscAlt', 'cscLabelAlt', 'thetaCot'] },
    fromForm: { eqn3: '5', 'circ.cscAltEqn': null },
    form: { eqn3: '5' },
  });
  slides.push({ form: { eqn3: '6' } });
  slides.push({ form: { eqn3: '7' } });
  slides.push({ form: { eqn3: '8' } });

  /*
  ..######..####.##....##.....######...#######...######.
  .##....##..##..###...##....##....##.##.....##.##....##
  .##........##..####..##....##.......##.....##.##......
  ..######...##..##.##.##....##.......##.....##..######.
  .......##..##..##..####....##.......##.....##.......##
  .##....##..##..##...###....##....##.##.....##.##....##
  ..######..####.##....##.....######...#######...######.
  */
  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'cscLabelAlt', 'rightSin', 'sin'] },
    enterStateCommon: () => {
      figure.fnMap.exec('cSetAngle', initialAngle);
      circ.highlight(['sin', 'sinLabel', 'sinEqn', 'hypLabel', 'hypAlt', 'rightSin', 'cosAlt', 'cosEqnAlt', 'cosLabelAlt', 'thetaComp', 'cosAltEqn', 'thetaCos', 'theta']);
    },
    dissolve: { in: { circ: ['sin', 'rightSin'] } },
  });
  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinEqn', 'sin'] },
    dissolve: { in: { circ: ['sinEqn'] } },
    fromForm: { eqn3: '8', 'circ.sinEqn': 'halfChord' },
    form: { eqn3: '8', 'circ.sinEqn': 'halfChord' },
  });

  // slides.push({ form: { eqn3: '8', 'circ.sinEqn': 'sinus' } });
  slides.push({ form: { eqn3: '8', 'circ.sinEqn': 'sine' } });
  slides.push({
    form: { eqn3: '8', 'circ.sinEqn': 'sin' },
    steadyStateCommon: () => {
      figure.shortcuts = {
        1: 'circPulseTheta',
        2: 'circPulseSinEqn',
        3: 'circPulseRad',
        4: 'eqnPulseOppAdj',
      };
    },
  });
  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin'] },
    fromForm: { eqn3: '8', 'circ.sinEqn': null },
    form: { eqn3: '9' },
  });
  slides.push({ form: { eqn3: '10' } });

  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin', 'cosAlt', 'thetaComp', 'cosAltEqn', 'rightCosAlt'] },
    fromForm: { eqn3: '10', 'circ.sinEqn': null, 'circ.cosAltEqn': 'sinComp' },
    form: { eqn3: '10', 'circ.sinEqn': null, 'circ.cosAltEqn': 'sinComp' },
    dissolve: { in: { circ: ['thetaComp', 'cosAlt', 'cosAltEqn', 'rightCosAlt'] } },
  });
  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin', 'cosAlt', 'cosAltEqn', 'rightCosAlt'] },
    form: { eqn3: '10', 'circ.cosAltEqn': 'cosine' },
  });
  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin', 'cosAlt', 'cosAltEqn', 'rightCosAlt'] },
    form: { eqn3: '10', 'circ.cosAltEqn': 'cos' },
  });
  slides.push({
    dissolve: { in: 'circ.thetaCos' },
    form: { eqn3: '10', 'circ.cosAltEqn': 'cos' },
  });
  // slides.push({ form: { eqn3: '9' } });
  // slides.push({ form: { eqn3: '10' } });
  slides.push({
    showCommon: { circ: ['arc', 'rotator', 'tanLight', 'secLight', 'cotLight', 'cscLight', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin', 'cosAlt', 'cosLabelAlt', 'rightCosAlt'] },
    fromForm: { eqn3: '10', 'circ.cosAltEqn': null },
    form: { eqn3: '11' },
    // steadyStateCommon: () => {
    //   figure.shortcuts = {
    //     1: 'eqnPulseAdjOpp',
    //     2: 'eqnPulseHypOpp',
    //     3: 'eqnPulseCotOpp',
    //     4: 'eqnPulseCscOpp',
    //     5: 'circPulseCotAlt',
    //     6: 'circPulseCscAlt',
    //     7: 'circPulseRad',
    //     8: 'circPulseTheta',
    //     9: 'circPulseThetaCot',
    //   };
    // },
  });
  slides.push({ form: { eqn3: '12' } });

  slides.push({
    showCommon: { circ: ['x', 'y', 'arc', 'rotator', 'tanAlt', 'secAlt', 'cotAlt', 'cscAlt', 'hypAlt', 'hypLabel', 'theta', 'tanLabelAlt', 'secLabelAlt', 'cotLabelAlt', 'theta', 'cscLabelAlt', 'rightSin', 'sinLabel', 'sin', 'cosAlt', 'cosLabelAlt', 'rightCosAlt'] },
    enterStateCommon: () => {
      figure.fnMap.exec('cSetAngle', initialAngle);
      figure.fnMap.exec('circSetBounds', 'circle');
    },
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          eqn3.animations.scenario({ target: 'eqnCirc', duration: 1 }),
          circ.animations.scenario({ target: 'circQuarterRight', duration: 1 }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      eqn3.setScenario('eqnCirc');
      circ.setScenario('circQuarterRight');
    },
  });

  slides.push({
    scenarioCommon: ['circQuarterRight', 'eqnCirc'],
    form: { eqn3: 'compRearrange' },
  });
  slides.push({ form: { eqn3: 'compHalf' } });
  // slides.push({ form: { eqn3: 'compHalf2' } });
  slides.push({ form: { eqn3: 'comp' } });

  slides.push({ form: { eqn3: 'recRearrange' } });
  slides.push({ form: { eqn3: 'recHalf' } });
  slides.push({ form: { eqn3: 'rec' } });

  slides.push({ form: { eqn3: 'tanRearrange' } });

  slides.push({ form: { eqn3: '13' } });
  slides.push({ form: { eqn3: '14' } });
  slides.push({ form: { eqn3: '15' } });
  slides.push({ form: { eqn3: '16' } });
  slides.push({ form: { eqn3: '17' } });
  // slides.push({ form: { eqn3: '18' } });
  // slides.push({ form: { eqn3: '19' } });
  // slides.push({ form: { eqn3: '20' } });
  slides.push({ form: { eqn3: 'values' } });
  slides.push({
    // scenarioCommon: 'circValues',
    showCommon: { circ: ['rotatorFull', 'arc', 'hypAlt', 'hypLabel', 'thetaVal', 'tanAlt', 'tanLabelAlt', 'secAlt', 'secLabelAlt', 'cotAlt', 'cotLabelAlt', 'cscAlt', 'cscLabelAlt', 'sinLabel', 'sin', 'cosAlt', 'cosLabelAlt', 'x', 'y'] },
    form: { eqn3: 'values' },
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          eqn3.animations.goToForm({ target: 'values', duration: 1 }),
          circ.animations.scenario({ target: 'circValues', duration: 1 }),
        ])
        .inParallel([
          circ._circleLight.animations.dissolveIn(0.4),
          circ._xFull.animations.dissolveIn(0.4),
          circ._yFull.animations.dissolveIn(0.4),
          circ._arc.animations.dissolveOut(0.4),
          // circ._circleLight.animations.dissolveIn(0.4),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circ.show(['xFull', 'yFull', 'circleLight']);
      circ.hide(['arc']);
      circ.setScenario('circValues');
    },
    // leaveStateCommon: () => eqn3.undim(),
  });

  slides.push({
    scenarioCommon: ['circValues', 'eqnCirc'],
    showCommon: { circ: ['rotatorFull', 'thetaVal', 'tan', 'tanLabel', 'sec', 'secLabel', 'cot', 'cotLabel', 'csc', 'cscLabel', 'sinLabel', 'sin', 'cos', 'cosLabel', 'x', 'y'] },
    form: { eqn3: 'values' },
    steadyState: () => {
      circ.show(['xFull', 'yFull', 'circleLight']);
    },
    // leaveStateCommon: () => eqn3.undim(),
  });

  slides.push({
    form: { eqn3: 'comp' },
  });
  // showCommon: { circ: ['circle', 'rotatorFull', 'hypAlt', 'hypLabel', 'thetaVal', 'tanAlt', 'tanLabelAlt', 'secAlt', 'secLabelAlt', 'cotAlt', 'cotLabelAlt', 'cscAlt', 'cscLabelAlt', 'sinLabel', 'sin', 'cosAlt', 'cosLabelAlt', 'xFull', 'yFull'] },


  nav.loadSlides(slides);
  nav.goToSlide(85);
}
makeSlides();
