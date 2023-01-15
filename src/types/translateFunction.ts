import type { Options } from 'intl-messageformat'
import type {
  CustomMessageValues,
  MessageDescriptor,
  MessageID,
} from './messages.js'

/**
 * Represents a translation function that accepts either a message ID or a
 * descriptor, values for that message, and formatting options.
 *
 * @template ID Identifier of the message.
 * @template AcceptedValueTypes Types that IntlShape accepts.
 * @param descriptor Either a message ID or a descriptor containing that ID and
 *   other properties like `defaultMessage`.
 * @param values Values to format the message with.
 * @param opts Formatter options.
 * @returns Always a string with all generated values returning a string.
 */
export type TranslateFunction = <ID extends MessageID>(
  descriptor: ID | MessageDescriptor<ID>,
  values: CustomMessageValues<ID>,
  opts?: Options,
) => string
