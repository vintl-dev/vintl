---
'@vintl/vintl': major
---

Remove deprecated composables

Composables, such as `useI18n`, `useTranslate` and `useFormatters` were previously deprecated with the warning that they will be removed in the next major version. They now get removed as scheduled.

Migration steps:

- Use `useVIntl` everywhere you used `useI18n`, the latter was just an alias for `useVIntl` in previous versions.

- To retrieve translate function previously returned by `useTranslate`, destructure `formatMessage` function from the controller:

  ```js
  const { formatMessage } = useVIntl
  ```

  It is bound to the controller and as such is safe to use on its own.

- To retrieve formatters previously returned by `useFormatters`, destructure `formats` property from the controller:

  ```js
  const { formats } = useVIntl
  ```

  It is reactively updated object and also safe to use on its own.
