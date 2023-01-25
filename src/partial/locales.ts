import { asyncComputed, type AsyncComputedRef } from '@braw/async-computed'
import { computed, shallowRef, toRaw, type Ref } from 'vue'
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
import { createHashMap } from '../utils/hashmap.js'
import { observe } from '../utils/vue.js'
import { find, includes } from '../utils/iterators.js'
import { AfterLocaleChangeEvent } from '../events/AfterLocaleChangeEvent.js'
import { shallowEqual } from '../utils/shallowEqual.js'
import type { EventTargetPartial } from './events.js'
import type { ControllerConfiguration } from './config.js'
import type { AutomationPartial } from './prefers.js'

export interface LocalesPartial {
  /** A reference to a map containing locale data. */
  get $locales(): Ref<Map<LocaleDescriptor, Locale>>

  /** Read-only reference to the current loading promise. */
  get $loading(): AsyncComputedRef<void>

  /**
   * Whether the automation is enabled and locale is picked automatically based
   * on one of the preferred locale sources.
   */
  get automatic(): boolean

  /** @returns Whether the current locale is loaded. */
  get ready(): boolean

  /** BCP 47 language tag of the currently used locale. */
  get locale(): string

  /**
   * Finds a descriptor for one of the existing locales. Descriptor objects may
   * contain useful information regarding the presentation of locale.
   *
   * @param localeTag BCP 47 language tag of the locale.
   * @returns Descriptor for the locale or `undefined`, if none exists.
   */
  getLocaleDescriptor(localeTag: string): LocaleDescriptor | undefined

  /**
   * Adds the provided descriptor to the configuration.
   *
   * If locale for the provided language tag or descriptor already exists, that
   * locale will be replaced, causing all associated with it data to be
   * deleted.
   *
   * @param descriptor Descriptor or a BCP 47 language tag for which the
   *   descriptor is created.
   * @param force Whether to override any existing locale.
   * @returns Descriptor that was added.
   * @throws Error if locale with the same locale tag exists but `force` is not
   *   provided or is set to `false`.
   */
  addLocale(
    descriptor: string | LocaleDescriptor,
    force?: boolean,
  ): LocaleDescriptor

  /**
   * Removes the locale from the configuration.
   *
   * @param descriptor Descriptor or BCP 47 language tag of any existing locale.
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
   * @throws Error if locale with such tag or descriptor does not exist.
   */
  addMessages(
    descriptor: string | LocaleDescriptor,
    messages: Partial<MessagesMap>,
  ): void

  /**
   * Changes the current locale to one of defined locales based on its language
   * tag. Alternatively, if `'auto'` is passed as a language tag, switches to
   * one of the preferred locales and toggles automatic mode on.
   *
   * @param localeTag BCP 47 language tag of the locale to use.
   * @returns Promise that will resolve when the locale is loaded, or rejected
   *   if locale change is cancelled or any of the locale load event handlers
   *   rejects.
   */
  changeLocale(
    localeTag: 'auto' | (string & Record<never, never>),
  ): Promise<void>

  /**
   * Waits until the locale loading is complete and controller is ready for use.
   *
   * @returns A promise that will be resolved after the default and current
   *   locales finish loading, otherwise it will be rejected with the reason of
   *   unsuccessful load.
   */
  waitUntilReady(): Promise<void>
}

/**
 * Represents a locale change request, which is a tuple where the first element
 * is a locale object, second is its descriptor, and the third element is a
 * boolean value indicating whether the change was initiated automatically.
 */
type LocaleChangeRequest = readonly [
  locale: Locale,
  descriptor: LocaleDescriptor,
  automated: boolean,
]

/**
 * Represents a result of querying a locale by its language tag, which is a
 * tuple where the first element is the locale object and the second element is
 * this locale's descriptor.
 */
type LocaleQueryResult = readonly [locale: Locale, descriptor: LocaleDescriptor]

