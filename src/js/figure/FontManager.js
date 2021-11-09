// @flow
import { joinObjects, NotificationManager } from '../tools/tools';
import { FunctionMap } from '../tools/FunctionMap';
import { FigureFont } from './DrawingObjects/TextObject/TextObject';

export type OBJ_LoadFontOptions = {
  maxCount?: number,
  timeout?: number,
  callback?: string | () => void,
};

export default class FontManager {
  fonts: Object;
  container: HTMLSpanElement;
  static instance: FontManager;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  loaded: number;
  loading: number;
  fnMap: FunctionMap
  timedOut: number;
  notifications: NotificationManager;
  checkTimer: TimerID;
  startTime: number;
  timeout: number;
  animateNextFrameCallbacks: Array<() => void>;

  constructor(
    fnMap: FunctionMap = new FunctionMap(),
    notifications: NotificationManager = new NotificationManager(),
  ) {
    if (!FontManager.instance) {
      FontManager.instance = this;
      this.fonts = {};
      this.canvas = document.createElement('canvas');
      this.canvas.width = 10;
      this.canvas.height = 10;
      this.ctx = this.canvas.getContext('2d');
      this.notifications = notifications;
      this.loading = 0;
      this.loaded = 0;
      this.fnMap = fnMap;
      this.timedOut = 0;
      this.checkTimer = null;
      this.startTime = 0;
      this.animateNextFrameCallbacks = [];
    }
    return FontManager.instance;
  }

  addAnimateFrameCallback(animateNextFrame: () => void) {
    this.animateNextFrameCallbacks.push(animateNextFrame);
  }

  animateNextFrame() {
    this.animateNextFrameCallbacks.forEach(c => c());
  }

  measureTextID(fontID: string, backupFont: string = '') {
    const f = this.fonts[fontID].font;
    let backup = '';
    if (backupFont !== '') {
      backup = `, ${backupFont}`;
    }
    return this.measureText(`${f.family}${backup}`, f.style, f.weight, this.fonts[fontID].glyphSymbols);
  }

  measureText(family: string, weight: string, style: string, glyphs: string) {
    this.ctx.font = `${style} ${weight} 20px ${family}`;
    return this.ctx.measureText(glyphs).width;
  }

  showDebugAtlas(fontID: string, fontFamily: string, fontSizePX = 10) {
    const f = this.fonts[fontID].font;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const glyphs = f.getGlyphs();
    const dimension = Math.ceil(Math.sqrt(glyphs.length) + 2) * fontSizePX * 1.5;
    canvas.width = dimension;
    canvas.height = dimension;
    ctx.font = `${f.style} ${f.weight} ${fontSizePX}px ${fontFamily}`;
    let x = fontSizePX;
    let y = fontSizePX;
    for (let i = 0; i < f.getGlyphs().length; i += 1) {
      ctx.fillText(glyphs[i], x, y);
      const { width } = ctx.measureText(glyphs[i]);
      x += width * 2.5;
      if (x >= dimension - fontSizePX) {
        x = fontSizePX;
        y += fontSizePX * 1.2;
      }
    }
    ctx.rect(0, 0, dimension, dimension);
    ctx.stroke();
    document.body.appendChild(canvas);
  }

  measure(
    fontID: string, backupName: string, backupFamily: string,
  ) {
    this.fonts[fontID][backupName].push(this.measureTextID(fontID, backupFamily));
  }

  /*
  We can then measure the width of the glyphs using just the font itself, and
  then with the font and a backup system default font. If the font or some
  glyphs of the font don't exist, the backup system font will be used.
    - font
    - font, serif
    - font, monospace
    - font, sans-serif
    - font, auto

  If the font is available for all glyphs, then all widths will be the same.
  If the font is not available, then some of the widths will be different.

  Note, there is a popular method that instead measures:
    - font, serif
    - serif,
    - font, monospace
    - monospace
    - font, sans-serif
    - sans-serf

  And then compares all pairs (like monospace and font,monospace) and if any
  are different then is shows the fallback is not being used, and thus the font
  exists.

  However, this doesn't work if only some of the glyphs are available. For
  example, let's say someone has a cached webfont that is only the latin
  characters. If the figure requires greek characters of the same font, and
  the greek+latin (or just greek) font file is still downloading, then the
  second method will show the (font, font/backup) pairs to be different,
  even though only the lating glyphs are different.
  */
  isAvailable(
    fontDefinition: { family: string, weight?: string, style?: string, glyphs?: string, },
  ): boolean {
    const f = new FigureFont(fontDefinition);
    const glyphs = f.getGlyphs();
    const fam = f.getFamily();
    const { weight, style } = f;
    const mono = this.measureText(`${fam},monospace`, style, weight, glyphs);
    const serif = this.measureText(`${fam},serif`, style, weight, glyphs);
    const sans = this.measureText(`${fam},sans-serif`, style, weight, glyphs);
    const auto = this.measureText(`${fam},auto`, style, weight, glyphs);
    const width = this.measureText(fam, style, weight, glyphs);
    // console.log(width, auto, sans, serif, mono)
    // if (width !== mono && width !== serif && width !== sans && width !== auto) {
    //   return true;
    // }
    // return false;
    return width === mono && width === serif && width === sans && width === auto;
  }

