// @flow
import { addToObject } from './tools';
// export default function getCSSVariables(
//   id: string,
//   varNames: Array<string>,
//   prefix: string = '',
// ): Object {
//   const elem = document.getElementById('lesson__container_name');
//   const output = {};
//   if (elem) {
//     const style = window.getComputedStyle(elem);
//     if (style) {
//       varNames.forEach((varName) => {
//         const fullName = prefix + varName;
//         output[varName] = parseFloat(style.getPropertyValue(fullName));
//       });
//     }
//   }
//   return output;
// }

function searchObject(obj: Object, path: string, text: string) {
  let results = [];
  Object.keys(obj).forEach((key) => {
    const newPath = `${path}.${key}`;
    if (key.includes(text)) {
      results.push(newPath);
    } else if (typeof obj[key] === 'object') {
      const newResult = searchObject(obj[key], newPath, text);
      if (newResult) {
        results = results.concat(newResult);
      }
    } else if (typeof obj[key] === 'string') {
      if (obj[key].includes(text)) {
        results.push(newPath);
      }
    }
  });
  return results;
}

function toCamelCase(input: string, prefix) {
  const rePrefix = new RegExp(prefix, 'g');
  const reCamelCase1 = /-[a-z]/g;
  const reCamelCase2 = /_[a-z]/g;
  const repl = str => str[1].toUpperCase();
  const noPrefix = input.replace(rePrefix, '');
  const camelCase1 = noPrefix.replace(reCamelCase1, repl);
  const camelCase2 = camelCase1.replace(reCamelCase2, repl);
  const noDash = camelCase2.replace(/-/g, '');
  return noDash;
}

function getDefinedCSSVariables(
  idOrElement: string | HTMLElement,
  propertyNames: Array<string>,
  prefix: string = '',
  makeFlat: boolean = true,
  modifier: (string | number) => string | number = a => a,
) {
  const variables = {};
  let elem = idOrElement;
  if (typeof idOrElement === 'string') {
    elem = document.getElementById(idOrElement);
  }
  if (elem instanceof HTMLElement) {
    const style = window.getComputedStyle(elem);
    if (style) {
      propertyNames.forEach((propertyName) => {
        const value = style.getPropertyValue(propertyName).trim();
        const fValue = parseFloat(value);
        let valueToAdd = value;
        if (!Number.isNaN(fValue)) {
          valueToAdd = fValue;
        }
        valueToAdd = modifier(valueToAdd);
        if (makeFlat) {
          const shortName = toCamelCase(propertyName, prefix);
          variables[shortName] = valueToAdd;
        } else {
          const rePrefix = new RegExp(prefix, 'g');
          const noPrefix = propertyName.replace(rePrefix, '');
          addToObject(variables, noPrefix, valueToAdd, '-');
        }
      });
    }
  }
  return variables;
}

function getCSSVariables(
  idOrElement: string | HTMLElement,
  prefix: string = '',
  makeFlat: boolean = true,
): Object {
  const variables = {};
  let elem = idOrElement;
  if (typeof idOrElement === 'string') {
    elem = document.getElementById(idOrElement);
  }
  if (elem instanceof HTMLElement) {
    const style = window.getComputedStyle(elem);

    if (style) {
      const numProperties = style.length;
      for (let i = 0; i < numProperties; i += 1) {
        const propertyName = style[i];
        if (prefix === '' || propertyName.startsWith(prefix)) {
          const value = style.getPropertyValue(propertyName).trim();
          const fValue = parseFloat(value);
          let valueToAdd = value;
          if (!Number.isNaN(fValue)) {
            valueToAdd = fValue;
          }
          if (makeFlat) {
            const shortName = toCamelCase(propertyName, prefix);
            variables[shortName] = valueToAdd;
          } else {
            const rePrefix = new RegExp(prefix, 'g');
            const noPrefix = propertyName.replace(rePrefix, '');
            addToObject(variables, noPrefix, valueToAdd, '-');
          }
        }
      }
    }
  }
  return variables;
}

export { getCSSVariables, getDefinedCSSVariables, searchObject };
