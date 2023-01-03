import type { PluginObject } from 'vue'
import type { ControllerConfiguration } from './IntlController.config.js'
import type { FormatAliases } from './IntlController.intl.js'
import { createController } from './IntlController.js'
import type { IntlController } from './IntlController.types.js'
import type { MessageContent, MessageDescriptor } from './types/messages.js'
import type { TranslateFunction } from './types/translateFunction.js'
import { createHashMap } from './utils/hashmap.js'

/** Represents options for the plugin. */
export interface PluginOptions {
  /** Options for the controller. */
  controllerOpts?: Partial<ControllerConfiguration>

  /**
   * Whether the `IntlFormatted` will be registered as a global component.
   *
   * Set this to `false` if you want to import the component manually.
   *
   * @default true // <IntlFormatted /> can be used without import
   */
  globalComponent?: boolean

  /**
   * Whether the plugin's properties will be automatically injected to all
   * instances of Vue.
   *
   * Set this to `false` if you want to utilise composables instead.
   *
   * @default true // $t, $i18n, $fmt can be accessed via Vue
   */
  globalMixin?: boolean

  /** An array containing all additional injection sites besides Vue. */
  injectInto?: object[]
}

/** Represents the default for all injection descriptors. */
type DefaultDescriptorOverrides = {
  configurable: true
}

type GetterOf<T> = Omit<
  PropertyDescriptor,
  'get' | keyof DefaultDescriptorOverrides
> &
  DefaultDescriptorOverrides & {
    get(): T
    set?: undefined
  }

/* type GetterAndSetterOf<T> = Omit<
  PropertyDescriptor,
  'get' | 'set' | keyof DefaultDescriptorOverrides
> &
  DefaultDescriptorOverrides & {
    get(): T
    set(value: T): void
  } */

type ValueOf<T> = Omit<
  PropertyDescriptor,
  'value' | keyof DefaultDescriptorOverrides
> &
  DefaultDescriptorOverrides & {
    value: T
  }

/** Represents global properties that are injected in `Vue.prototype`. */
export interface PluginInjections<ControllerType>
  extends PropertyDescriptorMap {
  /** Injection for the formatting aliases. */
  $fmt: GetterOf<FormatAliases<ControllerType>>

  /** Injection for the controller. */
  $i18n: GetterOf<IntlController<ControllerType>>

  /** Injection for the translate function. */
  $t: ValueOf<TranslateFunction>
}

type InjectedValues<Injections> = {
  [InjectionKey in keyof Injections as Injections[InjectionKey] extends {
    value: any
  }
    ? InjectionKey
    : never]: Injections[InjectionKey] extends {
    value: infer ValueType
  }
    ? ValueType
    : never
}

type InjectedGetters<Injections> = {
  readonly [InjectionKey in keyof Injections as Injections[InjectionKey] extends {
    get(): any
    set?: undefined
  }
    ? InjectionKey
    : never]: Injections[InjectionKey] extends {
    get(): infer ValueType
    set?: undefined
  }
    ? ValueType
    : never
}

type InjectedGettersAndSetters<Injections> = {
  [InjectionKey in keyof Injections as Injections[InjectionKey] extends {
    get(): any
    set(value: any): void
  }
    ? InjectionKey
    : never]: Injections[InjectionKey] extends {
    get(): infer ValueType
    set(value: infer ValueType): void
  }
    ? ValueType
    : never
}

export type InjectedProperties<
  ControllerType,
  Injections extends PluginInjections<ControllerType> = PluginInjections<ControllerType>,
> = InjectedValues<Injections> &
  InjectedGetters<Injections> &
  InjectedGettersAndSetters<Injections>

export interface Plugin<ControllerType> extends PluginObject<never> {
  getOrCreateController(
    config?: Partial<ControllerConfiguration>,
  ): IntlController<ControllerType>
  getInjections(): PluginInjections<ControllerType>
  toProperties(): InjectedProperties<ControllerType>
}

function createTranslateFunction<ControllerType>(
  controller: IntlController<ControllerType>,
): TranslateFunction {
  return function translateAndNormalize(descriptor, values, opts?) {
    let result: ReturnType<IntlController<ControllerType>['intl']['$t']> = ''

    const normalizedDescriptor: MessageDescriptor =
      typeof descriptor === 'string'
        ? {
            id: descriptor,
            defaultMessage: controller.defaultMessages[
              descriptor
            ] as MessageContent,
          }
        : descriptor

    result = controller.intl.formatMessage(
      normalizedDescriptor,
      values as Record<string, any>,
      opts,
    )

    if (typeof result === 'string') {
      return result
    }

    if (Array.isArray(result)) {
      let normalizedResult = ''

      for (const item of result) {
        normalizedResult += String(item)
      }

      return normalizedResult
    }

    return String(result)
  }
}

export function createPlugin<ControllerType = string>(
  opts?: PluginOptions,
): Plugin<ControllerType> {
  let controllerInstance: IntlController<ControllerType> | null = null

  function retrieveController() {
    if (controllerInstance == null) {
      throw new Error('Controller is not initialised')
    }

    return controllerInstance
  }

  let translateFunction: TranslateFunction | null = null

  return {
    getOrCreateController() {
      if (controllerInstance == null) {
        controllerInstance = createController(opts?.controllerOpts)
      }

      return controllerInstance
    },
    getInjections() {
      const controller = this.getOrCreateController()

      if (translateFunction == null) {
        translateFunction = createTranslateFunction(controller)
      }

      return {
        $fmt: {
          configurable: true,
          get() {
            return retrieveController().formats
          },
        },
        $t: {
          configurable: true,
          value: translateFunction,
        },
        $i18n: {
          configurable: true,
          get: retrieveController,
        },
      }
    },
    toProperties() {
      return Object.defineProperties(
        createHashMap() as any,
        this.getInjections(),
      )
    },
    install(vue) {
      const injections = this.getInjections()

      if (opts?.globalMixin ?? true) {
        Object.defineProperties(vue.prototype, injections)
      }

      if (opts?.injectInto != null) {
        for (const injectionSite of opts.injectInto) {
          Object.defineProperties(injectionSite, injections)
        }
      }

      if (opts?.globalComponent ?? true) {
        vue.component(
          'IntlFormatted',
          import('./IntlFormatted.js').then((module) => module.IntlFormatted),
        )
      }
    },
  }
}

export type { ControllerConfiguration }
