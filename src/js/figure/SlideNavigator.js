// @flow
import { joinObjects, SubscriptionManager, joinObjectsWithOptions } from '../tools/tools';
import { FigureElementCollection } from './Element';
import type { FigureElement, TypeElementPath } from './Element';
import type {
  OBJ_Collection, OBJ_TextModifiersDefinition, OBJ_TextLines,
} from './FigurePrimitives/FigurePrimitives';
import type Figure from './Figure';
import { Equation } from './Equation/Equation';
import type AnimationStep from './Animation/AnimationStep';
// enterStateCommon
// enterState
// showCommon
// show
// transition
// showForm
// steadyStateCommon
// steadyState
// leaveStateCommon
// leaveState

/**
 * Last slide shown
 *
 * `'next'` | `'prev'` | number
 */
export type TypeSlideFrom = 'next' | 'prev' | number;

/**
 * `(currentIndex: number, nextIndex: number) => void`
 *
 * When using {@link Recorder}, a string from a {@link FunctionMap} can be
 * used, as long as the function the string maps to allows for the same
 * parameters as above.
 */
export type TypeSlideLeaveStateCallback = string | ((number, number) => void);

/**
 * `(currentIndex: number, from: `{@link TypeSlideFrom}`) => void`
 *
 * When using {@link Recorder}, a string from a {@link FunctionMap} can be
 * used, as long as the function the string maps to allows for the same
 * parameters as above.
 */
export type TypeSlideStateCallback = string | ((TypeSlideFrom, number) => void);

/**
 * Callback definition for slide transition.
 *
 * `(done: () => void, currentIndex: number, from: `{@link TypeSlideFrom}`) => void`
 *
 * When using {@link Recorder}, a string from a {@link FunctionMap} can be
 * used, as long as the function the string maps to allows for the same
 * parameters as above.
 *
 * Important note: the `done` parameter MUST be called at the end of the
 * transition to allow the slide to progress to steady state.
 */
export type TypeSlideTransitionCallback = string | ((() => void, number, TypeSlideFrom) => void);

/**
 * An animation definition object defines an animation in a json like
 * object.
 *
 * One key of the object defines the animation to use, while the remaining
 * keys are the properties of the animation.
 *
 * The value of the key (with the exception of the `delay` key) that defines
 * the animation is a {@link TypeElementPath} defining which elements to apply
 * the animation to. When using `delay`, the value will be a number in seconds.
 *
 * The remaining keys in the object then come from the definition objects of
 * the associated animation.
 *
 * The possible key names that define animations are:
 *
 * - `delay`: delay where value is `number` in seconds
 * - `in`: dissolve in with {@link OBJ_ElementAnimationStep} options where
 *   duration is dissolve in time
 * - `out`: dissolve out with {@link OBJ_ElementAnimationStep} options where
 *   duration is dissolve out time
 * - `rotation`: {@link OBJ_RotationAnimationStep}
 * - `position`: {@link OBJ_PositionAnimationStep}
 * - `scale`: {@link OBJ_ScaleAnimationStep}
 * - `scenario`: {@link OBJ_ScenarioAnimationStep}
 * - `scenarios`: {@link OBJ_ScenariosAnimationStep}
 * - `pulseWidth`: {@link OBJ_PulseWidthAnimationStep}
 * - `length`: {@link OBJ_LengthAnimationStep}
 * - `pulseAngle`: {@link OBJ_PulseAngleAnimationStep}
 * - `pulse`: {@link OBJ_PulseAnimationStep}
 * - `dim`: dim animation step with {@link OBJ_ElementAnimationStep} options
 *   where
 *   duration is dim duration
 * - `undim`: dim animation step with {@link OBJ_ElementAnimationStep} options
 *   where duration is undim duration
 * - `trigger`: {@link OBJ_TriggerAnimationStep}
 * - `goToForm`: {@link OBJ_TriggerAnimationStep}
 *
 */
export type OBJ_AnimationDefinition = Object;

