# What is Vue Intl Controller

Vue Intl Controller is a plugin for Vue that attempts to tightly integrate the
[FormatJS Intl](https://formatjs.io/docs/intl) library into Vue applications,
with lots of sweet stuff like real-time locale loading and switching, helper
functions, mixins, and much more.

## Comparison with Vue Intl

The [official Vue Intl plugin](https://formatjs.io/docs/vue-intl) from the
FormatJS team already provides a way to add Intl to your Vue applications, but
its scope is to just bring the Intl and nothing else.

This plugin has a much broader scope — not only to provide Intl, but also to
allow it to be managed during runtime.

|           Feature            | `vue-intl`                                                                                                              | `vue-intl-controller`                    |
| :--------------------------: | :---------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
|     Access Intl globally     | :white_check_mark: [Yes](https://formatjs.io/docs/vue-intl#inject)                                                      | :white_check_mark: Yes                   |
|       Helper functions       | :white_check_mark: [Yes](https://formatjs.io/docs/vue-intl#methods)                                                     | :white_check_mark: Yes                   |
|         Composables          | :white_check_mark: [Yes](https://formatjs.io/docs/vue-intl#composition-api)                                             | :white_check_mark: Yes                   |
| Changing language in runtime | :thumbsdown: [Not supported](https://github.com/formatjs/formatjs/discussions/2464#discussioncomment-256012)            | :white_check_mark: Supported             |
|      Loading languages       | :ballot_box_with_check: Out of scope                                                                                    | :white_check_mark: Supported             |
|            Events            | :ballot_box_with_check: Out of scope                                                                                    | :white_check_mark: Yes                   |
|     Formatting component     | :thinking: [Maybe comes in the future](https://github.com/formatjs/formatjs/discussions/3961#discussioncomment-4660391) | :white_check_mark: Supported             |
|   Translations extraction    | :white_check_mark: Using `@formatjs/cli`                                                                                | :white_check_mark: Using `@formatjs/cli` |
|        No parser mode        | :white_check_mark: Supported                                                                                            | :white_check_mark: Supported             |
|   TypeScript extensibility   | :thumbsup: [Some](https://formatjs.io/docs/react-intl/#typing-message-ids-and-locale)                                   | :white_check_mark: Enhanced              |
|       Nuxt integration       | :ballot_box_with_check: Manual                                                                                          | :eyes: Coming soon™                      |

Please note that this comparison table is not meant to be taken as ‘this project
is better’: it's perfectly fine for Vue Intl to set the scope of their project
and how much they want to commit to it. It's merely meant to show the
differences in scope between the two projects.
