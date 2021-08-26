// @flow

import * as m2 from '../../../tools/m2';
import * as m3 from '../../../tools/m3';
import { isPointInPolygon } from '../../../tools/geometry/polygon';
import {
  Point, getPoint, Rect, getBoundingBorder, getBorder, isBuffer,
} from '../../../tools/g2';
import type { TypeParsablePoint, TypeParsableBuffer } from '../../../tools/g2';
import type Scene from '../../../tools/scene';
import type { Type3DMatrix } from '../../../tools/m3';
import DrawingObject from '../DrawingObject';
import DrawContext2D from '../../DrawContext2D';
import { joinObjects, splitString } from '../../../tools/tools';
import { colorArrayToRGBA } from '../../../tools/color';
import type {
  OBJ_Font, TypeColor,
} from '../../../tools/types';
import type {
  FunctionMap,
} from '../../../tools/FunctionMap';
import type {
  OBJ_TextDefinition,
} from '../../FigurePrimitives/FigurePrimitiveTypes2D';


/* eslint-enable max-len */

// FigureFont defines the font properties to be used in a TextObject
class FigureFont {
  size: number;
  weight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  style: 'normal' | 'italic';
  family: string;
  color: TypeColor | null;
  opacity: number;

  constructor(optionsIn: OBJ_Font | FigureFont = {}) {
    if (optionsIn instanceof FigureFont) {
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

  setColor(color: TypeColor | null = null) {
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

  setColorInContext(ctx: CanvasRenderingContext2D, color: TypeColor | null) {
    const thisColor = this.color;
    // let { opacity } = this;
    // if (color != null) {
    //   opacity *= color[3];
    // }
    if (thisColor != null) {
      const c = [
        ...thisColor.slice(0, 3),
        // thisColor[3] * opacity,
        color != null ? color[3] : 1,
      ];
      ctx.fillStyle = colorArrayToRGBA(c);
    } else if (color != null) {
      ctx.fillStyle = colorArrayToRGBA(color);
    }
  }

  _dup() {
    return new FigureFont({
      family: this.family,
      style: this.style,
      size: this.size,
      weight: this.weight,
      color: this.color,
      opacity: this.opacity,
    });
  }
}

// FigureText is a single text element of the figure that is drawn at
// once and referenced to the same location
class FigureTextBase {
  drawContext2D: Array<DrawContext2D>
  location: Point;
  locationAligned: Point;
  text: string;
  font: FigureFont;
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  lastDrawRect: Rect;
  bounds: Rect;
  // borderSetup: 'rect' | Array<Point>;
  textBorder: Array<Point>;
  textBorderBuffer: Array<Point>;
  // touchBorder: number | Array<Point>;
  touchBorder: TypeParsableBuffer | Array<Point>;
  // touchBorderSetup: 'rect' | number | 'border' | Array<Point>;
  // touchBorderSetup: 'rect'
  onClick: null | (() => void) | string;
  measure: {
    ascent: number,
    descent: number,
    width: number,
  };

  lastDraw: {
    x: number,
    y: number,
    width: number,
    height: number,
  } | null;

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    location: TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: OBJ_Font = new FigureFont().definition(),
    xAlign: 'left' | 'center' | 'right' = 'left',
    yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline' = 'baseline',
    // border: 'rect' | Array<Point> = 'rect',
    // number | Array<Point>
    // touchBorder: 'rect' | number | 'border' | Array<Point> = 'border',
    touchBorder: TypeParsableBuffer | Array<Point> = 0,
    onClick?: string | (() => void) | null = null,
    // runUpdate: boolean = true,
  ) {
    this.location = getPoint(location)._dup();
    this.locationAligned = this.location._dup();
    this.text = text.slice();
    this.font = new FigureFont(font);
    this.xAlign = xAlign;
    this.yAlign = yAlign;
    this.lastDraw = null;
    this.lastDrawRect = new Rect(0, 0, 1, 1);
    if (Array.isArray(drawContext2D)) {
      this.drawContext2D = drawContext2D;
    } else {
      this.drawContext2D = [drawContext2D];
    }
    // this.touchBorderSetup = touchBorder;
    this.touchBorder = touchBorder;
    // this.borderSetup = border;
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

  setText(options: string | OBJ_TextDefinition) {
    if (typeof options === 'string') {
      this.text = options.slice();
    } else {
      if (options.location != null) {
        // eslint-disable-next-line no-param-reassign
        options.location = getPoint(options.location);
      }
      joinObjects(this, options);
    }
    this.measureAndAlignText();
    this.calcBorderAndBounds();
  }

  // deprecated
  // setText(text: string) {
  //   this.text = text.slice();
  //   this.measureAndAlignText();
  //   this.calcBorderAndBounds();
  // }

  setFont(font: OBJ_Font) {
    const newFont = joinObjects({}, this.font.definition(), font);
    this.font = new FigureFont(newFont);
    this.measureAndAlignText();
  }

  // // deprecated
  // setXAlign(xAlign: 'left' | 'center' | 'right') {
  //   this.xAlign = xAlign;
  //   this.alignText();
  //   this.calcBounds();
  //   this.calcBorder();
  //   this.calcTouchBorder();
  // }

  // // deprecated
  // setYAlign(yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline') {
  //   this.yAlign = yAlign;
  //   this.alignText();
  //   this.calcBounds();
  //   this.calcBorder();
  //   this.calcTouchBorder();
  // }

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
  // Firefox and Chrome don't yet support it's collections features.
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
    this.locationAligned = location._dup();
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
    transformMatrix: Type3DMatrix | null,
  ): Array<Point> {
    if (transformMatrix == null) {
      return this.textBorder;
    }
    const boundary = [];
    this.textBorder.forEach((p) => {
      boundary.push(p.transformBy(transformMatrix));
    });
    return boundary;
  }

  calcBorder() {
    // if (this.borderSetup === 'rect') {
    this.textBorder = [
      new Point(this.bounds.left, this.bounds.bottom),
      new Point(this.bounds.right, this.bounds.bottom),
      new Point(this.bounds.right, this.bounds.top),
      new Point(this.bounds.left, this.bounds.top),
    ];
    // } else {
    //   this.border = this.borderSetup;
    // }
  }

  calcTouchBorder() {
    if (isBuffer(this.touchBorder)) { // $FlowFixMe
      this.textBorderBuffer = getBoundingBorder(this.textBorder, this.touchBorder);
    // }
    // if (
    //   typeof this.touchBorder === 'number'
    //   || (
    //     Array.isArray(this.touchBorder)
    //     && typeof (this.touchBorder[0]) === 'number'
    //   )
    // ) {
    //   this.textBorderBuffer = getBoundingBorder(this.textBorder, this.touchBorder);
    } else { // $FlowFixMe
      this.textBorderBuffer = this.touchBorder;
    }
  }
}

// FigureText is a single text element of the figure that is drawn at
// once and referenced to the same location
class FigureText extends FigureTextBase {
  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    location: TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: OBJ_Font = new FigureFont().definition(),
    xAlign: 'left' | 'center' | 'right' = 'left',
    yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline' = 'baseline',
    // border: 'rect' | Array<Point> = 'rect',
    // touchBorder: 'rect' | number | 'border' | Array<Point> = 'border',
    touchBorder: TypeParsableBuffer | Array<Point> = 0,
    onClick?: string | (() => void) | null = null,
    // runUpdate: boolean = true,
  ) {
    super(drawContext2D, location, text, font, xAlign, yAlign, touchBorder, onClick);
    this.measureAndAlignText();
    this.calcBorderAndBounds();
  }
}

class FigureTextLine extends FigureTextBase {
  offset: Point;
  inLine: boolean;
  followOffsetY: boolean;
  rSpace: number;
  lSpace: number;

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    location: TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: OBJ_Font = new FigureFont().definition(),
    offset: TypeParsablePoint = new Point(0, 0),
    inLine: boolean = true,
    // border: 'rect' | Array<Point> = 'rect',
    // touchBorder: 'rect' | number | 'border' | Array<Point> = 'border',
    touchBorder: TypeParsableBuffer | Array<Point> = 0,
    onClick?: string | (() => void) | null = null,
    followOffsetY?: boolean = false,
    lSpace?: number = 0,
    rSpace?: number = 0,
  ) {
    super(drawContext2D, location, text, font, 'left', 'baseline', touchBorder, onClick);
    this.offset = getPoint(offset);
    this.inLine = inLine;
    this.followOffsetY = followOffsetY;
    this.lSpace = lSpace;
    this.rSpace = rSpace;
    this.measureAndAlignText();
    this.calcBorderAndBounds();
  }

