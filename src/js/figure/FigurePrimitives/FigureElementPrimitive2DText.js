// @flow
import * as m2 from '../../tools/m2';
import * as m3 from '../../tools/m3';
import type { OBJ_FigureForElement } from '../Figure';
import { FigureElementPrimitive } from '../Element';
import { isPointInPolygon } from '../../tools/geometry/polygon';
import type {
  FunctionMap,
} from '../../tools/FunctionMap';
import {
  Point, Rect, getBoundingBorder, isBuffer, getPoint, getBorder,
} from '../../tools/g2';
import type { TypeParsableBuffer, TypeParsablePoint } from '../../tools/g2';
import type Scene from '../../tools/geometry/scene';
import type { Type3DMatrix } from '../../tools/m3';
import { joinObjects } from '../../tools/tools';
// import type { OBJ_Generic } from './FigurePrimitiveTypes2D';
import type GLObject from '../DrawingObjects/GLObject/GLObject';
import DrawingObject from '../DrawingObjects/DrawingObject';
import { FigureFont } from '../DrawingObjects/TextObject/TextObject';
import type { OBJ_Font, TypeColor } from '../../tools/types';
import type { OBJ_GLText_Fixed } from './FigureElementPrimitiveGLText';
import type DrawContext2D from '../DrawContext2D';

// export type OBJ_TextAdjustments = {
//   width: number,
//   descent: number,
//   ascent: number,
// };

// export type OBJ_2DText = {
//   text: string,
//   font?: OBJ_Font,
//   xAlign?: 'left' | 'center' | 'right';
//   yAlign?: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
//   adjustments?: OBJ_TextAdjustments;
// } & OBJ_Generic;

// export type OBJ_2DText_Fixed = {
//   text: string,
//   font: OBJ_Font,
//   xAlign: 'left' | 'center' | 'right';
//   yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
//   adjustments: OBJ_TextAdjustments;
// } & OBJ_Generic;
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
    let ascent = aWidth * this.font.maxAscent;
    let descent = aWidth * this.font.descent;

    // Uncomment below and change above consts to lets if more resolution on
    // actual text boundaries is needed

    // const maxAscentRe =
    //   /[ABCDEFGHIJKLMNOPRSTUVWXYZ1234567890!#%^&()@$Qbdtfhiklj]/g;
    const midAscentRe = /[acemnorsuvwxz*gyqp: ]/g;
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
        ascent = aWidth * this.font.midAscent;
      }
    }

    const midDescentMatches = this.text.match(midDecentRe);
    if (Array.isArray(midDescentMatches)) {
      if (midDescentMatches.length > 0) {
        descent = aWidth * this.font.midDescent;
      }
    }

    const maxDescentMatches = this.text.match(maxDescentRe);
    if (Array.isArray(maxDescentMatches)) {
      if (maxDescentMatches.length > 0) {
        descent = aWidth * this.font.maxDescent;
      }
    }
    // const height = ascent + descent;

    const { width } = ctx.measureText(this.text);
    // width *= this.font.width;
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
  // For example, if we have a figure with scene: min: (0, 0), max(2, 1)
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

// $FlowFixMe
export default class FigureElementPrimitiveGLText extends FigureElementPrimitive {
  text: string;
  font: FigureFont;
  atlas: Object;

  adjustments: {
    width: number,
    descent: number,
    ascent: number,
  };

  measure: {
    ascent: number,
    descent: number,
    width: number,
  };

  location: Point;
  bounds: Rect;

  fontSize: number;
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  dimension: number;

  // $FlowFixMe
  drawingObject: GLObject;
  textBorder: Array<Point>;
  textBorderBuffer: Array<Point>;

  constructor(drawContext2D: DrawContext2D, options: OBJ_GLText_Fixed) {
    const to = new TextObject(drawContext2D);
    to.loadText(options);
    super(to, options.transform, options.color, options.parent, options.name);
  }

