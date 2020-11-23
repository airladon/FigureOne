// @flow
// eslint-disable-next-line import/no-cycle
import { cssColorToArray } from './color';
import { getDefinedCSSVariables } from './getCssVariables';

const baseColors = [
  'blue',
  'red',
  'yellow',
  'green',
  'cyan',
  'brown',
  'orange',
  'violet',
  'grey',
  'black',
  'white',
];

const shades = [
  'base',
  'lighter',
  'light',
  'dark',
  'darker',
  'higher',
  'high',
  'low',
  'lower',
];

const paletteColorNames = [];
baseColors.forEach((color) => {
  shades.forEach((shade) => {
    paletteColorNames.push(`--palette-${color}-${shade}`);
  });
});

const figureColorNames = [
  '--figure-background',
  '--figure-primary',
  '--figure-warning',
  '--figure-safe',
  '--figure-passive',
  '--figure-construction1',
  '--figure-construction2',
  '--figure-construction3',
  '--figure-construction4',
  '--figure-construction5',
  '--figure-construction6',
  '--figure-construction7',
  '--figure-construction8',
  '--figure-construction9',
  '--figure-disabled',
  '--figure-disabledDark',
  '--figure-disabledDarker',
  '--figure-disabledDarkest',
  '--figure-push',
  '--figure-action',
  '--figure-text-base',
  '--figure-text-warning',
  '--figure-text-plot',
  '--figure-text-keyword',
  '--figure-text-keyword2',
  '--figure-text-latin',
  '--figure-text-greek',
  '--figure-text-english',
  '--figure-text-note',
  '--figure-qr-background',
];

export default function getCSSColors(customColorNames: Array<string> = []): Object {
  let colors: Object = {};
  let paletteColors: Object = {};
  let figureColors: Object = {};
  const colorNames = customColorNames.map(name => `--colors-${name}`);

  const { body } = document;
  if (body) {
    colors = getDefinedCSSVariables(
      body, colorNames, '--colors-', false,
      // $FlowFixMe
      cssColorToArray,
    );

    paletteColors = getDefinedCSSVariables(
      body, paletteColorNames, '--palette-', false,
      // $FlowFixMe
      cssColorToArray,
    );

    figureColors = getDefinedCSSVariables(
      body, figureColorNames, '--figure-', false,
      // $FlowFixMe
      cssColorToArray,
    );
  }

  colors.palette = paletteColors;
  colors.figure = figureColors;
  return colors;
}

