# Migrating to v4

Version 4 of VIntl brings a lot of big and small changes, but overall attempts
to maintain the familiar API. We except major changes in API to happen in the
next versions.

Here's what changed in this version and how you can migrate:

## Moving to VIntl name

Previously this package was distributed under the name
`@braw/vue-intl-controller`, however in v4 its name has been changed to
`@vintl/vintl`, so it is less verbose and shorter.

To continue receiving updates, please re-install the package:

:::code-group

```sh [npm]
npm rm @braw/vue-intl-controller
npm install @vintl/vintl
```

```sh [pnpm]
pnpm rm @braw/vue-intl-controller
pnpm add @vintl/vintl
```

```sh [yarn]
yarn remove @braw/vue-intl-controller
yarn add @vintl/vintl
```

:::

## Switch to Vue 3

Vue 2 is now in maintenance mode and will reach its EOL by the end of the year.
Since this package was created for [Modrinth], which is switching to Nuxt 3 soon
(and Vue 3 accordingly), it's not worth the effort to maintain the Vue 2 version
anymore.

This package now has been updated to support Vue 3 and it's the only version
that will be supported going further.

[Modrinth]: https://github.com/modrinth

## Removal of `@braw/extended-intl`

`@braw/extended-intl` has been deprecated and its dependency was removed, VIntl
now does not ship compact number and relative time difference formatting
functionality. These are provided via separate packages —
[`@braw/compact-number`] and [`@braw/how-ago`] and must be set up manually.

[`@braw/compact-number`]: ../extras/compact-numbers.md
[`@braw/how-ago`]: ../extras/relative-time.md

## Distribution changes

The package is no longer built to CJS format, since it becomes notoriously hard
to support it. We advise to switch to ESM or use a transpiler/bundler that
supports ESM to CJS compilation.

Babel is no longer used to transpile usage of newer syntax like nullish
coalescing operator or optional chaining. Your bundler should be able to (or
probably can be configured to) do this for you.

## Changes to type definitions

- Locale descriptors now use property `tag` instead of `code` to properly
  reflect that those are BCP 47 language tags rather than any codes.

- Collectable events have their type definition for `collect()` method stripped,
  though it still remains there and will cause problems if used.

- `values` parameter in translate function is now optional, even though it
  doesn't always match the reality. Be sure to check the resolved types.

## Functional components

Both `IntlFormatted` and `Fragment` components were changed to be function
components as functional components using options API have been removed in
Vue 3. This normally should not affect you, but it is important to outline.

## Composables

Both `useFormatters` and `useTranslate` composables have been deprecated and
will be removed in the future major updates.

This is because after upgrading to Vue 3 they serve solely as the functions
aliasing properties of `useI18n` return that can be acquired directly. E.g.:

```js
const formatMessage = useTranslate()
const formats = useFormatters()
```

is the same as:

```js
const { formatMessage, formats } = useI18n()
```

## Plugin

### Global component plugin option removed

`globalComponent` option for the plugin has been removed since it's incompatible
with ES modules.

To keep it globally you can manually import it and set as component on your Vue
instance:

```js
import { IntlFormatted } from '@vintl/vintl/components'
app.component('IntlFormatted', IntlFormatted)
```

Fragment can be globally registered as well:

```js
import { Fragment } from '@vintl/vintl/components'
app.component('Fragment', Fragment)
```

### Deprecation of `toProperties` method of plugin object

`toProperties` method of the plugin object has been deprecated and will be
removed in the next major versions. Instead you can access methods directly on
the controller or use `Object.defineProperties` and `getInjections` to create
properties object:

```js
Object.defineProperties(Object.create(null), plugin.getInjections())
```

## Fallback message order

`defaultMessageOrder` is the new controller option that sets order in which the
default message (as fallback) is fetched. By default it uses message descriptor,
yielding that message if parser is not removed, or nothing, if message
descriptor is not provided, yielding just message ID.
