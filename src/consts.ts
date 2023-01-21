import type { InjectionKey } from 'vue'
import type { IntlController } from './controller.js'

export const controllerKey = Symbol('vueIntlController') as InjectionKey<
  IntlController<any>
>
