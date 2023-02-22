# vue-intl-controller

> A plugin for Vue 3 to dynamically control [`@formatjs/intl`](https://npm.im/@formatjs/intl).

## Summary

[`@formatjs/intl`](https://npm.im/@formatjs/intl) allows to easily implement localisation using ICU MessageFormat messages.

However, using it in Vue in dynamic manner is not an easy task if you want to preserve most of its functionality and more. This package was created to solve this.

It is created with extensibility in mind, so you can extend upon it and add support for it in other frameworks, like Nuxt (module for Nuxt is being worked on). On your disposal events, asynchronous loading mechanism and even some of the internals exposed.

As a consumer, there's a mixing that adds helpers like `$t`, `$fmt` and `$i18n` to your components (can be turned off), as well as `useI18n()` composable. There's also `<IntlFormatted>` component, which allows to use components while formatting the messages.

Written in TypeScript, ambient type extension is possible for better type checking to the point where entire arguments used in messages can be type checked!

## Installation and usage

### Installation

Install using your package manager of choice:

**npm**

```sh
npm i @braw/vue-intl-controller
```

**pnpm**

```sh
pnpm i @braw/vue-intl-controller
```

**yarn**

```sh
yarn add @braw/vue-intl-controller
```

### Usage

In your Vue app entry point import `createPlugin` function.

```ts
import { createPlugin } from '@braw/vue-intl-controller/plugin'
```

Create a plugin instance (you can do that inline, without variable):

```ts
const plugin = createPlugin({
  // Options for the controller instance.
  controllerOpts: {
    // All locale tags must be valid BCP 47 language tags.

    // Tag for the default locale. Must be one of the defined locales' tags.
    defaultLocale: 'en-US',

    // Tag for the currently used locale. Must also be defined in locales.
    locale: 'en-US',

    // All defined locales.
    locales: [
      {
        // BCP 47 tag for the locale.
        tag: 'en-US',

        // Any meta information that is available even if locale is not loaded.
        // Must be JSON encode-able.
        meta: {
          displayName: 'American English',
        },
      },
    ],
  },

  // Whether to inject $t, $fmt and $i18n properties on components' creation.
  globalMixin: true,

  // Additional injection sites like Vuex store or Nuxt app.
  injectInto: [],
})
```

Those are example options, in fact you can completely skip most of them, because they're already like that by default (except for `meta` of `en-US` locale).

If you need, you can access properties by injecting them into a temporary object:

```ts
const { $fmt, $i18n, $t } = Object.defineProperties({}, plugin.getInjections())
```

Install plugin into your Vue app:

```ts
// ...
const app = createApp(App)

app.use(plugin)
```

You can now use all of the plugin's features:

```vue
<script setup>
import { useI18n } from '@braw/vue-intl-controller'
import { defineMessages } from '@formatjs/intl'
import { IntlFormatted } from '@braw/vue-intl-controller/components'

const messages = defineMessages({
  today: {
    id: 'today',
    defaultMessage: 'Today is {date}'
  }
  motd: {
    id: 'motd',
    defaultMessage: 'Message of the day',
  },
  greeting: {
    id: 'greeting',
    defaultMessage: 'Hello, {name}!',
  },
})

const { formatMessage: translate, formats: fmt } = $(useI18n())
</script>

<template>
  <h2>
    {{
      translate(messages.today, {
        date: fmt.date(Date.now(), {
          dateStyle: 'long',
          timeStyle: 'medium',
        }),
      })
    }}
  </h2>
  <h3>{{ translate(messages.motd) }}</h3>

  <IntlFormatted :message-id="messages.greeting">
    <template #~name>
      <strong>World</strong>
    </template>
  </IntlFormatted>
</template>
```

## Messages loading

`IntlController` uses event-based approach to handling loading of messages. Whenever locale change is accepted, the controller fires a `LocaleLoadEvent`. It is asynchronous, so your listener function may return a promise and it will prompt controller to wait before calling any other listeners.

> **Note**
> There is approach to add messages that does not involve events, keep reading to learn more.

If you created plugin, you can access controller using `getOrCreateController` function. As name implies, the controller is initialised lazily, whenever you try to install the plugin to Vue or call any of the getters like `getInjections` or `getOrCreateController`.

```ts
const controller = plugin.getOrCreateController()
```

You can then load messages rudimentary way:

```ts
const messages = {
  'en-US': {
    greeting: 'Hello, {name}!',
  },
  de: {
    greeting: 'Hallo {name}!',
  },
  uk: {
    greeting: 'Привіт, {name}!',
  },
}

controller.addEventListener('localeload', (e) => {
  if (e.locale in messages) e.addMessages(messages[e.locale])
})
```

Or you can use `import` functions. And if you use webpack, you can even split those imports in chunks to avoid sending unneeded data to client:

```ts
const messagesMap = {
  'en-US': () =>
    import(
      /* webpackChunkName: "locale-en-US", webpackMode: "lazy" */ './i18n/en-US.json'
    ),
  uk: () =>
    import(
      /* webpackChunkName: "locale-uk", webpackMode: "lazy" */ './i18n/uk.json'
    ),
}

controller.addEventListener('localeload', async (e) => {
  if (e.locale in messagesMap) {
    const messagesImport = await messagesMap[e.locale]()
    e.addMessages(messagesImport.default)
  }
})
```

### More to events

There are two more events that you may want to know about:

- `error` is called when any error occurs in controller's event target. If there are no listeners to that event then all listener errors are logged to console.
- `localechange` is called when locale is about to change. It can be cancelled, then locale will remain as it is and the initiator of locale change will receive an error.
- `afterlocalechange` is called after the locale has been applied.

Event listeners can have a priority, in case you need to load messages or data in certain order, it is specified in an object passed as third argument to `addEventListener`. They also can be called only once, and regardless of whether the event has been cancelled or not.

```ts
controller.addEventListener(
  'localechange',
  (e) => {
    if (e.locale === 'en-x-placeholder') e.cancel()
  },
  { priority: 100 },
)

controller.addEventListener(
  'localechange',
  (e) => {
    if (e.canceled) {
      console.warning(`locale change to ${e.locale} has been cancelled!`)
    } else {
      console.log(`locale is now going to change to ${e.locale}`)
    }
  },
  {
    priority: -99999, // like super super unimportant
    always: true,
  },
)

controller.addEventListener(
  'error',
  (e) => {
    console.error('controller event target error', e.error)
  },
  { once: true },
)
```

## Controller

The controller is an object returned by `createController` function. It is not the class, but an object that combines all the reactive partials together. This object is typed as `IntlController<T>` and all of the properties and methods are thoroughly documented. Most important ones are highlighted below.

### Imperative management

You can imperatively create locales instead of declaring them:

```ts
const britishEnglish = controller.addLocale('en-GB')
britishEnglish.meta = {
  displayName: 'British English',
}
```

As well as imperatively remove those locales:

```ts
const removedLocale = controller.removeLocale('en-GB')
console.assert(britishEnglish === removedLocale)
```

To add messages to the locales use `addMessages`, it accepts both locale tag and descriptor. Under the hood it assigns messages, so you can also remove messages with it by providing `undefined` as a value for any key.

```ts
const pirateEnglish = controller.addLocale('en-x-pirate')
controller.addMessages(pirateEnglish, {
  removeMe: undefined,
  greeting: 'Ahoy, {name}!',
})
```

### Properties

Many getter properties are provided at your convenience to access the current state of the controller via `ready`, `automatic`, `locale`, `defaultLocale`, `preferredLocale`. Active `IntlShape` is exposed through `intl` property.

Messages and resources for the current and default locale are accessible as well via `messages`, `defaultMessages`, `resources` and `defaultResources`

`formats` matches the `$fmt` property returned by the plugin.

If you need to accept locale properties use `intlLocale`, it returns [`Intl.Locale`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale) object for the active locale. This can be used to check if language is English, for example:

```ts
// The following will match en-US, en-GB, en-CA, en-x-pirate, etc.

if (controller.intlLocale.language === 'en') {
  console.log('Uses English')
}
```

## Automation

Browsers tell sites which languages user prefers. For this purpose automation API was added to the controller. It works by defining multiple sources which tell the currently used locale.

By default there are no sources, but the package is shipped with two sources that you can set up client and server side:

On server:

```ts
import { useAcceptLanguageHeader } from '@braw/vue-intl-controller/source/header'

const headerSource = useAcceptLanguageHeader(req.headers['Accept-Language'])

controller.addSource(headerSource)
```

On client:

```ts
import { useNavigatorLanguage } from '@braw/vue-intl-controller/source/navigator'

controller.addSource(useNavigatorLanguage())
```

To create a custom source implement `PreferredLocalesSource` interface, it is an object or a class that has `prefers` property which is either an array of strings or `null` or Vue's reference to these, if your preferences update dynamically. It can also contain `install` and `uninstall` methods, these are called when source is first initialised or when it's imperatively removed.

<details>
<summary>Example of custom source</summary>

```ts
import { ref } from 'vue'

function createCustomSource(locales: string[]) {
  const prefers = ref(null as string[] | null)

  function install() {
    prefers.value = locales
  }

  function uninstall() {
    prefers.value = null
  }

  return {
    prefers,
    install,
    uninstall,
  }
}
```

</details>

## Strict type checking with TypeScript

> **Warning** This is an experimental feature.

You can declare your messages by creating an ambient declaration file where you need to import `@braw/vue-intl-controller`, so that you can extend global namespace `VueIntlController` containing the following declarations:

- `interface` `MessageValueTypes`

  A map of all usable objects within translation functions and components.

- `interface` `CustomMessages`

  A map of custom messages mapped to arguments within those messages.

  Declaring this map will enable strict type-checking across all usage of Vue Intl Controller functions. Partial message declaration is not supported yet, alas.

- `interface` `LocaleMeta`

  A map of all meta properties for the locales, these are always accessible through locale descriptors.

- `interface` `LocaleResources`

  A map of locale resources provided by the load event listeners.

<details>
<summary>Example</summary>

Create a file called along the lines of `i18n.d.ts`, and inside of it write:

```ts
// Makes sure TypeScript knows what we extend:
import '@braw/vue-intl-controller'

// Helper types:
import type {
  SelectArgument,
  ValueArgument,
} from '@braw/vue-intl-controller/types/arguments'

// Example piece of 'your' code:
import type { ExampleObject } from '~/utils/convertibleObject.ts'

declare global {
  namespace VueIntlController {
    interface MessageValueTypes {
      // key doesn't matter as long as it does not collide with other key;
      // the interface used here solely for extensibility since you cannot
      // extend type or particular interface keys
      __example__object: ExampleObject
    }

    interface CustomMessages {
      // {type, select, greeting {Hello} goodbye {Goodbye} other {Ey}}, {name}
      'general.message': {
        /** Type of the message. */
        type: SelectArgument<'greeting' | 'goodbye' | 'other'>

        /** Name of the addressed person. */
        name: ValueArgument
      }
    }

    interface LocaleMeta {
      /** Name of the locale translated to the locale's name. */
      displayName: string

      /** Name of the locale written in English. */
      englishName: string

      /** Percentage of translation coverage across all documents and files. */
      translatedPercentage: number
    }

    interface LocaleResources {
      /** Markdown markup containing explanation of our payout terms. */
      payoutExplanation: string

      /** Markdown markup containing our terms of service. */
      termsOfService: string

      /** Markdown markup containing our privacy policy. */
      privacyPolicy: string

      /** A map of translated language names. */
      languageNames: Record<string, string>
    }
  }
}
```

</details>