  // setup(options: OBJ_GLText_Fixed) {
  //   this.font = new FigureFont(options.font);
  //   this.atlas = {};
  //   if (typeof options.text[0] === 'string') {
  //     this.text = options.text[0];
  //   } else {
  //     this.text = options.text[0].text;
  //   }
  //   this.xAlign = options.xAlign;
  //   this.yAlign = options.yAlign;
  //   // this.verticals = options.verticals;
  //   this.adjustments = options.adjustments;
  //   this.drawBorder = [new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(0, 1)];
  //   this.drawBorderBuffer = this.drawBorder;
  //   this.color = this.font.color;
  // }

  // showMap(dimension: number = 1) {
  //   const d = dimension;
  //   this.drawingObject.updateVertices([0, 0, d, 0, d, d, 0, 0, d, d, 0, d]);
  //   const points = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];
  //   this.drawingObject.updateTextureMap(points);
  //   this.animateNextFrame();
  // }

  // setFigure(figure: OBJ_FigureForElement) {
  //   this.figure = figure;
  //   if (figure != null) {
  //     this.recorder = figure.recorder;
  //     this.animationFinishedCallback = figure.animationFinished;
  //     this.timeKeeper = figure.timeKeeper;
  //     this.animations.timeKeeper = figure.timeKeeper;
  //     this.animations.recorder = figure.recorder;
  //   }
  //   if (this.isTouchable) {
  //     this.setTouchable();
  //   }
  //   if (this.isMovable) {
  //     this.setMovable();
  //   }
  //   this.createAtlas();
  //   this.setText(this.text);
  //   this.notifications.publish('setFigure');
  // }
  // setText(text: string) {
  //   this.text = text;
  // }

  measureText(text: string, fontSize: number, width: number) {
    const aWidth = fontSize / 2;
    let ascent = aWidth * this.font.maxAscent;
    let descent = aWidth * this.font.descent;
    // const maxAscentRe =
    //   /[ABCDEFGHIJKLMNOPRSTUVWXYZ1234567890!#%^&()@$Qbdtfhiklj]/g;
    const midAscentRe = /[acemnorsuvwxz*gyqp: ]/g;
    const midDecentRe = /[;,$]/g;
    let maxDescentRe = /[gjyqp@Q(){}[\]|]/g;
    if (this.font.family === 'Times New Roman') {
      if (this.font.style === 'italic') {
        maxDescentRe = /[gjyqp@Q(){}[\]|f]/g;
      }
    }
    const midAscentMatches = text.match(midAscentRe);
    if (Array.isArray(midAscentMatches)) {
      if (midAscentMatches.length === text.length) {
        ascent = aWidth * this.font.midAscent;
      }
    }

    const midDescentMatches = text.match(midDecentRe);
    if (Array.isArray(midDescentMatches)) {
      if (midDescentMatches.length > 0) {
        descent = aWidth * this.font.midDescent;
      }
    }

    const maxDescentMatches = text.match(maxDescentRe);
    if (Array.isArray(maxDescentMatches)) {
      if (maxDescentMatches.length > 0) {
        descent = aWidth * this.font.maxDescent;
      }
    }
    return {
      ascent, descent, width,
    };
  }

