
const figure = new Fig.Figure({
  limits: [-3, -1.5, 6, 3],
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.1 },
  dimColor: [0.5, 0.5, 0.5, 1],
});

const thick = 0.012;
const thin = 0.005;

const colGrey = [0.6, 0.6, 0.6, 1];
const colDarkGrey = [0.3, 0.3, 0.3, 1];
const colText = [0.3, 0.3, 0.3, 1];
const colDim = [0.7, 0.7, 0.7, 1];

const color1 = [0, 162, 255, 255].map(c => c / 255);
const color2 = [238, 34, 12, 255].map(c => c / 255);
const color3 = [29, 177, 0, 255].map(c => c / 255);
const color4 = [0, 77, 128, 255].map(c => c / 255);
const color5 = [242, 114, 0, 255].map(c => c / 255);
const color6 = [1, 113, 0, 255].map(c => c / 255);

const colCos = color1;
const colSin = color2;
const colTan = color3;

const colTheta = color2;
const colRad = [0.1, 0, 0.7, 1];
const colOne = [0.3, 0.3, 0.3, 1];

// const colSec = [0, 0.6, 0.6, 1];
const colSec = color4;
const colCot = color6;
const colCsc = color5;

const colOpp = colSin;
const colAdj = colCos;
const colHyp = color3;

const summary = (name, position, text, modifiers = {}) => ({
  name,
  method: 'primitives.textLines',
  options: {
    text,
    modifiers,
    position,
    fixColor: true,
    font: { size: 0.18, color: colText },
    xAlign: 'center',
  },
  mods: {
    isTouchable: true,
  },
});

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

const leftText = (name, text, modifiers = {}, position, size = 0.2, scenarios = {}) => ({
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
    scenarios,
  //   scenarios: {
  //     top: { position: [-2, 1], scale: 1 },
  //     default: { position: [-2, 0], scale: 1 },
  //   },
  },
});
