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
  const b = (content, boxNum) => ({
    strike: { content, symbol: `b${boxNum}`, inSize: false, space: 0.1 },
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
        s9: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s10: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
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
        b1: { symbol: 'box', line: { width: thin }, color: color1 },
        b2: { symbol: 'box', line: { width: thin }, color: color1 },
        b3: { symbol: 'box', line: { width: thin }, color: color1 },
        b4: { symbol: 'box', line: { width: thin }, color: color1 },
        b5: { symbol: 'box', line: { width: thin }, color: color1 },
        b6: { symbol: 'box', line: { width: thin }, color: color1 },
        b7: { symbol: 'box', line: { width: thin }, color: color1 },
        b8: { symbol: 'box', line: { width: thin }, color: color1 },
        b9: { symbol: 'box', line: { width: thin }, color: color1 },
        b10: { symbol: 'box', line: { width: thin }, color: color1 },
        b11: { symbol: 'box', line: { width: thin }, color: color1 },
        b12: { symbol: 'box', line: { width: thin }, color: color1 },
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
        c1s: lin(['oppHyp', 'adjHyp', b('oppAdj', 7), b('hypOpp', 8), b('hypAdj', 9), b('adjOpp', 10)]),
        c1k: lin([b('oppHyp', 1), b('adjHyp', 2), 'oppAdj', 'hypOpp', 'hypAdj', 'adjOpp']),
        c1f: lin(['oppHyps', 'adjHyps', 'oppAdjs', 'hypOpps', 'hypAdjs', 'adjOpps']),

        c2: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        c2f: cont(lin(['eq1', 'eq2', 'eq9', 'eq10', 'eq11', 'eq12']), 0.3),
        c2_0: cont(lin(['eq1', '', '', '', '', '']), 0.3),
        c2_1: cont(lin(['eq1', 'eq2', '', '', '', '']), 0.3),
        c2_2: cont(lin(['eq1', 'eq2', 'eq3', '', '', '']), 0.3),

        c3: lin(['sin', 'cos', 'sinCos', 'oneSin', 'oneCos', 'cosSin']),
        c3b: lin([b('sin', 1), b('cos', 2), 'sinCos', 'oneSin', 'oneCos', 'cosSin']),
        c3_0: lin(['sinOne', '', '', '', '', '']),
        c3_1: lin(['sin', '', '', '', '', '']),
        c3_2: lin(['sin', 'cos', '', '', '', '']),
        c3_2a: lin(['sin', 'cos', 'sinCos', '', '', '']),
        c3s: lin(['sin', 'cos', 'sinCos', 'oneSin', 'oneCos', b('cosSin', 1)]),
        c3f: lin(['sin', 'cos', 'tan', 'csc', 'sec', 'cot']),
        c3fb: lin([b('sin', 1), b('cos', 2), b('tan', 5), b('csc', 3), b('sec', 6), b('cot', 4)]),
        c3t: lin([t('sin', 1, 2), t('cos', 2, 2), t('tan', 3, 2), t('csc', 4, 2), t('sec', 5, 2), t('cot', 6, 2)]),
        c3tAlt: lin([t('sin', 7, 2), t('cos', 8, 2), t('tan', 9, 2), t('csc', 10, 2), t('sec', 11, 2), t('cot', 12, 2)]),

        c4: cont(lin(['eq7', 'eq8', 'eq9', 'eq10', 'eq11', 'eq12']), 0.3),
        // c4f: cont(lin(['eq7', 'eq8', 'eq9', 'eq10', 'eq11', 'eq12']), 0.3),

        c7: lin(['tanSec', 'oneSec', 'tan', 'secTan', 'sec', 'oneTan']),
        c7b: lin(['tanSec', 'oneSec', b('tan', 5), 'secTan', b('sec', 6), 'oneTan']),
        c7n: lin(['tanSec', 'oneSec', 'oneCot', 'secTan', 'cscCot', 'oneTan']),
        c7s: lin([b('tanSec', 4), b('oneSec', 11), b('oneCot', 12), b('secTan', 5), b('cscCot', 6), 'oneTan']),
        c7k: lin(['tanSec', 'oneSec', 'oneCot', 'secTan', 'cscCot', b('oneTan', 3)]),
        // c7s: lin([b('tanSec', 2), b('oneSec', 3), b('tan', 5), b('secTan', 4), b('sec', 6), 'oneTan']),
        c5fPre: lin(['oppHyp', 'adjHyp', 'sinCos', 'oneSin', 'oneCos', 'oneTan']),
        c5fPreK: lin([b('oppHyp', 1), b('adjHyp', 2), b('sinCos', 4), b('oneSin', 5), b('oneCos', 6), b('oneTan', 3)]),
        c5f: lin(['oppHyps', 'adjHyps', 'sinCos', 'oneSin', 'oneCos', 'oneTan']),

        c6: cont(lin(['eq13', 'eq14', 'eq15', 'eq16', 'eq17', 'eq18']), 0.3),
        c6f: cont(lin(['', '', 'eq15', '', '', '']), 0.3),

        c5: lin(['oneCsc', 'cotCsc', 'oneCot', 'csc', 'cscCot', 'cot']),
        c5b: lin(['oneCsc', 'cotCsc', 'oneCot', b('csc', 3), 'cscCot', b('cot', 4)]),
        c5n: lin(['oneCsc', 'cotCsc', 'sinCos', 'oneSin', 'oneCos', 'cosSin']),
        c5k: lin(['oneCsc', 'cotCsc', b('sinCos', 4), b('oneSin', 5), b('oneCos', 6), 'cosSin']),
        c5s: lin([b('oneCsc', 1), b('cotCsc', 2), 'sinCos', 'oneSin', 'oneCos', b('cosSin', 3)]),
        // c5s: lin([s('oneCsc', 5), s('cotCsc', 6), s('oneCot', 7), b('csc', 3), s('cscCot', 8), b('cot', 4)]),
        c7f: lin(['', '', 'oppAdjs', '', '', '']),

        cv: lin(['val1', 'val2', 'val3', 'val4', 'val5', 'val6']),
        cfunc: lin(['f1', 'f2', 'f3', 'f4', 'f5', 'f6']),
      },
      forms: {
        ratios: ['c1'],
        ratiosEq: ['c1', 'c2'],
        ratioValues: ['c1', 'c2', 'cv'],
        functions: ['c1', 'c2', 'cfunc'],
        names: ['c1', 'c2', 'c3f'],
        build0: ['c1', 'c2_0', 'c3_0'],
        build1: ['c1', 'c2_0', 'c3_1'],
        build2: ['c1', 'c2_1', 'c3_2'],
        build2a: ['c1', 'c2_2', 'c3_2a'],
        build3: ['c1', 'c2', 'c3'],
        build4: ['c1', 'c2', 'c3', 'c4', 'c5'],
        full: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'],
        fullBoxes: ['c1', 'c2', 'c3b', 'c4', 'c5b', 'c6', 'c7b'],
        fullNamesBoxes: ['c1', 'c2', 'c3fb', 'c4', 'c5n', 'c6', 'c7n'],
        fullNames: ['c1', 'c2', 'c3f', 'c4', 'c5n', 'c6', 'c7n'],
        keep: ['c1k', 'c2', 'c3f', 'c4', 'c5k', 'c6', 'c7k'],
        strike: ['c1s', 'c2', 'c3f', 'c4', 'c5s', 'c6', 'c7s'],
        finalPre: ['c3f', 'c2f', 'c5fPre'],
        finalPreK: ['c3f', 'c2f', 'c5fPreK'],
        final: ['c3f', 'c2f', 'c5f'],
        value: ['c3t', 'c2f', 'c5f', 'c6', 'cv'],
        valueAlt: ['c3tAlt', 'c2f', 'c5f', 'c6', 'cv'],
      },
      position: [-2.8, 1.2],
    },
    mods: {
      scenarios: {
        eqnTri: { position: [-2.3, 1.2] },
        eqnCirc: { position: [-2.8, 1.2] },
        ratioValues: { position: [-2.5, 1.2] },
        similar: { position: [-2.5, 1.2] },
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
  add('eqnPulseSin', () => sPulse('sin_1', 'right', 'middle'));
  add('eqnPulseCos', () => sPulse('cos_1', 'right', 'middle'));
  add('eqnPulseTan', () => sPulse('tan_1', 'right', 'middle'));
  add('eqnPulseCsc', () => sPulse('csc_1', 'right', 'middle'));
  add('eqnPulseSec', () => sPulse('sec_1', 'right', 'middle'));
  add('eqnPulseCot', () => sPulse('cot_1', 'right', 'middle'));
  add('eqnPulseOppHyp', () => pulse(['opp_1', 'v1', 'hyp_1'], 'v1', 'right'));
  add('eqnPulseAdjHyp', () => pulse(['adj_1', 'v2', 'hyp_2'], 'v2', 'right'));
  add('eqnPulseOppHypS', () => pulse(['opp_1', 'opp_1s', 'v1', 'hyp_1', 'hyp_1s'], 'v1', 'right'));
  add('eqnPulseAdjHypS', () => pulse(['adj_1', 'adj_1s', 'v2', 'hyp_2', 'hyp_2s'], 'v2', 'right'));
  add('eqnPulseOppAdj', () => pulse(['opp_2', 'v3', 'adj_2'], 'v3', 'right'));
  add('eqnPulseHypOpp', () => pulse(['hyp_3', 'v4', 'opp_3'], 'v4', 'right'));
  add('eqnPulseHypAdj', () => pulse(['hyp_4', 'v5', 'adj_3'], 'v5', 'right'));
  add('eqnPulseAdjOpp', () => pulse(['adj_4', 'v6', 'opp_4'], 'v6', 'right'));
  add('eqnPulseTrig', () => {
    const phrases = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];
    phrases.forEach((phrase) => {
      const elements = eqn.getPhraseElements(phrase);
      eqn.pulse({
        elements, centerOn: elements[0], xAlign: 'left', duration: 1.5,
      });
    });
  });

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
        sin_2: { style: 'normal', color: colSin },
        cos: { style: 'normal', color: colCos },
        cos_2: { style: 'normal', color: colCos },
        tan: { style: 'normal', color: colTan },
        sec: { style: 'normal', color: colSec },
        sec_2: { style: 'normal', color: colSec },
        csc: { style: 'normal', color: colCsc },
        csc_2: { style: 'normal', color: colCsc },
        cot: { style: 'normal', color: colCot },
        lim_1: { style: 'normal' },
        lim_2: { style: 'normal' },
        opp: { color: colSin },
        adj: { color: colCos },
        hyp_1: { color: colHyp },
        hyp_2: { color: colHyp },
        plus: ' + ',
        eq: '  =  ',
        eq1: '  =  ',
        gr: '  ≥  ',
        lt1: '  ≤  ',
        lt2: '  ≤  ',
        comma: ', ',
        comma2: ', ',
        comma3: ', ',
        lb1: { symbol: 'bar', side: 'left' },
        rb1: { symbol: 'bar', side: 'right' },
        lb2: { symbol: 'bar', side: 'left' },
        rb2: { symbol: 'bar', side: 'right' },
        _90_1: { color: colTheta },
        comp1: { text: '\u00b0\u2212\u03b8', color: colTheta, style: 'italic' },
        theta1: { text: '\u03b8', color: colTheta },
        theta2: { text: '\u03b8', color: colTheta },
        theta3: { text: '\u03b8', color: colTheta },
        theta4: { text: '\u03b8', color: colTheta },
        theta5: { text: '\u03b8', color: colTheta },
        theta6: { text: '\u03b8', color: colTheta },
        rightArrow1: { text: '\u2192' },
        rightArrow2: { text: '\u2192' },
        lb3: { symbol: 'bracket', side: 'left' },
        rb3: { symbol: 'bracket', side: 'right' },
        lb4: { symbol: 'bracket', side: 'left' },
        rb4: { symbol: 'bracket', side: 'right' },
        lb5: { symbol: 'bracket', side: 'left' },
        rb5: { symbol: 'bracket', side: 'right' },
        nInf1: '-\u221e',
        nInf2: '-\u221e',
        inf1: '\u221e',
        inf2: '\u221e',
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
        deg1: { text: '\u00b0', color: colTheta },
        deg2: { text: '\u00b0', color: colTheta },
        min1: { text: '\u2212', color: colTheta },
        min2: { text: '\u2212', color: colTheta },
        plus1: { text: '+', color: colTheta },
        plus2: { text: '+', color: colTheta },
        _180: { color: colTheta },
        _180_1: { color: colTheta },
        _360: { color: colTheta },
        _360_1: { color: colTheta },
      },
      formDefaults: {
        alignment: { xAlign: 'center', yAlign: 'middle' },
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
          '_1', 'eq',
          { sup: ['sec', '2_2'] },
        ],
        secTan: [
          abs(['sec'], 1),
          'gr',
          abs(['tan'], 2),
        ],
        cscSec: [
          'csc', ' ', 'theta1',
          'eq',
          'sec', { brac: ['lb3', ['_90_1', 'comp1'], 'rb3'] },
        ],
        sinCos: [
          'cos', ' ', 'theta1',
          'eq',
          'sin', { brac: ['lb3', ['_90_1', 'comp1'], 'rb3'] },
        ],
        tanCot: [
          'cot', ' ', 'theta1',
          'eq',
          'tan', { brac: ['lb3', ['_90_1', 'comp1'], 'rb3'] },
        ],
        sinCosMag: [
          abs(['sin'], 1), 'lt1', '_1', 'comma', abs(['cos'], 2), 'lt2', '_1_2',
        ],
        xy: { brac: ['lb3', 'x, y', 'rb3'] },
        coord: {
          content: [
            { brac: ['lb3', 'x, y', 'rb3'] }, 'eq1', { brac: ['lb4', ['cos', 'comma', 'sin'], 'rb4'] },
          ],
          // translation: {
          //   eq: { style: 'linear' },
          //   lb3: { style: 'linear' },
          //   x: { style: 'linear' },
          //   comma2: { style: 'linear' },
          //   y: { style: 'linear' },
          //   rb3: { style: 'linear' },
          // },
        },
        cosSin: {
          content: [
            { brac: ['lb4', ['cos', 'comma', 'sin'], 'rb4'] },
          ],
          alignment: { yAlign: 'baseline' },
        },
        cosSinDef: {
          content: [
            { brac: ['lb4', ['cos', 'comma', 'sin'], 'rb4'] }, 'eq',
            { brac: ['lb5', [{ scale: [{ frac: ['adj', 'v1', 'hyp_1'] }, 0.7] }, 'comma2', { scale: [{ frac: ['opp', 'v2', 'hyp_2'] }, 0.7] }], 'rb5'] },
          ],
          alignment: { xAlign: '1.1o', yAlign: 'baseline' },
        },
        coord1: {
          content: [
            { brac: ['lb4', ['cos', 'comma', 'sin'], 'rb4'] }, 'eq', { brac: ['lb5', ['x', 'comma2', 'y'], 'rb5'] },
          ],
          alignment: { xAlign: '1.1o', yAlign: 'baseline' },
        },
        coord2: {
          content: {
            lines: {
              content: [
                {
                  content: [{ brac: ['lb4', ['cos', 'comma', 'sin'], 'rb4'] }, 'eq', { brac: ['lb5', ['x', 'comma2', 'y'], 'rb5'] }],
                  justify: 'eq',
                },
                {
                  content: ['eq1', {
                    bottomComment: {
                      content: [{ brac: ['lb3', [{ scale: [{ frac: ['adj', 'v1', 'hyp_1'] }, 0.7] }, 'comma3', { scale: [{ frac: ['opp', 'v2', 'hyp_2'] }, 0.7] }], 'rb3'] }],
                      comment: ['for 0 ≤ \u03b8 ≤ 90\u00b0'],
                      contentSpace: 0.1,
                    },
                  }],
                  justify: 'eq1',
                  baselineSpace: 0.6,
                },
              ],
              justify: 'element',
            },
          },
          alignment: { xAlign: '1.1o', yAlign: 'baseline' },
        },
        lim: {
          content: {
            lines: {
              content: [
                [
                  {
                    bottomComment: ['lim_1', ['theta1', 'rightArrow1', '_0']],
                  }, '  ', { scale: [{ frac: [['sin', 'theta2'], 'v1', 'theta3'] }, 0.8] }, 'eq', '_1',
                ],
                [
                  {
                    bottomComment: ['lim_2', ['theta4', 'rightArrow2', '_0_1']],
                  }, '  ', { scale: [{ frac: [['tan', 'theta5'], 'v2', 'theta6'] }, 0.8] }, 'eq1', '_1_1',
                ],
              ],
              baselineSpace: 0.55,
            },
          },
          alignment: { xAlign: -0.3, yAlign: 'middle' },
        },
        q2Sin: ['sin', { brac: ['lb3', ['_180', 'deg1', 'min1', 'theta1'], 'rb3'] }],
        q2SinEq: ['sin', { brac: ['lb3', ['_180', 'deg1', 'min1', 'theta1'], 'rb3'] }, 'eq', 'sin_2', ' ', 'theta2'],
        q2: {
          lines: {
            content: [
              ['sin', { brac: ['lb3', ['_180', 'deg1', 'min1', 'theta1'], 'rb3'] }, 'eq', 'sin_2', ' ', 'theta2'],
              ['cos', { brac: ['lb4', ['_180_1', 'deg2', 'min2', 'theta3'], 'rb4'] }, 'eq1', '_\u2212', 'cos_2', ' ', 'theta4'],
            ],
            baselineSpace: 0.5,
          },
        },
        q3Sin: ['sin', { brac: ['lb3', ['_180', 'deg1', 'plus1', 'theta1'], 'rb3'] }],
        q3SinEq: ['sin', { brac: ['lb3', ['_180', 'deg1', 'plus1', 'theta1'], 'rb3'] }, 'eq', '_\u2212_1', 'sin_2', ' ', 'theta2'],
        q3: {
          lines: {
            content: [
              ['sin', { brac: ['lb3', ['_180', 'deg1', 'plus1', 'theta1'], 'rb3'] }, 'eq', '_\u2212_1', 'sin_2', ' ', 'theta2'],
              ['cos', { brac: ['lb4', ['_180_1', 'deg2', 'plus2', 'theta3'], 'rb4'] }, 'eq1', '_\u2212', 'cos_2', ' ', 'theta4'],
            ],
            baselineSpace: 0.5,
          },
        },
        q4Sin: ['sin', { brac: ['lb3', ['_360', 'deg1', 'min1', 'theta1'], 'rb3'] }],
        q4SinEq: ['sin', { brac: ['lb3', ['_360', 'deg1', 'min1', 'theta1'], 'rb3'] }, 'eq', '_\u2212_1', 'sin_2', ' ', 'theta2'],
        q4: {
          lines: {
            content: [
              ['sin', { brac: ['lb3', ['_360', 'deg1', 'min1', 'theta1'], 'rb3'] }, 'eq', '_\u2212_1', 'sin_2', ' ', 'theta2'],
              ['cos', { brac: ['lb4', ['_360_1', 'deg2', 'min2', 'theta3'], 'rb4'] }, 'eq1', 'cos_2', ' ', 'theta4'],
            ],
            baselineSpace: 0.5,
          },
        },
        q4Neg: {
          lines: {
            content: [
              ['sin', { brac: ['lb3', ['min1', 'theta1'], 'rb3'] }, 'eq', '_\u2212_1', 'sin_2', ' ', 'theta2'],
              ['cos', { brac: ['lb4', ['min2', 'theta3'], 'rb4'] }, 'eq1', 'cos_2', ' ', 'theta4'],
            ],
            baselineSpace: 0.5,
          },
        },
        sinBounds: ['_-1', 'lt1', 'sin', 'comma', 'cos', 'lt2', '_1'],
        // cosBounds: ['_-1', 'lt1', 'cos', 'lt2', '_1'],
        tanBounds: ['nInf1', 'lt1', 'tan', 'comma', 'cot', 'lt2', 'inf1'],
        // cotBounds: ['nInf1', 'lt1', 'cot', 'lt2', 'inf1'],
        secBounds: {
          lines: {
            content: [
              ['csc', 'comma', 'sec', 'lt1', '_-1'],
              ['csc_2', 'comma3', 'sec_2', 'gr', '_1'],
            ],
            justify: 'left',
            baselineSpace: 0.3,
          },
        },
        // secBounds: ['sec', 'lt1', '_-1', 'comma', '_1', 'lt2', 'sec_2'],
        tanOnOne: {
          content: { frac: [['tan_1', 'gent'], 'v2', '_1'] },
          alignment: { xAlign: 'left', yAlign: 'baseline' },
        },
        TangentOneOppAdj: {
          content: [
            { frac: [['tan_1', 'gent'], 'v2', '_1'] },
            'eq',
            { frac: ['opposite', 'v1', 'adjacent'] },
          ],
          alignment: { xAlign: 'left', yAlign: 'baseline' },
        },
        // oppOnAdjTangent: {
        //   content: [
        //     { frac: ['opposite', 'v1', 'adjacent'] },
        //     'eq',
        //     'tan_1', 'gent',
        //   ],
        //   alignment: { xAlign: 'left' },
        // },
        tanOppAdj: {
          content: [
            'tan_1',
            'eq',
            { frac: ['opposite', 'v1', 'adjacent'] },
          ],
          alignment: { xAlign: 'left', yAlign: 'baseline' },
        },
      },
      scale: 1.1,
      position: [0.8, 0.7],
    },
    mods: {
      scenarios: {
        eqn1TopRight: { position: [0.8, 0.7] },
        eqn1Left: { position: [-1.7, 0] },
        eqn1Right: { position: [0.3, 0] },
        eqn1Bottom: { position: [0.3, -1] },
      },
    },
  });
  const pulseEqn = (form, scale, position) => {
    eqn1.stop();
    eqn1.showForm(form);
    eqn1.hide();
    eqn1.setPosition(position);
    eqn1.animations.new()
      .dissolveIn(0.5)
      .pulse({ scale, duration: 2 })
      .delay(2)
      .dissolveOut(0.5)
      .start();
  };
  add('eqn1SinCosOne', () => pulseEqn('sinCosOne', 1.2, [2.1, -1.1]));
  // add('eqn1SinCosMag', () => pulseEqn('sinCosMag'));
  add('eqn1TanSecOne', () => pulseEqn('tanSecOne', 1.2, [2.1, -1.1]));
  add('eqn1SinBounds', () => pulseEqn('sinBounds', 1, [2, -1.2]));
  add('eqn1TanBounds', () => pulseEqn('tanBounds', 1, [2, -1.2]));
  add('eqn1SecBounds', () => pulseEqn('secBounds', 1, [2.2, -1.1]));
  // add('eqn1CscSec', () => pulseEqn('cscSec'));
  // add('eqn1SinCos', () => pulseEqn('sinCos'));
  // add('eqn1TanCot', () => pulseEqn('tanCot'));
  add('eqn1Lim', () => pulseEqn('lim', 1, [1.3, -0.95]));
  add('eqn1Coord', () => pulseEqn('coord'));
  add('eqn1Q2Sin', () => {
    eqn1.stop();
    eqn1.showForm('q2Sin');
    eqn1.animations.new().dissolveIn(0.5).start();
  });
  add('eqn1Q2SinEq', () => eqn1.goToForm({ start: 'q2SinEq', target: 'q2', duration: 2, animate: 'move' }));
  add('eqn1Q2', () => eqn1.goToForm({ start: 'q2Sin', target: 'q2', duration: 1.5, animate: 'move' }));
  add('eqn1Q3Sin', () => {
    eqn1.stop();
    eqn1.showForm('q3Sin');
    eqn1.animations.new().dissolveIn(0.5).start();
  });
  add('eqn1Q3SinEq', () => eqn1.goToForm({ start: 'q3SinEq', target: 'q3', duration: 2, animate: 'move' }));
  add('eqn1Q3', () => eqn1.goToForm({ start: 'q3Sin', target: 'q3', duration: 1.5, animate: 'move' }));

  add('eqn1Q4Sin', () => {
    eqn1.stop();
    eqn1.showForm('q4Sin');
    eqn1.animations.new().dissolveIn(0.5).start();
  });
  add('eqn1Q4SinEq', () => eqn1.goToForm({ start: 'q4Sin', target: 'q4SinEq', duration: 2, animate: 'move' }));
  add('eqn1Q4', () => eqn1.goToForm({ start: 'q4SinEq', target: 'q4', duration: 1.5, animate: 'move' }));
  add('eqn1Q4Neg', () => eqn1.goToForm({ start: 'q4', target: 'q4Neg', duration: 1.5, animate: 'move' }));
}

