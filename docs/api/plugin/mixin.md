# Mixin

The plugin has a way to install a global mixin, which provides a few helpful
getters to access commonly used controller methods and properties, as well as
the controller itself.

## `$i18n`

Controller instance can be accessed using `$i18n` getter, this can be useful,
for example, to check the current locale:

```vue
<template>Current locale is {{ $i18n.locale }}</template>
```

Which is equivalent to:

```vue
<script setup>
import { useI18n } from '@vintl/vintl'

const controller = useI18n()
</script>

<template>Current locale is {{ controller.locale }}</template>
```

## `$t`

`$t` is a getter to `formatMessage` function of the controller, it can be used
to format message.

```vue
<template>{{ $t('hello', { name: 'World' }) }}</template>
```

Which is equivalent to:

```vue
<script setup>
import { useTranslate } from '@vintl/vintl'

const translate = useTranslate()
</script>

<template>{{ translate('hello', { name: 'World' }) }}</template>
```

## `$fmt`

`$fmt` accesses `formats` property of the controller, which contains a
collection of the various formatting functions extracted from the active
`IntlShape`. It can be useful to quickly format a list or a date.

```vue
<template>Liked by {{ $fmt.list(['Alice', 'Bob', 'Eve']) }}</template>
```

Which is equivalent to:

```vue
<script setup>
import { useFormatters } from '@vintl/vintl'

const formats = useFormatters()
</script>

<template>Liked by {{ formats.list(['Alice', 'Bob', 'Eve']) }}</template>
```
