# Releases

## v0.4.0
* Added SlideNavigator and CollectionsSlideNavigator.
* Performance improvements in draw loop.

## v0.5.2
* Add EQN_Lines function for making multi-line equations that can animate between lines.
* Add inSize property to EQN_Container for stacking elements on top of each other (so they can be animated out).
* Update EQN_*Symbol docs with more examples.
* Add tests for all equation api examples.
* figure.add and element.add now return an array of added elements.
* Lack of names for figure.add and element.add no longer raise an error. An auto generated name is used instead. 

## v0.6.0
* CollectionsLine.pointFromTo method added. Input two elements, and the line will be positioned between them.
* Add Equation.getPhraseElements and Equation.getFormElements to return an array of equation elements that make up a phrase or form
* Enable delay option in scenario animation step
* Add ability to cancel custom animation step from within the step instead of using a predetermined duration
* Fix pulse translation for different scales in a collection

## v0.6.1
* Add `inTransition` flag to SlideNavigator
* Add clicked position in element.click
* Updates to automated testing of examples
* Add summary gif to main readme


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

## v0.7.3
* Fix event handling bug that wasn't disabling screen scroll when moving elements

## v0.7.4
* Fix recording states to ensure states are recorded after events when they occur at the same time

## v0.8.0

API cleanup

* Options definition no longer requires a dedictated options object (though one can still be used)
* Options definition object `method` property renamed to make 
* All animation steps and animation builder steps now accept target as input as well as options definition object

## v0.8.1

* Add arc primitive shape

## 0.9.0

* Add `simple` property to element
* Make deceleration more efficient and able to support deceleration === 0
* Add GL primitive, that can define shaders, buffers and uniforms directly
* Add tutorial `Performance Optimization`
* Add example `Electric Field` for shader example

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

## 0.10.1
* Bug Fix - SlideShowNavigators now have unique global function map names for the transition so multiple slideshows can be in a figure.

## 0.10.2
* Add 'getState' notification to Figure before the recording state is captured for the figure
* Add 'getState' notification to FigureElement before the recording state is captured for the element

## 0.10.3
* Add verbose error reporting for equation functions and forms

## 0.10.4
* Add `disableOpacity` setting to SlideNavigator to control opacity of previous button when disabled
* Texture placeholder while loading is now clear

## 0.10.5
* Include collections.rectangle width and height in state capture during recording
* Include state time in figure setState notification
* Add custom font measurement scaling for Open Sans font

## 0.10.6
* Added lazylayout to equation forms which delays their layout till they are first shown. Using lazyLayout will shorten initial load time when many equation forms are being used, but will increase the size of video-track files when recording (the increase can be reduced by using `addReference` properties in slides where significant equation change happens).
* Bug fix: when using multiple `in` and `out` animation steps in slide transitions, the automatic showing/hiding of elements was sometimes not working in the correct order.
* Bug fix: mouse and touch up events are now tied to the window instead of the canvas preventing sticky touch down when a touch up happens outside of canvas.