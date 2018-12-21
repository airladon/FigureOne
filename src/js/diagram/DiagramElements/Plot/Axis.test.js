import Axis from './Axis';
import { AxisProperties } from './AxisProperties';
import { Point } from '../../../tools/g2';
import webgl from '../../../__mocks__/WebGLInstanceMock';
import { round } from '../../../tools/math';


describe('Axis', () => {
  let axis;
  let props;
  beforeEach(() => {
    const mockCtx = {
      ratio: 1,
      ctx: {
        font: '',
        textAlgin: '',
        textBaseline: '',
        canvas: {
          width: 100,
          height: 100,
        },
        measureText: () => {  // eslint-disable-line arrow-body-style
          return {
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 0,
            actualBoundingBoxAscent: 0,
            actualBoundingBoxDescent: 0,
          };
        },
      },
    };
    props = new AxisProperties();
    props.start = new Point(0, 0);
    props.length = 1;
    props.width = 0.01;
    props.rotation = Math.PI / 4;
    props.color = [0.5, 0.5, 0.5, 1];
    props.label = '';
    props.logarithmic = false;
    props.majorTicks.mode = 'on';
    props.majorTicks.step = 0.5;
    props.majorTicks.length = 0.05;
    props.majorTicks.width = 0.016;
    props.majorTicks.color = [0.5, 0.5, 0.5, 1];
    props.majorTicks.labels = [];
    props.majorTicks.offset = 0;
    props.majorTicks.labelMode = 'on';
    props.majorTicks.labelOffset = -0.5;
    props.majorGrid.mode = 'on';
    props.majorGrid.length = 1;
    props.majorGrid.width = 0.008;
    props.majorGrid.color = [0.7, 0.7, 0.7, 1];
    props.minorTicks.step = 0.25;
    props.minorTicks.length = 0.02;
    props.minorTicks.width = 0.008;
    props.minorTicks.color = [0.5, 0.5, 0.5, 1];
    props.minorTicks.labels = [];
    props.minorTicks.offset = 0;
    props.minorTicks.labelOffset = -0.5;
    props.minorTicks.labelMode = 'on';
    props.minorGrid.mode = 'on';
    props.minorGrid.length = 1;
    props.minorGrid.width = 0.008;
    props.minorGrid.color = [0.9, 0.9, 0.9, 1];
    axis = new Axis(webgl, mockCtx, props);
  });
  test('Default', () => {
    // console.log(axis.props)
    expect(axis.props.start).toEqual(new Point(0, 0));
    expect(axis.props.length).toBe(1);  // eslint-disable-line
    expect(axis.props.width).toBe(0.01);
    expect(axis.props.rotation).toBe(Math.PI / 4);
    expect(axis.props.color).toEqual([0.5, 0.5, 0.5, 1]);
    expect(axis.props.label).toBe('');
    expect(axis.props.logarithmic).toBe(false);
    expect(axis.props.majorTicks.mode).toBe('on');
    expect(axis.props.majorTicks.step).toBe(0.5);
    expect(axis.props.majorTicks).toHaveLength(0.05);
    expect(axis.props.majorTicks.width).toBe(0.016);
    expect(axis.props.majorTicks.color).toEqual([0.5, 0.5, 0.5, 1]);
    expect(axis.props.majorTicks.labels).toEqual([]);
    expect(axis.props.majorTicks.offset).toBe(0);
    expect(axis.props.majorTicks.labelOffset).toBe(-0.5);
    expect(axis.props.majorGrid.mode).toBe('on');
    expect(axis.props.majorGrid).toHaveLength(1);
    expect(axis.props.majorGrid.width).toBe(0.008);
    expect(axis.props.majorGrid.color).toEqual([0.7, 0.7, 0.7, 1]);
    expect(axis.props.minorTicks.step).toBe(0.25);
    expect(axis.props.minorTicks).toHaveLength(0.02);
    expect(axis.props.minorTicks.width).toBe(0.008);
    expect(axis.props.minorTicks.color).toEqual([0.5, 0.5, 0.5, 1]);
    expect(axis.props.minorTicks.labels).toEqual([]);
    expect(axis.props.minorTicks.offset).toBe(0);
    expect(axis.props.minorTicks.labelOffset).toBe(-0.5);
    expect(axis.props.minorGrid.mode).toBe('on');
    expect(axis.props.minorGrid).toHaveLength(1);
    expect(axis.props.minorGrid.width).toBe(0.008);
    expect(axis.props.minorGrid.color).toEqual([0.9, 0.9, 0.9, 1]);
  });
  test('Axis points', () => {
    const points = [
      0.0035355339059327372,
      -0.003535533905932738,
      0.7106423150924803,
      0.7035712472806147,
      0.7035712472806148,
      0.7106423150924802,
      0.0035355339059327372,
      -0.003535533905932738,
      0.7035712472806148,
      0.7106423150924802,
      -0.0035355339059327372,
      0.003535533905932738,
    ];
    expect(round(axis._line.drawingObject.points)).toEqual(round(points));
  });
  test('Major Tick points', () => {
    // eslint-disable-next-line max-len
    const points = [-0.00566, -0.00566, 0.00566, 0.00566, -0.0297, 0.04101, -0.00566, -0.00566, -0.0297, 0.04101, -0.04101, 0.0297, 0.3479, 0.3479, 0.35921, 0.35921, 0.32385, 0.39457, 0.3479, 0.3479, 0.32385, 0.39457, 0.31254, 0.38325, 0.70145, 0.70145, 0.71276, 0.71276, 0.67741, 0.74812, 0.70145, 0.70145, 0.67741, 0.74812, 0.66609, 0.73681];
    expect(round(axis._majorTicks.drawingObject.points)).toEqual(round(points));
  });

  test('Minor Tick points', () => {
    // eslint-disable-next-line max-len
    const points = [-0.00283, -0.00283, 0.00283, 0.00283, -0.01131, 0.01697, -0.00283, -0.00283, -0.01131, 0.01697, -0.01697, 0.01131, 0.17395, 0.17395, 0.17961, 0.17961, 0.16546, 0.19375, 0.17395, 0.17395, 0.16546, 0.19375, 0.15981, 0.18809, 0.35072, 0.35072, 0.35638, 0.35638, 0.34224, 0.37052, 0.35072, 0.35072, 0.34224, 0.37052, 0.33658, 0.36487, 0.5275, 0.5275, 0.53316, 0.53316, 0.51902, 0.5473, 0.5275, 0.5275, 0.51902, 0.5473, 0.51336, 0.54164, 0.70428, 0.70428, 0.70994, 0.70994, 0.69579, 0.72408, 0.70428, 0.70428, 0.69579, 0.72408, 0.69014, 0.71842];
    expect(round(axis._minorTicks.drawingObject.points)).toEqual(round(points));
  });
  test('Major Grid points', () => {
    // eslint-disable-next-line max-len
    const points = [-0.00283, -0.00283, 0.00283, 0.00283, -0.70428, 0.70994, -0.00283, -0.00283, -0.70428, 0.70994, -0.70994, 0.70428, 0.35072, 0.35072, 0.35638, 0.35638, -0.35072, 1.06349, 0.35072, 0.35072, -0.35072, 1.06349, -0.35638, 1.05783, 0.70428, 0.70428, 0.70994, 0.70994, 0.00283, 1.41704, 0.70428, 0.70428, 0.00283, 1.41704, -0.00283, 1.41139];

    expect(round(axis._majorGrid.drawingObject.points)).toEqual(round(points));
  });

  test('Minor Grid points', () => {
    // eslint-disable-next-line max-len
    const points = [-0.00283, -0.00283, 0.00283, 0.00283, -0.70428, 0.70994, -0.00283, -0.00283, -0.70428, 0.70994, -0.70994, 0.70428, 0.17395, 0.17395, 0.17961, 0.17961, -0.5275, 0.88671, 0.17395, 0.17395, -0.5275, 0.88671, -0.53316, 0.88106, 0.35072, 0.35072, 0.35638, 0.35638, -0.35072, 1.06349, 0.35072, 0.35072, -0.35072, 1.06349, -0.35638, 1.05783, 0.5275, 0.5275, 0.53316, 0.53316, -0.17395, 1.24027, 0.5275, 0.5275, -0.17395, 1.24027, -0.17961, 1.23461, 0.70428, 0.70428, 0.70994, 0.70994, 0.00283, 1.41704, 0.70428, 0.70428, 0.00283, 1.41704, -0.00283, 1.41139];

    expect(round(axis._minorGrid.drawingObject.points)).toEqual(round(points));
  });
});
