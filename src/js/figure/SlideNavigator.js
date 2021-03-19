// @flow
import { joinObjects, SubscriptionManager, joinObjectsWithOptions } from '../tools/tools';
import { FigureElementCollection } from './Element';
import type { FigureElement, TypeElementPath } from './Element';
import type {
  OBJ_Collection, OBJ_TextModifiersDefinition, OBJ_TextLines,
} from './FigurePrimitives/FigurePrimitives';
import type Figure from './Figure';
import { Equation } from './Equation/Equation';
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
 */
export type TypeSlideLeaveStateCallback = (number, TypeSlideFrom) => void;

/**
 * `(currentIndex: number, from: `{@link TypeSlideFrom}`) => void`
 */
export type TypeSlideStateCallback = (TypeSlideFrom, number) => void;

/**
 * `(done: () => void, currentIndex: number, from: `{@link TypeSlideFrom}`) => void`
 *
 * The `done` parameter must be called at the end of the transition.
 */
export type TypeSlideTransitionCallback = (() => void, number, TypeSlideFrom) => void;

/**
 * All element paths should be relative to the slide navigator reference
 * collection {@link OBJ_SlideNavigator}`.collection`.
 *
 * @property {TypeElementPath} [in] elements to dissolve in
 * @property {TypeElementPath} [out] elements to dissolve out
 */
export type OBJ_SlideNavigatorDissolve = {
  in?: TypeElementPath,
  out?: TypeElementPath,
}

