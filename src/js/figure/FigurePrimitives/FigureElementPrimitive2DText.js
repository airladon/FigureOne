// @flow
import * as m2 from '../../tools/m2';
import * as m3 from '../../tools/m3';
// import type { OBJ_FigureForElement } from '../Figure';
import { FigureElementPrimitive } from '../Element';
import type { FigureElement } from '../Element';
// import { isPointInPolygon } from '../../tools/geometry/polygon';
// import type {
//   FunctionMap,
// } from '../../tools/FunctionMap';
import {
  Point, Rect, getBoundingBorder, isBuffer,
} from '../../tools/g2';
import type {
  Transform,
} from '../../tools/g2';
// import type { TypeParsableBuffer, TypeParsablePoint } from '../../tools/g2';
import type Scene from '../../tools/geometry/scene';
import type { Type3DMatrix } from '../../tools/m3';
import { joinObjects } from '../../tools/tools';
// import type { OBJ_Generic } from './FigurePrimitiveTypes2D';
import DrawingObject from '../DrawingObjects/DrawingObject';
import { FigureFont } from '../DrawingObjects/TextObject/TextObject';
import type { OBJ_Font, TypeColor } from '../../tools/types';
import type { OBJ_GLText_Fixed, OBJ_SetText } from './FigureElementPrimitiveGLText';
import type DrawContext2D from '../DrawContext2D';


class TextObject extends DrawingObject {
  drawContext2D: DrawContext2D;
  // text: Array<FigureTextBase>;
  scalingFactor: number;
  lastDrawTransform: Array<number>;

  bounds: Rect;
  // $FlowFixMe
  textBorder: Array<Point>;
  // textBorderBuffer: Array<Array<Point>>;

  text: string;
  location: Point;
  font: FigureFont;
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';

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

  adjustments: {
    ascent: number,
    descent: number,
    width: number,
  }

  underline: [number, number];

  constructor(
    drawContext2D: DrawContext2D,
    options: OBJ_GLText_Fixed,
  ) {
    super();
    this.drawContext2D = drawContext2D;
    this.lastDrawTransform = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    this.font = new FigureFont(options.font);
    if (typeof options.text[0] === 'string') {  // eslint-disable-next-line
      this.text = options.text[0];
    } else {
      this.text = options.text[0].text;
    }
    this.xAlign = options.xAlign;
    this.yAlign = options.yAlign;
    this.adjustments = options.adjustments;
    this.underline = [0, 0];
    this.setText(this.text);
  }

  getCanvas() {
    return this.drawContext2D.canvas;
  }


  // click(p: Point, fnMap: FunctionMap) {
  //   this.text.forEach((text) => {
  //     if (text.onClick != null) {
  //       if (isPointInPolygon(p, text.textBorderBuffer)) {
  //         fnMap.exec(text.onClick, fnMap);
  //       }
  //     }
  //   });
  // }

  calcScalingFactor() {
    this.scalingFactor = 20 / this.font.size;
  }

  // $FlowFixMe
  setText(text: string | OBJ_SetText) {
    this.clear();
    if (typeof text === 'string') {
      this.text = text;
    } else {
      if (text.font != null) {
        this.font = joinObjects({}, this.font.definition, text.font);
      }
      if (text.xAlign != null) {
        this.xAlign = text.xAlign;
      }
      if (text.yAlign != null) {
        this.yAlign = text.yAlign;
      }
      if (text.adjustments != null) {
        this.adjustments = joinObjects({}, this.adjustments, text.adjustments);
      }
    }
    this.calcScalingFactor();
    this.measureText();
    this.alignText();
    this.calcBorder();
    // this.calcBorderAndBounds();
  }

  setFont(font: OBJ_Font) {
    this.setText({ font });
  }

