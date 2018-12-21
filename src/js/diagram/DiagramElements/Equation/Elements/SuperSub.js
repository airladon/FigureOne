// @flow
import {
  Point,
} from '../../../../tools/g2';
import { duplicateFromTo } from '../../../../tools/tools';
import { Elements } from './Element';

export default class SuperSub extends Elements {
  superscript: Elements | null;
  subscript: Elements | null;
  mainContent: Elements;
  // subscriptXBias: number;
  // xBias: number;
  scriptScale: number;
  superBias: Point;
  subBias: Point;

  constructor(
    content: Elements,
    superscript: Elements | null,
    subscript: Elements | null,
    scriptScale: number | null = null,
    superBias: Point | null = null,
    subBias: Point | null = null,
    // xBias: number = 0,
    // subscriptXBias: number = 0,
  ) {
    super([content, superscript, subscript]);

    this.superscript = superscript;
    this.subscript = subscript;
    // this.subscriptXBias = subscriptXBias;
    this.mainContent = content;
    // this.xBias = xBias;
    this.scriptScale = scriptScale == null ? 0.5 : scriptScale;
    this.superBias = superBias == null ? new Point(0, 0) : superBias;
    this.subBias = subBias == null ? new Point(0, 0) : subBias;
  }

  _dup(namedCollection?: Object) {
    const superscript = this.superscript == null ? null : this.superscript._dup(namedCollection);
    const subscript = this.subscript == null ? null : this.subscript._dup(namedCollection);
    const superSubCopy = new SuperSub(
      this.mainContent._dup(namedCollection),
      superscript,
      subscript,
      this.scriptScale,
      this.superBias,
      this.subBias,
      // this.xBias,
      // this.subscriptXBias,
    );
    duplicateFromTo(this, superSubCopy, ['mainContent', 'superscript', 'subscript', 'content']);
    return superSubCopy;
  }

  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    this.mainContent.calcSize(loc, scale);
    let w = this.mainContent.width;
    let asc = this.mainContent.ascent;
    let des = this.mainContent.descent;

    const { superscript } = this;
    if (superscript !== null) {
      const superLoc = new Point(
        this.location.x + this.mainContent.width + this.superBias.x,
        this.location.y + this.mainContent.ascent * 0.7 + this.superBias.y,
      );
      superscript.calcSize(superLoc, this.scriptScale * scale);
      w = Math.max(
        w,
        superLoc.x - this.location.x + superscript.width,
      );
      asc = Math.max(
        asc,
        superscript.ascent + superLoc.y - this.location.y,
      );
      des = Math.max(
        des,
        this.location.y - (superLoc.y - superscript.descent),
      );
    }

    const { subscript } = this;
    if (subscript !== null) {
      // get the height of the subscript content
      subscript.calcSize(new Point(0, 0), this.scriptScale * scale);

      const subLoc = new Point(
        this.location.x + this.mainContent.width + this.subBias.x,
        // this.location.x + this.mainContent.width - this.subscriptXBias + this.xBias,
        this.location.y - subscript.ascent * 0.7 + this.subBias.y,
      );
      subscript.calcSize(subLoc, this.scriptScale * scale);
      w = Math.max(
        w,
        subLoc.x - this.location.x + subscript.width,
      );
      asc = Math.max(asc, subscript.ascent + subLoc.y - this.location.y);
      des = Math.max(des, subscript.descent + (this.location.y - subLoc.y));
    }
    this.width = w;
    this.ascent = asc;
    this.descent = des;
    this.height = this.descent + this.ascent;
  }

  getAllElements() {
    let elements = [];
    if (this.superscript) {
      elements = [...elements, ...this.superscript.getAllElements()];
    }
    if (this.subscript) {
      elements = [...elements, ...this.subscript.getAllElements()];
    }
    if (this.mainContent) {
      elements = [...elements, ...this.mainContent.getAllElements()];
    }
    return elements;
  }

  setPositions() {
    this.mainContent.setPositions();
    if (this.superscript) {
      this.superscript.setPositions();
    }
    if (this.subscript) {
      this.subscript.setPositions();
    }
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    this.mainContent.offsetLocation(offset);
    if (this.superscript) {
      this.superscript.offsetLocation(offset);
    }
    if (this.subscript) {
      this.subscript.offsetLocation(offset);
    }
  }
}

