/* globals colorText, color0, figure, layout */

function addEquation() {
  const b1 = content => ({
    brac: {
      left: 'lb1', content, right: 'rb1', height: 0.2, descent: 0.05,
    },
  });
  const ASin = content => ([
    'A', 'sin',
    {
      brac: {
        left: 'lb2', content, right: 'rb2', height: 0.2, descent: 0.05,
      },
    },
  ]);
  const b2 = content => ({
    brac: {
      left: 'lb2', content, right: 'rb2', height: 0.2, descent: 0.05,
    },
  });
  const brac3 = content => ({
    brac: {
      left: 'lb3', content, right: 'rb3', descent: 0.05,
    },
  });
  const scale = (content, s = 0.8) => ({
    scale: { content, scale: s },
  });

  const ann = (content, comment, symbol, space = 0.2) => ({
    bottomComment: {
      content,
      comment,
      commentSpace: space,
      symbol,
      inSize: false,
    },
  });

  const tann = (content, comment, symbol, space = 0.2) => ({
    topComment: {
      content,
      comment,
      commentSpace: space,
      symbol,
      inSize: false,
    },
  });

  const frac = (numerator, denominator) => ({
    frac: {
      numerator, denominator, symbol: 'v', overhang: 0.02,
    },
  });

  const stk = (content, num) => ({
    strike: {
      content,
      symbol: `strike${num}`,
    },
  });
  figure.add([
    {
      name: 'eqn',
      method: 'collections.equation',
      options: {
        // Define the elements that require specific styling
        color: colorText,
        dimColor: [0.7, 0.7, 0.7, 1],
        elements: {
          sin: { style: 'normal' },
          lb1: { symbol: 'bracket', side: 'left' },
          rb1: { symbol: 'bracket', side: 'right' },
          lb2: { symbol: 'bracket', side: 'left' },
          rb2: { symbol: 'bracket', side: 'right' },
          lb3: { symbol: 'squareBracket', side: 'left' },
          rb3: { symbol: 'squareBracket', side: 'right' },
          equals: '  =  ',
          equals2: '  =  ',
          w1: '\u03c9',
          w2: '\u03c9',
          w3: '\u03c9',
          min: ' \u2212 ',
          min2: ' \u2212 ',
          _2pi1: '2\u03c0',
          _2pi2: '2\u03c0',
          comma1: ', ',
          comma2: ', ',
          lambda: '\u03bb',
          v: { symbol: 'vinculum', lineWidth: 0.007 },
          v2: { symbol: 'vinculum', lineWidth: 0.007 },
          brace: { symbol: 'brace', side: 'bottom', lineWidth: 0.005 },
          line1: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
          line2: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
          // x_4: { color: color0 },
          // _0_4: { color: color0 },
          // x_5: { color: color1 },
          // x_6: { color: color1 },
          // x_7: { color: color1 },
          // _1_5: { color: color1 },
          // _1_6: { color: color1 },
          // _1_7: { color: color1 },
          strike1: { symbol: 'strike', lineWidth: 0.007 },
          strike2: { symbol: 'strike', lineWidth: 0.007 },
        },
        phrases: {
          f1: { container: ['f_1', 0.08] },
          yxt: ['y_1', { brac: ['lb1', ['x_y1', 'comma1', 't_y1'], 'rb1'] }],
          fxt: ['f1', { brac: ['lb2', ['x_2', 'comma2', 't_2'], 'rb2'] }],
          // ytx: ['y_1', b1(['x_1', 'comma1', 't_1'])],
          // sinkx: ['sin', b2(['w1', 't_2', 'min', 'k', 'x_2'])],
          // t1: { sub: ['t_2', '_1_1'] },
          // t12: { sub: ['t_6', '_1_3'] },
          // x11: { sub: ['x_2', '_1_2'] },
          // x12: { sub: ['x_6', '_1_6'] },
          // x13: { sub: ['x_7', '_1_7'] },
          // x1OnC: frac('x11', 'c'),
          // x1OnCb: frac('x13', 'c'),
          // sX1OnC: scale('x1OnCb'),
          // sX1ToXOnC: scale(frac(tann('x13', 'x_1', 'line2'), 'c')),
          // x0: { sub: ['x_4', '_0_4'] },
          // yx0t: ['y_0', b1(['x0', 'comma1', 't_1'])],
          // yx0To1t: ['y_0', b1([ann('x0', 'x12', 'line1'), 'comma1', 't_1'])],
          // yx1t: ['y_0', b1(['x12', 'comma1', 't_1'])],
          // yx1ToXt: ['y_0', b1([tann('x12', 'x_0', 'line1'), 'comma1', 't_1'])],
          // yxt: ['y_0', b1(['x_0', 'comma1', 't_1'])],
          // sXOnC: scale(frac('x_1', 'c')),
          // _2pifOnC: scale(frac(['_2pi2', ' ', 'f_2'], 'c')),
          // wt: ['w1', 't_3'],
          // tToTMinT1: ann('t_3', ['t_4', 'min', 't1'], 'line2'),
        },
        formDefaults: {
          alignment: { fixTo: 'equations' },
          // duration: 1,
        },
        forms: {
          0: ['yxt', 'equals', 'fxt']
          // 0: ['ytx', 'equals', 'sinkx'],
        //   1: [],
        //   2: ['t1', 'equals', 'x1OnC'],
        //   3: ['yx0t', 'equals', ASin(['w1', 't_3'])],
        //   4: ['yx0To1t', 'equals', ASin(['w1', 'tToTMinT1'])],
        //   5: ['yx1t', 'equals', ASin(['w1', brac3(['t_4', 'min', 't1'])])],
        //   6: [
        //     'yx1t', 'equals', ASin(
        //       {
        //         bottomComment: [
        //           ['w1', brac3(['t_4', 'min', 't1'])],
        //           ['w2', 't_5', 'min2', 'w3', 't12'],
        //           'brace',
        //         ],
        //       },
        //     ),
        //   ],
        //   7: [
        //     'yx1t', 'equals', ASin(
        //       ['w2', 't_5', 'min2', 'w3', 't12'],
        //     ),
        //   ],
        //   8: [
        //     'yx1t', 'equals', ASin(
        //       ['w2', 't_5', 'min2', 'w3', tann('t12', 'x1OnCb', 'line2')],
        //     ),
        //   ],
        //   9: ['yx1t', 'equals', ASin(['w2', 't_5', 'min2', 'w3', 'sX1OnC'])],
        //   10: ['yx1ToXt', 'equals', ASin(['w2', 't_5', 'min2', 'w3', 'sX1ToXOnC'])],
        //   11: ['yxt', 'equals', ASin(['w2', 't_5', 'min2', 'w3', 'sXOnC'])],
        //   12: ['yxt', 'equals', ASin(['w2', 't_5', 'min2', 'w3', 'sXOnC'])],
        //   13: [
        //     'yxt', 'equals',
        //     ASin([
        //       'w2',
        //       tann('t_5', 'constant', 'line1'), 'min2', 'w3',
        //       'sXOnC',
        //     ]),
        //   ],
        //   '13a': [
        //     'yxt', 'equals',
        //     ASin([
        //       'w2',
        //       tann('t_5', 'constant', 'line1'), 'min2',
        //       scale(frac(['w3', 'x_1'], 'c')),
        //     ]),
        //   ],
        //   14: [
        //     'yxt', 'equals',
        //     ASin([
        //       'w2',
        //       tann('t_5', 'constant', 'line1'), 'min2',
        //       scale(frac('w3', 'c')), ' ', 'x_1',
        //     ]),
        //   ],
        //   15: [
        //     'yxt', 'equals',
        //     ASin([
        //       'w2',
        //       tann('t_5', 'constant', 'line1'), 'min2',
        //       scale(frac(tann('w3', ['_2pi2', ' ', 'f_2'], 'line2'), 'c')), ' ', 'x_1',
        //     ]),
        //   ],
        //   16: [
        //     'yxt', 'equals',
        //     ASin([
        //       'w2',
        //       tann('t_5', 'constant', 'line1'), 'min2',
        //       scale(frac(['_2pi2', ' ', 'f_2'], 'c')), ' ', 'x_1',
        //     ]),
        //   ],
        //   lambdacf: ['lambda', 'equals2', { frac: ['c_1', 'v2', 'f'] }],
        //   clambdaf: {
        //     content: ['c_1', 'equals2', 'lambda', ' ', 'f'],
        //     translation: {
        //       c_1: { style: 'curved', direction: 'up', mag: 0.8 },
        //       lambda: { style: 'curved', direction: 'down', mag: 0.8 },
        //     },
        //   },
        //   17: [
        //     'yxt', 'equals',
        //     ASin([
        //       'w2',
        //       tann('t_5', 'constant', 'line1'), 'min2',
        //       scale(frac(['_2pi2', ' ', 'f_2'], ann('c', ['lambda', ' ', 'f'], 'line2'))), ' ', 'x_1',
        //     ]),
        //   ],
        //   18: {
        //     content: [
        //       'yxt', 'equals',
        //       ASin([
        //         'w2',
        //         tann('t_5', 'constant', 'line1'), 'min2',
        //         scale(frac(['_2pi2', ' ', 'f_2'], ['lambda', ' ', 'f'])), ' ', 'x_1',
        //       ]),
        //     ],
        //     translation: {
        //       lambda: { style: 'linear' },
        //     },
        //   },
        //   19: [
        //     'yxt', 'equals',
        //     ASin([
        //       'w2',
        //       tann('t_5', 'constant', 'line1'), 'min2',
        //       scale(frac(['_2pi2', ' ', stk('f_2', 1)], ['lambda', ' ', stk('f', 2)])), ' ', 'x_1',
        //     ]),
        //   ],
        //   20: [
        //     'yxt', 'equals',
        //     ASin([
        //       'w2',
        //       tann('t_5', 'constant', 'line1'), 'min2',
        //       scale(frac('_2pi2', 'lambda')), ' ', 'x_1',
        //     ]),
        //   ],
        //   21: [
        //     'yxt', 'equals',
        //     ASin([
        //       'w2',
        //       tann('t_5', 'constant', 'line1'), 'min2',
        //       scale(ann(frac('_2pi2', 'lambda'), 'k', 'brace')), ' ', 'x_1',
        //     ]),
        //   ],
        //   22: [
        //     'yxt', 'equals',
        //     ASin([
        //       'w2',
        //       tann('t_5', 'constant', 'line1'), 'min2', 'k', ' ', 'x_1',
        //     ]),
        //   ],
        //   23: [
        //     'yxt', 'equals',
        //     ASin(['w2', 't_5', 'min2', 'k', ' ', 'x_1']),
        //   ],
        },
        // formSeries: ['0'],
        position: [0, 1],
      },
    },
    // {
    //   name: 'sideEqn',
    //   method: 'equation',
    //   options: {
    //     // scale: 0.5,
    //     color: colorDef,
    //     elements: {
    //       id1: '    (1)',
    //       id2: '    (2)',
    //       v: { symbol: 'vinculum', lineWidth: 0.007 },
    //       comma1: ', ',
    //       comma2: ', ',
    //       min: ' \u2212 ',
    //       lb1: { symbol: 'bracket', side: 'left' },
    //       rb1: { symbol: 'bracket', side: 'right' },
    //       lb2: { symbol: 'bracket', side: 'left' },
    //       rb2: { symbol: 'bracket', side: 'right' },
    //       equals: '  =  ',
    //       lambda: '\u03bb',
    //     },
    //     phrases: {
    //       t1: { sub: ['t', '_1_1'] },
    //       x1: { sub: ['x', '_1_2'] },
    //       x0: { sub: ['x_1', '_0'] },
    //       ytx: ['y_1', b1(['x_3', 'comma1', 't_0'])],
    //       xOnC: { frac: ['x_2', 'v', 'c'] },
    //       sXOnC: scale('xOnC'),
    //       yxc: ['y_0', b2(['x0', 'comma2', 't_1', 'min', 'sXOnC'])],
    //     },
    //     formDefaults: { alignment: { xAlign: 'equals' } }, // { fixTo: 'equals' } },
    //     forms: {
    //       2: ['t1', 'equals', frac('x1', 'c')],
    //       '2id': ['t1', 'equals', frac('x1', 'c'), 'id1'],
    //       clambdaf: ['c', 'equals', 'lambda', ' ', 'f'],
    //       clambdafid: ['c', 'equals', 'lambda', ' ', 'f', 'id2'],
    //     },
    //     // position: sideEquationPosition,
    //   },
    //   mods: {
    //     scenarios: {
    //       center: { position: equationPosition, scale: 1 },
    //       side: { position: sideEquationPosition, scale: 0.7 },
    //     },
    //   },
    // },
    {
      name: 'nav',
      method: 'collections.slideNavigator',
      options: {
        prevButton: { position: [-1.5, 0.2] },
        nextButton: { position: [1.5, 0.2] },
        text: { font: { size: 0.1 }, position: [-1.5, 2.8], xAlign: 'left' },
        equation: 'eqn',
      },
    },
  ]);
}

addEquation();