export function useLocalesPartial<ControllerType>(
  initialLocaleData: Map<LocaleDescriptor, Locale> | undefined,
  $config: ControllerConfiguration<ControllerType>,
  eventTarget: EventTargetPartial<ControllerType>,
  prefersPartial: AutomationPartial,
): LocalesPartial {
  const $locales: Ref<Map<LocaleDescriptor, Locale>> = shallowRef(
    new Map(initialLocaleData),
  )

  observe(
    () => $config.locales,
    (newLocales) => {
      const knownLocales = new Map($locales.value)

      const tags = new Set<string>()

      for (const locale of newLocales) {
        if (tags.has(locale.tag)) {
          throw new Error(
            `Locale descriptor with tag "${locale.tag}" has already been added`,
          )
        }

        tags.add(locale.tag)

        if (includes(knownLocales.keys(), locale)) continue

        knownLocales.set(locale, {
          messages: createHashMap() as MessagesMap,
          resources: createHashMap(),
        })
      }

      for (const knownLocale of knownLocales.keys()) {
        if (!newLocales.includes(knownLocale)) {
          knownLocales.delete(knownLocale)
        }
      }

      $locales.value = knownLocales
    },
  )

  function getLocaleDescriptor(localeTag: string) {
    return find(
      $locales.value.keys(),
      (descriptor) => descriptor.tag === localeTag,
    )
  }

  function getLocaleDescriptorAssertive(localeTag: string) {
    const descriptor = getLocaleDescriptor(localeTag)

    if (descriptor == null) {
      throw new Error(
        `Cannot find the locale descriptor for the locale "${localeTag}"`,
      )
    }

    return descriptor
  }

  function getLocale(descriptor: LocaleDescriptor) {
    return $locales.value.get(descriptor)
  }

  function getLocaleAssertive(descriptor: LocaleDescriptor) {
    const locale = getLocale(descriptor)

    if (locale == null) {
      throw new Error(
        `Locale for the provided descriptor of "${descriptor.tag}" does not exist`,
      )
    }

    return locale
  }

  function getLocaleByTagAssertive(localeTag: string): LocaleQueryResult {
    const descriptor = getLocaleDescriptorAssertive(localeTag)
    const locale = getLocaleAssertive(descriptor)

    return [locale, descriptor] as const
  }

  const $automatic = computed(() => $config.usePreferredLocale)

  const $locale = computed(() => $config.locale)

  function computeInitialChange(): LocaleChangeRequest {
    const automatic = $config.usePreferredLocale

    const localeTag = automatic
      ? prefersPartial.preferredLocale
      : $config.locale

    return [...getLocaleByTagAssertive(localeTag), automatic]
  }

  const $pendingLocaleChange = shallowRef(computeInitialChange())

  function loadLocale(locale: Locale, descriptor: LocaleDescriptor) {
    const event = new LocaleLoadEvent(descriptor, locale)

    async function callEventAndGetResult() {
      if (!(await eventTarget.dispatchEvent(event))) {
        throw new Error(
          `Cannot load locale data for the locale "${descriptor.tag}": load event is cancelled`,
        )
      }

      return event.collect()
    }

    return [callEventAndGetResult(), event.cancel.bind(null)] as const
  }

  const $defaultLocale = computed(() =>
    getLocaleByTagAssertive($config.defaultLocale),
  )

  let lastDefaultLocale: LocaleQueryResult | null = null

  const $defaultLocaleLoading = asyncComputed(
    async function loadDefaultLocale() {
      const defaultLocale = $defaultLocale.value

      if (shallowEqual(defaultLocale, lastDefaultLocale)) return

      const [locale, descriptor] = $defaultLocale.value

      const [localeData, cancelLoading] = loadLocale(locale, descriptor)

      this.onCancel(cancelLoading)

      Object.assign(locale, await localeData)

      lastDefaultLocale = defaultLocale
    },
  )

  observe($locales, () => {
    $pendingLocaleChange.value = computeInitialChange()
  })

  let lastLocaleChange: LocaleChangeRequest | null = null

  const $loading = asyncComputed({
    watch: () => $pendingLocaleChange.value,
    async get(pendingLocaleChange) {
      if (shallowEqual(pendingLocaleChange, lastLocaleChange)) return

      const [locale, descriptor, automated] = pendingLocaleChange

      const pendingLocale: LocaleQueryResult = [locale, descriptor]

      if (shallowEqual(pendingLocale, $defaultLocale.value)) {
        await $defaultLocaleLoading.promise
      } else {
        const [lastLocale, lastDescriptor] = lastLocaleChange ?? []

        if (!shallowEqual(pendingLocale, [lastLocale, lastDescriptor])) {
          const [localeData, cancelLoading] = loadLocale(locale, descriptor)

          this.onCancel(cancelLoading)

          Object.assign(locale, await localeData)
        }
      }

      $config.locale = descriptor.tag

      eventTarget.dispatchEvent(
        new AfterLocaleChangeEvent(
          lastLocaleChange?.[1] ?? null,
          descriptor,
          automated,
        ),
      )

      lastLocaleChange = pendingLocaleChange
    },
  })

  function canChangeLocale(
    descriptor: LocaleDescriptor,
    automatically: boolean,
  ) {
    const previousDescriptor = lastLocaleChange?.[1] ?? null

    return eventTarget.dispatchEvent(
      new LocaleChangeEvent(previousDescriptor, descriptor, automatically),
    )
  }

  observe(
    () => ({
      isEnabled: $automatic.value,
      localeTag: prefersPartial.preferredLocale,
    }),
    ({ isEnabled, localeTag }) => {
      if (!isEnabled) return

      const [locale, descriptor] = getLocaleByTagAssertive(localeTag)

      if (!canChangeLocale(descriptor, true)) return

      $pendingLocaleChange.value = [locale, descriptor, true]
    },
  )

  function addLocale(
    descriptor: string | LocaleDescriptor,
    force?: boolean,
  ): LocaleDescriptor {
    const normalizedDescriptor: LocaleDescriptor =
      typeof descriptor === 'string' ? { tag: descriptor } : descriptor

    const newLocales: LocaleDescriptor[] = []

    for (const locale of $config.locales) {
      if (locale.tag === normalizedDescriptor.tag) {
        if (!force) {
          throw new Error(`Locale "${normalizedDescriptor.tag}" already exists`)
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
    const index = $config.locales.findIndex(
      typeof descriptor === 'string'
        ? (locale) => locale.tag === descriptor
        : (locale) => toRaw(locale) === descriptor,
    )

    return index === -1 ? null : $config.locales.splice(index, 1)[0] ?? null
  }

  function addMessages(
    descriptor: string | LocaleDescriptor,
    messages: Partial<MessagesMap>,
  ) {
    let locale: Locale | undefined

    if (typeof descriptor === 'string') {
      locale = getLocaleByTagAssertive(descriptor)[0]
    } else {
      locale = getLocaleAssertive(descriptor)
    }

    if (locale.messages == null) {
      locale.messages = createHashMap() as MessagesMap
    }

    Object.assign(locale.messages, messages)
  }

  function canToggleAutomation(state: boolean) {
    return eventTarget.dispatchEvent(new AutomaticStateChangeEvent(state))
  }

  async function waitUntilReady() {
    await $defaultLocaleLoading.promise
    await $loading.promise
  }

  async function changeLocale(localeTag: string) {
    let newLocale: readonly [Locale, LocaleDescriptor] | undefined

    if (localeTag === 'auto') {
      if (!canToggleAutomation(true)) {
        throw new Error('Enabling of automatic mode has been cancelled')
      }
    } else {
      newLocale = getLocaleByTagAssertive(localeTag)

      if ($automatic.value && !canToggleAutomation(false)) {
        throw new Error('Disabling of automatic mode has been cancelled')
      }

      // TODO: move before automatic state change event after converted to beforelocalechange
      if (!canChangeLocale(newLocale[1], false)) {
        throw new Error(`Locale change to "${localeTag}" was cancelled`)
      }
    }

    $config.usePreferredLocale = newLocale == null

    if (newLocale != null) $pendingLocaleChange.value = [...newLocale, false]

    return waitUntilReady()
  }

  return mergeDescriptors(
    defineGetters({ $loading, $defaultLocaleLoading, $locales }),
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
      waitUntilReady,
    },
  )
}
