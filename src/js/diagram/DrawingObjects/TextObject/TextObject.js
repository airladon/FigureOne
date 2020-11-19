// @flow

import * as m2 from '../../../tools/m2';
import {
  Point, getPoint, Rect, getBoundingRect, getPoints,
} from '../../../tools/g2';
import type { TypeParsablePoint } from '../../../tools/g2';
import DrawingObject from '../DrawingObject';
import DrawContext2D from '../../DrawContext2D';
import { joinObjects, splitString } from '../../../tools/tools';
import { colorArrayToRGBA } from '../../../tools/color';

/* eslint-disable max-len */
/**
 * Font definition object.
 *
 * Text is drawn in a [Context2D canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) and so `family`, `style` and `weight` are any valid [options](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font).
 *
 * `size` is the vertex space size of the font.
 *
 * @property {string} [family] The font family (`Times New Roman`)
 * @property {`normal` | `italic`} [style] (`normal`)
 * @property {number} [size] size of font in vertex space (`0.2`)
 * @property {'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'} [weight]
 * font weight (`200`)
 * @property {[number, number, number, number]} [color] Font color
 * [red, green, blue, alpha] between 0 and 1 - (`[1, 0, 0, 1]`)
 * @property {number} [opacity] opacity multiplier (final opacity will be
 * `opacity` * `color` alpha) [`1`]
 * @example
 * // Full font definition
 * const font = new DiagramFont({
 *   family: 'Helvetica',
 *   style: 'italic',
 *   weight: 'bold',
 *   color: [1, 1, 0, 1],
 *   opacity: 1,
 * });
 * @example
 * // Define style only, remaining properties are defaults
 * const font = new DiagramFont({
 *   style: 'italic',
 * });
 */
export type OBJ_Font = {
  family?: string,
  style?: 'normal' | 'italic',
  size?: number,
  weight?: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  color?: Array<number> | null,
  opacity?: number,
};
/* eslint-enable max-len */

// DiagramFont defines the font properties to be used in a TextObject
class DiagramFont {
  size: number;
  weight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  style: 'normal' | 'italic';
  family: string;
  color: Array<number> | null;
  opacity: number;

  constructor(optionsIn: OBJ_Font | DiagramFont = {}) {
    if (optionsIn instanceof DiagramFont) {
      this.family = optionsIn.family;
      this.style = optionsIn.style;
      this.size = optionsIn.size;
      this.weight = optionsIn.weight;
      this.opacity = optionsIn.opacity;
      this.setColor(optionsIn.color);
      return;
    }
    const defaultOptions = {
      family: 'Times New Roman',
      style: 'normal',
      size: 1,
      weight: '200',
      color: null,
      opacity: 1,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.family = options.family;
    this.style = options.style;
    this.size = options.size;
    this.weight = options.weight;
    this.opacity = options.opacity;
    this.setColor(options.color);
  }

  setColor(color: Array<number> | null = null) {
    if (color == null) {
      this.color = color;
    } else {
      this.color = color.slice();
    }
  }

  definition() {
    const { color } = this;
    let colorToUse;
    if (color == null) {
      colorToUse = color;
    } else {
      colorToUse = color.slice();
    }
    return {
      family: this.family,
      style: this.style,
      size: this.size,
      weight: this.weight,
      color: colorToUse,
      opacity: this.opacity,
    };
  }

  setFontInContext(ctx: CanvasRenderingContext2D, scalingFactor: number = 1) {
    ctx.font = `${this.style} ${this.weight} ${this.size * scalingFactor}px ${this.family}`;
  }

  setColorInContext(ctx: CanvasRenderingContext2D, color: Array<number> | null) {
    const thisColor = this.color;
    let { opacity } = this;
    if (color != null) {
      opacity *= color[3];
    }
    if (thisColor != null) {
      const c = [
        ...thisColor.slice(0, 3),
        thisColor[3] * opacity,
      ];
      ctx.fillStyle = colorArrayToRGBA(c);
    } else if (color != null) {
      ctx.fillStyle = colorArrayToRGBA(color);
    }
  }

  _dup() {
    return new DiagramFont({
      family: this.family,
      style: this.style,
      size: this.size,
      weight: this.weight,
      color: this.color,
      opacity: this.opacity,
    });
  }
}

// DiagramText is a single text element of the diagram that is drawn at
// once and referenced to the same location
class DiagramTextBase {
  drawContext2D: Array<DrawContext2D>
  location: Point;
  locationAligned: Point;
  text: string;
  font: DiagramFont;
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  lastDrawRect: Rect;
  bounds: Rect;
  borderSetup: 'rect' | Array<Point>;
  border: [Point, Point, Point, Point];
  touchBorder: [Point, Point, Point, Point];
  touchBorderSetup: 'rect' | number | 'border' | Array<Point>;
  onClick: null | () => {};
  measure: {
    ascent: number,
    descent: number,
    width: number,
  };

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    location: TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: OBJ_Font = new DiagramFont().definition(),
    xAlign: 'left' | 'center' | 'right' = 'left',
    yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline' = 'baseline',
    border: 'rect' | Array<Array<Point>>,
    touchBorder: 'rect' | number | 'border' | Array<Array<Point>>,
    onClick: null | () => {},
    // runUpdate: boolean = true,
  ) {
    this.location = getPoint(location)._dup();
    this.locationAligned = this.location._dup();
    this.text = text.slice();
    this.font = new DiagramFont(font);
    this.xAlign = xAlign;
    this.yAlign = yAlign;
    this.lastDrawRect = new Rect(0, 0, 1, 1);
    if (Array.isArray(drawContext2D)) {
      this.drawContext2D = drawContext2D;
    } else {
      this.drawContext2D = [drawContext2D];
    }
    this.touchBorderSetup = touchBorder;
    this.borderSetup = border;
    this.onClick = onClick;
  }

