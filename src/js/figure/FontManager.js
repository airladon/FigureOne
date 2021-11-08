// @flow
import TimeKeeper from './TimeKeeper';
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
  timeKeeper: TimeKeeper;
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
    timeKeeper: TimeKeeper = new TimeKeeper(),
    fnMap: FunctionMap = new FunctionMap(),
    notifications: NotificationManager = new NotificationManager(),
    // timeout: number = 10000,
  ) {
    if (!FontManager.instance) {
      FontManager.instance = this;
      this.fonts = {};
      this.canvas = document.createElement('canvas');
      this.canvas.width = 10;
      this.canvas.height = 10;
      this.ctx = this.canvas.getContext('2d');
      this.timeKeeper = timeKeeper;
      this.notifications = notifications;
      this.loading = 0;
      this.loaded = 0;
      this.fnMap = fnMap;
      this.timedOut = 0;
      this.checkTimer = null;
      this.startTime = timeKeeper.now();
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

  measureText(fontID: string, backupFont: string = '') {
    const f = this.fonts[fontID].font;
    let backup = '';
    if (backupFont !== '') {
      backup = `, ${backupFont}`;
    }
    this.ctx.font = `${f.style} ${f.weight} 20px ${f.family}${backup}`;
    return this.ctx.measureText(this.fonts[fontID].glyphSymbols);
  }

  // measureSystemFont(fontID: string, systemFont: string) {
  //   const f = this.fonts[fontID].font;
  //   this.ctx.font = `${f.style} ${f.weight} 20px ${systemFont}`;
  //   return this.ctx.measureText(this.fonts[fontID].glyphSymbols);
  // }

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


  /*
  There are several cases to consider:
    - Font is a system default font (and is thus available)
    - Font is available
    - Font is available for some glyphs only
    - Font is not available

  We can then measure the width of the glyphs using just the font itself, and
  then with the font and a backup system default font. If the font or some
  glyphs of the font don't exist, the backup system font will be used.
    - font
    - font, serif
    - font, monospace
    - font, sans-serif
    - font, auto

  If the font is available, then all widths will be the same.
  If the font is not available, then some of the widths will be different.
  */

  measure(
    fontID: string, backupName: string, backupFamily: string
  ) {
    this.fonts[fontID][backupName].push(this.measureText(fontID, backupFamily).width);
  }

  isAvailable(fontID: string): boolean {
    this.measure(fontID, 'mono', 'monospace');
    this.measure(fontID, 'serif', 'serif');
    this.measure(fontID, 'sans', 'sans-serif');
    this.measure(fontID, 'auto', 'auto');
    const mono = this.fonts[fontID].mono.slice(-1)[0];
    const serif = this.fonts[fontID].serif.slice(-1)[0];
    const sans = this.fonts[fontID].sans.slice(-1)[0];
    const auto = this.fonts[fontID].auto.slice(-1)[0];
    const { width } = this.measureText(fontID);
    this.fonts[fontID].width.push(width);
    if (width === mono && width === serif && width === sans && width === auto) {
      return true;
    }
    return false;
  }

  loadFont(font: OBJ_Font | FigureFont, options: OBJ_LoadFontOptions) {
    const o = joinObjects({}, {
      timeout: 5000,
      maxCount: 1,
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
      timeout: this.timeKeeper.now() + o.timeout,
      font: f,
      glyphID: f.getTestStringID(),
      glyphSymbols: f.getTestStringGlyphs(),
      width: [],
      mono: [],
      serif: [],
      sans: [],
      auto: [],
      loaded: false,
      // count: 0,
      // maxCount: o.maxCount,
      callbacks: [],
      timedOut: false,
    };
    this.loading += 1;

    const result = this.isAvailable(fontID, false);

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
      this.startTime = this.timeKeeper.now();
      this.checkTimer = this.timeKeeper.setTimeout(this.timedCheck.bind(this), 50);
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
    if (this.timeKeeper.now() - this.startTime > 1000) {
      time = 500;
    }
    if (this.timeKeeper.now() - this.startTime > 5000) {
      time = 1000;
    }
    this.timeKeeper.setTimeout(this.timedCheck.bind(this), time);
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

    const result = this.isAvailable(fontID);
    if (result === false && this.timeKeeper.now() > f.timeout) {
      this.fontTimedOut(fontID);
      return false;
    }

    if (result) {
      this.fontLoaded(fontID);
      return true;
    }
    return false;
  }

  isFontAvailable(family: string, weight: string, style: string, glyphs: string) {
    const name = `${family.toLowerCase()}-${weight.toLowerCase()}-${style.toLowerCase()}-${this.getTestString(glyphs)[0]}`;
    return this._isFontAvailable(name);
  }
}
