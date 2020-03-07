// @flow

import {
  DiagramElementPrimitive, DiagramElementCollection,
} from '../../Element';
import {
  Rect, Transform, Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';

import VAxis from './VertexObjects/VAxis';
import VTickMarks from './VertexObjects/VTickMarks';
import {
  AxisProperties, GridProperties, TickProperties,
} from './AxisProperties';
// import TextObject from '../../textObjects/TextObject';
import {
  TextObject, DiagramText, DiagramFont,
} from '../../DrawingObjects/TextObject/TextObject';
import DrawContext2D from '../../DrawContext2D';

class Axis extends DiagramElementCollection {
  props: AxisProperties;
  webgl: Array<WebGLInstance>;
  diagramLimits: Rect;
  drawContext2D: Array<DrawContext2D>;

  constructor(
    webgl: Array<WebGLInstance>,
    drawContext2D: Array<DrawContext2D>,
    axisProperties: AxisProperties = new AxisProperties(),
    transform: Transform = new Transform(),
    diagramLimits: Rect = new Rect(-1, 1, 2, 2),
  ) {
    super(transform, diagramLimits);
    this.props = axisProperties;
    this.webgl = webgl;
    this.diagramLimits = diagramLimits;
    this.drawContext2D = drawContext2D;
    this.build();
  }

  rebuild() {
    this.drawOrder = [];
    this.build();
  }

  build() {
    const {
      minorTicks, majorTicks,
      minorGrid, majorGrid,
    } = this.props;
    if (majorTicks.mode === 'auto') {
      this.props.generateAutoMajorTicks();
    }
    if (minorTicks.mode === 'auto') {
      this.props.generateAutoMinorTicks();
    }
    const xRatio = 2 / this.diagramLimits.width;
    // const xRatio = 1;
    // const yRatio = 2 / diagramLimits.height;
    const cMajorTicksStart = this.props.valueToClip(majorTicks.start);
    const cMinorTicksStart = this.props.valueToClip(minorTicks.start);
    const majorTicksNum = this.props.getMajorNum();
    const minorTicksNum = this.props.getMinorNum();

    // Grid
    this.addTicksOrGrid(
      'minorGrid', this.webgl, minorGrid, minorTicksNum,
      minorTicks.step, cMinorTicksStart, xRatio, this.diagramLimits,
    );

    this.addTicksOrGrid(
      'majorGrid', this.webgl, majorGrid, majorTicksNum,
      majorTicks.step, cMajorTicksStart, xRatio, this.diagramLimits,
    );

    // Ticks
    this.addTicksOrGrid(
      'minorTicks', this.webgl, minorTicks, minorTicksNum,
      minorTicks.step, cMinorTicksStart, xRatio, this.diagramLimits,
    );

    this.addTicksOrGrid(
      'majorTicks', this.webgl, majorTicks, majorTicksNum,
      majorTicks.step, cMajorTicksStart, xRatio, this.diagramLimits,
    );

    // Axis Line
    const axis = new VAxis(this.webgl, this.props);
    this.add('line', new DiagramElementPrimitive(
      axis,
      new Transform(),
      this.props.color,
      this.diagramLimits,
    ));

    const font = new DiagramFont(
      this.props.titleFontFamily,
      'normal',
      this.props.titleFontSize,
      this.props.titleFontWeight,
      'center',
      'middle',
      this.props.titleFontColor,
    );
    const titleText = [new DiagramText(
      new Point(0, 0).transformBy(new Transform()
        .rotate(this.props.rotation).matrix()),
      this.props.title,
      font,
    )];
    const title = new TextObject(
      this.drawContext2D[0],
      titleText,
    );

    this.add('title', new DiagramElementPrimitive(
      title,
      new Transform()
        .rotate(this.props.rotation)
        .translate(this.props.titleOffset.x, this.props.titleOffset.y),
      [0.5, 0.5, 0.5, 1],
      this.diagramLimits,
    ));

    // Labels
    this.addTickLabels(
      'major', this.drawContext2D[0], majorTicks,
      this.props.generateMajorLabels.bind(this.props), this.diagramLimits,
      this.props.majorTicks.labelOffset,
    );
    this.addTickLabels(
      'minor', this.drawContext2D[0], minorTicks,
      this.props.generateMinorLabels.bind(this.props), this.diagramLimits,
      this.props.minorTicks.labelOffset,
    );
  }

  toClip(value: number) {
    return this.props.toClip(value);
  }

  valueToClip(value: number) {
    return this.props.valueToClip(value);
  }

  addTicksOrGrid(
    name: string,
    webgl: Array<WebGLInstance>,
    ticksOrGrid: GridProperties,
    num: number,
    step: number,
    clipStart: number,
    xRatio: number,
    diagramLimits: Rect,
  ) {
    if (ticksOrGrid.mode !== 'off') {
      const ticks = new VTickMarks(
        webgl,
        new Point(
          // clipStart - ticksOrGrid.width / 2 * xRatio,
          clipStart,
          this.props.start.y,
        ),
        this.props.rotation,
        num,
        this.toClip(step),
        ticksOrGrid.length,
        ticksOrGrid.width,
        ticksOrGrid.offset,
      );
      this.add(name, new DiagramElementPrimitive(
        ticks,
        new Transform().scale(1, 1).rotate(0).translate(0, 0),
        ticksOrGrid.color,
        diagramLimits,
      ));
      // if (name === 'majorTicks') {
      //   console.log(ticks)
      // }
    }
  }

  addTickLabels(
    name: string,
    drawContext2D: DrawContext2D,
    ticks: TickProperties,
    labelGenerator: () => void,
    diagramLimits: Rect,
    offset: Point,
  ) {
    if (ticks.labelMode === 'auto') {
      labelGenerator();
    }
    const font = new DiagramFont(
      ticks.fontFamily,
      'normal',
      ticks.fontSize,
      ticks.fontWeight,
      ticks.labelsHAlign,
      ticks.labelsVAlign,
      ticks.fontColor,
    );

    if (this.props.rotation > Math.PI / 2 * 0.95) {
      font.yAlign = 'middle';
      font.xAlign = 'right';
    }
    const dText = [];
    for (let i = 0; i < ticks.labels.length; i += 1) {
      dText.push(new DiagramText(
        new Point(
          this.valueToClip(ticks.start + i * ticks.step),
          0,
        ).transformBy(new Transform().rotate(this.props.rotation).matrix()),
        ticks.labels[i],
        font,
      ));
    }
    const axisLabels = new TextObject(
      drawContext2D,
      dText,
    );

    this.add(`label_${name}`, new DiagramElementPrimitive(
      axisLabels,
      new Transform().scale(1, 1).rotate(0).translate(offset.x, offset.y),
      [0.5, 0.5, 0.5, 1],
      diagramLimits,
    ));
    // const label = new TextObject(
    //   drawContext2D,
    //   ticks.labels[i],
    //   new Point(
    //     this.valueToClip(ticks.start + i * ticks.step),
    //     0,
    //   ).transformBy(new Transform().rotate(this.props.rotation).matrix()),
    //   [ticks.labelsHAlign, ticks.labelsVAlign],
    //   ticks.labelOffset,
    // );
    // label.fontSize = ticks.fontSize;
    // label.fontFamily = ticks.fontFamily;
    // label.fontWeight = ticks.fontWeight;

    // this.add(`label_${name}_${i}`, new DiagramElementPrimitive(
    //   label,
    //   new Transform().scale(1, 1).rotate(0).translate(0, 0),
    //   [0.5, 0.5, 0.5, 1],
    //   diagramLimits,
    // ));
  }
}

export default Axis;

