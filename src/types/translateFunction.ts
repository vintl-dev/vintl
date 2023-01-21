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
 * This function is unbound, it can be extracted and used on its own.
 *
 * @template ID Identifier of the message.
 * @param descriptor Either a message ID or a descriptor containing that ID and
 *   other properties like `defaultMessage`.
 * @param values Values to format the message with.
 * @param opts Formatter options.
 * @returns Always a string with all generated values returning a string.
 */
export type TranslateFunction = <ID extends MessageID>(
  this: void,
  descriptor: ID | MessageDescriptor<ID>,
  values: CustomMessageValues<ID>,
  opts?: Options,
) => string
