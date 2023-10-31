import type { InjectedProperties } from '../plugin.js'
import type { MessageValueType } from './messages.js'

// eslint-disable-next-line vue/prefer-import-from-vue
import type {} from '@vue/runtime-core'

declare global {
  namespace VueIntlController {
    interface Options {}
  }
}

type ConditionalExtensions = VueIntlController.Options extends {
  globalMixin: infer GlobalMixin
}
  ? [GlobalMixin] extends [true]
    ? InjectedProperties<MessageValueType>
    : {}
  : InjectedProperties<MessageValueType>

declare module 'vue' {
  export interface ComponentCustomProperties extends ConditionalExtensions {}
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties extends ConditionalExtensions {}
}

export {}