  alignText() {
    const location = this.location._dup();
    this.locationAligned = location.add(this.offset);
  }

  _dup() {
    return new FigureTextLine(
      this.drawContext2D,
      this.location,
      this.text,
      this.font.definition(),
      this.offset,
      this.inLine,
      this.touchBorder,
      this.onClick,
      this.followOffsetY,
      this.rSpace,
      this.lSpace,
    );
  }
}

class FigureTextLines extends FigureTextLine {
  line: number;

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    location: TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: OBJ_Font = new FigureFont().definition(),
    offset: TypeParsablePoint = new Point(0, 0),
    inLine: boolean = true,
    line: number,
    // border: 'rect' | Array<Point> = 'rect',
    // touchBorder: 'rect' | number | 'border' | Array<Point> = 'border',
    touchBorder: TypeParsableBuffer | Array<Point> = 0,
    onClick?: string | (() => void) | null = null,
    followOffsetY?: boolean = false,
    lSpace?: number = 0,
    rSpace?: number = 0,
  ) {
    super(
      drawContext2D, location, text, font, offset, inLine, touchBorder,
      onClick, followOffsetY, lSpace, rSpace,
    );
    this.line = line;
    // this.update();
  }

  _dup() {
    return new FigureTextLines(
      this.drawContext2D,
      this.location,
      this.text,
      this.font.definition(),
      this.offset,
      this.inLine,
      this.line,
      this.touchBorder,
      this.onClick,
      this.followOffsetY,
      this.lSpace,
      this.rSpace,
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
  text: Array<FigureTextBase>;
  scalingFactor: number;
  lastDrawTransform: Array<number>;

  textBorder: Array<Array<Point>>;
  textBorderBuffer: Array<Array<Point>>;
  fixColor: boolean;
  // borderSetup: 'text' | 'rect' | Array<Point>;
  // touchBorderSetup: 'text' | 'rect' | 'border' | number | Array<Point>;

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
  ) {
    super();

    if (Array.isArray(drawContext2D)) {
      this.drawContext2D = drawContext2D;
    } else {
      this.drawContext2D = [drawContext2D];
    }
    this.lastDrawTransform = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    this.text = [];
    this.fixColor = false;
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

  getCanvas(index: number = 0) {
    return this.drawContext2D[index].canvas;
  }


  // eslint-disable-next-line class-methods-use-this
  setTextLocations() {
  }

  click(p: Point, fnMap: FunctionMap) {
    this.text.forEach((text) => {
      if (text.onClick != null) {
        if (isPointInPolygon(p, text.textBorderBuffer)) {
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

  setText(textOrOptions: string | OBJ_TextDefinition, index: number = 0) {
    this.clear();
    this.text[index].setText(textOrOptions);
    this.setBorder();
    this.setTouchBorder();
  }


  _dup() {
    const c = new TextObjectBase(this.drawContext2D);
    return c;
  }

  setFont(font: OBJ_Font, index: null | number = 0) {
    this.clear();
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
    this.clear();
    if (index === null) {
      for (let i = 0; i < this.text.length; i += 1) {
        this.setFont({ opacity }, i);
      }
    } else {
      this.setFont({ opacity }, index);
    }
  }

  setColor(color: TypeColor, index: null | number = null) {
    if (this.fixColor) {
      return;
    }
    if (index === null) {
      for (let i = 0; i < this.text.length; i += 1) {
        this.text[i].font.color = color.slice();
      }
    } else {
      this.text[index].font.color = color.slice();
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

  setBorder() {
    // this.setGenericBorder('border');
    this.textBorder = [];
    this.text.forEach((text) => {
      this.textBorder.push(text.textBorder);
    });
  }

  setTouchBorder() {
    this.textBorderBuffer = [];
    this.text.forEach((text) => {
      this.textBorderBuffer.push(text.textBorderBuffer);
    });
  }


  // Text is drawn in pixel space which is 0, 0 in the left hand top corner on
  // a canvas of size canvas.offsetWidth x canvas.offsetHeight.
  //
  // Font size and text location is therefore defined in pixels in Context2D.
  //
  // However, in a Figure, the text canvas is overlaid on the figure GL
  // canvas and we want to think about the size and location of text in
  // Figure Space or Element Space (if the element has a specific transform).
  //
  // For example, if we have a figure with limits: min: (0, 0), max(2, 1)
  // with a canvas of 1000 x 500 then:
  //    1) Transform pixel space (1000 x 500) to be GL Space (2 x 2). i.e.
  //         - Magnify pixel space by 500 so one unit in the 2D drawing
  //           context is equivalent to 1 unit in GL Space.
  //         - Translate pixel space so 0, 0 is in the middle of the canvas
  //    2) Transform GL Space to Element Space
  //         - The transform matrix in the input parameters includes the
  //           transform to Figure Space and then Element Space.
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
  //   - elementSpace - space of the FigureElementPrimitive that holds text
  //   - scaledPixelSpace
  //
  drawWithTransformMatrix(
    scene: Scene,
    worldMatrix: Type3DMatrix,
    color: TypeColor = [1, 1, 1, 1],
    // contextIndex: number = 0,
  ) {
    const drawContext2D = this.drawContext2D[0];
    const { ctx } = this.drawContext2D[0];
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

    const worldViewProjectionMatrix = m3.mul(scene.viewProjectionMatrix, worldMatrix);

    const p = m3.transformVectorT(worldViewProjectionMatrix, [0, 0, 0, 1]);
    // The incoming transform matrix transforms elementSpace to glSpace.
    // Modify the incoming worldMatrix to be compatible with
    // pixel space
    //   - Flip the y translation
    //   - Reverse rotation
    // const tm = worldMatrix;
    const tma = m3.mul([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ], worldViewProjectionMatrix);
    // // Use this to fully transform text
    // const tm = [
    //   tma[0] / p[3], tma[1] / p[3], tma[3] / p[3],
    //   tma[4] / p[3], tma[5] / p[3], tma[7] / p[3],
    //   tma[12] / p[3], tma[13] / p[3], tma[15] / p[3],
    // ];

    // Use this to fully transform text
    const tm = [
      tma[0] / p[3], tma[1] / p[3], tma[3] / p[3],
      tma[4] / p[3], tma[5] / p[3], tma[7] / p[3],
      tma[12] / p[3], tma[13] / p[3], tma[15] / p[3],
    ];

    // // Use this to position text and give it perspective scale only
    // const tm = [
    //   1 / p[3], 0, tma[3] / p[3],
    //   0, 1 / p[3], tma[7] / p[3],
    //   0, 0, tma[15] / p[3],
    // ];

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

    // Some bug I don't understand in webgl is effectively cubing the alph
    // channel. So make the same here to fade-ins happen at same rate
    const c = color.slice();

    // Fill in all the text
    this.text.forEach((figureText) => {
      // eslint-disable-next-line no-param-reassign
      figureText.lastDraw = {
        x: (figureText.locationAligned.x) * scalingFactor,
        y: (figureText.locationAligned.y) * -scalingFactor,
        width: figureText.bounds.width * scalingFactor,
        height: figureText.bounds.height * scalingFactor,
      };
      figureText.font.setFontInContext(ctx, scalingFactor);
      figureText.font.setColorInContext(ctx, c);
      ctx.fillText(
        figureText.text,
        (figureText.locationAligned.x) * scalingFactor,
        (figureText.locationAligned.y) * -scalingFactor,
      );
    });
    ctx.restore();
  }

  clear() {
    const { ctx } = this.drawContext2D[0];
    const t = this.lastDrawTransform;
    ctx.save();
    ctx.transform(t[0], t[3], t[1], t[4], t[2], t[5]);
    this.text.forEach((figureText) => {
      if (figureText.lastDraw != null) {
        const {
          x, y, width, height,
        } = figureText.lastDraw;
        ctx.clearRect(
          x - width * 1, y + height * 0.5, width * 3, -height * 2,
        );
        // eslint-disable-next-line no-param-reassign
        figureText.lastDraw = null;
      }
    });
    ctx.restore();
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [
      ...super._getStateProperties(),
    ];
  }
}

// TextObject is the DrawingObject used in the FigureElementPrimitive.
// TextObject will draw an array of FigureText objects.
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
            touchBorder?: TypeParsableBuffer | Array<Point>,
            onClick?: string | () => void,
        }
        | Array<string | {
            text: string,
            font?: OBJ_Font,
            location?: TypeParsablePoint,
            xAlign?: 'left' | 'right' | 'center',
            yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
            touchBorder?: TypeParsableBuffer | Array<Point>,
            onClick?: string | () => void,
          }>;
      font: OBJ_Font,                    // default font
      fixColor: boolean,
      xAlign: 'left' | 'right' | 'center',                // default xAlign
      yAlign: 'bottom' | 'baseline' | 'middle' | 'top',   // default yAlign
      defaultTextTouchBorder?: number,
      color: TypeColor
    },
  ) {
    let textArray = options.text;
    if (!Array.isArray(textArray)) {
      textArray = [textArray];
    }
    if (options.fixColor != null) {
      this.fixColor = options.fixColor;
    }
    const figureTextArray = [];
    textArray.forEach((textDefinition) => {
      let font;
      let location;
      let xAlign;
      let yAlign;
      let textToUse;
      let touchBorder;
      let onClick;
      if (typeof textDefinition === 'string') {
        textToUse = textDefinition;
      } else {
        ({
          font, location, xAlign, yAlign, touchBorder, onClick,
        } = textDefinition);
        textToUse = textDefinition.text;
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
      if (
        touchBorder != null
        && Array.isArray(touchBorder)
        && !isBuffer(touchBorder)
      ) { // $FlowFixMe
        [touchBorder] = getBorder(touchBorder);
      }
      const fontDefinition = joinObjects({}, options.font, fontToUse);
      figureTextArray.push(new FigureText(
        this.drawContext2D,
        locationToUse,  // $FlowFixMe
        textToUse,
        fontDefinition,
        xAlign || options.xAlign,
        yAlign || options.yAlign, // $FlowFixMe
        touchBorder || options.defaultTextTouchBorder,
        onClick,
      ));
    });
    this.text = figureTextArray;
    // super.loadText();
    this.calcScalingFactor();
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
  textArray: Array<FigureTextLine> | Array<FigureTextLines>,
  initialLocation = new Point(0, 0),
) {
  let lastRight = initialLocation;
  let maxY = 0;
  let minY = 0;
  textArray.forEach((text) => {  // eslint-disable-next-line no-param-reassign
    text.location = lastRight.add(text.offset).add(text.lSpace);
    if (text.inLine) {
      if (text.followOffsetY) {
        lastRight = text.location.add(text.measure.width + text.rSpace, 0);
      } else {
        lastRight = text.location.add(text.measure.width + text.rSpace, -text.offset.y);
      }
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
  textArray: Array<FigureTextLine> | Array<FigureTextLines>,
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
  text: Array<FigureTextLine>;
  xAlign: 'left' | 'right' | 'center';                // default xAlign
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top';   // default yAlign

  // $FlowFixMe
  loadText(
    options: {
      text: Array<string | {
        text: string,
        font?: OBJ_Font,
        offset?: TypeParsablePoint,
        inLine?: boolean,
        touchBorder?: number | Array<Point>,
        onClick?: string | () => void,
        followOffsetY?: boolean,
        lSpace?: number,
        rSpace?: number,
      }>;
      font: OBJ_Font,                    // default font
      xAlign: 'left' | 'right' | 'center',                // default xAlign
      yAlign: 'bottom' | 'baseline' | 'middle' | 'top',   // default yAlign
      color: TypeColor,
      fixColor: boolean,
      defaultTextTouchBorder?: TypeParsableBuffer,
    },
  ) {
    let textArray = options.text;
    if (!Array.isArray(textArray)) {
      textArray = [textArray];
    }
    if (options.fixColor != null) {
      this.fixColor = options.fixColor;
    }
    const figureTextArray = [];
    textArray.forEach((textDefinition) => {
      let font;
      let offset;
      let inLine;
      let followOffsetY;
      let textToUse;
      // let border;
      let touchBorder;
      let onClick;
      let lSpace;
      let rSpace;
      if (typeof textDefinition === 'string') {
        textToUse = textDefinition;
      } else {
        ({
          font, offset, inLine, touchBorder, onClick, followOffsetY,
          lSpace, rSpace,
        } = textDefinition);
        textToUse = textDefinition.text;
        if (
          touchBorder != null
          && Array.isArray(touchBorder)
          && !isBuffer(touchBorder)
        ) { // $FlowFixMe
          [touchBorder] = getBorder(touchBorder);
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

      figureTextArray.push(new FigureTextLine(
        this.drawContext2D,
        new Point(0, 0),
        textToUse,
        fontDefinition,
        offsetToUse,
        inLine, // $FlowFixMe
        touchBorder || options.defaultTextTouchBorder,
        onClick,
        followOffsetY,
        lSpace,
        rSpace,
      ));
    });
    this.text = figureTextArray;
    this.xAlign = options.xAlign;
    this.yAlign = options.yAlign;
    this.calcScalingFactor();
    // this.borderSetup = options.border || [];
    // this.touchBorderSetup = options.touchBorder || [];
    this.layoutText();
  }

  setText(textOrOptions: string | OBJ_TextDefinition, index: number = 1) {
    // if (textOrOptions.text.startsWith('abc')) {
    // }
    this.text[index].setText(textOrOptions);
    this.layoutText();
    // this.setBorder();
    // this.setTouchBorder();
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
  line: Array<FigureTextLines>;
  xAlign: 'left' | 'right' | 'center';                // default xAlign
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top';   // default yAlign
  lines: Array<{
    justify: 'left' | 'right' | 'center',
    space: number,
    text: Array<FigureTextLines>;
    width: number,
  }>;

  modifiers: {
    [modifierName: string]: {
      text?: string,
        offset?: TypeParsablePoint,
        inLine?: boolean,
        font?: OBJ_Font,
        // border?: 'rect' | Array<Point>,
        // touchBorder?: 'border' | 'rect' | number | Array<Point>,
        touchBorder?: TypeParsableBuffer | Array<Point>,
        onClick?: () => void,
        lSpace?: number,
        rSpace?: number,
        followOffsetY?: boolean,
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
        // border?: 'rect' | Array<Point>,
        touchBorder?: TypeParsableBuffer | Array<Point>,
        onClick?: () => void,
        followOffsetY?: boolean,
        lSpace?: number,
        rSpace?: number,
      },
    },
    defaultTextTouchBorder?: number,
    font: OBJ_Font,
    justify: 'left' | 'center' | 'right',
    lineSpace: number,
    xAlign: 'left' | 'right' | 'center',
    yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
    color: TypeColor,
    fixColor: boolean,
    // border?: 'rect' | Array<Point>,
    // touchBorder?: 'rect' | number | 'border' | Array<Point>,
  },
  ) {
    // let { lines } = options;
    let textLines = options.text;
    if (typeof textLines === 'string') {
      textLines = [textLines];
    }
    if (options.fixColor != null) {
      this.fixColor = options.fixColor;
    }
    this.modifiers = options.modifiers || {};
    this.lines = [];
    const figureTextArray = [];

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
          lineFont = joinObjects({}, { color: options.color }, options.font, font);
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
        // let border;
        let touchBorder;
        let onClick;
        let followOffsetY = false;
        let rSpace = 0;
        let lSpace = 0;
        if (this.modifiers[s] != null) {
          const mod = this.modifiers[s];
          if (mod.text != null) {
            ({ text } = mod);
          }
          if (mod.font != null) {
            textFont = joinObjects({}, lineFont, mod.font);
          }
          if (mod.inLine != null) { inLine = mod.inLine; }
          if (mod.offset != null) { offset = mod.offset; }
          // if (mod.border != null) {
          //   border = mod.border;
          // }
          if (mod.touchBorder != null) {
            touchBorder = mod.touchBorder;
            if (
              touchBorder != null
              && Array.isArray(touchBorder)
              && !isBuffer(touchBorder)
            ) { // $FlowFixMe
              [touchBorder] = getBorder(touchBorder);
            }
          }
          if (mod.onClick != null) { onClick = mod.onClick; }
          if (mod.followOffsetY != null) { followOffsetY = mod.followOffsetY; }
          if (mod.lSpace != null) { lSpace = mod.lSpace; }
          if (mod.rSpace != null) { rSpace = mod.rSpace; }
          // if (Array.isArray(border)) {  // $FlowFixMe
          //   border = getPoints(border);
          // }
          // if (Array.isArray(touchBorder)) {  // $FlowFixMe
          //   touchBorder = getBorder(touchBorder);
          // }
        }
        const t = new FigureTextLines(
          this.drawContext2D,
          new Point(0, 0),
          text,
          textFont,
          offset,
          inLine,
          lineIndex, // $FlowFixMe
          touchBorder || options.defaultTextTouchBorder,
          onClick,
          followOffsetY,
          lSpace,
          rSpace,
        );
        figureTextArray.push(t);
        line.push(t);
      });
      this.lines.push({
        justify: lineJustification,
        space: lineLineSpace,
        text: line,
        width: 0,
      });
    });
    this.text = figureTextArray;
    this.xAlign = options.xAlign;
    this.yAlign = options.yAlign;
    // super.super.loadText();
    this.calcScalingFactor();
    // this.borderSetup = options.border || [];
    // this.touchBorderSetup = options.touchBorder || [];
    this.layoutText();
  }

  setText(textOrOptions: string | OBJ_TextDefinition, index: number = 0) {
    this.text[index].setText(textOrOptions);
    this.layoutText();
  }

  setTextLocations() {
    const { width, minY, maxY } = this.createLines(); // $FlowFixMe
    align(this.text, this.xAlign, this.yAlign, width, minY, maxY);
  }

  createLines() {
    let maxLinesY = 0;
    let minLinesY = 0;
    let maxLinesWidth = 0;
    let y = 0;
    this.lines.forEach((line, index) => {
      if (index > 0 && line.text.length > 0) {
        y -= line.space;
      } else if (index > 0 && line.text.length === 0) {
        y -= line.space / 3;
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
  FigureFont, FigureText, TextObject, TextLineObject,
  TextLinesObject, TextObjectBase,
};
