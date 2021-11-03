// @flow

// import Figure from '../Figure';
import {
  Transform, getPoint,
  // getPoint, getTransform,
} from '../../tools/g2';
import type { TypeParsablePoint, Point } from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
import {
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import type {
  OBJ_Collection,
} from '../FigurePrimitives/FigurePrimitiveTypes';
import type {
  TypeColor, OBJ_Font,
} from '../../tools/types';
import type FigureCollections from './FigureCollections';
import EquationLabel from './EquationLabel';
import type { EQN_Equation, Equation } from '../Equation/Equation';
import type {
  TypeLabelSubLocation,
} from './EquationLabel';

// $FlowFixMe
class CollectionsText extends FigureElementCollection {
  _eqn: Equation;

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: Object,
  ) {
    const defaultOptions = {
      color: collections.primitives.defaultColor,
      font: collections.primitives.defaultFont,
      justify: 'left',
      xAlign: 'left',
      yAlign: 'baseline',
      lineSpace: null,
      transform: new Transform().scale(1).rotate(0).translate(0, 0),
    };

    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.lineSpace == null) {
      options.lineSpace = options.font.size;
    }
    if (options.accent == null) {
      options.accent = options.font.style === 'italic' ? 'normal' : 'italic';
    }
    super(joinObjects({}, options));
    this.collections = collections;

    this.add({
      name: 'lines',
      make: 'equation',
      textFont: options.font,
      color: options.color,
      yAlign: options.yAlign,
      xAlign: options.xAlign,
      forms: { base: ['abcd', 'efg'] },
    });
  }
}

export default CollectionsText;