  measureAndAlignText() {
    this.measureText();
    this.alignText();
  }

  calcBorderAndBounds() {
    this.calcBounds();
    this.calcBorder();
    this.calcTouchBorder();
  }

  setText(text: string) {
    this.text = text.slice();
    this.measureAndAlignText();
    this.calcBorderAndBounds();
  }

  setFont(font: OBJ_Font) {
    const newFont = joinObjects({}, this.font.definition(), font);
    this.font = new DiagramFont(newFont);
    this.measureAndAlignText();
  }

  setXAlign(xAlign: 'left' | 'center' | 'right') {
    this.xAlign = xAlign;
    this.alignText();
    this.calcBounds();
    this.calcBorder();
    this.calcTouchBorder();
  }

  setYAlign(yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline') {
    this.yAlign = yAlign;
    this.alignText();
    this.calcBounds();
    this.calcBorder();
    this.calcTouchBorder();
  }

  _dup() {
    return new this.constructor(
      this.drawContext2D,
      this.location,
      this.text,
      this.font.definition(),
      this.xAlign,
      this.yAlign,
    );
  }

  // This method is used instead of the actual ctx.measureText because
  // Firefox and Chrome don't yet support it's advanced features.
  // Estimates are made for height based on width.
  // eslint-disable-next-line class-methods-use-this
  measureText(
    ctx: CanvasRenderingContext2D = this.drawContext2D[0].ctx,
    scalingFactor: number = 20 / this.font.size,
  ) {
    this.font.setFontInContext(ctx, scalingFactor);
    const fontHeight = ctx.font.match(/[^ ]*px/);
    let aWidth;
    if (fontHeight != null) {
      aWidth = parseFloat(fontHeight[0]) / 2;
    } else {
      aWidth = ctx.measureText('a').width;
    }
    // console.log(aWidth)
    // Estimations of FONT ascent and descent for a baseline of "alphabetic"
    let ascent = aWidth * 1.4;
    let descent = aWidth * 0.08;

    // Uncomment below and change above consts to lets if more resolution on
    // actual text boundaries is needed

    // const maxAscentRe =
    //   /[ABCDEFGHIJKLMNOPRSTUVWXYZ1234567890!#%^&()@$Qbdtfhiklj]/g;
    const midAscentRe = /[acemnorsuvwxz*gyqp]/g;
    const midDecentRe = /[;,$]/g;
    let maxDescentRe = /[gjyqp@Q(){}[\]|]/g;
    if (this.font.family === 'Times New Roman') {
      if (this.font.style === 'italic') {
        maxDescentRe = /[gjyqp@Q(){}[\]|f]/g;
      }
    }

    const midAscentMatches = this.text.match(midAscentRe);
    if (Array.isArray(midAscentMatches)) {
      if (midAscentMatches.length === this.text.length) {
        ascent = aWidth * 0.95;
      }
    }

    const midDescentMatches = this.text.match(midDecentRe);
    if (Array.isArray(midDescentMatches)) {
      if (midDescentMatches.length > 0) {
        descent = aWidth * 0.2;
      }
    }

    const maxDescentMatches = this.text.match(maxDescentRe);
    if (Array.isArray(maxDescentMatches)) {
      if (maxDescentMatches.length > 0) {
        descent = aWidth * 0.5;
      }
    }
    // const height = ascent + descent;

    const { width } = ctx.measureText(this.text);
    this.measure = {
      ascent: ascent / scalingFactor,
      descent: descent / scalingFactor,
      width: width / scalingFactor,
    };
    return this.measure;
  }

  alignText() {
    const location = this.location._dup();
    if (this.xAlign === 'center') {
      location.x -= this.measure.width / 2;
    } else if (this.xAlign === 'right') {
      location.x -= this.measure.width;
    }
    if (this.yAlign === 'bottom') {
      location.y += this.measure.descent;
    } else if (this.yAlign === 'middle') {
      location.y += this.measure.descent - (this.measure.ascent + this.measure.descent) / 2;
    } else if (this.yAlign === 'top') {
      location.y -= this.measure.ascent;
    }
    this.locationAligned = location;
  }

  calcBounds() {
    this.bounds = new Rect(
      this.locationAligned.x,
      this.locationAligned.y - this.measure.descent,
      this.measure.width,
      this.measure.ascent + this.measure.descent,
    );
  }