/* eslint-disable max-len */
/**
 * Transition Definition
 *
 * {@link TypeSlideTransitionCallback} | {@link OBJ_AnimationDefinition} | Array<{@link OBJ_AnimationDefinition} | Array<{@link OBJ_AnimationDefinition}>>
 *
 * For complete control in creating a transition animation, and/or setting
 * necessary transition state within an application, use a function definition
 * {@link TypeSlideTransitionCallback}.
 *
 * Many transitions will be simple animations, dissolving in elements,
 * dissolving out elements, or animating between positions. For these, a short
 * hand way of defining animations can be used.
 *
 * {@link OBJ_AnimationDefinition} is a json like object that defines the
 * animation. When used in an array, multiple animations will be executed in
 * series.
 *
 * If an array of {@link OBJ_AnimationDefinition} objects has an element that
 * itself is an array of {@link OBJ_AnimationDefinition} objects, then the
 * the animations within the nested array will be executed in parallel.
 *
 * <p class="inline_gif"><img src="./apiassets/slidetransition.gif" class="inline_gif_image"></p>
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Figure has two rectangles and a slide navigator. Slides will dissolve in,
 * // dissolve out, move and rotate rectangles
 * figure.add([
 *   {
 *     name: 'rect1',
 *     method: 'primitives.rectangle',
 *     options: {
 *       width: 0.4, height: 0.4, position: [-0.5, 0.5],
 *     },
 *   },
 *   {
 *     name: 'rect2',
 *     method: 'primitives.rectangle',
 *     options: {
 *       width: 0.4, height: 0.4, position: [0.5, 0.5],
 *     },
 *   },
 *   {
 *     name: 'nav',
 *     method: 'collections.slideNavigator',
 *   },
 * ]);
 *
 * const rect2 = figure.getElement('rect2');
 *
 * // Add slides to the navigator
 * figure.getElement('nav').loadSlides([
 *   // Slide 1
 *   { showCommon: 'rect1' },
 *
 *   // Slide 2
 *   {
 *     transition: (done) => {
 *       rect2.animations.new()
 *         .dissolveIn({ duration: 1 })
 *         .whenFinished(done)  // Make sure to process done when finished
 *         .start();
 *     },
 *     // When using a transition function, any changes during the transition
 *     // need to be explicitly set at steady state
 *     steadyState: () => {
 *       rect2.show();
 *     },
 *   },
 *
 *   // Slide 3
 *   // When using animation objects, the targets of animations will be
 *   // automatically set at steady state, so user does not need to set them
 *   {
 *     showCommon: ['rect1', 'rect2'],
 *     transition: { position: 'rect2', target: [0.3, 0.5], duration: 1 },
 *   },
 *
 *   // Slide 4
 *   // Use an array of animation object definitions to create a sequence of steps
 *   {
 *     transition: [
 *       { position: 'rect1', target: [-0.3, 0.5], duration: 1 },
 *       { rotation: 'rect1', target: Math.PI / 4, duration: 1 },
 *       { rotation: 'rect2', target: Math.PI / 4, duration: 1 },
 *     ],
 *   },
 *
 *   // Slide 5
 *   // Use an array within an array to create parallel steps
 *   {
 *     transition: [
 *       [
 *         { rotation: 'rect1', target: 0, duration: 1 },
 *         { rotation: 'rect2', target: 0, duration: 1 },
 *       ],
 *       [
 *         { position: 'rect1', target: [-0.5, 0.5], duration: 1 },
 *         { position: 'rect2', target: [0.5, 0.5], duration: 1 },
 *       ],
 *       { out: ['rect1', 'rect2'] },
 *     ],
 *   },
 * ]);
 */
export type TypeTransitionDefinition = TypeSlideTransitionCallback | OBJ_AnimationDefinition | Array<OBJ_AnimationDefinition | Array<OBJ_AnimationDefinition>>;
/* eslint-enable max-len */

// /**
//  * All element paths should be relative to the slide navigator reference
//  * collection {@link OBJ_SlideNavigator}`.collection`.
//  *
//  * @property {TypeElementPath} [in] elements to dissolve in
//  * @property {TypeElementPath} [out] elements to dissolve out
//  */
// export type OBJ_SlideNavigatorDissolve = {
//   in?: TypeElementPath,
//   out?: TypeElementPath,
// }


/**
 * Recorder time format.
 *
 * `number | string`
 *
 * Use `number` for number of seconds, or use string with format 'm:s.s' (for
 * example, '1:23.5' would define 1 minute, 23.5 seconds)
 */
export type TypeRecorderTime = string | number;

// /**
//  * Default equation animation properties for the {@link SlideNavigator}
//  * @property {number} [duration] default duration of equation animation
//  * @property {"move" | "dissolve" | "moveFrom" | "pulse" | "dissolveInThenMove"} [animate]
//    default style of equation animation
//  */


