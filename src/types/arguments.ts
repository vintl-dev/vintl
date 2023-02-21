import type { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat'
import type { MessageValueType } from './messages.js'

/**
 * Represents a value for unknown argument. This is a last resort type to use,
 * which allows both wrappers and regular values. It's primary use is when type
 * cannot be determined from the use of argument.
 */
export type AnyArgument =
  | PrimitiveType
  | MessageValueType
  | FormatXMLElementFn<MessageValueType>

/**
 * Represents a value for a value argument.
 *
 * Example of argument: `{value}`.
 */
export type ValueArgument = PrimitiveType | MessageValueType

/**
 * Represents a value for an rich text formatting argument.
 *
 * Example of argument: `<value></value>`.
 */
export type RichArgument = FormatXMLElementFn<MessageValueType>

/**
 * Represents a value for a number argument.
 *
 * Example of argument: `{value, number}`.
 */
export type NumberArgument = string | number | bigint

/**
 * Represents a value for a date or time argument.
 *
 * Example of arguments:
 *
 * - `{value, date}`
 * - `{value, time}`
 */
export type DateArgument = Date | string | number

/** Represents a valid keyword in selector. */
type _SelectKeywordAcceptable = string | number

/**
 * Represents a value for a select argument where `KeywordUnion` is a union of
 * string/number keywords.
 *
 * Example of argument: `{value, select, cat {Cat} other {Animal}}`.
 *
 * For the example above the `KeywordUnion` must be: `'cat' | 'other'`.
 */
export type SelectArgument<KeywordUnion> =
  | KeywordUnion
  | (_SelectKeywordAcceptable & Record<never, never>)

export default {}
