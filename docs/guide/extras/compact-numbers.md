# Compact numbers

[`@vintl/compact-number`](https://npm.im/@vintl/compact-number) is a package
that allows to properly choose a plural when displaying numbers in compact
notation. Previously it was a part of VIntl, however it was removed in v4. This
guide will explain how to add it back.

## Adding the package

Add the package using package manager of your choice:

:::code-group

```sh [npm]
npm install @vintl/compact-number
```

```sh [pnpm]
pnpm add @vintl/compact-number
```

```sh [yarn]
yarn add @vintl/compact-number
```

:::

## Loading locale data

To work, `@vintl/compact-number` requires certain CLDR data. This data can be
added by simply importing `@vintl/compact-number/locale-data/[locale]`.

Loading data for all locales at the same time will not be size efficient.
Instead we can use `localeload` event specifically designed to load locale data:

```ts
// src/main.ts

// …

const plugin = createPlugin({
  listen: {
    async localeload(e) {
      switch (e.locale.tag) {
        case 'en-US':
        case 'en-GB':
          await import('@vintl/compact-number/locale-data/en')
          break
        case 'uk':
          await import('@vintl/compact-number/locale-data/uk')
          break
        case 'de':
          await import('@vintl/compact-number/locale-data/de')
          break
      }

      // …
    },
  },
})
```

If you are using tool like Vite you can shorted this to two lines:

```ts
const plugin = createPlugin({
  listen: {
    async localeload(e) {
      const locale = new Intl.Locale(e.locale.tag).minimize().toString()
      await import(
        `../node_modules/@vintl/compact-number/dist/locale-data/${locale}.mjs`
      )

      // …
    },
  },
})
```

## Creating a plugin

To connect everything together, we need to write a simple plugin that will
reactively create a formatter for the active `IntlShape` and allow us to
retrieve and use it through a composable.

Most getters of IntlController are in fact reactive, so they will subscribe us
for updates if we are in reactive scope. Therefore we can simply use
[`computed`] and create formatter inside it using `IntlShape` acquired through
getter `controller.intl`.

[`computed`]: https://vuejs.org/api/reactivity-core.html#computed

```ts
// src/plugins/compact-numbers.ts
import { createFormatter, Formatter } from '@vintl/compact-number'
import { IntlController } from '@vintl/vintl/controller'
import { inject, computed, InjectionKey, ComputedRef, Plugin } from 'vue'

const key: InjectionKey<ComputedRef<Formatter>> = Symbol('compactNumber')

export const plugin: Plugin<IntlController<any>> = (app, controller) => {
  const formatter = computed(() => createFormatter(controller.intl))
  app.provide(key, formatter)
}
```

And then we'll implement the composable, in which we inject the value for the
key we provided app-wide, and then create a function to forward all calls to the
current value of our computed reference.

```ts
export function useCompactNumbers(): Formatter {
  const formatter = inject(key)

  if (formatter == null) throw new Error('Formatter is not initialised')

  return (...args) => formatter.value.apply(undefined, args)
}
```

## Install the plugin

Install the plugin using [`app.use`], it will call our `plugin` install function
with the argument that we pass to `app.use` call, which should be our
controller.

[`app.use`]: https://vuejs.org/api/application.html#app-use

```ts
// src/main.ts
// …
import { plugin as compactNumbersPlugin } from './plugins/compact-numbers.js' // [!code ++]
// …

await controller.waitUntilReady()

app.use(plugin)

app.use(compactNumbersPlugin, controller) // [!code ++]

// …
```

## Using compact numbers

Now we can use `useCompactNumbers` composable in our setup script and then use
its return value to format any number:

<!-- prettier-ignore -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { defineMessage } from '@formatjs/intl'
import { useI18n } from '@vintl/vintl'
import { useCompactNumbers } from '../plugins/compact-numbers.js' // [!code hl]

const count = ref(0)

const { formatMessage } = useI18n()

const compactNumber = useCompactNumbers() // [!code hl]

const userCount = defineMessage({
  id: 'example.user-count',
  defaultMessage: '{count, plural, one {{count} user} other {{count} users}}',
  description: 'Do not use pound element (#) in plural clauses!',
})
</script>

<template>
  <h1>{{ formatMessage(userCount, { count: compactNumber(count) }) }}</h1> // [!code hl]
  <div>
    <button type="button" @click="count -= 100">-100</button>
    <button type="button" @click="count -= 1">-1</button>
    <button type="button" @click="count += 1">+1</button>
    <button type="button" @click="count += 100">+100</button>
  </div>
  <div>
    <button type="button" @click="count = 0">Clear</button>
  </div>
</template>
```

Click the <kbd>+100</kbd> button at least 10 times, and it should change to 1K.
