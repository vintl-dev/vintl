# Setting up the plugin

VIntl can be used on its own, but is most useful when used as a plugin. The
plugin automatically sets up the controller and wires it to a specific Vue
application.

## Creating a plugin object

To install this plugin in Vue, we first need to create and configure our plugin.

In your Vue app entry point import `createPlugin` function.

```ts
import { createPlugin } from '@vintl/vintl/plugin'
```

Create a plugin instance using that function:

```ts
const plugin = createPlugin({
  controllerOpts: {
    defaultLocale: 'en-US',
    locale: 'en-US',
    locales: [
      {
        tag: 'en-US',
        meta: {
          displayName: 'American English',
        },
      },
    ],
  },
})
```

The options are above are merely for example, in fact they match the defaults
except for the `meta` of `en-US` locale.

Below are a few things you can do with options.

### Configuring controller

In example above you can see option `controllerOpts` being used to pass down
options meant for the controller. You can use any controller options in it,
which you can find on the
[Controller options page](../../api/controller/options.md).

### Disabling legacy mixin

In Vue 2 plugins would extend Vue object prototype to define global helpers.
This plugin used to do this too. In Vue 3, however, there is no Vue instance
anymore, therefore no prototype to extend. Instead, global properties now could
be added via the app options.

Unfortunately, this is incompatible with the way we do it — which is to define
actual getters rather than values with specific properties. Therefore, for Vue 3
we had to create a mixin that targets component creation lifecycle event where
it injects all the global helpers into `this`.

If you prefer using composables only, you can disable the legacy mixin by
setting option `globalMixin` to false.

### Additional injection sites

You can inject legacy getters into non-Vue objects, which can be useful if you
are using this plugin, with, say, Nuxt. In that case you could set `injectInto`
option to `[nuxtApp]` (where `nuxtApp` is your Nuxt App instance), this would
allow to use all the helpers like `$t` or `$i18n` outside of Vue.

## Installing the plugin

After creating the plugin, simply use it as an argument to Vue app's
[`use`](https://vuejs.org/api/application.html#app-use) method to apply the
plugin:

```ts
const app = createApp(App)

app.use(plugin) // [!code ++]

app.mount('#app')
```

And just like that plugin is installed.
