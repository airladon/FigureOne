// @flow

import * as m2 from '../../../tools/m2';
import { Point, getPoint, Rect } from '../../../tools/g2';
import type { TypeParsablePoint } from '../../../tools/g2';
import DrawingObject from '../DrawingObject';
import DrawContext2D from '../../DrawContext2D';
import { duplicateFromTo, joinObjects, splitString } from '../../../tools/tools';
import { colorArrayToRGBA } from '../../../tools/color';

export type TypeDiagramFontDefinition = {
  family?: string,
  style?: 'normal' | 'italic',
  size?: number,
  weight?: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  color?: Array<number> | null,
  opacity?: number,
};

// DiagramFont defines the font properties to be used in a TextObject
class DiagramFontAF {
  size: number;
  weight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  style: 'normal' | 'italic';
  family: string;
  color: Array<number> | null;
  opacity: number;

  constructor(optionsIn: TypeDiagramFontDefinition  | DiagramFontAF = {}) {
    if (optionsIn instanceof DiagramFontAF) {
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
      style: '',
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
    return new DiagramFontAF({
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
class DiagramTextAF {
  drawContext2D: Array<DrawContext2D>
  location: Point;
  locationAligned: Point;
  text: string;
  font: DiagramFontAF;
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  lastDrawRect: Rect;
  bounds: Rect;
  border: [Point, Point, Point, Point];
  measure: {
    ascent: number,
    descent: number,
    width: number,
  };

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    location: TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: TypeDiagramFontDefinition = new DiagramFontAF().definition(),
    xAlign: 'left' | 'center' | 'right' = 'left',
    yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline' = 'baseline',
  ) {
    this.location = getPoint(location)._dup();
    this.locationAligned = this.location._dup();
    this.text = text.slice();
    this.font = new DiagramFontAF(font);
    this.xAlign = xAlign;
    this.yAlign = yAlign;
    this.lastDrawRect = new Rect(0, 0, 1, 1);
    if (Array.isArray(drawContext2D)) {
      this.drawContext2D = drawContext2D;
    } else {
      this.drawContext2D = [drawContext2D];
    }
    this.update();
  }

  update() {
    this.measureText();
    this.alignText();
    this.calcBounds();
    this.calcBorder();
  }

  setText(text: string) {
    this.text = text.slice();
    this.update();
  }

  setFont(font: TypeDiagramFontDefinition) {
    const newFont = joinObjects({}, this.font.definition, font);
    this.font = new DiagramFontAF(newFont);
    this.update();
  }

  setXAlign(xAlign: 'left' | 'center' | 'right') {
    this.xAlign = xAlign;
    this.alignText();
    this.calcBounds();
    this.calcBorder();
  }

  setYAlign(yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline') {
    this.yAlign = yAlign;
    this.alignText();
    this.calcBounds();
    this.calcBorder();
  }

  _dup() {
    return new DiagramTextAF(
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

    // Estimations of FONT ascent and descent for a baseline of "alphabetic"
    let ascent = aWidth * 1.4;
    let descent = aWidth * 0.08;

    // Uncomment below and change above consts to lets if more resolution on
    // actual text boundaries is needed

    // const maxAscentRe =
    //   /[ABCDEFGHIJKLMNOPRSTUVWXYZ1234567890!#%^&()@$Qbdtfhiklj]/g;
    const midAscentRe = /[acemnorsuvwxz*gyqp]/g;
    const midDecentRe = /[;,$]/g;
    const maxDescentRe = /[gjyqp@Q(){}[\]|]/g;

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
      location.y += this.measure.descent - (this.measure.ascent - this.measure.descent) / 2;
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
      this.measure.ascent - this.measure.descent,
    );
  }

  getGLBoundary(
    lastDrawTransformMatrix: Array<number>,
  ): Array<Point> {
    const glBoundary = []; 
    this.border.forEach((p) => {
      glBoundary.push(p.transformBy(lastDrawTransformMatrix));
    });
    return glBoundary;
  }

  calcBorder() {
    this.border = [
      new Point(this.bounds.left, this.bounds.bottom),
      new Point(this.bounds.left, this.bounds.top),
      new Point(this.bounds.right, this.bounds.top),
      new Point(this.bounds.right, this.bounds.bottom),
    ];
  }
}

class DiagramTextLineAF extends DiagramTextAF {
  offset: Point;
  inLine: boolean;

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    location: TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: TypeDiagramFontDefinition = new DiagramFontAF().definition(),
    offset: TypeParsablePoint = new Point(0, 0),
    inLine: boolean = true,
  ) {
    super(drawContext2D, location, text, font, 'left', 'baseline');
    this.offset = getPoint(offset);
    this.inLine = inLine;
  }

  alignText() {
    const location = this.location._dup();
    this.locationAligned = location.add(this.offset);
  }
}

function loadTextFromOptions(
  drawContext2D: Array<DrawContext2D>,
  options: {
    text: string | Array<string | [{
      font?: TypeDiagramFontDefinition,
      location?: TypeParsablePoint,
      xAlign?: 'left' | 'right' | 'center',
      yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
      onClick?: () => void,
    }, string]>;
    font: TypeDiagramFontDefinition,                    // default font
    xAlign: 'left' | 'right' | 'center',                // default xAlign
    yAlign: 'bottom' | 'baseline' | 'middle' | 'top',   // default yAlign
    color: Array<number>
  } | Array<DiagramTextAF>,
) {
  if (!Array.isArray(options)) {
    let textArray = options.text;
    if (typeof textArray === 'string') {
      textArray = [textArray];
    }
    const diagramTextArray = [];
    textArray.forEach((textDefinition) => {
      let font;
      let location;
      let xAlign;
      let yAlign;
      let textToUse;
      if (Array.isArray(textDefinition) && textDefinition.length === 2) {
        [{
          font, location, xAlign, yAlign,
        }, textToUse] = textDefinition;
      } else {
        textToUse = textDefinition;
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

      diagramTextArray.push(new DiagramTextAF(
        drawContext2D,
        locationToUse,
        textToUse,
        fontDefinition,
        xAlign || options.xAlign,
        yAlign || options.yAlign,
      ));
    });
    return diagramTextArray;
  }
  return options;
}

// TextObject is the DrawingObject used in the DiagramElementPrimitive.
// TextObject will draw an array of DiagramText objects.
class TextObjectAF extends DrawingObject {
  drawContext2D: Array<DrawContext2D>
  text: Array<DiagramTextAF>;
  scalingFactor: number;
  lastDrawTransform: Array<number>;

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    // text: Array<DiagramTextAF> = [],
    options: {
      text: string | Array<string | [{
        font?: TypeDiagramFontDefinition,
        location?: TypeParsablePoint,
        xAlign?: 'left' | 'right' | 'center',
        yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
        onClick?: () => void,
      }, string]>;
      font: TypeDiagramFontDefinition,                    // default font
      xAlign: 'left' | 'right' | 'center',                // default xAlign
      yAlign: 'bottom' | 'baseline' | 'middle' | 'top',   // default yAlign
      color: Array<number>
    } | Array<DiagramTextAF>,
  ) {
    super();

    if (Array.isArray(drawContext2D)) {
      this.drawContext2D = drawContext2D;
    } else {
      this.drawContext2D = [drawContext2D];
    }
    this.lastDrawTransform = [];
    this.text = loadTextFromOptions(this.drawContext2D, options);
    this.setTextLocations();
    this.calcScalingFactor();
    this.layoutText();
    this.state = 'loaded';
  }

  // eslint-disable-next-line class-methods-use-this
  setTextLocations() {
  }

  loadOptions(options: {
      text: string | Array<string | [{
        font?: TypeDiagramFontDefinition,
        location?: TypeParsablePoint,
        xAlign?: 'left' | 'right' | 'center',
        yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
        onClick?: () => void,
      }, string]>;
      font: TypeDiagramFontDefinition,                    // default font
      xAlign: 'left' | 'right' | 'center',                // default xAlign
      yAlign: 'bottom' | 'baseline' | 'middle' | 'top',   // default yAlign
      color: Array<number>
    } | Array<DiagramTextAF>) {
    if (!Array.isArray(options)) {
      let textArray = options.text;
      if (typeof textArray === 'string') {
        textArray = [textArray];
      }
      const diagramTextArray = [];
      textArray.forEach((textDefinition) => {
        let font;
        let location;
        let xAlign;
        let yAlign;
        let textToUse;
        if (Array.isArray(textDefinition) && textDefinition.length === 2) {
          [{
            font, location, xAlign, yAlign,
          }, textToUse] = textDefinition;
        } else {
          textToUse = textDefinition;
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

        diagramTextArray.push(new DiagramTextAF(
          this.drawContext2D,
          locationToUse,
          textToUse,
          fontDefinition,
          xAlign || options.xAlign,
          yAlign || options.yAlign,
        ));
      });
      this.text = diagramTextArray;
    } else {
      this.text = options;
    }
  }

  calcScalingFactor() {
    this.scalingFactor = 1;
    if (this.text.length > 0) {
      let minSize = this.text[0].font.size;
      this.text.forEach((t) => {
        if (t.font.size > 0 && t.font.size < minSize) {
          minSize = t.font.size;
        }
      });
      this.scalingFactor = 20 / minSize;
    }
  }

  setText(text: string, index: number = 0) {
    this.text[index].setText(text);
  }

  _dup() {
    const c = new TextObjectAF(this.drawContext2D, this.text);

    // duplicateFromTo(this, c);
    // c.scalingFactor = this.scalingFactor;
    // c.border = this.border.map(b => b.map(p => p._dup()));
    return c;
  }

  setFont(font: TypeDiagramFontDefinition, index: null | number = 0) {
    if (index === null) {
      for (let i = 0; i < this.text.length; i += 1) {
        this.text[i].setFont(font);
      }
    } else {
      this.text[index].setFont(font);
    }
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
    // Align text here if needed
    // this.text.forEach((text) => {
    //   text.locationAligned =
    // });
    this.setBorder();
  }

  setBorder() {
    this.border = [];
    this.text.forEach((text) => {
      this.border.push(
        text.border,
      );
    });
  }

  getGLBoundaries(lastDrawTransformMatrix: Array<number>): Array<Array<Point>> {
    const glBoundaries = [];
    this.text.forEach((t) => {
      glBoundaries.push(t.getGLBoundary(lastDrawTransformMatrix));
    });
    return glBoundaries;
  }

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

  clear(contextIndex: number = 0) {
    const { ctx } = this.drawContext2D[contextIndex];
    const t = this.lastDrawTransform;
    ctx.save();
    ctx.transform(t[0], t[3], t[1], t[4], t[2], t[5]);
    this.text.forEach((text) => {
      const x = text.bounds.left * this.scalingFactor;
      const y = text.bounds.bottom * this.scalingFactor;
      ctx.clearRect(
        x,
        y,
        text.bounds.width * 3,
        text.bounds.height * 2,
      );
    });
    ctx.restore();
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [
      ...super._getStateProperties(),
    ];
  }
}

class TextLineObjectAF extends TextObjectAF {
  xAlign: 'left' | 'right' | 'center';                // default xAlign
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top';   // default yAlign

  // $FlowFixMe
  loadOptions(options: {
      text: string | Array<string | [{
        font?: TypeDiagramFontDefinition,
        offset?: TypeParsablePoint,
        inLine?: boolean,
        onClick?: () => void,
      }, string]>;
      font: TypeDiagramFontDefinition,                    // default font
      xAlign: 'left' | 'right' | 'center',                // default xAlign
      yAlign: 'bottom' | 'baseline' | 'middle' | 'top',   // default yAlign
      color: Array<number>
    } | Array<DiagramTextAF>) {
    if (!Array.isArray(options)) {
      let textArray = options.text;
      if (typeof textArray === 'string') {
        textArray = [textArray];
      }
      const diagramTextArray = [];
      textArray.forEach((textDefinition) => {
        let font;
        let offset;
        let inLine;
        let textToUse;
        if (Array.isArray(textDefinition) && textDefinition.length === 2) {
          [{
            font, offset, inLine,
          }, textToUse] = textDefinition;
        } else {
          textToUse = textDefinition;
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

        diagramTextArray.push(new DiagramTextLineAF(
          this.drawContext2D,
          new Point(0, 0),
          textToUse,
          fontDefinition,
          offsetToUse,
          inLine,
        ));
      });
      this.text = diagramTextArray;
      this.xAlign = options.xAlign;
      this.yAlign = options.yAlign;
    } else {
      this.text = options;
    }
  }

  setTextLocations() {
    let lastRight = new Point(0, 0);
    let maxY = 0;
    let minY = 0;
    this.text.forEach((text) => {
      text.location = lastRight.add(text.offset);
      if (text.inLine) {
        lastRight = text.location.add(text.width, 0);
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
    const locationAlignOffset = new Point(0, 0);
    if (this.xAlign === 'center') {
      locationAlignOffset.x -= width / 2;
    } else if (this.xAlign === 'right') {
      locationAlignOffset.x -= width;
    }
    if (this.yAlign === 'bottom') {
      locationAlignOffset.y -= minY;
    } else if (this.yAlign === 'middle') {
      locationAlignOffset.y += -minY - (maxY - minY);
    } else if (this.yAlign === 'top') {
      locationAlignOffset.y += maxY;
    }
    this.text.forEach((text) => {
      text.location = text.location.add(locationAlignOffset);
    });
  }
}

export {
  DiagramFontAF, DiagramTextAF, TextObjectAF, TextLineObjectAF,
};
