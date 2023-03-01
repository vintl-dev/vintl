# Configuring the controller

VIntl can be configured to use a different locale by default, or even use
automatic sources to set the active locale.

There are two ways of configuring the controller — declarative and imperative:
the first applies to the instantiation of the controller, the second can be used
to tweak the controller after it has already been instantiated. Here we explore
the declarative options.

## Adding locales

If you want to add additional locales, you can use the `locales` property to
provide an array of locale descriptors, objects that define the locale tag, and
metadata associated with that locale, which is available even before the locale
is loaded.

```ts {2-27}
createController({
  locales: [
    {
      tag: 'en-US',
      meta: {
        displayName: 'American English',
      },
    },
    {
      tag: 'en-GB',
      meta: {
        displayName: 'British English',
      },
    },
    {
      tag: 'uk',
      meta: {
        displayName: 'Ukrainian',
      },
    },
    {
      tag: 'de',
      meta: {
        displayName: 'German',
      },
    },
  ],
})
```

## Changing the default locale

To change the default locale, the `defaultLocale` option can be used. It is
expected to be a tag of one of the declared locales.

The default locale is used for the following:

- If the message is missing in the current locale, then the message for the
  default locale is used instead;
- If there are no automatic sources or all of them do not return the current
  locale, then the default locale is returned instead;
- To provide the default locale messages and resources.

The default locale is essentially a language in which your application is
written, it is expected that this locale will contain all messages and resources
used in the application.

```ts
createController({
  // …
  defaultLocale: 'en-US', // [!code hl]
})
```

## Changing the active locale

The `locale` option can be used to specify the locale used to format messages,
numbers and other things. Just like `defaultLocale`, it is expected to be a tag
for one of the declared locales.

```ts
createController({
  // …
  locale: 'en-GB', // [!code hl]
})
```

## Adding sources for preferred locale

Preferred locale is a locale preferred by the user, provided by their browser.
To get a preferred locale, an automatic source is used, which we will explore on
a separate page.

For now, you can use the `preferredLocaleSources` option, which takes an array
of all sources, to specify all sources for the preferred locale.

```ts
import { useNavigatorLanguage } from '@vintl/vintl/source/navigator'

createController({
  // …
  preferredLocaleSources: [useNavigatorLocale()], // [!code hl]
})
```

## Enabling use of the preferred locales

To use the preferred locale when initialising the controller, change the
`usePreferredLocale` option to `true`.

It is highly recommended to use preferred locale sources if you don't know the
user's locale (e.g. it is not stored in the cookies or local storage).

## Subscribe to events early

You can subscribe to events just before the controller is initialised using the
`listen` option. This is useful for subscribing to events that are called during
the first initialisation, such as `localeload`.

The `listen' option is an object where the property names are event names
(lowercase) and the values of these properties are either an array of listener
items or a single listener item.

Listener items can be either an event listener function or an object containing
a method called `listener` and optionally an object under the `options` property
containing listening options such as whether the event listener should be called
only once, use a different priority, or be called even after the event is
cancelled.

```ts {3-32}
createController({
  // …
  listen: {
    localeload(e) {
      let myMessage
      switch (e.locale.tag) {
        default:
          myMessage = 'This is my message!'
          break
        case 'uk':
          myMessage = 'Це моє повідомлення!'
          break
        case 'de':
          myMessage = 'Das ist meine Nachricht!'
          break
      }
      e.addMessages({ myMessage })
    },
    localechange: [
      (e) => {
        console.log(`The locale is about to change to ${e.locale.tag}`)
      },
    ],
    afterlocalechange: {
      listener(e) {
        console.log(`The locale has been changed to "${e.locale.tag}"`)
      },
      options: {
        priority: -100,
      },
    },
  },
})
```
