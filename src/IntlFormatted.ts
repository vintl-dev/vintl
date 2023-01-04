import { type Component, defineComponent, type PropType } from 'vue'
import type { IntlController } from './partial/types.js'
import type {
  MessageContent,
  MessageDescriptor,
  MessageID,
  MessageValues,
  MessageValueType,
} from './types/index.js'
import { createTextNode, getInstance, isVNode } from './utils/vue.js'

/** Represents a value that can be either `T` or an array of `T`. */
type MaybeArray<T> = T | T[]

function createObject() {
  return Object.create(null)
}

export const IntlFormatted = defineComponent({
  functional: true,
  props: {
    messageId: {
      type: [String, Object] as PropType<
        MessageID | MessageDescriptor<MessageID>
      >,
      required: false,
      default: null,
    },
    message: {
      type: [String, Array] as PropType<MessageContent>,
      default: null,
    },
    values: {
      type: Object as PropType<MessageValues>,
      default() {
        return createObject() as MessageValues
      },
    },
    tags: {
      type: Array as PropType<string[]>,
      default() {
        return []
      },
    },
  },
  render(createElement, context) {
    const { props } = context

    if (props.messageId == null && props.message == null) {
      throw new Error(
        'IntlFormatted cannot be rendered without "message-id" or "message" properties',
      )
    }

    const $i18n = (getInstance() as any).$i18n as
      | IntlController<MessageValueType>
      | undefined

    if ($i18n == null) {
      throw new Error(
        'Cannot access active IntlController, did you initialize the plugin correctly?',
      )
    }

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
              newChildren.push(isVNode(child) ? child : createTextNode(child))
            }
          }

          return [createElement(component, newChildren)]
        }
      }
    } else if (props.tags != null) {
      throw new Error(
        'Property "tags" of IntlFormatted needs to be of array type or null / undefined',
      )
    }

    for (const [name, slot] of Object.entries(context.scopedSlots)) {
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

    if (props.message != null) {
      formatted = $i18n.formats.customMessage(props.message, values)
    } else if (props.messageId != null) {
      formatted = $i18n.intl.formatMessage(
        typeof props.messageId === 'string'
          ? { id: props.messageId }
          : props.messageId,
        values,
      )
    } else {
      // Should never end up here, but tell that to TypeScript :\
      throw new Error(
        'Illegal state: neither message nor messageId properties provided',
      )
    }

    return (Array.isArray(formatted) ? formatted.flat() : [formatted]).map(
      (child) => {
        return isVNode(child) ? child : createTextNode(child)
      },
    )
  },
})
