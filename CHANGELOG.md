# @vintl/vintl

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
