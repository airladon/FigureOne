// @flow
import TimeKeeper from './TimeKeeper';
import { joinObjects, hash32, NotificationManager } from '../tools/tools';
import { FunctionMap } from '../tools/FunctionMap';

const greek = '\u0391\u0392\u0393\u0394\u0395\u0396\u0397\u0398\u0399\u039A\u039B\u039C\u039D\u039E\u039F\u03A0\u03A1\u03A3\u03A4\u03A5\u03A6\u03A7\u03A8\u03A9\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8\u03B9\u03BA\u03BB\u03BC\u03BD\u03BE\u03BF\u03C0\u03C1\u03C2\u03C3\u03C4\u03C5\u03C6\u03C7\u03C8\u03c9';

const alpha = `QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm,./<>?;':"[]\{}|1234567890!@#$%^&*()-=_+"`;

const math = '\u00ba\u00b0\u2212\u00d7\u00f7';

export type OBJ_FontOptions = {
  family: string,
  weight?: string,
  style?: string,
  timeout?: number,
  testString?: string,
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

  constructor(
    timeKeeper: TimeKeeper = new TimeKeeper(),
    fnMap: FunctionMap = new FunctionMap(),
    notifications: NotificationManager = new NotificationManager(),
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
    }
    return FontManager.instance;
  }

  measureText(name: string, backupFont: string = '') {
    const f = this.fonts[name];
    let backup = '';
    if (backupFont !== '') {
      backup = `, ${backupFont}`;
    }
    this.ctx.font = `${f.style} ${f.weight} 20px ${f.family}${backup}`;
    return this.ctx.measureText(f.testString);
  }

  // eslint-disable-next-line class-methods-use-this
  getTestString(testStringIn: string) {
    let testString = testStringIn;
    let testStringName = hash32(testStringIn).toString().slice(8);
    if (testString === 'greek') {
      testString = greek;
      testStringName = 'greek';
    } else if (testString === 'alpha') {
      testString = alpha;
      testStringName = 'alpha';
    } else if (testString === 'math') {
      testString = math;
      testStringName = 'math';
    } else if (testString === 'all') {
      testString = `${alpha}${greek}${math}`;
      testStringName = 'all';
    }
    return [testStringName, testString];
  }

  loadFont(options: OBJ_FontOptions) {
    const o = joinObjects({}, {
      weight: 'normal',
      style: 'normal',
      timeout: 5000,
      test: 'all',
      maxCount: 1,
      callback: null,
    }, options);

    const [testStringName, testString] = this.getTestString(o.test);

    const name = `${o.family.toLowerCase()}-${o.weight.toLowerCase()}-${o.style.toLowerCase()}-${testStringName}`;

    // If the font family-weight-style has already been created, then
    // return the result of whether it is loaded or not
    if (this.fonts[name] != null) {
      if (o.callback != null) {
        this.fonts[name].callbacks.push(o.callback);
      }
      if (this.fonts[name].loaded) {
        this.execCallbacks(name, true);
        return true;
      }
      return false;
    }

    // Create widths for mono, serif, sans-serif and the font of interest.
    this.fonts[name] = {
      timeout: this.timeKeeper.now() + o.timeout,
      weight: o.weight,
      family: o.family,
      style: o.style,
      testStringName,
      testString,
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
    const mono = this.measureText(name, 'monospace').width;
    const sans = this.measureText(name, 'sans-serif').width;
    const serif = this.measureText(name, 'serif').width;
    const { width } = this.measureText(name);
    this.fonts[name].mono = mono;
    this.fonts[name].serif = serif;
    this.fonts[name].sans = sans;
    this.fonts[name].width.push(width);
    // this.fonts[name] = {
    //   timeout: this.timeKeeper.now() + o.timeout,
    //   weight: o.weight,
    //   family: o.family,
    //   style: o.style,
    //   testStringName,
    //   testString,
    //   width: [width],
    //   mono,
    //   serif,
    //   sans,
    //   loaded: false,
    //   count: 0,
    //   maxCount: o.maxCount,
    //   callbacks: [],
    //   timedOut: false,
    // };
    if (width !== mono && width !== sans && width !== serif) {
      this.fonts[name].count += 1;
    }
    if (this.fonts[name].count === this.fonts[name].maxCount) {
      this.fonts[name].loaded = true;
      this.execCallbacks(name, false);
      this.loaded += 1;
    } else {
      this.loading += 1;
    }
    return false;
  }

  execCallbacks(name: string, available: boolean) {
    this.fonts[name].callbacks.forEach(c => this.fnMap.exec(c, available));
    this.fonts[name].callbacks = [];
  }

  isLoadingFinished() {
    if (this.loaded + this.timedOut === this.loading) {
      return true;
    }
    Object.keys(this.fonts).forEach((name) => {
      this._isFontAvailable(name);
    });
    if (this.loaded + this.timedOut === this.loading) {
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
    const { width } = this.measureText(name);
    f.width.push(width);
    if (width !== f.mono && width !== f.sans && width !== f.serif) {
      this.fonts[name].count += 1;
    }
    if (this.fonts[name].count === this.fonts[name].maxCount) {
      this.fonts[name].loaded = true;
      this.execCallbacks(name, true);
      this.loaded += 1;
      return true;
    }
    if (this.timeKeeper.now() > f.timeout) {
      f.timedOut = true;
      this.timedOut += 1;
      this.execCallbacks(name, false);
    }
    return false;
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
