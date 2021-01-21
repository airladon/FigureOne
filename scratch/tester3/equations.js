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

  const brac = (content, id, overhang = 0.05) => ({
    brac: { left: `lb${id}`, content, right: `rb${id}`, overhang },
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

  const hide = content => ({
    container: { content, inSize: false },
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
          sin_1: { style: 'normal' },
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
          lb7: { symbol: 'squareBracket', side: 'left', lineWidth: 0.008 },
          rb7: { symbol: 'squareBracket', side: 'right', lineWidth: 0.008 },
          equals: '  =  ',
          equals2: '  =  ',
          equals3: '  =  ',
          w1: '\u03c9',
          w2: '\u03c9',
          w3: '\u03c9',
          min1: ' \u2212 ',
          min2: ' \u2212 ',
          min3: ' \u2212 ',
          _2pi1: '2\u03c0',
          _2pi2: '2\u03c0',
          comma1: ', ',
          comma2: ', ',
          comma3: ', ',
          lambda: '\u03bb',
          vin1: { symbol: 'vinculum', lineWidth: 0.007 },
          vin2: { symbol: 'vinculum', lineWidth: 0.007 },
          vin3: { symbol: 'vinculum', lineWidth: 0.007 },
          brace: { symbol: 'brace', side: 'bottom', lineWidth: 0.005 },
          bBrace: { symbol: 'brace', side: 'bottom', lineWidth: 0.008, color: color1 },
          line1: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
          line2: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
          x_1: 'x',
          x_2: 'x',
          f_1: { color: color0 },
          f_2: { color: color0 },
          f_3: { color: color0 },
          rx1: { text: 'x', color: color0 },
          rx2: { text: 'x', color: color0 },
          rx3: { text: 'x', color: color0 },
          rx4: { text: 'x', color: color0 },
          r01: { text: '0', color: color0 },
          r02: { text: '0', color: color0 },
          r03: { text: '0', color: color0 },
          r04: { text: '0', color: color0 },
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
          x0Box1: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x0Box2: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x0Box3: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x1Box1: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x1Box2: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
        },
        phrases: {
          x0y: { tBox: [{ sub: ['rx1', 'r01'] }, 'x0Box1'] },
          x0y2: { sub: ['rx2', 'r02'] },
          x0y3: { sub: ['rx3', 'r03'] },
          x0y4: { sub: ['rx4', 'r04'] },
          f1: { tBox: [{ container: [{ sub: ['f_1', 'x0y3'] }, 0.08] }, 'x0Box2'] },
          f2: { tBox: [{ container: [{ sub: ['f_2', 'x0y2'] }, 0.08] }, 'x0Box3'] },
          f3: { container: [{ sub: ['f_3', 'x0y4'] }, 0.08] },
          x11: { sub: ['x_1', '_1_1'] },
          x1y: { tBox: [{ sub: ['bx1', 'b11'] }, 'x1Box2'] },
          x1y2: { tBox: [{ sub: ['bx2', 'b12'] }, 'x1Box1'] },
          x1y2H: { tBox: [{ sub: [[hide('x_2'), 'bx2'], 'b12'] }, 'x1Box1'] },
          x1OnV: frac(['x1y2'], 'vin1', 'v_1'),
          x1OnVH: frac([hide('x_2'), 'x11'], 'vin1', 'v_1'),
          x1OnVb: { scale: [frac('x1y2', 'vin1', 'v_1'), 0.8] },
          x1OnVbH: { scale: [frac('x1y2H', 'vin1', 'v_1'), 0.8] },
          xOnV: frac(['x_2'], 'vin1', 'v_1'),
          xOnV1: frac(['x_3'], 'vin2', 'v_2'),
          xOnV2: frac(['x_4'], 'vin3', 'v_3'),

          // x1OnVb: { scale: [frac('x11', 'vin1', 'v_1'), 0.8] },
          t11: { sub: ['t_1', '_1_2'] },
          t12: { sub: ['t_2', '_1_3'] },
          // yxt: ['y_1', brac(['x_y1', 'comma1', 't_y1'], 1)],
          yx0t: ['y_1', brac(['x0y', 'comma1', 't_y1'], 1)],
          yx0tt1: ['y_2', brac(['x0y2', 'comma2', 't_y2', 'min1', 't11'], 4)],
          yx1t: ['y_3', brac(['x1y', 'comma3', 't_y3'], 3)],
          yx1tH: ['y_3', brac([hide('x_1'), 'x1y', 'comma3', 't_y3'], 3)],
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
          ftx1H: ['f2', brac(['t_3', 'min2', 'x1OnVbH'], 5)],
          ftx: ['f2', brac(['t_3', 'min2', 'xOnV'], 5)],
          ftx2: ['f1', brac('t_1', 1)],
          ftx3: ['f3', brac(['t_2', 'min1', 'xOnV1'], 6)],
          sinwt: ['sin', brac(['w1', 't_4'], 2)],
          sinwtXOnV: ['sin_1', brac(['w2', brac(['t_5', 'min3', 'xOnV2'], 7)], 4)],
          ftxBotCom: ['f2', brac({
            bar: {
              content: ['t_3', 'min2', 'xOnV'],
              symbol: 'bBrace',
              inSize: false,
              side: 'bottom',
              space: 0.08,
            },
          }, 5)],
          // ftx2Sine: [
          //   {
          //     topComment: ['f1', ]
          //   }
          // ]
        },
        formDefaults: {
          alignment: { fixTo: 'equals' },
        },
        forms: {
          // //////////////////////////////////////////////////////////
          title: {
            content: ['v', 'equals', 'lambda', ' ', 'f'],
            scale: 1.1,
          },
          // //////////////////////////////////////////////////////////
          t1: ['t11', 'equals', 'x1OnV'],
          // //////////////////////////////////////////////////////////
          yx0t: ['yx0t', 'equals', 'ft'],
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
          yx1tx1HiddenX: ['yx1tH', 'equals', 'ftx1H'],
          yxtx: ['yxt', 'equals', 'ftx'],
          // //////////////////////////////////////////////////////////
          yxtxAndSine: {
            lines: {
              content: [
                { content: ['yxt', 'equals', 'ftx'], justify: 'equals' },
                { content: ['ftx2', 'equals2', 'sinwt'], justify: 'equals2' },
              ],
              justify: 'element',
              baselineSpace: 0.5,
            },
          },
          yxtxAndSineBotCom: {
            lines: {
              content: [
                { content: ['yxt', 'equals', 'ftxBotCom'], justify: 'equals' },
                { content: ['ftx2', 'equals2', 'sinwt'], justify: 'equals2' },
              ],
              justify: 'element',
              baselineSpace: 0.5,
            },
          },
          yxtxAndSineBotComXOnV: {
            lines: {
              content: [
                { content: ['yxt', 'equals', 'ftxBotCom'], justify: 'equals' },
                { content: ['ftx2', 'equals2', 'sinwt'], justify: 'equals2' },
                { content: ['ftx3', 'equals3', 'sinwtXOnV'], justify: 'equals3' },
              ],
              justify: 'element',
              baselineSpace: 0.5,
            },
          },
          yxtxAndSineXOnV: {
            lines: {
              content: [
                { content: ['yxt', 'equals', 'ftx'], justify: 'equals' },
                { content: ['ftx3', 'equals3', 'sinwtXOnV'], justify: 'equals3' },
              ],
              justify: 'element',
              baselineSpace: 0.6,
            },
          },
          yxtxSine: ['yxt', 'equals', 'sinwtXOnV'],
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
          x1Box: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x_1: { color: color1 },
          _1_1: { color: color1 },
        },
        phrases: {
          x11: { tBox: [{ sub: ['x_1', '_1_1'] }, 'x1Box'] },
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
