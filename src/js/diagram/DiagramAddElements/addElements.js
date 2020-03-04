// @flow

import {
  DiagramElementCollection,
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
  objects: DiagramObjects,
  rootCollection: DiagramElementCollection,
  layout: Array<TypeAddElementObject>,
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
      polyLine: objects.polyLine.bind(objects),
      polyLineCorners: shapes.polyLineCorners.bind(shapes),
      polygon: shapes.polygon.bind(shapes),
      arrow: shapes.arrow.bind(shapes),
      fan: shapes.fan.bind(shapes),
      text: shapes.text.bind(shapes),
      textGL: shapes.textGL.bind(shapes),
      textHTML: shapes.htmlText.bind(shapes),
      htmlImage: shapes.htmlImage.bind(shapes),
      axes: shapes.axes.bind(shapes),
      radialLines: shapes.radialLines.bind(shapes),
      rectangle: shapes.rectangle.bind(shapes),
      grid: shapes.grid.bind(shapes),
      dashedLine: shapes.dashedLine.bind(shapes),
      parallelMarks: shapes.parallelMarks.bind(shapes),
      marks: shapes.marks.bind(shapes),
      box: shapes.box.bind(shapes),
      //
      line: objects.line.bind(objects),
      angle: objects.angle.bind(objects),
      //
      addEquation: equation.addEquation.bind(equation),
      addNavigator: equation.addNavigator.bind(equation),
    };
    if (method in methods) {
      return methods[method];
    }
    const diagram = {
      shapes,
      objects,
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
        throw new Error(`Diagram addElement ERROR  at index ${index} in collection ${rootCollection.name}: missing name property`);
      }
      if (methodPathToUse == null || methodPathToUse === '') {
        throw new Error(`Diagram addElement ERROR  at index ${index} in collection ${rootCollection.name}: missing method property`);
      }
      if (!(collectionPath instanceof DiagramElementCollection)) {
        throw new Error(`Diagram addElement ERROR at index ${index} in collection ${rootCollection.name}: missing or incorrect path property`);
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
      if (firstScenario != null && firstScenario in element.scenarios) {
        element.setScenario(firstScenario);
      }

      if (`_${nameToUse}` in rootCollection
          && (addElementsToUse != null && addElementsToUse !== {})
      ) {
        addElements(
          shapes,
          equation,
          objects,                                            // $FlowFixMe
          rootCollection[`_${nameToUse}`],
          addElementsToUse,
          addElementsKey,
        );
      }
    });
  }
}

export default addElements;
