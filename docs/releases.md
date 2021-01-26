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
