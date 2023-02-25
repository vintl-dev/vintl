# The controller concept

Controller is an object that exposes methods to dynamically control and interact
with the `IntlShape` object, as well as getters to access the current controller
state and additional locale data.

## Controller is not a class

When you create a controller, you do not create a class; instead, multiple
partials that are separated by their concerns are initialised and then stitched
together to create the controller object.

None of the members of the controller object use `this`, so most of them can be
safely extracted and used on their own if needed.

The choice to use object rather than class comes from maintainability concerns:
a big class is much harder to navigate and decouple.

Other advantages include better support for minification: internal variables and
functions can be easily mangled without breaking anything, while class
properties usually retain their names.