  measureText(
    ctx: CanvasRenderingContext2D = this.drawContext2D.ctx,
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
    if (this.font.underline !== false) {
      this.underline = this.font.getUnderline();
      const uDescent = this.underline[0] * scalingFactor;
      const uWidth = this.underline[1] * scalingFactor;
      if (uDescent > descent) {
        descent = uDescent;
      }
      if (uDescent < 0) {
        if (-uDescent + uWidth > ascent) {
          ascent = -uDescent + uWidth;
        }
      }
    } else {
      this.underline = [0, 0];
    }
    this.measure = {
      ascent: ascent / scalingFactor,
      descent: descent / scalingFactor,
      width: width / scalingFactor,
    };
    return this.measure;
  }

  // getUnderline() {
  //   if (this.font.underline === false) {
  //     return [0, 0];
  //   }
  //   if (this.font.underline === true) {
  //     return [this.font.size / 20 + this.font.size / 40, this.font.size / 40];
  //   }
  //   if (typeof this.font.underline === 'number') {
  //     return [this.font.underline, this.font.size / 40];
  //   }
  //   return this.font.underline;
  // }

  alignText() {
    const location = new Point(0, 0);
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
    this.location = location;
  }

  // calcBounds() {
  //   this.bounds = new Rect(
  //     this.location.x,
  //     this.location.y - this.measure.descent,
  //     this.measure.width,
  //     this.measure.ascent + this.measure.descent,
  //   );
  // }

  // getBoundary(
  //   transformMatrix: Type3DMatrix | null,
  // ): Array<Point> {
  //   if (transformMatrix == null) {
  //     return this.textBorder;
  //   }
  //   const boundary = [];
  //   this.textBorder.forEach((p) => {
  //     boundary.push(p.transformBy(transformMatrix));
  //   });
  //   return boundary;
  // }

  calcBorder() {
    const bounds = new Rect(
      this.location.x,
      this.location.y - this.measure.descent,
      this.measure.width,
      this.measure.ascent + this.measure.descent,
    );
    this.bounds = bounds;

    this.textBorder = [
      new Point(bounds.left, bounds.bottom),
      new Point(bounds.right, bounds.bottom),
      new Point(bounds.right, bounds.top),
      new Point(bounds.left, bounds.top),
    ];
  }

  // setOpacity(opacity: number, index: null | number = 0) {
  //   this.clear();
  //   if (index === null) {
  //     for (let i = 0; i < this.text.length; i += 1) {
  //       this.setFont({ opacity }, i);
  //     }
  //   } else {
  //     this.setFont({ opacity }, index);
  //   }
  // }

  // setColor(color: TypeColor, index: null | number = null) {
  //   // if (this.fixColor) {
  //   //   return;
  //   // }
  //   if (index === null) {
  //     for (let i = 0; i < this.text.length; i += 1) {
  //       this.text[i].font.color = color.slice();
  //     }
  //   } else {
  //     this.text[index].font.color = color.slice();
  //   }
  // }

  // layoutText() {
  //   this.text.forEach((t) => {
  //     t.calcBorderAndBounds();
  //   });
  //   this.setBorder();
  //   this.setTouchBorder();
  // }

  // setBorder() {
  //   // this.setGenericBorder('border');
  //   this.textBorder = [];
  //   this.text.forEach((text) => {
  //     this.textBorder.push(text.textBorder);
  //   });
  // }