  /**
   * Check if a font's weights are all available.
   *
   * The weights must all belong to the same font family and style. The glyphs
   * defined in `fontDefinition` will be used to check the weights.
   *
   * This method compares the width of the glyphs for all given weights. If all
   * widths are different, then this method returns `true`.
   *
   * This means only weights that should exist should be input. For example
   * if a font only supports 'normal' and 'bold', but weights 'lighter' and
   * 'bold' are input, then this will return true as 'lighter' will likely
   * fallback to 'normal'.
   */
  areWeightsAvailable(fontDefinition: OBJ_Font, weights: Array<string>) {
    if (!this.isAvailable(fontDefinition)) {
      return false;
    }
    const f = new FigureFont(fontDefinition);
    const glyphs = f.getGlyphs();
    const fam = f.getFamily();
    const { style } = f;
    const width = this.measureText(fam, style, weights[0], glyphs);
    for (let i = 1; i < weights.length; i += 1) {
      const w = this.measureText(fam, style, weights[i], glyphs);
      if (w === width) {
        return false;
      }
    }
    return true;
  }

  /**
   * Return arrays of weights that produce the same output.
   */
  getWeights(fontDefinition: OBJ_Font) {
    if (!this.isAvailable(fontDefinition)) {
      return [];
    }
    const weights = ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter'];
    const f = new FigureFont(fontDefinition);
    const glyphs = f.getGlyphs();
    const fam = f.getFamily();
    const { style } = f;
    const widths = [];
    const buckets = [];
    for (let i = 0; i < weights.length; i += 1) {
      const w = this.measureText(fam, style, weights[i], glyphs);
      const index = widths.indexOf(w);
      if (index > -1) {
        buckets[index].push(weights[i]);
      } else {
        buckets.push([weights[i]]);
        widths.push(w);
      }
    }
    return buckets;
  }

  /**
   * Return arrays of styles that produce the same output.
   *
   * This will usually return [['normal'], ['italic', 'oblique']] meaning that
   * italic and oblique styles are the same, but different to normal. Even if
   * only the normal font is available, often the browser will auto italicize
   * the normal font to get an italic font.
   *
   * In contrast, this will show [['normal', 'italic', 'oblique']] (meaning all
   * three are the same) if only the italic version of a font is available.
   * This is because the browser simply uses the italic version as the normal
   * version if it is requested.
   */
  getStyles(fontDefinition: OBJ_Font) {
    if (!this.isAvailable(fontDefinition)) {
      return [];
    }
    const styles = ['normal', 'italic', 'oblique'];
    const f = new FigureFont(fontDefinition);
    const glyphs = f.getGlyphs();
    const fam = f.getFamily();
    const { weight } = f;
    const widths = [];
    const buckets = [];
    for (let i = 0; i < styles.length; i += 1) {
      const w = this.measureText(fam, styles[i], weight, glyphs);
      const index = widths.indexOf(w);
      if (index > -1) {
        buckets[index].push(styles[i]);
      } else {
        buckets.push([styles[i]]);
        widths.push(w);
      }
    }
    return buckets;
  }

  areStylesAvailable(fontDefinition: OBJ_Font, styles: Array<string>) {
    if (!this.isAvailable(fontDefinition)) {
      return false;
    }
    const f = new FigureFont(fontDefinition);
    const glyphs = f.getGlyphs();
    const fam = f.getFamily();
    const { weight } = f;
    const width = this.measureText(fam, styles[0], weight, glyphs);
    for (let i = 1; i < styles.length; i += 1) {
      const w = this.measureText(fam, styles[i], weight, glyphs);
      if (w === width) {
        return false;
      }
    }
    return true;
  }

