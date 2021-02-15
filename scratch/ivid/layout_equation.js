/* eslint-disable camelcase */
/* global colSin, colRad, colCos, colCot, colTan, colSec, colCsc, colTheta, color1, figure */

function makeEquation() {
  const lines = (linesIn, translation = {}, alignment = {}) => {
    const contentLines = [];
    linesIn.forEach((line) => {
      const [content, justify, baselineSpace] = line;
      contentLines.push({
        content, justify, baselineSpace: baselineSpace || 0.5,
      });
    });
    return {
      content: {
        lines: {
          content: contentLines,
          baselineSpace: 0.5,
          justify: 'element',
        },
      },
      translation,
      alignment,
    };
  };
  const lines1 = (contentLines) => ({
    // content: {
      lines: {
        content: contentLines,
        baselineSpace: 0.5,
        justify: 'element',
      },
    // },
    // translation,
    // alignment,
  });
  const cont = (content, width = 0.6, xAlign = 'center') => ({
    container: { content, width, xAlign },
  });
  const frac = (numerator, symbol, denominator, nSpace = 0.03, dSpace = 0.03, width) => (cont({
    frac: {
      numerator, // : cont(numerator, width),
      symbol,
      denominator, // : cont(denominator, width),
      numeratorSpace: nSpace,
      denominatorSpace: dSpace,
      scale: 0.95,
    },
  }, width, 'right'));
  const space = { container: ['', 0.6] };
  figure.add({
    name: 'eqn',
    method: 'equation',
    options: {
      dimColor: [0.3, 0.3, 0.3, 1],
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
        equals7: '  =  ',
        equals8: '  =  ',
        equals9: '  =  ',
        equals10: '  =  ',
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
        lb2: { symbol: 'bracket', side: 'left' },
        rb2: { symbol: 'bracket', side: 'right' },
        lb3: { symbol: 'bracket', side: 'left' },
        rb3: { symbol: 'bracket', side: 'right' },
        lb4: { symbol: 'bracket', side: 'left' },
        rb4: { symbol: 'bracket', side: 'right' },
        lb5: { symbol: 'bracket', side: 'left' },
        rb5: { symbol: 'bracket', side: 'right' },
        lb6: { symbol: 'bracket', side: 'left' },
        rb6: { symbol: 'bracket', side: 'right' },
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
        theta13: { text: '\u03b8', color: colTheta },
        theta14: { text: '\u03b8', color: colTheta },
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
        hypotenuse_5: { color: colRad },
        hypotenuse_6: { color: colRad },
        adjacent: { color: colCos },
        adjacent_1: { color: colCos },
        adjacent_2: { color: colCos },
        adjacent_3: { color: colCos },
        _90min: { text: '90\u00b0 \u2212 ', color: colTheta },
        brace: { symbol: 'brace', side: 'top' },
        stk1: { symbol: 'strike', style: 'forward', lineWidth: 0.006 },
        stk2: { symbol: 'strike', style: 'forward', lineWidth: 0.006 },
        value1: '0.0000',
        value2: '0.0000',
        value3: '0.0000',
        value4: '0.0000',
        value5: '0.0000',
        value6: '0.0000',
      },
      phrases: {
        f1: { sub: ['f_1', '_1'] },
        f2: { sub: ['f_2', '_2'] },
        f3: { sub: ['f_3', '_3'] },
        f4: { sub: ['f_4', '_4'] },
        f5: { sub: ['f_5', '_5'] },
        f6: { sub: ['f_6', '_6'] },
        bTheta1: { brac: ['lb1', 'theta1', 'rb1'] },
        bTheta2: { brac: ['lb2', 'theta2', 'rb2'] },
        bTheta3: { brac: ['lb3', 'theta3', 'rb3'] },
        bTheta4: { brac: ['lb4', 'theta4', 'rb4'] },
        bTheta5: { brac: ['lb5', 'theta5', 'rb5'] },
        bTheta6: { brac: ['lb6', 'theta6', 'rb6'] },
        oppOnHyp: frac('opposite', 'v1', cont('hypotenuse', 0.6), 0.01, 0.03, 0.65),
        adjOnHyp: frac('adjacent', 'v2', 'hypotenuse_1', 0.01, 0.03, 0.65),
        oppOnAdj: frac('opposite_1', 'v3', 'adjacent_1', 0.01, 0.03, 0.65),
        hypOnOpp: frac('hypotenuse_3', 'v4', 'opposite_2', 0.01, 0.03, 0.65),
        hypOnAdj: frac('hypotenuse_4', 'v5', 'adjacent_2', 0.01, 0.03, 0.65),
        adjOnOpp: frac('adjacent_3', 'v6', 'opposite_3', 0.01, 0.03, 0.65),
        oppOnHypEq: ['oppOnHyp', 'equals1'],
        adjOnHypEq: ['adjOnHyp', 'equals2'],
        oppOnAdjEq: ['oppOnAdj', 'equals3'],
        hypOnAdjEq: ['hypOnAdj', 'equals4'],
        adjOnOppEq: ['adjOnOpp', 'equals5'],
        hypOnOppEq: ['hypOnOpp', 'equals6'],
        oppOnHypF: ['oppOnHypEq', 'f1', 'bTheta1'],
        adjOnHypF: ['adjOnHypEq', 'f2', 'bTheta2'],
        oppOnAdjF: ['oppOnAdjEq', 'f3', 'bTheta3'],
        hypOnAdjF: ['hypOnAdjEq', 'f4', 'bTheta4'],
        adjOnOppF: ['adjOnOppEq', 'f5', 'bTheta5'],
        hypOnOppF: ['hypOnOppEq', 'f6', 'bTheta6'],
        sinTheta1: ['sin_1', ' ', 'theta11'],
        sinTheta2: ['sin_2', ' ', 'theta12'],
        sinTheta3: ['sin_3', ' ', 'theta13'],
        sinTheta4: ['sin_4', ' ', 'theta14'],
        cosTheta1: ['cos', ' ', 'theta7'],
        cosTheta2: ['cos_2', ' ', 'theta8'],
        cosTheta3: ['cos_3', ' ', 'theta9'],
        cosTheta4: ['cos_4', ' ', 'theta10'],
        oppOnHypSin: ['oppOnHypEq', 'sinTheta1'],
        adjOnHypCos: ['adjOnHypEq', 'cosTheta1'],
        oppOnAdjSinOnCosHyp: ['oppOnAdjF', 'equals7', frac(['hypotenuse_5', 'times3', 'sinTheta2'], 'v7', ['hypotenuse_6', 'times4', 'cosTheta2'], 0.01, 0.03, 1.05)],
        oppOnAdjSinOnCosHypStk: ['oppOnAdjF', 'equals7', frac([{ strike: ['hypotenuse_5', 'stk1'] }, 'times3', 'sinTheta2'], 'v7', [{ strike: ['hypotenuse_6', 'stk2'] }, 'times4', 'cosTheta2'], 0.01, 0.03, 1.05)],
        oppOnAdjSinOnCos: ['oppOnAdjF', 'equals7', frac('sinTheta2', 'v7', 'cosTheta2', 0.05, 0.03, 0.34)],
        hypOnAdjHypOnCos: ['hypOnAdjF', 'equals8', frac('hypotenuse_5', 'v8', ['hypotenuse_6', 'times4', 'cosTheta3'], 0.01, 0.03, 1.05)],
        hypOnAdjOneOnCosStk: ['hypOnAdjF', 'equals8', frac({ sup: [{ strike: ['hypotenuse_5', 'stk1'] }, '_1_1', 0.9, [-0.1, 0.07], false] }, 'v8', [{ strike: ['hypotenuse_6', 'stk2'] }, 'times4', 'cosTheta3'], 0.01, 0.03, 1.05)],
        hypOnAdjOneOnCos: ['hypOnAdjF', 'equals8', frac('_1_1', 'v8', 'cosTheta3', 0.03, 0.03, 0.34)],
        adjOnOppCosOnSin: ['adjOnOppF', 'equals9', frac('cosTheta4', 'v9', 'sinTheta3', 0.05, 0.05, 0.34)],
        hypOnOppOneOnSin: ['hypOnOppF', 'equals10', frac('_1_2', 'v10', 'sinTheta4', 0.05, 0.05, 0.34)],
        oppHypSin: [cont('opposite', 0.65, 'right'), 'equals1', 'hypotenuse', 'times1', 'sinTheta1'],
        adjHypCos: [cont('adjacent', 0.65, 'right'), 'equals2', 'hypotenuse_1', 'times2', 'cosTheta1'],
        oppOnOne: { frac: ['opposite', 'v1', cont('_1_rad')] },
        // oppOnHyp: { frac: ['opposite', 'v1', cont('hypotenuse')] },
        fTheta: ['function', { container: ['', 0.02] }, { brac: ['lb', 'theta1', 'rb'] }],
        sinBracTheta: ['sin_1', { brac: ['lb', 'theta1', 'rb'] }],
        // sinTheta: ['sin', ' ', 'theta'],
        cos: ['co', 's'],
        cosineTheta: ['cos', 'ine', ' ', 'theta7'],
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
            content: ['_90min', 'theta8'],
            comment: 'complementary angle',
            inSize: false,
            commentSpace: 0.1,
            contentSpace: 0.1,
            symbol: 'brace',
          },
        },
        sinCompComment: ['sin_2', { brac: ['lb1', 'compComment', 'rb1'] }],
        complementarySineTheta: ['co', 'mplementary', ' ', 's', 'ine', ' ', 'theta7'],
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
        twoSideRatios: lines([[['oppOnHyp']], [['adjOnHyp']]]),
        sixSideRatios: lines([
          [['oppOnHyp']], [['adjOnHyp']], [['oppOnAdj']], [['hypOnAdj']], [['adjOnOpp']], [['hypOnOpp']],
        ]),
        sixSideRatiosWithValue: lines([
          [['oppOnHypEq', 'value1']], [['adjOnHypEq', 'value2']], [['oppOnAdjEq', 'value3']], [['hypOnAdjEq', 'value4']], [['adjOnOppEq', 'value5']], [['hypOnOppEq', 'value6']],
        ]),
        sixSideRatiosFunction: lines1([
          ['oppOnHypF'], ['adjOnHypF'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
        ]),
        /*
        ..######..####.##....##
        .##....##..##..###...##
        .##........##..####..##
        ..######...##..##.##.##
        .......##..##..##..####
        .##....##..##..##...###
        ..######..####.##....##
        */
        sixRatiosSinHighlight: {
          content: [
            lines1([[''], ['adjOnHypF'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
            ]),
            { offset: ['oppOnHypF', [0.5, 0]] },
          ],
          translation: { hypotenuse: { style: 'linear' } },
        },
        sixSROppHyp1: [
          lines1([[''], ['adjOnHypF'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
          ]),
          { offset: [[frac('opposite', 'v1', { bottomStrike: [cont('hypotenuse', 0.6), 'stk1', '_1_rad', false, 0, 0.7, 0] }, 0.01, 0.03, 0.65), 'equals1', 'f1', 'bTheta1'], [0.5, 0]] },
        ],
        sixSROppF: [
          lines1([[''], ['adjOnHypF'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
          { offset: [[cont('opposite', 0.65, 'right'), 'equals1', 'f1', 'bTheta1'], [0.5, 0]] },
        ],
        sixSRSin: lines1([
          ['oppOnHypSin'], ['adjOnHypF'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
        ]),
        /*
        ..######...#######...######.
        .##....##.##.....##.##....##
        .##.......##.....##.##......
        .##.......##.....##..######.
        .##.......##.....##.......##
        .##....##.##.....##.##....##
        ..######...#######...######.
        */
        sixSRCosHighlight: {
          content: [
            lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
            ]),
            { scale: [{ offset: ['adjOnHypF', [1.5, -0.3]] }, 1.1] },
          ],
          translation: { hypotenuse_1: { style: 'linear' } },
        },
        sixSRCosComp: {
          content: [
            lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
            ]),
            { scale: [{ offset: [['adjOnHypEq', 'sinCompComment'], [1.5, -0.3]] }, 1.1] },
          ],
        },
        sixSRCosComplementarySine: {
          content: [
            lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
            ]),
            { scale: [{ offset: [['adjOnHypEq', 'sinCompComment'], [1.5, -0.3]] }, 1.1] },
            { scale: [{ offset: [['equals7', 'complementarySineTheta'], [2.15, -0.6]] }, 1.1] },
          ],
        },
        sixSRCosCosine: {
          content: [
            lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
            ]),
            { scale: [{ offset: [['adjOnHypEq', 'sinCompComment'], [1.5, -0.3]] }, 1.1] },
            { scale: [{ offset: [['equals7', 'cosineTheta'], [2.15, -0.6]] }, 1.1] },
          ],
        },
        sixSRCosCos: {
          content: [
            lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
            ]),
            { scale: [{ offset: [['adjOnHypEq', 'sinCompComment'], [1.5, -0.3]] }, 1.1] },
            { scale: [{ offset: [['equals7', 'cosTheta1'], [2.15, -0.6]] }, 1.1] },
          ],
        },
        sixSRCosThetaHighlight: {
          content: [
            lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
            ]),
            { scale: [{ offset: ['adjOnHypCos', [1.5, -0.3]] }, 1.1] },
          ],
        },
        sixSRCos: {
          content: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
          translation: { hypotenuse_1: { style: 'linear' } },
        },
        /*
        .########.####.##.......##......
        .##........##..##.......##......
        .##........##..##.......##......
        .######....##..##.......##......
        .##........##..##.......##......
        .##........##..##.......##......
        .##.......####.########.########
        */
        sixSRCosRearrange: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
        sixSRSinOnCosHyp: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCosHyp'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
        sixSRSinOnCosHypStk: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCosHypStk'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
        sixSRSinOnCos: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
        sixSRHypOnCos: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjHypOnCos'], ['adjOnOppF'], ['hypOnOppF']]),
        sixSROneOnCosStk: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjOneOnCosStk'], ['adjOnOppF'], ['hypOnOppF']]),
        sixSROneOnCos: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjOneOnCos'], ['adjOnOppF'], ['hypOnOppF']]),
        sixSRCosOnSin: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjOneOnCos'], ['adjOnOppCosOnSin'], ['hypOnOppF']]),
        sixSROneOnSin: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjOneOnCos'], ['adjOnOppCosOnSin'], ['hypOnOppOneOnSin']]),
        sixSRR: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjOneOnCos'], ['adjOnOppCosOnSin'], ['hypOnOppOneOnSin']]),
        /*
        .########....###....##....##
        ....##......##.##...###...##
        ....##.....##...##..####..##
        ....##....##.....##.##.##.##
        ....##....#########.##..####
        ....##....##.....##.##...###
        ....##....##.....##.##....##
        */
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
                'v7',
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
                'v7',
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
            [['oppOnHyp', 'equals1', 'sinTheta1', space, 'hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals1'],
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
        sixRatiosTan: lines(
          [
            [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
            [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
            [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
            [['hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals5'],
            [['oppOnAdj', 'equals3', 'sinOnCos', 'equals7', 'tanTheta'], 'equals3'],
            [['adjOnOpp', 'equals6', 'cosOnSin'], 'equals6'],
          ],
        ),
        sixRatiosSec: lines(
          [
            [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
            [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
            [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
            [['hypOnAdj', 'equals5', 'oneOnCosTheta', 'equals8', 'secTheta'], 'equals5'],
            [['oppOnAdj', 'equals3', 'sinOnCos', 'equals7', 'tanTheta'], 'equals3'],
            [['adjOnOpp', 'equals6', 'cosOnSin'], 'equals6'],
          ],
        ),
        sixRatiosCot: lines(
          [
            [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
            [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
            [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
            [['hypOnAdj', 'equals5', 'oneOnCosTheta', 'equals8', 'secTheta'], 'equals5'],
            [['oppOnAdj', 'equals3', 'sinOnCos', 'equals7', 'tanTheta'], 'equals3'],
            [['adjOnOpp', 'equals6', 'cosOnSin', 'equals9', 'cotTheta'], 'equals6'],
          ],
        ),
        sixRatiosCsc: lines(
          [
            [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
            [['hypOnOpp', 'equals4', 'oneOnSinTheta', 'equals10', 'cscTheta'], 'equals4'],
            [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
            [['hypOnAdj', 'equals5', 'oneOnCosTheta', 'equals8', 'secTheta'], 'equals5'],
            [['oppOnAdj', 'equals3', 'sinOnCos', 'equals7', 'tanTheta'], 'equals3'],
            [['adjOnOpp', 'equals6', 'cosOnSin', 'equals9', 'cotTheta'], 'equals6'],
          ],
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
        eqnTri: { position: [-2.4, 1.2], scale: 1 },
        eqnTri1: { position: [0.5, 0.7], scale: 1.1 },
        right: { position: [1, 0], scale: 1.1 },
        eqnCirc: { position: [-2.5, 0], scale: 1.1 },
        eqnCircLeft: { position: [-2.7, 1.2], scale: 0.8 },
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
        _1_rad: { color: colRad },
        tan_1: { color: colTan, style: 'normal' },
        tan_2: { color: colTan, style: 'normal' },
        cot_1: { color: colCot, style: 'normal' },
        cot_2: { color: colCot, style: 'normal' },
        csc_1: { color: colCsc, style: 'normal' },
        csc_2: { color: colCsc, style: 'normal' },
        sec_1: { color: colSec, style: 'normal' },
        sec_2: { color: colSec, style: 'normal' },
        // opposite_1: { color: colSin },
        // adjacent_1: { color: colCos },
        // hypotenuse_1: { color: colRad },
      },
      phrases: {
        oppOnHyp: { frac: ['opposite', 'v1', 'hypotenuse_1'] },
        adjOnHyp: { frac: ['adjacent', 'v2', 'hypotenuse_1'] },
        hypOnAdj: { frac: ['hypotenuse_1', 'v2', 'adjacent_1'] },
        oppOnAdj: { frac: ['opposite_1', 'v3', 'adjacent_1'] },
        adjOnOpp: { frac: ['adjacent_1', 'v3', 'opposite_1'] },
        hypOnOpp: { frac: ['hypotenuse_1', 'v2', 'opposite_1'] },
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
        oppOnAdj: 'oppOnAdj',
        hypOnAdj: 'hypOnAdj',
        adjOnHyp: 'adjOnHyp',
        hypOnOpp: 'hypOnOpp',
        adjOnOpp: 'adjOnOpp',
        secOn1: ['hypOnAdj', 'equals1', { frac: ['sec_1', 'v1', '_1_rad'] }],
        sec: ['hypOnAdj', 'equals1', { frac: ['sec_1', 'v1', '_1_rad'] }, 'equals2', 'sec_2'],
        tanOn1: ['oppOnAdj', 'equals1', { frac: ['tan_1', 'v1', '_1_rad'] }],
        tan: ['oppOnAdj', 'equals1', { frac: ['tan_1', 'v1', '_1_rad'] }, 'equals2', 'tan_2'],
        cotOn1: ['adjOnOpp', 'equals1', { frac: ['cot_1', 'v1', '_1_rad'] }],
        cot: ['adjOnOpp', 'equals1', { frac: ['cot_1', 'v1', '_1_rad'] }, 'equals2', 'cot_2'],
        cscOn1: ['hypOnOpp', 'equals1', { frac: ['csc_1', 'v1', '_1_rad'] }],
        csc: ['hypOnOpp', 'equals1', { frac: ['csc_1', 'v1', '_1_rad'] }, 'equals2', 'csc_2'],
      },
    },
    mods: {
      scenarios: {
        default: { position: [1, -0.2] },
        eqn1Right: { position: [0.4, 0.6] },
        eqn1MoreRight: { position: [0.8, 0.6] },
      },
    },
  });

  const addFn = (name, elements, centerOn, xAlign, yAlign = 'middle') => {
    figure.fnMap.global.add(name, () => {
      figure.getElement('eqn').pulse({
        elements, centerOn, xAlign, yAlign, scale: 2.5
      });
    });
  };
  addFn('eqnPulseTan', ['tan', 'theta9'], 'tan', 'left', 'middle');
  addFn('eqnPulseCot', ['cot', 'theta12'], 'cot', 'left', 'middle');
  addFn('eqnPulseSec', ['sec', 'theta11'], 'sec', 'left', 'middle');
  addFn('eqnPulseCsc', ['csc', 'theta10'], 'csc', 'left', 'middle');
  addFn('eqnPulseF1', ['f_1', '_1', 'lb1', 'theta1', 'rb1'], 'f_1', 'left');
  addFn('eqnPulseF2', ['f_2', '_2', 'lb2', 'theta2', 'rb2'], 'f_2', 'left');
  addFn('eqnPulseF3', ['f_3', '_3', 'lb3', 'theta3', 'rb3'], 'f_3', 'left');
  addFn('eqnPulseF4', ['f_4', '_4', 'lb4', 'theta4', 'rb4'], 'f_4', 'left');
  addFn('eqnPulseF5', ['f_5', '_5', 'lb5', 'theta5', 'rb5'], 'f_5', 'left');
  addFn('eqnPulseF6', ['f_6', '_6', 'lb6', 'theta6', 'rb6'], 'f_6', 'left');
  addFn('eqnPulseSin', ['sin_1', 'theta1'], 'sin_1', 'left', 'middle');
}