  getBoundary(
    transformMatrix: Array<number> | null,
  ): Array<Point> {
    if (transformMatrix == null) {
      return this.border;
    }
    const boundary = [];
    this.border.forEach((p) => {
      boundary.push(p.transformBy(transformMatrix));
    });
    return boundary;
  }

  calcBorder() {
    if (this.borderSetup === 'rect') {
      this.border = [
        new Point(this.bounds.left, this.bounds.bottom),
        new Point(this.bounds.right, this.bounds.bottom),
        new Point(this.bounds.right, this.bounds.top),
        new Point(this.bounds.left, this.bounds.top),
      ];
    } else {
      this.border = this.borderSetup;
    }
  }

  calcTouchBorder() {
    if (this.touchBorderSetup === 'border') {
      this.touchBorder = this.border;
    } else if (this.touchBorderSetup === 'rect') {
      this.touchBorder = [
        new Point(this.bounds.left, this.bounds.bottom),
        new Point(this.bounds.right, this.bounds.bottom),
        new Point(this.bounds.right, this.bounds.top),
        new Point(this.bounds.left, this.bounds.top),
      ];
    } else if (typeof this.touchBorderSetup === 'number') {
      const buffer = this.touchBorderSetup;
      this.touchBorder = [
        new Point(this.bounds.left - buffer, this.bounds.bottom - buffer),
        new Point(this.bounds.right + buffer, this.bounds.bottom - buffer),
        new Point(this.bounds.right + buffer, this.bounds.top + buffer),
        new Point(this.bounds.left - buffer, this.bounds.top + buffer),
      ];
    } else {
      this.touchBorder = this.touchBorderSetup;
    }
  }
}

// DiagramText is a single text element of the diagram that is drawn at
// once and referenced to the same location
class DiagramText extends DiagramTextBase {
  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    location: TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: OBJ_Font = new DiagramFont().definition(),
    xAlign: 'left' | 'center' | 'right' = 'left',
    yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline' = 'baseline',
    border: 'rect' | Array<Point>,
    touchBorder: 'rect' | number | 'border' | Array<Point>,
    onClick: null | () => {},
    // runUpdate: boolean = true,
  ) {
    super(drawContext2D, location, text, font, xAlign, yAlign, border, touchBorder, onClick);
    this.measureAndAlignText();
    this.calcBorderAndBounds();
  }
}

class DiagramTextLine extends DiagramTextBase {
  offset: Point;
  inLine: boolean;

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    location: TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: OBJ_Font = new DiagramFont().definition(),
    offset: TypeParsablePoint = new Point(0, 0),
    inLine: boolean = true,
    border: 'rect' | Array<Point>,
    touchBorder: 'rect' | number | 'border' | Array<Array<Point>>,
    onClick: null | () => {},
  ) {
    super(drawContext2D, location, text, font, 'left', 'baseline', border, touchBorder, onClick);
    this.offset = getPoint(offset);
    this.inLine = inLine;
    this.measureAndAlignText();
    this.calcBorderAndBounds();
  }

  alignText() {
    const location = this.location._dup();
    this.locationAligned = location.add(this.offset);
  }

  _dup() {
    return new DiagramTextLine(
      this.drawContext2D,
      this.location,
      this.text,
      this.font.definition(),
      this.offset,
      this.inLine,
    );
  }
}

class DiagramTextLines extends DiagramTextLine {
  line: number;

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    location: TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: OBJ_Font = new DiagramFont().definition(),
    offset: TypeParsablePoint = new Point(0, 0),
    inLine: boolean = true,
    line: number,
    border: 'rect' | Array<Point>,
    touchBorder: 'rect' | number | 'border' | Array<Array<Point>>,
    onClick: null | () => {},
  ) {
    super(drawContext2D, location, text, font, offset, inLine, border, touchBorder, onClick);
    this.line = line;
    // this.update();
  }

  _dup() {
    return new DiagramTextLines(
      this.drawContext2D,
      this.location,
      this.text,
      this.font.definition(),
      this.offset,
      this.inLine,
      this.line,
    );
  }
}

