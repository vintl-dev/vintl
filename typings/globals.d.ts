import '@braw/vintl/dist/types/messages.js'
// @ts-expect-error - self-import
import { InjectedProperties } from '@braw/vintl'
// @ts-expect-error - self-import
import { MessageValueType } from '@braw/vintl/plugin'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties
    extends InjectedProperties<MessageValueType> {}

  interface GlobalComponents {
    // @ts-expect-error -self-import
    IntlFormatted: typeof import('@braw/vintl/components').IntlFormatted
  }
}
