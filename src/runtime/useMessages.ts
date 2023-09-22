import type { MessageDescriptor as MessageDescriptorBase } from '@formatjs/intl'
import type { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat'
import { computed, isRef, reactive, type ComputedRef, type Ref } from 'vue'
import type { IntlController } from '../controller.ts'
import type { MessageValueType } from '../index.ts'
import { useVIntl } from './useVIntl.ts'

type MaybeRef<T> = T | Ref<T>

type PrimitiveValuesRecord = MaybeRef<{
  [key: string]: MaybeRef<PrimitiveType | FormatXMLElementFn<PrimitiveType>>
}>

type ValuesRecord<RichTypes> = MaybeRef<{
  [key: string]: MaybeRef<
    PrimitiveType | RichTypes | FormatXMLElementFn<PrimitiveType | RichTypes>
  >
}>

interface MessageDescriptor<RichTypes> extends MessageDescriptorBase {
  /**
   * A record of the values for arguments used in the message. Can contain Vue
   * references, which will be unwrapped, or be a reference itself.
   */
  values?: ValuesRecord<RichTypes>
}

type MessageDescriptorOutput<
  Descriptor extends MessageDescriptor<RichTypes>,
  RichTypes,
> = [Descriptor['values']] extends [undefined]
  ? string
  : Descriptor['values'] extends PrimitiveValuesRecord
  ? string
  : Array<string | RichTypes> | RichTypes | string

type MessageDescriptorsRecord<RichTypes> = Record<
  string,
  MessageDescriptor<RichTypes>
>

type MessageDescriptorsRecordOutput<
  Descriptor extends MessageDescriptorsRecord<RichTypes>,
  RichTypes,
> = {
  [K in keyof Descriptor]: MessageDescriptorOutput<Descriptor[K], RichTypes>
}

function formatMessage<
  Descriptor extends MessageDescriptor<RichTypes>,
  RichTypes,
>(
  message: Descriptor,
  vintl: IntlController<MessageValueType>,
): MessageDescriptorOutput<Descriptor, RichTypes> {
  const values = Object.create(null)
  const rawInputs = message.values

  if (isRef(rawInputs)) {
    Object.assign(values, rawInputs.value)
  } else if (rawInputs != null) {
    for (const k in rawInputs) {
      const input = rawInputs[k]
      values[k] = isRef(input) ? input.value : input
    }
  }

  return vintl.intl.formatMessage(message, values)
}

/**
 * Accepts a plain object of extended message descriptors, which may contain
 * `values` alongside the message declaration itself. It then creates an object
 * where each descriptor is mapped to a formatted. The object is reactive and
 * message properties will be updating when the language, messages or values in
 * the messages change.
 *
 * You can use `toRef` or `useMessages` to create read-only references for
 * individual.
 *
 * @example
 *   const messages = useMessages({
 *     farewell: {
 *       id: 'farewell',
 *       defaultMessage: 'Goodbye, {user}!',
 *       values: {
 *         user: computed(() => user.value.displayName),
 *       },
 *     },
 *     richText: {
 *       id: 'rich-text',
 *       defaultMessage: '<red>This text is red.</red>',
 *       values: {
 *         red(children) {
 *           return h('span', { style: { color: 'red' } }, [children])
 *         },
 *       },
 *     },
 *   })
 *
 *   console.log(messages.farewell) // 'Goodbye, Andrea Rees!'
 *
 * @param messages A record of message descriptors.
 * @returns A reactive map of messages.
 */
export function useMessages<
  Descriptor extends MessageDescriptorsRecord<RichTypes>,
  RichTypes = MessageValueType,
>(messages: Descriptor) {
  const vintl = useVIntl()

  type PreOutput = {
    [K in keyof MessageDescriptorsRecordOutput<
      Descriptor,
      RichTypes
    >]: ComputedRef<MessageDescriptorsRecordOutput<Descriptor, RichTypes>[K]>
  }

  const target: PreOutput = Object.create(null)

  for (const key of Object.keys(messages) as (keyof Descriptor)[]) {
    const message = messages[key]

    type Message = Descriptor[typeof key]

    target[key] = computed(() =>
      formatMessage<Message, RichTypes>(message, vintl),
    )
  }

  return reactive(target)
}

/**
 * Accepts an extended message descriptor, which may contain `values` alongside
 * the message declaration itself. It then returns a read-only reference that
 * gets updated when the language, messages or the values for the message
 * change.
 *
 * @example
 *   const helloMessage = useMessage({
 *     id: 'hello',
 *     defaultMessage: 'Hello, {user}!',
 *     values: {
 *       user: computed(() => user.value.displayName),
 *     },
 *   })
 *
 *   console.log(helloMessage.value) // 'Hello, Andrea Rees!'
 *
 * @param message A message descriptor.
 * @returns A read-only reference to the actual formatted message.
 */
export function useMessage<
  Descriptor extends MessageDescriptor<RichTypes>,
  RichTypes = MessageValueType,
>(message: Descriptor) {
  const vintl = useVIntl()

  return computed(() => formatMessage<Descriptor, RichTypes>(message, vintl))
}