/**
 *
 *
 * Slide definition options object.
 *
 * This object defines the state the figure should be set to when this slide
 * is navigated to.
 *
 * A slide definition has several callback properties that can be used to set
 * figure state including:
 *  - enterState: set an initial state
 *  - transition: define an animation for when moving to this slide
 *  - steadyState: set steady state, then wait for next navigation event
 *  - leaveState: set leave state when moving to another another slide
 *
 * It is good practice to try and make each slide's state independant of other
 * slides. If a square is shown on slides 4 and 5, then it should be explicitly
 * shown on both slides. If it is only shown on slide 4, then it will be fine
 * when the user navigates from slide 4 to 5, but will not be shown if the user
 * is navigating from slide 6 to 5. Allowing users to go to specific slides out
 * of order makes slide dependencies even more difficult.
 *
 * Therefore, the enter, steady and leave states above should be used to fully
 * define the figure's state on each slide.
 *
 * However, while this approach will yield a good user experience, developing
 * many slides, complex figures or numerous equation forms can make slide
 * definition verbose. Even though each slide is different, many slides may
 * share largely the same state, all of which needs to be explicitly defined
 * for each slide.
 *
 * The SlideNavigator tries to manage this by providing the fundamental state
 * callbacks above, as well as properties that can be defined once, and shared
 * between slides. Slides with shared, or common properties make copies of all
 * the properties so each slide is independant, but require the developer to
 * define them just once. If a slide doesn't define a common property, then it
 * will use the definition in the last slide that defined it.
 *
 * For example, the `enterStateCommon` property is a common property. If it is
 * defined in slides 4 and 7, then slides 0-3 will not have the property, slides
 * 4-6 will use the slide 4 definition, and slides 7 and after will all use
 * slide 7's definition.
 *
 * Common state properties include:
 * - enterStateCommon
 * - steadyStateCommon
 * - leaveStateCommon
 *
 * The reason some states have both a common and slide specific property
 * (such as steadyState and steadyStateCommon) is so the common property can
 * be best leveraged. If all properties were common, then they would need to be
 * redefined every time a small change was made. Having both common and slide
 * specific properties allows a balance of defining some state for a group of
 * slides once, while allowing specific changes to that state where needed.
 *
 * In addition to the above state properties, there are a number of short-cut
 * properties, that make it easy to set state for common figure elements. When
 * a SlideNavigator is instantiated, a text figure element, a figure collection
 * and one or more equation elements can be associated with it.
 *
 * The `text`, `modifier` and `modifierCommon` properties can be used to set
 * the text of the text figure element associated with the SlideNavigator.
 * `text` and `modifierCommon` are common properties.
 *
 * The `form` property is also common and can be used to automatically set the
 * form of the associated equation elements. A SlideNavigator can be associated
 * with one or more equations. The `form` property defines the form each of the
 * equations should be set to on this slide. If there is just one equation, then
 * the form property can be a string that is the form name. For two or more
 * equations, the form property should be an array of strings where each element
 * is the form name for the corresponding equation. The order of equations
 * passed into the SlideNavigator, needs to be the same as the order of strings
 * in the `form` array. To hide an equation, use a `null` instead of a string.
 * If the `form` property has less forms than equations, then all remaining
 * equations will be hidden.
 *
 * The `form` property is a short cut with several consequences:
 * - All equations with `null` forms will be hidden prior to `enterState`.
 * - If the slide doesn't have a `transition` defined, and if an equation form
 *   is changed, then a transition will be added that animates the equation form
 *   change. If `transition` is defined, and equation animation is required,
 *   then it needs to be defined in the `transition` property explicity.
 * - Each equation with a defined form will have `showForm` called on that form
 *   prior to `steadyState`.
 *
 * The life cycle of a slide change is:
 * - `leaveStateCommon` (for current slide)
 * - `leaveState` (for current slide)
 * - stop all animations
 * - Update associated text element with `text` property
 * - Hide all figure elements in associated collection
 * - `showCommon`
 * - `show`
 * - `hideCommon`
 * - `hide`
 * - `scenarioCommon`
 * - `scenario`
 * - Show navigator buttons, text element and equations with defined forms
 * - `enterStateCommon` (for new slide)
 * - `enterState`
 * - show `fromForm`
 * - `transition`, `dissolve` or '`fromForm` to `form` animations
 * - show `form`
 * - `steadyStateCommon`
 * - `steadyState`
 * - Wait for next navigation event
 *
 * @property {OBJ_TextLines} [text] common property - With `modifiersCommon` and
 * `modifiers` define the text for the text element associated with the
 * SlideNavigator
 * @property {OBJ_TextModifiersDefinition} [modifiersCommon] common property
 * @property {OBJ_TextModifiersDefinition} [modifiers] common property - will
 * overwrite any keys from `modifiersCommon` with the same name
 * @property {TypeElementPath} [showCommon] common property
 * @property {TypeElementPath} [show]
 * @property {TypeElementPath} [hideCommon] common property
 * @property {TypeElementPath} [hide]
 * @property {TypeSlideStateCallback} [enterStateCommon] common property
 * @property {TypeSlideStateCallback} [enterState]
 * @property {TypeTransitionDefinition} [transition] transititions are
 * only called when moving between adjacent slides in the forward direction.
 * Progressing backwards, or skipping around with `goToSlide` will not call
 * `transition`. A transition is a callback where animations can be defined. A
 * `done` function is passed to the callback and must be called at the end of
 * the animation to allow slide steadyStates to be set.
 * @property {TypeSlideStateCallback} [steadyStateCommon] common property
 * @property {TypeSlideStateCallback} [steadyState]
 * @property {TypeSlideLeaveStateCallback} [leaveStateCommon] common property
 * @property {TypeSlideLeaveStateCallback} [leaveState]
 * @property {string | Array<string | null> | null | Object} [form] common property
 * @property {string | Array<string | null> | null | Object} [fromForm]
 * @property {string | Array<string>} [scenarioCommon] common property
 * @property {string | Array<string>} [scenario]
 * @property {boolean} [clear] `true` does not use any prior common properties (`false`)
 * @property {TypeRecorderTime} [time] recorder only - absolute time to
 * transition to slide.
 * @property {number} [delta] recorder only - time delta in seconds from last
 * slide transition to transition to this slide
 * @property {Array<[TypeRecorderTime, string]> | [TypeRecorderTime, string]} [exec]
 * recorder only - times to execute functions.
 * @property {Array<[number | string, string]> | [number | string, string]} [execDelta]
 * recorder only - time deltas to execute functions from the slide transition
 * start.
 * @property {boolean} addReference recorder only `true` will add a new
 * reference state based on the current state
 */
export type OBJ_SlideNavigatorSlide = {
  text?: OBJ_TextLines,
  modifiersCommon?: OBJ_TextModifiersDefinition;
  modifiers?: OBJ_TextModifiersDefinition;
  showCommon?: TypeElementPath;
  show?: TypeElementPath;
  hideCommon?: TypeElementPath;
  hide?: TypeElementPath;
  enterStateCommon?: TypeSlideStateCallback,
  enterState?: TypeSlideStateCallback,
  transition?: TypeTransitionDefinition;
  steadyStateCommon?: TypeSlideStateCallback;
  steadyState?: TypeSlideStateCallback;
  leaveStateCommon?: TypeSlideLeaveStateCallback;
  leaveState?: TypeSlideLeaveStateCallback;
  fromForm?: string | Array<string | null> | null;
  form?: string | Array<string | null> | null;
  scenarioCommon?: string | Array<string>;
  scenario?: string | Array<string>;
  clear?: boolean;
  time?: TypeRecorderTime;
  delta?: number,
  exec?: Array<[TypeRecorderTime, string]> | [TypeRecorderTime, string],
  execDelta?: Array<[number, string]> | [number, string],
  addReference?: boolean,
}


