/* eslint-disable camelcase */
/* global colSin, colRad, colCos, colCot, colTan, colSec, colCsc, colTheta */
/* global color1, figure, colOpp, colHyp, colAdj */

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
  const lines1 = contentLines => ({
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
      dimColor: [0.7, 0.7, 0.7, 1],
      elements: {
      },
      phrases: {
      },
      formDefaults: {
        translation: {
        },
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

  const lin = (content, baselineSpace = 0.5) => ({
    lines: { content, baselineSpace, justify: 'left' },
  });
  const s = (content, strikeNum) => ({
    strike: { content, symbol: `s${strikeNum}`, inSize: false },
  });
  const b = (content, boxNum) => ({
    box: {
      content, symbol: `b${boxNum}`, inSize: false, space: 0.05,
    },
  });
  const w1 = 0.33;

  const addFn = (name, elements, centerOn, xAlign, yAlign = 'middle') => {
    figure.fnMap.global.add(name, () => {
      figure.getElement('eqn').pulse({
        elements, centerOn, xAlign, yAlign, scale: 2.5,
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


  const t = (content, boxNum, rightSpace = 0.3) => ({
    tBox: {
      content, symbol: `t${boxNum}`, space: 0.25, rightSpace,
    },
  });
  const brac = (content, index) => ({
    brac: [`lb${index}`, content, `rb${index}`],
  });
  figure.add({
    name: 'eqn3',
    method: 'equation',
    options: {
      elements: {
        eq1: '=',
        eq2: '=',
        eq3: '=',
        eq4: '=',
        eq5: '=',
        eq6: '=',
        eq7: '=',
        eq8: '=',
        eq9: '=',
        eq10: '=',
        eq11: '=',
        eq12: '=',
        eq13: '=',
        eq14: '=',
        eq15: '=',
        eq16: '=',
        eq17: '=',
        eq18: '=',
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
        v11: { symbol: 'vinculum' },
        v12: { symbol: 'vinculum' },
        sin_0: { style: 'normal' },
        sin_1: { style: 'normal', color: colSin },
        sin_2: { style: 'normal', color: colSin },
        sin_3: { style: 'normal', color: colSin },
        sin_4: { style: 'normal', color: colSin },
        cos_0: { style: 'normal' },
        cos_1: { style: 'normal', color: colCos },
        cos_2: { style: 'normal', color: colCos },
        cos_3: { style: 'normal', color: colCos },
        cos_4: { style: 'normal', color: colCos },
        tan_0: { style: 'normal' },
        tan_1: { style: 'normal', color: colTan },
        tan_2: { style: 'normal', color: colTan },
        cot_0: { style: 'normal' },
        cot_1: { style: 'normal', color: colCot },
        cot_2: { style: 'normal', color: colCot },
        sec_0: { style: 'normal' },
        sec_1: { style: 'normal', color: colSec },
        sec_2: { style: 'normal', color: colSec },
        csc_0: { style: 'normal' },
        csc_1: { style: 'normal', color: colCsc },
        csc_2: { style: 'normal', color: colCsc },
        opp_1: { text: 'opposite', color: colOpp, size: 0.2 },
        opp_2: { text: 'opposite', color: colOpp, size: 0.2 },
        opp_3: { text: 'opposite', color: colOpp, size: 0.2 },
        opp_4: { text: 'opposite', color: colOpp, size: 0.2 },
        adj_1: { text: 'adjacent', color: colAdj, size: 0.2 },
        adj_2: { text: 'adjacent', color: colAdj, size: 0.2 },
        adj_3: { text: 'adjacent', color: colAdj, size: 0.2 },
        adj_4: { text: 'adjacent', color: colAdj, size: 0.2 },
        hyp_1: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_2: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_3: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_4: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_5: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_6: { text: 'hypotenuse', color: colHyp, size: 0.2 },
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
        thetaVal1: { text: '0\u00b0', color: colTheta },
        thetaVal2: { text: '0\u00b0', color: colTheta },
        thetaVal3: { text: '0\u00b0', color: colTheta },
        thetaVal4: { text: '0\u00b0', color: colTheta },
        thetaVal5: { text: '0\u00b0', color: colTheta },
        thetaVal6: { text: '0\u00b0', color: colTheta },
        thetaVal7: { text: '0\u00b0', color: colTheta },
        thetaVal8: { text: '0\u00b0', color: colTheta },
        thetaVal9: { text: '0\u00b0', color: colTheta },
        thetaVal10: { text: '0\u00b0', color: colTheta },
        thetaVal11: { text: '0\u00b0', color: colTheta },
        s1: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s2: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        val1: { text: '0.0000', color: colSin },
        val2: { text: '0.0000', color: colCos },
        val3: { text: '0.0000', color: colTan },
        val4: { text: '0.0000', color: colCsc },
        val5: { text: '0.0000', color: colSec },
        val6: { text: '0.0000', color: colCot },
        val7: { text: '0.0000' },
        val8: { text: '0.0000' },
        val9: { text: '0.0000' },
        val10: { text: '0.0000' },
        val11: { text: '0.0000' },
        val12: { text: '0.0000' },
        times1: ' \u00d7 ',
        times2: ' \u00d7 ',
        times3: ' \u00d7 ',
        times4: ' \u00d7 ',
        t1: { symbol: 'tBox' },
        t2: { symbol: 'tBox' },
        t3: { symbol: 'tBox' },
        t4: { symbol: 'tBox' },
        t5: { symbol: 'tBox' },
        t6: { symbol: 'tBox' },
        lb1: { symbol: 'bracket', side: 'left' },
        lb2: { symbol: 'bracket', side: 'left' },
        lb3: { symbol: 'bracket', side: 'left' },
        lb4: { symbol: 'bracket', side: 'left' },
        lb5: { symbol: 'bracket', side: 'left' },
        lb6: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        rb2: { symbol: 'bracket', side: 'right' },
        rb3: { symbol: 'bracket', side: 'right' },
        rb4: { symbol: 'bracket', side: 'right' },
        rb5: { symbol: 'bracket', side: 'right' },
        rb6: { symbol: 'bracket', side: 'right' },
        _90_1: { color: colTheta },
        _90_2: { color: colTheta },
        _90_3: { color: colTheta },
        _90_4: { color: colTheta },
        _90_5: { color: colTheta },
        _90_6: { color: colTheta },
        deg1: { text: '\u00b0', color: colTheta },
        deg2: { text: '\u00b0', color: colTheta },
        deg3: { text: '\u00b0', color: colTheta },
        deg4: { text: '\u00b0', color: colTheta },
        deg5: { text: '\u00b0', color: colTheta },
        deg6: { text: '\u00b0', color: colTheta },
        min1: { text: '\u2212', col: colTheta },
        min2: { text: '\u2212', col: colTheta },
        min3: { text: '\u2212', col: colTheta },
        min4: { text: '\u2212', col: colTheta },
        min5: { text: '\u2212', col: colTheta },
        min6: { text: '\u2212', col: colTheta },
      },
      phrases: {
        oppHyp: frac('opp_1', 'v1', 'hyp_1', 0.01, 0.03, 0.65),
        adjHyp: frac('adj_1', 'v2', 'hyp_2', 0.01, 0.03, 0.65),
        oppAdj: frac('opp_2', 'v3', 'adj_2', 0.01, 0.03, 0.65),
        hypOpp: frac('hyp_3', 'v4', 'opp_3', 0.01, 0.03, 0.65),
        hypAdj: frac('hyp_4', 'v5', 'adj_3', 0.01, 0.03, 0.65),
        adjOpp: frac('adj_4', 'v6', 'opp_4', 0.01, 0.03, 0.65),
        sinTheta: cont(['sin_1', ' ', 'theta1'], w1),
        cosTheta: cont(['cos_1', ' ', 'theta2'], w1),
        tanTheta: cont(['tan_1', ' ', 'theta3'], w1),
        cscTheta: cont(['csc_1', ' ', 'theta4'], w1),
        secTheta: cont(['sec_1', ' ', 'theta5'], w1),
        cotTheta: cont(['cot_1', ' ', 'theta6'], w1),
        sinThetaG: cont(['sin_0', ' ', 'theta1'], w1),
        cosThetaG: cont(['cos_0', ' ', 'theta2'], w1),
        tanThetaG: cont(['tan_0', ' ', 'theta3'], w1),
        cscThetaG: cont(['csc_0', ' ', 'theta4'], w1),
        secThetaG: cont(['sec_0', ' ', 'theta5'], w1),
        cotThetaG: cont(['cot_0', ' ', 'theta6'], w1),
        sinThetaT: cont(t(['sin_1', ' ', 'theta1'], 1, 1.5), w1),
        cosThetaT: cont(t(['cos_1', ' ', 'theta2'], 2, 1.5), w1),
        tanThetaT: cont(t(['tan_1', ' ', 'theta3'], 3, 2.2), w1),
        cscThetaT: cont(t(['csc_1', ' ', 'theta4'], 4, 2.2), w1),
        secThetaT: cont(t(['sec_1', ' ', 'theta5'], 5, 2.2), w1),
        cotThetaT: cont(t(['cot_1', ' ', 'theta6'], 6, 2.2), w1),
        sinHyp: ['hyp_1', 'times1', 'sinTheta'],
        cosHyp: ['hyp_2', 'times2', 'cosTheta'],
        sinTheta1: ['sin_2', ' ', 'theta7'],
        sinTheta2: ['sin_3', ' ', 'theta8'],
        cosTheta1: ['cos_2', ' ', 'theta9'],
        cosTheta2: ['cos_3', ' ', 'theta10'],
        tanTheta1: ['tan_2', ' ', 'theta11'],
        cotTheta1: ['cot_2', ' ', 'theta7'],
        cscTheta1: ['csc_2', ' ', 'theta10'],
        secTheta1: ['sec_2', ' ', 'theta12'],
        sinComp: ['sin_2', ' ', brac(['_90_1', 'deg1', 'min1', 'theta7'], 1)],
        cosComp: ['cos_2', ' ', brac(['_90_2', 'deg2', 'min2', 'theta8'], 2)],
        tanComp: ['tan_2', ' ', brac(['_90_3', 'deg3', 'min3', 'theta9'], 3)],
        cscComp: ['csc_2', ' ', brac(['_90_4', 'deg4', 'min4', 'theta10'], 4)],
        secComp: ['sec_2', ' ', brac(['_90_5', 'deg5', 'min5', 'theta11'], 5)],
        cotComp: ['cot_2', ' ', brac(['_90_6', 'deg6', 'min6', 'theta12'], 6)],
        sinHcosH: {
          frac: [
            ['hyp_5', 'times3', 'sinTheta1'], 'v7', ['hyp_6', 'times4', 'cosTheta1'],
          ],
        },
        sinHcosHStrk: {
          frac: [
            [s('hyp_5', 1), 'times3', 'sinTheta1'], 'v7', [s('hyp_6', 2), 'times4', 'cosTheta1'],
          ],
        },
        sinOne: cont({ frac: ['sinTheta', 'v7', '_1_1'] }, w1),
        cosOne: cont({ frac: ['cosTheta', 'v7', '_1_1'] }, w1),
        tanOne: cont({ frac: ['tanTheta', 'v7', '_1_1'] }, w1),
        cscOne: cont({ frac: ['cscTheta', 'v7', '_1_1'] }, w1),
        secOne: cont({ frac: ['secTheta', 'v7', '_1_1'] }, w1),
        cotOne: cont({ frac: ['cotTheta', 'v7', '_1_1'] }, w1),
        sinCos: cont({ frac: ['sinTheta1', 'v7', 'cosTheta1'] }, w1),
        oneTan: cont({ frac: ['_1_1', 'v8', 'tanTheta1'] }, w1),
        oneSin: cont({ frac: ['_1_2', 'v9', 'sinTheta2'] }, w1),
        oneCos: cont({ frac: ['_1_3', 'v10', 'cosTheta2'] }, w1),
        oneCot: cont({ frac: ['_1_4', 'v11', 'cotTheta1'] }, w1),
        oneCsc: cont({ frac: ['_1_5', 'v12', 'cscTheta1'] }, w1),
        oneSec: cont({ frac: ['_1_6', 'v7', 'secTheta1'] }, w1),
        sin: cont('sin_1', w1),
        cos: cont('cos_1', w1),
        tan: cont('tan_2', w1),
        sec: cont('sec_4', w1),
        cot: cont('cot_4', w1),
        csc: cont('csc_3', w1),
        f1: [{ sub: ['f_1', '_1'] }, { brac: ['lb1', 'theta1', 'rb1'] }],
        f2: [{ sub: ['f_2', '_2'] }, { brac: ['lb2', 'theta2', 'rb2'] }],
        f3: [{ sub: ['f_3', '_3'] }, { brac: ['lb3', 'theta3', 'rb3'] }],
        f4: [{ sub: ['f_4', '_4'] }, { brac: ['lb4', 'theta4', 'rb4'] }],
        f5: [{ sub: ['f_5', '_5'] }, { brac: ['lb5', 'theta5', 'rb5'] }],
        f6: [{ sub: ['f_6', '_6'] }, { brac: ['lb6', 'theta6', 'rb6'] }],

        c1: lin(['oppHyp', 'adjHyp', 'oppAdj', 'hypOpp', 'hypAdj', 'adjOpp']),
        c1_rearrange: lin([cont('opp_1', 0.65, 'right'), cont('adj_1', 0.65, 'right'), 'oppAdj', 'hypOpp', 'hypAdj', 'adjOpp']),

        c2_0: cont(lin(['', '', 'eq3', '', '', '']), 0.3),
        c2_1: cont(lin(['', '', 'eq3', '', 'eq5', '']), 0.3),
        c2_2: cont(lin(['', '', 'eq3', '', 'eq5', 'eq6']), 0.3),
        c2_3: cont(lin(['', '', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        c2_4: cont(lin(['eq1', '', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        c2_5: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        c2: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),

        c3_00: lin(['', '', 'tanOne', '', '', '']),
        c3_01: lin(['', '', 'tanTheta', '', '', '']),
        c3_10: lin(['', '', 'tanTheta', '', 'secOne', '']),
        c3_11: lin(['', '', 'tanTheta', '', 'secTheta', '']),
        c3_20: lin(['', '', 'tanTheta', '', 'secTheta', 'cotOne']),
        c3_21: lin(['', '', 'tanTheta', '', 'secTheta', 'cotTheta']),
        c3_30: lin(['', '', 'tanTheta', 'cscOne', 'secTheta', 'cotTheta']),
        c3_31: lin(['', '', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_40: lin(['sinOne', '', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_41: lin(['sinTheta', '', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_50: lin(['sinTheta', 'cosOne', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_51: lin(['sinTheta', 'cosTheta', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_r1: lin(['sinHyp', 'cosHyp', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_r2: lin(['sinHyp', 'cosHyp', ['tanTheta', cont('eq7', 0.3), 'sinHcosH'], 'cscTheta', 'secTheta', 'cotTheta']),
        c3_r3: lin(['sinHyp', 'cosHyp', ['tanTheta', cont('eq7', 0.3), 'sinHcosHStrk'], 'cscTheta', 'secTheta', 'cotTheta']),
        c3_r4: lin(['sinHyp', 'cosHyp', ['tanTheta', cont('eq7', 0.3), 'sinCos'], 'cscTheta', 'secTheta', 'cotTheta']),
        c3_r5: lin(['sinTheta', 'cosTheta', ['tanTheta', cont('eq7', 0.3), 'sinCos'], 'cscTheta', 'secTheta', 'cotTheta']),
        c3t: lin(['sinThetaT', 'cosThetaT', 'tanThetaT', 'cscThetaT', 'secThetaT', 'cotThetaT']),

        c4_0: cont(lin(['', '', 'eq7', '', '', '']), 0.3),
        c4_1: cont(lin(['', '', 'eq7', 'eq8', '', '']), 0.3),
        c4_2: cont(lin(['', '', 'eq7', 'eq8', 'eq9', '']), 0.3),
        c4_3: cont(lin(['', '', 'eq7', 'eq8', 'eq9', 'eq10']), 0.3),
        c4: cont(lin(['eq11', 'eq12', 'eq7', 'eq8', 'eq9', 'eq10']), 0.3),

        c5_0: lin(['', '', 'sinCos']),
        c5_1: lin(['', '', 'sinCos', 'oneSin']),
        c5_2: lin(['', '', 'sinCos', 'oneSin', 'oneCos']),
        c5_3: lin(['', '', 'sinCos', 'oneSin', 'oneCos', 'oneTan']),
        c5_v: lin(['val1', 'val2', 'sinCos', 'oneSin', 'oneCos', 'oneTan']),

        c6: cont(lin(['', '', 'eq13', 'eq14', 'eq15', 'eq16']), 0.3),
        c7: cont(lin(['', '', 'val3', 'val4', 'val5', 'val6']), 0.3),

        r1: ['oppHyp', cont('eq1', 0.3), 'constant_1'],
        r2: [lin(['oppHyp', 'adjHyp'], 0.5), cont(lin(['eq1', 'eq2'], 0.5), 0.3), lin(['constant_1', 'constant_2'], 0.5)],
        rc: [lin(['constant_1', 'constant_2', 'constant_3', 'constant_4', 'constant_5', 'constant_6'], 0.5)],
        rVals: lin(['val7', 'val8', 'val9', 'val10', 'val11', 'val12']),
        r6: lin(['oppHyp', 'adjHyp', 'oppAdj', 'hypOpp', 'hypAdj', 'adjOpp'], 0.5),
        re: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6'], 0.5), 0.3),
        rFuncs: lin(['f1', 'f2', 'f3', 'f4', 'f5', 'f6']),
        rNames: lin(['sinThetaG', 'cosThetaG', 'tanThetaG', 'cscThetaG', 'secThetaG', 'cotThetaG']),

        comp: lin(['cosComp', 'sinComp', 'cotComp', 'tanComp', 'cscComp', 'secComp']),
        compHalf: lin(['', 'sinComp', '', 'tanComp', '', 'secComp']),
        compHalf2: lin(['cosComp', '', 'cotComp', '', 'cscComp', '']),
        compR: lin(['oppHyp', 'adjHyp', 'oppAdj', 'adjOpp', 'hypAdj', 'hypOpp']),
        compE: cont(lin(['eq1', 'eq2', 'eq3', 'eq6', 'eq5', 'eq4']), 0.3),
        compN: lin(['sinTheta', 'cosTheta', 'tanTheta', 'cotTheta', 'secTheta', 'cscTheta']),
        comp4EHalf: cont(lin(['', 'eq12', '', 'eq8', '', 'eq10']), 0.3),
        comp4EHalf2: cont(lin(['eq11', '', 'eq7', '', 'eq9', '']), 0.3),
        comp4: cont(lin(['eq11', 'eq12', 'eq7', 'eq8', 'eq9', 'eq10']), 0.3),

        recR: lin(['oppHyp', 'hypOpp', 'adjHyp', 'hypAdj', 'oppAdj', 'adjOpp']),
        recE: cont(lin(['eq1', 'eq4', 'eq2', 'eq5', 'eq3', 'eq6']), 0.3),
        recN: lin(['sinTheta', 'cscTheta', 'cosTheta', 'secTheta', 'tanTheta', 'cotTheta']),
        rec4: cont(lin(['eq11', 'eq12', 'eq7', 'eq8', 'eq9', 'eq10']), 0.3),
        rec4Half: cont(lin(['', 'eq12', '', 'eq8', '', 'eq10']), 0.3),
        recHalf: lin(['', 'oneSin', '', 'oneCos', '', 'oneTan']),
        rec: lin(['oneCsc', 'oneSin', 'oneSec', 'oneCos', 'oneCot', 'oneTan']),
      },
      formDefaults: {
        translation: {
          hyp_1: { style: 'curve', direction: 'down', mag: 0.5 },
          hyp_2: { style: 'curve', direction: 'down', mag: 0.5 },
        },
      },
      forms: {
        r1Constant: 'r1',
        r2Constant: 'r2',
        rConstant: ['r6', 're', 'rc'],
        rValues: ['c1', 'c2', 'rVals'],
        rFunctions: ['c1', 'c2', 'rFuncs'],
        rNames: ['c1', 'c2', 'rNames'],
        0: ['c1'],
        1: ['c1', 'c2_0', 'c3_00'],
        2: ['c1', 'c2_0', 'c3_01'],
        3: ['c1', 'c2_1', 'c3_10'],
        4: ['c1', 'c2_1', 'c3_11'],
        5: ['c1', 'c2_2', 'c3_20'],
        6: ['c1', 'c2_2', 'c3_21'],
        7: ['c1', 'c2_3', 'c3_30'],
        8: ['c1', 'c2_3', 'c3_31'],
        9: ['c1', 'c2_4', 'c3_40'],
        10: ['c1', 'c2_4', 'c3_41'],
        11: ['c1', 'c2_5', 'c3_50'],
        12: ['c1', 'c2_5', 'c3_51'],
        compRearrange: ['compR', 'compE', 'compN'],
        compHalf: ['compR', 'compE', 'compN', 'comp4EHalf', 'compHalf'],
        compHalf2: ['compR', 'compE', 'compN', 'comp4EHalf2', 'compHalf2'],
        comp: ['compR', 'compE', 'compN', 'comp4', 'comp'],
        recRearrange: {
          content: ['recR', 'recE', 'recN'],
          translation: { hyp_2: { style: 'linear' } },
        },
        recHalf: ['recR', 'recE', 'recN', 'rec4Half', 'recHalf'],
        rec: ['recR', 'recE', 'recN', 'rec4', 'rec'],
        tanRearrange: {
          content: ['c1', 'c2_5', 'c3_51'],
          translation: { hyp_2: { style: 'linear' } },
        },
        13: ['c1_rearrange', 'c2_5', 'c3_r1'],
        14: ['c1_rearrange', 'c2_5', 'c3_r2'],
        15: ['c1_rearrange', 'c2_5', 'c3_r3'],
        16: ['c1_rearrange', 'c2_5', 'c3_r4'],
        17: ['c1', 'c2_5', 'c3_51', 'c4_0', 'c5_0'],
        18: ['c1', 'c2_5', 'c3_51', 'c4_1', 'c5_1'],
        19: ['c1', 'c2_5', 'c3_51', 'c4_2', 'c5_2'],
        20: ['c1', 'c2_5', 'c3_51', 'c4_3', 'c5_3'],
        values: ['c3t', 'c4', 'c5_v', 'c6', 'c7'],
        // comp: ['compR', 'compE', 'compN', 'c4', 'comp'],
      },
      position: [-2.8, 1.2],
    },
    mods: {
      scenarios: {
        eqnTri: { position: [-2.3, 1.2] },
        eqnCirc: { position: [-2.8, 1.2] },
      },
    },
  });
  const eqn3 = figure.getElement('eqn3');
  const circ = figure.getElement('circ');
  const [sin, cos, tan] = circ.getElements(['sin', 'cosAlt', 'tanAlt']);
  const [csc, sec, cot] = circ.getElements(['cscAlt', 'secAlt', 'cotAlt']);
  const [t1, t2, t3, t4, t5, t6] = eqn3.getElements(['t1', 't2', 't3', 't4', 't5', 't6']);
  const makeOnClick = (phrases, elems, line, figElements) => () => {
    const elements = [...eqn3.getPhraseElements(phrases), ...elems];
    if (line.isShown) {
      circ.hide(figElements);
      eqn3.dim(elements);
    } else {
      circ.show(figElements);
      eqn3.undim(elements);
      circ._rotatorFull.fnMap.exec('updateCircle');
    }
  };
  t1.onClick = makeOnClick(
    ['sinTheta'], ['eq11', 'val1'], sin, ['sin', 'sinLabel', 'rightSin'],
  );
  t2.onClick = makeOnClick(
    ['cosTheta'], ['eq12', 'val2'], cos, ['cosAlt', 'cosLabelAlt', 'rightCosAlt'],
  );
  t3.onClick = makeOnClick(
    ['tanTheta', 'sinCos'], ['eq7', 'eq13', 'val3'], tan, ['tanAlt', 'tanLabelAlt', 'rightTanAlt'],
  );
  t4.onClick = makeOnClick(
    ['cscTheta', 'oneSin'], ['eq8', 'eq14', 'val4'], csc, ['cscAlt', 'cscLabelAlt'],
  );
  t5.onClick = makeOnClick(
    ['secTheta', 'oneCos'], ['eq9', 'eq15', 'val5'], sec, ['secAlt', 'secLabelAlt'],
  );
  t6.onClick = makeOnClick(
    ['cotTheta', 'oneTan'], ['eq10', 'eq16', 'val6'], cot, ['cotAlt', 'cotLabelAlt', 'rightCotAlt'],
  );

  const add = (name, fn) => figure.fnMap.global.add(name, fn);
  // const get = name => eqn3.getElement(name);
  const pulse = (elements, centerOn, xAlign = 'center', yAlign = 'middle') => eqn3.pulse({
    elements, centerOn, xAlign, yAlign, scale: 1.5, duration: 1.5,
  });
  const sPulse = (element, xAlign = 'center', yAlign = 'middle') => eqn3.pulse({
    elements: [element], xAlign, yAlign, scale: 1.5, duration: 1.5,
  });
  add('eqnPulseTanAdj', () => sPulse('adj_2', 'center', 'top'));
  add('eqnPulseSecAdj', () => sPulse('adj_3', 'center', 'top'));
  add('eqnPulseCotOpp', () => sPulse('opp_4', 'center', 'top'));
  add('eqnPulseCscOpp', () => sPulse('opp_3', 'center', 'top'));
  add('eqnPulseOppHyp', () => pulse(['opp_1', 'v1', 'hyp_1'], 'v1', 'right'));
  add('eqnPulseAdjHyp', () => pulse(['adj_1', 'v2', 'hyp_2'], 'v2', 'right'));
  add('eqnPulseOppAdj', () => pulse(['opp_2', 'v3', 'adj_2'], 'v3', 'right'));
  add('eqnPulseHypOpp', () => pulse(['hyp_3', 'v4', 'opp_3'], 'v4', 'right'));
  add('eqnPulseHypAdj', () => pulse(['hyp_4', 'v5', 'adj_3'], 'v5', 'right'));
  add('eqnPulseAdjOpp', () => pulse(['adj_4', 'v6', 'opp_4'], 'v6', 'right'));
}