// Order of definition:
// * Constructor - setup empty structures
// * loadText
//    - calculateScalingFactor
//    - setTextLocations - lays out text from location property or in line
//    - calcBoundsAndBorder
class TextObjectBase extends DrawingObject {
  drawContext2D: Array<DrawContext2D>
  text: Array<DiagramText>;
  scalingFactor: number;
  lastDrawTransform: Array<number>;
  borderSetup: 'text' | 'rect' | Array<Array<Point>>;
  touchBorderSetup: 'text' | 'rect' | 'border' | number | Array<Array<Point>>;

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
  ) {
    super();

    if (Array.isArray(drawContext2D)) {
      this.drawContext2D = drawContext2D;
    } else {
      this.drawContext2D = [drawContext2D];
    }
    this.lastDrawTransform = [];
    this.text = [];
    // this.state = 'loaded';
  }

  // eslint-disable-next-line no-unused-vars
  loadText(options: Object) {
    // Assign text to this.text here
    // this.text = options.text
    // Calculate Scaling Factor
    this.calcScalingFactor();
    // Layout text and calculat boundaries
    this.layoutText();
  }

  // calcTextBounds() {
  //   this.text.forEach((t) => {
  //     t.calcBorderAndBounds();
  //   });
  // }

  // eslint-disable-next-line class-methods-use-this
  setTextLocations() {
  }

  click(p: Point, fnMap: FunctionMap) {
    this.text.forEach((text) => {
      if (text.onClick != null) {
        // console.log(text.touchBorder, lastDrawTransformMatrix)
        // const glBorder = this.transformBorder([text.touchBorder], lastDrawTransformMatrix);
        // console.log(glBorder)
        if (p.isInPolygon(text.touchBorder)) {
          fnMap.exec(text.onClick, fnMap);
        }
      }
    });
  }

  calcScalingFactor() {
    let scalingFactor = 1;
    if (this.text.length > 0) {
      let minSize = this.text[0].font.size;
      this.text.forEach((t) => {
        if (t.font.size > 0 && t.font.size < minSize) {
          minSize = t.font.size;
        }
      });
      scalingFactor = 20 / minSize;
    }
    this.scalingFactor = scalingFactor;
  }

  setText(text: string, index: number = 0) {
    this.text[index].setText(text);
    this.setBorder();
    this.setTouchBorder();
  }

  _dup() {
    const c = new TextObjectBase(this.drawContext2D);
    return c;
  }

  setFont(font: OBJ_Font, index: null | number = 0) {
    if (index === null) {
      for (let i = 0; i < this.text.length; i += 1) {
        this.text[i].setFont(font);
      }
    } else {
      this.text[index].setFont(font);
    }
    this.layoutText();
  }

  setOpacity(opacity: number, index: null | number = 0) {
    if (index === null) {
      for (let i = 0; i < this.text.length; i += 1) {
        this.text[i].setFont({ opacity });
      }
    } else {
      this.text[index].setFont({ opacity });
    }
  }

  setColor(color: Array<number>, index: null | number = null) {
    if (index === null) {
      for (let i = 0; i < this.text.length; i += 1) {
        this.text[i].setFont({ color });
      }
    } else {
      this.text[index].setFont({ color });
    }
  }

  layoutText() {
    this.setTextLocations();
    this.text.forEach((t) => {
      t.calcBorderAndBounds();
    });
    this.setBorder();
    this.setTouchBorder();
  }

  setGenericBorder(name: string) {
    if (Array.isArray(this[`${name}Setup`])) {
      this[name] = this[`${name}Setup`];
      return;
    }
    const border = [];
    this.text.forEach((text) => {
      border.push(
        text[name],
      );
    });
    if (this[`${name}Setup`] === 'text') {
      this[name] = border;
      return;
    }
    const bounds = getBoundingRect(border);
    if (this[`${name}Setup`] === 'rect') {
      this[name] = [[
        new Point(bounds.left, bounds.bottom),
        new Point(bounds.right, bounds.bottom),
        new Point(bounds.right, bounds.top),
        new Point(bounds.left, bounds.top),
      ]];
      return;
    }
    const buffer = this[`${name}Setup`];
    this[name] = [[
      new Point(bounds.left - buffer, bounds.bottom - buffer),
      new Point(bounds.right + buffer, bounds.bottom - buffer),
      new Point(bounds.right + buffer, bounds.top + buffer),
      new Point(bounds.left - buffer, bounds.top + buffer),
    ]];
  }

  setBorder() {
    this.setGenericBorder('border');
  }

  setTouchBorder() {
    if (this.touchBorderSetup === 'border') {
      this.touchBorder = this.border;
      return;
    }
    this.setGenericBorder('touchBorder');
    // console.log(this.touchBorderSetup, this.touchBorder)
  }

  // getBoundaries(
  //   transformMatrix: Array<number>,
  // ): Array<Array<Point>> {
  //   const boundaries: Array<Array<Point>> = [];
  //   this.text.forEach((t) => {
  //     boundaries.push(t.getBoundary(transformMatrix));
  //   });
  //   return boundaries;
  // }

  // Text is drawn in pixel space which is 0, 0 in the left hand top corner on
  // a canvas of size canvas.offsetWidth x canvas.offsetHeight.
  //
  // Font size and text location is therefore defined in pixels in Context2D.
  //
  // However, in a Diagram, the text canvas is overlaid on the diagram GL
  // canvas and we want to think about the size and location of text in
  // Diagram Space or Element Space (if the element has a specific transform).
  //
  // For example, if we have a diagram with limits: min: (0, 0), max(2, 1)
  // with a canvas of 1000 x 500 then:
  //    1) Transform pixel space (1000 x 500) to be GL Space (2 x 2). i.e.
  //         - Magnify pixel space by 500 so one unit in the 2D drawing
  //           context is equivalent to 1 unit in GL Space.
  //         - Translate pixel space so 0, 0 is in the middle of the canvas
  //    2) Transform GL Space to Element Space
  //         - The transform matrix in the input parameters includes the
  //           transform to Diagram Space and then Element Space.
  //         - Now one unit in the 2D drawing context is equivalent to 1 unit
  //           in Element Space - i.e. the canvas will have limits of min(0, 0)
  //           and max(2, 1).
  //    3) Plot out all text
  //
  // However, when font size is defined in Element Space, and ends up being
  // <1 Element Space units, we have a problem. This is because font size is
  // still in pixels (just now it's super scaled up). Therefore, a scaling
  // factor is needed to make sure the font size can stay well above 1. This
  // scaling factor scales the final space, so a larger font size can be used.
  // Then all locations defined in Element Space also need to be scaled by
  // this scaling factor.
  //
  // The scaling factor can be number that is large enough to make it so the
  // font size is >>1. In the TextObject constructor, the scaling factor is
  // designed to ensure drawn text always is >20px.
  //
  // Therefore the different spaces are:
  //   - pixelSpace - original space of the 2D canvas
  //   - elementSpace - space of the DiagramElementPrimitive that holds text
  //   - scaledPixelSpace
  //
  drawWithTransformMatrix(
    transformMatrix: Array<number>,
    color: Array<number> = [1, 1, 1, 1],
    contextIndex: number = 0,
  ) {
    const drawContext2D = this.drawContext2D[contextIndex];
    const { ctx } = this.drawContext2D[contextIndex];
    ctx.save();

    // Scaling factor used to ensure font size is >> 1 pixel
    const { scalingFactor } = this;

    // Find the scaling factor between GL space (width 2, height 2) and canvas
    // pixel space (width offsetWidth, height offsetHeight)
    // This is how much we will zoom in on our ctx so one GL unit is
    // one pixel unit
    const sx = drawContext2D.canvas.offsetWidth / 2;
    const sy = drawContext2D.canvas.offsetHeight / 2;

    // GL space (0, 0) is the center of the canvas, and Pixel Space (0, 0)
    // is the top left of the canvas. Therefore, translate pixel space so
    // if we put in (0, 0) we actually draw to the center of the canvas
    const tx = drawContext2D.canvas.offsetWidth / 2;
    const ty = drawContext2D.canvas.offsetHeight / 2;

    // So our GL to Pixel Space matrix is now:
    const glToPixelSpaceMatrix = [
      sx, 0, tx,
      0, sy, ty,
      0, 0, 1,
    ];

    // The incoming transform matrix transforms elementSpace to glSpace.
    // Modify the incoming transformMatrix to be compatible with
    // pixel space
    //   - Flip the y translation
    //   - Reverse rotation
    const tm = transformMatrix;
    const elementToGLMatrix = [
      tm[0], -tm[1], tm[2],
      -tm[3], tm[4], tm[5] * -1,
      0, 0, 1,
    ];

    // Combine the elementToGL transform and glToPixel transforms
    // A X B is apply B then apply A, so apply element to GL, then GL to Pixel
    const elementToPixelMatrix = m2.mul(glToPixelSpaceMatrix, elementToGLMatrix);

    // At this point in time the ctx will be zoomed in such that every 1 unit
    // of element space is 1 pixel/unit in ctx space. But because font sizes
    // need to be >1px, we are going to scale out so we can use a font size of
    // ~20px.
    const pixelToScaledPixelMatrix = [
      1 / scalingFactor, 0, 0,
      0, 1 / scalingFactor, 0,
      0, 0, 1,
    ];

    const elementToScaledPixelMatrix = m2.mul(
      elementToPixelMatrix, pixelToScaledPixelMatrix,
    );

    // The ctx transform is defined in a different order:
    const cA = elementToScaledPixelMatrix[0];
    const cB = elementToScaledPixelMatrix[3];
    const cC = elementToScaledPixelMatrix[1];
    const cD = elementToScaledPixelMatrix[4];
    const cE = elementToScaledPixelMatrix[2];
    const cF = elementToScaledPixelMatrix[5];

    // Apply the transform to the ctx. We are now in Scaled
    ctx.transform(cA, cB, cC, cD, cE, cF);
    this.lastDrawTransform = elementToScaledPixelMatrix.slice();

    // Fill in all the text
    this.text.forEach((diagramText) => {
      diagramText.font.setFontInContext(ctx, scalingFactor);
      diagramText.font.setColorInContext(ctx, color);
      ctx.fillText(
        diagramText.text,
        (diagramText.locationAligned.x) * scalingFactor,
        (diagramText.locationAligned.y) * -scalingFactor,
      );
    });
    ctx.restore();
  }

  clear(contextIndex: number = 0, pulseTransforms: Array<Transform>) {
    const { ctx } = this.drawContext2D[contextIndex];
    const t = this.lastDrawTransform;
    ctx.save();
    ctx.transform(t[0], t[3], t[1], t[4], t[2], t[5]);
    // console.log('start clear');
    this.text.forEach((diagramText) => {
      const x = diagramText.locationAligned.x * this.scalingFactor;
      const y = diagramText.locationAligned.y * -this.scalingFactor;
      const width = diagramText.bounds.width * this.scalingFactor;
      const height = diagramText.bounds.height * this.scalingFactor;
      ctx.clearRect(
        x - width * 1,
        y + height * 1,
        width * 3,
        -height * 3,
      );
      // console.log(x - width * 1.5,
      //   y + height * 1.25,
      //   width * 3,
      //   -height * 2.5)
      // if (pulseTransforms.length > 0) {
      //   const points = [
      //     new Point(x - width * 1.5, y + height * 1.25),
      //     new Point(x - width * 1.5 + width * 3, y + height * 1.25),
      //     new Point(x - width * 1.5 + width * 3, y + height * 1.25 - height * 2.5),
      //     // new Point(x - width * 0.5, y + height + 0.25 - height * 2),
      //   ];
      //   // console.log('start')
      //   pulseTransforms.forEach((pt) => {
      //     // console.log(pt.matrix())
      //     const p = points.map(p => p.transformBy(pt.matrix()));
      //     console.log(pt)
      //     console.log(p[0].x, p[0].y, p[1].x - p[0].x, -Math.abs(p[2].y - p[1].y));
      //     ctx.clearRect(
      //       p[0].x,
      //       p[0].y,
      //       p[1].x - p[0].x,
      //       -Math.abs(p[2].y - p[1].y),
      //     );
      //   });
      // }
    });
    ctx.restore();
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [
      ...super._getStateProperties(),
    ];
  }
}

