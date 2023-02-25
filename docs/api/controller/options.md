# Controller options

## `locale`

**Default**: `'en-US'`

BCP 47 language tag of the currently used locale.

## `defaultLocale`

**Default**: `'en-US'`

BCP 47 language tag of the default locale.

## `locales`

**Default**: `<computed>`

An array of the locale descriptors.

Defaults to newly meta-less generated descriptors for the default and current
locales.

## `usePreferredLocale`

**Default**: `false`

Whether the automatic language selection is enabled.

## `preferredLocaleSources`

**Default**: `[]`

An array of preferred locale sources.

The order in which sources defines the preference for one particular source.

## `listen`

**Default**: `{}`

Defines a map of event listeners to auto-bind.
