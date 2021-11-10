// @flow

import * as m2 from '../../../tools/m2';
import * as m3 from '../../../tools/m3';
import { isPointInPolygon } from '../../../tools/geometry/polygon';
import {
  Point, getPoint, Rect, getBoundingBorder, getBorder, isBuffer,
} from '../../../tools/g2';
import type { TypeParsablePoint, TypeParsableBuffer } from '../../../tools/g2';
import type Scene from '../../../tools/geometry/scene';
import type { Type3DMatrix } from '../../../tools/m3';
import DrawingObject from '../DrawingObject';
import DrawContext2D from '../../DrawContext2D';
import { joinObjects, splitString, hash32 } from '../../../tools/tools';
import { round } from '../../../tools/math';
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
import type { OBJ_AtlasMap } from '../../webgl/Atlas';
import glyphMeasures from './glyphMeasures';

const greek = '\u0391\u0392\u0393\u0394\u0395\u0396\u0397\u0398\u0399\u039A\u039B\u039C\u039D\u039E\u039F\u03A0\u03A1\u03A3\u03A4\u03A5\u03A6\u03A7\u03A8\u03A9\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8\u03B9\u03BA\u03BB\u03BC\u03BD\u03BE\u03BF\u03C0\u03C1\u03C2\u03C3\u03C4\u03C5\u03C6\u03C7\u03C8\u03c9';

const latin = `QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm,./<>?;':"[]\{}|1234567890!@#$%^&*()-=_+" `;

// const math = '\u00ba\u00b0\u00d7\u00f7';

const mathExt = '\u00ba\u00b0\u00d7\u00f7\u2200\u2201\u2202\u2203\u2204\u2205\u2206\u2207\u2208\u2209\u220a\u220b\u220c\u220d\u220e\u220f\u2210\u2211\u2212\u2213\u2214\u2215\u2216\u2217\u2218\u2219\u221a\u221b\u221c\u221d\u221e\u221f\u2220\u2221\u2222\u2223\u2224\u2225\u2226\u2227\u2228\u2229\u222a\u222b\u222c\u222d\u222e\u222f\u2230\u2231\u2232\u2233\u2234\u2235\u2236\u2237\u2238\u2239\u223a\u223b\u223c\u223d\u223e\u223f\u2240\u2241\u2242\u2243\u2244\u2245\u2246\u2247\u2248\u2249\u224a\u224b\u224c\u224d\u224e\u224f\u2250\u2251\u2252\u2253\u2254\u2255\u2256\u2257\u2258\u2259\u225a\u225b\u225c\u225d\u225e\u225f\u2260\u2261\u2262\u2263\u2264\u2265\u2266\u2267\u2268\u2269\u226a\u226b\u226c\u226d\u226e\u226f\u2270\u2271\u2272\u2273\u2274\u2275\u2276\u2277\u2278\u2279\u227a\u227b\u227c\u227d\u227e\u227f\u2280\u2281\u2282\u2283\u2284\u2285\u2286\u2287\u2288\u2289\u228a\u228b\u228c\u228d\u228e\u228f\u2290\u2291\u2292\u2293\u2294\u2295\u2296\u2297\u2298\u2299\u229a\u229b\u229c\u229d\u229e\u229f\u22a0\u22a1\u22a2\u22a3\u22a4\u22a5\u22a6\u22a7\u22a8\u22a9\u22aa\u22ab\u22ac\u22ad\u22ae\u22af\u22b0\u22b1\u22b2\u22b3\u22b4\u22b5\u22b6\u22b7\u22b8\u22b9\u22ba\u22bb\u22bc\u22bd\u22be\u22bf\u22c0\u22c1\u22c2\u22c3\u22c4\u22c5\u22c6\u22c7\u22c8\u22c9\u22ca\u22cb\u22cc\u22cd\u22ce\u22cf\u22d0\u22d1\u22d2\u22d3\u22d4\u22d5\u22d6\u22d7\u22d8\u22d9\u22da\u22db\u22dc\u22dd\u22de\u22df\u22e0\u22e1\u22e2\u22e3\u22e4\u22e5\u22e6\u22e7\u22e8\u22e9\u22ea\u22eb\u22ec\u22ed\u22ee\u22ef\u22f0\u22f1\u22f2\u22f3\u22f4\u22f5\u22f6\u22f7\u22f8\u22f9\u22fa\u22fb\u22fc\u22fd\u22fe\u22ff';

const math = '1234567890-+=exp.%\u00ba\u00b0\u00d7\u00f7';

/* eslint-enable max-len */

// FigureFont defines the font properties to be used in a TextObject
/*
  A font can either be defined with family/weight/style or with an src/map.
*/
class FigureFont {
  // System or web font definition
  family: string;
  weight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  style: 'normal' | 'italic';

