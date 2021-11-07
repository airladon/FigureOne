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

  // static greek = greek;
  // static math = math;
  // static latin = latin;
  // static all = `${latin}${greek}${math}`;
  // static mathSmall = mathSmall;

  constructor(
    timeKeeper: TimeKeeper = new TimeKeeper(),
    fnMap: FunctionMap = new FunctionMap(),
    notifications: NotificationManager = new NotificationManager(),
    timeout: number = 10000,
  ) {
    if (!FontManager.instance) {
      FontManager.instance = this;
      // this.container = document.createElement('span');
      // this.container.innerHTML = Array(100).join('wi');
      // this.container.style.cssText = [
      //   'position:absolute',
      //   'width:auto',
      //   'font-size:128px',
      //   'left:-99999px',
      // ].join(' !important;');
      // FontManager.greek = greek;
      // FontManager.math = math;
      // FontManager.latin = latin;
      // FontManager.all = `${latin}${greek}${math}`;
      // FontManager.mathSmall = mathSmall;
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
      this.timeout = timeout;
      this.startTime = null;
    }
    return FontManager.instance;
  }

  // eslint-disable-next-line class-methods-use-this
  // getAlphabet(alphabet: 'greek' | 'math' | 'latin' | 'all') {
  //   if (alphabet === 'all') {
  //     return `${latin}${greek}${math}`;
  //   }
  //   if (alphabet === 'latin') {
  //     return latin;
  //   }
  //   if (alphabet === 'greek') {
  //     return greek;
  //   }
  //   if (alphabet === 'math') {
  //     return math;
  //   }
  //   // if (alphabet === 'mathSmall') {
  //   //   return mathSmall;
  //   // }
  //   return `${latin}${greek}${math}`;
  // }

  measureText(fontID: string, backupFont: string = '') {
    const f = this.fonts[fontID].font;
    let backup = '';
    if (backupFont !== '') {
      backup = `, ${backupFont}`;
    }
    this.ctx.font = `${f.style} ${f.weight} 20px ${f.family}${backup}`;
    return this.ctx.measureText(this.fonts[fontID].testStringSymbols);
  }

  // eslint-disable-next-line class-methods-use-this
  // getTestString(testStringIn: string) {
  //   let testString = testStringIn;
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

  loadFont(font: OBJ_Font | FigureFont, options: OBJ_LoadFontOptions) {
    const o = joinObjects({}, {
      timeout: 5000,
      maxCount: 1,
      callback: null,
    }, options);

    const f = new FigureFont(font);
    const testStringID = f.getTestStringID();
    const testStringSymbols = f.getTestStringGlyphs();
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
      // return [fontID, false];
    }
    this.fonts[fontID] = {
      timeout: this.timeKeeper.now() + o.timeout,
      font: f,
      testStringID,
      testStringSymbols,
      width: [],
      mono: 0,
      serif: 0,
      sans: 0,
      loaded: false,
      count: 0,
      maxCount: o.maxCount,
      callbacks: [],
      timedOut: false,
    };
    this.loading += 1;
    let result = false;
    /*
    This method doesn't handel subsets like checking for greek letters so only
    do this once at the start, to confirm the font is not a system font, and
    then move on with measurement tests. If the font is a system font (the
    default serif or sans-serif for example), then the font will never show as
    loaded as it is being compared against the default serif and sans-serif.
    */
    if (document.fonts != null && document.fonts.check != null) {
      result = document.fonts.check(`${f.style} ${f.weight} 20px ${f.family}`, f.getTestStringGlyphs());
    }
    console.log(result)
    if (result === false) {
      // Create widths for mono, serif, sans-serif and the font of interest.
      const mono = this.measureText(fontID, 'monospace').width;
      const sans = this.measureText(fontID, 'sans-serif').width;
      const serif = this.measureText(fontID, 'serif').width;
      const { width } = this.measureText(fontID, 'serif');
      this.fonts[fontID].mono = mono;
      this.fonts[fontID].serif = serif;
      this.fonts[fontID].sans = sans;
      this.fonts[fontID].width.push(width);
      if (width !== mono && width !== sans && width !== serif) {
        this.fonts[fontID].count += 1;
      }
      if (this.fonts[fontID].count === this.fonts[fontID].maxCount) {
        result = true;
      }
    }
    console.log(result)
    if (result) {
      this.fonts[fontID].loaded = true;
      // this.execCallbacks(fontID, false);
      this.loaded += 1;
      return [fontID, true];
    }
    this.fonts[fontID].callbacks.push(o.callback);
    console.log(this.fonts[fontID].callbacks)
    if (this.checkTimer == null) {
      this.checkTimer = this.timeKeeper.setTimeout(this.timedCheck.bind(this), 50);
    }
    return [fontID, false];
  }

  execCallbacks(fontID: string, available: boolean) {
    this.fonts[fontID].callbacks.forEach(c => this.fnMap.exec(c, available));
    this.fonts[fontID].callbacks = [];
  }

  timedCheck() {
    const result = this.isLoadingFinished();
    if (result) {
      return;
    }
    if (this.timeKeeper.now() - this.startTime > this.timeout) {
      return;
    }
    let time = 10;
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
      return true;
    }
    return false;
  }

  _isFontAvailable(name: string) {
    const f = this.fonts[name];
    if (f.loaded) {
      return true;
    }
    if (f.timedOut) {
      return false;
    }
    let result = false;
    // if (document.fonts != null && document.fonts.check != null && false) {
    //   result = document.fonts.check(`${f.font.style} ${f.font.weight} 20px ${f.font.family}`);
    // } else {
    const { width } = this.measureText(name);
    f.width.push(width);
    if (width !== f.mono && width !== f.sans && width !== f.serif) {
      this.fonts[name].count += 1;
    }
    if (this.fonts[name].count === this.fonts[name].maxCount) {
      result = true;
    }
    if (this.timeKeeper.now() > f.timeout) {
      result = null;
    }
    // }

    if (result) {
      this.fonts[name].loaded = true;
      console.log('loaded', name)
      this.execCallbacks(name, true);
      this.notifications.publish('fontLoaded', name);
      this.loaded += 1;
      return true;
    }
    if (result == null) {
      f.timedOut = true;
      this.timedOut += 1;
      this.execCallbacks(name, false);
      this.notifications.publish('fontUnavailable', name);
    }
    return false;
    // const { width } = this.measureText(name);
    // f.width.push(width);
    // if (width !== f.mono && width !== f.sans && width !== f.serif) {
    //   this.fonts[name].count += 1;
    // }
    // if (this.fonts[name].count === this.fonts[name].maxCount) {
    //   this.fonts[name].loaded = true;
    //   this.execCallbacks(name, true);
    //   this.notifications.publish('fontLoaded', name);
    //   this.loaded += 1;
    //   return true;
    // }
    // if (this.timeKeeper.now() > f.timeout) {
    //   f.timedOut = true;
    //   this.timedOut += 1;
    //   this.execCallbacks(name, false);
    //   this.notifications.publish('fontUnavailable', name);
    // }
    // return false;
  }

  isFontAvailable(family: string, weight: string, style: string, testString: string) {
    const name = `${family.toLowerCase()}-${weight.toLowerCase()}-${style.toLowerCase()}-${this.getTestString(testString)[0]}`;
    return this._isFontAvailable(name);
  }

  // getWidth(family: string, weight: string, style: string, testString: string = 'wi') {
  //   this.container.innerHTML = Array(100).join(testString);
  //   this.container.style.fontFamily = family;
  //   this.container.style.fontWeight = weight;
  //   this.container.style.fontStyle = style;
  //   // $FlowFixMe
  //   document.body.appendChild(this.container);
  //   const width = this.container.clientWidth;
  //   // $FlowFixMe
  //   document.body.removeChild(this.container);
  //   return width;
  // }

  // check(
  //   name: string,
  // ) {
  //   const f = this.fonts[name];
  //   return f.mono !== f.monoFam
  //     || f.serif !== f.serifFam
  //     || f.sans !== f.sansFam;
  // }

  // getFamilyWidth(name: string, family: string, weight: string, style: string, testString: string) {
  //   this.fonts[name].monoFam = this.getWidth(`'${family}',monospace`, weight, style, testString);
  //   this.fonts[name].sansFam = this.getWidth(`'${family}',sans-serif`, weight, style, testString);
  //   this.fonts[name].serifFam = this.getWidth(`'${family}',serif`, weight, style, testString);
  // }

  // isFamilyAvailable(family: string, testString: string = 'wi') {
  //   const name = `${family.toLowerCase()}-${testString}`;
  //   if (this.fonts[name] != null) {
  //     const f = this.fonts[name];
  //     if (f.available) {
  //       return true;
  //     }
  //     this.getFamilyWidth(name, family, 'normal', 'normal', testString);
  //     f.available = this.check(name);
  //     return f.available;
  //   }
  //   this.fonts[name] = {
  //     mono: this.getWidth('monospace', 'normal', 'normal', testString),
  //     serif: this.getWidth('serif', 'normal', 'normal', testString),
  //     sans: this.getWidth('sans-serif', 'normal', 'normal', testString),
  //     available: false,
  //     wrapper: null,
  //     callbacks: [],
  //   };
  //   this.getFamilyWidth(name, family, 'normal', 'normal', testString);
  //   this.fonts[name].available = this.check(name);
  //   return this.fonts[name].available;
  // }

  // isFamilyWeightAvailable(
  //   family: string,
  //   weight1: string,
  //   weight2: string,
  //   testString: string = 'wi',
  // ) {
  //   const name = `${family.toLowerCase()}-${weight1.toLowerCase()}-${weight2.toLowerCase()}-${testString}`;
  //   if (this.fonts[name] != null) {
  //     const f = this.fonts[name];
  //     if (f.available) {
  //       return true;
  //     }
  //     this.fonts[name] = {
  //       weight1: this.getWidth(family, weight1, 'normal', testString),
  //       weight2: this.getWidth(family, weight2, 'normal', testString),
  //       available: false,
  //     };
  //     this.fonts[name].available = this.fonts[name].weight1 !== this.fonts[name].weight2;
  //     return f.available;
  //   }
  //   this.fonts[name] = {
  //     weight1: this.getWidth(family, weight1, 'normal', testString),
  //     weight2: this.getWidth(family, weight2, 'normal', testString),
  //     available: false,
  //   };
  //   this.fonts[name].available = this.fonts[name].weight1 !== this.fonts[name].weight2;
  //   return this.fonts[name].available;
  // }

  // isAvailable(family: string, weight: string, style: string, testString: string = 'wi') {
  //   const name = `${family.toLowerCase()}-${weight.toLowerCase()}-${style.toLowerCase()}-${testString}`;
  //   if (this.fonts[name] != null) {
  //     const f = this.fonts[name];
  //     if (f.available) {
  //       return true;
  //     }
  //     f.available = this.check(family, weight, style, f.mono, f.serif, f.sans);
  //     return f.available;
  //   }
  //   this.fonts[name] = {
  //     mono: this.getWidth('monospace', weight, style),
  //     serif: this.getWidth('serif', weight, style),
  //     sans: this.getWidth('sans-serif', weight, style),
  //     available: false,
  //     callbacks: [],
  //     wrapper: null,
  //     origSize: { width: 0, height: 0 },
  //   };
  //   console.log(this.fonts[name])
  //   const f = this.fonts[name];
  //   return this.check(family, weight, style, f.mono, f.serif, f.sans);
  // }

  // // eslint-disable-next-line class-methods-use-this
  // whenAvailable(
  //   family: string,
  //   weight: string,
  //   style: string,
  //   callback: () => void,
  //   testString: string = 'wi',
  // ) {
  //   if (this.isFamilyAvailable(family, testString)) {
  //     console.log('already Available')
  //     return true;
  //   }
  //   const name = `${family.toLowerCase()}-${testString}`;
  //   console.log(this.fonts[name])
  //   if (this.fonts[name].wrapper != null) {
  //     this.fonts[name].callbacks.push(callback);
  //     return false;
  //   }
  //   const wrapper = document.createElement('div');
  //   wrapper.style.cssText = [
  //     'position:absolute',
  //     'overflow:hidden',
  //     // 'left:-99999px', 
  //   ].join(' ;');
  //   const content = document.createElement('div');
  //   content.style.cssText = [
  //     'position:relative',
  //     'white-space:nowrap',
  //   ].join(' ;');
  //   const innerWrapper = document.createElement('div');
  //   innerWrapper.style.cssText = [
  //     'position:absolute',
  //     'width:100%',
  //     'height:100%',
  //     'overflow:hidden',
  //   ].join(' ;');
  //   const innerContent = document.createElement('div');
  //   innerWrapper.appendChild(innerContent);
  //   content.innerHTML = 'some text whose size may change';
  //   content.style.fontFamily = 'serif';
  //   content.insertBefore(innerWrapper, content.firstChild);
  //   wrapper.appendChild(content);
  //   this.fonts[name].wrapper = wrapper;
  //   this.fonts[name].content = content;

  //   const origSize = {
  //     width: content.offsetWidth,
  //     height: content.offsetHeight,
  //   };
  //   this.fonts[name].origSize = origSize;

  //   // console.log('original content size: ' + origSize.width + 'x' + origSize.height);
  //   if (wrapper == null || innerContent == null || innerWrapper == null) {
  //     return false;
  //   }
  //   // Resize wrapper and scroll its content to the bottom right corner
  //   wrapper.style.width = `${origSize.width - 1}px`;
  //   wrapper.style.height = `${origSize.height - 1}px`;
  //   wrapper.scrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
  //   wrapper.scrollTop = wrapper.scrollHeight - wrapper.clientHeight;

  //   // Resize inner content and scroll inner wrapper to the bottom right corner
  //   innerContent.style.width = `${origSize.width + 1}px`;
  //   innerContent.style.height = `${origSize.height + 1}px`;
  //   innerWrapper.scrollLeft = innerWrapper.scrollWidth - innerWrapper.clientWidth;
  //   innerWrapper.scrollTop = innerWrapper.scrollHeight - innerWrapper.clientHeight;
  //   document.body.appendChild(this.fonts[name].wrapper);

  //   this.fonts[name].callbacks.push(callback);
  //   console.log('asdfasdf')
  //   wrapper.addEventListener('scroll', this.isLoaded.bind(this, family, weight, style), false);

  //   innerWrapper.addEventListener('scroll', this.isLoaded.bind(this, family, weight, style), false);

  //   content.style.fontFamily = `${family}, serif`;
  //   content.style.fontWeight = weight;
  //   content.style.fontStyle = style;

  //   return false;
  // }

  // isLoaded(family: string, weight: string, style: string) {
  //   const name = `${family}-${weight}-${style}`;
  //   const f = this.fonts[name];
  //   console.log(family, weight, style)
  //   if (
  //     f.content.offsetWidth !== f.origSize.width
  //     || f.content.offsetHeight !== f.origSize.height
  //   ) {
  //     console.log('here')
  //     this.isAvailable(family, weight, style);
  //     document.body.removeChild(f.wrapper);
  //     if (f.available) {
  //       f.callbacks.forEach(c => c(family, weight, style));
  //     }
  //   }
  // }
}
