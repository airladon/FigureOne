// @flow

import * as m2 from '../../../tools/m2';
import { Point, getPoint, Rect, spaceToSpaceTransform } from '../../../tools/g2';
import type { TypeParsablePoint } from '../../../tools/g2';
import DrawingObject from '../DrawingObject';
import DrawContext2D from '../../DrawContext2D';
import { duplicateFromTo, joinObjects } from '../../../tools/tools';

function colorArrayToString(color: Array<number>) {
  return `rgba(${
    Math.floor(color[0] * 255)},${
    Math.floor(color[1] * 255)},${
    Math.floor(color[2] * 255)},${
    color[3]})`;
}

type TypeDiagramFontOptions = {
  family?: string,
  style?: 'normal' | 'italic',
  size?: number,
  weight?: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  // xAlign?: 'left' | 'center' | 'right',
  // yAlign?: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline',
  color?: Array<number> | null,
  opacity?: number,
};

// DiagramFont defines the font properties to be used in a TextObject
class DiagramFont {
  size: number;
  weight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  style: 'normal' | 'italic';
  family: string;
  // xAlign: 'left' | 'center' | 'right';
  // yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  color: Array<number> | null;
  opacity: number;

  constructor(optionsIn: TypeDiagramFontOptions = {}) {
  //   family: string = 'Helvetica Neue',
  //   style: string = '',
  //   size: number = 1,
  //   weight: string = '200',
  //   xAlign: 'left' | 'center' | 'right' = 'center',
  //   yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' = 'middle',
  //   color: Array<number> | null = null,
  // ) {
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
    // this.xAlign = options.xAlign;
    // this.yAlign = options.yAlign;
    this.opacity = options.opacity;
    this.setColor(options.color);
  }

  setColor(color: Array<number> | null = null) {
    // if (Array.isArray(color)) {
    //   this.color = colorArrayToString(color);
    // } else {
    //   this.color = color;
    // }
    this.color = color;
  }

  setFontInContext(ctx: CanvasRenderingContext2D, scalingFactor: number = 1) {
    ctx.font = `${this.style} ${this.weight} ${this.size * scalingFactor}px ${this.family}`;
    // ctx.textAlign = this.xAlign;
    // if (this.yAlign === 'baseline') {
    //   ctx.textBaseline = 'alphabetic';
    // } else {
    //   ctx.textBaseline = this.yAlign;
    // }
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
      ctx.fillStyle = colorArrayToString(c);
    } else if (color != null) {
      ctx.fillStyle = colorArrayToString(color);
    }
  }

  _dup() {
    return new DiagramFont({
      family: this.family,
      style: this.style,
      size: this.size,
      weight: this.weight,
      // xAlign: this.xAlign,
      // yAlign: this.yAlign,
      color: this.color,
      opacity: this.opacity,
    });
  }
}

// DiagramText is a single text element of the diagram that is drawn at
// once and referenced to the same location
class DiagramText {
  location: Point;
  relativeLocation: boolean;
  offset: Point;
  text: string;
  font: DiagramFont;
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  scalingFactor: number;
  lastMeasure: {
    ascent: number,
    descent: number,
    width: number,
    left: number,
    right: number,
  }

  constructor(
    location: ?TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: DiagramFont | TypeDiagramFontOptions = new DiagramFont(),
    xAlign: 'left' | 'center' | 'right' = 'left',
    yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline' = 'baseline',
    offset: TypeParsablePoint = new Point(0, 0),
  ) {
    this.offset = getPoint(offset);
    if (location == null) {
      this.location = new Point(0, 0);
      this.relativeLocation = true;
    } else {
      this.location = getPoint(location)._dup();
      this.relativeLocation = false;
    }
    // this.location = null;
    // if (location != null) {
    //   this.location = getPoint(location)._dup();
    // }
    // this.location = location._dup();
    this.text = text.slice();
    if (font instanceof DiagramFont) {
      this.font = font._dup();
    } else {
      this.font = new DiagramFont(font);
    }
    this.xAlign = xAlign;
    this.yAlign = yAlign;

    if (this.font.size < 20) {
      this.scalingFactor = this.font.size * 50;
    }
    if (this.font.size < 1) {
      const power = -Math.log(this.font.size) / Math.LN10 + 2;
      this.scalingFactor = 10 ** power;
    }
    // this.font = font._dup();
  }

  _dup() {
    return new DiagramText(this.location, this.text, this.font._dup(), this.xAlign, this.yAlign);
  }

