import {
  type Component,
  h as createElement,
  type SetupContext,
  isVNode,
  createTextVNode,
} from 'vue'
import type {
  CustomMessageValues,
  MessageContent,
  MessageDescriptor,
  MessageID,
  MessageValues,
  MessageValueType,
} from './types/messages.js'
import { useI18n } from './runtime/useI18n.js'

/** Represents a value that can be either `T` or an array of `T`. */
type MaybeArray<T> = T | T[]

function createObject() {
  return Object.create(null)
}

interface CommonProps {
  tags?: string[]
}

interface PropsWithMessageIDNormal<I extends MessageID> extends CommonProps {
  messageId: I | MessageDescriptor<I>
  values?: CustomMessageValues<I>
}

interface PropsWithMessageIDSlashed<I extends MessageID> extends CommonProps {
  'message-id': I | MessageDescriptor<I>
  values?: CustomMessageValues<I>
}

type PropsWithMessageID<I extends MessageID> =
  | PropsWithMessageIDNormal<I>
  | PropsWithMessageIDSlashed<I>

interface PropsWithMessage extends CommonProps {
  message: MessageContent
  values?: MessageValues
}

function isObject(value: unknown): value is object {
  return value != null && typeof value === 'object'
}

function isPropsWithMessageID<I extends MessageID>(
  value: unknown,
): value is PropsWithMessageID<I> {
  return isObject(value) && ('messageId' in value || 'message-id' in value)
}

function isPropsWithMessage(value: unknown): value is PropsWithMessage {
  return isObject(value) && 'message' in value
}

function getMessageID<I extends MessageID>(
  props: PropsWithMessageID<I>,
): I | MessageDescriptor<I> {
  if ('message-id' in props) {
    return props['message-id']
  }

  return props.messageId
}

export function IntlFormatted<I extends MessageID>(
  props: PropsWithMessageID<I> | PropsWithMessage,
  context: SetupContext,
) {
  if (!isPropsWithMessageID(props) && !isPropsWithMessage(props)) {
    throw new Error(
      'IntlFormatted cannot be rendered without "message-id" or "message" properties',
    )
  }

  const { intl, normalizeMessageDescriptor: getDescriptor } = useI18n<any>()

  /** Initial values are passed to the slots. */
  const initialValues: MessageValues = createObject()

  /**
   * Provided values are values that were automatically provided by the
   * IntlFormatted component. They are also used to format the message.
   *
   * Initial values are to be merged before assigning provided values.
   */
  const values: MessageValues = createObject()

  if (props.values != null) {
    Object.assign(initialValues, props.values)
    Object.assign(values, initialValues)
  }

  if (Array.isArray(props.tags)) {
    for (const tag of props.tags) {
      let key: string
      let component: Component | string

      if (Array.isArray(tag)) {
        key = tag[0]
        component = tag[1]
      } else {
        if (typeof tag !== 'string') {
          throw new TypeError(
            'Custom components must be provided as array of [name, component]',
          )
        }

        key = tag
        component = tag
      }

      values[key] = (children) => {
        const newChildren = []

        for (const child of children) {
          if (Array.isArray(child)) {
            newChildren.push(...child)
          } else {
            newChildren.push(
              isVNode(child) ? child : createTextVNode(String(child)),
            )
          }
        }

        if (typeof component === 'string') {
          return [createElement(component, newChildren)]
        } else {
          return [createElement(component, newChildren)]
        }
      }
    }
  } else if (props.tags != null) {
    throw new Error(
      'Property "tags" of IntlFormatted needs to be of array type or null / undefined',
    )
  }

  for (const [name, slot] of Object.entries(context.slots)) {
    if (!slot) continue

    if (name.startsWith('~')) {
      const res = slot({
        values: initialValues,
      })

      if (res != null) {
        if (res.length > 1) {
          throw new Error(
            `Slot argument "${name}" returned more than one child`,
          )
        }

        values[name.slice(1)] = res[0]
      }
    } else {
      values[name] = (children) => {
        const res = slot({
          children,
          values: initialValues,
        })

        if (res != null) {
          if (res.length > 1) {
            throw new Error(
              `Wrapping slot "${name}" returned more than one child`,
            )
          }

          return res[0]
        }

        return ''
      }
    }
  }

  let formatted: MaybeArray<MessageValueType | string>

  if (isPropsWithMessage(props)) {
    formatted = intl.formatters
      .getMessageFormat(props.message, intl.locale, intl.formats)
      .format(values)
  } else {
    const messageId = getMessageID(props)

    if (messageId != null) {
      formatted = intl.formatMessage(getDescriptor(messageId), values)
    } else {
      // Should never end up here, but tell that to TypeScript :\
      throw new Error(
        'Illegal state: neither message nor messageId properties provided',
      )
    }
  }

  return (Array.isArray(formatted) ? formatted.flat() : [formatted]).map(
    (child) => {
      return isVNode(child) ? child : createTextVNode(String(child))
    },
  )
}
