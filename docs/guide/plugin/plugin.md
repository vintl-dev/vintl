# Additional plugin uses

Plugin instance can be used to install the plugin via the `app.use` method, but
it can also be used on its own to access several useful methods.

## Accessing controller instance

The controller instance maintained by this plugin can be accessed at any time
using the `getOrCreateController()` method. As the name implies, if the plugin
is not installed, the controller will be instantiated and returned during this
call.

For example, it may be necessary to wait for the controller to be ready before
actually mounting the application:

```ts
const app = createApp(App)

await plugin.getOrCreateController().waitUntilReady() // [!code hl]

app.use(plugin)

app.mount('#app')
```

## Manual injection

You can use the plugin instance to access the global injections with the
`getInjections` method. The return value of calling this method is an object
with property descriptors that can be applied to any object using
[`Object.defineProperties`]:

```ts
const myObject = {}

Object.defineProperties(myObject, plugin.getInjections())

myObject.$t('hello', { name: 'World' })
```

[`Object.defineProperties`]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties

::: info All injections are available as controller properties

You don't need to inject helper properties manually to access things like the
`formatMessage` function! The getters for these are available on the controller
instance. This mechanism is there for when you need precise control over
injections.

:::

See the [Mixin page](../../api/plugin/mixin.md) to see what global helpers are
available.
