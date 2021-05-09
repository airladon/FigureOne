# Tutorial 4 - Animation

Introducing serial and parallel animations.

Open `index.html` in a browser to view example.

![](./example.gif)

## Code
```js
// Add two squares to the figure
const [s1, s2] = figure.add([
  {
    make: 'polygon',
    sides: 4,
    radius: 0.2,
    position: [-0.4, 0],
    color: [1, 0, 0, 1],
  },
  {
    make: 'polygon',
    sides: 4,
    radius: 0.3,
    position: [0.4, 0],
    color: [0, 0, 1, 0.5],
  },
]);


// Dissolve in, rotate, then move to position
s1.animations.new()
  .dissolveIn()
  .rotation(Math.PI / 4)
  .position({ target: [0, 0], duration: 2 })
  .start();


// Dissolve in, then rotate and move to position simultaneously
s2.animations.new()
  .dissolveIn()
  .inParallel([
    s2.animations.position({ target: [0, 0], duration: 3 }),
    s2.animations.rotation({ target: Math.PI / 4, duration: 3 }),
  ])
  .start();
```

## Explanation

Many properties of a [FigureElement](https://airladon.github.io/FigureOne/api/#figureelement) can be animated, such as position, rotation, scale and color. An animation of a property is called an *animation step*. A full list of animation steps is in the [API Documentation](https://airladon.github.io/FigureOne/api/#animation). Many animation steps can be combined together in series or in parallel to create an *animation*.

Each [FigureElement](https://airladon.github.io/FigureOne/api/#figureelement) has an [AnimationManager](https://airladon.github.io/FigureOne/api/#animationmanager) (the `animations` property) that can create animation steps, chain steps together into animations, and manage the execution of one or more animations.

### Building an Animation
In this tutorial, the first square is animated with:

```js
s1.animations.new()
  .dissolveIn()
  .rotation(Math.PI / 4)
  .position({ target: [0, 0], duration: 2 })
  .start();
```

Here the element `s1`'s animation manager (`animations`) creates a new animation builder with the `new()` method. Animation steps can then be chained onto it. These steps are executed in series.

The first step dissolves the element from invisible to visible
```js
  .dissolveIn()
```

The next step then rotates the element by 45º:
```js
  .rotation(Math.PI / 4)
```

Each animation step has a number of parameters that customize its behavior. If the default values for all these parameters is acceptable, then only the target needs to be defined in the animation step (as in the rotation step above). However, when the default value of some of the parameters need to change, then an options object is used. The next step translates the element, and uses an options object to define both the target and duration.

```js
  .position({ target: [0, 0], duration: 2 })
```

Finally, the animation is started.
```js
  .start();
```

## Parallel Animation Steps

There are two ways to achieve parallel animations. Either two animations can be created and started at the same time, or a parallel animation step can be used within an animation.

This tutorial shows both approaches.

First, both `s1` and `s2` are animated in parallel by creating two animations and running them in parallel. 

```js
s1.animations.new()
  .dissolveIn()
  .rotation(Math.PI / 4)
  .position({ target: [0, 0], duration: 2 })
  .start();

s2.animations.new()
  .dissolveIn()
  .inParallel([
    s2.animations.position({ target: [0, 0], duration: 3 }),
    s2.animations.rotation({ target: Math.PI / 4, duration: 3 }),
  ])
  .start();
```

Second, the `s2` animation includes a parallel animation step (`inParallel`). The parallel animation step takes an array of animation steps (created by s2's `AnimationManager`: `s2.animations`) as input. The two animation steps are:

```js
    s2.animations.position({ target: [0, 0], duration: 3 }),
    s2.animations.rotation({ target: Math.PI / 4, duration: 3 }),
```


## Note
The `animations.new()` method creates an animation builder that itself creates and chains animation steps that by default act on the element to which `animations` belongs. Note however, that animations built this way can also control other figure elements. For example, this tutorial could be rewritten as:

```js
s1.animations.new()
  .inParallel([
    s1.animations.dissolveIn(),
    s2.animations.dissolveIn(),
  ])
  .inParallel([
    s1.animations.rotation(Math.PI / 4),
    s1.animations.position({ target: [0, 0], duration: 2, delay: 1 }),
    s2.animations.position({ target: [0, 0], duration: 3 }),
    s2.animations.rotation({ target: Math.PI / 4, duration: 3 }),
  ])
  .start();
```

There are two ways to associate animation steps to other elements. One way is to define the element in the animation step (see the `dissolveIn` step below), the second way is to create an animation step from the element's animation manager and chain it with `then()` (see the `position` step below).

```js
s2.hide();
s1.animations.new()
  .dissolveIn()
  .rotation(Math.PI / 4)
  .dissolveIn({ element: s2 })
  .then(s2.animations.position({ target: [-0.4, 0], duration: 3 }))
  .start();
```