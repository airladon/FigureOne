# Releases

## 1.9.0
* WebGL textures, including shared font atlases, are now reference-counted, so removing one element that shares a font atlas no longer deletes the atlas out from under other elements still using it
* Texture units are assigned per draw from a small shared pool instead of one permanent unit per texture, removing a silent cap on the number of distinct textures that could render at once; a missing or not-yet-loaded texture now skips its draw rather than rendering incorrectly

## 1.8.0
* Add a `textureMap` color mode to the `gl` primitive that recolors regions of a base texture using mask textures — each mask's red, green, blue and alpha channels select up to four regions, each tinted by an entry of the new `tints` option
* Support a single mask via `mask` or several via `masks`, where mask `m` uses `tints[4m]` through `tints[4m + 3]`; change region colors at runtime with the `setTint` / `setTints` element methods, with tint values captured in state for save/restore and recordings

## 1.7.1
* Update the bundled agent docs (`llms.txt` / `llms-full.txt`) to cover the API added since they were last refreshed (v1.1.6): equation `opacity` / `front` / `back` layout functions, layout-function `name` labels, form `ignoreColor` / `ignoreOpacity`, the `formChanged` notification, `Equation.getFunctionElements`, and element `isFormIgnored` / `allowSetColor` / `ignoreSetColor`; plus the earlier `latexToFigureOne`, Figure `textStyle` / `antialias` / `atlasScale` / `onWebGLUnavailable` / `webglAvailable`, the `contextLost` / `contextRestored` notifications, and the `atlasId` font option

