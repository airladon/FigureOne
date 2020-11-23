// @flow

import {
  Transform, Point, getPoint, clipAngle,
  RangeBounds, RectBounds,
} from '../../tools/g2';
import type {
  TypeRangeBoundsDefinition, TypeRectBoundsDefinition,
} from '../../tools/g2';
import { joinObjects, joinObjectsWithOptions } from '../../tools/tools';
import { round, range } from '../../tools/math';
import {
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import type {
  COL_Line,
} from './Line';
import type {
  COL_Angle,
} from './Angle';
import FigurePrimitives from '../FigurePrimitives/FigurePrimitives';
// eslint-disable-next-line import/no-cycle
import FigureObjects from './FigureObjects';
import FigureEquation from '../FigureEquation/FigureEquation';
import type { OBJ_Polyline, OBJ_Polygon } from '../FigurePrimitives/FigurePrimitives';

/* eslint-disable max-len */
/**
 * Collections Polyline pad addition options.
 *
 * Each pad is associated with a point of the polyline.
 *
 * @extends COL_Polygon
 *
 * @property {boolean} [isMovable] `true` allows moving the pad and the
 * associated polyline point (`false`)
 * @property {TypeRangeBoundsDefinition | TypeRectBoundsDefinition | RangeBounds | RectBounds | 'figure'} [boundary]
 * boundary the pad can move within
 */
/* eslint-enable max-len */
export type OBJ_PolylinePadSingle = {
  isMovable?: boolean,
  boundary?: TypeRangeBoundsDefinition | TypeRectBoundsDefinition | RangeBounds | RectBounds | 'figure',
}

/**
  * @extends OBJ_PolylinePadSingle
  * @extends OBJ_PolylineCustomization
 */
export type OBJ_PolylinePad = {};

/**
 * Polyline side, angle and pad customization options object
 *
 * ![](./assets1/polylinecustomization_ex1.png)
 *
 * ![](./assets1/polylinecustomization_ex2.png)
 *
 * Side annotations, angle annotations and movable pads in an
 * {@link CollectionsPolyline} are defined with the options objects {@link COL_Line},
 * {@link COL_Angle} and ({@link OBJ_Polygon} & {@link OBJ_PolylinePadSingle})
 * respectively.
 *
 * The properties in this object can be used in the side, angle and movable
 * pad object definitions to allow for customization of specific sides,
 * angles and movable pads.
 *
 * Each side, angle and movable pad has an 0 based index associated with it.
 * The zero index pad is associated with the first point of the polyline. The
 * zero index side is between the first and second point of the polyline, and
 * the zero index angle is between the first, second and third point of the
 * polyline.
 *
 * By default, any properties defined for <a href="adv_polyline#pad">pad</a>
 * will be applied to all pads of the polyline. To customize the first pad in
 * the polyline, an object property with name `'0'` can be used with a value
 * that includes the options object properties that should be customized.
 * Similary, for side and angle annotations, keys with the index name can be
 * used in their options objects to customize specific sides and angles.
 *
 * The `show` and `hide` properties can be used to show and hide specific sides
 * and angles.
 *
 * See {@link OBJ_PulseWidthAnimationStep} for pulse angle animation step
 * options.
 *
 * @property {Array<number>} [show] list of indexes to show
 * @property {Array<number>} [hide] list of indexes to hide
 * @property {COL_Angle | COL_Line | OBJ_PolylinePadSingle} [_padIndex]
 * Customizations of annotation or pad by index where `_padIndex` should be an
 * object key name that is the index
 *
 * @example
 * // Hide pad 0, and make pad 2 blue and not filled
 * figure.addElement({
 *   name: 'p',
 *   method: 'collections.polyline',
 *   options: {
 *     points: [[0, 0], [2, 0], [2, 2], [-2, 1]],
 *     pad: {
 *       radius: 0.2,            // OBJ_Polygon
 *       color: [1, 0, 0, 1],    // OBJ_Polygon
 *       touchBorder: 0.1,       // OBJ_Polygon
 *       isMovable: true,
 *       hide: [0],
 *       2: {                    // Custom pad 2 properties
 *         color: [0, 0, 1, 1],  // Make blue
 *         line: { width: 0.01 } // Use an outline instead of a fill
 *       },
 *     },
 *   }
 * });
 *
 * @example
 * // Customization of side and angle annotations
 * figure.addElement({
 *   name: 'p',
 *   method: 'collections.polyline',
 *   options: {
 *     points: [[0, 0], [1, 0], [1, 1], [0, 1]],
 *     close: true,
 *     side: {
 *       showLine: false,
 *       label: {
 *         text: null,                 // By default, sides are length values
 *         location: 'negative',
 *       },
 *       0: { label: { text: 'a' } },  // Side 0 is 'a' instead of length
 *     },
 *     angle: {
 *       label: {
 *         text: '?',
 *         offset: 0.05,
 *       },
 *       curve: {
 *         radius: 0.25,
 *       },
 *       direction: 'negative',
 *       show: [2],                   // Only show angle annotation for angle 2
 *     },
 *   }
 * });
 */
export type OBJ_PolylineCustomization = {
  show?: Array<number>,
  hide?: Array<number>,
  _padIndex: OBJ_Polygon,
};

/**
 * When shapes get too small, angle and side annotations can start to draw on
 * each other. This object defines thresholds for when the angle and side
 * annotations should be hidden.
 *
 * @property {null | number} [minAngle]
 * @property {null | number} [maxAngle]
 * @property {null | number} [minSide]
 */
export type OBJ_ValidShapeHideThresholds = {
  minAngle?: ?number,
  maxAngle?: ?number,
  minSide?: ?number,
}


/**
 * Makes the sides and angles of a closed polyline consistent. Also reverses
 * the point order if angles are on outside of shape instead of inside.
 *
 * Floating point rounding errors will sometimes result in angles
 * and side lengths being slightly larger or smaller than is possible.
 * For instance, for a triangle, there may be a rare case where the three
 * angles add up to 181ª instead of 180ª as a result of rounding the angle
 * labels to no decimal places.
 *
 * Making a shape consistent will go through all the side and angle labels
 * and correct them, displaying a value without rounding error.
 *
 * Currently, only `'triangle'` is supported.
 *
 * In addition, the angle and side annotations can be hidden if minimum
 * or maximum thresholds of angle and side values are crossed. For example,
 * for small triangles angle annotations may start to draw on top of each other
 * being messy.
 *
 * @property {'triangle'} [shape]
 * @property {OBJ_ValidShapeHideThresholds} [hide]
 */
export type OBJ_ValidShape = {
  shape?: 'triangle',
  hide?: OBJ_ValidShapeHideThresholds,
};

/**
 * @extends COL_Angle
 * @extends OBJ_PolylineCustomization
 */
export type OBJ_PolylineAngle = {}

/**
 * @extends COL_Line
 * @extends OBJ_PolylineCustomization
 */
export type OBJ_PolylineSide = {}

// /**
//  * @extends COL_Polygon
//  * @extends OBJ_PolylineCustomization
//  */
// export type COL_PolylinePad = {}

/* eslint-disable max-len */
/**
 * Collections Polyline options object
 *
 * The Collections Polyline is a convient and powerful polyline
 * {@link FigureElementCollection} that includes the polyline,
 * angle annotations, side label and arrow annotations, and movable
 * pads on each polyline point for the user to adjust dynamically.
 *
 * The polyline itself is defined with an {@link OBJ_Polyline} options Object.
 *
 * Angle and side annotations can be defined as {@link COL_Angle} and
 * {@link COL_Line}, and movable pads defined with
 * ({@link OBJ_Polygon} & {@link OBJ_PolylinePad}).
 *
 * Angles, sides and pads can all be defined either as an options object
 * or an array of options objects. If an array, then each element in the
 * array will correspond with a pad on the polyline. If there are less
 * elements in the array than pads on the polyline, then the elements
 * will recycle from the start.
 *
 * Using object definitions allows for a definition of all angles, sides and
 * pads. To customize for specific side, angle or pad indexes use =
 * {@link OBJ_PolylineCustomization}.
 *
 * @extends OBJ_Polyline
 *
 * @property {boolean} [showLine] `false` will hide the polyline's line (`true`)
 * @property {OBJ_PolylineAngle | Array<COL_Angle>} [angle] angle annotations - leave undefined for no angle annotations
 * @property {OBJ_PolylineSide | Array<COL_Line>} [side]
 * side annotations - leave undefined for no side annotations
 * @property {OBJ_PolylinePad | Array<OBJ_PolylinePadSingle>} [pad]
 * move pad - leave undefined for no move pads
 * @property {null | OBJ_ValidShapeHideThresholds} [makeValid] if defined, whenever
 * points are updated the shape will be checked to ensure consistency with
 * displayed labels of angles and sides.
 */
/* eslint-enable max-len */
export type COL_Polyline = {
  showLine?: boolean,
  angle?: OBJ_PolylineAngle | Array<COL_Angle>,
  side?: OBJ_PolylineSide | Array<COL_Line>,
  pad?: OBJ_PolylinePad | Array<OBJ_PolylinePadSingle>,
  makeValid?: ?OBJ_ValidShape,
} & OBJ_Polyline;

function processArray(
  toProcess: Object | Array<Object>,
  defaultOptions: Object,
  defaultLabelOptions: Object,
  total: number,
) {
  if (Array.isArray(toProcess)) {
    const out = [];
    for (let i = 0; i < total; i += 1) {
      const o = toProcess[i % toProcess.length];
      if (o.label != null) {
        out.push(joinObjects({}, defaultOptions, { label: defaultLabelOptions }, o));
      } else {
        out.push(joinObjects({}, defaultOptions, o));
      }
    }
    return out;
  }

  const except = [];
  for (let i = 0; i < total; i += 1) {
    except.push(`${i}`);
  }

  const toProcessDefaults = joinObjectsWithOptions({ except }, {}, toProcess);
  let labels = [];
  if (
    toProcessDefaults.label != null
    && toProcessDefaults.label.text != null
    && Array.isArray(toProcessDefaults.label.text)
  ) {
    labels = toProcessDefaults.label.text;
  }

  if (toProcessDefaults.label === null) {
    toProcessDefaults.label = { text: null };
  }
  // console.log(toProcessDefaults, labels)

  let show;
  if (toProcessDefaults.show != null) {
    ({ show } = toProcessDefaults);
  } else {
    show = range(0, total - 1, 1);
  }
  if (toProcessDefaults.hide != null) {
    toProcessDefaults.hide.forEach((index) => {
      const i = show.indexOf(index);
      if (i !== -1) {
        show.splice(i, 1);
      }
    });
  }
  const out = [];
  for (let i = 0; i < total; i += 1) {
    if (show.indexOf(i) === -1) {
      out.push(null);
    } else {
      const showIndex = show.indexOf(i);
      const index = show[showIndex];
      let indexOptions = {};
      if (toProcess[`${index}`] != null) {
        indexOptions = toProcess[`${index}`];
      }
      let labelDefaults = {};
      if (labels.length > 0) {
        const text = labels[showIndex % labels.length];
        labelDefaults = { label: { text } };
      }
      // console.log(labelDefaults)
      const o = joinObjects({}, defaultOptions, toProcessDefaults, labelDefaults, indexOptions);
      if (o.label != null) {
        out.push(joinObjects({}, { label: defaultLabelOptions }, o));
      } else {
        out.push(o);
      }
    }
  }
  return out;
}

/**
 * `'updatePoints'` subscription published whenever the Collections Polyline
 * points are updated. No payload is passed to subscriber.
 *
 * @typedef SUB_PolylineUpdatePoints
 */
export type SUB_PolylineUpdatePoints = [];

/*
..........########...#######..##.......##....##.##.......####.##....##.########
..........##.....##.##.....##.##........##..##..##........##..###...##.##......
..........##.....##.##.....##.##.........####...##........##..####..##.##......
..........########..##.....##.##..........##....##........##..##.##.##.######..
..........##........##.....##.##..........##....##........##..##..####.##......
..........##........##.....##.##..........##....##........##..##...###.##......
..........##.........#######..########....##....########.####.##....##.########
*/

/* eslint-disable max-len */
/**
 * {@link FigureElementCollection} representing a polyline.
 *
 * ![](./assets1/advpolyline_examples.png)
 *
 * <p class="inline_gif"><img src="./assets1/advpolyline_movepolyline.gif" class="inline_gif_image"></p>
 *
 * <p class="inline_gif"><img src="./assets1/advpolyline_movetri.gif" class="inline_gif_image"></p>
 *
 * This object defines a convient and powerful polyline
 * {@link FigureElementCollection} that includes a solid or dashed,
 * open or closed polyline, arrows, angle annotations for polyline corners,
 * side annotations for straight lines between points and move pads at polyline
 * points to dynamically adjust the polyline.
 *
 * See {@link COL_Polyline} for the options that can be used when creating the
 * line.
 *
 * Available subscriptions:
 *   - `'updatePoints'`: {@link SUB_PolylineUpdatePoints}
 *
 * @see
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 *
 * @example
 * // Polyline with angle annotations
 * figure.addElement({
 *   name: 'p',
 *   method: 'collections.polyline',
 *   options: {
 *     points: [[1, 0], [0, 0], [0.5, 1], [1.5, 1]],
 *     arrow: 'triangle',
 *     angle: {
 *       label: null,
 *       curve: {
 *         radius: 0.3,
 *       },
 *     },
 *   }
 * });
 *
 * @example
 * // Triangle with unknown angle
 * figure.addElement({
 *   name: 'p',
 *   method: 'collections.polyline',
 *   options: {
 *     points: [[1, 1], [1, 0], [0, 0]],
 *     close: true,
 *     side: {
 *       label: null,
 *     },
 *     angle: {
 *       label: {
 *         text: '?',
 *         offset: 0.05,
 *       },
 *       curve: {
 *         radius: 0.4,
 *       },
 *       show: [1],
 *     },
 *   }
 * });
 *
 * @example
 * // Dimensioned square
 * figure.addElement({
 *   name: 'p',
 *   method: 'collections.polyline',
 *   options: {
 *     points: [[0, 1], [1, 1], [1, 0], [0, 0]],
 *     close: true,
 *     side: {
 *       showLine: true,
 *       offset: 0.2,
 *       color: [0, 0, 1, 1],
 *       arrow: 'barb',
 *       width: 0.01,
 *       label: null,
 *       dash: [0.05, 0.02],
 *       0: { label: { text: 'a' } },    // Customize side 0
 *     },
 *     angle: {
 *       curve: {
 *         autoRightAngle: true,
 *         radius: 0.3,
 *       },
 *     },
 *   }
 * });
 *
 * @example
 * // User adjustable polyline
 * figure.addElement({
 *   name: 'p',
 *   method: 'collections.polyline',
 *   options: {
 *     points: [[-0.5, 1], [1, 1], [0, 0], [1, -0.5]],
 *     dash: [0.05, 0.02],
 *     pad: {
 *       radius: 0.2,
 *       color: [1, 0, 0, 0.5],    // make alpha 0 to hide pad
 *       isMovable: true,
 *     },
 *   },
 * });
 *
 * @example
 * // Annotations that automatically updates as user changes triangle
 * figure.addElement({
 *   name: 'p',
 *   method: 'collections.polyline',
 *   options: {
 *     points: [[-1, 1], [1, 1], [0, 0]],
 *     close: true,
 *     makeValid: {
 *       shape: 'triangle',
 *       hide: {
 *         minAngle: Math.PI / 8,
 *       },
 *     },
 *     side: {
 *       showLine: true,
 *       offset: 0.2,
 *       color: [0.3, 0.6, 1, 1],
 *       arrow: 'barb',
 *       width: 0.01,
 *       label: {
 *         text: null,
 *       },
 *     },
 *     angle: {
 *       label: null,
 *       curve: { radius: 0.25 },
 *     },
 *     pad: {
 *       radius: 0.4,
 *       color: [1, 0, 0, 0.005],
 *       isMovable: true,
 *     },
 *   },
 * });
 */
/* eslint-enable max-len */
export default class CollectionsPolyline extends FigureElementCollection {
  shapes: FigurePrimitives;
  equation: FigureEquation;
  collections: FigureObjects;
  animateNextFrame: void => void;
  isTouchDevice: boolean;
  largerTouchBorder: boolean;
  position: Point;
  points: Array<Point>;
  close: boolean;
  _line: ?FigureElementPrimitive;
  options: COL_Polyline;
  updatePointsCallback: ?(string | (() => void));
  reverse: boolean;
  makeValid: ?{
    shape: 'triangle';
    hide: {
      minAngle: ?number,
      maxAngle: ?number,
      minSide: ?number,
    }
  };

  /**
   * @hideconstructor
   */
  constructor(
    shapes: FigurePrimitives,
    equation: FigureEquation,
    objects: FigureObjects,
    isTouchDevice: boolean,
    animateNextFrame: void => void,
    options: COL_Polyline = {},
  ) {
    const defaultOptions: COL_Polyline = {
      position: null,
      color: shapes.defaultColor, // $FlowFixMe
      points: [new Point(1, 0), new Point(0, 0), new Point(0, 1)],
      close: false,
      showLine: true,
      width: shapes.defaultLineWidth,
      reverse: false,
      transform: new Transform('PolyLine').scale(1, 1).rotate(0).translate(0, 0),
      makeValid: null,
      limits: shapes.limits,
    };
    if (options.makeValid != null && options.makeValid.shape != null && options.makeValid.shape === 'triangle') {
      defaultOptions.makeValid = {
        shape: 'triangle',
        hide: {
          minAngle: null,
          maxAngle: null,
          minSide: null,
        },
      };
    }

    const optionsToUse = joinObjects({}, defaultOptions, options);
    super(optionsToUse);
    this.setColor(optionsToUse.color);

    this.shapes = shapes;
    this.equation = equation;
    this.collections = objects;
    this.largerTouchBorder = optionsToUse.largerTouchBorder;
    this.isTouchDevice = isTouchDevice;
    this.animateNextFrame = animateNextFrame;
    this.updatePointsCallback = null;

    this.position = this.getPosition();
    this.close = optionsToUse.close;
    this.options = optionsToUse;
    this.reverse = optionsToUse.reverse;
    this.makeValid = optionsToUse.makeValid;

    this.points = optionsToUse.points.map(p => getPoint(p));

    // Add Pads first as they should be on the bottom of the drawing
    if (optionsToUse.pad) {
      this.addPads(optionsToUse.pad);
    }

    // Add Angles
    if (optionsToUse.angle) {
      this.addAngles(optionsToUse.angle, optionsToUse.close);
    }

    // Add Line
    if (optionsToUse.showLine) {
      const line = this.shapes.polyline({
        points: this.points,
        width: options.width,
        close: options.close,
        widthIs: options.widthIs,
        cornerStyle: options.cornerStyle,
        cornerSize: options.cornerSize,
        cornerSides: options.cornerSides,
        minAutoCornerAngle: options.minAutoCornerAngle,
        dash: options.dash,
        color: options.color,
        pulse: options.pulse,
        arrow: options.arrow,
        touchBorder: options.touchBorder,
      });
      this.add('line', line);
    }

    if (optionsToUse.side) {
      this.addSides(optionsToUse.side, optionsToUse.close);
    }
  }

  addPads(pad: Object) {
    const defaultPadOptions = {
      sides: 20,
      radius: 0.1,
      color: this.color,
      isMovable: false,
      boundary: 'figure',
    };
    // const { pad } = optionsToUse;
    const pCount = this.points.length;
    // const padArray = makeArray(pad, pCount);
    const padArray = processArray(pad, defaultPadOptions, {}, pCount);
    for (let i = 0; i < pCount; i += 1) {
      if (padArray[i] != null) {
        const name = `pad${i}`;
        const padOptions = joinObjects({}, {
          transform: new Transform().translate(this.points[i]),
        }, padArray[i]);
        const padShape = this.shapes.polygon(padOptions);
        // $FlowFixMe
        const { isMovable, boundary } = padArray[i];
        if (isMovable) {
          padShape.onAdd = () => {
            padShape.setMovable();
          };
          if (boundary != null) {
            padShape.move.sizeInBounds = true;
            padShape.setMoveBounds(boundary);
          }
          const fnName = `_polyline_pad${i}`;
          padShape.fnMap.add(
            fnName,
            (transform) => {
              const index = parseInt(padShape.name.slice(3), 10);
              const translation = transform.t();
              if (translation != null) {
                this.points[index] = translation._dup();
                this.updatePoints(this.points);
              }
            },
          );
          padShape.setTransformCallback = fnName;
        }
        this.add(name, padShape);
      }
    }
  }

  addAngles(angle: Object, close: boolean) {
    const defaultAngleOptions = {
      color: this.color,
      curve: {},
      autoRightAngle: true,
    };
    const defaultAngleLabelOptions = {
      text: null,
      offset: 0.05,
    };
    let pCount = this.points.length;
    if (close === false) {
      pCount -= 2;
    }
    const angleArray = processArray(angle, defaultAngleOptions, defaultAngleLabelOptions, pCount);
    for (let i = 0; i < pCount; i += 1) {
      let p1 = i;
      let p2 = i + 1;
      let p3 = i + 2;
      if (i === pCount - 2 && close) {
        p3 = 0;
      }
      if (i === pCount - 1 && close) {
        p2 = 0;
        p3 = 1;
      }
      if (angleArray[i] != null) {
        const name = `angle${i}`;
        if (this.reverse) {
          const newP1 = p3;
          p3 = p1;
          p1 = newP1;
        }
        const angleOptions = joinObjects({}, {
          p1: this.points[p1],
          p2: this.points[p2],
          p3: this.points[p3],
        }, angleArray[i]);
        const angleAnnotation = this.collections.angle(angleOptions);
        this.add(name, angleAnnotation);
      }
    }
  }


  addSides(side: Object, close: boolean) {
    const defaultSideOptions = {
      showLine: false,
      offset: 0,
      width: 0,
      color: this.color,
    };
    const defaultSideLabelOptions = {
      offset: 0.1,
      text: null,
      location: 'outside',
      subLocation: 'top',
      orientation: 'horizontal',
      linePosition: 0.5,
      scale: 0.7,
    };
    let pCount = this.points.length - 1;
    if (close) {
      pCount += 1;
    }
    const sideArray = processArray(side, defaultSideOptions, defaultSideLabelOptions, pCount);
    for (let i = 0; i < pCount; i += 1) {
      let j = i + 1;
      if (i === pCount - 1 && close) {
        j = 0;
      }
      if (sideArray[i] != null) {
        const name = `side${i}${j}`;
        let sideOptions = joinObjects({}, {
          p1: this.points[i],
          p2: this.points[j],
        }, sideArray[i]);
        if (this.reverse) {
          sideOptions = joinObjects({}, {
            p1: this.points[j],
            p2: this.points[i],
          }, sideArray[i]);
        }
        const sideLine = this.collections.line(sideOptions);
        sideLine.custom.offset = sideOptions.offset;
        this.add(name, sideLine);
      }
    }
  }

  _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'points',
    ];
  }

  _fromState(state: Object) {
    joinObjects(this, state);
    this.updatePoints(this.points);
    return this;
  }

  updateSideLabels(rotationOffset: number = 0) {
    if (this.options.side != null) {
      let pCount = this.points.length - 1;
      if (this.close) {
        pCount += 1;
      }
      for (let i = 0; i < pCount; i += 1) {
        let j = i + 1;
        if (i === pCount - 1 && this.close) {
          j = 0;
        }
        const name = `side${i}${j}`;
        if (this.elements[name] != null) {
          const wasHidden = !this.elements[name].isShown;
          this.elements[name].updateLabel(rotationOffset);
          if (wasHidden) {
            this.elements[name].hide();
          }
        }
      }
    }
  }

  updateAngleLabels(rotationOffset: number = 0) {
    if (this.options.angle != null) {
      let pCount = this.points.length;
      if (this.close === false) {
        pCount -= 2;
      }
      let firstIndex = 0;
      if (this.close === false) {
        firstIndex = 1;
      }
      for (let i = firstIndex; i < pCount + firstIndex; i += 1) {
        const name = `angle${i}`;
        if (this.elements[name] != null) {
          const wasHidden = !this.elements[name].isShown;
          this.elements[name].updateLabel(rotationOffset);
          if (wasHidden) {
            this.elements[name].hide();
          }
        }
      }
    }
  }

  /**
   * Update the polyline with new point locations.
   *
   * Will publish {@link SUB_PolylineUpdatePoints} unless
   * `doNotPublishUpdatePoints` is `true`.
   */
  updatePoints(newPointsIn: Array<Point>, doNotPublishUpdatePoints: boolean = false) {
    const newPoints = newPointsIn.map(p => getPoint(p));
    if (this._line != null) {
      this._line.custom.updatePoints({ points: newPoints });
    }

    // Add Pads
    let pCount = this.points.length;
    if (this.options.pad) {
      for (let i = 0; i < pCount; i += 1) {
        const name = `pad${i}`;
        if (this.elements[name]) {
          // if (this.elements[name].isMovable === false) {
          this.elements[name].transform.updateTranslation(newPoints[i]);
          // }
        }
      }
    }
    if (this.options.side != null) {
      pCount = this.points.length - 1;
      if (this.close) {
        pCount += 1;
      }
      for (let i = 0; i < pCount; i += 1) {
        let j = i + 1;
        if (i === pCount - 1 && this.close) {
          j = 0;
        }
        const name = `side${i}${j}`;
        if (this.elements[name] != null) {
          const wasHidden = !this.elements[name].isShown;
          if (this.reverse) {
            this.elements[name].setEndPoints(
              newPoints[j], newPoints[i], this.elements[name].custom.offset,
            );
          } else {
            this.elements[name].setEndPoints(
              newPoints[i], newPoints[j], this.elements[name].custom.offset,
            );
          }
          if (wasHidden) {
            this.elements[name].hide();
          }
        }
      }
    }

    this.points = newPoints;
    this.updateAngles();
    if (this.makeValid != null && this.makeValid.shape === 'triangle' && !doNotPublishUpdatePoints) {
      this.makeValidTriangle();
    }
    if (this.updatePointsCallback != null && !doNotPublishUpdatePoints) {
      this.fnMap.exec(this.updatePointsCallback);
      this.subscriptions.publish('updatePoints');
    }
  }

  updateAngles() {
    if (this.options.angle == null) {
      return;
    }
    let pCount = this.points.length;
    if (this.close === false) {
      pCount -= 2;
    }
    for (let i = 0; i < pCount; i += 1) {
      let p1 = i;
      let p2 = i + 1;
      let p3 = i + 2;
      if (i === pCount - 2 && this.close) {
        p3 = 0;
      }
      // let j = i + 1;
      // let k = i - 1;
      if (i === pCount - 1 && this.close) {
        p2 = 0;
        p3 = 1;
      }
      // if (i === 0 && this.close) {
      //   k = pCount - 1;
      // }
      const name = `angle${i}`;
      if (this.elements[name] != null) {
        const wasHidden = !this.elements[name].isShown;
        if (this.reverse) {
          const newP1 = p3;
          p3 = p1;
          p1 = newP1;
        }
        this.elements[name].setAngle({
          p1: this.points[p1],
          p2: this.points[p2],
          p3: this.points[p3],
        });
        if (wasHidden) {
          this.elements[name].hide();
        }
      }
    }
  }


  updateRotation(rotationOffset: number = 0) {
    let i = 0;      // $FlowFixMe
    let angle = this[`_angle${i}`];
    while (angle != null) {
      angle.update(this.getRotation() + rotationOffset);
      i += 1;       // $FlowFixMe
      angle = this[`_angle${i}`];
    }

    i = 0;          // $FlowFixMe
    let side = this[`_side${i}${i + 1}`];
    while (side != null) {
      side.updateLabel(this.getRotation() + rotationOffset);
      i += 1;       // $FlowFixMe
      side = this[`_side${i}${i + 1}`];
    }               // $FlowFixMe
    side = this[`_side${i}${0}`];
    if (side != null) {
      side.updateLabel(this.getRotation() + rotationOffset);
    }
  }

  /**
   * Reverse points in the polyline.
   *
   * Will publish {@link SUBSCRIPTION_PolylineUpdatePoints} unless
   * `doNotPublishUpdatePoints` is `true`.
   *
   * @param {boolean} doNotPublishUpdatePoints if `true` the `updatePoints`
   * subscription will not be published.
   */
  reversePoints(doNotPublishUpdatePoints: boolean = true) {
    const newPoints = [];
    for (let i = 0; i < this.points.length; i += 1) {
      newPoints.push(this.points[this.points.length - 1 - i]);
    }
    this.updatePoints(newPoints, doNotPublishUpdatePoints);
  }

  /**
   * The Collections Polyline is a {@link FigureElementCollection}, with a
   * transform that includes a translation, or position, transform element.
   *
   * Changing the position element of the transform would normally move
   * everything in the collection. This method instead changes the position
   * without moving everything by updating the polyline points with an
   * offset that is the opposite new position.
   */
  setPositionWithoutMoving(
    newPositionPointOrX: Point | number,
    newPositionY: number = 0,
  ) {
    let newPosition = new Point(0, 0);
    if (typeof newPositionPointOrX === 'number') {
      newPosition.x = newPositionPointOrX;
      newPosition.y = newPositionY;
    } else {
      newPosition = newPositionPointOrX;
    }
    const currentPosition = this.getPosition();
    const delta = currentPosition.sub(newPosition);
    this.setPosition(newPosition);
    const newPoints = this.points.map(p => p.add(delta));
    this.updatePoints(newPoints);
  }

  /**
   * The Collections Polyline is a {@link FigureElementCollection}, with a
   * transform that includes a rotation transform element.
   *
   * Changing the rotation element of the transform would normally rotate
   * everything in the collection. This method instead changes the rotation
   * without rotating everything by updating the polyline points with a
   * rotation that is the negative of the `newRotation`.
   */
  setRotationWithoutMoving(newRotation: number) {
    const currentRotation = this.getRotation();
    const delta = currentRotation - newRotation;
    const deltaMatrix = new Transform().rotate(delta).m();
    this.setRotation(newRotation);
    const newPoints = this.points.map(p => p.transformBy(deltaMatrix));
    this.updatePoints(newPoints);
  }

  /**
   * The Collections Polyline is a {@link FigureElementCollection}, with a
   * transform that includes a scale transform element.
   *
   * Changing the scale element of the transform would normally scale
   * everything in the collection. This method instead changes the scale
   * without scaling everything by updating the polyline points with a
   * scale that is the inverse of the new scale.
   */
  setScaleWithoutMoving(
    newScalePointOrX: Point | number,
    newScaleY: number = 0,
  ) {
    let newScale = new Point(0, 0);
    if (typeof newScalePointOrX === 'number') {
      newScale.x = newScalePointOrX;
      newScale.y = newScaleY;
    } else {
      newScale = newScalePointOrX;
    }
    const currentScale = this.getScale();
    const delta = new Point(
      currentScale.x / newScale.x,
      currentScale.y / newScale.y,
    );
    const deltaMatrix = new Transform().scale(delta).m();
    this.setScale(newScale);
    const newPoints = this.points.map(p => p.transformBy(deltaMatrix));
    this.updatePoints(newPoints);
  }

  setShow(name: string, show: boolean) {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.name.startsWith(name)) {
        if (show) {
          element.showAll();
        } else {
          element.hide();
        }
      }
    }
  }

  /**
   * Hide all angle annotations.
   */
  hideAngles() {
    this.setShow('angle', false);
  }

  /**
   * Hide all side annotations.
   */
  hideSides() {
    this.setShow('side', false);
  }

  /**
   * Show all angle annotations.
   */
  showAngles() {
    this.setShow('angle', true);
  }

  /**
   * Hide all side annotations.
   */
  showSides() {
    this.setShow('side', true);
  }

  updateLabels(rotationOffset: number = this.getRotation()) {
    this.updateAngleLabels(rotationOffset);
    this.updateSideLabels(rotationOffset);
  }

  makeValidTriangle() {
    // $FlowFixMe
    const angle0 = this._angle0;  // $FlowFixMe
    const angle1 = this._angle1;  // $FlowFixMe
    const angle2 = this._angle2;  // $FlowFixMe
    const side01 = this._side01;  // $FlowFixMe
    const side12 = this._side12;  // $FlowFixMe
    const side20 = this._side20;
    const anglePrecision = angle0.label.precision;
    const sidePrecision = side01.label.precision;

    // $FlowFixMe
    const clipAngle0 = clipAngle(angle0.getAngle(), '0to360') * 180 / Math.PI;
    const clipAngle1 = clipAngle(angle1.getAngle(), '0to360') * 180 / Math.PI;
    const clipAngle2 = clipAngle(angle2.getAngle(), '0to360') * 180 / Math.PI;
    let a0 = round(clipAngle0, anglePrecision);
    let a1 = round(clipAngle1, anglePrecision);
    let a2 = round(clipAngle2, anglePrecision);
    let s01 = round(side01.getLength(), sidePrecision);
    let s12 = round(side12.getLength(), sidePrecision);
    let s20 = round(side20.getLength(), sidePrecision);

    // Reverse the points if the angles are on the outside
    if (a0 > 90 && a1 > 90 && a2 > 90) {
      this.reverse = !this.reverse;
      this.updatePoints(this.points, false);
      a0 = round(clipAngle(angle0.getAngle(), '0to360') * 180 / Math.PI, anglePrecision);
      a1 = round(clipAngle(angle1.getAngle(), '0to360') * 180 / Math.PI, anglePrecision);
      a2 = round(clipAngle(angle2.getAngle(), '0to360') * 180 / Math.PI, anglePrecision);
    }
    // else {
    // This is a weird case at the 0/360 transition
    if (a0 > 180) {
      a0 = 360 - angle0;
    }
    if (a1 > 180) {
      a1 = 360 - angle1;
    }
    if (a2 > 180) {
      a2 = 360 - angle2;
    }

    // Hide the angles if the triangle is thin or small enough
    // if (
    //   (angle0.label.autoHide > -1 && a0 > angle0.label.autoHide)
    //   || (angle0.label.autoHideMax != null && angle0.label.autoHideMax < a0)
    //   || (angle1.label.autoHide > -1 && a1 > angle1.label.autoHide)
    //   || (angle1.label.autoHideMax != null && angle1.label.autoHideMax < a1)
    //   || (angle2.label.autoHide > -1 && a2 > angle2.label.autoHide)
    //   || (angle2.label.autoHideMax != null && angle2.label.autoHideMax < a2)
    //   || s01 < 0.6 || s12 < 0.6 || s20 < 0.6
    // ) {
    // if (angle0.isShown) {
    // Make angles consistent with 180º
    const tot = a0 + a1 + a2;
    const diff = tot - 180;
    // If the angles are > 180, then find the closet angle
    // to rounding down and reduce it by diff
    // If the angles are < 180 then find the closes angle
    // to round down and round it down
    const remainders = [
      round(clipAngle0, anglePrecision + 1),
      round(clipAngle1, anglePrecision + 1),
      round(clipAngle2, anglePrecision + 1),
    ].map(a => a - Math.floor(a * (10 ** anglePrecision)) / (10 ** anglePrecision));
    const angles = [a0, a1, a2];
    let indexToChange = 0;
    if (tot > 180) {
      indexToChange =
        remainders.reduce((iMax, x, i, arr) => (x > arr[iMax] ? i : iMax), 0);
    } else if (tot < 180) {
      indexToChange =
        remainders.reduce((iMin, x, i, arr) => (x < arr[iMin] ? i : iMin), 1);
    }
    angles[indexToChange] -= diff;
    [a0, a1, a2] = angles;
    angle0.setLabel(`${a0.toFixed(anglePrecision)}º`);
    angle1.setLabel(`${a1.toFixed(anglePrecision)}º`);
    angle2.setLabel(`${a2.toFixed(anglePrecision)}º`);
    angle0.checkLabelForRightAngle();
    angle1.checkLabelForRightAngle();
    angle2.checkLabelForRightAngle();

    if (this.makeValid != null) {
      const { minSide } = this.makeValid.hide;
      let { minAngle, maxAngle } = this.makeValid.hide;
      let hideAngles = false;
      if (minAngle != null) {
        minAngle *= 180 / Math.PI;
        if (a0 < minAngle || a1 < minAngle || a2 < minAngle) {
          hideAngles = true;
        }
      }
      if (maxAngle != null) {
        maxAngle *= 180 / Math.PI;
        if (a0 > maxAngle || a1 > maxAngle || a2 > maxAngle) {
          hideAngles = true;
        }
      }
      if (
        minSide != null && (s01 < minSide || s12 < minSide || s20 < minSide)
      ) {
        hideAngles = true;
      }
      if (hideAngles) {
        this.hideAngles();
      }
    }

    // Make sides consistent with equilateral or isosceles
    if (
      (side01.isShown || side12.isShown || side20.isShown)
      && a0 > 0 && a0 < 180
      && a1 > 0 && a1 < 180
      && a2 > 0 && a2 < 180
    ) {
      // s12 = round(
      //   s01 / Math.sin(a2 * Math.PI / 180) * Math.sin(a0 * Math.PI / 180),
      //   sidePrecision,
      // );
      // s20 = round(
      //   s01 / Math.sin(a2 * Math.PI / 180) * Math.sin(a1 * Math.PI / 180),
      //   sidePrecision,
      // );
      const leastSigStep = 1 / (10 ** sidePrecision);
      // If Equilateral, make all sides equal
      if (a0 === 60 && a1 === 60 && a2 === 60) {
        s12 = s01;
        s20 = s01;
      // If Isosceles possibility 1:
      } else if (a0 === a1) {
        s20 = s12;
        if (s01 === s12) {
          const moreAccurate = round(side01.getLength(), sidePrecision + 1);
          if (moreAccurate < s01) {
            s01 -= leastSigStep;
          } else {
            s01 += leastSigStep;
          }
        }
      // If Isosceles possibility 2:
      } else if (a0 === a2) {
        s01 = s12;
        if (s20 === s12) {
          const moreAccurate = round(side20.getLength(), sidePrecision + 1);
          if (moreAccurate < s20) {
            s20 -= leastSigStep;
          } else {
            s20 += leastSigStep;
          }
        }
      // If Isosceles possibility 3:
      } else if (a1 === a2) {
        s20 = s01;
        if (s12 === s01) {
          const moreAccurate = round(side12.getLength(), sidePrecision + 1);
          if (moreAccurate < s12) {
            s12 -= leastSigStep;
          } else {
            s12 += leastSigStep;
          }
        }
      // If these are not equilateral, or isosceles, then all sides must be different length
      }
    }

    // if (s01 === Infinity) {
    //   s01 = round(side01.getLength(), sidePrecision);
    // }
    // if (s12 === Infinity) {
    //   s12 = round(side12.getLength(), sidePrecision);
    // }
    // if (s20 === Infinity) {
    //   s20 = round(side20.getLength(), sidePrecision);
    // }
    side01.setLabel(`${s01.toFixed(sidePrecision)}`);
    side12.setLabel(`${s12.toFixed(sidePrecision)}`);
    side20.setLabel(`${s20.toFixed(sidePrecision)}`);
    // }
  }

  _dup(exceptions: Array<string> = []) {
    return super._dup([...exceptions, ...['shapes', 'objects', 'equation']]);
  }
}
