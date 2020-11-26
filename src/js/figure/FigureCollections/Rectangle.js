// @flow

// import Figure from '../Figure';
import {
  Transform, Point,
  // getPoint, getTransform,
} from '../../tools/g2';
// import type { TypeParsablePoint } from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import * as animation from '../Animation/Animation';
import type { OBJ_CustomAnimationStep } from '../Animation/Animation';
import type {
  OBJ_LineStyleSimple, OBJ_Texture, OBJ_Collection, OBJ_TextLines,
} from '../FigurePrimitives/FigurePrimitives';
import type {
  TypeColor, OBJ_CurvedCorner,
} from '../../tools/types';
import type { FigureElement } from '../Element';
import type FigureCollections from './FigureCollections';

/**
 * Surround animation step.
 *
 * @property {FigureElement} [start] start element to surround (`this`)
 * @property {FigureElement} [target] target element to surround (`this`)
 * @property {number} [space] space between rectangle and element (`0`)
 * @extends OBJ_CustomAnimationStep
 */
export type OBJ_SurroundAnimationStep = {
  start?: number,
  target?: number,
} & OBJ_CustomAnimationStep;

/**
 * OnClick colors when clicked.
 */
export type OBJ_ButtonColor = {
  line?: TypeColor,
  fill?: TypeColor,
  label?: TypeColor,
}

/**
 * {@link CollectionsRectangle} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
 *
 * This rectangle is similar to {@link OBJ_Rectangle}, except it can accomodate
 * both a fill and a border or line simultaneously with different colors.
 *
 * @extends OBJ_Collection
 *
 * @property {number} [width] rectangle width
 * @property {number} [height] rectangle height
 * @property {'left' | 'center' | 'right' | number} [xAlign] horiztonal
 * alignment of the rectangle
 * @property {'bottom' | 'middle' | 'top' | number} [yAlign] vertical alignment
* of the rectangle
 * @property {OBJ_LineStyleSimple} [line] lines style - leave empty if only
 * want fill
 * @property {TypeColor | OBJ_Texture} [fill] fill color or texture
 * @property {OBJ_CurvedCorner} [corner] corner style of rectangle
 * @property {OBJ_TextLines} [label] Rectangle label
 * @property {boolean | TypeColor | OBJ_ButtonColor} [button] `true` to
 * make the rectangle behave like a button when clicked. `TypeColor` to
 * make fill, line and label the same color when clicked or `OBJ_ButtonColor`
 * to specify click colors for each (`false`)
 */
export type COL_Rectangle = {
  width?: number,
  height?: number,
  xAlign?: 'left' | 'center' | 'right' | number,
  yAlign?: 'bottom' | 'middle' | 'top' | number,
  line?: OBJ_LineStyleSimple,
  fill?: TypeColor | OBJ_Texture,
  corner?: OBJ_CurvedCorner,
  label?: OBJ_TextLines,
  button?: boolean | TypeColor | OBJ_ButtonColor,
} & OBJ_Collection;

