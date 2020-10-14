Animations change diagram elements over time.

Each diagram element has its own {@link AnimationManager} (`animations` property) that coordinates animations primarily for that element, but also sometimes also for other elements.

An animation is a number of {@link AnimationStep}s in either series or parallel. The animation manager provides a way to create these steps, as well as build them into a complete animation.

Let's create a simple animation. Start by defining a diagram and retrieving the element to animate
```javascript
// index.js
//
// Create diagram
const diagram = new Fig.Diagram({ limits: [-1, -1, 2, 2 ]});

diagram.addElement({
  name: 'p', method: 'polygon', options: { fill: true, radius: 0.2 },
});
diagram.initialize();

// element to animate
const p = diagram.getElement('p');
```

A {@link PositionAnimationStep} can be created to translate the shape, and a {@link RotationAnimationStep} to rotate it
```javascript
const translate = p.animations.position({ target: [0.5, 0], duration: 2 });
const rotate = p.animations.rotation({ target: Math.PI, duration: 2 });
```

The animation can then be created and started
```javascript
p.animations.new()
  .then(translate)
  .then(rotate)
  .start();
```

The above animation has two steps in series, but they can also be done in parallel
```javascript
p.animations.new()
  .inParallel([translate, rotate])
  .start();
```

A more convenient way to chain animation steps in series is to create them inline
```javascript
p.animations.new()
  .position({ target: [0.5, 0], duration: 2 })
  .rotation({ target: Math.PI, duration: 2 })
  .start();
```


An animation manager is tied to one element, can be used to animate other elements too
```javascript
diagram.addElements([
  {
    name: 'p', method: 'polygon', options: { fill: true, radius: 0.2 }
  },
  {
    name: 'q', method: 'polygon', options: { fill: true, radius: 0.2, sides: 3 },
  },
]);
diagram.initialize();

const p = diagram.getElement('p');
const q = diagram.getElement('q');

p.animations.new()
  .translation({ target: [0.5, 0], duration: 2 })
  .rotation({ element: q, target: 2, duration: 2})
  .start();
```

Multiple animations can be added to a single element, but if they modify the same property of the element, then the latter one will overwrite the earlier on each animation frame

```javascript
p.animations.new()
  .translation({ target: [0.5, 0], duration: 2 })
  .start();

p.animations.new()
  .rotation({ target: 2, duration: 2 })
  .start();
```

Callbacks can be defined when animations finish
```javascript
p.animations.new()
  .translation({ target: [0.5, 0], duration: 2 })
  .whenFinished(() => { console.log('done') })
  .start();
```