// TextObject is the DrawingObject used in the DiagramElementPrimitive.
// TextObject will draw an array of DiagramText objects.
class TextObject extends TextObjectBase {
  loadText(
    options: {
      text: string
        | {
            text: string,
            font?: OBJ_Font,
            location?: TypeParsablePoint,
            xAlign?: 'left' | 'right' | 'center',
            yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
            border?: 'rect' | Array<Point>,
            touchBorder?: 'rect' | number | 'border' | Array<Point>,
            onClick?: string | () => void,
        }
        | Array<string | {
        text: string,
        font?: OBJ_Font,
        location?: TypeParsablePoint,
        xAlign?: 'left' | 'right' | 'center',
        yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
        border?: 'rect' | Array<Point>,
          touchBorder?: 'rect' | number | 'border' | Array<Point>,
        onClick?: string | () => void,
      }>;
      font: OBJ_Font,                    // default font
      xAlign: 'left' | 'right' | 'center',                // default xAlign
      yAlign: 'bottom' | 'baseline' | 'middle' | 'top',   // default yAlign
      border?: 'text' | 'rect' | Array<Point>,
      touchBorder?: 'text' | 'rect' | number | 'border' | Array<Point>,
      color: Array<number>
    },
  ) {
    let textArray = options.text;
    if (!Array.isArray(textArray)) {
      textArray = [textArray];
    }
    const diagramTextArray = [];
    textArray.forEach((textDefinition) => {
      let font;
      let location;
      let xAlign;
      let yAlign;
      let textToUse;
      let border;
      let touchBorder;
      let onClick;
      if (typeof textDefinition === 'string') {
        textToUse = textDefinition;
      } else {
        ({
          font, location, xAlign, yAlign, touchBorder, border, onClick,
        } = textDefinition);
        textToUse = textDefinition.text;
        if (Array.isArray(border)) {
          border = getPoints(border);
        }
        if (Array.isArray(touchBorder)) {
          touchBorder = getPoints(touchBorder);
        }
      }
      let locationToUse;
      if (location == null) {
        locationToUse = new Point(0, 0);
      } else {
        locationToUse = getPoint(location);
      }
      let fontToUse = options.font;
      if (font != null) {
        fontToUse = font;
      }
      const fontDefinition = joinObjects({}, options.font, fontToUse);

      diagramTextArray.push(new DiagramText(
        this.drawContext2D,
        locationToUse,  // $FlowFixMe
        textToUse,
        fontDefinition,
        xAlign || options.xAlign,
        yAlign || options.yAlign,
        border || 'rect',
        touchBorder || 'border',
        onClick,
      ));
    });
    this.text = diagramTextArray;
    // super.loadText();
    this.calcScalingFactor();
    this.borderSetup = options.border;
    this.touchBorderSetup = options.touchBorder;
    this.layoutText();
  }

