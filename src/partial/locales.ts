import { asyncComputed, type AsyncComputedRef } from '@braw/async-computed'
import { computed, ref, type Ref } from 'vue'
import {
  AutomaticStateChangeEvent,
  LocaleChangeEvent,
  LocaleLoadEvent,
} from '../events/index.js'
import type { Locale, LocaleDescriptor, MessagesMap } from '../types/index.js'
import {
  defineGetters,
  defineRefGetters,
  mergeDescriptors,
} from '../utils/definer.js'
import { createHashMap, hasKey } from '../utils/hashmap.js'
import { observe } from '../utils/vue.js'
import type { EventTargetPartial } from './events.js'
import type { ControllerConfiguration } from './config.js'
import type { AutomationPartial } from './prefers.js'

export interface LocalesPartial {
  /** A reference to a map containing locale data. */
  get $locales(): Ref<Record<string, Locale>>

  /** Read-only reference to the current loading promise. */
  get $loading(): AsyncComputedRef<void>

  /**
   * Whether the automation is enabled and locale is picked automatically based
   * on one of the preferred locale sources.
   */
  get automatic(): boolean

  /** @returns Whether the current locale is loaded. */
  get ready(): boolean

  /** BCP 47 code of the currently used locale. */
  get locale(): string

  /**
   * Finds a descriptor for one of the existing locales. Descriptor objects
   * contain useful information.
   *
   * @param localeCode BCP 47 locale code to search for descriptor.
   * @returns Descriptor for the locale or `undefined`, if none exists.
   */
  getLocaleDescriptor(localeCode: string): LocaleDescriptor | undefined

  /**
   * Adds the provided descriptor to the configuration.
   *
   * If locale for the provided locale code or descriptor already exists, that
   * locale will be replaced, causing all associated with it data to be
   * deleted.
   *
   * @param descriptor Descriptor or a BCP 47 locale code for which the
   *   descriptor is created.
   * @param force Whether to override any existing locale.
   * @returns Descriptor that was added.
   * @throws Error if locale with the same locale code exists but `force` is not
   *   provided or is set to `false`.
   */
  addLocale(
    descriptor: string | LocaleDescriptor,
    force?: boolean,
  ): LocaleDescriptor

  /**
   * Removes the locale from the configuration.
   *
   * @param descriptor Descriptor or BCP 47 locale code of any existing locale.
   * @returns Removed locale descriptor or `null` if no locale was removed.
   */
  removeLocale(descriptor: string | LocaleDescriptor): LocaleDescriptor | null

  /**
   * Adds messages for the locale, overwriting any existing ones, to the
   * internal messages map.
   *
   * @param descriptor Descriptor or a BCP 47 locale for which the messages are
   *   defined.
   * @param messages A map of messages for the locale for adding. This is
   *   partial, therefore any message keys that were assigned to `undefined`
   *   value will be removed.
   * @throws Error if locale with such code or descriptor does not exist.
   */
  addMessages(
    descriptor: string | LocaleDescriptor,
    messages: Partial<MessagesMap>,
  ): void

  /**
   * Changes the current locale to one of defined locales based on the provided
   * code, or switches to one of the preferred locales and switches automatic
   * one, if `'auto'` is passed as a locale code.
   *
   * If passed locale code is not `'auto'`, proceeds to fire an event about the
   * locale change. If that event is cancelled, throws an exception. proceeds by
   * firing another event about locale load, any defined event handlers will
   * proceed to define locale messages in asynchronous manner, if any of them
   * throws an exception, than the whole.
   *
   * @param localeCode BCP 47 code of the locale to use.
   * @returns Promise that will resolve when the locale is loaded.
   */
  changeLocale(
    localeCode: 'auto' | (string & Record<never, never>),
  ): Promise<void>
}