/**
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
 * - All equations with `null` forms will be hidden prior to the `enterState`s.
 * - If the slide doesn't have a `transition` defined, and if an equation form
 *   is changed, then a transition will be added that animates the equation form
 *   change. If `transition` is defined, and equation animation is required,
 *   then it needs to be defined in the `transition` property explicity.
 * - Each equation with a defined form will have `showForm` called on that form
 *   prior to the `steadyState`s.
 *
 * The life cycle of a slide change is:
 * - `leaveStateCommon` (for current slide)
 * - `leaveState` (for current slide)
 * - stop all animations
 * - Update associated text element with `text` property
 * - Hide all elements in associated collection
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
 * @property {OBJ_SlideNavigatorDissolve} [dissolve]
 * @property {TypeSlideStateCallback} [enterStateCommon] common property
 * @property {TypeSlideStateCallback} [enterState]
 * @property {TypeSlideTransitionCallback} [transition] transititions are
 * only called when moving between adjacent slides in the forward direction.
 * Progressing backwards, or skipping around with `goToSlide` will not call
 * `transition`. A transition is a callback where animations can be defined. A
 * `done` function is passed to the callback and must be called at the end of
 * the animation to allow slide steadyStates to be set.
 * @property {TypeSlideStateCallback} [steadyStateCommon] common property
 * @property {TypeSlideStateCallback} [steadyState]
 * @property {TypeSlideLeaveStateCallback} [leaveStateCommon] common property
 * @property {TypeSlideLeaveStateCallback} [leaveState]
 * @property {string | Array<string | null> | null} [form] common property
 * @property {string | Array<string | null> | null} [fromForm]
 * @property {string | Array<string>} [scenarioCommon] common property
 * @property {string | Array<string>} [scenario]
 * @property {boolean} [clear] `true` does not use any prior common properties (`false`)
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
  transition?: TypeSlideTransitionCallback;
  steadyStateCommon?: TypeSlideStateCallback;
  steadyState?: TypeSlideStateCallback;
  leaveStateCommon?: TypeSlideLeaveStateCallback;
  leaveState?: TypeSlideLeaveStateCallback;
  fromForm?: string | Array<string | null> | null;
  form?: string | Array<string | null> | null;
  scenarioCommon?: string | Array<string>;
  scenario?: string | Array<string>;
}

/**
 * Default equation animation properties for the {@link SlideNavigator}
 * @property {number} [duration] default duration of equation animation
 * @property {"move" | "dissolve" | "moveFrom" | "pulse" | "dissolveInThenMove"} [animate]
   default style of equation animation
 */
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
 * manually creating thema (unless custom buttons are needed).
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
  equations: { [string: eqnName]: FigureElement };
  collection: FigureElementCollection;
  subscriptions: SubscriptionManager;
  inTransition: boolean;
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

    // this.collection.fnMap.add('slideNavigatorNext', this.nextSlide.bind(this));
    // this.collection.fnMap.add('slideNavigatorPrev', this.prevSlide.bind(this));
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
      this.fromAutoSlide = true;
      if (this.currentSlideIndex === slideNo - 1) {
        this.nextSlide(true);
      } else if (slideNo !== 0) {
        this.goToSlide(slideNo - 1);
        this.nextSlide(true);
      } else {
        this.goToSlide(slideNo);
      }
    };
    this.collection.recorder.addEventType('autoSlide', processAutoSlide, true);
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
        const t = this.convertTime(time);
        this.collection.recorder.events.autoSlide.list.push([t, [index], 0]);
        lastTime = t;
      } else if (delta != null) {
        lastTime += delta;
        this.collection.recorder.events.autoSlide.list.push([lastTime, [index], 0]);
      }
      if (execDelta != null && execDelta.length > 0) {
        let eDelta = execDelta;
        if (!Array.isArray(eDelta[0])) {
          eDelta = [eDelta];
        }
        eDelta.forEach((e) => {
          const [execDeltaTime, command] = e;
          const t = lastTime + execDeltaTime;
          if (!(typeof t === 'number')) {
            throw new Error(`Error in delta time: ${t}, ${execDeltaTime}, ${lastTime}, ${command}`);
          }
          this.collection.recorder.events.autoExec.list.push([t, [command], 0]);
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
        exec.forEach((e) => {
          const [time, command] = e;
          const t = this.convertTime(time);
          if (!(typeof t === 'number')) {
            console.log('Error in exec time: ', t, time, command);
          }
          this.collection.recorder.events.autoExec.list.push([t, [command], 0]);
        });
      }
    });
    this.collection.recorder.events.autoExec.list.sort((a, b) => a[0] - b[0]);
  }

  setEquations(equationsIn: Array<string | Equation>) {
    const equations = {};
    const equationsOrder = [];
    equationsIn.forEach((e) => {
      const element = this.collection.getElement(e);
      if (element != null) {
        equationsOrder.push(element);
        equations[e] = element;
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
    // if (this.slides[index].fromForm !== undefined) {
    //   return this.slides[index].fromForm;
    // }
    // if (index === 0) {
    //   return null;
    // }
    return this.getFormGeneric('fromForm', index);
    // const { fromForm } = this.slides[index];
    // if (fromForm === undefined) {
    //   return {};
    // }
    // if (Array.isArray(fromForm)) {
    //   const forms = {};
    //   fromForm.forEach((form, i) => {
    //     if (this.equations.length > i) {
    //       forms[this.equations[i]] = form;
    //     }
    //   });
    //   return forms;
    // }
    // if (typeof fromForm === 'string') {
    //   const forms = {};
    //   if (this.equations.length > 0) {
    //     forms[this.equations[0]] = fromForm;
    //   }
    //   return forms;
    // }
    // return fromForm;
  }

  showForms(formsToShow: Object) { //, hideOnly: boolean = false) {
    Object.keys(formsToShow).forEach((eqnName) => {
      const form = formsToShow[eqnName];
      const e = this.collection.getElement(eqnName);
      if (e != null) {
        if (form == null) {
          e.hide();
        } else {
          e.showForm(form);
        }
      }
    });
    // for (let i = 0; i < this.equations.length; i += 1) {
    //   const eqnName = this.equations[i];
    //   const e = this.collection.getElement(eqnName);
    //   const form = formsToShow[eqnName];
    //   if (form !== undefined) {
    //     if (form === null) {
    //       e.hide();
    //     } else {
    //       e.showForm(form);
    //     }
    //   }
    //   // if (hideOnly) {
    //   //   e.
    //   // }
    //   // if (e != null) {
    //   //   if (forms.length > i && forms[i] != null) {
    //   //     if (!hideOnly) {  // $FlowFixMe
    //   //       e.showForm(forms[i]);
    //   //     }
    //   //   } else {
    //   //     e.hide();
    //   //   }
    //   // }
    // }

    // for (let i = 0; i < this.equations.length; i += 1) {
    //   const e = this.collection.getElement();
    //   if (e != null) {
    //     if (forms.length > i && forms[i] != null) {
    //       if (!hideOnly) {  // $FlowFixMe
    //         e.showForm(forms[i]);
    //       }
    //     } else {
    //       e.hide();
    //     }
    //   }
    // }
  }

  showDissolved(slide) {
    if (slide.dissolve != null) {
      const inElements = this.collection.getElements(slide.dissolve.in);
      const outElements = this.collection.getElements(slide.dissolve.out);
      outElements.map(e => e.hide());
      inElements.map(e => e.showAll());
    }
  }

  showAllDissolved(index: number) {
    const slide = this.slides[index];
    if (slide.dissolve != null) {
      const inElements = this.collection.getElements(slide.dissolve.in);
      const outElements = this.collection.getElements(slide.dissolve.out);
      outElements.map(e => e.showAll());
      inElements.map(e => e.showAll());
    }
  }

  setSteadyState(from: 'next' | 'prev' | number) {
    const index = this.currentSlideIndex;
    const slide = this.slides[index];
    const form = this.getForm(index);
    this.showForms(form);
    this.showDissolved(slide);
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

  transitionDone(cancelled: boolean = false, force: 'freeze' | 'complete' | null = 'complete') {
    if (force !== 'freeze') {
      this.setSteadyState(this.from);
      this.inTransition = false;
    }
  }

  dissolveTransition(slide) {
    const forms = this.getForm(this.currentSlideIndex);
    const fromForms = this.getFromForm(this.currentSlideIndex);
    if (slide.dissolve != null) {
      const inElements = this.collection.getElements(slide.dissolve.in);
      const outElements = this.collection.getElements(slide.dissolve.out);
      let dissolveInSteps;
      inElements.forEach(element => element.hide());
      if (slide.dissolve.pulse) {
        dissolveInSteps = inElements.map(e => e.animations.builder().dissolveIn(0.4).pulse(slide.dissolve.pulse));
      } else {
        dissolveInSteps = inElements.map(e => e.animations.dissolveIn(0.4));
      }
      const dissolveOutSteps = outElements.map(e => e.animations.dissolveOut(0.4));
      for (let j = 0; j < inElements.length; j += 1) {
        for (let i = 0; i < this.equationsOrder.length; i += 1) {
          const e = this.equationsOrder[i];
          if (e === inElements[j]) {
            e.hide();
          }
        }
      }
      for (let i = 0; i < forms.length; i += 1) {
        if (fromForms.length - 1 < i) {
          const e = this.equationsOrder[i];
          if (forms[i] != null) {
            e.showForm(forms[i]);
          }
        }
      }
      if (slide.dissolve.simultaneous) {
        this.collection.animations.new()
          .inParallel([...dissolveOutSteps, ...dissolveInSteps])
          .whenFinished('slideNavigatorTransitionDone')
          .start();
      } else {
        this.collection.animations.new()
          .inParallel(dissolveOutSteps)
          .inParallel(dissolveInSteps)
          .whenFinished('slideNavigatorTransitionDone')
          .start();
      }
    }
  }

  // processStep(steps) {
  //   if (step.in != null) {
  //     const elements = this.colleciton.getElements(step.in);
  //     anim.
  //   }
  // }

  setFinalFromAutoTransition(stepsIn: Array<Array<Object>> | Array<Object>) {
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
      );
      animSteps.push(this.collection.animations[animName](o));
    } else if (step[key] != null) {
      const elements = this.collection.getElements(step[key]);
      const o = joinObjectsWithOptions({ except: key }, {}, defaultOptions, step);
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
      if (setKey !== '') {
        elements.map(e => e[setName](step[setKey]))
      } else {
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
          if (step.in != null) {
            this.collection.getElements(step.in).map(e => e.showAll());
          } else if (step.out != null) {
            this.collection.getElements(step.out).map(e => e.showAll());
          }
        } else {
          if (step.out != null && (step.show == null || step.show !== false)) {
            this.collection.getElements(step.out).map(e => e.showAll());
          }
          if (step.in != null && (step.show == null || step.show !== true)) {
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
    // let done = () => {
    //   this.setSteadyState(from);
    //   this.inTransition = false;
    // };
    this.from = from;
    if (from !== 'prev') {
      return this.transitionDone();
    }
    this.inTransition = true;
    const slide = this.slides[this.currentSlideIndex];
    if (typeof slide.transition === 'function') {
      return slide.transition('slideNavigatorTransitionDone', this.currentSlideIndex, from);
    }
    if (slide.transition != null && Array.isArray(slide.transition)) {
      return this.autoTransition(slide.transition);
    }
    if (slide.transition != null && typeof slide.transition === 'object') {
      return this.autoTransition([slide.transition]);
    }

    if (slide.dissolve != null) {
      return this.dissolveTransition(slide);
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
            .goToForm({ start: fromForm, target: toForm, animate, duration })
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


    // if (forms.length === 0 || fromForms.length === 0) {
    //   return this.transitionDone();
    // }
    // let done = 'slideNavigatorTransitionDone';
    // for (let i = 0; i < this.equations.length; i += 1) {
    //   const e = this.collection.getElement(this.equations[i]);
    //   if (
    //     e != null
    //     && e instanceof Equation
    //     && forms.length > i
    //     && fromForms.length > i
    //     && forms[i] != null
    //     && fromForms[i] !== forms[i]
    //   ) {
    //     const form = forms[i];
    //     const fromForm = fromForms[i];
    //     if (fromForm === null) {
    //       e.showForm(form);
    //       e.animations.new()
    //         .dissolveIn(0.4)
    //         // .inParallel([
    //         //   e.animations.dissolveIn({ duration: 0.2 }),
    //         //   e.animations.trigger({
    //         //     callback: () => {
    //         //       e.showForm(form);
    //         //     },
    //         //   }),
    //         // ])
    //         .whenFinished(done)
    //         .start();
    //       done = null;
    //     } else if (fromForm !== null) {
    //       const { animate, duration } = this.equationDefaults;
    //       e.animations.new()
    //         .goToForm({ target: form, animate, duration })
    //         .whenFinished(done)
    //         .start();
    //       done = null;
    //     }
    //   }
    // }
    // if (done != null) {
    //   return this.transitionDone();
    // }
    // return null;
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
    // console.trace()
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
      this.collection.fnMap.exec(this.slides[this.currentSlideIndex].leaveState, this.currentSlideIndex, index);
      // this.slides[this.currentSlideIndex].leaveState(this.currentSlideIndex, index);
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
    this.showAllDissolved(index);
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
    // if (this.collection.recorder.state === 'recording') {
    //   this.collection.recorder.recordEvent('slide', ['next', nextSlideIndex]);
    // }
    // debugger;
    if (this.inTransition) {
      this.inTransition = false;
      this.collection.stop('complete');
      if (!ignoreTransition) {
        return;
      }
    }
    // const nextSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
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
    // if (this.collection.recorder.state === 'recording') {
    //   this.collection.recorder.recordEvent('slide', ['prev', prevSlideIndex]);
    // }
    this.collection.stop('complete');
    // let prevSlideIndex = this.currentSlideIndex - 1;
    // if (prevSlideIndex < 0) {
    //   prevSlideIndex = this.slides.length - 1;
    // }
    this.goToSlide(prevSlideIndex);
    this.collection.animateNextFrame();
  }
}