  _dup() {
    const c = new TextObject(this.drawContext2D); // $FlowFixMe
    c.text = this.text.map(t => t._dup());
    c.scalingFactor = this.scalingFactor;
    c.layoutText();
    return c;
  }
}

function createLine(
  textArray: Array<DiagramTextLine> | Array<DiagramTextLines>,
  initialLocation = new Point(0, 0),
) {
  let lastRight = initialLocation;
  let maxY = 0;
  let minY = 0;
  textArray.forEach((text) => {  // eslint-disable-next-line no-param-reassign
    text.location = lastRight.add(text.offset);
    if (text.inLine) {
      lastRight = text.location.add(text.measure.width, 0);
      const textMaxY = text.location.y + text.measure.ascent;
      const textMinY = text.location.y - text.measure.descent;
      if (textMaxY > maxY) {
        maxY = textMaxY;
      }
      if (textMinY < minY) {
        minY = textMinY;
      }
    }
  });
  const width = lastRight.x - 0;
  return { width, minY, maxY };
}

function align(
  textArray: Array<DiagramTextLine> | Array<DiagramTextLines>,
  xAlign: 'left' | 'center' | 'right',
  yAlign: 'bottom' | 'baseline' | 'alphabetic' | 'middle' | 'top',
  width: number,
  minY: number,
  maxY: number,
  // useLocation: boolean = false,
) {
  const locationAlignOffset = new Point(0, 0);
  if (xAlign === 'center') {
    locationAlignOffset.x -= width / 2;
  } else if (xAlign === 'right') {
    locationAlignOffset.x -= width;
  }
  if (yAlign === 'bottom') {
    locationAlignOffset.y -= minY;
  } else if (yAlign === 'middle') {
    locationAlignOffset.y += -minY - (maxY - minY) / 2;
  } else if (yAlign === 'top') {
    locationAlignOffset.y -= maxY;
  }
  textArray.forEach((text) => {  // eslint-disable-next-line no-param-reassign
    text.locationAligned = text.location.add(locationAlignOffset);
  });
}

