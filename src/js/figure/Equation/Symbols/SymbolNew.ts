import { FigureElementPrimitive } from '../../Element';
import {
  Point, Transform, getBoundingBorder, getBorder,
} from '../../../tools/g2';
import {
  duplicate,
} from '../../../tools/tools';
import VertexGeneric from '../../DrawingObjects/VertexObject/VertexGeneric';
import WebGLInstance from '../../webgl/webgl';
import Bounds from '../Elements/Bounds';
import type {
  TypeColor,
} from '../../../tools/types';


export default class Symbol extends FigureElementPrimitive {
  constructor(
    webgl: WebGLInstance,
    color: TypeColor,
    transformOrLocation: Transform | Point,
    symbolOptions: Record<string, any>,
  ) {
    const vertexObject = new VertexGeneric(webgl);

    let initialT;
    if (transformOrLocation instanceof Transform) {
      initialT = transformOrLocation;
    } else {
      initialT = new Transform().scale(1, 1).translate(0, 0);
    }
    super(vertexObject, initialT, color);
    if (symbolOptions.touchBorder != null) {
      this.touchBorder = symbolOptions.touchBorder;
    }
    if (symbolOptions.border != null) {
      this.border = symbolOptions.border;
    }
    if (symbolOptions.onClick != null) {
      this.onClick = symbolOptions.onClick;
    }
    if (symbolOptions.isTouchable != null) {
      this.isTouchable = symbolOptions.isTouchable;
    }
    if (symbolOptions.drawNumber != null) {
      this.drawNumber = symbolOptions.drawNumber;
    }
    this._custom.options = symbolOptions;
    if (this._custom.options.draw === 'dynamic') {
      this._custom.scale = new Point(1, 1);
      this.internalSetTransformCallback = () => {
        const s = this.getScale();
        if (this._custom.scale.isNotEqualTo(s, 8)) {
          const [
            pointsNew, widthNew, heightNew, drawType,
          ] = this.getPoints(this._custom.options, s.x, s.y);
          this.pointsDefinition = {
            points: duplicate(pointsNew),
            width: widthNew,
            height: heightNew,
            drawType,
          };
          this.updateSymbol(pointsNew, widthNew, heightNew, drawType);
          this._custom.scale = s;
        }
      };
    }

    // eslint-disable-next-line max-len
    this._custom.setSize = (location: Point, widthIn: number, heightIn: number) => {
      const t = this.transform._dup();
      if (
        this._custom.options.draw === 'static'
      ) {
        let points: Array<Point> = [];
        let width = 0;
        let height = 0;
        let drawType: 'STRIP' | 'TRIANGLES' | 'FAN' = 'STRIP';
        if (
          this._custom.options.staticHeight === 'first'
          || this._custom.options.staticWidth === 'first'
        ) {
          ([points, width, height, drawType] = this.getPoints(symbolOptions, widthIn, heightIn));
        } else if (this._custom.options.staticHeight != null
          || this._custom.options.staticWidth != null) {
          ([points, width, height, drawType] = this.getPoints(
            symbolOptions,
            this._custom.options.staticWidth,
            this._custom.options.staticHeight,
          ));
        }
        this.pointsDefinition = {
          points: duplicate(points),
          width,
          height,
          drawType,
        };
        this.updateSymbol(points, width, height, drawType);
        this._custom.options.staticHeight = height;
        this._custom.options.staticWidth = width;
        t.updateScale([width, height]);
      } else {
        const [
          pointsNew, widthNew, heightNew, drawType,
        ] = this.getPoints(this._custom.options, widthIn, heightIn);
        this.pointsDefinition = {
          points: duplicate(pointsNew),
          width: widthNew,
          height: heightNew,
          drawType,
        };
        this.updateSymbol(pointsNew, widthNew, heightNew, drawType);
        this._custom.scale = new Point(widthIn, heightIn);
        t.updateScale([widthIn, heightIn]);
      }
      t.updateTranslation([location.x, location.y]);
      this.setTransform(t);
    };

    this.setPointsFromDefinition = () => {
      if (Object.keys(this.pointsDefinition).length === 0) {
        return;
      }
      const {
        points, width, height, drawType,
      } = this.pointsDefinition;
      this.updateSymbol(points, width, height, drawType);
    };
  }

