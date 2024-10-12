# @vintl/vintl

## 5.0.0-next.0

### Major Changes

- 997402a: Removed deprecated composables

  Composables like `useI18n`, `useTranslate` and `useFormatters` were previously deprecated with the warning that they will be removed in the next major version. They now get removed as scheduled.

  Here's how you migrate:

  - Replace all uses of `useI18n` with `useVIntl`, the former was just an alias for `useVIntl` in the previous versions.
  - To retrieve translate function previously returned by `useTranslate`, destructure `formatMessage` function from the controller:

    ```js
    const { formatMessage } = useVIntl();
    ```

    It is bound to the controller and as such is safe to use on its own.

  - To retrieve formatters previously returned by `useFormatters`, destructure `formats` property from the controller:

    ```js
    const { formats } = useVIntl();
    ```

    It is a reactively updated object and is also safe to use on its own.

- c2c6cb6: Bumped Vue version to 3.3.4

  We now require a newer Vue version because we are relying on functionality added in Vue 3.3, such as generic components. Since this is not compatible with the previous versions of Vue, this is marked as a breaking change.

### Minor Changes

- 5e746fa: Add more formatting components similar to ones found in `react-intl`:

  - `FormattedDate`, `FormattedDateParts`
  - `FormattedTime`, `FormattedTimeParts`
  - `FormattedDateTimeRange`
  - `FormattedRelativeTime` (doesn't update live like `react-intl`)
  - `FormattedNumber`, `FormattedNumberParts`
  - `FormattedPlural`
  - `FormattedList`, `FormattedListParts`
  - `FormattedDisplayName`
  - `FormattedMessage`

  Slots can be used to receive the formatted values instead of being formatted as is.

  `FormattedMessage` is very similar to `IntlFormatted`, but accepts descriptor properties and does not allow to format raw messages.

- b194662: Added `useMessages` composable

  `useMessages` is the new composable that allows you to pass in an object with the extended message descriptors, and returns back a reactive object with the current messages. Extended message descriptors can contain values or formatters that will be used when interpreting the message. This allows you to create messages in a very inefferctive manner.

## 4.4.1

### Patch Changes

- e72dd92: Fixed missing global mixin properties when using Volar

## 4.4.0

### Minor Changes

- 985b5a0: Added Vue types augmentation to type the global mixin properties

  Mixin-provided global properties like `$t`, `$fmt` and `$i18n` should be properly typed now.

  If you don't use the global mixin, the below augmentation will remove these unusable properties.

  ```ts
  declare global {
    namespace VueIntlController {
      interface Options {
        globalMixin: false;
      }
    }
  }
  ```

## 4.3.0

### Minor Changes

- a1e63be: Added defineMessage(s) utility functions

  Similar to `@formatjs/intl`, they allow you to define messages with correct types. They don't really do anything else besides returning what you passed into them.

## 4.2.3

### Patch Changes

- 4310818: Unpin FormatJS dependencies

  Previously FormatJS dependencies were pinned due to an unexpected breaking changed, this has been resolved since.

## 4.2.2

### Patch Changes

- abb0805: Unpin FormatJS dependencies

  Previously FormatJS dependencies were pinned because of the unexpected breaking change, but this has since been resolved.

## 4.2.1

### Patch Changes

- 1a085f1: Downgrade and pin specific FormatJS packages versions

  Unfortunately, newer version shipped with export conditions that result in ESM files being imported as CJS ones. We're temporarily downgrading the versions and pin their versions instead of using a range to mitigate the issue.

  For more details check out the issue at https://github.com/formatjs/formatjs/issues/4126.
