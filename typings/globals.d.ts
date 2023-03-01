import '@vintl/vintl/dist/types/messages.js'
// @ts-expect-error - self-import
import { InjectedProperties } from '@vintl/vintl'
// @ts-expect-error - self-import
import { MessageValueType } from '@vintl/vintl/plugin'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties
    extends InjectedProperties<MessageValueType> {}

  interface GlobalComponents {
    // @ts-expect-error -self-import
    IntlFormatted: typeof import('@vintl/vintl/components').IntlFormatted
  }
}
