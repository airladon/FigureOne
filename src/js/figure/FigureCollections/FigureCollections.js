// @flow
import WebGLInstance from '../webgl/webgl';
import {
  Transform, Point,
} from '../../tools/g2';

import { joinObjects } from '../../tools/tools';
// import {
//   FigureElementCollection,
// } from '../Element';
import DrawContext2D from '../DrawContext2D';
// import EquationNavigator from './EquationNavigator';
// eslint-disable-next-line import/no-cycle
import CollectionsLine from './Line';
// eslint-disable-next-line import/no-cycle
import CollectionsAngle from './Angle';
// eslint-disable-next-line import/no-cycle
import CollectionsPolyline from './PolyLine';
// eslint-disable-next-line import/no-cycle
import CollectionsAxis from './Axis';
// eslint-disable-next-line import/no-cycle
import CollectionsTrace from './Trace';
import type { COL_Line } from './Line';
import type { COL_Angle } from './Angle';
import type { TypeLabelOptions } from './EquationLabel';
import type { COL_Polyline } from './PolyLine';
import type { COL_Axis } from './Axis';
import type { COL_Trace } from './Trace';
import type { COL_Plot } from './Plot';
import type { COL_Rectangle } from './Rectangle';
// eslint-disable-next-line import/no-cycle
import EquationLabel from './EquationLabel';
// eslint-disable-next-line import/no-cycle
import CollectionsPlot from './Plot';
// eslint-disable-next-line import/no-cycle
import CollectionsPlotLegend from './Legend';
// eslint-disable-next-line import/no-cycle
import CollectionsRectangle from './Rectangle';
import type { EQN_Equation } from '../Equation/Equation';
// eslint-disable-next-line import/no-cycle
import { Equation } from '../Equation/Equation';
import type { OBJ_Collection } from '../FigurePrimitives/FigurePrimitiveTypes';
// import EqnNavigator from './EqnNavigator';
// import type { TypeNavigatorOptions } from './EqnNavigator';
// eslint-disable-next-line import/no-cycle
import SlideNavigator from './SlideNavigator';
import type { COL_SlideNavigator } from './SlideNavigator';
// eslint-disable-next-line import/no-cycle
import {
  FigureElementCollection,
} from '../Element';
import type { TypeColor } from '../../tools/types';
// import { Equation } from '../Equation/Equation';

/**
 * Built in figure collections.
 *
 * Provides advanced primitives the specific methods, animations and interactivity.
 */
export default class FigureCollections {
  webgl: Array<WebGLInstance>;
  draw2D: DrawContext2D;
  primitives: Object;
  // equationFromFig: Object;
  isTouchDevice: boolean;
  animateNextFrame: void => void;

  /**
    * @hideconstructor
    */
  constructor(
    primitives: Object,
    // equation: Object,
    isTouchDevice: boolean,
    animateNextFrame: () => void,
  ) {
    this.webgl = primitives.webgl;
    this.draw2D = primitives.draw2D;
    this.primitives = primitives;
    this.isTouchDevice = isTouchDevice;
    this.animateNextFrame = animateNextFrame;
    // this.equationFromFig = equation;
  }

  /**
   * Create a {@link FigureElementCollection}.
   */
  collection(
    transformOrPointOrOptions: Transform | Point | OBJ_Collection = {},
    ...moreOptions: Array<OBJ_Collection>
  ) {
    const defaultOptions = {
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
      border: 'children',
      touchBorder: 'children',
      color: this.primitives.defaultColor,
      parent: null,
      // scene: this.primitives.scene,
    };
    let optionsToUse;
    if (transformOrPointOrOptions instanceof Point) {
      defaultOptions.transform.updateTranslation(transformOrPointOrOptions);
      optionsToUse = joinObjects({}, defaultOptions, ...moreOptions);
    } else if (transformOrPointOrOptions instanceof Transform) {
      defaultOptions.transform = transformOrPointOrOptions._dup();
      optionsToUse = joinObjects({}, defaultOptions, ...moreOptions);
    } else {
      optionsToUse = joinObjects({}, defaultOptions, transformOrPointOrOptions, ...moreOptions);
    }
    const element = new FigureElementCollection(optionsToUse);
    element.timeKeeper = this.primitives.timeKeeper;
    element.dimColor = this.primitives.defaultDimColor.slice();
    if (
      optionsToUse.pulse != null
      && typeof element.pulseDefault !== 'function'
      && typeof element.pulseDefault !== 'string'
    ) {
      element.pulseDefault.scale = optionsToUse.pulse;
    }

    element.collections = this;
    return element;
  }

  /**
   * Create a {@link CollectionsLine}.
   */
  line(...options: Array<COL_Line>) {
    const optionsToUse = joinObjects({}, { timeKeeper: this.primitives.timeKeeper }, ...options);
    return new CollectionsLine(
      this, this.isTouchDevice,
      optionsToUse,
    );
  }

  /**
   * Create a {@link CollectionsAngle}.
   */
  angle(...options: Array<COL_Angle>) {
    const optionsToUse = joinObjects({}, { timeKeeper: this.primitives.timeKeeper }, ...options);
    return new CollectionsAngle(
      this, this.isTouchDevice, this.animateNextFrame,
      optionsToUse,
    );
  }

  label(...options: Array<TypeLabelOptions>) {
    // const optionsToUse = Object.assign({}, ...options);
    const optionsToUse = joinObjects({}, { timeKeeper: this.primitives.timeKeeper }, ...options);
    return new EquationLabel(
      this, optionsToUse,
    );
  }

