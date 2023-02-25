# Plugin options

There a few options that you can configure in plugin to better fit your usage.

## `controllerOpts`

Represents an object that contains all the configuration for the controller.

These options are listed on a [separate page](../controller/options.md).

## `globalMixin`

**Default**: `true`

A boolean value that governs whether the mixin is used to inject global
properties.

In Vue 2 you could define global injections, available across all Vue instances.
In Vue 3 this has been removed and replaced with app options for global
properties.

Due to how injections in this plugin are implemented, these are not compatible
with global properties option [(1)]. Instead a global mixin created that would
inject all the helpers during component creation.

If you use composition API only and fine with using `useI18n` every time, you
can disable this.

[(1)]: https://github.com/vuejs/core/issues/2917

## `injectInto`

**Default**: `[]`

An array with objects into which to inject the global helper functions and
getters, like with mixin.

For example, if you are creating a Nuxt plugin, you can use `[nuxtApp]`, which
would inject all the properties into `nuxtApp` when the plugin is created.

If you don't like this approach, there is a way to manually inject properties,
see [Manual injection](../../guide/plugin/plugin.md#manual-injection) section on
plugin object page.
