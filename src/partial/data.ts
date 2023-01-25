import { computed, type ComputedRef } from 'vue'
import type { MessagesMap } from '../types/messages.js'
import {
  defineGetters,
  defineRefGetters,
  mergeDescriptors,
} from '../utils/definer.js'
import { createHashMap } from '../utils/hashmap.js'
import type { ControllerConfiguration } from './config.js'
import type { LocalesPartial } from './locales.js'

export interface LocaleDataPartial {
  /** Read-only reference to default messages map. */
  get $defaultMessages(): ComputedRef<MessagesMap>

  /** Read-only reference to messages map for the current locale. */
  get $messages(): ComputedRef<Partial<MessagesMap>>

  /** Read-only reference to the default resources map. */
  get $defaultResources(): ComputedRef<VueIntlController.LocaleResources>

  /** Read-only reference to the active */
  get $resources(): ComputedRef<Partial<VueIntlController.LocaleResources>>

  /** Read-only map of default messages. */
  get defaultMessages(): MessagesMap

  /** Read-only map of messages for the current locale. */
  get messages(): Partial<MessagesMap>

  /** Read-only resource map for the default locale. */
  get defaultResources(): VueIntlController.LocaleResources

  /* Read-only resource map. */
  get resources(): Partial<VueIntlController.LocaleResources>
}

export function useLocaleDataPartial<ControllerType>(
  $config: ControllerConfiguration<ControllerType>,
  locales: LocalesPartial,
): LocaleDataPartial {
  function getLocale(localeTag: string) {
    const descriptor = locales.getLocaleDescriptor(localeTag)

    if (descriptor == null) {
      throw new Error(`Unknown locale "${localeTag}"`)
    }

    return locales.$locales.value.get(descriptor)
  }

  const $defaultMessages = computed(
    () =>
      getLocale($config.defaultLocale)?.messages ??
      (createHashMap() as MessagesMap),
  )

  const $messages = computed(
    () =>
      getLocale($config.locale)?.messages ?? (createHashMap() as MessagesMap),
  )

  const $defaultResources = computed(
    () => getLocale($config.defaultLocale)?.resources ?? createHashMap(),
  )

  const $resources = computed(
    () => getLocale($config.locale)?.resources ?? createHashMap(),
  )

  const refs = {
    $defaultMessages,
    $messages,
    $defaultResources,
    $resources,
  }

  return mergeDescriptors(defineGetters(refs), defineRefGetters(refs))
}
