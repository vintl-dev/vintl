# @vintl/vintl

## 4.2.1

### Patch Changes

- 1a085f1: Downgrade and pin specific FormatJS packages versions

  Unfortunately, newer version shipped with export conditions that result in ESM files being imported as CJS ones. We're temporarily downgrading the versions and pin their versions instead of using a range to mitigate the issue.

  For more details check out the issue at https://github.com/formatjs/formatjs/issues/4126.
