# Example 4 - Animation

## Example

A pentagon shape goes through a series of animation steps including translations, rotations, pulses, and dissolves.

Open `index.html` in a browser to view example.

## Explanation

Each `DiagramElement` can manage its own animation, or another element's animation.

A set of animation steps can be created using a builder pattern. For instance the below code will animate an element to position (1, 1) over 1s, and then to (0, 0) over the next second.

```
element.animations.new()
   .position({ target: [1, 1], duration: 1 })
   .position({ target: [0, 0]. duration: 1 })
   .start();
```

Each aniamtion step has a number of parameters. Parameters are custom to the type of animation step, but usually will contain a `target`, `delta`, and/or a `duration`/`velocity` parameter.

Several different animation steps are possible including:

* position - animate position to a target or delta
* rotation - animate rotation to a target or delta
* scale - animate scale to a target or delta
* delay - delay with no animation
* trigger - trigger a function
* custom - create a custom animation step
* dissolveIn - dissolve opacity in
* dissolveOut - dissolve opacity out
* opacity - animate opacity to a target or delta
* color - animate color to a target or delta
* scenario - aniamte to a predefined position/rotation/scale scenario
* serial steps - execute animation steps in series
* parallel steps - execute animation steps in parallel
