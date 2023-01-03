import type { MessageDescriptor as RawMessageDescriptor } from '@formatjs/intl'
import type { MessageFormatElement } from '@formatjs/icu-messageformat-parser'
import type { VNode } from 'vue'
import type { CompactNumber, IntlFormatters } from '@braw/extended-intl'

declare global {
  namespace VueIntlController {
    /** Represents any value that controller accepts by default. */
    interface MessageValueTypes {
      __defaults: VNode | CompactNumber
    }

    /**
     * Represents a map of custom messages.
     *
     * This interface that can be augmented through TypeScript ambient module
     * declarations for better type checking. Each property should resolve to an
     * object containing values present in the variable.
     *
     * **Note**: this interface will be removed in Vue 3 in generics on
     * components and functions.
     */
    interface CustomMessages {}
  }
}

/**
 * Represents all message value types gathered from
 * `VueIntlController.MessageValueType`.
 */
export type MessageValueType =
  VueIntlController.MessageValueTypes[keyof VueIntlController.MessageValueTypes]

/**
 * Represents an individual message ID.
 *
 * This value depends on the {@link CustomMessages} declaration: if it's empty
 * and was not augmented, then this will resolve to a simple string, otherwise
 * it contains all of the keys defined for that interface.
 */
export type MessageID = keyof VueIntlController.CustomMessages extends never
  ? string
  : keyof VueIntlController.CustomMessages

declare global {
  namespace FormatjsIntl {
    interface Message {
      ids: MessageID
    }
  }
}

/**
 * Represents a message descriptor that uses acceptable messages IDs (see
 * {@link MessageID} and {@link CustomMessages}).
 */
export type MessageDescriptor<I extends string = MessageID> = Omit<
  RawMessageDescriptor,
  'id'
> & {
  id: I
}

/**
 * Represents an unparsed message map where messages are mapped to message
 * contents that must be parsed in runtime.
 */
type UnparsedMessagesMap = {
  [K in MessageID]: string
}

/** Represents a parsed message map where message IDs are mapped to message AST. */
type ParsedMessagesMap = {
  [K in MessageID]: MessageFormatElement[]
}

/** Represents message content. */
export type MessageContent = string | MessageFormatElement[]

/** Represents a map of messages. */
export type MessagesMap = UnparsedMessagesMap | ParsedMessagesMap

type NonUndefined<T> = T extends undefined ? never : T

type MessageFormatter = IntlFormatters<MessageValueType>['formatMessage']

/** Represents a record of values that can be used with translate function. */
export type MessageValues = NonUndefined<Parameters<MessageFormatter>[1]>

export type CustomMessageValues<I extends MessageID | unknown = unknown> =
  I extends unknown
    ? MessageValues
    : I extends keyof VueIntlController.CustomMessages
    ? VueIntlController.CustomMessages[I]
    : MessageValues

/** Represents a record of values that can be used with translate function. */
export type InputValues = NonUndefined<Parameters<MessageFormatter>[1]>

export default {}
