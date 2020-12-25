function SlideNavigator() {
  let currentSlide = 0;
  let slides;
  let prev;
  let next;
  let fig;
  let description;
  let inTransition = false;
  let modifiers = {};

  const loadSlides = (slidesIn, prevButton, nextButton, f, descript, globalModifiers) => {
    slides = slidesIn;
    prev = prevButton;
    next = nextButton;
    fig = f;
    description = descript;
    modifiers = globalModifiers;
  };

  const setSteadyState = (slide) => {
    slide.steadyState();
    inTransition = false;
    if (currentSlide === 0) {
      prev.setOpacity(0.7);
      prev.isTouchable = false;
    } else if (prev.isTouchable === false) {
      prev.setOpacity(1);
      prev.isTouchable = true;
    }
    if (currentSlide === slides.length - 1) {
      next.setLabel('Restart');
    } else {
      next.setLabel('Next');
    }
  };

  const transitionFromPrev = (slide) => {
    inTransition = true;
    if (slide.transitionFromPrev) {
      slide.transitionFromPrev(() => setSteadyState(slide));
    }
  };

  const getText = (indexIn) => {
    let index = indexIn;
    let { text } = slides[index];
    while (text == null && index >= 0) {
      index -= 1;
      ({ text } = slides[index]);
    }
    if (text == null) {
      return '';
    }
    return text;
  };

  const goToSlide = (index, fromPrev = false) => {
    const slide = slides[index];
    currentSlide = index;
    description.stop();
    const m = slide.modifiers;
    description.custom.updateText({
      text: getText(index),
      modifiers: Fig.tools.misc.joinObjects({}, modifiers, m),
    });
    if (fromPrev && slide.transitionFromPrev) {
      transitionFromPrev(slide);
    } else {
      setSteadyState(slide);
    }
  };

  const nextSlide = () => {
    if (inTransition) {
      fig.stop('complete');
      inTransition = false;
      return;
    }
    const oldDescription = getText(currentSlide);
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide, true);
    const newDescription = getText(currentSlide);
    if (newDescription != oldDescription) {
      description.animations.new()
        .dissolveIn(0.2)
        .start();
    }
  };

  const prevSlide = () => {
    fig.stop('cancel');
    currentSlide = (currentSlide - 1) < 0 ? slides.length - 1 : currentSlide - 1;
    goToSlide(currentSlide, false);
  };

  return {
    prevSlide,
    nextSlide,
    loadSlides,
    goToSlide,
  };
}

// const nav = navigator();