export function useLocalesPartial<ControllerType>(
  initialLocaleData: Record<string, Locale> | undefined,
  $config: ControllerConfiguration<ControllerType>,
  eventTarget: EventTargetPartial<ControllerType>,
  prefersPartial: AutomationPartial,
): LocalesPartial {
  const $locales: Ref<Record<string, Locale>> = ref(
    Object.assign(createHashMap(), initialLocaleData),
  )

  observe(
    () => $config.locales,
    (availableLocales) => {
      const knownLocaleCodes = new Set()
      const locales = $locales.value

      for (const descriptor of availableLocales) {
        if (knownLocaleCodes.has(descriptor.code)) {
          throw new Error('Duplicate locale code detected')
        }

        knownLocaleCodes.add(descriptor.code)

        if (!hasKey(locales, descriptor.code)) {
          locales[descriptor.code] = {
            get descriptor() {
              return descriptor
            },
            messages: createHashMap() as MessagesMap,
            resources: createHashMap(),
          }
        }
      }

      for (const code of Object.keys(locales)) {
        if (!knownLocaleCodes.has(code)) {
          delete locales[code]
        }
      }
    },
  )

  const $automatic = computed(() => $config.usePreferredLocale)

  const $automaticLocaleCode = ref<string | null>(null)

  const $locale = computed(() => $automaticLocaleCode.value ?? $config.locale)

  let lastLoadedLocale: Locale | null = null

  const $loading = asyncComputed({
    watch() {
      return $locales.value[$locale.value]
    },
    async get(locale) {
      if (locale == null) {
        throw new Error('No locale descriptor exists for the current locale')
      }

      if (lastLoadedLocale === locale) return

      lastLoadedLocale = locale

      const event = new LocaleLoadEvent(locale)

      this.onCancel(event.cancel.bind(null))

      if (!(await eventTarget.dispatchEvent(event))) {
        throw new Error(
          `Cannot load locale messages for the locale "${locale.descriptor.code}": load event is cancelled`,
        )
      }

      Object.assign(locale, event.collect())
    },
  })

  observe(
    () => ({
      isEnabled: $automatic.value,
      locale: prefersPartial.preferredLocale,
    }),
    ({ isEnabled, locale }, previousState) => {
      const wasEnabled = previousState?.isEnabled

      if (isEnabled && !wasEnabled) {
        const previousLocale = previousState?.locale ?? $config.locale

        const languageSwitchCanceled = !eventTarget.dispatchEvent(
          new LocaleChangeEvent(previousLocale, locale, true),
        )

        if (languageSwitchCanceled) return

        $automaticLocaleCode.value = locale
      } else if (!isEnabled && wasEnabled) {
        $automaticLocaleCode.value = null
      }
    },
  )

  function getLocaleDescriptor(localeCode: string) {
    return $locales.value[localeCode]?.descriptor
  }

  function addLocale(
    descriptor: string | LocaleDescriptor,
    force?: boolean,
  ): LocaleDescriptor {
    const normalizedDescriptor: LocaleDescriptor =
      typeof descriptor === 'string' ? { code: descriptor } : descriptor

    const newLocales: LocaleDescriptor[] = []

    for (const locale of $config.locales) {
      if (locale.code === normalizedDescriptor.code) {
        if (!force) {
          throw new Error(
            `Locale "${normalizedDescriptor.code}" already exists`,
          )
        }
      } else {
        newLocales.push(locale)
      }
    }

    newLocales.push(normalizedDescriptor)

    $config.locales = newLocales

    return normalizedDescriptor
  }

  function removeLocale(
    descriptor: string | LocaleDescriptor,
  ): LocaleDescriptor | null {
    let index: number

    if (typeof descriptor === 'string') {
      index = $config.locales.findIndex((locale) => locale.code === descriptor)
    } else {
      index = $config.locales.findIndex((locale) => locale === descriptor)
    }

    return index === -1 ? null : $config.locales.splice(index, 1)[0] ?? null
  }

  function addMessages(
    descriptor: string | LocaleDescriptor,
    messages: Partial<MessagesMap>,
  ) {
    let locale: Locale | undefined

    if (typeof descriptor === 'string') {
      locale = $locales.value[descriptor]
    } else {
      for (const knownLocale of Object.values($locales.value)) {
        if (knownLocale.descriptor === descriptor) {
          locale = knownLocale
        }
      }
    }

    if (locale == null) {
      if (typeof descriptor === 'string') {
        // eslint-disable-next-line unicorn/prefer-type-error
        throw new Error(`Locale "${descriptor}" does not exist`)
      } else {
        // eslint-disable-next-line unicorn/prefer-type-error
        throw new Error(
          `Locale with provided descriptor (for ${descriptor.code}) does not exist`,
        )
      }
    }

    if (locale.messages == null) {
      locale.messages = createHashMap() as MessagesMap
    }

    Object.assign(locale.messages, messages)
  }

  async function changeLocale(localeCode: string) {
    if ($config.locale === localeCode) {
      return
    }

    if (localeCode === 'auto') {
      if (!eventTarget.dispatchEvent(new AutomaticStateChangeEvent(true))) {
        throw new Error('Enabling of automatic mode has been cancelled')
      }
    } else {
      const autoSwitchOffCanceled = eventTarget.dispatchEvent(
        new AutomaticStateChangeEvent(false),
      )

      if ($automatic.value && !autoSwitchOffCanceled) {
        return
      }

      const localeChangeCanceled = !eventTarget.dispatchEvent(
        new LocaleChangeEvent($config.locale, localeCode, false),
      )

      if (localeChangeCanceled) {
        throw new Error(`Locale change to "${localeCode}" was cancelled`)
      }

      $config.locale = localeCode
    }

    $config.usePreferredLocale = localeCode === 'auto'

    await $loading.promise
  }

  return mergeDescriptors(
    defineGetters({ $loading, $locales }),
    defineRefGetters({ $automatic, $locale }),
    {
      get ready() {
        return $loading.fulfilled
      },
      getLocaleDescriptor,
      addLocale,
      removeLocale,
      addMessages,
      changeLocale,
    },
  )
}
