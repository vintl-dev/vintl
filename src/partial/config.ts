import { computed, reactive } from 'vue'
import type {
  LocaleDescriptor,
  PreferredLocalesSource,
} from '../types/index.js'
import {
  defineGetters,
  defineRefGetters,
  mergeDescriptors,
} from '../utils/definer.js'

/** Represents the controller configuration (state). */
export interface ControllerConfiguration<_ControllerType> {
  /**
   * BCP 47 language tag of the currently used locale.
   *
   * @default 'en-US'
   */
  locale: string

  /**
   * BCP 47 language tag of the default locale.
   *
   * @default 'en-US'
   */
  defaultLocale: string

  /**
   * All the locale descriptors.
   *
   * Defaults to newly meta-less generated descriptors for the default and
   * current locales.
   *
   * @default [{ code: 'en-US' }]
   */
  locales: LocaleDescriptor[]

  /**
   * Whether the automatic language selection is enabled.
   *
   * @default false // Uses configured locale.
   */
  usePreferredLocale: boolean

  /**
   * An array of preferred locale sources.
   *
   * The order in which sources defines the preference for one particular
   * source.
   *
   * @default [ ] // Fall backs to default locale.
   */
  preferredLocaleSources: PreferredLocalesSource[]
}

export interface ConfigPartial<ControllerType> {
  /** Reactive configuration of the controller. */
  get $config(): ControllerConfiguration<ControllerType>

  /** BCP 47 code of the default locale. */
  get defaultLocale(): string

  /** {@link Intl.Locale} for the current locale. */
  get intlLocale(): Intl.Locale
}

export function useConfigPartial<ControllerType>(
  initialConfiguration?: Partial<ControllerConfiguration<ControllerType>>,
): ConfigPartial<ControllerType> {
  const $config = reactive<ControllerConfiguration<ControllerType>>(
    (() => {
      const defaultLocale = initialConfiguration?.defaultLocale ?? 'en-US'
      const locale = initialConfiguration?.locale ?? defaultLocale

      let locales = initialConfiguration?.locales

      if (locales == null) {
        locales = []

        locales.push({ code: defaultLocale })

        if (locale !== defaultLocale) {
          locales.push({ code: locale })
        }
      }

      return {
        defaultLocale,
        locale,
        locales,
        usePreferredLocale: initialConfiguration?.usePreferredLocale ?? false,
        preferredLocaleSources:
          initialConfiguration?.preferredLocaleSources ?? [],
      }
    })(),
  )

  const $intlLocale = computed(() => new Intl.Locale($config.locale))

  return mergeDescriptors(
    defineGetters({ $config }),
    {
      get defaultLocale() {
        return $config.defaultLocale
      },
    },
    defineRefGetters({ $intlLocale }),
  )
}