## 1.7.0
* Add `front` and `back` equation layout functions (`EQN_Front` / `EQN_Back`) to reorder a phrase's elements within the equation's draw stack per-form, with `num`, `before`, and `after` positioning; the same operations are also available as `front` / `back` element mods
* Add `ignoreSetColor` on figure elements — list a source label (e.g. the equation's default `'form'` cascade) and the element ignores `setColor` from that source while still honoring explicit colour commands (`color` functions, `dim`/`undim`, direct `setColor`)

## 1.6.0
* Add `opacity` equation layout function (`EQN_Opacity`) — wraps an equation phrase in an opacity multiplier that cascades multiplicatively through nested wrappers (outer 0.5 × inner 0.5 = 0.25 on inner content)
* Add `ignoreOpacity` form option (parallel to `ignoreColor`); set `true` to preserve externally-set element opacities and suppress the cascade
* Add `{ color: EQN_Color }` and `{ opacity: EQN_Opacity }` to the `TypeEquationPhrase` union (the `color` union entry was previously missing) and fix `addFormFullObject` so per-form `ignoreColor` / `ignoreOpacity` are honored instead of silently dropped

## 1.5.0
* Add `formChanged` notification on `Equation` with phases `showForm`, `goToFormStart`, `goToFormStep` (with `progress` 0–1), and `goToFormEnd`, so listeners can drive UI from form transitions
* Add optional `notify` parameter to `Equation.showForm` (defaults to `true`); pass `false` to suppress the `formChanged` event for that call

## 1.4.1
* **Breaking (relative to 1.4.0):** rename `Equation.getElementsInForm` → `Equation.getFunctionElements`
* Reorder parameters to `(name, formName? = null, mode = 'all', includeHidden = false)` — `name` is now first, `formName` defaults to the current form, and `mode` defaults to `'all'`

## 1.4.0
* Add optional `name` property to every equation function (container, frac, matrix, brac, annotate, etc.) — purely a label with no layout effect
* Add `Equation.getElementsInForm(formName, name, mode?, includeHidden?)` to look up the `FigureElement`s inside a named function's sub-tree, with `mode: 'first'` returning the first match and `mode: 'all'` returning the de-duplicated union across all matches (including names nested inside annotations)

## 1.3.0
* Add `isFormIgnored` flag on `FigureElement` to exclude an element from equation form changes — when set, the element is skipped by form layout, show/hide, transform/color sets, and `elementMods`, so its user-applied transform, color, and visibility persist across `showForm` / `goToForm`
* Form-ignored elements contribute zero size to layout, so they don't shift adjacent elements when included in a form's content
* Note: form-driven animations still cancel any in-flight animations on ignored elements via `collectionMethods.stop()` — the contract is "no new form-driven changes", not full isolation

## 1.2.1
* Fix glyph corruption on iPad at larger font sizes: the iOS 16MB atlas-size clamp reduced the font size used to draw the atlas canvas but left `this.fontSize` at the pre-clamp value, causing stale ascent/descent in the glyph map and UV mismatch when rendering

## 1.2.0
* Tolerate WebGL context unavailability: `Figure` construction no longer throws when the browser cannot provide a context, and adding elements / drawing during runtime context loss is safe
* Add `onWebGLUnavailable` Figure option, fired once during construction if no context is available
* Add `figure.webglAvailable` getter and document the existing `contextLost` / `contextRestored` notifications for runtime context transitions

## 1.1.6
* Add inline element creation in equation forms using `{ make, name, ... }` syntax, supporting any element type (text, polygon, etc.) directly in form definitions
* Fix TypeDoc generation in Docker by adding missing `typedoc.json` and `typedoc-strip-prefix.cjs` volume mounts

## 1.1.5
* Add configurable `textStyle` option to Figure, FigurePrimitives, and Equation, allowing the default equation text style to be set to `'normal'` instead of the default `'italic'`

## 1.1.4
* Fix `atlasId` not preserved through `FigureFont.definition()`, causing fonts reconstructed from a definition (e.g. equation text elements) to each create a separate WebGL atlas texture instead of sharing one

## 1.1.3
* Fix GL buffer leaks on repeated `addElements()` calls by cleaning up existing buffers before overwriting attribute entries and fullLineHeight primitives
* Fix equation symbol type mismatch when a key maps to a different symbol type on re-add — properly remove the old element instead of reusing the wrong type
* Null out `internalSetTransformCallback` and `setPointsFromDefinition` during cleanup to prevent stale closure references
* Fix dynamic symbol initial scale so the first transform callback always triggers a redraw

## 1.1.2
* Fix memory leaks in `Figure.destroy()`: store bound scroll listener so `disableScrolling()` actually removes it, add `Recorder.cleanup()` to detach audio/worker listeners and clear timers, remove HTMLObject DOM elements and free VertexText canvas backing store on cleanup, delegate texture deletion to `webgl.deleteTexture()` for complete GL resource release

## 1.1.1
* Fix orphaned WebGL buffers from equation layout's internal text measurement element that was never cleaned up on destroy
* Plumb `deleteTexture` parameter through the element cleanup chain so shared atlas textures are preserved during partial cleanup
* Reorder GLText cleanup to unsubscribe from atlas notifications before deleting buffers

## 1.1.0
* Fix WebGL buffer leak in `GLObject.fillBuffer()` — every GL primitive was leaking one GPU buffer per attribute on creation due to double `fillBuffer()` calls
* Update Playwright to v1.59.1

## 1.0.8
* Add basic LaTeX-to-FigureOne equation parsing via `latexToFigureOne()`
* Fix memory leaks when removing elements: `remove()` now calls `cleanup()` to release nested children, notification subscriptions, and WebGL buffers
* Fix `Gesture.destroy()` so event listeners are actually removed (double `.bind()` and wrong removal target)
* Add `WebGLInstance.cleanup()`, `TargetTexture.cleanup()`, and complete `Figure.destroy()` for proper resource release
* Fix `cleanupChildren()` bug that only cleaned up the first child element
* Fix `TargetTexture` framebuffer never being assigned to instance property

## 1.0.7
* Add configurable `antialias` and `atlasScale` options to Figure for WebGL anti-aliasing and atlas texture resolution control
* Add `atlasId` font option to share a single atlas texture across text elements with different sizes
* Fix atlas canvas memory leak by freeing backing store after GPU upload, and remove unintended debug border

## 1.0.6
* Fix doc links and improve TypeDoc generation with better @property rendering and {@link} resolution
* Remove unused canvas and texture data references in WebGL to allow garbage collection of atlas canvases

## 1.0.5
* Complete JS-to-TS migration for all test files
* Fix crash when canvas `getContext('2d')` returns null during atlas creation by retrying with smaller dimensions
* Add central error code registry for structured error messages

## 1.0.4
* Fix crash when an element is removed during a click or touch handler

## 1.0.3
* Fix crash when adding or drawing elements while WebGL context is lost
* Publish `contextLost` and `contextRestored` notifications on Figure for context lifecycle events

## 1.0.2
* Improve agent support

## 1.0.1
* Add agent support

## 1.0.0
* Migrate codebase from Flow to TypeScript
* Published TypeScript type declarations for public API
* No changes to runtime behavior or public API

## 0.15.11
* Add figure.gesturePreventDefault to customize how touch/mouse events are handled
* Add onClick event to Figure with bool for if an element is touched or not
* Add layoutForms notification for equations
* Limit iOS max canvas size to 16M

## 0.15.10
* Add drawNumber to GL object definition
* Add allowSetColor property to all elements so color can be frozen when needed

## 0.15.9
* Add letter spacing adjustments in GL fonts
* Fix element.getElement method to allow for periods in element names
* Equations allow expressions with '.' and numbers to have default math font styling (instead of just numbers)
* "()!:;' added to equation math font discrimination
* Add 'animated' notification to all elements fired after an animation frame is executed
* Fix crash when getElement is called on string with last char as a '.'
* Fix Equation lines baseline space and normal space to be scaled by scale

## 0.15.8
* Add ≤≥≠ glyphs to default math glyphs
* Fix yOffset adjustments to ascent and descent of lines equation element (seen when nesting line elements)

## 0.15.7
* Auto generated atlases will now have their dimension limited to the WebGL context max texture size
* Glyph definitions in OBJ_Font can now be arrays allowing combining preset and custom definitions

## 0.15.6
* Fix animation complete race condition when multiple equations are automatically automated between forms in a slide navigator
* Add long form division symbol for equations to be used with box

## 0.15.5
* Fix rearrange crash when using gl text rendering of equations without any forms
* Fix color animation delay in equation when color animates with position
* Add 'animate' option to `OBJ_SlideNavigatorSlide` to overwrite equation animation when using the `form` auto transition 

## 0.15.4
* `collections.rectangle` `getLabel` returns all labels instead of just the first formatted label


## 0.15.2
* Fix `collections.rectangle` `getLabel` error for when label is blank


## 0.15.1
* Enable html element primitive (beta)


## 0.15.0
* Add `EQN_Color` to color equation phrases and forms
* Automatic animation of color between equation forms added
* Add `ignoreColor` to form options to allow for external color setting of elements


## 0.14.0
* Text can be rendered on either 2D canvas or WebGL canvas
* OBJ_TextLine ('collections.textLine') and OBJ_TextLines ('collections.textLines) merged into OBJ_FormatedText ('ftext') which supports multi font, multi line, selected interactivity and embedded equations 
* Expansion of OBJ_Font to include options for underline, strikethrough (modified underline), outline, WebGL fonts, glyph defintions, and glyph modifications
* Add support for font atlases (for WebGL fonts) - both user defined and auto-generated
* Arbitrary FigureElements can be used as elements in Equations
* Add FontManager to watch font loading and query when fonts are available
* Add `'textureAlpha'` predefined shader - a shader that uses just the alpha channel of a texture
* Fix: `randInt` was not returning the max value
* Fix: `collections.angle` was not correctly rotating label when angle was part of a collection
* Add `randBool` to retrieve a random boolean


## 0.13.0
* Fix: `Collections.polyline.makeValid` isosceles triangle check now setting the correct sides to equal
* Add `'moved'` notification to `FigureElement` which is published when the element is moved by a user
* Add documentation for `Collections.plot.drawToPoint` and `Collections.plot.pointToDraw`
* Add `Collections.plot.setElementTo` and `Collections.plot.getPointAtElement`


## 0.12.2
* Fix: `COL_Plot.plotAreaLabels` was not setting position of y axis values correctly. This was fixed and an additional option `OBJ_PlotAreaLabelBuffer` was added to customize the buffer from the plot area border.


## 0.12.1
* Fix: Handle WebGL context loss more gracefully, and allow automatic restore


## 0.12.0
* Fix: `offset` property in collections.toggle now works for any location.
* Point class can now do component multiplication (`Point.mul()`), complex number multiplication (`Point.cmul()`), and complex number division (`Point.cdiv()`).
* Add `FigureElementPrimitiveGesture` ( `make: 'gesture'`) for zoom and pan handling
* Make `CollectionsAxis` and `CollectionsPlot` zoomable and pannable
* Add Solar System Example showing a pannable and zoomable plot
* Add Mandlebrot Set example showing the gesture primitive
* Make a `Scene` zoomable and pannable


## 0.11.2
* Add `isOn` and `isOff` to toggle


## 0.11.1
* Add Slider collection
* Add toggle switch collection
* Add matrix uniform to gl primitive
* Change OBJ_CameraControl.scene to OBJ_CameraControl.controlScene
* Add 3D Electric Field example


## 0.11.0
* Add the third dimension
* Remove `element.lastDrawTransform` making `getPosition` stateless and dependent on parents, not the last draw
* Update `Point` and `Line` with third dimension and various vector methods
* Transform
   - Simplify definitions
   - Add axis to `rotation` component
   - Add `direction`, `basis` and `basisToBasis` components
* Add `plane` geometry component
* Add element selection using a texture for 3D shapes
* Refactor bounds for cleaner API and 3D support
* Add `cameraControl` for user movement in 3D scene
* Rename limits to Scene and add 3D properties
* Add 3D Shapes: `cube`, `cone`, `prism`, `line3`, `sphere` `revolve`, `surface`, `axix3`
* Mid-level shape custom primitives are now `generic` and `generic3`
* Low level gl primitive is now `gl` and supports 2D, 3D and composable shaders
* API docs reorganization
* Add tutorials 20, 21 and 22 for 3D


## 0.10.14
* Bug Fix: When ivid was watched to end, playing ivid would restart audio but not slides
* Add `layout` property to equation form and default it to 'all' making equations rearrange themselves on every show


## 0.10.13
* Bug Fix: When figure is not on top of window stack, 'beforeDraw' notifications were not being sent


## 0.10.12
* Bug Fix: Recording state wasn't recording form property positionsSet, and default values of equation elements were left undefined


## 0.10.11
* Start playing video after audio starts instead of before
* Add two notifications `startingPlayback` and `startingPause` for players to switch state before recorder processing completes
* Bug Fix: Pulse settings was missing from recorder seek state in PulseAnimationStep


## 0.10.10
* Bug Fix: Remove console statement
* Bug Fix: Recorder playback of non-auto events not working with touchUp


## 0.10.9
* Bug Fix: Rare GL related bug that happens when using textures and drawn elements together on non-chrome browsers fixed
* Bug Fix: Global TouchUp events no longer interrupt cursor movements when a video is playing (bug introduced in 0.10.6)
* Bug Fix: Video is now automatically paused/played when headphones are removed/mounted
* Bug Fix: Video seek now correctly replays the current slide if seek time is equal to the slide time


## 0.10.8
* Add defaultAccent to lines
* Add customizable font metrics (need to check docs)
* Add showContent flag to equation container to create containers around elements without showing the elements


## 0.10.7
* Bug fix: When seeking backwards through a recording, the slide navigator doesn't go to the first slide unless the time is 0.


## 0.10.6
* Added lazylayout to equation forms which delays their layout till they are first shown. Using lazyLayout will shorten initial load time when many equation forms are being used, but will increase the size of video-track files when recording (the increase can be reduced by using `addReference` properties in slides where significant equation change happens).
* Bug fix: when using multiple `in` and `out` animation steps in slide transitions, the automatic showing/hiding of elements was sometimes not working in the correct order.
* Bug fix: mouse and touch up events are now tied to the window instead of the canvas preventing sticky touch down when a touch up happens outside of canvas.


## 0.10.5
* Include collections.rectangle width and height in state capture during recording
* Include state time in figure setState notification
* Add custom font measurement scaling for Open Sans font


## 0.10.4
* Add `disableOpacity` setting to SlideNavigator to control opacity of previous button when disabled
* Texture placeholder while loading is now clear


## 0.10.3
* Add verbose error reporting for equation functions and forms


## 0.10.2
* Add 'getState' notification to Figure before the recording state is captured for the figure
* Add 'getState' notification to FigureElement before the recording state is captured for the element


## 0.10.1
* Bug Fix - SlideShowNavigators now have unique global function map names for the transition so multiple slideshows can be in a figure.


## 0.10.0
* Add morph primitive for morphing hundreds of thousands of vertices efficiently.
* Add morphing helper functions:
   - pointsToShapes
   - polylineToShapes
   - imageToShapes
   - polygonCloudeShapes
   - circleCloudShapes
   - rectangleCloudShapes
   - getPolygonCorners


## 0.9.0

* Add `simple` property to element
* Make deceleration more efficient and able to support deceleration === 0
* Add GL primitive, that can define shaders, buffers and uniforms directly
* Add tutorial `Performance Optimization`
* Add example `Electric Field` for shader example


## v0.8.1

* Add arc primitive shape


## v0.8.0

API cleanup

* Options definition no longer requires a dedictated options object (though one can still be used)
* Options definition object `method` property renamed to make 
* All animation steps and animation builder steps now accept target as input as well as options definition object


## v0.7.4
* Fix recording states to ensure states are recorded after events when they occur at the same time


## v0.7.3
* Fix event handling bug that wasn't disabling screen scroll when moving elements


## v0.7.2
* Recorder class
   - Creation and playback of interactive videos
   - Allows recording of mouse movements
* FunctionMap class
   - Local and global maps of functions to unique string identifiers
* GlobalAnimation renamed to TimeKeeper
* TimeKeeper allows manual time steps and draw frames with `setManualFrames`
* SlideNavigator
   - Form and transitions can now be defined with an object
   - fromForm uses form definitions from prior slides
   - Accepts function maps
   - Now accepts all equation options in equationDefaults
* Add setToEnd in TriggerAnimationStep
* Get equation form and phrase elements with `getFormElements` and `getPhraseElements`
* Add element and elements to all animation steps
* Fix xAlign and yAlign for pulse animation step
* Fix inline symbol color definition (to not be overridden by equation color)
* Eight new tutorials on NotificationManager, SlideNavigator and Recorder
* Four new examples for Recorder (interactive video)


## v0.6.1
* Add `inTransition` flag to SlideNavigator
* Add clicked position in element.click
* Updates to automated testing of examples
* Add summary gif to main readme


## v0.6.0
* CollectionsLine.pointFromTo method added. Input two elements, and the line will be positioned between them.
* Add Equation.getPhraseElements and Equation.getFormElements to return an array of equation elements that make up a phrase or form
* Enable delay option in scenario animation step
* Add ability to cancel custom animation step from within the step instead of using a predetermined duration
* Fix pulse translation for different scales in a collection


## v0.5.2
* Add EQN_Lines function for making multi-line equations that can animate between lines.
* Add inSize property to EQN_Container for stacking elements on top of each other (so they can be animated out).
* Update EQN_*Symbol docs with more examples.
* Add tests for all equation api examples.
* figure.add and element.add now return an array of added elements.
* Lack of names for figure.add and element.add no longer raise an error. An auto generated name is used instead. 


## v0.4.0
* Added SlideNavigator and CollectionsSlideNavigator.
* Performance improvements in draw loop.
