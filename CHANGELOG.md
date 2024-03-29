# @vintl/vintl

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
        globalMixin: false
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
