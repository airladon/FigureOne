// @flow
import { joinObjects } from '../tools/tools';
import type { FigureElementCollection, FigureElement } from './Element';
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
export type TypeSlideLeaveStateCallback = (number, number) => void;

/**
 * `(currentIndex: number, from: `{@link TypeSlideFrom}`) => void`
 */
export type TypeSlideStateCallback = (number, number) => void;

/**
 * `(done: () => void, currentIndex: number, from: `{@link TypeSlideFrom}`) => void`
 *
 * The `done` parameter must be called at the end of the transition.
 */
export type TypeSlideTransitionCallback = (number, number) => void;

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
 * - Hide all equations with `null` forms
 * - `enterStateCommon` (for new slide)
 * - `enterState`
 * - `transition`
 * - Show all equations with non-null forms
 * - `steadyStateCommon`
 * - `steadyState`
 * - Wait for next navigation event
 *
 * @property {OBJ_TextLines} [text] common property - With `modifiersCommon` and
 * `modifiers` define the text for the text element associated with the
 * SlideNavigator
 * @property {OBJ_TextModifiersDefinigion} [modifiersCommon] common property
 * @property {OBJ_TextModifiersDefinition} [modifiers] will
 * overwrite any keys from `modifiersCommon` with the same name
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
 * @property {string | Array<string>} [form] common property
 */
