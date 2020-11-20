// @flow

import { Point } from '../../../tools/g2';
import { roundNum } from '../../../tools/math';

const defaultColor = [0.7, 0.7, 0.7, 1];

class GridProperties {
  // Clip Space
  length: number;
  width: number;
  offset: number;

  // General
  color: TypeColor;
  mode: 'on' | 'off' | 'auto';

  constructor() {
    this.length = 1;
    this.width = 0.01;
    this.color = defaultColor;
    this.mode = 'on';
    this.offset = 0;
  }
}
class TickProperties extends GridProperties {
  // Axis Space
  start: number;
  step: number;

  // Clip Space;
  length: number;
  width: number;
  offset: number;
  labelOffset: Point;

  // General
  color: TypeColor;
  labelMode: 'on' | 'off' | 'auto';
  labels: Array<string>;
  labelsHAlign: 'left' | 'center' | 'right';
  labelsVAlign: 'top' | 'middle' | 'bottom';
  mode: 'on' | 'off' | 'auto';

  fontFamily: string;
  fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontSize: number;
  fontColor: Array<number>

  constructor() {
    super();
    this.start = 0;
    this.step = 0.1;

    this.length = 0.05;
    this.width = 0.01;
    this.offset = 0;
    this.labelOffset = new Point(0, 0);

    this.color = defaultColor;
    this.labels = [];
    this.labelMode = 'auto';
    this.labelsHAlign = 'center';
    this.labelsVAlign = 'middle';
    this.mode = 'on';
    this.fontFamily = 'Helvetica Neue';
    this.fontWeight = '400';
    this.fontSize = 0.1;
    this.fontColor = defaultColor;
  }
}

class AxisProperties {
  name: string;
  start: Point;
  length: number;
  width: number;
  rotation: number;
  color: TypeColor;
  title: string;
  titleOffset: Point;
  titleRotation: number;
  logarithmic: boolean;
  limits: { max: number, min: number };
  majorTicks: TickProperties;
  minorTicks: TickProperties;
  majorGrid: GridProperties;
  minorGrid: GridProperties;

  titleFontFamily: string;
  titleFontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  titleFontSize: number;
  titleFontColor: Array<number>;


  constructor(name: string = '', rotation: number = 0) {
    this.name = name;

    // Clip Space
    this.start = new Point(0, 0);
    this.length = 1;
    this.width = 0.01;
    this.rotation = rotation;


    this.color = [0.5, 0.5, 0.5, 1];
    this.title = '';
    this.titleOffset = new Point(this.length / 2, -0.1);
    this.titleRotation = 0;
    this.limits = { min: 0, max: 1 };
    this.logarithmic = false;

    this.majorTicks = new TickProperties();
    this.minorTicks = new TickProperties();
    this.minorTicks.labelMode = 'off';
    this.majorGrid = new GridProperties();
    this.minorGrid = new GridProperties();

    this.titleFontFamily = 'Helvetica Neue';
    this.titleFontWeight = '400';
    this.titleFontSize = 0.13;
    this.titleFontColor = defaultColor;
  }

  getNum(start: number, step: number) {
    return Math.floor((this.limits.max - start) / step) + 1;
  }

  getMajorNum() {
    return this.getNum(this.majorTicks.start, this.majorTicks.step);
  }

  getMinorNum() {
    return this.getNum(this.minorTicks.start, this.minorTicks.step);
  }

  generateAuto(approximateNum: number = 10) {
    // const approximateNum = 10;
    const range = this.limits.max - this.limits.min;
    let step = range / approximateNum;
    const orderOfMagnitude = roundNum(Math.floor(Math.log10(step)), 0);
    step = roundNum(step, -orderOfMagnitude);
    let start = roundNum(this.limits.min, -orderOfMagnitude);
    if (start < this.limits.min) {
      start += 10 ** orderOfMagnitude;
    }
    if (this.getNum(start, step) > 11) {
      step *= 2;
    }
    return { start, step };
  }

  generateAutoMajorTicks(approximateNum: number = 10) {
    const { start, step } = this.generateAuto(approximateNum);
    this.majorTicks.start = start;
    this.majorTicks.step = step;
  }

  generateAutoMinorTicks(approximateNum: number = 50) {
    const { start, step } = this.generateAuto(approximateNum);
    this.minorTicks.start = start;
    this.minorTicks.step = step;
  }

  toClip(value: number) {
    const ratio = this.length / (this.limits.max - this.limits.min);
    return value * ratio;
  }

  valueToClip(value: number) {
    return this.toClip(value - this.limits.min) + this.start.x;
  }

  getMajorLabels() {
    const labels = [];
    for (let i = 0, j = this.getMajorNum(); i < j; i += 1) {
      const value = this.majorTicks.start + i * this.majorTicks.step;
      labels.push(value.toString());
    }
    return labels;
  }

  generateMajorLabels() {
    this.majorTicks.labels = this.getMajorLabels();
  }

  getMinorLabels() {
    const labels = [];
    for (let i = 0, j = this.getMinorNum(); i < j; i += 1) {
      const value = this.minorTicks.start + i * this.minorTicks.step;
      labels.push(value.toString());
    }
    return labels;
  }

  generateMinorLabels() {
    this.minorTicks.labels = this.getMinorLabels();
  }
}

export { AxisProperties, GridProperties, TickProperties };
