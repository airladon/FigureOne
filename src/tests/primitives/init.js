/* eslint-disable no-undef, no-var */
/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "getPosition",
  }] */
var { tools } = Fig;
const { Figure } = Fig;
const canvas = document.getElementById('figureOneContainer');
const width = canvas.offsetWidth;
const height = canvas.offsetHeight;
const pixelsPerUnit = 200;
const figureWidth = width / pixelsPerUnit;
const figureHeight = height / pixelsPerUnit;

const figure = new Figure({
  limits: [-figureWidth / 2, -figureHeight / 2, figureWidth, figureHeight],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

figure.add([
  {
    name: 'origin',
    make: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1],
    },
  },
  {
    name: 'grid',
    make: 'grid',
    options: {
      bounds: [-figureWidth / 2, -figureHeight / 2, figureWidth, figureHeight],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.9, 0.9, 0.9, 1],
      line: { width: 0.004 },
    },
  },
  {
    name: 'gridMajor',
    make: 'grid',
    options: {
      bounds: [-figureWidth / 2, -figureHeight / 2, figureWidth, figureHeight],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.004 },
    },
  },
]);

const xValues = tools.math.range(-figureWidth / 2 + 0.5, figureWidth / 2 - 0.5, 1);
const yValues = tools.math.range(figureHeight / 2 - 0.5, -figureHeight / 2 + 1, -1);

function getPosition(index) {
  return new tools.g2.Point(
    xValues[index % xValues.length],
    yValues[Math.floor(index / xValues.length)],
  );
}
