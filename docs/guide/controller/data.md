---
outline: [2, 3]
---

# Accessing the controller data

The controller contains a number of useful getters that allow you to access the
current controller configuration, state, locale data and more.

:::tip

Most getters are reactive, this means that if you access their values in
reactive scope, you will be automatically subscribed to their updates.
[Learn more about reactivity in Vue →](https://vuejs.org/guide/extras/reactivity-in-depth.html)

:::

## Active configuration

### Locales

Locale tag for the currently used locale can be accessed with `locale` property.

```ts
console.log(`Currently used locale is: "${controller.locale}"`)

// Output: Currently used locale is: "en-US"
```

Additionally, you can see which locale is set as default with `defaultLocale`.

```ts
console.log(`Default locale is "${controller.defaultLocale}"`)

// Output: Default locale is "en-US"
```

If you are building a language selector, you'll find `availableLocales` property
helpful to find all of the locales that can be loaded by the controller.

```ts
const availableLocales = controller.availableLocales.map((locale) => {
  const displayName =
    locale.meta?.displayName ??
    new Intl.DisplayNames(controller.defaultLocale, { type: 'language' }).of(
      locale.tag,
    )

  return `${locale.tag} (${displayName})`
})

console.log(`Currently available locales:\n  ${availableLocales.join('\n  ')}`)

// Output:
//   Currently available locales:
//     en-US (American English)
//     en-GB (British English)
//     uk (Ukrainian)
//     de (German)
```

### Automation state

To check if automatic mode is turned on, you can check the `automatic` property.

```ts
if (controller.automatic) {
  console.log('Controller is managed automatically')
} else {
  console.log('Controller is managed by the user')
}

// Output: Controller is managed by the user
```

Additionally, you can query which locale is preferred by the browser with
`preferredLocale`. It will always return the tag for one of the defined locales
that is preferred by the automatic sources. If no automatic sources exist or
none of them can tell the preference, the default locale tag is returned.

```ts
console.log(`Navigator languages: ${navigator.languages.join(', ')}`)
console.log(`User prefers "${controller.preferredLocale}" locale`)

// Output:
//  Navigator languages: uk, de, en-GB, en-US
//  User prefers "uk" locale
```

## Intl

### `IntlShape`

The current `IntlShape` is accessible via `intl` property.

```ts
const inputNumber = 25_000
const result = controller.intl.formatNumber(inputNumber)
console.log(`Result of formatting ${inputNumber}: ${result}`)

// Output: Result of formatting 25000: 25,000
```

### Format aliases

`formats` property contains always up-to-date object with formatting function
from `IntlShape`.

```ts
const { formats: fmt, locale } = controller
const currentLocaleName = fmt.displayName(locale, { type: 'language' })
console.log(`Name of the current locale: ${currentLocaleName}`)

// Output: Name of the current locale: English (United States)
```

## Locale data

### Messages

Messages for the current locale can be accessed with `messages` property.
Similarly, messages for the default locale are available under `defaultMessages`
property.

```ts
console.log(`AST for "greeting" message: ${controller.messages.greeting}`)

// Output:
//   AST for "greeting" message: [
//  	{ type: 0, value: 'Hello, ' },
//  	{ type: 1, value: 'name' },
//  	{ type: 0, value: '!' }
//   ]
```

### Resources

Resources loaded by `localeload` event handlers can be accessed with `resources`
and `defaultResources`.

```ts
console.log(`A whole bunch of nothing: ${JSON.stringify(controller.resources)}`)

// Output: A whole bunch of nothing: {}
```

## Controller readiness

To check if the controller has finished loading the locale, you can access the
`ready` property. It will be `true` when the controller is ready. There's a
separate method to asynchronously wait until it's loaded.

```ts
console.log(`Controller is ${controller.ready ? 'ready' : 'not ready yet'}`)

// Output: Controller is ready
```
