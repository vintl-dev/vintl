import type { InjectedProperties } from '../plugin.js'
import type { MessageValueType } from './messages.js'

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

export {}
