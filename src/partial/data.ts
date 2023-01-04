import { computed, type ComputedRef, type Ref } from 'vue'
import type { Locale } from '../types/locales.js'
import type { MessagesMap } from '../types/messages.js'
import {
  defineGetters,
  defineRefGetters,
  mergeDescriptors,
} from '../utils/definer.js'
import type { ControllerConfiguration } from './config.js'

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

export function useLocaleDataPartial(
  $config: ControllerConfiguration,
  $locales: Ref<Record<string, Locale>>,
): LocaleDataPartial {
  function getLocale(localeCode: string) {
    const locale = $locales.value[localeCode]

    if (locale == null) {
      throw new Error(`Unknown locale "${localeCode}"`)
    }

    return locale
  }

  const $defaultMessages = computed(
    () => getLocale($config.defaultLocale).messages,
  )

  const $messages = computed(() => getLocale($config.locale).messages)

  const $defaultResources = computed(
    () => getLocale($config.defaultLocale).resources,
  )

  const $resources = computed(() => getLocale($config.locale).resources)

  const refs = {
    $defaultMessages,
    $messages,
    $defaultResources,
    $resources,
  }

  return mergeDescriptors(defineGetters(refs), defineRefGetters(refs))
}
