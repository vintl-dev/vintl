import { createIntl, createIntlCache, type IntlShape } from '@formatjs/intl'
import { computed, ref } from 'vue'
import type { Options as MessageFormattingOptions } from 'intl-messageformat'
import type { TranslateFunction } from '../types/index.js'
import type {
  MessageContent,
  MessageDescriptor,
  MessageID,
  MessagesMap,
  MessageValues,
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

  /**
   * Formats a custom message using the provided values.
   *
   * @param message ICU MessageFormat message or its AST.
   * @param values Values to format {@link message} with.
   * @param opts Optional parser options.
   * @returns Normalized formatted message.
   */
  get formatCustomMessage(): (
    this: void,
    message: MessageContent,
    values?: MessageValues,
    opts?: MessageFormattingOptions,
  ) => string
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

  function normalizeOutput(
    output: string | ControllerType | (string | ControllerType)[],
  ) {
    if (typeof output === 'string') return output

    if (Array.isArray(output)) {
      let normalized = ''

      for (const item of output) {
        normalized += String(item)
      }

      return normalized
    }

    return String(output)
  }

  function normalizeDescriptor<ID extends MessageID>(
    inputDescriptor: MessageDescriptor<ID> | ID,
  ) {
    let descriptor: MessageDescriptor<ID>

    if (typeof inputDescriptor === 'string') {
      descriptor = { id: inputDescriptor }

      if ($config.defaultMessageOrder.includes('locale')) {
        descriptor.defaultMessage =
          localeDataPartial.defaultMessages[inputDescriptor]
      }

      return descriptor
    }

    for (const source of $config.defaultMessageOrder) {
      if (source === 'descriptor') {
        if (inputDescriptor.defaultMessage == null) continue

        return inputDescriptor
      }

      if (source === 'locale') {
        const defaultMessage =
          localeDataPartial.defaultMessages[inputDescriptor.id]

        if (defaultMessage == null) continue

        descriptor = {
          ...inputDescriptor,
          defaultMessage,
        }

        return descriptor
      }
    }

    if (inputDescriptor.defaultMessage == null) {
      return inputDescriptor
    }

    return (descriptor = {
      ...inputDescriptor,
      defaultMessage: undefined,
    })
  }

  const formatMessage: TranslateFunction = function formatMessage(
    descriptor,
    values,
    opts?,
  ) {
    let result: ReturnType<IntlPartial<ControllerType>['intl']['$t']> = ''

    result = $intl.value.formatMessage(
      normalizeDescriptor(descriptor),
      values as Record<string, any>,
      opts,
    )

    return normalizeOutput(result)
  }

  function formatCustomMessage(
    message: MessageContent,
    values?: MessageValues,
    opts?: MessageFormattingOptions,
  ) {
    const intl = $intl.value

    return normalizeOutput(
      intl.formatters
        .getMessageFormat(message, intl.locale, intl.formats, opts)
        .format(values as Record<string, any>),
    )
  }

  return mergeDescriptors(
    defineRefGetters({ $formats, $intl }),
    defineGetters({ formatMessage, formatCustomMessage }),
  )
}
