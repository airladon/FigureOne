// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure({
color: Fig.tools.color.HexToArray('#212529'),
backgroundColor: Fig.tools.color.HexToArray('#f6f7f7')
});

const eqn = figure.add(
{
make: 'collections.equation',
elements: {
left_T1: { symbol: 'bracket', side: 'left' },
right_T5: { symbol: 'bracket', side: 'right' },
brace_0: { symbol: 'brace', side: 'top', color: [0.4, 0.4, 0.4, 1] },
brace_1: { symbol: 'brace', side: 'top', color: [0.4, 0.4, 0.4, 1] },
brace_2: { symbol: 'brace', side: 'top', color: [0.4, 0.4, 0.4, 1] },
},
scale: 2,
formDefaults: { alignment: { xAlign: 'center' } },
forms: {
0: [{ brac: ['left_T1', ['3_T2', '_ + _T3', '5_T4'], 'right_T5',] }, '_ \u00D7 _T6', '7_T7', '_ \u2212 _T8', '15_T9'],
1: [{ topComment: [[{ brac: ['left_T1', ['3_T2', '_ + _T3', '5_T4'], 'right_T5',] }], '', 'brace_0'] }, '_ \u00D7 _T6', '7_T7', '_ \u2212 _T8', '15_T9'],
2: [{ topComment: [[{ brac: ['left_T1', ['3_T2', '_ + _T3', '5_T4'], 'right_T5',] }], '8_T10', 'brace_0'] }, '_ \u00D7 _T6', '7_T7', '_ \u2212 _T8', '15_T9'],
3: ['8_T10', '_ \u00D7 _T6', '7_T7', '_ \u2212 _T8', '15_T9'],
4: [{ topComment: [['8_T10', '_ \u00D7 _T6', '7_T7'], '', 'brace_1'] }, '_ \u2212 _T8', '15_T9'],
5: [{ topComment: [['8_T10', '_ \u00D7 _T6', '7_T7'], '56_T11', 'brace_1'] }, '_ \u2212 _T8', '15_T9'],
6: ['56_T11', '_ \u2212 _T8', '15_T9'],
7: [{ topComment: [['56_T11', '_ \u2212 _T8', '15_T9'], '', 'brace_2'] }],
8: [{ topComment: [['56_T11', '_ \u2212 _T8', '15_T9'], '41_T12', 'brace_2'] }],
9: ['41_T12'],
},
position: [0.1, -0.1],
},
);


const prev = figure.add({
make: 'collections.button',
label: '< Previous',
position: [-0.5, -0.8],
height: 0.34,
width: 1.3,
colorFill: Fig.tools.color.HexToArray('#dddedf'),
colorLabel: Fig.tools.color.HexToArray('#0020b0'),
colorLine: [0,0,0,0],
corner: {radius: 10, sides: 4},
});
prev.notifications.add('touch', () => eqn.prevForm({ animate: 'move' }));

const next = figure.add({
make: 'collections.button',
label: 'Next >',
position: [0.75, -0.8],
height: 0.34,
width: 1,
colorFill: Fig.tools.color.HexToArray('#0020b0'),
colorLabel: Fig.tools.color.HexToArray('#fff'),
colorLine: [0,0,0,0],
corner: {radius: 10, sides: 4},
});
next.notifications.add('touch', () => eqn.animations.new().nextForm(1).start());
