<script setup>
  const ok = '\u2611' // ballot_box_with_check
  const great = '\u2705' // white_check_mark
  const bad = '\ud83d\udc4e' // thumbsdown
  const some = '\ud83d\udc4d' // thumbsup
  const maybe = '\ud83e\udd14' // thinking
  const soon = '\ud83d\udc40' // eyes
</script>

# What is VIntl

VIntl is a plugin for Vue that attempts to tightly integrate the
[FormatJS Intl](https://formatjs.io/docs/intl) library into Vue applications,
with lots of sweet stuff like real-time locale loading and switching, helper
functions, mixins, and much more.

<br/>

:::warning DISCLAIMER

This documentation is still work in progress and will continue to improve in the
future.

You can help make it better [by contributing on GitHub →][github]

[github]: https://github.com/vintl-dev/vintl/

:::

## Comparison with Vue Intl

The [official Vue Intl plugin](https://formatjs.io/docs/vue-intl) from the
FormatJS team already provides a way to add Intl to your Vue applications, but
its scope is to just bring the Intl and nothing else.

This plugin has a much broader scope — not only to provide Intl, but also to
allow it to be managed during runtime.

|           Feature            | `vue-intl`                                     | `vintl`                         |
| :--------------------------: | :--------------------------------------------- | :------------------------------ |
|     Access Intl globally     | {{great}} [Yes][fvi-p-1]                       | {{great}} Yes                   |
|       Helper functions       | {{great}} [Yes][fvi-p-2]                       | {{great}} Yes                   |
|         Composables          | {{great}} [Yes][fvi-p-3]                       | {{great}} Yes                   |
| Changing language in runtime | {{bad}} [Not supported][fvi-p-4]               | {{great}} Supported             |
|      Loading languages       | {{ok}} Out of scope                            | {{great}} Supported             |
|            Events            | {{ok}} Out of scope                            | {{great}} Yes                   |
|     Formatting component     | {{maybe}} [Maybe comes in the future][fvi-p-5] | {{great}} Supported             |
|   Translations extraction    | {{great}} Using `@formatjs/cli`                | {{great}} Using `@formatjs/cli` |
|        No parser mode        | {{great}} Supported                            | {{great}} Supported             |
|   TypeScript extensibility   | {{some}} [Some][fvi-p-6]                       | {{great}} Enhanced              |
|       Nuxt integration       | {{ok}} Manual                                  | {{soon}} Coming soon™           |

[fvi-p-1]: https://formatjs.io/docs/vue-intl#inject
[fvi-p-2]: https://formatjs.io/docs/vue-intl#methods
[fvi-p-3]: https://formatjs.io/docs/vue-intl#composition-api
[fvi-p-4]:
  https://github.com/formatjs/formatjs/discussions/2464#discussioncomment-256012
[fvi-p-5]:
  https://github.com/formatjs/formatjs/discussions/3961#discussioncomment-4660391
[fvi-p-6]: https://formatjs.io/docs/react-intl/#typing-message-ids-and-locale

:::info NOTE

This comparison table is not meant to be taken as ‘this project is better’: it's
perfectly fine for FormatJS to set the scope of their project and how much they
want to commit to it! It's here merely meant to show the differences in scope
between the two projects.

:::

## Comparison with Vue I18n

[Vue I18n] is a much more mature and popular framework for Vue that has been
around for a while. It's usually a good choice for people who want stability and
familiarity.

There are certain things you may not like in Vue I18n, such as a custom
interpolation syntax instead of standard syntax like Fluent or ICU
MessageFormat, or a slightly more complicated and manual API — it does not try
to do things for you, which can be its advantage.

There's not much to compare! Vue I18n has almost everything the VIntl has and
more. It's all about choice: VIntl tries to bring FormatJS Intl into the Vue
world, Vue I18n does things its own way and does it nicely.

[Vue I18n]: https://vue-i18n.intlify.dev/
