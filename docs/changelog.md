# Releases

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
