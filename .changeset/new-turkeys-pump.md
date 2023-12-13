---
'@vintl/vintl': major
---

Removed deprecated composables

Composables like `useI18n`, `useTranslate` and `useFormatters` were previously deprecated with the warning that they will be removed in the next major version. They now get removed as scheduled.

Here's how you migrate:

- Replace all uses of `useI18n` with `useVIntl`, the former was just an alias for `useVIntl` in the previous versions.

- To retrieve translate function previously returned by `useTranslate`, destructure `formatMessage` function from the controller:

  ```js
  const { formatMessage } = useVIntl()
  ```

  It is bound to the controller and as such is safe to use on its own.

- To retrieve formatters previously returned by `useFormatters`, destructure `formats` property from the controller:

  ```js
  const { formats } = useVIntl()
  ```

  It is a reactively updated object and is also safe to use on its own.
