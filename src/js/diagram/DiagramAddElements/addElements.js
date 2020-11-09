// @flow

import {
  DiagramElementCollection, DiagramElement,
} from '../Element';
import DiagramPrimitives from '../DiagramPrimitives/DiagramPrimitives';
import DiagramObjects from '../DiagramObjects/DiagramObjects';
import DiagramEquation from '../DiagramEquation/DiagramEquation';

export type TypeAddElementObject = {
  path?: string,
  name?: string,
  method?: string,
  options?: {},
  addElements?: Array<TypeAddElementObject>,
  mods?: {},
  scenario?: string,
};

function addElements(
  shapes: DiagramPrimitives,
  equation: DiagramEquation,
  advanced: DiagramObjects,
  rootCollection: DiagramElementCollection,
  layout: Array<TypeAddElementObject | DiagramElement>,
  addElementsKey: string,
) {
  const getPath = (e: {}, remainingPath: Array<string>) => {
    if (!(remainingPath[0] in e)) {
      return null;
    }
    if (remainingPath.length === 1) {          // $FlowFixMe
      return e[remainingPath[0]];
    }                                          // $FlowFixMe
    return getPath(e[remainingPath[0]], remainingPath.slice(1));
  };

  const getMethod = (method: string) => {
    const methods = {
      collection: shapes.collection.bind(shapes),
      opolyline: advanced.polyline.bind(advanced),
      polyline: shapes.polyline.bind(shapes),
      polygon: shapes.polygon.bind(shapes),
      rectangle: shapes.rectangle.bind(shapes),
      triangle: shapes.triangle.bind(shapes),
      generic: shapes.generic.bind(shapes),
      grid: shapes.grid.bind(shapes),
      arrow: shapes.arrow.bind(shapes),
      line: shapes.line.bind(shapes),
      //
      text: shapes.text.bind(shapes),
      textLine: shapes.textLine.bind(shapes),
      textLines: shapes.textLines.bind(shapes),
      //
      fan: shapes.fan.bind(shapes),
      textGL: shapes.textGL.bind(shapes),
      textHTML: shapes.htmlText.bind(shapes),
      htmlImage: shapes.htmlImage.bind(shapes),
      axes: shapes.axes.bind(shapes),
      radialLines: shapes.radialLines.bind(shapes),
      // rectangle: shapes.rectangle.bind(shapes),
      dashedLine: shapes.dashedLine.bind(shapes),
      parallelMarks: shapes.parallelMarks.bind(shapes),
      marks: shapes.marks.bind(shapes),
      box: shapes.box.bind(shapes),
      //
      oline: advanced.line.bind(advanced),
      angle: advanced.angle.bind(advanced),
      //
      addEquation: equation.addEquation.bind(equation),
      equation: equation.equation.bind(equation),
      addNavigator: equation.addNavigator.bind(equation),
    };
    if (method in methods) {
      return methods[method];
    }
    if (method === 'text.line') {
      return shapes.textLine.bind(shapes);
    }
    if (method === 'text.lines') {
      return shapes.textLines.bind(shapes);
    }
    const diagram = {
      shapes,
      advanced,
      equation,
    };
    const splitMethod = method.split('.');
    let methodToUse = getPath(diagram, splitMethod);
    if (methodToUse == null) {
      // throw new Error(`Diagram addElements ERROR: Cannot find method ${method}`);
      return null;
    }
    methodToUse = methodToUse.bind(getPath(diagram, splitMethod.slice(0, -1)));
    return methodToUse;
  };

  if (Array.isArray(layout)
  ) {
    layout.forEach((elementDefinition, index) => {
      // Extract the parameters from the layout object
      if (elementDefinition == null) {
        throw Error(`Add elements index ${index} does not exist in layout`);
      }
      const nameToUse = elementDefinition.name;
      const pathToUse = elementDefinition.path;
      const optionsToUse = elementDefinition.options;
      const addElementsToUse = elementDefinition[addElementsKey];
      const methodPathToUse = elementDefinition.method;
      const elementModsToUse = elementDefinition.mods;
      const firstScenario = elementDefinition.scenario;

      let collectionPath;
      if (pathToUse == null || pathToUse === '') {
        collectionPath = rootCollection;
      } else {
        // const path = pathToUse.split('/');
        // collectionPath = getPath(rootCollection, path);
        collectionPath = rootCollection.getElement(pathToUse);
      }
      // Check for critical errors
      if (nameToUse == null || nameToUse === '') {
        // $FlowFixMe
        throw new Error(`Diagram addElement ERROR  at index ${index} in collection ${rootCollection.name}: missing name property in ${elementDefinition}`);
      }
      if (methodPathToUse == null || methodPathToUse === '') {
        // $FlowFixMe
        throw new Error(`Diagram addElement ERROR  at index ${index} in collection ${rootCollection.name}: missing method property in ${elementDefinition}`);
      }
      if (!(collectionPath instanceof DiagramElementCollection)) {
        // $FlowFixMe
        throw new Error(`Diagram addElement ERROR at index ${index} in collection ${rootCollection.name}: missing or incorrect path property in ${elementDefinition}`);
      }

      const methodPath = methodPathToUse.split('/');

      const method = getMethod(methodPathToUse);

      if (typeof method !== 'function') {
        return;
      }

      if (typeof method !== 'function') {
        throw new Error(`Layout addElement at index ${index} in collection ${rootCollection.name}: incorrect method property`);
      }

      let element;
      if (methodPath.slice(-1)[0].startsWith('add')) {
        element = method(collectionPath, nameToUse, optionsToUse);
        if (element == null) {
          return;
        }
      } else {
        if (Array.isArray(optionsToUse)) {
          element = method(...optionsToUse);
        } else {
          element = method(optionsToUse);
        }
        if (element == null) {
          return;
        }
        if (collectionPath instanceof DiagramElementCollection) {
          collectionPath.add(nameToUse, element);
        }
      }

      if (elementModsToUse != null && elementModsToUse !== {}) {
        element.setProperties(elementModsToUse);
      }
      // element.setProperties(elementDefinition, [
      //   'mods', 'name', 'method', 'scenario', 'addElementsKey', 'options', 'path',
      // ]);
      if (firstScenario != null && firstScenario in element.scenarios) {
        element.setScenario(firstScenario);
      }

      if (`_${nameToUse}` in rootCollection
          && (addElementsToUse != null && addElementsToUse !== {})
      ) {
        addElements(
          shapes,
          equation,
          advanced,                                            // $FlowFixMe
          rootCollection[`_${nameToUse}`],
          addElementsToUse,
          addElementsKey,
        );
      }
    });
  }
}

export default addElements;
