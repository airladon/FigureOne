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

  const brac = (content, id) => ({
    brac: { left: `lb${id}`, content, right: `rb${id}` },
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

  const frac = (numerator, symbol, denominator) => ({
    frac: {
      numerator, denominator, symbol, overhang: 0.02,
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
          lb3: { symbol: 'bracket', side: 'left' },
          rb3: { symbol: 'bracket', side: 'right' },
          lb4: { symbol: 'bracket', side: 'left' },
          rb4: { symbol: 'bracket', side: 'right' },
          lb5: { symbol: 'bracket', side: 'left' },
          rb5: { symbol: 'bracket', side: 'right' },
          equals: '  =  ',
          equals2: '  =  ',
          equals3: '  =  ',
          w1: '\u03c9',
          w2: '\u03c9',
          w3: '\u03c9',
          min1: ' \u2212 ',
          min2: ' \u2212 ',
          _2pi1: '2\u03c0',
          _2pi2: '2\u03c0',
          comma1: ', ',
          comma2: ', ',
          comma3: ', ',
          lambda: '\u03bb',
          vin1: { symbol: 'vinculum', lineWidth: 0.007 },
          vin2: { symbol: 'vinculum', lineWidth: 0.007 },
          brace: { symbol: 'brace', side: 'bottom', lineWidth: 0.005 },
          line1: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
          line2: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
          rx1: { text: 'x', color: color0 },
          rx2: { text: 'x', color: color0 },
          r01: { text: '0', color: color0 },
          r02: { text: '0', color: color0 },
          bx1: { text: 'x', color: color1 },
          bx2: { text: 'x', color: color1 },
          b11: { text: '1', color: color1 },
          b12: { text: '1', color: color1 },
          // _0_4: { color: color0 },
          // x_5: { color: color1 },
          // x_6: { color: color1 },
          // x_7: { color: color1 },
          // _1_5: { color: color1 },
          // _1_6: { color: color1 },
          // _1_7: { color: color1 },
          strike1: { symbol: 'strike', lineWidth: 0.007 },
          strike2: { symbol: 'strike', lineWidth: 0.007 },
          x0Box: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x1Box: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x2Box: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
        },
        phrases: {
          f1: { container: ['f_1', 0.08] },
          f2: { container: ['f_2', 0.08] },
          x11: { sub: ['x_1', '_1_1'] },
          x0y: { tBox: [{ sub: ['rx1', 'r01'] }, 'x0Box'] },
          x0y2: { tBox: [{ sub: ['rx2', 'r02'] }, 'x1Box'] },
          x1y: { tBox: [{ sub: ['bx1', 'b11'] }, 'x2Box'] },
          x1y2: { tBox: [{ sub: ['bx2', 'b12'] }, 'x1Box'] },
          x1OnV: frac(['x11'], 'vin1', 'v_1'),
          xOnV: frac(['x_2'], 'vin1', 'v_1'),
          x1OnVb: { scale: [frac('x1y2', 'vin1', 'v_1'), 0.8] },
          // x1OnVb: { scale: [frac('x11', 'vin1', 'v_1'), 0.8] },
          t11: { sub: ['t_1', '_1_2'] },
          t12: { sub: ['t_2', '_1_3'] },
          // yxt: ['y_1', brac(['x_y1', 'comma1', 't_y1'], 1)],
          yx0t: ['y_1', brac(['x0y', 'comma1', 't_y1'], 1)],
          yx0tt1: ['y_2', brac(['x0y2', 'comma2', 't_y2', 'min1', 't11'], 4)],
          yx1t: ['y_3', brac(['x1y', 'comma3', 't_y3'], 3)],
          yxt: ['y_3', brac(['x_1', 'comma3', 't_y3'], 3)],
          ft: ['f1', brac('t', 2)],
          ftt1: ['f2', brac(['t_3', 'min2', 't12'], 5)],
          ftt1Sub: ['f2', brac(['t_3', 'min2', {
            topComment: {
              content: 't12',
              comment: 'x1OnVb',
              symbol: 'line1',
              commentSpace: 0.2,
              inSize: false,
              scale: 0.8,
            },
          }], 5)],
          ftx1: ['f2', brac(['t_3', 'min2', 'x1OnVb'], 5)],
          ftx: ['f2', brac(['t_3', 'min2', 'xOnV'], 5)],
        },
        formDefaults: {
          alignment: { fixTo: 'equals' },
        },
        forms: {
          // title: ['yxt', 'equals', 'sin', brac(['k', 'x', 'min1', 'w1', 't'], 2)],
          title: {
            content: ['v', 'equals', 'lambda', ' ', 'f'],
            scale: 1.1,
          },
          t1: ['t11', 'equals', 'x1OnV'],
          yx0t: ['yx0t', 'equals', 'ft'],
          // yx0tAndyx1t: {
          //   content: {
          //     lines: {
          //       content: [
          //         { content: ['yx0t', 'equals', 'ft'], justify: 'equals' },
          //         { content: ['yx1t', 'equals2', 'yx0tt1'], justify: 'equals2' },
          //       ],
          //       justify: 'element',
          //       space: 0.1,
          //     },
          //   },
          //   alignment: { yAlign: -2.9 },
          // },
          yx0tAndft: {
            content: {
              lines: {
                content: [
                  { content: ['yx0t', 'equals', 'ft'], justify: 'equals' },
                  { content: ['yx1t', 'equals2', 'ftt1'], justify: 'equals2' },
                ],
                justify: 'element',
                space: 0.1,
              },
            },
            alignment: { yAlign: -2.9 },
          },
          yx1tTemp: {
            content: ['yx1t', 'equals2', 'ftt1'],
            alignment: { fixTo: 'equals2' },
          },
          yx1t: ['yx1t', 'equals', 'ftt1'],
          yx1tSub: ['yx1t', 'equals', 'ftt1Sub'],
          yx1tx1: ['yx1t', 'equals', 'ftx1'],
          yxtx: ['yxt', 'equals', 'ftx'],
        },
        // formSeries: ['0'],
        position: [0, 1],
      },
      mods: {
        scenarios: {
          title: { position: [-0.4, 1.9], scale: 1.3 },
          default: { position: [-0.1, 1.9], scale: 1.3 },
        },
      },
    },
    {
      name: 'sideEqn',
      method: 'equation',
      options: {
        elements: {
          equals: '  =  ',
          vin1: { symbol: 'vinculum', lineWidth: 0.007 },
        },
        phrases: {
          x11: { sub: ['x_1', '_1_1'] },
          t11: { sub: ['t_1', '_1_2'] },
        },
        forms: {
          t1: ['t11', 'equals', frac('x11', 'vin1', 'v_1')],
          t11: ['t11', 'equals', frac('x11', 'vin1', 'v_1'), '_      (1)'],
        },
        formDefaults: {
          alignment: { fixTo: 'equals' },
        },
      },
      mods: {
        scenarios: {
          side: { position: [2, 0.4], scale: 1 },
          default: { position: [-0.1, 1.9], scale: 1.3 },
        },
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
        prevButton: { position: [-2.75, 1.5], type: 'arrow', length: 0.4, width: 0.8 },
        nextButton: { position: [2.75, 1.5], type: 'arrow', length: 0.4, width: 0.8 },
        text: { font: { size: 0.15 }, position: [-2.4, 2.7], xAlign: 'left' },
        equation: 'eqn',
      },
    },
  ]);
}

addEquation();