  isAvailableID(fontID: string): boolean {
    this.measure(fontID, 'mono', 'monospace');
    this.measure(fontID, 'serif', 'serif');
    this.measure(fontID, 'sans', 'sans-serif');
    this.measure(fontID, 'auto', 'auto');
    const mono = this.fonts[fontID].mono.slice(-1)[0];
    const serif = this.fonts[fontID].serif.slice(-1)[0];
    const sans = this.fonts[fontID].sans.slice(-1)[0];
    const auto = this.fonts[fontID].auto.slice(-1)[0];
    const width = this.measureTextID(fontID);
    this.fonts[fontID].width.push(width);
    if (width === mono && width === serif && width === sans && width === auto) {
      return true;
    }
    return false;
  }

  /**
   * Future: include watching for multiple weights: i.e. when areWeightsAvailable becomes true
   */
  /**
   * Watch for when a font becomes available.
   */
  watch(font: OBJ_Font | FigureFont, options: OBJ_LoadFontOptions) {
    const o = joinObjects({}, {
      timeout: 5,
      callback: null,
    }, options);
    const f = new FigureFont(font);
    const fontID = f.getFontID();

    // If the font family-weight-style has already been created, then
    // return the result of whether it is loaded or not
    if (this.fonts[fontID] != null) {
      if (o.callback != null) {
        this.fonts[fontID].callbacks.push(o.callback);
      }
      if (this.fonts[fontID].loaded) {
        this.execCallbacks(fontID, true);
        return [fontID, true];
      }
      const result = this._isFontAvailable(fontID);
      return [fontID, result];
    }

    this.fonts[fontID] = {
      timeout: performance.now() + o.timeout * 1000,
      font: f,
      glyphID: f.getTestStringID(),
      glyphSymbols: f.getTestStringGlyphs(),
      width: [],
      mono: [],
      serif: [],
      sans: [],
      auto: [],
      loaded: false,
      callbacks: [],
      timedOut: false,
    };
    this.loading += 1;

    const result = this.isAvailableID(fontID, false);
    this.fonts[fontID].callbacks.push(o.callback);

    // If the font is available, then execute all callbacks registered to the
    // font and animate the next frame.
    if (result) {
      this.fontLoaded(fontID);
      return [fontID, true];
    }

    // If the font is not available, and if a timer isn't already going, then
    // initiate a timer to check all unloaded fonts
    if (this.checkTimer == null) {
      this.startTime = performance.now();
      this.checkTimer = setTimeout(this.timedCheck.bind(this), 50);
    }
    return [fontID, false];
  }

  // Execute all the callbacks associated with some fontID
  execCallbacks(fontID: string, available: boolean) {
    this.fonts[fontID].callbacks.forEach(c => this.fnMap.exec(c, available));
    this.fonts[fontID].callbacks = [];
  }

  // Timeout any fonts not yet loaded
  timeoutFonts() {
    Object.keys(this.fonts).forEach((fontID) => {
      if (this.fonts[fontID].loaded === false) {
        this.fontTimeout(fontID);
      }
    });
  }

  // Keep rechecking fonts up to some timeout. At timeout, stop rechecking.
  timedCheck() {
    const result = this.isLoadingFinished();
    if (result) {
      return;
    }
    let time = 50;
    if (performance.now() - this.startTime > 1000) {
      time = 500;
    }
    if (performance.now() - this.startTime > 5000) {
      time = 1000;
    }
    setTimeout(this.timedCheck.bind(this), time);
  }

  isLoadingFinished() {
    if (this.loaded + this.timedOut === this.loading) {
      return true;
    }
    Object.keys(this.fonts).forEach((name) => {
      this._isFontAvailable(name);
    });

    if (this.loaded + this.timedOut === this.loading) {
      this.notifications.publish('fontsLoaded');
      this.animateNextFrame();
      return true;
    }
    return false;
  }

  fontLoaded(fontID: string) {
    this.fonts[fontID].loaded = true;
    this.execCallbacks(fontID, true);
    this.notifications.publish('fontLoaded', fontID);
    this.loaded += 1;
    this.animateNextFrame();
  }

  fontTimedOut(fontID: string) {
    this.fonts[fontID].timedOut = true;
    this.timedOut += 1;
    this.execCallbacks(fontID, false);
    this.notifications.publish('fontUnavailable', fontID);
  }

  _isFontAvailable(fontID: string) {
    const f = this.fonts[fontID];
    if (f.loaded) {
      return true;
    }
    if (f.timedOut) {
      return false;
    }

    const result = this.isAvailableID(fontID);
    if (result === false && performance.now() > f.timeout) {
      this.fontTimedOut(fontID);
      return false;
    }

    if (result) {
      this.fontLoaded(fontID);
      return true;
    }
    return false;
  }
}