  // Atlas font definition
  src: Image | string;
  map: OBJ_AtlasMap;
  glyphs: string | 'greek' | 'math' | 'mathExt' | 'common' | 'latin' | 'all' | 'numbers';
  loadColor: TypeColor;

  // Font properties
  size: number;
  underline: boolean | number | [number, number];
  color: TypeColor | null;
  outline: boolean | TypeColor;
  opacity: number;  // deprecated

  // Font measurements
  width: number;
  descent: number;
  midDescent: number;
  maxDescent: number;
  midAscent: number;
  maxAscent: number;
  modifiers: {
    [glyph: string]: { width?: number, descent?: number, ascent?: number },
  }

  // Font load detection parameters
  testString: string;
  timeout: number;
  maxCount: number;

  constructor(optionsIn: OBJ_Font | FigureFont = {}) {
    if (optionsIn instanceof FigureFont) {
      this.family = optionsIn.family;
      this.style = optionsIn.style;
      this.size = optionsIn.size;
      this.outline = optionsIn.outline;
      this.weight = optionsIn.weight;
      this.opacity = optionsIn.opacity;
      this.underline = optionsIn.underline;
      this.setColor(optionsIn.color);
      // this.width = optionsIn.width;
      this.descent = optionsIn.descent;
      this.midDescent = optionsIn.midDescent;
      this.maxDescent = optionsIn.maxDescent;
      this.midAscent = optionsIn.midAscent;
      this.maxAscent = optionsIn.maxAscent;
      this.src = optionsIn.src;
      this.id = optionsIn.id;
      this.map = optionsIn.map;
      this.glyphs = optionsIn.glyphs;
      this.testString = optionsIn.testString;
      this.timeout = optionsIn.timeout;
      this.maxCount = optionsIn.maxCount;
      this.modifiers = optionsIn.modifiers;
      return;
    }
    const defaultOptions = {
      family: 'Times New Roman',
      style: 'normal',
      size: 1,
      weight: 'normal',
      color: null,
      opacity: 1,
      width: 1,
      descent: 0.08,
      midDescent: 0.2,
      maxDescent: 0.5,
      midAscent: 1.1,
      maxAscent: 1.5,
      underline: false,
      src: '',
      map: {},
      glyphs: 'common',
      timeout: 5,
      maxCount: 1,
      modifiers: {},
      fill: true,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.family = options.family;
    this.style = options.style;
    this.size = options.size;
    if (options.outline === true) {
      this.outline = {
        fill: false,
        width: this.size / 40,
      };
    } else if (options.outline === false) {
      this.outline = { fill: true, width: 0 };
    } else if (options.outline == null) {
      this.outline = { fill: true, width: 0 };
    } else {
      this.outline = joinObjects({}, { width: this.size / 40, fill: false }, options.outline);
    }
    const underlineDefaults = {
      width: this.size / 40,
      descent: this.size / 20 + this.size / 40,
    };
    if (options.underline === true) {
      this.underline = underlineDefaults;
    } else if (options.underline) {
      this.underline = joinObjects({}, underlineDefaults, options.underline);
    } else {
      this.underline = false;
    }

    this.weight = options.weight;
    this.opacity = options.opacity;
    this.setColor(options.color);
    // this.width = options.width;
    this.descent = options.descent;
    this.midDescent = options.midDescent;
    this.maxDescent = options.maxDescent;
    this.midAscent = options.midAscent;
    this.maxAscent = options.maxAscent;
    this.map = options.map;
    this.src = options.src;
    this.glyphs = options.glyphs;
    this.id = options.id;
    this.timeout = options.timeout;
    this.maxCount = options.maxCount;
    this.testString = options.testString;
    if (this.testString == null) {
      this.testString = this.glyphs;
    }
    this.modifiers = glyphMeasures(
      this.family, this.style,
      this.maxAscent, this.midAscent, this.maxDescent, this.midDescent,
      this.descent, options.modifiers,
    );
  }

  getFamily() {
    return this.family.toLowerCase().split(',')[0];
  }

  getFontID() {
    if (this.id && this.id !== '') {
      return this.id;
    }
    if (this.src != null && typeof this.src === 'string' && this.src !== '') {
      return this.src;
    }
    if (this.src != null && this.src !== '') {
      throw new Error('FigureOne Font Error: An image was used as an atlas but does not have an associated ID');
    }
    const family = this.family.split(',')[0].toLowerCase();
    return `${family}-${this.style.toLowerCase()}-${this.weight.toLowerCase()}-${this.getTestStringID()}`;
  }

  getTextureID() {
    if (this.id && this.id !== '') {
      return this.id;
    }
    if (this.src != null && typeof this.src === 'string' && this.src !== '') {
      return this.src;
    }
    if (this.src != null && this.src !== '') {
      throw new Error('FigureOne Font Error: An image was used as an atlas but does not have an associated ID');
    }
    const family = this.family.split(',')[0].toLowerCase();
    let outline = '';
    if (this.outline && this.outline.width > 0) {
      outline = `-o${hash32(JSON.stringify(this.outline)).toString().slice(1, 5)}`;
    }
    let underline = '';
    if (this.underline && this.underline.color) {
      underline = `-u${hash32(JSON.stringify(this.underline.color)).toString().slice(1, 5)}`;
    }

    return `${family}-${this.style.toLowerCase()}-${this.weight.toLowerCase()}-${this.getTestStringID()}-${round(this.size, 4).toString()}${outline}${underline}`;
  }

  getGlyphs() {
    if (this.glyphs === 'all') {
      return `${latin}${greek}${mathExt}`;
    }
    if (this.glyphs === 'common') {
      return `${latin}${greek}${math}`;
    }
    if (this.glyphs === 'latin') {
      return latin;
    }
    if (this.glyphs === 'greek') {
      return greek;
    }
    if (this.glyphs === 'math') {
      return math;
    }
    if (this.glyphs === 'mathExt') {
      return mathExt;
    }
    return this.glyphs;
  }

  getGlyphsID() {
    if (
      this.glyphs === 'all'
      || this.glyphs === 'common'
      || this.glyphs === 'greek'
      || this.glyphs === 'latin'
      || this.glyphs === 'mathExt'
      || this.glyphs === 'math'
    ) {
      return this.glyphs;
    }
    return hash32(this.glyphs).toString.slice(0, 8);
  }

  getTestStringID() {
    if (
      this.testString === 'all'
      || this.testString === 'common'
      || this.testString === 'greek'
      || this.testString === 'latin'
      || this.testString === 'mathExt'
      || this.testString === 'math'
    ) {
      return this.testString;
    }
    return hash32(this.testString).toString().slice(0, 8);
  }

  getTestStringGlyphs() {
    if (
      this.testString === 'all'
      || this.testString === 'common'
      || this.testString === 'greek'
      || this.testString === 'latin'
      || this.testString === 'mathExt'
      || this.testString === 'math'
    ) {
      return this.getGlyphs(this.testString);
    }
    return this.testString;
  }

  // getTestString() {
  //   let testString = this.alphabetSymbols;
  //   let testStringName = hash32(testStringIn).toString().slice(0, 8);
  //   if (testString === 'greek') {
  //     testString = greek;
  //     testStringName = 'greek';
  //   } else if (testString === 'latin') {
  //     testString = latin;
  //     testStringName = 'latin';
  //   } else if (testString === 'math') {
  //     testString = math;
  //     testStringName = 'math';
  //   } else if (testString === 'mathSmall') {
  //     testString = mathSmall;
  //     testStringName = 'mathSmall';
  //   } else if (testString === 'all') {
  //     testString = `${latin}${greek}${math}`;
  //     testStringName = 'all';
  //   }
  //   return [testStringName, testString];
  // }

  setColor(color: TypeColor | null = null) {
    if (color == null) {
      this.color = color;
    } else {
      this.color = color.slice();
    }
  }

  // getUnderline() {
  //   if (this.underline === false) {
  //     return [0, 0];
  //   }
  //   return [this.underLine.color
  //   if (this.underline === true) {
  //     return [this.size / 20 + this.size / 40, this.size / 40];
  //   }
  //   if (typeof this.underline === 'number') {
  //     return [this.underline, this.size / 40];
  //   }
  //   return this.underline;
  // }

  draw2D(
    ctx: CanvasRenderingContext2D,
    colorIn: TypeColor | null | number,
    text: string,
    locationX: number,
    locationY: number,
    scalingFactor: number = 1,
  ) {
    let color;
    if (typeof colorIn === 'number') {
      color = this.color;
      color[3] = colorIn;
    } else if (colorIn === null) {
      color = this.color;
    } else {
      color = colorIn;
    }
    this.setFontInContext(ctx, scalingFactor);
    this.setColorInContext(ctx, color);
    if (this.outline.fill) {
      ctx.fillText(
        text,
        (locationX) * scalingFactor,
        (locationY) * -scalingFactor,
      );
    }
    if (this.outline.width !== 0) {
      this.setStrokeColorInContext(ctx, this.outline.color || color);
      ctx.lineWidth = this.outline.width * scalingFactor;
      ctx.strokeText(
        text,
        (locationX) * scalingFactor,
        (locationY) * -scalingFactor,
      );
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
      outline: this.outline,
      weight: this.weight,
      color: colorToUse,
      opacity: this.opacity,
      // width: this.width,
      descent: this.descent,
      midDescent: this.midDescent,
      maxDescent: this.maxDescent,
      midAscent: this.midAscent,
      maxAscent: this.maxAscent,
      src: this.src,
      map: this.map,
      glyphs: this.glyphs,
      testString: this.testString,
      timeout: this.timeout,
      maxCount: this.maxCount,
      modifiers: this.modifiers,
      underline: this.underline,
    };
  }

  measureText(text: string, aWidth: number = this.size / 2) {
    // // const { font } = this;
    // // const aWidth = this.fontSize / 2;
    // let ascent = aWidth * this.maxAscent;
    // let descent = aWidth * this.descent;
    // // const maxAscentRe =
    // //   /[ABCDEFGHIJKLMNOPRSTUVWXYZ1234567890!#%^&()@$Qbdtfhiklj]/g;
    // const midAscentRe = /[acemnorsuvwxz*gyqp: ]/g;
    // const midDecentRe = /[;,$]/g;
    // let maxDescentRe = /[gjyqp@Q(){}[\]|]/g;
    // const family = this.family.toLowerCase();
    // if (family === 'times new roman' || family === 'times' || family === 'serif') {
    //   if (this.style === 'italic') {
    //     maxDescentRe = /[gjyqp@Q(){}[\]|f]/g;
    //   }
    // }
    // const midAscentMatches = text.match(midAscentRe);
    // if (Array.isArray(midAscentMatches)) {
    //   if (midAscentMatches.length === text.length) {
    //     ascent = aWidth * this.midAscent;
    //   }
    // }

    // const midDescentMatches = text.match(midDecentRe);
    // if (Array.isArray(midDescentMatches)) {
    //   if (midDescentMatches.length > 0) {
    //     descent = aWidth * this.midDescent;
    //   }
    // }

    // const maxDescentMatches = text.match(maxDescentRe);
    // if (Array.isArray(maxDescentMatches)) {
    //   if (maxDescentMatches.length > 0) {
    //     descent = aWidth * this.maxDescent;
    //   }
    // }

    let ascent = 0;
    let descent = -this.maxAscent;

    for (let i = 0; i < text.length; i += 1) {
      const glyph = text[i];
      if (this.modifiers[glyph] == null) {
        ascent = Math.max(this.maxAscent, ascent);
        descent = Math.max(this.descent, descent);
      } else {
        const { a, d } = this.modifiers[glyph];
        ascent = Math.max(a, ascent);
        descent = Math.max(d, descent);
      }
    }
    return {
      ascent: ascent * aWidth, descent: descent * aWidth,
    };
  }

  // measureGlyph(glyph: string, aWidth: number = this.size / 2) {
  //   if (this.modifiers[glyph])
  // }

  setFontInContext(ctx: CanvasRenderingContext2D, scalingFactor: number = 1) {
    ctx.font = `${this.style} ${this.weight} ${this.size * scalingFactor}px ${this.family}`;
  }

  setColorInContext(ctx: CanvasRenderingContext2D, color: TypeColor | null) {
    let colorToUse = this.color;
    if (color != null) {
      colorToUse = color;
    }
    ctx.fillStyle = colorArrayToRGBA(colorToUse);
    // const thisColor = this.color;
    // if (thisColor != null) {
    //   const c = [
    //     ...thisColor.slice(0, 3),
    //     // thisColor[3] * opacity,
    //     color != null ? color[3] : 1,
    //   ];
    //   ctx.fillStyle = colorArrayToRGBA(c);
    // } else if (color != null) {
    //   ctx.fillStyle = colorArrayToRGBA(color);
    // }
  }

  setStrokeColorInContext(ctx: CanvasRenderingContext2D, color: TypeColor | null) {
    let colorToUse = this.color;
    if (color != null) {
      colorToUse = color;
    }
    ctx.strokeStyle = colorArrayToRGBA(colorToUse);
  }

  _dup() {
    return new FigureFont(this.definition());
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
    defaultAccent: OBJ_Font,
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
    let defaultAccent = { style: 'italic' };
    if (options.defaultAccent != null) {
      defaultAccent = joinObjects({}, defaultAccent, options.defaultAccent);
    }

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

      const [split, firstToken] = splitString(lineToUse, '|', '/');
      // console.log(split)
      split.forEach((s, i) => {
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
        // console.log(s, firstToken, i % 2)
        // if (this.modifiers[s] != null) {
        if (i % 2 === firstToken) {
          let mod;
          if (this.modifiers[s] != null) {
            mod = this.modifiers[s];
          } else {
            mod = {
              text: s,
              font: defaultAccent,
            };
          }
          // const mod = this.modifiers[s];
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
