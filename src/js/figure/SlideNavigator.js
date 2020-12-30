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

export type OBJ_SlideNavigatorSlide = {
  text?: OBJ_TextLines,
  modifiersCommon?: OBJ_TextModifiersDefinigion;
  modifiers?: OBJ_TextModifiersDefinition;
  enterStateCommon?: () => void,
  enterState?: () => void,
  showCommon?: Array<string | FigureElement>,
  show?: Array<string | FigureElement>,
  transition?: (() => void) => void;
  steadyStateCommon?: () => void;
  steadyState?: () => void;
  leaveStateCommon?: () => void;
  leaveState?: () => void;
}

export type OBJ_SlideNavigator = {
  collection: Figure | FigureElementCollection,
  slides: Array<OBJ_NavigatorSlide>,
  prevButton?: FigureElement | string,
  nextButton?: FigureElement | string,
  text?: string | FigureElementCollection,
  equation?: Equation | string | Array<string | Equation>,
  equationDefaults: {
    duration?: number,
    animate?: 'move' | 'dissolve' | 'instant',
  },
}

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

  constructor(o: OBJ_SlideNavigator) {
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
      o.equation.forEach((e) => {
        this.equations.push(this.collection.getElement(e));
      });
    } else if (o.equation != null) {
      this.equations = [o.equation];
    }
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
      const e = this.equations[i];
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
    this.getProperty('steadyStateCommon', index, () => {})(from);
    if (slide.steadyState != null) {
      slide.steadyState(from);
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
      return slide.transition(done, from);
    }

    const forms = this.getForm(this.currentSlideIndex);
    for (let i = 0; i < this.equations.length; i += 1) {
      const e = this.equations[i];
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

  // from: 'next' | 'prev' | number | null
  goToSlide(index: number, fromIn: 'next' | 'prev' | number) {
    if (this.slides.length === 0) {
      return;
    }
    let from = fromIn;
    if (from == null) {
      from = this.currentSlideIndex;
      if (index === this.currentSlideIndex + 1) {
        from = 'prev';
      } else if (index === this.currentSlideIndex - 1) {
        from = 'next';
      }
    }

    // Leave States
    this.getProperty('leaveStateCommon', this.currentSlideIndex, () => {})();
    if (this.slides[this.currentSlideIndex].leaveState != null) {
      this.slides[this.currentSlideIndex].leaveState(index);
    }

    // Reset and Set Text
    this.collection.stop('complete');
    if (this.textElement != null) {
      this.setText(index);
      if (from === 'prev') {
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
    this.getProperty('enterStateCommon', index, () => {})(from);
    if (slide.enterState != null) {
      slide.enterState(from);
    }
    // Move to transition
    this.transition(from);
  }

  nextSlide() {
    if (this.inTransition) {
      this.collection.stop('complete');
      return;
    }
    const nextSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    this.goToSlide(nextSlideIndex);
    this.collection.animateNextFrame();
  }

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