class TextLineObject extends TextObjectBase {
  // $FlowFixMe
  text: Array<DiagramTextLine>;
  xAlign: 'left' | 'right' | 'center';                // default xAlign
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top';   // default yAlign

  // $FlowFixMe
  loadText(
    options: {
      line: Array<string | {
        text: string,
        font?: OBJ_Font,
        offset?: TypeParsablePoint,
        inLine?: boolean,
        // onClick?: () => void,
        // border?: 'rect' | Array<Point>,
        // touchBorder?: 'rect' | number | Array<Point>,
        border?: 'rect' | Array<Point>,
        touchBorder?: 'rect' | number | 'border' | Array<Point>,
        onClick?: string | () => void,
      }>;
      font: OBJ_Font,                    // default font
      xAlign: 'left' | 'right' | 'center',                // default xAlign
      yAlign: 'bottom' | 'baseline' | 'middle' | 'top',   // default yAlign
      color: Array<number>,
      border?: 'rect' | Array<Point>,
      touchBorder?: 'rect' | number | 'border' | Array<Point>,
      onClick?: string | () => void,
    },
  ) {
    let textArray = options.line;
    if (!Array.isArray(textArray)) {
      textArray = [textArray];
    }
    const diagramTextArray = [];
    textArray.forEach((textDefinition) => {
      let font;
      let offset;
      let inLine;
      let textToUse;
      let border;
      let touchBorder;
      let onClick;
      if (typeof textDefinition === 'string') {
        textToUse = textDefinition;
      } else {
        ({
          font, offset, inLine, border, touchBorder, onClick,
        } = textDefinition);
        textToUse = textDefinition.text;
        if (Array.isArray(border)) {
          border = getPoints(border);
        }
        if (Array.isArray(touchBorder)) {
          touchBorder = getPoints(touchBorder);
        }
      }
      let offsetToUse;
      if (offset == null) {
        offsetToUse = new Point(0, 0);
      } else {
        offsetToUse = getPoint(offset);
      }
      let fontToUse = options.font;
      if (font != null) {
        fontToUse = font;
      }
      const fontDefinition = joinObjects({}, options.font, fontToUse);
      if (fontDefinition.color == null && options.color != null) {
        fontDefinition.color = options.color;
      }

      diagramTextArray.push(new DiagramTextLine(
        this.drawContext2D,
        new Point(0, 0),
        textToUse,
        fontDefinition,
        offsetToUse,
        inLine,
        border || 'rect',
        touchBorder || 'border',
        onClick,
      ));
    });
    this.text = diagramTextArray;
    this.xAlign = options.xAlign;
    this.yAlign = options.yAlign;
    this.calcScalingFactor();
    this.borderSetup = options.border;
    this.touchBorderSetup = options.touchBorder;
    this.layoutText();
  }

  setTextLocations() {
    const { width, minY, maxY } = createLine(this.text);
    align(this.text, this.xAlign, this.yAlign, width, minY, maxY);
  }

  _dup() {
    const c = new TextLineObject(this.drawContext2D);
    c.text = this.text.map(t => t._dup());
    c.scalingFactor = this.scalingFactor;
    c.xAlign = this.xAlign;
    c.yAlign = this.yAlign;
    c.layoutText();
    return c;
  }
}

class TextLinesObject extends TextObjectBase {
  // $FlowFixMe
  line: Array<DiagramTextLines>;
  xAlign: 'left' | 'right' | 'center';                // default xAlign
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top';   // default yAlign
  lines: Array<{
    justify: 'left' | 'right' | 'center',
    space: number,
    text: Array<DiagramTextLines>;
    width: number,
  }>;

  modifiers: {
    [modifierName: string]: {
      text?: string,
      offset?: TypeParsablePoint,
      inLine?: boolean,
      font?: OBJ_Font,
      onClick?: () => {},
    },
  };