  /**
   * Create a {@link CollectionsPolyline}.
   */
  polyline(...options: Array<COL_Polyline>) {
    const optionsToUse = joinObjects({}, { timeKeeper: this.primitives.timeKeeper }, ...options);
    return new CollectionsPolyline(
      this,
      this.isTouchDevice, this.animateNextFrame,
      optionsToUse,
    );
  }

  /**
   * Create a {@link CollectionsRectangle}.
   */
  rectangle(...options: Array<COL_Rectangle>) {
    return new CollectionsRectangle(
      this, joinObjects({}, { timeKeeper: this.primitives.timeKeeper }, ...options),
    );
  }

  /**
   * Create a {@link CollectionSlideNavigator}
   */
  slideNavigator(...options: Array<COL_SlideNavigator>) {
    return new SlideNavigator(
      this, joinObjects({}, { timeKeeper: this.primitives.timeKeeper }, ...options),
    );
  }

  /**
   * Create a {@link CollectionsAixs}.
   */
  axis(...options: Array<COL_Axis>) {
    return new CollectionsAxis(
      this, joinObjects({}, { timeKeeper: this.primitives.timeKeeper }, ...options),
    );
  }

  /**
   * Create a {@link CollectionsTrace}.
   */
  trace(...options: Array<COL_Trace>) {
    return new CollectionsTrace(
      this, joinObjects({}, { timeKeeper: this.primitives.timeKeeper }, ...options),
    );
  }

  /**
   * Create a {@link CollectionsPlot}.
   */
  plot(...options: Array<COL_Plot>) {
    return new CollectionsPlot(
      this, joinObjects({}, { timeKeeper: this.primitives.timeKeeper }, ...options),
    );
  }

  /**
   * Create a {@link CollectionsLegend}.
   */
  plotLegend(...options: Array<COL_Plot>) {
    return new CollectionsPlotLegend(
      this, joinObjects({}, { timeKeeper: this.primitives.timeKeeper }, ...options),
    );
  }

  /**
   * Create a {@link Equation}.
   */
  equation(
    options: EQN_Equation,
  ) {
    const equation = new Equation(this.primitives, options);
    return equation;
  }

  addEquation(
    parent: FigureElementCollection,
    name: string,
    options: EQN_Equation = {},
  ) {
    // $FlowFixMe
    const equation = new Equation(this.primitives, options);
    parent.add(name, equation);
    return equation;
  }

  // addNavigator(
  //   parent: FigureElementCollection,
  //   name: string,
  //   options: TypeNavigatorOptions,
  // ) {
  //   let navNameToUse = name;
  //   const optionsToUse = joinObjects({}, options);
  //   if (optionsToUse.equation == null) {                // $FlowFixMe
  //     const equation = this.addEquation(parent, `${name}Eqn`, options);
  //     optionsToUse.equation = equation;
  //     navNameToUse = `${name}Nav`;
  //   } else if (!(optionsToUse.equation instanceof Equation)) {
  //     // let methodPathToUse;
  //     let nameToUse;
  //     // let pathToUse;
  //     let eqnOptions;
  //     let elementModsToUse;
  //     // let addElementsToUse;
  //     let firstScenario;
  //     if (Array.isArray(optionsToUse.equation)) {
  //       [, nameToUse, , eqnOptions,
  //         elementModsToUse, , firstScenario,
  //       ] = optionsToUse.equation;
  //     } else {
  //       nameToUse = optionsToUse.equation.name;
  //       // pathToUse = optionsToUse.equation.path;
  //       eqnOptions = optionsToUse.equation.options;
  //       // methodPathToUse = optionsToUse.equation.method;
  //       elementModsToUse = optionsToUse.equation.mods;
  //       firstScenario = optionsToUse.equation.scenario;
  //     }

  //     let equation;
  //     if (Array.isArray(eqnOptions)) {
  //       equation = this.addEquation(parent, nameToUse, ...eqnOptions);
  //     } else {
  //       equation = this.addEquation(parent, nameToUse, eqnOptions);
  //     }

  //     if (elementModsToUse != null && elementModsToUse !== {}) {
  //       equation.setProperties(elementModsToUse);
  //     }
  //     if (firstScenario != null && firstScenario in equation.scenarios) {
  //       equation.setScenario(firstScenario);
  //     }
  //     optionsToUse.equation = equation;
  //   }
  //   // $FlowFixMe
  //   const navigator = new EqnNavigator(
  //     this.primitives,
  //     this.animateNextFrame,
  //     optionsToUse,
  //   );
  //   parent.add(navNameToUse, navigator);
  //   return navigator;
  // }

  cursor(
    optionsIn: {
      color: TypeColor,
      width: number,
      radius: number,
    },
  ) {
    const defaultOptions = {
      color: this.primitives.defaultColor,
      width: 0.008,
      radius: 0.05,
    };
    defaultOptions.color[3] = 0.9;
    const options = joinObjects(defaultOptions, optionsIn);
    const cursor = this.collection();
    const polygon = {
      // width: options.width,
      color: options.color,
      radius: options.radius,
      sides: 50,
    };
    const up = this.primitives.polygon(
      joinObjects({}, polygon, { line: { width: options.width } }),
    );
    const down = this.primitives.polygon(joinObjects({}, polygon));
    cursor.add('up', up);
    cursor.add('down', down);
    return cursor;
  }
}
