# Relative time

[`@braw/how-ago`] is a package that simplifies the use of
`Intl.RelativeTimeFormat` API: it calculates how much time has passed between
two dates, and then chooses the most fitting unit to display that time.

Both [`@braw/compact-number`] and `@braw/how-ago` have the similar API, so the
process will be almost the same. Check out guide for `@braw/compact-number`, as
it goes more into details about how everything works.

[`@braw/how-ago`]: https://npm.im/@braw/how-ago

## Adding the package

Add the package using package manager of your choice:

:::code-group

```sh [npm]
npm install @braw/how-ago
```

```sh [pnpm]
pnpm add @braw/how-ago
```

```sh [yarn]
yarn add @braw/how-ago
```

:::

## Creating a plugin

Unlike [`@braw/compact-number`], we don't need to load any locale data and can
start creating plugin right away. Like with `@braw/compact-number`, we will
simply use controller to create computed property that we'll provide throughout
app.

[`@braw/compact-number`]: ./compact-numbers.md

```ts
// src/plugins/how-ago.ts
import { createFormatter, Formatter } from '@braw/how-ago'
import { IntlController } from '@braw/vue-intl-controller/controller'
import { inject, computed, InjectionKey, ComputedRef, Plugin } from 'vue'

const key: InjectionKey<ComputedRef<Formatter>> = Symbol('relativeTime')

export const plugin: Plugin<IntlController<any>> = (app, controller) => {
  const formatter = computed(() => createFormatter(controller.intl))
  app.provide(key, formatter)
}
```

And then the composable to actually inject the formatter:

```ts
export function useRelativeTime(): Formatter {
  const formatter = inject(key)

  if (formatter == null) throw new Error('Formatter is not initialised')

  return (...args) => formatter.value.apply(undefined, args)
}
```

## Installing the plugin

Just like `@braw/compact-number`, we will simply import the named `plugin`
export under a different name and then call `app.use`:

```ts
// src/main.ts
// …
import { plugin as relativeTimePlugin } from './plugins/how-ago.js' // [!code ++]
// …

await controller.waitUntilReady()

app.use(plugin)

app.use(compactNumbersPlugin, controller)

app.use(relativeTimePlugin, controller) // [!code ++]

// …
```

### Using the composable

You can now use `useRelativeTime` composable that we created in setup functions
to retrieve the formatting function:

```vue
<script setup>
import { useRelativeTime } from '../plugins/how-ago.js'

const formatRelativeTime = useRelativeTime()

const day = 86_400_000 // ms

const today = day * Math.floor(Date.now() / day)
const tomorrow = today + day
</script>

<template>
  <p>Today has began {{ formatRelativeTime(today) }}</p>
  <!--                  ⮩ "16 hours ago"            -->
  <p>Day ends {{ formatRelativeTime(tomorrow) }}</p>
  <!--           ⮩ "in 8 hours"                 -->
</template>
```