export type OBJ_EquationDefaults = {
  duration?: number,
  animate?: "move" | "dissolve" | "moveFrom" | "pulse" | "dissolveInThenMove",
};

/**
 * SlideNavigator options object
 *
 * The options here associate a number of {@link FigureElement}s with the
 * {@link SlideNavigator}, which will be ustilized by the slide definitions in
 * {@link OBJ_SlideNavigatorSlide}.
 *
 * The `collection` property associates a {@link FigureElementCollection}. If a
 * {@link Figure} is passed in, then the root level collection will be
 * used. All animations in slide `transitions` should be attached to
 * this collection or its children as this is the collection that will be
 * stopped when skipping slides. All string definitions of other elements
 * will be relative to this collection, and therefore must be children of
 * this collection. A collection must be passed in.
 *
 * `prevButton` and `nextButton` are buttons that can be used to progress
 * backwards and forwards through the slides. The SlideNavigator will
 * disable `prevButton` on the first slide and update `nextButton` label
 * (if it exists) with `'restart'` when at the last slide.
 *
 * `text` is a {@link OBJ_TextLines} figure element that will be updated
 * with the `text` property in {@link OBJ_SlideNavigatorSlide}
 *
 * `equation` is one or more {@link Equation} elements to associate with the
 * SlideNavigator. Each associated equation will be operated on by the `form`
 * property in {@link OBJ_SlideNavigatorSlide}. Use `OBJ_EquationDefaults` to
 * set default equation animation properties when `form` creates slide
 * transitions.
 *
 * @property {Figure | FigureElementCollection} collection
 * @property {Array<OBJ_NavigatorSlide>} [slides]
 * @property {null | FigureElement | string} [prevButton]
 * @property {null | FigureElement | string} [nextButton]
 * @property {null | string | FigureElementCollection} [text]
 * @property {Equation | string | Array<string | Equation>} [equation]
 * @property {OBJ_EquationDefaults} [equationDefaults]
 */
export type OBJ_SlideNavigator = {
  collection: Figure | FigureElementCollection,
  slides?: Array<OBJ_SlideNavigatorSlide>,
  prevButton?: ?FigureElement | string,
  nextButton?: ?FigureElement | string,
  text?: string | FigureElementCollection,
  equation?: Equation | string | Array<string | Equation>,
  equationDefaults?: OBJ_EquationDefaults,
} & OBJ_Collection;

/**
 * Slide Navigator
 *
 * It is sometimes useful to break down a visualization into easier to consume
 * parts.
 *
 * For example, a complex figure or concept can be made easier if built up
 * from a simple begining. Each step along the way might change the elements
 * within the figure, or the form of an equation, and be accompanied by a
 * corresponding description giving context, reasoning or next steps.
 *
 * An analogy to this is a story or presentation, where each step along the way
 * is a presentation slide.
 *
 * This class is a simple slide navigator, providing a convenient way to define
 * slides and step through them.
 *
 * {@link CollectionsSlideNavigator} creates the navigation buttons, and
 * `textElement` automatically, and will usually be more convenient than
 * manually creating them (unless custom buttons are needed).
 *
 * Notifications - The subscription manager property `subscriptions` will
 * publish the following events:
 * - `goToSlide`: published when slide changes - will pass slide index to
 * subscriber
 * - `steady`: steady state reached (slide transition complete)
 *
 * @property {SubscriptionManager} subscriptions subscription manager for
 * element
 * @property {number} currentSlideIndex index of slide current shown
 * @property {boolean} inTransition `true` if slide current transitioning
 *
 * @see {@link CollectionsSlideNavigator} for examples.
 */
export default class SlideNavigator {
  currentSlideIndex: number;
  slides: Array<OBJ_SlideNavigatorSlide>;
  prevButton: ?FigureElement;
  nextButton: ?FigureElement;
  textElement: ?FigureElement;
  inTransition: boolean;
  equationsOrder: Array<FigureElement>;
  equations: { [string]: FigureElement };
  collection: FigureElementCollection;
  subscriptions: SubscriptionManager;
  from: 'prev' | 'next' | number;
  equationDefaults: {
    duration: number,
    animate: "move" | "dissolve" | "moveFrom" | "pulse" | "dissolveInThenMove",
  };

  fromAutoSlide: boolean;

  /**
   * @param {OBJ_SlideNavigator | null} options use `null` to load options later
   * with the `load` method. Options should only be loaded when an instantiated
   * {@link FigureElementCollection} is available for the `collections`
   * property.
   */
  constructor(options: OBJ_SlideNavigator | null = null) {
    this.subscriptions = new SubscriptionManager();
    this.inTransition = false;
    this.fromAutoSlide = false;
    if (options != null) {
      this.load(options);
    }
  }

