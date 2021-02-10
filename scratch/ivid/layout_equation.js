function makeEquation() {
  const lines = (linesIn, translation = {}, alignment = {}) => {
    const contentLines = [];
    linesIn.forEach((line) => {
      const [content, justify, baselineSpace] = line;
      contentLines.push({
        content, justify, baselineSpace: baselineSpace || 0.6,
      });
    });
    return {
      content: {
        lines: {
          content: contentLines,
          baselinSpace: 0.6,
          justify: 'element',
        },
      },
      translation,
      alignment,
    };
  };
  const cont = (content, width = 0.6) => ({
    container: { content, width },
  });
  const space = { container: ['', 0.6] };
  figure.add({
    name: 'eqn',
    method: 'equation',
    options: {
      elements: {
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
        v3: { symbol: 'vinculum' },
        v4: { symbol: 'vinculum' },
        v5: { symbol: 'vinculum' },
        v6: { symbol: 'vinculum' },
        v7: { symbol: 'vinculum' },
        v8: { symbol: 'vinculum' },
        v9: { symbol: 'vinculum' },
        v10: { symbol: 'vinculum' },
        equals1: '  =  ',
        equals2: '  =  ',
        equals3: '  =  ',
        equals4: '  =  ',
        equals5: '  =  ',
        equals6: '  =  ',
        oppValue: { text: '1.000' },
        hypValue: { text: '1' },
        ratioValue: { text: '0.4540' },
        oppValueDef: { text: '0.4540' },
        hypValueDef: { text: '1' },
        ratioValueDef: { text: '0.4540' },
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        lb1: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        // theta: { text: '\u03b8', color: color1 },
        theta1: { text: '\u03b8', color: colTheta },
        theta2: { text: '\u03b8', color: colTheta },
        theta3: { text: '\u03b8', color: colTheta },
        theta4: { text: '\u03b8', color: colTheta },
        theta5: { text: '\u03b8', color: colTheta },
        theta6: { text: '\u03b8', color: colTheta },
        theta7: { text: '\u03b8', color: colTheta },
        theta8: { text: '\u03b8', color: colTheta },
        theta9: { text: '\u03b8', color: colTheta },
        theta10: { text: '\u03b8', color: colTheta },
        theta11: { text: '\u03b8', color: colTheta },
        theta12: { text: '\u03b8', color: colTheta },
        dotDotDot: '...',
        bowstring: { color: color1 },
        halfBowstring: { text: 'half-bowstring', color: color1 },
        sinus: { color: color1 },
        sine: { color: color1 },
        sinText: { color: color1 },
        tan: { font: { style: 'normal' } },
        gent: { font: { style: 'normal' } },
        sin: { font: { style: 'normal' } },
        sin_1: { font: { style: 'normal' } },
        sin_2: { font: { style: 'normal' } },
        sin_3: { font: { style: 'normal' } },
        sin_4: { font: { style: 'normal' } },
        csc: { font: { style: 'normal' } },
        sec: { font: { style: 'normal' } },
        cot: { font: { style: 'normal' } },
        // cos: { font: { style: 'normal' } },
        cos_1: { font: { style: 'normal' } },
        cos_2: { font: { style: 'normal' } },
        cos_3: { font: { style: 'normal' } },
        cos_4: { font: { style: 'normal' } },
        _1_rad: { color: colRad },
        ine: { font: { style: 'normal' } },
        mplementary: { font: { style: 'normal' } },
        s: { font: { style: 'normal' } },
        co: { font: { style: 'normal' } },
        comma: ',',
        times1: ' \u00d7 ',
        times2: ' \u00d7 ',
        times3: ' \u00d7 ',
        times4: ' \u00d7 ',
        opposite: { color: colSin },
        opposite_1: { color: colSin },
        opposite_2: { color: colSin },
        opposite_3: { color: colSin },
        hypotenuse: { color: colRad },
        hypotenuse_1: { color: colRad },
        hypotenuse_2: { color: colRad },
        hypotenuse_3: { color: colRad },
        hypotenuse_4: { color: colRad },
        adjacent: { color: colCos },
        adjacent_1: { color: colCos },
        adjacent_2: { color: colCos },
        adjacent_3: { color: colCos },
        _90min: { text: '90\u00b0 \u2212 ', color: color1 },
        brace: { symbol: 'brace', side: 'top', color: color1 },
        stk1: { symbol: 'strike', style: 'forward', lineWidth: 0.006 },
        stk2: { symbol: 'strike', style: 'forward', lineWidth: 0.006 },
      },
      phrases: {
        oppOnOne: { frac: ['opposite', 'v1', cont('_1_rad')] },
        oppOnHyp: { frac: ['opposite', 'v1', cont('hypotenuse')] },
        adjOnHyp: { frac: ['adjacent', 'v2', cont('hypotenuse_1')] },
        oppOnAdj: { frac: ['opposite_1', 'v3', 'adjacent_1'] },
        hypOnOpp: { frac: [cont('hypotenuse_3'), 'v4', 'opposite_2'] },
        hypOnAdj: { frac: [cont('hypotenuse_4'), 'v5', 'adjacent_2'] },
        adjOnOpp: { frac: ['adjacent_3', 'v6', 'opposite_3'] },
        fTheta: ['function', { container: ['', 0.02] }, { brac: ['lb', 'theta1', 'rb'] }],
        sinBracTheta: ['sin_1', { brac: ['lb', 'theta1', 'rb'] }],
        // sinTheta: ['sin', ' ', 'theta'],
        sinTheta1: ['sin_1', ' ', 'theta1'],
        sinTheta2: ['sin_2', ' ', 'theta2'],
        sinTheta3: ['sin_3', ' ', 'theta3'],
        sinTheta4: ['sin_4', ' ', 'theta4'],
        cos: ['co', 's'],
        cosineTheta: ['cos', 'ine', ' ', 'theta5'],
        cosTheta1: ['cos', ' ', 'theta5'],
        cosTheta2: ['cos_2', ' ', 'theta6'],
        cosTheta3: ['cos_3', ' ', 'theta7'],
        cosTheta4: ['cos_4', ' ', 'theta8'],
        tangentTheta: ['tan', 'gent', ' ', 'theta9'],
        tanTheta: ['tan', ' ', 'theta9'],
        cscTheta: ['csc', ' ', 'theta10'],
        secTheta: ['sec', ' ', 'theta11'],
        cotTheta: ['cot', ' ', 'theta12'],
        sinOnCos: { frac: ['sinTheta2', 'v7', 'cosTheta2'] },
        cosOnSin: { frac: ['cosTheta4', 'v8', 'sinTheta4'] },
        oneOnSinTheta: { frac: ['_1_1', 'v9', 'sinTheta3'] },
        oneOnCosTheta: { frac: ['_1_2', 'v10', 'cosTheta3'] },
        sinComp: ['sin_2', { brac: ['lb1', ['_90min', 'theta2'], 'rb1'] }],
        compComment: {
          topComment: {
            content: ['_90min', 'theta2'],
            comment: { 'complementary angle': { color: color1 } },
            inSize: false,
            commentSpace: 0.1,
            contentSpace: 0.1,
            symbol: 'brace',
          },
        },
        sinCompComment: ['sin_2', { brac: ['lb1', 'compComment', 'rb1'] }],
        complementarySineTheta: ['co', 'mplementary', ' ', 's', 'ine', ' ', 'theta5'],
      },
      formDefaults: {
        translation: {
          hypotenuse: { style: 'curve', mag: 0.5, direction: 'down' },
          hypotenuse_1: { style: 'curve', mag: 0.5, direction: 'down' },
          duration: 2,
        },
      },
      forms: {
        oppOnHyp: 'oppOnHyp',
        oneRatio: ['oppOnHyp', 'equals1', 'constant_1'],
        twoRatios: lines([
          [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
          [['adjOnHyp', 'equals2'], 'equals2'],
        ]),
        twoRatiosSinComp: lines([
          [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
          [['adjOnHyp', 'equals2', 'sinComp'], 'equals2'],
        ]),
        twoRatiosSinCompComment: lines([
          [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
          [['adjOnHyp', 'equals2', 'sinCompComment'], 'equals2'],
        ]),
        twoRatiosComplementarySine: lines([
          [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
          [['adjOnHyp', 'equals2', 'sinCompComment'], 'equals2'],
          [['equals3', 'complementarySineTheta'], 'equals3', 0.4],
        ]),
        twoRatiosCosine: lines([
          [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
          [['adjOnHyp', 'equals2', 'sinCompComment'], 'equals2'],
          [['equals3', 'cosineTheta'], 'equals3', 0.4],
        ]),
        twoRatiosCos: lines([
          [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
          [['adjOnHyp', 'equals2', 'sinCompComment'], 'equals2'],
          [['equals3', 'cosTheta1'], 'equals3', 0.4],
        ]),
        twoRatiosCosOnly: lines([
          [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
          [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
        ]),
        threeRatiosEqual: lines([
          [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
          [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
          [['oppOnAdj', 'equals3'], 'equals3'],
        ]),
        threeRatiosSineTimes: lines(
          [
            [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta1'], 'equals1'],
            [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta1'], 'equals2'],
            [['oppOnAdj', 'equals3'], 'equals3'],
          ],
          // {
          //   hypotenuse: { style: 'curve', mag: 0.5, direction: 'down' },
          //   hypotenuse_1: { style: 'curve', mag: 0.5, direction: 'down' },
          // },
          // { xAlign: 'left' },
        ),
        threeRatiosSineTimes2: lines(
          [
            [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta1'], 'equals1'],
            [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta1'], 'equals2'],
            [['oppOnAdj', 'equals3', {
              frac: [
                ['hypotenuse_2', 'times3', 'sinTheta2'],
                'v4',
                ['hypotenuse_3', 'times4', 'cosTheta2'],
              ],
            }], 'equals3'],
          ],
        ),
        threeRatiosSineTimesStrike: lines(
          [
            [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta1'], 'equals1'],
            [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta1'], 'equals2'],
            [['oppOnAdj', 'equals3', {
              frac: [
                [{ strike: ['hypotenuse_2', 'stk1'] }, 'times3', 'sinTheta2'],
                'v4',
                [{ strike: ['hypotenuse_3', 'stk2'] }, 'times4', 'cosTheta2'],
              ],
            }], 'equals3'],
          ],
        ),
        threeRatiosSineOnCosTimes: lines(
          [
            [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta1'], 'equals1'],
            [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta1'], 'equals2'],
            [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
          ],
        ),
        threeRatiosSineOnCos: lines(
          [
            [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
            [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
            [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
          ],
        ),
        fourRatios: lines(
          [
            [['oppOnHyp', 'equals1', 'sinTheta1', space, 'hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals1'],
            [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
            [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
          ],
        ),
        fiveRatios: lines(
          [
            [['oppOnHyp', 'equals1', 'sinTheta1', space, 'hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals1'],
            [['adjOnHyp', 'equals2', 'cosTheta1', space, 'hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals2'],
            [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
          ],
        ),
        sixRatios: lines(
          [
            [['oppOnHyp', 'equals1', 'sinTheta1', space, cont(['hypOnOpp', 'equals4', 'oneOnSinTheta'], 1)], 'equals1'],
            [['adjOnHyp', 'equals2', 'cosTheta1', space, 'hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals2'],
            [['oppOnAdj', 'equals3', 'sinOnCos', space, 'adjOnOpp', 'equals6', 'cosOnSin'], 'equals3'],
          ],
        ),
        sixRatiosLeft: lines(
          [
            [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
            [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
            [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
            [['hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals5'],
            [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
            [['adjOnOpp', 'equals6', 'cosOnSin'], 'equals6'],
          ],
          {
            hypotenuse: { style: 'linear' },
            hypotenuse_1: { style: 'linear' },
          },
        ),
        sixRatiosLeftOnOne: lines(
          [
            [['oppOnOne', 'equals1', 'sinTheta1'], 'equals1'],
            [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
            [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
            [['hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals5'],
            [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
            [['adjOnOpp', 'equals6', 'cosOnSin'], 'equals6'],
          ],
        ),
        sixRatiosLeftOpp: lines(
          [
            [['opposite', 'equals1', 'sinTheta1'], 'equals1'],
            [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
            [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
            [['hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals5'],
            [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
            [['adjOnOpp', 'equals6', 'cosOnSin'], 'equals6'],
          ],
        ),


        threeRatiosSineOnCosTangent: lines(
          [
            [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], 'equals1'],
            [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], 'equals2'],
            [['oppOnAdj', 'equals3', { frac: ['sinTheta1', 'v4', 'cosTheta1'] }], 'equals3'],
            [['equals4', 'tangentTheta'], 'equals4'],
          ],
        ),
        threeRatiosSineOnCosTan: lines(
          [
            [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], 'equals1'],
            [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], 'equals2'],
            [['oppOnAdj', 'equals3', { frac: ['sinTheta1', 'v4', 'cosTheta1'] }], 'equals3'],
            [['equals4', 'tanTheta'], 'equals4'],
          ],
        ),
        threeRatiosTimesTan: lines(
          [
            [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], 'equals1'],
            [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], 'equals2'],
            [['oppOnAdj', 'equals3', 'tanTheta'], 'equals3'],
          ],
        ),
        threeRatiosSinCosTan: lines(
          [
            [['oppOnHyp', 'equals1', 'sinTheta'], 'equals1'],
            [['adjOnHyp', 'equals2', 'cosTheta'], 'equals2'],
            [['oppOnAdj', 'equals3', 'tanTheta'], 'equals3'],
          ],
          {
            hypotenuse: { style: 'curve', mag: 0.5, direction: 'down' },
            hypotenuse_1: { style: 'curve', mag: 0.5, direction: 'down' },
          },
        ),
        // sixRatios: {
        //   content: [
        //     {
        //       lines: {
        //         content: [
        //           { content: ['oppOnHyp', 'equals1', 'sinTheta', { container: ['', 0.6] }, 'hypOnOpp', 'equals4', 'cscTheta'], justify: 'equals1' },
        //           { content: ['adjOnHyp', 'equals2', 'cosTheta', { container: ['', 0.59] }, 'hypOnAdj', 'equals5', 'secTheta'], justify: 'equals2' },
        //           {
        //             content: ['oppOnAdj', 'equals3', 'tanTheta', { container: ['', 0.75] }, 'adjOnOpp', 'equals6', 'cotTheta'],
        //             justify: 'equals3',
        //           },
        //         ],
        //         baselineSpace: 0.6,
        //         justify: 'element',
        //       },
        //     },
        //   ],
        //   translation: {
        //     hypotenuse: { style: 'linear' },
        //     hypotenuse_1: { style: 'linear' },
        //     duration: 2,
        //   },
        //   alignment: { xAlign: 'left' },
        // },
        // threeRatios: [
        //   {
        //     lines: {
        //       content: [
        //         ['oppOnHyp', 'equals1', 'constant_1'],
        //         ['adjOnHyp', 'equals2', 'constant_2'],
        //         ['oppOnAdj', 'equals3', 'constant_3'],
        //       ],
        //       baselineSpace: 0.6,
        //     },
        //   },
        // ],
        ratioValue: ['oppOnHyp', 'equals1', 'ratioValue'],
        ratioValueDef: ['oppOnHyp', 'equals1', 'ratioValueDef'],
        f: ['oppOnHyp', 'equals1', 'fTheta'],
        sinBracTheta: ['oppOnHyp', 'equals1', 'sinBracTheta'],
        sinTheta: ['oppOnHyp', 'equals1', 'sinTheta1'],
        sinThetaOne: ['oppOnOne', 'equals1', 'sinTheta1'],
        sinThetaOpp: ['opposite', 'equals1', 'sinTheta1'],
        sinOnly: [{ container: ['', 0.9] }, 'sinTheta1'],
        fOnly: [{ container: ['', 0.9] }, 'fTheta'],
        fLeft: ['fTheta'],
        sinInf: {
          content: [
            'sinTheta1', 'equals1', 'theta2', '_  –  _1',
            { frac: [{ sup: ['theta3', '3', 0.6] }, 'v2', '3!'] },
            '_  +  _1',
            { frac: [{ sup: ['theta5', '5', 0.6] }, 'v3', '5!'] },
            '_  –  _2',
            { frac: [{ sup: ['theta7', '7', 0.6] }, 'v4', '7!'] },
            '_  +  _2', 'dotDotDot',
          ],
          alignment: { xAlign: 'center' },
        },
        bowstring: 'bowstring',
        halfBowstring: ['half way there ', 'bowstring'],
        sinus: 'sinus',
        sine: 'sine',
        sineSin: ['sine', 'comma', 'sinText'],
        // statement: ['oppOnHyp', '_  is the same for all right triangles with angle ', 'theta',
        // ],
      },
    },
    mods: {
      scenarios: {
        upperLeft: { position: [-2, 0.4], scale: 1 },
        left: { position: [-1.8, 0.7], scale: 1.2 },
        default: { position: [0, 0], scale: 1.4 },
        table: { position: [-2.1, 1.1], scale: 1 },
        // top: { position: [-1.5, 0.7], scale: 1 },
        topRight: { position: [1.6, 0.95], scale: 1 },
        bottom: { position: [0, -1.3], scale: 1 },
        eqnTri: { position: [0.8, 0], scale: 1.2 },
        eqnTri1: { position: [0.5, 0.7], scale: 1.1 },
        right: { position: [1, 0], scale: 1.1 },
        eqnCirc: { position: [-2.5, 0], scale: 1.1 },
        eqnCircLeft: { position: [-2.6, 1.2], scale: 0.8 },
      },
    },
  });
  figure.add({
    name: 'eqn1',
    method: 'equation',
    options: {
      elements: {
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
        v3: { symbol: 'vinculum' },
        equals1: '  =  ',
        equals2: '  =  ',
        equals3: '  =  ',
        theta: { text: '\u03b8', color: color1 },
        theta1: { text: '\u03b8', color: color1 },
        theta2: { text: '\u03b8', color: color1 },
        theta3: { text: '\u03b8', color: color1 },
        theta4: { text: '\u03b8', color: color1 },
        dotDotDot: '...',
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
      },
      phrases: {
        oppOnHyp: { frac: ['opposite', 'v1', 'hypotenuse'] },
        adjOnHyp: { frac: ['adjacent', 'v2', 'hypotenuse_1'] },
        oppOnAdj: { frac: ['opposite_1', 'v3', 'adjacent_1'] },
        fTheta: ['f', { container: ['', 0.02] }, { brac: ['lb', 'theta', 'rb'] }],
      },
      forms: {
        fInf: {
          content: [
            'fTheta', 'equals1', 'theta1', '_  –  _1',
            { frac: [{ sup: ['theta2', '3'] }, 'v2', '3!'] },
            '_  +  _1',
            { frac: [{ sup: ['theta3', '5'] }, 'v3', '5!'] },
            '_  –  _2',
            { frac: [{ sup: ['theta4', '7'] }, 'v4_vinculum', '7!'] },
            '_  +  _2', 'dotDotDot',
          ],
          alignment: { xAlign: 'center' },
        },
      },
    },
    mods: {
      scenarios: {
        default: { position: [1, -0.2] },
      },
    },
  });
}
