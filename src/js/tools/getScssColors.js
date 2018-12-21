// @flow
import { cssColorToArray } from './color';

// Gets the css color definitions from the project's scss files, converts them
// to rbga color arrays, and returns a dictionary of colors and values.
//
// Returns an dictionary of:
//    key: color name defined in css
//    value: rgba color array with each element between 0 and 1
const getScssColors = (styles: Object) => {
  const colors: Object = {};                 // Object of colors and values

  // styles is a dictionary of "color name from css": "color value" where
  // the color value might be one of:
  //   - hex string e.g. #ff00ff
  //   - rgba string e.g. rgba(255, 0, 255, 128)
  //   - css color name e.g. "blue"
  // Go through each color from the css, and convert it to the four number
  // rgba array
  Object.keys(styles).forEach((key) => {
    if (key.startsWith('color')) {
      const color: string = styles[key];
      const colorValue = cssColorToArray(color);
      if (colorValue) {
        let newKey = key.slice(5);
        if (newKey.length > 0) {
          newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);
        }
        colors[newKey] = colorValue;
      }
    }
  });
  return colors;
};

export default getScssColors;
