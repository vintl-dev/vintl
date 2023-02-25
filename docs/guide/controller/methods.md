---
outline: [2, 3]
---

# Using controller methods

The controller has a range of imperative APIs that can be used to manipulate its
current state and configuration.

## Managing locales

### Adding a locale

You may recall declaring locales when creating the controller. But what if we
wanted to add a locale later on. While this is not a recommended way to do that,
you absolutely can do that by using `addLocale` method.

`addLocale` is called with either a BCP 47 language tag or a locale descriptor
as an argument, additionally an argument `force` can be specified, which would
override an existing locale.

This method always returns a descriptor that has just been added, so if you've
passed a BCP 47 language tag, the return value will be newly created descriptor.

```ts
const canadianFrench = controller.addLocale('fr-CA')
canadianFrench.meta = {
  displayName: 'Canadian French',
}
```

### Removing a locale

If there is need to remove a locale, `removeLocale` method exists just to do
that. It tries to remove the locale with the provided BCP 47 language tag or
descriptor.

If you pass in a descriptor, it should match the descriptor of existing locale,
otherwise it won't be removed.

Just like `addLocale`, `removeLocale` returns a descriptor of the removed
locale, or `null`, if no locales were removed.

```ts
const removedLocale = controller.removeLocale(canadianFrench)
console.assert(removedLocale === canadianFrench)

// <No output>
```

### Getting locale descriptor

You can retrieve a locale descriptor with `getLocaleDescriptor` method.

It takes in a BCP 47 language tag of a locale. It then returns that locale's
descriptor or `undefined` if no locale with that tag exists.

:::info Mind the reactivity!

`getLocaleDescriptor` returns a reactive locale descriptor (proxy). This is used
to track the changes and does not affect the descriptor. However, it may cause
bugs with code that is not equipped to handle reactive objects.
[Learn more about reactivity in Vue →](https://vuejs.org/guide/extras/reactivity-in-depth.html)

:::

```ts
const britishEnglish = controller.getLocaleDescriptor('en-GB')
console.log(JSON.stringify(britishEnglish, null, 2))

// Output:
//   {
//     "tag": "en-GB",
//     "meta": {
//       "displayName": "British English"
//     }
//   }
```

### Managing messages

To add or delete messages for a locale, use `addMessages` method.

It takes in a BCP 47 tag of an existing locale, or a locale descriptor, and an
object containing messages to assign.

Because it assigns the messages, any properties that have `undefined` value will
effectively delete the messages with the corresponding keys.

```ts
const pirateEnglish = controller.addLocale({
  tag: 'en-x-pirate',
  meta: {
    displayName: 'Pirate English',
  },
})

controller.addMessages(pirateEnglish, {
  removeMe: undefined,
  greeting: 'Ahoy, {name}!',
})
```

## Controller state

### Changing the current locale

To change locale there is `changeLocale` method.

It takes in a locale code or a descriptor of an existing locale. Locale code can
be `auto`, in which case the automatic mode will be turned off and locale will
be switched to one of the preferred by the user.

The return value of this method will be a Promise that will resolve after a
successful locale change, it will be rejected if locale change gets cancelled or
there is an error applying the locale.

```ts
console.log(`Current locale is: ${controller.locale}`)

await controller.changeLocale('uk')

console.log(`Locale after change is: ${controller.locale}`)

// Output:
//   Current locale is: en-US
//   Locale after change is: uk
```

### Waiting for the current locale to load

There is a number of situations where you need to wait for controller to
(re-)initialise:

- After changing to a different locale;
- After overriding the current locale;
- When preferred locale changes naturally or due to sources change.

As you could've learnt on the previous page —
[Accessing the controller data](data.md) — there's `ready` getter. However you
cannot just wait in a `while` loop until it returns `true`, because that would
halt your application, and even if it didn't, `ready` would remain `false` if
locale would fail to load.

`waitUntilReady` method was created to solve exactly that. And if you've
followed plugin setup, you probably seen it used or even used it yourself
already.

It returns a promise that will resolve after the controller has finished loading
the current locale, and now is ready to use. It will also reject if there's an
error.

```ts
controller.changeLocale('en-GB')

await controller.waitUntilReady()
```

## Managing preferred locale sources

### Adding a source

To add a preferred locale source you can use `addSource` method.

It accepts a source and optionally a `prepend` boolean argument. The source then
added either at the end or in the beginning of the sources list (depending on
whether the `prepend` is `true`).

If the source that is being added already exists, it will be removed before
adding again.

```ts
const germanSource = {
  prefers: 'de',
}

controller.addSource(germanSource)

console.log('Preferred locale after adding: %o', controller.preferredLocale)

controller.addSource(germanSource, true)

console.log('Preferred locale after prepending: %o', controller.preferredLocale)

// Output:
//   Preferred locale after adding: uk
//   Preferred locale after prepending: de
```

### Removing a source

Preferred locale sources can also be removed with `removeSource` method. It
accepts only a source to be deleted and doesn't return anything.

```ts
controller.removeSource(germanSource)

console.log('Preferred locale after removing: %o', controller.preferredLocale)

// Output: Preferred locale after removing: uk
```
