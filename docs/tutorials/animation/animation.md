Animations change diagram elements over time.

Each diagram element has its own {@link AnimationManager} (`animations` property) that can coordinate animations for any element.

An animation is a number of {@link AnimationStep}s in either series or parallel. The animation manager provides a way to create these steps, as well as build them into a complete animation.

### <a id="animation-boilerplate"></a> Animation Boilerplate
To test examples within the 'Animation' section of the API reference create an `index.html` file and `index.js` file.

All examples are snippets which can be appended to the end of the `index.js` file.

```html
<!-- index.html -->
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 800px; height: 800px; background-color: white;">
    </div>
    <script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.2.3/figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

```javascript
// index.js
const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});
diagram.addElement(
  {
    name: 'p',
    method: 'polygon',
    options: {
      sides: 4,
      fill: true,
      radius: 0.5,
      position: [0, 0],
    },
  },
);
const p = diagram.getElement('p');
diagram.initialize();
```

### Animation Examples

Let's create a simple animation. Start by defining a diagram and retrieving the element to animate by creating the boilerplate files [above](#animation-boilerplate).

A {@link PositionAnimationStep} can be created to translate the shape, and a {@link RotationAnimationStep} to rotate it
```javascript
const translate = p.animations.position({ target: [1, 0], duration: 2 });
const rotate = p.animations.rotation({ target: Math.PI, duration: 2 });
```

The animation can then be created and started
```javascript
p.animations.new()
  .then(translate)
  .then(rotate)
  .start();
```

<p style="text-align: center"><img src="./tutorials/animation/ex1.gif"></p>


A more convenient way to chain animation steps in series is to create them inline
```javascript
p.animations.new()
  .position({ target: [1, 0], duration: 2 })
  .rotation({ target: Math.PI, duration: 2 })
  .start();
```


An animation manager is tied to one element, can be used to animate other elements too
```javascript
// add another element
diagram.addElement({
  name: 'q',
  method: 'polygon',
  options: {
    fill: true, radius: 0.5, sides: 3, position: [-1, 0]
  },
});

const q = diagram.getElement('q');

// Use p animation manager to animate q
p.animations.new()
  .translation({ target: [1, 0], duration: 2 })
  .rotation({ element: q, target: Math.PI / 3 * 2, duration: 2})
  .start();
```

<p style="text-align: center"><img src="./tutorials/animation/ex2.gif"></p>


Multiple animations can be added to a single element, but if they modify the same property of the element, then the latter one will overwrite the earlier on each animation frame. In the next example, both animations animate different parts of the element's transform and so will happen in parallel.

```javascript
// animate the translation
p.animations.new()
  .translation({ target: [1, 0], duration: 2 })
  .start();

// animate the rotation
p.animations.new()
  .rotation({ target: Math.PI / 2 * 3, duration: 2 })
  .start();
```

<p style="text-align: center"><img src="./tutorials/animation/ex3.gif"></p>

While this is one way to do a parallel animation, a more convenient way (especially when dealing with many steps) is to use a parallel animation step:

```javascript
p.animations.new()
  .inParallel([
    p.animations.translation({ target: [1, 0], duration: 2 }),
    p.animations.rotation({ target: Math.PI / 2 * 3, duration: 2 }),
    p.animations.color({ target: [0, 0, 1, 1], delay: 1, duration: 2 }),
  ])
  .start();
```

<p style="text-align: center"><img src="./tutorials/animation/ex4.gif"></p>

Callbacks can be defined when animations finish
```javascript
p.animations.new()
  .delay(1)
  .transform({ target: new Fig.Transform().scale(0.5, 2).rotate(Math.PI).translate(1, 0), duration: 2 })
  .scale({ target: [1, 1], duration: 2 })
  .dissolveOut(1)
  .whenFinished(() => { console.log('animation done') })
  .start();
```

<p style="text-align: center"><img src="./tutorials/animation/ex5.gif"></p>

### Stopping animations

Animations can be stopped from the animation, element and diagram levels.

```javascript
p.animations.new('mover')
  .position({ target: [1, 0], duration: 4})
  .start();

// after 1 second, cancel the specific animation by freezing it in place
setTimeout(() => {
  p.animations.cancel('mover', 'freeze');
}, 1000);
```


```javascript
p.animations.new()
  .position({ target: [1, 0], duration: 4})
  .start();

// after 1 second, cancel all an element's animations by instantly completing them
setTimeout(() => {
  p.stop('complete');
}, 1000);
```

```javascript
p.animations.new()
  .position({ target: [1, 0], duration: 4})
  .start();

// after 1 second, cancel all diagram animations by freezing them
setTimeout(() => {
  diagram.stop('freeze');
}, 1000);
```

### Animations at their heart
The 