/*
..........########..########..######..########
..........##.....##.##.......##....##....##...
..........##.....##.##.......##..........##...
..........########..######...##..........##...
..........##...##...##.......##..........##...
..........##....##..##.......##....##....##...
..........##.....##.########..######.....##...
*/
/* eslint-disable max-len */
/**
 * {@link FigureElementCollection} representing a rectangle.
 *
 * ![](./apiassets/advrectangle_ex1.png)
 * ![](./apiassets/advrectangle_ex2.png)
 *
 * <p class="inline_gif"><img src="./apiassets/advrectangle.gif" class="inline_gif_image"></p>
 *
 * <p class="inline_gif"><img src="./apiassets/advrectangle_button.gif" class="inline_gif_image"></p>
 *
 * This object defines a rectangle
 * {@link FigureElementCollection} that may include:
 * - border (line)
 * - fill
 * - label
 * - ability to surround another {@link FigureElement} with some space
 * - button behavior when clicked
 *
 * Surrounding another element can be executed through either the
 * <a href="#collectionsrectanglesurround">surround</a> method
 * or the {@link OBJ_SurroundAnimationStep} found in the in
 * the animation manager ({@link FigureElement}.animations),
 * and in the animation builder
 * (<a href="#animationmanagernew">animations.new</a>
 * and <a href="#animationmanagerbuilder">animations.builder</a>).
 *
 * Button behavior means the button will temporarily change a different color
 * when it is clicked. By default, the button will become a little more
 * transparent, but colors for the fill, label and border can also be
 * specified.
 *
 * @see
 *
 * See {@link COL_Rectangle} for setup options.
 *
 * See {@link OBJ_SurroundAnimationStep} for surround animation step options.
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 * @example
 * // Simple rectangle
 * figure.add({
 *   name: 'rect',
 *   method: 'collections.rectangle',
 *   options: {
 *     width: 2,
 *     height: 1,
 *   },
 * });
 *
 * @example
 * // Round corner rectangle with fill and outside line
 * const rect = figure.collections.rectangle({
 *   width: 2,
 *   height: 1,
 *   line: {
 *     width: 0.02,
 *     widthIs: 'outside',
 *     dash: [0.1, 0.02],
 *   },
 *   corner: {
 *     radius: 0.2,
 *     sides: 10,
 *   },
 *   fill: [0.7, 0.7, 1, 1],
 * });
 * figure.add('rect', rect);
 *
 * @example
 * // Rectangle surrounds elements of an equation
 * figure.add([
 *   {
 *     name: 'rect',
 *     method: 'collections.rectangle',
 *     options: {
 *       color: [0.3, 0.3, 1, 1],
 *       line: { width: 0.01 },
 *     },
 *   },
 *   {
 *     name: 'eqn',
 *     method: 'equation',
 *     options: {
 *       forms: { 0: [{ frac: ['a', 'vinculum', 'b'] }, ' ', 'c'] },
 *       position: [1, 0],
 *       scale: 1.5,
 *     },
 *   }
 * ]);
 *
 * const rect = figure.getElement('rect');
 * const eqn = figure.getElement('eqn');
 *
 * rect.surround(eqn._a, 0.03);
 * rect.animations.new()
 *   .pulse({ delay: 1, scale: 1.5 })
 *   .surround({ target: eqn._b, space: 0.03, duration: 1 })
 *   .pulse({ delay: 1, scale: 1.5 })
 *   .surround({ target: eqn._c, space: 0.03, duration: 1 })
 *   .pulse({ delay: 1, scale: 1.5 })
 *   .start();
 *
 * @example
 * // Make a rectangle that behaves like a button
 * figure.add([
 *   {
 *     name: 'rect',
 *     method: 'collections.rectangle',
 *     options: {
 *       width: 0.5,
 *       height: 0.3,
 *       color: [0.3, 0.3, 0.3, 1],
 *       label: 'Save',
 *       corner: { radius: 0.05, sides: 10 },
 *       fill: [0.9, 0.9, 0.9, 1],
 *       button: {
 *         fill: [0.95, 0.95, 0.95, 1],
 *       },
 *     },
 *     mods: {
 *       isTouchable: true,
 *       onClick: () => console.log('clicked'),
 *     },
 *   },
 * ]);
 */
/* eslint-enable max-len */
// $FlowFixMe
class CollectionsRectangle extends FigureElementCollection {
  _line: FigureElementPrimitive | null;
  _fill: FigureElementPrimitive | null;
  _label: FigureElementPrimitive | null;

  width: number;
  height: number;
  xAlign: 'left' | 'center' | 'right' | number;
  yAlign: 'bottom' | 'middle' | 'top' | number;
  corner: OBJ_CurvedCorner;
  labelOffset: Point;

