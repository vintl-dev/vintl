---
'@vintl/vintl': minor
---

Added Vue types augmentation to type the global mixin properties

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
