// @flow

import colorNames from './colorNames';  // official css color names
// eslint-disable-next-line import/no-cycle
import getCSSColors from './getCssColors';
import { round } from './math';
// Function that converts any rgb or rgba string to an array of rgba numbers
// between 0 and 1
function RGBToArray(color: string): Array<number> {
  // Reduce the rgb(a) string to just numbers
  let colString: string = color;
  colString = colString.replace(/.*\(/i, '');
  colString = colString.replace(/\)/i, '');
  const strArray = colString.split(',');
  // Go through each rgb(a) value and normalize to 1.0
  const value: Array<number> = strArray.map((x, index) => {
    if (index < 3) {
      return parseInt(x, 10) / 255.0;
    }
    return parseFloat(x);
  });

  // If an alpha value isn't included, then include it with default value 1.0
  if (value.length === 3) {
    value.push(1);
  }
  return value;
}


// Function that converts any hex color string to an array of rgba numbers
// between 0 and 1 (where alpha is always 1)
function HexToArray(color: string): Array<number> {
  let colHex: string = color.slice(1);
  if (colHex.length < 6) {
    colHex =
      `${colHex[0]}${colHex[0]}${colHex[1]}${colHex[1]}${colHex[2]}${colHex[2]}`;
  }
  const col: Array<number> = [
    parseInt(colHex.slice(0, 2), 16) / 255.0,
    parseInt(colHex.slice(2, 4), 16) / 255.0,
    parseInt(colHex.slice(4, 6), 16) / 255.0,
    1,
  ];
  return col;
}

function cssColorToArray(cssColorString: string): Array<number> | null {
  const oNames = colorNames();               // Official css color names
  let color = cssColorString.slice(0);

  // If the color is an official name, then replace it with the hex rgb
  // equivalent
  if (color in oNames) {
    color = oNames[color];
  }

  // colorValue is the rgba array of colors between 0 and 1
  let colorValue: Array<number> = [];

  // If color string starts with 'rgb' (and therefore also 'rgba')
  if (color.toLowerCase().startsWith('rgb')) {
    colorValue = RGBToArray(color);

  // If color string starts with '#' it is hex
  } else if (color.startsWith('#')) {
    colorValue = HexToArray(color);
  }

  // If the color value array is defined, then add it to the final
  // dictionary
  if (colorValue.length > 0) {
    return colorValue;
  }
  return null;
}

function colorArrayToRGBA(color: TypeColor) {
  return `rgba(${
    Math.floor(color[0] * 255)},${
    Math.floor(color[1] * 255)},${
    Math.floor(color[2] * 255)},${
    color[3]})`;
}

function colorArrayToRGB(color: TypeColor) {
  return `rgb(${
    Math.floor(color[0] * 255)},${
    Math.floor(color[1] * 255)},${
    Math.floor(color[2] * 255)})`;
}

function areColorsSame(color1: Array<number>, color2: Array<number>, precision: number = 5) {
  if (color1.length !== color2.length) {
    return false;
  }
  for (let i = 0; i < color1.length; i += 1) {
    if (round(color1[i], precision) !== round(color2[i], precision)) {
      return false;
    }
  }
  return true;
}

function areColorsWithinDelta(color1: Array<number>, color2: Array<number>, delta: number = 0.001) {
  if (color1.length !== color2.length) {
    return false;
  }
  for (let i = 0; i < color1.length; i += 1) {
    const dC = Math.abs(color1[i] - color2[i]);
    if (dC > delta) {
      return false;
    }
  }
  return true;
}

export {
  RGBToArray, HexToArray, cssColorToArray, colorArrayToRGB,
  colorArrayToRGBA, getCSSColors, areColorsSame, areColorsWithinDelta,
};