  // $FlowFixMe
  loadText(
    options: {
    text: Array<string | {
      text: string,
      font?: OBJ_Font,
      justify?: 'left' | 'center' | 'right',
      lineSpace?: number
    }>,
    modifiers: {
      [modifierName: string]: {
        text?: string,
        offset?: TypeParsablePoint,
        inLine?: boolean,
        font?: OBJ_Font,
        border?: 'rect' | Array<Point>,
        touchBorder?: 'border' | 'rect' | number | Array<Point>,
        onClick?: () => {},
      },
    },
    font: OBJ_Font,
    justify: 'left' | 'center' | 'right',
    lineSpace: number,
    xAlign: 'left' | 'right' | 'center',
    yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
    color: Array<number>
  },
  ) {
    // console.log('asdfasdf')
    // let { lines } = options;
    let textLines = options.text;
    if (typeof textLines === 'string') {
      textLines = [textLines];
    }
    this.modifiers = options.modifiers || {};
    this.lines = [];
    const diagramTextArray = [];

    textLines.forEach((lineDefinition, lineIndex) => {
      let lineJustification = options.justify;
      let lineLineSpace = options.lineSpace;
      let lineToUse;
      let lineFont = options.font;
      if (typeof lineDefinition !== 'string') {
        const {
          font, justify, lineSpace,
        } = lineDefinition;
        lineToUse = lineDefinition.text;
        if (font != null) {
          lineFont = joinObjects({}, options.font, font);
        }
        if (lineSpace != null) {
          lineLineSpace = lineSpace;
        }
        if (justify != null) {
          lineJustification = justify;
        }
      } else {
        lineToUse = lineDefinition;
      }
      const line = [];
      const split = splitString(lineToUse, '|', '/');
      split.forEach((s) => {
        let text = s;
        let textFont = lineFont;
        let offset = new Point(0, 0);
        let inLine = true;
        let border;
        let touchBorder;
        let onClick;
        if (this.modifiers[s] != null) {
          const mod = this.modifiers[s];
          if (mod.text != null) {
            ({ text } = mod);
          }
          if (mod.font != null) {
            textFont = joinObjects({}, lineFont, mod.font);
          }
          if (mod.inLine != null) {
            inLine = mod.inLine;
          }
          if (mod.offset != null) {
            offset = mod.offset;
          }
          if (mod.border != null) {
            border = mod.border;
          }
          if (mod.touchBorder != null) {
            touchBorder = mod.touchBorder;
          }
          if (mod.onClick != null) {
            onClick = mod.onClick;
          }
          if (Array.isArray(border)) {
            border = getPoints(border);
          }
          if (Array.isArray(touchBorder)) {
            touchBorder = getPoints(touchBorder);
          }
        }
        const t = new DiagramTextLines(
          this.drawContext2D,
          new Point(0, 0),
          text,
          textFont,
          offset,
          inLine,
          lineIndex,
          border || 'rect',
          touchBorder || 'border',
          onClick,
        );
        diagramTextArray.push(t);
        line.push(t);
      });
      this.lines.push({
        justify: lineJustification,
        space: lineLineSpace,
        text: line,
        width: 0,
      });
    });
    this.text = diagramTextArray;
    this.xAlign = options.xAlign;
    this.yAlign = options.yAlign;
    // super.super.loadText();
    this.calcScalingFactor();
    this.borderSetup = options.border;
    this.touchBorderSetup = options.touchBorder;
    this.layoutText();
  }

  setTextLocations() {
    const { width, minY, maxY } = this.createLines();
    align(this.text, this.xAlign, this.yAlign, width, minY, maxY);
  }

  createLines() {
    let maxLinesY = 0;
    let minLinesY = 0;
    let maxLinesWidth = 0;
    let y = 0;
    this.lines.forEach((line, index) => {
      if (index > 0) {
        y -= line.space;
      }
      const { width, minY, maxY } = createLine(line.text, new Point(0, y));
      minLinesY = minY < minLinesY ? minY : minLinesY;
      maxLinesY = maxY > maxLinesY ? maxY : maxLinesY;
      maxLinesWidth = width > maxLinesWidth ? width : maxLinesWidth;
      line.width = width;   // eslint-disable-line no-param-reassign
    });
    // justify lines
    this.lines.forEach((line) => {
      const locationAlignOffset = new Point(0, 0);
      if (line.justify === 'center') {
        locationAlignOffset.x += maxLinesWidth / 2 - line.width / 2;
      } else if (line.justify === 'right') {
        locationAlignOffset.x += maxLinesWidth - line.width;
      }
      line.text.forEach((text) => {
        // eslint-disable-next-line no-param-reassign
        text.location = text.location.add(locationAlignOffset);
      });
    });
    return {
      width: maxLinesWidth,
      minY: minLinesY,
      maxY: maxLinesY,
    };
  }

  _dup() {
    const c = new TextLineObject(this.drawContext2D);
    c.text = this.text.map(t => t._dup());
    c.scalingFactor = this.scalingFactor;
    c.xAlign = this.xAlign;
    c.yAlign = this.yAlign;
    c.layoutText();
    return c;
  }
}

export {
  DiagramFont, DiagramText, TextObject, TextLineObject,
  TextLinesObject, TextObjectBase,
};
