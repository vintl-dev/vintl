import {
  computed,
  defineComponent,
  type VNode,
  type SlotsType,
  type SetupContext,
} from 'vue'
import { useVIntl } from '../runtime/index.ts'
import { type MessageContent, type MessageValues } from '../types/index.ts'
import { createRecord, normalizeDynamicOutput } from './utils/index.ts'

function isValueSlotName(slotName: string): slotName is `~${string}` {
  return slotName.startsWith('~')
}

interface FormattedMessageProps<Values extends MessageValues> {
  id: string
  description?: string | object
  defaultMessage?: MessageContent
  values?: Values
}

interface FormattedMessageSlots<Values extends MessageValues> {
  [key: string]: (ctx: { children: (VNode | string)[]; values: Values }) => any
  [key: `~${string}`]: (ctx: { values: Values }) => any
}

export const FormattedMessage = defineComponent(
  function FormattedMessage<Values extends MessageValues>(
    props: FormattedMessageProps<Values>,
    ctx: SetupContext<{}, SlotsType<Partial<FormattedMessageSlots<Values>>>>,
  ) {
    const descriptor = computed(() => ({
      id: props.id,
      defaultMessage: props.defaultMessage,
      description: props.description,
    }))

    const values = computed<MessageValues>(() => {
      const combinedValues = createRecord() as Values
      Object.assign(combinedValues, props.values)

      const slotValues = createRecord() as MessageValues

      const { slots } = ctx

      for (const slotKey in slots) {
        if (slots[slotKey] == null) continue

        if (isValueSlotName(slotKey)) {
          slotValues[slotKey.slice(1)] = slots[slotKey]!({
            values: combinedValues,
          })
        } else {
          slotValues[slotKey] = (children: (string | VNode)[]) =>
            slots[slotKey]!({ values: combinedValues, children })
        }
      }

      Object.assign(combinedValues, slotValues)

      return combinedValues
    })

    const vintl = useVIntl()

    return () => {
      const output = vintl.intl.formatMessage(descriptor.value, values.value)

      return normalizeDynamicOutput(output)
    }
  },
  {
    props: {
      id: {
        type: String,
        required: true,
        default: undefined,
      },
      defaultMessage: {
        type: String,
        required: false,
        default: undefined,
      },
      description: {
        type: String,
        required: false,
        default: undefined,
      },
      values: {
        type: Object,
        required: false,
        default() {
          return {}
        },
      },
    },
    slots: Object as any,
  },
)
