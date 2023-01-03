import 'vue/types/vue'
import '@braw/vue-intl-controller/dist/types/messages.js'
// @ts-expect-error - self-import
import { InjectedProperties } from '@braw/vue-intl-controller'
// @ts-expect-error - self-import
import { MessageValueType } from '@braw/vue-intl-controller/plugin'

declare module 'vue/types/vue' {
  interface Vue extends InjectedProperties<MessageValueType> {}
}

declare module 'vue' {
  interface GlobalComponents {
    // @ts-expect-error -self-import
    IntlFormatted: typeof import('@braw/vue-intl-controller/components').IntlFormatted
  }
}
