import {
  createIntl,
  createIntlCache,
  type IntlShape,
} from '@braw/extended-intl'
import { computed, ref } from 'vue'
import type { TranslateFunction } from '../types/index.js'
import type {
  MessageContent,
  MessageDescriptor,
  MessagesMap,
} from '../types/messages.js'
import {
  defineGetters,
  defineRefGetters,
  mergeDescriptors,
} from '../utils/definer.js'
import { createHashMap as createHashmap } from '../utils/hashmap.js'
import type { ReverseMap } from '../utils/types.js'
import { observe } from '../utils/vue.js'
import type { ControllerConfiguration } from './config.js'
import type { LocaleDataPartial } from './data.js'

const formatAliases = {
  formatCompactNumber: 'compactNumber',
  formatCustomMessage: 'customMessage',
  formatDate: 'date',
  formatDateTimeRange: 'dateTimeRange',
  formatDateToParts: 'dateToParts',
  formatDisplayName: 'displayName',
  formatList: 'list',
  formatListToParts: 'listToParts',
  formatMessage: 'message',
  formatNumber: 'number',
  formatNumberToParts: 'numberToParts',
  formatPlural: 'plural',
  formatRelativeTime: 'relativeTime',
  formatTime: 'time',
  formatTimeToParts: 'timeToParts',
  $ago: '$ago',
  formatTimeDifference: 'timeDifference',
} as const satisfies Partial<Record<keyof IntlShape, string>>
// ~~~~~~~
// NOTE: You might need to remove as const so auto-complete works, also you can't place it after satisfier, that's not supported :(

type InvertedMapping = ReverseMap<typeof formatAliases>

/**
 * Represents a map of formatting functions taken from {@link IntlShape} under a
 * shorter name. This is used to define `$fmt` global variable in Vue components
 * when the plugin is installed, as well as a return value for the
 * `useFormatters` runtime function.
 */
export type FormatAliases<T> = {
  [K in keyof InvertedMapping]: IntlShape<T>[InvertedMapping[K]]
}

export interface IntlPartial<T> {
  /**
   * Read-only map of formatting functions taken from {@link IntlShape}.
   *
   * @see {@link FormatAliases} for details.
   */
  get formats(): FormatAliases<T>

  /** Active {@link IntlShape} instance. */
  get intl(): IntlShape<T>

  /**
   * Improved variant of {@link IntlShape.formatMessage} function that uses
   * {@link LocaleDataPartial.defaultMessages} as fallback if string is missing
   * from the messages of the current locale.
   *
   * @see {@link TranslateFunction} For information about parameters and return values.
   */
  get formatMessage(): TranslateFunction
}

export function useIntlPartial<ControllerType>(
  $config: ControllerConfiguration<ControllerType>,
  localeDataPartial: LocaleDataPartial,
): IntlPartial<ControllerType> {
  const $formats = ref(createHashmap() as FormatAliases<ControllerType>)

  const intlCache = createIntlCache()

  const $intl = computed(() =>
    createIntl<ControllerType>(
      {
        locale: $config.locale,
        defaultLocale: $config.defaultLocale,
        messages: localeDataPartial.messages as MessagesMap,
      },
      intlCache,
    ),
  )

  observe($intl, (intl) => {
    const formats = $formats.value as Record<keyof InvertedMapping, unknown>
    for (const [intlProp, alias] of Object.entries(formatAliases)) {
      formats[alias] = intl[intlProp as keyof IntlShape<ControllerType>]
    }
  })

  const formatMessage: TranslateFunction = function formatMessage(
    descriptor,
    values,
    opts?,
  ) {
    let result: ReturnType<IntlPartial<ControllerType>['intl']['$t']> = ''

    const normalizedDescriptor: MessageDescriptor =
      typeof descriptor === 'string'
        ? {
            id: descriptor,
            defaultMessage: localeDataPartial.defaultMessages[
              descriptor
            ] as MessageContent,
          }
        : descriptor

    result = $intl.value.formatMessage(
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

  return mergeDescriptors(
    defineRefGetters({ $formats, $intl }),
    defineGetters({ formatMessage }),
  )
}