  // This method is used instead of the actual ctx.measureText because
  // Firefox and Chrome don't yet support it's advanced features.
  // Estimates are made for height based on width.
  // eslint-disable-next-line class-methods-use-this
  measureText(
    ctx: CanvasRenderingContext2D,
    scalingFactor: number = this.scalingFactor,
  ) {
    // const location = getPoint(locationIn);
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

    const height = ascent + descent;

    const { width } = ctx.measureText(this.text);
    let asc = 0;
    let des = 0;
    let left = 0;
    let right = 0;

    // console.log(scalingFactor, width, this.xAlign)
    if (this.xAlign === 'left') {
      right = width;
    }
    if (this.xAlign === 'center') {
      left = width / 2;
      right = width / 2;
    }
    if (this.xAlign === 'right') {
      left = width;
    }
    if (this.yAlign === 'alphabetic' || this.yAlign === 'baseline') {
      asc = ascent;
      des = descent;
    }
    if (this.yAlign === 'top') {
      asc = 0;
      des = height;
    }
    if (this.yAlign === 'bottom') {
      asc = height;
      des = 0;
    }
    if (this.yAlign === 'middle') {
      asc = height / 2;
      des = height / 2;
    }
    left /= scalingFactor;
    right /= scalingFactor;
    asc /= scalingFactor;
    des /= scalingFactor;

    // return new Rect(
    //   location.x - left,
    //   location.y - des,
    //   left + right,
    //   des + asc,
    // );

    this.lastMeasure = {
      left,
      right,
      ascent: asc,
      descent: des,
      width: right + left,
      height: asc + des,
    };

    return this.lastMeasure;

    // return {
    //   actualBoundingBoxLeft: left / this.scalingFactor,
    //   actualBoundingBoxRight: right / this.scalingFactor,
    //   fontBoundingBoxAscent: asc / this.scalingFactor,
    //   fontBoundingBoxDescent: des / this.scalingFactor,
    // };
  }
}