  /**
   * Load options after object instantiation. Usefull for if the
   * `collection`, `prevButton`, `nextButton`, `equation` and/or `text` figure
   * elements are not available at instantiation.
   *
   * @param {OBJ_SlideNavigator} options
   */
  load(options: OBJ_SlideNavigator) {
    const o = options;
    if (o.collection instanceof FigureElementCollection) {
      this.collection = o.collection;
    } else if (o.collection != null && o.collection.elements != null) {
      this.collection = o.collection.elements;
    }

    const processSlide = (payload) => {
      const [fromDirection, slideNo] = payload;
      if (fromDirection === 'prev' && this.currentSlideIndex === slideNo - 1) {
        this.nextSlide(true);
      } else if (fromDirection === 'prev') {
        this.goToSlide(slideNo - 1);
        this.nextSlide(true);
      } else if (fromDirection === 'next' && this.currentSlideIndex === slideNo + 1) {
        this.prevSlide();
      } else {
        this.goToSlide(slideNo);
      }
    };
    this.collection.recorder.addEventType('slide', processSlide, true);
    const processAutoSlide = (payload) => {
      const [slideNo] = payload;
      // this.fromAutoSlide = true;
      if (this.currentSlideIndex === slideNo - 1) {
        this.nextSlide(true);
      } else if (slideNo !== 0) {
        this.goToSlide(slideNo - 1);
        this.nextSlide(true);
      } else {
        this.goToSlide(slideNo);
      }
    };
    this.collection.recorder.addEventType('_autoSlide', processAutoSlide, true);
    this.collection.fnMap.global.add('slideNavigatorTransitionDone', this.transitionDone.bind(this));
    this.from = 'prev';

    if (o.slides != null) {
      this.slides = o.slides;
    }
    if (typeof o.text === 'string') {
      this.textElement = this.collection.getElement(o.text);
    } else if (o.text != null) {
      this.textElement = o.text;
    } else {
      this.textElement = null;
    }
    let equations = [];
    if (Array.isArray(o.equation)) {
      equations = o.equation;
    } else if (o.equation != null) {
      equations = [o.equation];
    }
    this.setEquations(equations);
    this.equationDefaults = joinObjects({}, {
      duration: 1,
      animate: 'move',
    }, o.equationDefaults || {});
    if (o.prevButton) {
      this.prevButton = this.collection.getElement(o.prevButton);
    }
    if (o.nextButton) {
      this.nextButton = this.collection.getElement(o.nextButton);
    }
    this.currentSlideIndex = 0;
    this.inTransition = false;
    const { prevButton, nextButton } = this;
    if (prevButton != null) {
      prevButton.onClick = this.prevSlide.bind(this);
    }
    if (nextButton != null) {
      nextButton.onClick = this.nextSlide.bind(this, false);
    }

    if (this.slides == null && this.equationsOrder.length === 1) {
      const [equation] = this.equationsOrder;
      if (equation instanceof Equation) {
        const { eqn } = equation;
        if (eqn.currentFormSeries != null && eqn.currentFormSeries.length > 0) {
          this.slides = [];
          eqn.currentFormSeries.forEach(f => this.slides.push({ form: `${f}` }));
        }
      }
    }
    this.loadRecorder();
  }

  // eslint-disable-next-line class-methods-use-this
  convertTime(timeIn: string | number): number {
    let t;
    if (typeof timeIn === 'string') {
      const splitTime = timeIn.split(':');
      const minutes = parseInt(splitTime[0], 10);
      const seconds = parseFloat(splitTime[1]);
      t = minutes * 60 + seconds;
    } else {
      t = timeIn;
    }
    return t;
  }

  loadRecorder() {
    if (this.slides == null || this.slides.length === 0) {
      return;
    }
    let lastTime = 0;
    this.slides.forEach((slide, index) => {
      const { time, delta, execDelta } = slide;
      if (time != null) {
        const t = this.convertTime(time); // $FlowFixMe
        this.collection.recorder.events._autoSlide.list.push([t, [index], 0]);
        lastTime = t;
      } else if (delta != null) {
        lastTime += delta; // $FlowFixMe
        this.collection.recorder.events._autoSlide.list.push([lastTime, [index], 0]);
      }
      if (execDelta != null && execDelta.length > 0) {
        let eDelta = execDelta;
        if (!Array.isArray(eDelta[0])) {
          eDelta = [eDelta];
        }
        eDelta.forEach((e) => { // $FlowFixMe
          const [execDeltaTime, command] = e; // $FlowFixMe
          const t = lastTime + execDeltaTime;
          if (!(typeof t === 'number')) { // $FlowFixMe
            throw new Error(`Error in delta time: ${t}, ${execDeltaTime}, ${lastTime}, ${command}`);
          } // $FlowFixMe
          this.collection.recorder.events._autoExec.list.push([t, [command], 0]);
        });
      }
    });
    this.slides.forEach((slide) => {
      let { exec } = slide;
      if (exec != null) {
        if (exec.length === 0) {
          return;
        }
        if (!Array.isArray(exec[0])) {
          exec = [exec];
        }
        exec.forEach((e) => { // $FlowFixMe
          const [time, command] = e; // $FlowFixMe
          const t = this.convertTime(time);
          if (!(typeof t === 'number')) { // $FlowFixMe
            throw new Error(`Error in exec time: ${t}, ${time}, ${command}`);
          } // $FlowFixMe
          this.collection.recorder.events._autoExec.list.push([t, [command], 0]);
        });
      }
    });
    this.collection.recorder.events._autoExec.list.sort((a, b) => a[0] - b[0]);
  }

  setEquations(equationsIn: Array<string | Equation>) {
    const equations = {};
    const equationsOrder = [];
    equationsIn.forEach((e) => {
      const element = this.collection.getElement(e);
      if (element != null) {
        equationsOrder.push(element);
        equations[element.name] = element;
      }
    });
    this.equations = equations;
    this.equationsOrder = equationsOrder;
  }

