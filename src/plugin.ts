import type { App } from 'vue'
import type { ControllerConfiguration } from './partial/config.js'
import type { FormatAliases } from './partial/intl.js'
import { createController } from './IntlController.js'
import type { IntlController } from './partial/types.js'
import type { TranslateFunction } from './types/translateFunction.js'
import { createHashMap } from './utils/hashmap.js'
import { controllerKey } from './consts.js'

/** Represents options for the plugin. */
export interface PluginOptions<ControllerType> {
  /** Options for the controller. */
  controllerOpts?: Partial<ControllerConfiguration<ControllerType>>

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
   * Set this to `false` if you want to utilise only composables instead.
   *
   * @default true // $t, $i18n, $fmt are automatically created in components.
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

// type ValueOf<T> = Omit<
//   PropertyDescriptor,
//   'value' | keyof DefaultDescriptorOverrides
// > &
//   DefaultDescriptorOverrides & {
//     value: T
//   }

/** Represents global properties that are injected in `Vue.prototype`. */
export interface PluginInjections<ControllerType>
  extends PropertyDescriptorMap {
  /** Injection for the formatting aliases. */
  $fmt: GetterOf<FormatAliases<ControllerType>>

  /** Injection for the controller. */
  $i18n: GetterOf<IntlController<ControllerType>>

  /** Injection for the translate function. */
  $t: GetterOf<TranslateFunction>
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

export interface Plugin<ControllerType> {
  /**
   * @returns Either previously created or newly instantiated controller
   *   instance.
   */
  getOrCreateController(): IntlController<ControllerType>

  /** @returns A map of property descriptors that can be used for injecting. */
  getInjections(): PluginInjections<ControllerType>

  /**
   * Creates a new object with `null` prototype and defines injections on it.
   *
   * @deprecated This will be removed in one of the next major releases.
   *
   *   Please access properties ({@link IntlController.formats},
   *   {@link IntlController.formatMessage}) directly on the controller instance
   *   that can be retrieved using {@link getOrCreateController}, or use:
   *
   *   ```ts
   *   Object.defineProperties(Object.create(null), plugin.getInjections())
   *   ```
   */
  toProperties(): InjectedProperties<ControllerType>

  /**
   * Installs plugin in the provided Vue App in accordance to plugin options.
   *
   * @param app Vue App on which to install this plugin.
   */
  install(app: App): void
}

export function createPlugin<ControllerType = string>(
  opts?: PluginOptions<ControllerType>,
): Plugin<ControllerType> {
  let controllerInstance: IntlController<ControllerType> | null = null

  function getOrCreateController() {
    if (controllerInstance == null) {
      controllerInstance = createController(opts?.controllerOpts)
    }

    return controllerInstance
  }

  function getInjections(): PluginInjections<ControllerType> {
    const controller = getOrCreateController()

    return {
      $fmt: {
        configurable: true,
        get() {
          return controller.formats
        },
      },
      $t: {
        configurable: true,
        get() {
          return controller.formatMessage
        },
      },
      $i18n: {
        configurable: true,
        get() {
          return controller
        },
      },
    }
  }

  return {
    getOrCreateController,
    getInjections,
    toProperties() {
      return Object.defineProperties(createHashMap() as any, getInjections())
    },
    install(app) {
      app.provide(controllerKey, getOrCreateController())

      if (opts?.globalMixin ?? true) {
        app.mixin({
          beforeCreate() {
            Object.defineProperties(this, getInjections())
          },
        })
      }

      if (opts?.injectInto != null) {
        const injections = getInjections()
        for (const injectionSite of opts.injectInto) {
          Object.defineProperties(injectionSite, injections)
        }
      }

      if (opts?.globalComponent ?? true) {
        app.component(
          'IntlFormatted',
          import('./IntlFormatted.js').then((module) => module.IntlFormatted),
        )
      }
    },
  }
}

export type { ControllerConfiguration }
