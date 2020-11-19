// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point,
  getPoint, getTransform,
} from '../../tools/g2';
// import type { TypeParsablePoint } from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';
import * as animation from '../Animation/Animation';
import type { OBJ_CustomAnimationStep } from '../Animation/Animation';

/**
 * Surround animation step.
 *
 * @property {number} [start] start element to surround (`this`)
 * @property {number} [target] target element to surround (`this`)
 * @property {number} [space] space between rectangle and element (`0`)
 * @extends OBJ_CustomAnimationStep
 */
export type OBJ_SurroundAnimationStep = {
  start?: number,
  target?: number,
} & OBJ_CustomAnimationStep;


export type ADV_Rectangle = {
  width: number,
  height: number,
  yAlign: 'bottom' | 'middle' | 'top' | number,
  xAlign: 'left' | 'center' | 'right' | number,
  line: {
    widthIs: 'mid' | 'outside' | 'inside' | 'positive' | 'negative',
    width: number,
    dash: Array<number>,
    color: Array<number>,
  },
  fill: Array<number> | OBJ_Texture,
  corner: OBJ_CurvedCorner,
};

// $FlowFixMe
class AdvancedRectangle extends DiagramElementCollection {
  shapes: Object;
  _line: DiagramElementPrimitive | null;
  _fill: DiagramElementPrimitive | null;

  /**
   * @hideconstructor
   */
  constructor(
    shapes: Object,
    optionsIn: ADV_Rectangle,
  ) {
    super(new Transform('Plot')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.shapes = shapes;
    this._line = null;
    this._fill = null;

    const defaultOptions = {
      width: 2,
      height: 1,
      xAlign: 'center',
      yAlign: 'middle',
      color: shapes.color,
      border: 'children',
      touchBorder: 'border',
      holeBorder: [[]],
      corner: {
        radius: 0,
        sides: 1,
      },
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.fill == null && options.line == null) {
      options.line = { width: 0.01 };
    }

    this.width = options.width;
    this.height = options.height;
    this.xAlign = options.xAlign;
    this.yAlign = options.yAlign;
    this.border = options.border;
    this.touchBorder = options.touchBorder;
    this.holeBorder = options.holeBorder;
    this.corner = options.corner;

    if (options.position != null) {
      this.transform.updateTranslation(getPoint(options.position));
    }
    if (options.transform != null) {
      this.transform = getTransform(options.transform);
    }

    this.setColor(options.color);

    if (options.fill != null) {
      this.addRect(options.fill, 'fill', true);
    }
    if (options.line != null) {
      this.addRect(options.line, 'line', false);
    }

    this.animations.surround = (...opt) => {
      const o = joinObjects({}, { element: this, space: 0 }, ...opt);
      if (o.start == null) {
        o.start = this;
      }
      if (o.target == null) {
        o.target = this;
      }
      const [startPosition, startWidth, startHeight] = this.getSurround(o.start, o.space);
      const [targetPosition, targetWidth, targetHeight] = this.getSurround(o.target, o.space);
      const deltaPosition = targetPosition.sub(startPosition);
      const deltaWidth = targetWidth - startWidth;
      const deltaHeight = targetHeight - startHeight;
      o.callback = (percentage) => {
        const newWidth = startWidth + deltaWidth * percentage;
        const newHeight = startHeight + deltaHeight * percentage;
        const newPosition = startPosition.add(deltaPosition.scale(percentage));
        this.setSurround(newPosition, newWidth, newHeight, o.space);
      };
      return new animation.CustomAnimationStep(o);
    };
    this.animations.customSteps.push({
      step: this.animations.surround.bind(this),
      name: 'surround',
    });
  }

  addRect(rectOptions: OBJ_LineStyle, name: string, fill: boolean) {
    const defaultOptions = {
      width: this.width,
      height: this.height,
      xAlign: this.xAlign,
      yAlign: this.yAlign,
      color: this.color,
      corner: this.corner,
    };
    if (!fill) {
      defaultOptions.line = {
        widthIs: 'inside',
        cornerStyle: 'auto',
        width: Math.max(Math.min(this.width, this.height) / 100, 0.005),
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
    const o = joinObjects({}, defaultOptions, optionsIn);
    this[name] = o;
    const rect = this.shapes.rectangle(o);
    this.add(name, rect);
  }

  getSurround(element: DiagramElement, space: number = 0) {
    const bounds = element.getBoundingRect('diagram');
    const matrix = this.spaceTransformMatrix('diagram', 'draw');
    const scale = matrix[0];
    const newWidth = (bounds.width + space * 2) * scale;
    const newHeight = (bounds.height + space * 2) * scale;
    const center = new Point(
      bounds.left + bounds.width / 2,
      bounds.bottom + bounds.height / 2,
    ).transformBy(this.spaceTransformMatrix('diagram', 'local'));
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

  surround(element: DiagramElement, space: number = 0) {
    const [position, width, height] = this.getSurround(element, space);
    console.log(this.xAlign, this.yAlign, position, width, height)
    this.setSurround(position, width, height);
  }

  setSurround(position: Point, width: number, height: number) {
    if (this._line) {
      this._line.custom.update({ width, height });
    }
    if (this._fill) {
      this._fill.custom.update({ width, height });
    }
    this.setPosition(position);
  }
}

export default AdvancedRectangle;
