In no particular order.

* Equation:
  - Allow form animation to be any order of dissolve in/out and move
  - Fix equation spacings to be independent of font size
  - Create an equation function that modifies the color of the content: { color: [content, TypeColor] },
    - in form.animationPositionsTo treat color like transforms (first capture the current colors, then set the form colors, then reset the current colors and animate to the new colors)
  - Consider removing color from elementMods for non-glyphs as only EQN_Color should be used and if using both it get's funky.
  - Forms with color mods only impact that form - all other forms use the default color

* Fonts:
  - Recreate atlases on significant resize
  - Remove atlas canvases once used

* Add a text input collection
  - Can be filled from keypresses or custom keyboard
  - Limit characters that can be displayed (e.g. number only)

* Add a custom keyboard input collection
  - allow keys and layout to be defined so can be just a calculator, or a full keyboard

* Add a multiple choice collection allowing customization of:
  - Number of choices
  - Vertical, horizontal or grid layout
  - Location of text relative to selector
  - Selector style (circles, checks, custom, buttons with text inside)

* Text:
  - Add auto linebreaks to ftext

* Make `TypeParsableRect` accept object definition (left, bottom, top, right, width, height, position, xAlign, yAlign)
* Add elements tied to some plot value to a `Collections.plot` - they would be updated similar to traces
* Add a colorMap to a surface plot for z dependant color
* Merge in new Recorder and Player from ivid-wave
* Add an image primitive
* Replace polygon figure element in `Collections.angle` with arc primitive
* Fix rotation velocity in Fig1 of Traveling Wave 02 (press the sine wave link)
* Make touchBorder and isTouchable in equation elements api just touch (see Fig4 of Traveling Wave 02)
* Traveling Wave 03 where are the snapshots after “touch freeze”?