  animations: {
    surround: (OBJ_SurroundAnimationStep) => animation.CustomAnimationStep,
  } & animation.AnimationManager;

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: COL_Rectangle,
  ) {
    // super(new Transform('Plot')
    //   .scale(1, 1)
    //   .rotate(0)
    //   .translate(0, 0), shapes.limits);

    const defaultOptions = {
      width: collections.primitives.defaultLength,
      height: collections.primitives.defaultLength / 2,
      xAlign: 'center',
      yAlign: 'middle',
      color: collections.primitives.defaultColor,
      border: 'children',
      touchBorder: 'border',
      holeBorder: [[]],
      corner: {
        radius: 0,
        sides: 1,
      },
      transform: new Transform('Rectangle').scale(1, 1).rotate(0).translate(0, 0),
      limits: collections.primitives.limits,
      button: {},
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.fill == null && options.line == null) {
      options.fill = collections.primitives.defaultColor.slice();
    }
    super(options);
    this.collections = collections;
    this._line = null;
    this._fill = null;
    this._label = null;

    this.width = options.width;
    this.height = options.height;
    this.xAlign = options.xAlign;
    this.yAlign = options.yAlign;
    this.border = options.border;
    this.touchBorder = options.touchBorder;
    this.holeBorder = options.holeBorder;
    this.corner = options.corner;
    this.labelOffset = new Point(0, 0);

    // if (options.position != null) {
    //   this.transform.updateTranslation(getPoint(options.position));
    // }
    // if (options.transform != null) {
    //   this.transform = getTransform(options.transform);
    // }

    this.setColor(options.color);

    if (options.fill != null) {
      this.addRect(options.fill, 'fill', true);
    }
    if (options.line != null) {
      this.addRect(options.line, 'line', false);
    }
    if (options.label != null) {
      this.addlabel(options.label);
    }
    if (options.button) {
      this.addButtonBehavior(options.button);
    }

    this.setPositions();

    this.animations.surround = (...opt) => {
      const o = joinObjects({}, { element: this, space: 0 }, ...opt);
      let startPosition;
      let startWidth;
      let startHeight;
      let targetPosition;
      let targetWidth;
      let targetHeight;
      let deltaPosition;
      let deltaWidth;
      let deltaHeight;
      let toSetup = true;
      o.callback = (percentage) => {
        if (toSetup) {
          if (o.start == null) {
            startPosition = this.getPosition('local');
            startWidth = this.width;
            startHeight = this.height;
          } else {
            [startPosition, startWidth, startHeight] = this.getSurround(o.start, o.space);
          }
          if (o.target == null) {
            targetPosition = this.getPosition('local');
            targetWidth = this.width;
            targetHeight = this.height;
          } else {
            [targetPosition, targetWidth, targetHeight] = this.getSurround(o.target, o.space);
          }
          deltaPosition = targetPosition.sub(startPosition);
          deltaWidth = targetWidth - startWidth;
          deltaHeight = targetHeight - startHeight;
          toSetup = false;
        }
        const newWidth = startWidth + deltaWidth * percentage;
        const newHeight = startHeight + deltaHeight * percentage;
        const newPosition = startPosition.add(deltaPosition.scale(percentage));
        this.setSurround(newPosition, newWidth, newHeight);
      };
      return new animation.CustomAnimationStep(o);
    };
    this.animations.customSteps.push({
      step: this.animations.surround.bind(this),
      name: 'surround',
    });
  }

  addButtonBehavior(onClickColors: {
    line?: TypeColor,
    fill?: TypeColor,
    label?: TypeColor,
  } | TypeColor | boolean) {
    const click = (name) => {
      const element = this.elements[name];
      if (element == null) {
        return;
      }
      const currentColor = element.color.slice();
      let targetColor;
      if (Array.isArray(onClickColors)) {
        targetColor = onClickColors.slice();
      } else if (onClickColors !== true && onClickColors[name] != null) {
        targetColor = onClickColors[name].slice();
      }
      element.animations.new()
        .trigger({
          callback: () => {
            if (targetColor == null) {
              element.opacity = 0.8;
            } else {
              element.setColor(targetColor);
            }
          },
          duration: 0.1,
        })
        .trigger({
          callback: () => {
            if (targetColor == null) {
              element.opacity = 1;
            } else {
              element.setColor(currentColor);
            }
          },
        })
        .ifCanceledThenComplete()
        .start();
      // this.animateNextFrame();
    };
    this.subscriptions.add('onClick', () => {
      click('line');
      click('fill');
      click('label');
    });
  }

  addRect(rectOptions: OBJ_LineStyleSimple, name: string, fill: boolean) {
    const defaultOptions = {
      width: this.width,
      height: this.height,
      xAlign: 'center',
      yAlign: 'middle',
      color: this.color,
      corner: this.corner,
    };
    if (!fill) {  // $FlowFixMe
      defaultOptions.line = {
        widthIs: 'inside',
        cornerStyle: 'auto',
        width: Math.max(
          Math.min(this.width, this.height) / 100,
          this.collections.primitives.defaultLineWidth,
        ),
      };
      if (defaultOptions.line.width > this.width || defaultOptions.line.width > this.height) {
        defaultOptions.line.widthIs = 'mid';
      }
    }
    let optionsIn;
    if (fill) {
      if (Array.isArray(rectOptions)) {
        optionsIn = { color: rectOptions };
      } else {
        optionsIn = { texture: rectOptions };
      }
    } else {
      optionsIn = { line: rectOptions };
    }
    const o = joinObjects({}, defaultOptions, optionsIn); // $FlowFixMe
    this[name] = o;
    const rect = this.collections.primitives.rectangle(o);
    this.add(name, rect);
  }

  setPositions() {
    const bounds = { width: this.width, height: this.height };
    const position = new Point(0, 0);
    if (this.xAlign === 'left') {
      position.x += bounds.width / 2;
    } else if (this.xAlign === 'right') {
      position.x -= bounds.width / 2;
    } else if (typeof this.xAlign === 'number') {
      position.x = position.x + bounds.width / 2 - this.xAlign * bounds.width;
    }
    if (this.yAlign === 'bottom') {
      position.y += bounds.height / 2;
    } else if (this.yAlign === 'top') {
      position.y -= bounds.height / 2;
    } else if (typeof this.yAlign === 'number') {
      position.y = position.y + bounds.height / 2 - bounds.height * this.yAlign;
    }
    const { _line, _fill, _label } = this;
    if (_line) {
      _line.setPosition(position);
    }
    if (_fill) {
      _fill.setPosition(position);
    }
    if (_label) {
      // const delta = _label.getPosition('local');
      _label.setPosition(position.add(this.labelOffset));
      // const numLines = this._label.drawingObject.lines.length;
      // const numText = this._label.drawingObject.text.length;
      // if (numLines === 1 )
      // if (numLines === 1) {}
      // this._label.setPosition(position);
    }
    // return position;
  }

  addlabel(textOptions: OBJ_TextLines | string) {
    const defaultOptions = {
      font: this.collections.primitives.defaultFont,
      xAlign: 'center',
      yAlign: 'baseline',
      justify: 'center',
      color: this.color,
    };
    defaultOptions.font.size = this.height * 0.4;
    defaultOptions.font.color = this.color;

    let optionsIn;
    if (typeof textOptions === 'string') {
      optionsIn = { text: textOptions };
    } else {
      optionsIn = textOptions;
    }
    const o = joinObjects({}, defaultOptions, optionsIn);
    this.labelOffset = new Point(0, -o.font.size / 2.5);
    // if (o.position == null) {
    //   o.position = new Point(0, -o.font.size / 2.5);
    // }
    // o.position = o.position.add(this.getAlignmentPosition());
    const label = this.collections.primitives.textLines(o);
    this.add('label', label);
  }

  getSurround(element: FigureElement, space: number = 0) {
    const bounds = element.getBoundingRect('figure');
    const matrix = this.spaceTransformMatrix('figure', 'draw');
    const scale = matrix[0];
    const newWidth = (bounds.width + space * 2) * scale;
    const newHeight = (bounds.height + space * 2) * scale;
    const center = new Point(
      bounds.left + bounds.width / 2,
      bounds.bottom + bounds.height / 2,
    ).transformBy(this.spaceTransformMatrix('figure', 'local'));
    const position = center;
    if (this.xAlign === 'left') {
      position.x -= newWidth / 2;
    } else if (this.xAlign === 'right') {
      position.x += newWidth / 2;
    } else if (typeof this.xAlign === 'number') {
      position.x = position.x - newWidth / 2 + this.xAlign * newWidth;
    }
    if (this.yAlign === 'bottom') {
      position.y -= newHeight / 2;
    } else if (this.yAlign === 'top') {
      position.y += newHeight / 2;
    } else if (typeof this.yAlign === 'number') {
      position.y = position.y - newHeight / 2 + newHeight * this.yAlign;
    }
    return [position, newWidth, newHeight];
  }

  surround(element: FigureElement, space: number = 0) {
    const [position, width, height] = this.getSurround(element, space);
    this.setSurround(position, width, height);
  }

  setSurround(position: Point, width: number, height: number) {
    this.width = width;
    this.height = height;
    if (this._line) {
      this._line.custom.update({ width, height });
    }
    if (this._fill) {
      this._fill.custom.update({ width, height });
    }
    // if (this._label) {
    //   this._label.
    // }
    this.setPositions();
    this.setPosition(position);
  }
}

export default CollectionsRectangle;