// TextObject is the DrawingObject used in the DiagramElementPrimitive.
// TextObject will draw an array of DiagramText objects.
class TextObject extends DrawingObject {
  drawContext2D: Array<DrawContext2D>;
  border: Array<Array<Point>>;
  text: Array<DiagramText>;
  scalingFactor: number;
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  lastDrawTransform: Array<number>;
  lastDraw: Array<{
    x: number,
    y: number,
    width: number,
    height: number,
  }>;

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    text: Array<DiagramText> = [],
    xAlign: 'left' | 'center' | 'right' = 'left',
    yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline' = 'baseline',
  ) {
    super();
    if (Array.isArray(drawContext2D)) {
      this.drawContext2D = drawContext2D;
    } else {
      this.drawContext2D = [drawContext2D];
    }
    this.text = text;
    this.scalingFactor = 1;
    this.lastDraw = [];
    this.lastDrawTransform = [];
    // this.glRect = new Rect(-1, -1, 2, 2);
    if (text.length > 0) {
      let minSize = this.text[0].font.size;
      this.text.forEach((t) => {
        if (t.font.size > 0 && t.font.size < minSize) {
          minSize = t.font.size;
        }
      });
      // if (minSize < 20) {
      //   this.scalingFactor = minSize * 50;
      // }
      // if (minSize < 1) {
      //   const power = -Math.log(minSize) / Math.LN10 + 2;
      //   this.scalingFactor = 10 ** power;
      // }
      this.scalingFactor = 20 / minSize;
    }
    this.xAlign = xAlign;
    this.yAlign = yAlign;
    this.setBorder();
    this.state = 'loaded';
  }

  setText(text: string, index: number = 0) {
    this.text[index].text = text;
    this.setBorder();
  }

  _dup() {
    const c = new TextObject(this.drawContext2D, this.text);
    duplicateFromTo(this, c);
    c.scalingFactor = this.scalingFactor;
    c.border = this.border.map(b => b.map(p => p._dup()));
    return c;
  }

  setFont(fontSize: number) {
    for (let i = 0; i < this.text.length; i += 1) {
      this.text[i].font.size = fontSize;
    }
    this.setBorder();
  }

  setOpacity(opacity: number) {
    for (let i = 0; i < this.text.length; i += 1) {
      this.text[i].font.opacity = opacity;
    }
  }

  setColor(color: Array<number>) {
    // const c = colorArrayToString(color);

    for (let i = 0; i < this.text.length; i += 1) {
      this.text[i].font.color = color;
    }
  }

  draw(
    translation: Point,
    rotation: number,
    scale: Point,
    count: number,
    color: Array<number>,
  ) {
    let transformation = m2.identity();
    transformation = m2.translate(transformation, translation.x, translation.y);
    transformation = m2.rotate(transformation, rotation);
    transformation = m2.scale(transformation, scale.x, scale.y);
    this.drawWithTransformMatrix(m2.t(transformation), color);
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

    // We want to define everything, including font size and text location,
    // in elementSpace (the DiagramElementPrimitive space)
    //
    // So let's say our diagram is a square with bottom left corner (-1, -1)
    // and width 2, height 2. We want an equivalent font size of 0.1.
    //
    // If our canvas is 800 x 800 pixels, then we could scale evenything up by
    // 400. So our font size to draw in the cavnas will be 0.1 * 400 = 40px.
    //
    // This is great, except how do we now apply a transform? The parent
    // transform converts element space to GL space, so we will want to add
    // an extra conversion of pixel space. But the way we draw text in a canvas
    // is by applying a transform to the canvas, then drawing text to it.
    //
    // So the way we will do it, is transform the canvas to the element space
    // and then place the text there.
    //
    // * Assume a canvas of 800 x 800
    // * If you plot text with a fontSize of 80px, at a location of
    //   400, 400 then the font will be in the middle of the canvas and
    //   approximately 1/10 of the canvas height
    // * Zoom the canvas by a factor of 2
    //   ctx.scale(2, 2)
    // * Now to achieve the same font size and position relative to the canvas
    //   you will need to use a fontSize of 40px and location of 200, 200
    //
    // * Assume a canvas of 800 x 800
    // * To get text ~1/10th height of canvas and in the middle, plot with
    //   fontSize: 80px at 400, 400.
    //
    // * If you translate the canvas by 400, 400, then you can now plot at 0, 0
    //   for the center of the screen
    //
    // * To plot on the left side of the screen, use location -400, 0.
    //
    // * Now scale the screen by 2: `ctx.scale(2, 2)`
    //
    // * Now to plot same size text (relative to canvas) at same left edge
    //   need to use a font size of 40px, and a location of -200, 0.
    //
    // * So if we want to convert the pixel space to GL space, which is 
    //   width 2, height 2, left -1, bottom -1, then we need scale by:
    //      800 / 2 = 400
    // * So if we ctx.scale(400, 400), then to get text in the equivalent size
    //   and position we need to use a fontSize of 80/400 = 0.2, and a location
    //   of -1, 0
    //
    // * In this case, the context manager will try use a font size of 0.2px and
    //   then it will get scaled up with the ctx transform - however, a font
    //   size of 0.2px doesn't make much sense. Infact, small font sizes like
    //   event 5px might be dodgey, so we will try to always use a font size of
    //   around 20 or larger.
    //
    // * Therefore, if we want a font size of 20px, we need to scale 0.2 by 100
    // * This means instead of originally scaling by (400, 400), we should just
    //   just scale by (4, 4). Now we can use a fontSize of 20px, but we will
    //   also have to scale the location (-1 * 100, 0 * 100) = (-100, 0);

    // const glSpace = {
    //   x: { bottomLeft: -1, width: 2 },
    //   y: { bottomLeft: -1, height: 2 },
    // };
    // const pixelSpace = {
    //   x: { bottomLeft: 0, width: drawContext2D.canvas.offsetWidth },
    //   y: { bottomLeft: drawContext2D.canvas.offsetHeight, height: -drawContext2D.canvas.offsetHeight },
    // };

    // const glToPixelSpaceMatrix1 = spaceToSpaceTransform(glSpace, pixelSpace);
    // console.log(glToPixelSpaceMatrix1)

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

    // Applying this transform to the context, will make anything
    // we draw now similarly transformed. As this is now a scaled
    // transform, we need to similarly scale our locations and
    // font sizes

    // Text objects can either have absolute or relative locations.
    // If text.location is null, then the location is calculated relative to
    // the previous text where it will be placed immediately to the right,
    // sharing the same baseline. If the text alignment is left, baseline, then
    // the words will follow each other naturally.
    //
    let lastRight = new Point(0, 0);
    this.text.forEach((diagramText) => {
      const { relativeLocation, offset } = diagramText;
      let location;
      if (relativeLocation) {
        location = lastRight._dup();
        diagramText.location = location;
      } else {
        ({ location } = diagramText);
      }
      // Measure the text in scaled space
      const measure = diagramText.measureText(ctx, scalingFactor);
      lastRight = new Point(
        location.x + measure.right + offset.x,
        location.y,
      );
    });

    // We now have calculated all the locations of the text, now let's calculate
    // the total bounds, so the locations can be scaled by xAlign and yAlign.
    // Note, if yAlign === 'baseline', then the block of text will be aligned
    // around the y coordinate of the first text element.
    let xMin = null;
    let xMax = null;
    let yMin = null;
    let yMax = null;
    this.text.forEach((diagramText) => {
      const { location, lastMeasure, offset } = diagramText;
      const xMinText = location.x - lastMeasure.left + offset.x;
      const xMaxText = location.x + lastMeasure.right + offset.x;
      const yMaxText = location.y + lastMeasure.ascent;
      const yMinText = location.y - lastMeasure.descent;
      if (xMin == null || xMinText < xMin) {
        xMin = xMinText;
      }
      if (xMax == null || xMaxText > xMax) {
        xMax = xMaxText;
      }
      if (yMin == null || yMinText < yMin) {
        yMin = yMinText;
      }
      if (yMax == null || yMaxText > yMax) {
        yMax = yMaxText;
      }
    });
    const locationOffset = new Point(0, 0);
    if (xMin != null && yMin != null && xMax != null && yMax != null) {
      if (this.xAlign === 'left') {
        locationOffset.x = -xMin;
      } else if (this.xAlign === 'right') {
        locationOffset.x = -xMax;
      } else if (this.xAlign === 'center') {
        locationOffset.x = -xMin - (xMax - xMin) / 2;
      }
      if (this.yAlign === 'bottom') {
        locationOffset.y = -yMin;
      } else if (this.yAlign === 'top') {
        locationOffset.y = -yMax;
      } else if (this.yAlign === 'middle') {
        locationOffset.y = -yMin - (yMax - yMin) / 2;
      }
    }

    if (locationOffset.x !== 0 || locationOffset.y !== 0) {
      this.text.forEach((diagramText) => {
        diagramText.location = diagramText.location.add(locationOffset);
      });
    }

    // Fill in all the text
    this.text.forEach((diagramText) => {
      diagramText.font.setFontInContext(ctx, scalingFactor);
      diagramText.font.setColorInContext(ctx, color);
      this.recordLastDraw(
        ctx,
        diagramText,
        scalingFactor,
        (diagramText.location.x + diagramText.offset.x) * scalingFactor,
        (diagramText.location.y + diagramText.offset.y) * -scalingFactor,
      );
      ctx.fillText(
        diagramText.text,
        (diagramText.location.x + diagramText.offset.x) * scalingFactor,
        (diagramText.location.y + diagramText.offset.y) * -scalingFactor,
      );
    });
    ctx.restore();
  }

  recordLastDraw(
    ctx: CanvasRenderingContext2D,
    diagramText: DiagramText,
    scalingFactor: number,
    x: number,
    y: number,
  ) {
    // const width = ctx.measureText(diagramText.text).width * 1.2;
    const width = diagramText.lastMeasure.width * scalingFactor * 1.2;
    const height = diagramText.font.size * scalingFactor * 1.2;
    let bottom = y + height * 0.1;
    let left = x - width * 0.1;
    if (diagramText.yAlign === 'baseline' || diagramText.yAlign === 'alphabetic') {
      bottom = y + height * 0.2;
    } else if (diagramText.yAlign === 'top') {
      bottom = y + height;
    } else if (diagramText.yAlign === 'middle') {
      bottom = y + height / 2;
    }

    if (diagramText.xAlign === 'center') {
      left -= width / 2;
    } else if (diagramText.xAlign === 'right') {
      left -= width;
    }

    this.lastDraw.push({
      width,
      height: -height,
      x: left,
      y: bottom,
      // xActual: x,
      // yActual: y,
      // widthActual: width / 1.2,
    });
    // console.log(this.lastDraw)
  }

  clear(contextIndex: number = 0) {
    const { lastDraw } = this;
    if (lastDraw.length > 0) {
      const { ctx } = this.drawContext2D[contextIndex];
      const t = this.lastDrawTransform;
      ctx.save();
      ctx.transform(t[0], t[3], t[1], t[4], t[2], t[5]);
      lastDraw.forEach((draw) => {
        // const x = Math.max(0, draw.x - draw.width * 0.5);
        // const y = Math.max(0, draw.y - draw.height * 0.5);
        const x = draw.x - draw.width;
        const y = draw.y - draw.height;
        ctx.clearRect(
          x,
          y,
          draw.width * 3,
          draw.height * 3,
        );
      });
      ctx.restore();
    }
    this.lastDraw = [];
  }

  getGLBoundaries(lastDrawTransformMatrix: Array<number>): Array<Array<Point>> {
    const glBoundaries = [];
    this.text.forEach((t) => {
      glBoundaries.push(this.getGLBoundaryOfText(t, lastDrawTransformMatrix));
    });
    return glBoundaries;
  }

  setBorder() {
    this.border = [];
    this.text.forEach((t) => {
      this.border.push(this.getBoundaryOfText(t));
    });
    // return glBoundaries;
  }

  // This method is used instead of the actual ctx.measureText because
  // Firefox and Chrome don't yet support it's advanced features.
  // Estimates are made for height based on width.
  // eslint-disable-next-line class-methods-use-this
  // measureText(ctx: CanvasRenderingContext2D, text: DiagramText) {
  //   // const aWidth = ctx.measureText('a').width;
  //   const fontHeight = ctx.font.match(/[^ ]*px/);
  //   let aWidth;
  //   if (fontHeight != null) {
  //     aWidth = parseFloat(fontHeight[0]) / 2;
  //   } else {
  //     aWidth = ctx.measureText('a').width;
  //   }
  //   // const aWidth = parseFloat(ctx.font.match(/[^ ]*px/)[0]) / 2;

  //   // Estimations of FONT ascent and descent for a baseline of "alphabetic"
  //   let ascent = aWidth * 1.4;
  //   let descent = aWidth * 0.08;

  //   // Uncomment below and change above consts to lets if more resolution on
  //   // actual text boundaries is needed

  //   // const maxAscentRe =
  //   //   /[ABCDEFGHIJKLMNOPRSTUVWXYZ1234567890!#%^&()@$Qbdtfhiklj]/g;
  //   const midAscentRe = /[acemnorsuvwxz*gyqp]/g;
  //   const midDecentRe = /[;,$]/g;
  //   const maxDescentRe = /[gjyqp@Q(){}[\]|]/g;

  //   const midAscentMatches = text.text.match(midAscentRe);
  //   if (Array.isArray(midAscentMatches)) {
  //     if (midAscentMatches.length === text.text.length) {
  //       ascent = aWidth * 0.95;
  //     }
  //   }

  //   const midDescentMatches = text.text.match(midDecentRe);
  //   if (Array.isArray(midDescentMatches)) {
  //     if (midDescentMatches.length > 0) {
  //       descent = aWidth * 0.2;
  //     }
  //   }

  //   const maxDescentMatches = text.text.match(maxDescentRe);
  //   if (Array.isArray(maxDescentMatches)) {
  //     if (maxDescentMatches.length > 0) {
  //       descent = aWidth * 0.5;
  //     }
  //   }

  //   const height = ascent + descent;

  //   const { width } = ctx.measureText(text.text);
  //   let asc = 0;
  //   let des = 0;
  //   let left = 0;
  //   let right = 0;

  //   if (text.xAlign === 'left') {
  //     right = width;
  //   }
  //   if (text.xAlign === 'center') {
  //     left = width / 2;
  //     right = width / 2;
  //   }
  //   if (text.xAlign === 'right') {
  //     left = width;
  //   }
  //   if (text.yAlign === 'alphabetic' || text.yAlign === 'baseline') {
  //     asc = ascent;
  //     des = descent;
  //   }
  //   if (text.yAlign === 'top') {
  //     asc = 0;
  //     des = height;
  //   }
  //   if (text.yAlign === 'bottom') {
  //     asc = height;
  //     des = 0;
  //   }
  //   if (text.yAlign === 'middle') {
  //     asc = height / 2;
  //     des = height / 2;
  //   }
  //   return {
  //     actualBoundingBoxLeft: left,
  //     actualBoundingBoxRight: right,
  //     fontBoundingBoxAscent: asc,
  //     fontBoundingBoxDescent: des,
  //   };
  // }

  getBoundaryOfText(text: DiagramText, contextIndex: number = 0): Array<Point> {
    const boundary = [];
    const { scalingFactor } = this;
    const { location } = text;
    let meas;
    if (text.lastMeasure != null) {
      meas = text.lastMeasure;
    } else {
      meas = text.measureText(this.drawContext2D[contextIndex].ctx, scalingFactor);
    }
    const box = [
      new Point(-meas.left, meas.ascent).add(location),
      new Point(meas.right, meas.ascent).add(location),
      new Point(meas.right, -meas.descent).add(location),
      new Point(-meas.left, -meas.descent).add(location),
    ];
    box.forEach((p) => {
      boundary.push(p);
    });
    return boundary;
  }

  getGLBoundaryOfText(
    text: DiagramText,
    lastDrawTransformMatrix: Array<number>,
    contextIndex: number = 0,
  ): Array<Point> {
    const glBoundary = [];
    const box = this.getBoundaryOfText(text, contextIndex);
    box.forEach((p) => {
      glBoundary.push(p.transformBy(lastDrawTransformMatrix));
    });
    return glBoundary;
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [
      ...super._getStateProperties(),
    ];
  }
}

export { TextObject, DiagramText, DiagramFont };
