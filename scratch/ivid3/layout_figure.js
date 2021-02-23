
const figure = new Fig.Figure({
  limits: [-3, -1.5, 6, 3],
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.1 },
  dimColor: [0.7, 0.7, 0.7, 1],
});

// const color1 = [1, 0, 0, 1];
// const color2 = [0, 0.5, 1, 1];
// const color3 = [0, 0.6, 0, 1];
// const color4 = [0.6, 0, 0.6, 1];
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

// const colCos = [0, 0, 0.9, 1];
// const colSec = [0, 0.7, 1, 1];
// const colTan = [0, 0.4, 0, 1];
// const colCot = [0, 0.9, 0, 1];
// const colSin = [0.9, 0, 0, 1];
// const colCsc = [1, 0.4, 0, 1];
// const colRad = [1, 0, 1, 1];
// const colTheta = [0, 0.6, 0, 1];

// const colBlue1 = [21, 134, 189, 255].map(c => c / 255);
// const colBlue = [15, 100, 140, 255].map(c => c / 255);
// const colRed1 = [212, 28, 38, 255].map(c => c / 255);
// const colRed = [163, 21, 29, 255].map(c => c / 255);
// const colCyan1 = [49, 212, 179, 255].map(c => c / 255);
// const colCyan = [38, 163, 138, 255].map(c => c / 255);
// const colYellow1 = [212, 129, 28, 255].map(c => c / 255);
// const colYellow = [163, 99, 21, 255].map(c => c / 255);
// const colGreen1 = [31, 163, 64, 255].map(c => c / 255);
// const colGreen = [22, 115, 45, 255].map(c => c / 255);

// const colCos = colRed;
// const colSec = colRed1;
// const colSin = colGreen;
// const colCsc = colGreen1;
// const colTan = colYellow;
// const colCot = colYellow1;
// const colTheta = colBlue;
// const colRad = colCyan;

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
const colHyp = colRad;