  getProperty(property: string, indexIn: number, defaultValue: any = null) {
    let index = indexIn;
    let prop = this.slides[index][property];
    if (this.slides[index].clear) {
      return prop === undefined ? defaultValue : prop;
    }
    while (prop === undefined && index > 0) {
      index -= 1;
      prop = this.slides[index][property];
      if (this.slides[index].clear) {
        return prop === undefined ? defaultValue : prop;
      }
    }
    if (prop === undefined) {
      return defaultValue;
    }
    return prop;
  }

  getText(index: number) {
    return this.getProperty('text', index, '');
  }

  getForm(index: number) {
    // const forms = this.getProperty('form', index, null);
    // if (forms === undefined) {
    //   return [];
    // }
    // if (!Array.isArray(forms)) {
    //   return [forms];
    // }
    // return forms;
    return this.getFormGeneric('form', index);
  }

  getFormGeneric(formType: 'form' | 'fromForm', index: number) {
    let form;
    if (formType === 'form') {
      form = this.getProperty('form', index, null);
    } else {
      form = this.slides[index][formType];
    }
    if (form === undefined) {
      return {};
    }
    if (Array.isArray(form)) {
      const forms = {};
      form.forEach((f, i) => {
        if (this.equationsOrder.length > i) {
          forms[this.equationsOrder[i].name] = f;
        }
      });
      return forms;
    }
    if (typeof form === 'string' || form === null) {
      const forms = {};
      if (this.equationsOrder.length > 0) {
        forms[this.equationsOrder[0].name] = form;
      }
      return forms;
    }
    return form;
  }

  getFromForm(index: number) {
    if (this.slides[index].fromForm === undefined) {
      if (index === 0 || this.slides[index].clear) {
        return {};
      }
      return this.getFormGeneric('form', index - 1);
    }
    return this.getFormGeneric('fromForm', index);
  }

  showForms(formsToShow: Object) {
    Object.keys(formsToShow).forEach((eqnName) => {
      const form = formsToShow[eqnName];
      const e = this.collection.getElement(eqnName);
      if (e != null) {
        if (form == null) {
          e.hide();
        } else {  // $FlowFixMe
          e.showForm(form);
        }
      }
    });
  }

  setSteadyState(from: 'next' | 'prev' | number) {
    const index = this.currentSlideIndex;
    const slide = this.slides[index];
    const form = this.getForm(index);
    this.showForms(form);
    // this.showDissolved(slide);
    if (slide.transition != null && Array.isArray(slide.transition)) {
      this.setFinalFromAutoTransition(slide.transition);
    }
    if (slide.transition != null && typeof slide.transition === 'object') {
      this.setFinalFromAutoTransition([slide.transition]);
    }
    this.collection.fnMap.exec(
      this.getProperty('steadyStateCommon', index, () => {}),
      from, index,
    );
    if (slide.steadyState != null) {
      this.collection.fnMap.exec(slide.steadyState, from, index);
    }
    const { prevButton, nextButton } = this;
    if (prevButton != null) {
      if (this.currentSlideIndex === 0) {
        prevButton.setOpacity(0.7);
        prevButton.isTouchable = false;
      } else if (prevButton.isTouchable === false) {
        prevButton.setOpacity(1);
        prevButton.isTouchable = true;
      }
    } // $FlowFixMe
    if (nextButton != null && nextButton.setLabel != null) {
      if (this.currentSlideIndex === this.slides.length - 1) {  // $FlowFixMe
        nextButton.setLabel('Restart');
      } else {  // $FlowFixMe
        nextButton.setLabel('Next');
      }
    }
    this.inTransition = false;
    this.subscriptions.publish('steady');
  }

  transitionDone(force: 'freeze' | 'complete' | null = 'complete') {
    if (force !== 'freeze') {
      this.setSteadyState(this.from);
      this.inTransition = false;
    }
  }

  setFinalFromAutoTransition(
    stepsIn: Array<OBJ_AnimationDefinition | Array<OBJ_AnimationDefinition>>,
  ) {
    stepsIn.forEach((serialStep) => {
      let steps;
      if (!Array.isArray(serialStep)) {
        steps = [serialStep];
      } else {
        steps = serialStep;
      }
      steps.forEach((step) => {
        if (step.final === false) {
          return;
        }
        this.processAutoTransitionSet(step, 'in', 'showAll');
        this.processAutoTransitionSet(step, 'out', 'hide');
        this.processAutoTransitionSet(step, 'scenario', 'setScenario', 'target');
        this.processAutoTransitionSet(step, 'dim', 'dim');
        this.processAutoTransitionSet(step, 'undim', 'undim');
        this.processAutoTransitionSet(step, 'rotation', 'setRotation', 'target');
        this.processAutoTransitionSet(step, 'position', 'setPosition', 'target');
        this.processAutoTransitionSet(step, 'scale', 'setScale', 'target');
      });
    });
  }

  processAutoTransitionAnim(
    step: Object,
    key: string,
    animName: string = '',
    animSteps: Array<AnimationStep>,
    defaultOptions: Object = {},
  ) {
    if (step.trigger != null && key === 'trigger') {
      const o = joinObjectsWithOptions(
        { except: key }, { callback: step.trigger }, defaultOptions, step,
      );  // $FlowFixMe
      animSteps.push(this.collection.animations[animName](o));
    } else if (step[key] != null) {
      const elements = this.collection.getElements(step[key]);
      const o = joinObjectsWithOptions({ except: key }, {}, defaultOptions, step);  // $FlowFixMe
      animSteps.push(...elements.map(e => e.animations[animName](o)));
    }
  }

