/* global Fig, figure, thick, thin, colGrey, colDarkGrey, colText, colDim
   colSin, colCos, colTan, colCot, colCsc, colSec colOpp, colAdj, colHyp,
  colTheta, colThetaComp, colRad, colOne, summary, centerText, leftText */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

figure = new Fig.Figure({
  limits: [-3, -1.5, 6, 3],
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.1 },
  dimColor: [0.5, 0.5, 0.5, 1],
});

thick = 0.012;
thin = 0.005;

colGrey = [0.6, 0.6, 0.6, 1];
colDarkGrey = [0.3, 0.3, 0.3, 1];
colText = [0.3, 0.3, 0.3, 1];
colDim = [0.7, 0.7, 0.7, 1];

const color1 = [0, 162, 255, 255].map(c => c / 255);
const color2 = [238, 34, 12, 255].map(c => c / 255);
const color3 = [29, 177, 0, 255].map(c => c / 255);
const color4 = [0, 77, 128, 255].map(c => c / 255);
const color5 = [242, 114, 0, 255].map(c => c / 255);
const color6 = [1, 113, 0, 255].map(c => c / 255);

colCos = color1;
colSin = color2;
colTan = color3;

colTheta = color2;
colRad = [0.1, 0, 0.7, 1];
colOne = [0.3, 0.3, 0.3, 1];

colSec = color4;
colCot = color6;
colCsc = color5;

colOpp = colSin;
colAdj = colCos;
colHyp = color3;

summary = (name, position, text, modifiers = {}) => ({
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

centerText = (name, text, modifiers = {}, position = [0, 0], size = 0.2) => ({
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

leftText = (name, text, modifiers = {}, position, size = 0.2, scenarios = {}) => ({
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
  },
});