  // measureAndAlignText() {
  //   const { text } = this;
  //   const vertices = [];
  //   const texCoords = [];
  //   let x = 0;
  //   const r = this.font.size / this.fontSize;
  //   let totalWidth = 0;
  //   let maxDescent = 0;
  //   let maxAscent = 0;
  //   for (let i = 0; i < text.length; i += 1) {
  //     const {
  //       width, ascent, descent, offsetX, offsetY,
  //     } = this.atlas[this.text[i]];
  //     const s = 0.5;
  //     const minX = x - width * r * s;
  //     const maxX = x + width * r + width * r * s;
  //     vertices.push(minX, -descent * r, maxX, -descent * r, maxX, ascent * r);
  //     vertices.push(minX, -descent * r, maxX, ascent * r, minX, ascent * r);
  //     texCoords.push(
  //       offsetX - width * s, offsetY - descent,
  //       offsetX + width + width * s, offsetY - descent,
  //       offsetX + width + width * s, offsetY + ascent,
  //     );
  //     texCoords.push(
  //       offsetX - width * s, offsetY - descent,
  //       offsetX + width + width * s, offsetY + ascent,
  //       offsetX - width * s, offsetY + ascent,
  //     );
  //     x += width * r;
  //     totalWidth += width * r;
  //     maxDescent = Math.max(descent * r, maxDescent);
  //     maxAscent = Math.max(ascent * r, maxAscent);
  //   }
  //   maxAscent += this.adjustments.ascent;
  //   maxDescent += this.adjustments.descent;
  //   totalWidth += this.adjustments.width;
  //   let ox = 0;
  //   let oy = 0;
  //   if (this.xAlign === 'center') {
  //     ox = -totalWidth / 2;
  //   } else if (this.xAlign === 'right') {
  //     ox = -totalWidth;
  //   }
  //   if (this.yAlign === 'bottom') {
  //     oy = maxDescent;
  //   } else if (this.yAlign === 'top') {
  //     oy = -maxAscent;
  //   } else if (this.yAlign === 'middle') {
  //     oy = maxDescent - (maxAscent + maxDescent) / 2;
  //   }
  //   for (let i = 0; i < vertices.length; i += 2) {
  //     vertices[i] += ox;
  //   }
  //   for (let i = 1; i < vertices.length; i += 2) {
  //     vertices[i] += oy;
  //   }
  //   this.drawingObject.updateVertices(vertices);
  //   this.drawingObject.updateTextureMap(texCoords.map(v => v / this.dimension));

  //   this.location = new Point(ox, oy);
  //   this.measure = {
  //     ascent: maxAscent,
  //     descent: maxDescent,
  //     width: totalWidth,
  //   };
  // }

  // setText(text: string) {
  //   this.text = text;
  //   this.measureAndAlignText();
  //   this.calcBorderAndBounds();
  // }

  // setFont(font: OBJ_Font) {
  //   const newFont = joinObjects({}, this.font.definition(), font);
  //   this.font = new FigureFont(newFont);
  //   this.measureAndAlignText();
  //   this.calcBorderAndBounds();
  // }

  calcBorderAndBounds() {
    this.calcBounds();
    this.calcBorder();
    this.calcTouchBorder();
  }

  calcBounds() {
    this.bounds = new Rect(
      this.location.x,
      this.location.y - this.measure.descent,
      this.measure.width,
      this.measure.ascent + this.measure.descent,
    );
  }

  calcBorder() {
    this.textBorder = [
      new Point(this.bounds.left, this.bounds.bottom),
      new Point(this.bounds.right, this.bounds.bottom),
      new Point(this.bounds.right, this.bounds.top),
      new Point(this.bounds.left, this.bounds.top),
    ];
    this.drawBorder = this.textBorder;
  }

  calcTouchBorder() {
    if (isBuffer(this.touchBorder)) { // $FlowFixMe
      this.textBorderBuffer = getBoundingBorder(this.textBorder, this.touchBorder);
      this.drawBorderBuffer = this.textBorderBuffer;
    } else { // $FlowFixMe
      this.textBorderBuffer = this.touchBorder;
      this.drawBorderBuffer = this.drawBorder;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  setTextBorder() {}

  // eslint-disable-next-line class-methods-use-this
  setTouchBorder() {}

  // _getStateProperties(options: { ignoreShown?: boolean }) {
  //   // eslint-disable-line class-methods-use-this
  //   return [...super._getStateProperties(options),
  //     'xAlign',
  //     'pan',
  //     'onlyWhenTouched',
  //     'originalPosition',
  //   ];
  // }
}