  updateSymbol(
    pointsIn: Array<Point>,
    width: number,
    height: number,
    drawType: 'STRIP' | 'TRIANGLES' | 'FAN',
  ) {
    this.drawingObject.change({ points: pointsIn, drawType });
    this.drawBorder = [[
      new Point(0, 0),
      new Point(width, 0),
      new Point(width, height),
      new Point(0, height),
    ]];
    if (
      typeof this._custom.options.drawBorderBuffer === 'number'
      || (
        Array.isArray(this._custom.options.drawBorderBuffer)
        && typeof this._custom.options.drawBorderBuffer[0] === 'number'
      )
    ) {
      this.drawBorderBuffer = [getBoundingBorder(
        this.drawBorder as any, this._custom.options.drawBorderBuffer,
      )];
    } else if (Array.isArray(this._custom.options.drawBorderBuffer)) {
      this.drawBorderBuffer = getBorder(this._custom.options.drawBorderBuffer) as any;
    } else {
      this.drawBorderBuffer = this.drawBorder;
    }
  }

  override getTransform() {
    if (this._custom.options.draw === 'static') {
      const t = this.transform._dup();
      const s = t.s();
      if (s != null) {
        t.updateScale([
          s.x / this._custom.options.staticWidth,
          s.y / this._custom.options.staticHeight,
        ]);
      }
      return t;
    }
    const t = this.transform._dup();
    t.updateScale([1, 1]);
    return t;
  }

  getWidth(options: Record<string, any>, height: number) {
    let width;
    if (options.draw === 'static') {
      let { staticHeight } = options;
      const { staticWidth } = options;
      if (staticHeight === 'first') {
        staticHeight = height;
      }
      ({ width } = this.getDefaultValues(staticHeight, staticWidth, options));
      if (width == null) {
        width = height;
      }
      return width / staticHeight * height;
    }
    ({ width } = options);
    ({ width } = this.getDefaultValues(height, width, options));
    return width;
  }

  getHeight(options: Record<string, any>, width: number) {
    let height;
    if (options.draw === 'static') {
      let { staticWidth } = options;
      const { staticHeight } = options;
      if (staticWidth === 'first') {
        staticWidth = width;
      }
      ({ height } = this.getDefaultValues(staticHeight, staticWidth, options));
      if (height == null) {
        height = width;
      }
      return height / staticWidth * width;
    }
    ({ height } = options);
    ({ height } = this.getDefaultValues(height, width, options));
    return height;
  }

  getBounds(
    options: Record<string, any>,
    contentX: number,
    contentY: number,
    contentWidth: number,
    contentHeight: number,
    side?: 'left' | 'right' | 'bottom' | 'top',
  ) {
    const { width, height } = this.getDefaultValues(
      contentHeight, contentWidth, options,
    );
    const bounds = new Bounds();
    if (side === 'left') {
      bounds.left = contentX - width;
      bounds.bottom = contentY;
      bounds.top = bounds.bottom + height;
      bounds.right = bounds.left + width;
    } else if (side === 'right') {
      bounds.left = contentX;
      bounds.bottom = contentY;
      bounds.top = bounds.bottom + height;
      bounds.right = bounds.left + width;
    } else if (side === 'top') {
      bounds.bottom = contentY;
      bounds.top = contentY + height;
      bounds.left = contentX + contentWidth / 2 - width / 2;
      bounds.right = bounds.left + width;
    } else {
      bounds.top = contentY;
      bounds.bottom = contentY - height;
      bounds.left = contentX + contentWidth / 2 - width / 2;
      bounds.right = bounds.left + width;
    }
    bounds.width = width;
    bounds.height = height;
    bounds.ascent = height;
    bounds.descent = 0;
    return bounds;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  getPoints(options: Record<string, any>, width: number, height: number): [Array<Point>, number, number, 'STRIP' | 'TRIANGLES' | 'FAN'] {
    const points = [
      new Point(0, 0),
      new Point(width, 0),
      new Point(width, height),
      new Point(0, height),
    ];

    return [points, width, height, 'STRIP'];
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  getDefaultValues(height: number, width: number, options: Record<string, any>): Record<string, any> {
    return {};
  }
}