export type OBJ_SlideNavigatorSlide = {
  text?: OBJ_TextLines,
  modifiersCommon?: OBJ_TextModifiersDefinigion;
  modifiers?: OBJ_TextModifiersDefinition;
  enterStateCommon?: TypeSlideStateCallback,
  enterState?: TypeSlideStateCallback,
  transition?: TypeSlideTransitionCallback;
  steadyStateCommon?: TypeSlideStateCallback;
  steadyState?: TypeSlideStateCallback;
  leaveStateCommon?: TypeSlideLeaveStateCallback;
  leaveState?: TypeSlideLeaveStateCallback;
  form?: string | Array<string>;
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
 * @property {FigureElement | string} [prevButton]
 * @property {FigureElement | string} [nextButton]
 * @property {string | FigureElementCollection} [text]
 * @property {Equation | string | Array<string | Equation>} [equation]
 * @property {OBJ_EquationDefaults} [equationDefaults]
 */
export type OBJ_SlideNavigator = {
  collection: Figure | FigureElementCollection,
  slides?: Array<OBJ_NavigatorSlide>,
  prevButton?: FigureElement | string,
  nextButton?: FigureElement | string,
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
 * @see {@link CollectionsSlideNavigator} for examples.
 */
export default class SlideNavigator {
  currentSlideIndex: number;
  slides: Array<OBJ_SlideManagerSlides>;
  prevButton: ?FigureElement;
  nextButton: ?FigureElement;
  textElement: ?FigureElement;
  inTransition: boolean;
  equations: Array<FigureElement>;
  collection: FigureElementCollection;
  equationDefaults: {
    duration: number,
    animate: "move" | "dissolve" | "moveFrom" | "pulse" | "dissolveInThenMove",
  };

  /**
   * @param {OBJ_SlideNavigator | null} options use `null` to load options later
   * with the `load` method. Options should only be loaded when an instantiated
   * {@link FigureElementCollection} is available for the `collections`
   * property.
   */
  constructor(options: OBJ_SlideNavigator | null = null) {
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
    this.collection = o.collection;
    this.slides = o.slides;
    if (typeof o.text === 'string') {
      this.textElement = this.collection.getElement(o.text);
    } else if (o.text != null) {
      this.textElement = o.text;
    } else {
      this.textElement = null;
    }
    this.equations = [];
    if (Array.isArray(o.equation)) {
      this.equations = o.equation;
    } else if (o.equation != null) {
      this.equations = [o.equation];
    }
    this.setEquations();
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
    if (this.prevButton != null) {
      this.prevButton.onClick = this.prevSlide.bind(this);
    }
    if (this.nextButton != null) {
      this.nextButton.onClick = this.nextSlide.bind(this);
    }

    if (this.slides == null && this.equations.length === 1) {
      const { eqn } = this.equations[0];
      if (eqn.currentFormSeries != null && eqn.currentFormSeries.length > 0) {
        this.slides = [];
        eqn.currentFormSeries.forEach(f => this.slides.push({ form: `${f}` }));
      }
    }
  }

  setEquations() {
    const equations = [];
    this.equations.forEach((e) => {
      equations.push(this.collection.getElement(e));
    });
    this.equations = equations;
  }

  getProperty(property: string, indexIn: number, defaultValue: any = null) {
    let index = indexIn;
    let prop = this.slides[index][property];
    while (prop === undefined && index > 0) {
      index -= 1;
      prop = this.slides[index][property];
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
    const forms = this.getProperty('form', index, null);
    if (forms == null) {
      return [];
    }
    if (!Array.isArray(forms)) {
      return [forms];
    }
    return forms;
  }

  showForms(forms: Array<string | null>, hideOnly = false) {
    for (let i = 0; i < this.equations.length; i += 1) {
      const e = this.collection.getElement(this.equations[i]);
      if (forms.length > i && forms[i] != null) {
        if (!hideOnly) {
          e.showForm(forms[i]);
        }
      } else {
        e.hide();
      }
    }
  }

  setSteadyState(from: 'next' | 'prev' | number) {
    const index = this.currentSlideIndex;
    const slide = this.slides[index];
    const form = this.getForm(index);
    this.showForms(form);
    this.getProperty('steadyStateCommon', index, () => {})(index, from);
    if (slide.steadyState != null) {
      slide.steadyState(index, from);
    }
    if (this.prevButton != null) {
      if (this.currentSlideIndex === 0) {
        this.prevButton.setOpacity(0.7);
        this.prevButton.isTouchable = false;
      } else if (this.prevButton.isTouchable === false) {
        this.prevButton.setOpacity(1);
        this.prevButton.isTouchable = true;
      }
    }
    if (this.nextButton != null && this.nextButton.setLabel != null) {
      if (this.currentSlideIndex === this.slides.length - 1) {
        this.nextButton.setLabel('Restart');
      } else {
        this.nextButton.setLabel('Next');
      }
    }
  }

  transition(from: 'next' | 'prev' | number) {
    let done = () => {
      this.setSteadyState(from);
      this.inTransition = false;
    };
    if (from !== 'prev') {
      return done();
    }
    this.inTransition = true;
    const slide = this.slides[this.currentSlideIndex];
    if (typeof slide.transition === 'function') {
      return slide.transition(done, this.currentSlideIndex, from);
    }

    const forms = this.getForm(this.currentSlideIndex);
    for (let i = 0; i < this.equations.length; i += 1) {
      const e = this.collection.getElement(this.equations[i]);
      if (forms.length > i && forms[i] != null) {
        const form = forms[i];
        const currentForm = e.getCurrentForm().name;
        if (!e.isShown) {
          e.animations.new()
            .inParallel([
              e.animations.dissolveIn({ duration: 0.2 }),
              e.animations.trigger({
                callback: () => {
                  e.showForm(form);
                },
              }),
            ])
            .whenFinished(done)
            .start();
          done = null;
        } else if (form !== currentForm) {
          const { animate, duration } = this.equationDefaults;
          e.animations.new()
            .goToForm({ target: form, animate, duration })
            .whenFinished(done)
            .start();
          done = null;
        }
      }
    }
    if (done != null) {
      return done();
    }
    return null;
  }

  setText(index: number) {
    if (this.textElement == null) {
      return;
    }
    const mods = this.getProperty('modifiers', index, {});
    const commonMods = this.getProperty('modifiersCommon', index, {});

    this.textElement.custom.updateText({
      text: this.getText(index),
      modifiers: joinObjects({}, commonMods, mods),
    });
  }

  /**
   * @param {number} index slide index to go to
   * @param {'next' | 'prev' | number} from this should generally not be used
   * and will be set automatically
   */
  goToSlide(index: number, from?: 'next' | 'prev' | number) {
    if (this.slides == null || this.slides.length === 0) {
      return;
    }
    let fromToUse = from;
    if (fromToUse == null) {
      fromToUse = this.currentSlideIndex;
      if (index === this.currentSlideIndex + 1) {
        fromToUse = 'prev';
      } else if (index === this.currentSlideIndex - 1) {
        fromToUse = 'next';
      }
    }

    // Leave States
    this.getProperty('leaveStateCommon', this.currentSlideIndex, () => {})(this.currentSlideIndex, index);
    if (this.slides[this.currentSlideIndex].leaveState != null) {
      this.slides[this.currentSlideIndex].leaveState(this.currentSlideIndex, index);
    }

    // Reset and Set Text
    this.collection.stop('complete');
    if (this.textElement != null) {
      this.setText(index);
      if (fromToUse === 'prev') {
        const oldText = this.getText(this.currentSlideIndex);
        const newText = this.getText(index);
        if (newText !== oldText) {
          this.textElement.animations.new()
            .dissolveIn(0.2)
            .start();
        }
      }
    }

    // Enter new slide
    this.currentSlideIndex = index;
    const slide = this.slides[index];
    const forms = this.getForm(index);
    this.showForms(forms, true);
    this.getProperty('enterStateCommon', index, () => {})(index, fromToUse);
    if (slide.enterState != null) {
      slide.enterState(index, fromToUse);
    }
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
    if (this.inTransition) {
      this.collection.stop('complete');
      if (!ignoreTransition) {
        return;
      }
    }
    const nextSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    this.goToSlide(nextSlideIndex);
    this.collection.animateNextFrame();
  }

  /**
   * Progress to the previous slide.
   */
  prevSlide() {
    this.collection.stop('complete');
    let prevSlideIndex = this.currentSlideIndex - 1;
    if (prevSlideIndex < 0) {
      prevSlideIndex = this.slides.length - 1;
    }
    this.goToSlide(prevSlideIndex);
    this.collection.animateNextFrame();
  }
}