  processAutoTransitionSet(
    step: Object,
    key: string,
    setName: string,
    setKey: string = '',
  ) {
    if (step[key] != null) {
      const elements = this.collection.getElements(step[key]);
      if (setKey !== '') {  // $FlowFixMe
        elements.map(e => e[setName](step[setKey]));
      } else {  // $FlowFixMe
        elements.map(e => e[setName]());
      }
    }
  }

  showAutoTransitionDissolve(index: number, showAll: boolean = false) {
    const slide = this.slides[index];
    if (slide.transition == null || typeof slide.transition === 'function') {
      return;
    }
    let stepsIn = slide.transition;
    if (!Array.isArray(stepsIn)) {
      stepsIn = [stepsIn];
    }
    stepsIn.forEach((serialStep) => {
      let steps;
      if (!Array.isArray(serialStep)) {
        steps = [serialStep];
      } else {
        steps = serialStep;
      }
      steps.forEach((step) => {
        if (showAll) {
          if (step.in != null) { // $FlowFixMe
            this.collection.getElements(step.in).map(e => e.showAll());
          } else if (step.out != null) { // $FlowFixMe
            this.collection.getElements(step.out).map(e => e.showAll());
          }
        } else {
          if (step.out != null && (step.show == null || step.show !== false)) {
            // $FlowFixMe
            this.collection.getElements(step.out).map(e => e.showAll());
          }
          if (step.in != null && (step.show == null || step.show !== true)) {
            // $FlowFixMe
            this.collection.getElements(step.in).map(e => e.hide());
          }
        }
      });
    });
  }

  autoTransition(stepsIn: Array<Array<Object>> | Array<Object>) {
    const anim = this.collection.animations.new();
    stepsIn.forEach((serialStep) => {
      let steps;
      if (!Array.isArray(serialStep)) {
        steps = [serialStep];
      } else {
        steps = serialStep;
      }
      const animSteps = [];
      steps.forEach((step) => {
        this.processAutoTransitionAnim(step, 'in', 'dissolveIn', animSteps, { duration: 0.5 });
        this.processAutoTransitionAnim(step, 'out', 'dissolveOut', animSteps, { duration: 0.5 });
        this.processAutoTransitionAnim(step, 'rotation', 'rotation', animSteps, { duration: 2 });
        this.processAutoTransitionAnim(step, 'position', 'position', animSteps, { duration: 2 });
        this.processAutoTransitionAnim(step, 'scale', 'scale', animSteps, { duration: 2 });
        this.processAutoTransitionAnim(step, 'scenario', 'scenario', animSteps, { duration: 2 });
        this.processAutoTransitionAnim(step, 'scenarios', 'scenarios', animSteps, { duration: 2 });
        this.processAutoTransitionAnim(step, 'pulseWidth', 'pulseWidth', animSteps, { duration: 1.5 });
        this.processAutoTransitionAnim(step, 'length', 'length', animSteps, { duration: 1.5 });
        this.processAutoTransitionAnim(step, 'pulseAngle', 'pulseAngle', animSteps, { duration: 1.5 });
        this.processAutoTransitionAnim(step, 'pulse', 'pulse', animSteps, { duration: 1.5 });
        this.processAutoTransitionAnim(step, 'dim', 'dim', animSteps, { duration: 1 });
        this.processAutoTransitionAnim(step, 'undim', 'undim', animSteps, { duration: 1 });
        this.processAutoTransitionAnim(step, 'trigger', 'trigger', animSteps, { duration: 0 });
        this.processAutoTransitionAnim(step, 'goToForm', 'goToForm', animSteps, { duration: 1.5, animate: 'move' });
        if (Object.keys(step).length === 1 && step.delay != null) {
          animSteps.push(this.collection.animations.delay({ duration: step.delay }));
        }
      });
      if (animSteps.length === 1) {
        anim.then(animSteps[0]);
      } else {
        anim.inParallel(animSteps);
      }
    });
    anim.whenFinished('slideNavigatorTransitionDone').start();
  }

  transition(from: 'next' | 'prev' | number) {
    this.subscriptions.publish('beforeTransition');
    this.from = from;
    if (from !== 'prev') {
      return this.transitionDone();
    }
    this.inTransition = true;
    const slide = this.slides[this.currentSlideIndex];
    if (typeof slide.transition === 'function') { // $FlowFixMe
      return slide.transition('slideNavigatorTransitionDone', this.currentSlideIndex, from);
    }
    if (slide.transition != null && Array.isArray(slide.transition)) {
      return this.autoTransition(slide.transition);
    }
    if (slide.transition != null && typeof slide.transition === 'object') {
      // $FlowFixMe
      return this.autoTransition([slide.transition]);
    }

    const forms = this.getForm(this.currentSlideIndex);
    const fromForms = this.getFromForm(this.currentSlideIndex);

    let done = 'slideNavigatorTransitionDone';

    Object.keys(fromForms).forEach((eqnName) => {
      const e = this.collection.getElement(this.equations[eqnName]);
      if (e != null && e instanceof Equation && forms[eqnName] !== undefined) {
        const fromForm = fromForms[eqnName];
        const toForm = forms[eqnName];
        // console.log(fromForm, toForm)
        if (fromForm == null && toForm != null) {
          e.showForm(toForm);
          e.animations.new()
            .dissolveIn(0.4)
            .whenFinished(done)
            .start();
          done = null;
        } else if (fromForm !== toForm) {
          const { animate, duration } = this.equationDefaults;
          // e.showForm(toForm);
          e.animations.new()
            .goToForm({
              start: fromForm, target: toForm, animate, duration,
            })
            .whenFinished(done)
            .start();
          done = null;
        }
      }
    });
    if (done != null) {
      return this.transitionDone();
    }
    return null;
  }