  // setTouchBorder() {
  //   this.textBorderBuffer = [];
  //   this.text.forEach((text) => {
  //     this.textBorderBuffer.push(text.textBorderBuffer);
  //   });
  // }


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
    const { drawContext2D } = this;
    const { ctx } = drawContext2D;
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
    // eslint-disable-next-line no-param-reassign
    // this.lastDraw = {
    //   x: (this.location.x) * scalingFactor,
    //   y: (this.location.y) * -scalingFactor,
    //   width: this.bounds.width * scalingFactor,
    //   height: this.bounds.height * scalingFactor,
    // };
    this.lastDraw = {
      x: (this.location.x) * scalingFactor,
      y: (this.bounds.bottom) * -scalingFactor,
      width: this.bounds.width * scalingFactor,
      height: this.bounds.height * scalingFactor,
    };
    this.font.setFontInContext(ctx, scalingFactor);
    this.font.setColorInContext(ctx, c);
    ctx.fillText(
      this.text,
      (this.location.x) * scalingFactor,
      (this.location.y) * -scalingFactor,
    );
    // console.log(this.text, c)
    if (this.font.underline !== false) {
      const [uDescent, uWidth] = this.underline;
      ctx.fillRect(
        (this.location.x) * scalingFactor,
        (this.location.y - uDescent + uWidth) * -scalingFactor,
        this.bounds.width * scalingFactor,
        uWidth * scalingFactor,
      );
    }
    // ctx.fillStyle = 'blue';
    // ctx.fill();
    ctx.restore();
  }

  clear() {
    const { ctx } = this.drawContext2D;
    const t = this.lastDrawTransform;
    ctx.save();
    ctx.transform(t[0], t[3], t[1], t[4], t[2], t[5]);
    if (this.lastDraw != null) {
      const {
        x, y, width, height,
      } = this.lastDraw;
      ctx.clearRect(
        x - width * 1, y + height * 0.5, width * 3, -height * 2,
      );
      // eslint-disable-next-line no-param-reassign
      this.lastDraw = null;
    }
    ctx.restore();
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [
      ...super._getStateProperties(),
    ];
  }

  // _dup() {
  //   const c = new TextObject(this.drawContext2D); // $FlowFixMe
  //   c.text = this.text.map(t => t._dup());
  //   c.scalingFactor = this.scalingFactor;
  //   c.layoutText();
  //   return c;
  // }
}

// $FlowFixMe
export default class FigureElementPrimitive2DText extends FigureElementPrimitive {
  // $FlowFixMe
  drawingObject: TextObject;

  constructor(
    drawContext2D: DrawContext2D,
    options: OBJ_GLText_Fixed & {
      parent: null | FigureElement, transform: Transform, color: TypeColor,
      name: string,
    },
  ) {
    const to = new TextObject(drawContext2D, options);
    // to.loadText(options);
    super(to, options.transform, options.color, options.parent, options.name);
    this.calcBorderAndBounds();
  }

  /**
   * Change the text in the primitive.
   *
   * @param {string | OBJ_SetText} text
   */
  setText(text: string | OBJ_SetText) {
    this.drawingObject.setText(text);
    this.calcBorderAndBounds();
    if (this.drawingObject.font.color != null) {
      this.setColor(this.drawingObject.font.color, true);
    }
  }

  calcBorderAndBounds() {
    this.calcBorder();
    this.calcTouchBorder();
  }

  calcBorder() {
    this.drawingObject.calcBorder();
    this.drawBorder = [this.drawingObject.textBorder];
  }

  calcTouchBorder() {
    if (isBuffer(this.touchBorder)) { // $FlowFixMe
      this.drawBorderBuffer = [getBoundingBorder(this.drawBorder, this.touchBorder)];
    } else { // $FlowFixMe
      this.drawBorderBuffer = this.drawBorder;
    }
  }

  /**
   * Change only the font of the text.
   *
   * @param {OBJ_Font} font
   */
  setFont(font: OBJ_Font) {
    this.drawingObject.setFont(font);
    if (this.drawingObject.font.color != null) {
      this.setColor(this.drawingObject.font.color, true);
    }
  }

  /**
   * Get the text shown by the primitive.
   *
   * @return string
   */
  getText() {
    return this.drawingObject.text;
  }

  setColor(color: TypeColor, setDefault: boolean = true) {
    super.setColor(color, setDefault);
    this.drawingObject.font.color = color.slice();
  }

  // // eslint-disable-next-line class-methods-use-this
  // setTextBorder() {}

  // // eslint-disable-next-line class-methods-use-this
  // setTouchBorder() {}

  measureAndAlignText() {
    this.drawingObject.measureText();
    this.drawingObject.alignText();
    this.drawingObject.calcBorder();
  }
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
