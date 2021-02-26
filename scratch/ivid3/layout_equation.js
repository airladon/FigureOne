/* eslint-disable camelcase */
/* global colSin, colCos, colCot, colTan, colSec, colCsc, colTheta,
   figure, colOpp, colHyp, colAdj */

function makeEquation() {
  const cont = (content, width = 0.6, xAlign = 'center') => ({
    container: { content, width, xAlign },
  });
  function frac(
    numerator, symbol, denominator, nSpace = 0.03, dSpace = 0.03, width, overhang = 0.03,
  ) {
    return cont({
      frac: {
        numerator, // : cont(numerator, width),
        symbol,
        denominator, // : cont(denominator, width),
        numeratorSpace: nSpace,
        denominatorSpace: dSpace,
        scale: 0.95,
        overhang,
      },
    }, width, 'right');
  }

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
  const w1 = 0.28;
  const o1 = 0;

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
  figure.add({
    name: 'eqn',
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
        v13: { symbol: 'vinculum' },
        v14: { symbol: 'vinculum' },
        v15: { symbol: 'vinculum' },
        v16: { symbol: 'vinculum' },
        v17: { symbol: 'vinculum' },
        v18: { symbol: 'vinculum' },
        v19: { symbol: 'vinculum' },
        v20: { symbol: 'vinculum' },
        v21: { symbol: 'vinculum' },
        v22: { symbol: 'vinculum' },
        v23: { symbol: 'vinculum' },
        v24: { symbol: 'vinculum' },
        // sin_0: { style: 'normal' },
        sin_1: { style: 'normal', color: colSin },
        sin_2: { style: 'normal', color: colSin },
        sin_3: { style: 'normal', color: colSin },
        sin_4: { style: 'normal', color: colSin },
        // cos_0: { style: 'normal' },
        cos_1: { style: 'normal', color: colCos },
        cos_2: { style: 'normal', color: colCos },
        cos_3: { style: 'normal', color: colCos },
        cos_4: { style: 'normal', color: colCos },
        // tan_0: { style: 'normal' },
        tan_1: { style: 'normal', color: colTan },
        tan_2: { style: 'normal', color: colTan },
        tan_3: { style: 'normal', color: colTan },
        tan_4: { style: 'normal', color: colTan },
        // cot_0: { style: 'normal' },
        cot_1: { style: 'normal', color: colCot },
        cot_2: { style: 'normal', color: colCot },
        cot_3: { style: 'normal', color: colCot },
        cot_4: { style: 'normal', color: colCot },
        // sec_0: { style: 'normal' },
        sec_1: { style: 'normal', color: colSec },
        sec_2: { style: 'normal', color: colSec },
        sec_3: { style: 'normal', color: colSec },
        sec_4: { style: 'normal', color: colSec },
        // csc_0: { style: 'normal' },
        csc_1: { style: 'normal', color: colCsc },
        csc_2: { style: 'normal', color: colCsc },
        csc_3: { style: 'normal', color: colCsc },
        csc_4: { style: 'normal', color: colCsc },
        opp_1: { text: 'osite', color: colOpp, size: 0.2 },
        opp_2: { text: 'opposite', color: colOpp, size: 0.2 },
        opp_3: { text: 'opposite', color: colOpp, size: 0.2 },
        opp_4: { text: 'opposite', color: colOpp, size: 0.2 },
        adj_1: { text: 'acent', color: colAdj, size: 0.2 },
        adj_2: { text: 'adjacent', color: colAdj, size: 0.2 },
        adj_3: { text: 'adjacent', color: colAdj, size: 0.2 },
        adj_4: { text: 'adjacent', color: colAdj, size: 0.2 },
        hyp_1: { text: 'otenuse', color: colHyp, size: 0.2 },
        hyp_2: { text: 'otenuse', color: colHyp, size: 0.2 },
        hyp_3: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_4: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_5: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_6: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        opp_1s: { text: 'opp', color: colOpp, size: 0.2 },
        opp_2s: { text: 'opp', color: colOpp, size: 0.2 },
        opp_3s: { text: 'opp', color: colOpp, size: 0.2 },
        opp_4s: { text: 'opp', color: colOpp, size: 0.2 },
        adj_1s: { text: 'adj', color: colAdj, size: 0.2 },
        adj_2s: { text: 'adj', color: colAdj, size: 0.2 },
        adj_3s: { text: 'adj', color: colAdj, size: 0.2 },
        adj_4s: { text: 'adj', color: colAdj, size: 0.2 },
        hyp_1s: { text: 'hyp', color: colHyp, size: 0.2 },
        hyp_2s: { text: 'hyp', color: colHyp, size: 0.2 },
        hyp_3s: { text: 'hyp', color: colHyp, size: 0.2 },
        hyp_4s: { text: 'hyp', color: colHyp, size: 0.2 },
        theta11: { text: '\u03b8', color: colTheta },
        theta12: { text: '\u03b8', color: colTheta },
        theta13: { text: '\u03b8', color: colTheta },
        theta14: { text: '\u03b8', color: colTheta },
        theta21: { text: '\u03b8', color: colTheta },
        theta22: { text: '\u03b8', color: colTheta },
        theta23: { text: '\u03b8', color: colTheta },
        theta24: { text: '\u03b8', color: colTheta },
        theta31: { text: '\u03b8', color: colTheta },
        theta32: { text: '\u03b8', color: colTheta },
        theta33: { text: '\u03b8', color: colTheta },
        theta34: { text: '\u03b8', color: colTheta },
        theta41: { text: '\u03b8', color: colTheta },
        theta42: { text: '\u03b8', color: colTheta },
        theta43: { text: '\u03b8', color: colTheta },
        theta44: { text: '\u03b8', color: colTheta },
        theta51: { text: '\u03b8', color: colTheta },
        theta52: { text: '\u03b8', color: colTheta },
        theta53: { text: '\u03b8', color: colTheta },
        theta54: { text: '\u03b8', color: colTheta },
        theta61: { text: '\u03b8', color: colTheta },
        theta62: { text: '\u03b8', color: colTheta },
        theta63: { text: '\u03b8', color: colTheta },
        theta64: { text: '\u03b8', color: colTheta },
        s1: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s2: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s3: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s4: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s5: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s6: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s7: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s8: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        val1: { text: '0.0000', color: colSin },
        val2: { text: '0.0000', color: colCos },
        val3: { text: '0.0000', color: colTan },
        val4: { text: '0.0000', color: colCsc },
        val5: { text: '0.0000', color: colSec },
        val6: { text: '0.0000', color: colCot },
        t1: { symbol: 'tBox' },
        t2: { symbol: 'tBox' },
        t3: { symbol: 'tBox' },
        t4: { symbol: 'tBox' },
        t5: { symbol: 'tBox' },
        t6: { symbol: 'tBox' },
        t7: { symbol: 'tBox' },
        t8: { symbol: 'tBox' },
        t9: { symbol: 'tBox' },
        t10: { symbol: 'tBox' },
        t11: { symbol: 'tBox' },
        t12: { symbol: 'tBox' },
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
      },
      phrases: {
        oppHyp: frac(['opp_1s', 'opp_1'], 'v1', ['hyp_1s', 'hyp_1'], 0.01, 0.03, 0.65),
        adjHyp: frac(['adj_1s', 'adj_1'], 'v2', ['hyp_2s', 'hyp_2'], 0.01, 0.03, 0.65),
        oppAdj: frac('opp_2', 'v3', 'adj_2', 0.01, 0.03, 0.65),
        hypOpp: frac('hyp_3', 'v4', 'opp_3', 0.01, 0.03, 0.65),
        hypAdj: frac('hyp_4', 'v5', 'adj_3', 0.01, 0.03, 0.65),
        adjOpp: frac('adj_4', 'v6', 'opp_4', 0.01, 0.03, 0.65),
        oppHyps: frac('opp_1s', 'v1', 'hyp_1s', 0.01, 0.03, w1),
        adjHyps: frac('adj_1s', 'v2', 'hyp_2s', 0.01, 0.03, w1),
        oppAdjs: frac('opp_2s', 'v3', 'adj_2s', 0.01, 0.03, w1),
        hypOpps: frac('hyp_3s', 'v4', 'opp_3s', 0.01, 0.03, w1),
        hypAdjs: frac('hyp_4s', 'v5', 'adj_3s', 0.01, 0.03, w1),
        adjOpps: frac('adj_4s', 'v6', 'opp_4s', 0.01, 0.03, w1),
        //
        sinTheta1: cont(['sin_1', ' ', 'theta11'], w1),
        sinTheta2: cont(['sin_2', ' ', 'theta12'], w1),
        sinTheta3: cont(['sin_3', ' ', 'theta13'], w1),
        sinTheta4: cont(['sin_4', ' ', 'theta14'], w1),
        cosTheta1: cont(['cos_1', ' ', 'theta21'], w1),
        cosTheta2: cont(['cos_2', ' ', 'theta22'], w1),
        cosTheta3: cont(['cos_3', ' ', 'theta23'], w1),
        cosTheta4: cont(['cos_4', ' ', 'theta24'], w1),
        tanTheta1: cont(['tan_1', ' ', 'theta31'], w1),
        tanTheta2: cont(['tan_2', ' ', 'theta32'], w1),
        tanTheta3: cont(['tan_3', ' ', 'theta33'], w1),
        tanTheta4: cont(['tan_4', ' ', 'theta34'], w1),
        secTheta1: cont(['sec_1', ' ', 'theta41'], w1),
        secTheta2: cont(['sec_2', ' ', 'theta42'], w1),
        secTheta3: cont(['sec_3', ' ', 'theta43'], w1),
        secTheta4: cont(['sec_4', ' ', 'theta44'], w1),
        cotTheta1: cont(['cot_1', ' ', 'theta51'], w1),
        cotTheta2: cont(['cot_2', ' ', 'theta52'], w1),
        cotTheta3: cont(['cot_3', ' ', 'theta53'], w1),
        cotTheta4: cont(['cot_4', ' ', 'theta54'], w1),
        cscTheta1: cont(['csc_1', ' ', 'theta61'], w1),
        cscTheta2: cont(['csc_2', ' ', 'theta62'], w1),
        cscTheta3: cont(['csc_3', ' ', 'theta63'], w1),
        cscTheta4: cont(['csc_4', ' ', 'theta64'], w1),
        sin: 'sinTheta1',
        sinOne: frac('sinTheta1', 'v7', '_1_11', 0.03, 0.03, w1, o1),
        cos: 'cosTheta1',
        cosOne: frac('cosTheta1', 'v8', '_1_12', 0.03, 0.03, w1, o1),
        sinCos: frac('sinTheta2', 'v9', 'cosTheta2', 0.03, 0.03, w1, o1),
        oneSin: frac('_1_13', 'v10', 'sinTheta3', 0.03, 0.03, w1, o1),
        oneCos: frac('_1_14', 'v11', 'cosTheta3', 0.03, 0.03, w1, o1),
        cosSin: frac('cosTheta4', 'v12', 'sinTheta4', 0.03, 0.03, w1, o1),

        tan: 'tanTheta1',
        tanOne: frac('tanTheta1', 'v13', '_1_21', 0.03, 0.03, w1, o1),
        sec: 'secTheta1',
        secOne: frac('secTheta1', 'v14', '_1_22', 0.03, 0.03, w1, o1),
        tanSec: frac('tanTheta2', 'v15', 'secTheta2', 0.03, 0.03, w1, o1),
        oneTan: frac('_1_23', 'v16', 'tanTheta3', 0.03, 0.03, w1, o1),
        oneSec: frac('_1_24', 'v17', 'secTheta3', 0.03, 0.03, w1, o1),
        secTan: frac('secTheta4', 'v18', 'tanTheta4', 0.03, 0.03, w1, o1),

        cot: 'cotTheta1',
        cotOne: frac('cotTheta1', 'v19', '_1_31', 0.03, 0.03, w1, o1),
        csc: 'cscTheta1',
        cscOne: frac('cscTheta1', 'v20', '_1_32', 0.03, 0.03, w1, o1),
        cotCsc: frac('cotTheta2', 'v21', 'cscTheta2', 0.03, 0.03, w1, o1),
        oneCot: frac('_1_33', 'v22', 'cotTheta3', 0.03, 0.03, w1, o1),
        oneCsc: frac('_1_34', 'v23', 'cscTheta3', 0.03, 0.03, w1, o1),
        cscCot: frac('cscTheta4', 'v24', 'cotTheta4', 0.03, 0.03, w1, o1),

        sinThetaT: cont(t(['sin_1', ' ', 'theta1'], 1, 1.5), w1),
        cosThetaT: cont(t(['cos_1', ' ', 'theta2'], 2, 1.5), w1),
        tanThetaT: cont(t(['tan_1', ' ', 'theta3'], 3, 2.2), w1),
        cscThetaT: cont(t(['csc_1', ' ', 'theta4'], 4, 2.2), w1),
        secThetaT: cont(t(['sec_1', ' ', 'theta5'], 5, 2.2), w1),
        cotThetaT: cont(t(['cot_1', ' ', 'theta6'], 6, 2.2), w1),
        f1: [{ sub: ['f_1', '_1'] }, { brac: ['lb1', 'theta11', 'rb1'] }],
        f2: [{ sub: ['f_2', '_2'] }, { brac: ['lb2', 'theta21', 'rb2'] }],
        f3: [{ sub: ['f_3', '_3'] }, { brac: ['lb3', 'theta31', 'rb3'] }],
        f4: [{ sub: ['f_4', '_4'] }, { brac: ['lb4', 'theta61', 'rb4'] }],
        f5: [{ sub: ['f_5', '_5'] }, { brac: ['lb5', 'theta41', 'rb5'] }],
        f6: [{ sub: ['f_6', '_6'] }, { brac: ['lb6', 'theta51', 'rb6'] }],

        c1: lin(['oppHyp', 'adjHyp', 'oppAdj', 'hypOpp', 'hypAdj', 'adjOpp']),
        c1f: lin(['oppHyps', 'adjHyps', 'oppAdjs', 'hypOpps', 'hypAdjs', 'adjOpps']),

        c2: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        c2_0: cont(lin(['eq1', '', '', '', '', '']), 0.3),
        c2_1: cont(lin(['eq1', 'eq2', '', '', '', '']), 0.3),

        c3: lin(['sin', 'cos', 'sinCos', 'oneSin', 'oneCos', 'cosSin']),
        c3_0: lin(['sinOne', '', '', '', '', '']),
        c3_1: lin(['sin', '', '', '', '', '']),
        c3_2: lin(['sin', 'cos', '', '', '', '']),
        c3s: lin(['sin', 'cos', 'sinCos', 'oneSin', 'oneCos', s('cosSin', 1)]),
        c3f: lin(['sin', 'cos', 'tan', 'csc', 'sec', 'cot']),
        c3t: lin([t('sin', 1, 1), t('cos', 2, 1), t('tan', 3, 1), t('csc', 4, 1), t('sec', 5, 1), t('cot', 6, 1)]),
        c3tAlt: lin([t('sin', 7, 1), t('cos', 8, 1), t('tan', 9, 1), t('csc', 10, 1), t('sec', 11, 1), t('cot', 12, 1)]),

        c4: cont(lin(['eq7', 'eq8', 'eq9', 'eq10', 'eq11', 'eq12']), 0.3),
        c4f: cont(lin(['', '', 'eq9', 'eq10', 'eq11', 'eq12']), 0.3),

        c7: lin(['tanSec', 'oneSec', 'tan', 'secTan', 'sec', 'oneTan']),
        c7s: lin([s('tanSec', 2), s('oneSec', 3), 'tan', s('secTan', 4), 'sec', 'oneTan']),
        c5f: lin(['oppHyps', 'adjHyps', 'sinCos', 'oneSin', 'oneCos', 'oneTan']),

        c6: cont(lin(['eq13', 'eq14', 'eq15', 'eq16', 'eq17', 'eq18']), 0.3),
        c6f: cont(lin(['', '', 'eq15', '', '', '']), 0.3),

        c5: lin(['oneCsc', 'cotCsc', 'oneCot', 'csc', 'cscCot', 'cot']),
        c5s: lin([s('oneCsc', 5), s('cotCsc', 6), s('oneCot', 7), 'csc', s('cscCot', 8), 'cot']),
        c7f: lin(['', '', 'oppAdjs', '', '', '']),

        cv: lin(['val1', 'val2', 'val3', 'val4', 'val5', 'val6']),
        cfunc: lin(['f1', 'f2', 'f3', 'f4', 'f5', 'f6']),
      },
      forms: {
        ratios: ['c1'],
        ratioValues: ['c1', 'c2', 'cv'],
        functions: ['c1', 'c2', 'cfunc'],
        names: ['c1', 'c2', 'c3f'],
        build0: ['c1', 'c2_0', 'c3_0'],
        build1: ['c1', 'c2_0', 'c3_1'],
        build3: ['c1', 'c2', 'c3'],
        build4: ['c1', 'c2', 'c3', 'c4', 'c5'],
        full: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'],
        // strike: ['c1', 'c2', 'c3s', 'c4', 'c5s', 'c6', 'c7s'],
        final: ['c3f', 'c2', 'c5f'],
        value: ['c3t', 'c2', 'c5f', 'c4', 'cv'],
        valueAlt: ['c3tAlt', 'c2', 'c5f', 'c4', 'cv'],
      },
      position: [-2.8, 1.2],
    },
    mods: {
      scenarios: {
        eqnTri: { position: [-2.3, 1.2] },
        eqnCirc: { position: [-2.8, 1.2] },
        ratioValues: { position: [-2.5, 1.2] },
        circQ1: { position: [-2.5, 1.2] },
        circFull: { position: [-2.5, 1.2] },
        split: { position: [-2.5, 1.2] },
        tanSecTri: { position: [-2.5, 1.2] },
      },
    },
  });
  const eqn = figure.getElement('eqn');
  const circ = figure.getElement('circ');
  const [sin, cos, tan] = circ.getElements(['triSinCos.sin', 'triSinCos.cos', 'triTanSec.tan']);
  const [csc, sec, cot] = circ.getElements(['triCotCsc.csc', 'triTanSec.sec', 'triCotCsc.cot']);
  const [sinAlt, cosAlt, tanAlt] = circ.getElements(['sinAlt', 'cosAlt', 'tanAlt']);
  const [cscAlt, secAlt, cotAlt] = circ.getElements(['cscAlt', 'secAlt', 'cotAlt']);
  const [t1, t2, t3, t4, t5, t6] = eqn.getElements(['t1', 't2', 't3', 't4', 't5', 't6']);
  const [t7, t8, t9, t10, t11, t12] = eqn.getElements(['t7', 't8', 't9', 't10', 't11', 't12']);
  const makeOnClick = (phrases, elems, line, figElements) => () => {
    const elements = [...eqn.getPhraseElements(phrases), ...elems];
    if (
      // line.color[0] === line.defaultColor[0]
      // && line.color[1] === line.defaultColor[1]
      // && line.color[2] === line.defaultColor[2]
      line.isShown
    ) {
      circ.hide(figElements);
      eqn.dim(elements);
    } else {
      circ.show(figElements);
      eqn.undim(elements);
    }
    if (circ._rotatorFull.isShown) {
      circ._rotatorFull.fnMap.exec('updateCircle');
    } else {
      circ._rotator.fnMap.exec('updateCircle');
    }
  };
  t1.onClick = makeOnClick(
    ['sin', 'oppHyps'], ['eq1', 'eq7', 'val1'], sin, ['triSinCos.sin'],
  );
  t2.onClick = makeOnClick(
    ['cos', 'adjHyps'], ['eq2', 'eq8', 'val2'], cos, ['triSinCos.cos'],
  );
  t3.onClick = makeOnClick(
    ['tan', 'sinCos'], ['eq3', 'eq9', 'val3'], tan, ['triTanSec.tan', 'triTanSec.rightTan'],
  );
  t4.onClick = makeOnClick(
    ['csc', 'oneSin'], ['eq4', 'eq10', 'val4'], csc, ['triCotCsc.csc'],
  );
  t5.onClick = makeOnClick(
    ['sec', 'oneCos'], ['eq5', 'eq11', 'val5'], sec, ['triTanSec.sec'],
  );
  t6.onClick = makeOnClick(
    ['cot', 'oneTan'], ['eq6', 'eq12', 'val6'], cot, ['triCotCsc.cot', 'triCotCsc.rightCot'],
  );
  t7.onClick = makeOnClick(
    ['sin', 'oppHyps'], ['eq1', 'eq7', 'val1'], sinAlt, ['sinAlt'],
  );
  t8.onClick = makeOnClick(
    ['cos', 'adjHyps'], ['eq2', 'eq8', 'val2'], cosAlt, ['cosAlt'],
  );
  t9.onClick = makeOnClick(
    ['tan', 'sinCos'], ['eq3', 'eq9', 'val3'], tanAlt, ['tanAlt'],
  );
  t10.onClick = makeOnClick(
    ['csc', 'oneSin'], ['eq4', 'eq10', 'val4'], cscAlt, ['cscAlt'],
  );
  t11.onClick = makeOnClick(
    ['sec', 'oneCos'], ['eq5', 'eq11', 'val5'], secAlt, ['secAlt'],
  );
  t12.onClick = makeOnClick(
    ['cot', 'oneTan'], ['eq6', 'eq12', 'val6'], cotAlt, ['cotAlt'],
  );

  const add = (name, fn) => figure.fnMap.global.add(name, fn);
  // const get = name => eqn.getElement(name);
  const pulse = (elements, centerOn, xAlign = 'center', yAlign = 'middle') => eqn.pulse({
    elements, centerOn, xAlign, yAlign, scale: 1.5, duration: 1.5,
  });
  const sPulse = (element, xAlign = 'center', yAlign = 'middle') => eqn.pulse({
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

  /*
  .########..#######..##....##....##..
  .##.......##.....##.###...##..####..
  .##.......##.....##.####..##....##..
  .######...##.....##.##.##.##....##..
  .##.......##..##.##.##..####....##..
  .##.......##....##..##...###....##..
  .########..#####.##.##....##..######
  */
  const abs = (content, index) => ({
    brac: {
      content,
      left: `lb${index}`,
      right: `rb${index}`,
      minContentHeight: 0.2,
      minContentDescent: 0.03,
    },
  });
  const [eqn1] = figure.add({
    name: 'eqn1',
    method: 'equation',
    options: {

      elements: {
        sin: { style: 'normal', color: colSin },
        cos: { style: 'normal', color: colCos },
        tan: { style: 'normal', color: colTan },
        sec: { style: 'normal', color: colSec },
        plus: ' + ',
        eq: '  =  ',
        gr: '  >  ',
        lb1: { symbol: 'bar', side: 'left' },
        rb1: { symbol: 'bar', side: 'right' },
        lb2: { symbol: 'bar', side: 'left' },
        rb2: { symbol: 'bar', side: 'right' },
      },
      forms: {
        sinCosOne: [
          { sup: ['sin', '2_1'] },
          '_ + ',
          { sup: ['cos', '2_2'] },
          'eq', '_1',
        ],
        tanSecOne: [
          { sup: ['tan', '2_1'] },
          '_ + ',
          { sup: ['sec', '2_2'] },
          'eq', '_1',
        ],
        secTan: [
          abs('sec', 1),
          'gr',
          abs('tan', 2),
        ],
      },
      scale: 1.1,
      position: [1.3, -1],
    },
  });
  const pulseEqn = (form) => {
    eqn1.stop();
    eqn1.showForm(form);
    eqn1.hide();
    eqn1.animations.new()
      .dissolveIn(0.5)
      .pulse({ scale: 1.5, duration: 2 })
      .delay(1)
      .dissolveOut(0.5)
      .start();
  };
  add('eqn1SinCosOne', () => pulseEqn('sinCosOne'));
  add('eqn1TanSecOne', () => pulseEqn('tanSecOne'));
  add('eqn1SecTan', () => pulseEqn('secTan'));
}