  setText(index: number) {
    const { textElement } = this;
    if (textElement == null) {
      return;
    }
    const mods = this.getProperty('modifiers', index, {});
    const commonMods = this.getProperty('modifiersCommon', index, {});
    const text = this.getText(index) || ' ';
    textElement.custom.updateText({
      text,
      modifiers: joinObjects({}, commonMods, mods),
    });
  }

  showElements(index: number) {
    const showCommon = this.getProperty('showCommon', index, []);
    const show = this.slides[index].show || [];
    this.collection.show(showCommon);
    this.collection.show(show);
    if (show != null && Array.isArray(show)) {
      this.collection.show();
    }
    if (this.nextButton != null) {
      this.nextButton.showAll();
    }
    if (this.prevButton != null) {
      this.prevButton.showAll();
    }
    if (this.textElement != null) {
      this.textElement.showAll();
    }
  }

  hideElements(index: number) {
    const hideCommon = this.getProperty('hideCommon', index, []);
    const hide = this.slides[index].hide || [];
    this.collection.hide(hideCommon);
    this.collection.hide(hide);
  }

  /**
   * @param {number} index slide index to go to
   * @param {'next' | 'prev' | number} from this should generally not be used
   * and will be set automatically
   */
  goToSlide(slideIndex: number, from?: 'next' | 'prev' | number) {
    this.subscriptions.publish('goToSlide', slideIndex);
    if (this.slides == null || this.slides.length === 0) {
      return;
    }
    const index = slideIndex < 0 ? this.slides.length - 1 : slideIndex;
    this.inTransition = true;
    let fromToUse = from;
    if (fromToUse == null) {
      fromToUse = this.currentSlideIndex;
      if (index === this.currentSlideIndex + 1) {
        fromToUse = 'prev';
      } else if (index === this.currentSlideIndex - 1) {
        fromToUse = 'next';
      }
    }

    if (this.collection.recorder.state === 'recording') {
      if (fromToUse === 'next' || fromToUse === 'prev') {
        if (this.fromAutoSlide === false) {
          this.collection.recorder.recordEvent('slide', [fromToUse, index]);
        }
      } else if (this.fromAutoSlide === false) {
        this.collection.recorder.recordEvent('slide', ['goTo', index]);
      }
      this.fromAutoSlide = false;
    }

    // Leave States
    this.getProperty('leaveStateCommon', this.currentSlideIndex, () => {})(this.currentSlideIndex, index);
    if (this.slides[this.currentSlideIndex].leaveState != null) {
      this.collection.fnMap.exec(
        this.slides[this.currentSlideIndex].leaveState, this.currentSlideIndex, index,
      );
    }

    // Reset and Set Text
    this.collection.stop('complete');
    const { textElement } = this;
    if (textElement != null) {
      this.setText(index);
      if (fromToUse === 'prev') {
        const oldText = this.getText(this.currentSlideIndex);
        const newText = this.getText(index);
        if (JSON.stringify(newText) !== JSON.stringify(oldText)) {
          textElement.animations.new()
            .dissolveIn(0.2)
            .start();
        }
      }
    }

    // Enter new slide
    this.currentSlideIndex = index;
    const slide = this.slides[index];
    this.collection.hideAll();
    this.showElements(index);
    this.hideElements(index);
    const fromForm = this.getFromForm(index);
    this.showForms(fromForm);
    this.showAutoTransitionDissolve(index, true);
    this.collection.setScenarios(this.getProperty('scenarioCommon', index, []));
    this.collection.setScenarios(slide.scenario || []);
    this.collection.fnMap.exec(
      this.getProperty('enterStateCommon', index, () => {}),
      fromToUse,
      index,
    );
    if (slide.enterState != null) {
      this.collection.fnMap.exec(slide.enterState, fromToUse, index);
    }
    if (slide.addReference && this.collection.recorder.state === 'recording') {
      this.collection.recorder.addCurrentStateAsReference();
    }
    this.showAutoTransitionDissolve(index, false);
    // Move to transition
    this.transition(fromToUse);
  }

  /**
   * Progress to next slide.
   *
   * @param {boolean} ignoreTransition when `false`, if the slide is still in
   * a transition when nextSlide is called, then the transition will skip
   * through to the end, without moving to the next slide - effectively skipping
   * through to the steady state of the current slide. If `true`, then the
   * transition will instantly complete, setState and leaveStates called and the
   * next slide will be progressed to.
   */
  nextSlide(ignoreTransition: boolean = false) {
    const nextSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    if (this.inTransition) {
      this.inTransition = false;
      this.collection.stop('complete');
      if (!ignoreTransition) {
        return;
      }
    }
    this.goToSlide(nextSlideIndex);
    this.collection.animateNextFrame();
  }

  /**
   * Progress to the previous slide.
   */
  prevSlide() {
    let prevSlideIndex = this.currentSlideIndex - 1;
    if (prevSlideIndex < 0) {
      prevSlideIndex = this.slides.length - 1;
    }
    this.collection.stop('complete');
    this.goToSlide(prevSlideIndex);
    this.collection.animateNextFrame();
  }
}

