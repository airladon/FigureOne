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

const paletteColorNames: string[] = [];
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

export default function getCSSColors(customColorNames: Array<string> = []): Record<string, any> {
  let colors: Record<string, any> = {};
  let paletteColors: Record<string, any> = {};
  let figureColors: Record<string, any> = {};
  const colorNames = customColorNames.map(name => `--colors-${name}`);

  const { body } = document;
  if (body) {
    colors = getDefinedCSSVariables(
      body, colorNames, '--colors-', false,
      cssColorToArray as unknown as (value: string | number) => string | number,
    );

    paletteColors = getDefinedCSSVariables(
      body, paletteColorNames, '--palette-', false,
      cssColorToArray as unknown as (value: string | number) => string | number,
    );

    figureColors = getDefinedCSSVariables(
      body, figureColorNames, '--figure-', false,
      cssColorToArray as unknown as (value: string | number) => string | number,
    );
  }

  colors.palette = paletteColors;
  colors.figure = figureColors;
  return colors;
}
