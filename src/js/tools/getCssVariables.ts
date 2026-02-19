import { addToObject } from './tools';

function searchObject(obj: Record<string, any>, path: string, text: string): string[] {
  let results: string[] = [];
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

function toCamelCase(input: string, prefix: string) {
  const rePrefix = new RegExp(prefix, 'g');
  const reCamelCase1 = /-[a-z]/g;
  const reCamelCase2 = /_[a-z]/g;
  const repl = (str: string) => str[1].toUpperCase();
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
  modifier: (value: string | number) => string | number = a => a,
): Record<string, any> {
  const variables: Record<string, any> = {};
  let elem: string | HTMLElement | null = idOrElement;
  if (typeof idOrElement === 'string') {
    elem = document.getElementById(idOrElement);
  }
  if (elem instanceof HTMLElement) {
    const style = window.getComputedStyle(elem);
    if (style) {
      propertyNames.forEach((propertyName) => {
        let value = style.getPropertyValue(propertyName);
        if (value == null) {
          return;
        }
        value = value.trim();
        const fValue = parseFloat(value);
        let valueToAdd: string | number = value;
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
): Record<string, any> {
  const variables: Record<string, any> = {};
  let elem: string | HTMLElement | null = idOrElement;
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
          let value = style.getPropertyValue(propertyName);
          if (value != null) {
            value = value.trim();
            const fValue = parseFloat(value);
            let valueToAdd: string | number = value;
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
  }
  return variables;
}

export { getCSSVariables, getDefinedCSSVariables, searchObject };
