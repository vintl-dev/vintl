import {
  computed,
  defineComponent,
  type SlotsType,
  type SetupContext,
  type VNodeArrayChildren,
} from 'vue'
import type { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat'
import { useVIntl } from '../runtime/index.ts'
import { type MessageContent, type MessageValueType } from '../types/index.ts'
import { createRecord } from './utils/index.ts'

function isValueSlotName(slotName: string): slotName is `~${string}` {
  return slotName.startsWith('~')
}

type ValuesRecord<T = string> = Record<
  string,
  PrimitiveType | T | FormatXMLElementFn<T>
>

export interface FormattedMessageProps<T> {
  id: string
  description?: string | object
  defaultMessage?: MessageContent
  values?: ValuesRecord<T>
}

export interface FormattedMessageSlots<T> {
  [key: string]: (ctx: {
    children: (T | string)[]
    values: ValuesRecord<T>
  }) => string | T | (string | T)[]
  [key: `~${string}`]: (ctx: { values: ValuesRecord<T> }) => string | T
}

class SlotOutput<T = any> {
  constructor(public readonly value: T | T[]) {}
}

type NonArray<T> = T extends any[] ? never : T
type VNodeChildAtom = NonArray<VNodeArrayChildren[number]>
type VNodeArrayChildrenWith<T> = (
  | T
  | VNodeChildAtom
  | VNodeArrayChildrenWith<T>
)[]

function normalizeOutput<T = any>(
  rawOutput:
    | string
    | SlotOutput<string | T | (string | T)[]>
    | T
    | (string | SlotOutput<string | T | (string | T)[]> | T)[],
): VNodeArrayChildrenWith<T> {
  if (Array.isArray(rawOutput)) {
    const output: VNodeArrayChildrenWith<T> = []
    for (const child of rawOutput) {
      if (child instanceof SlotOutput) {
        if (Array.isArray(child.value)) {
          output.push(...child.value)
        } else {
          output.push(child.value)
        }
      } else {
        output.push(child)
      }
    }
    return output
  } else if (rawOutput instanceof SlotOutput) {
    return Array.isArray(rawOutput.value) ? rawOutput.value : [rawOutput.value]
  } else if (typeof rawOutput === 'string') {
    return [rawOutput]
  }

  return [rawOutput]
}

export const FormattedMessage = defineComponent(
  function FormattedMessage<T = MessageValueType>(
    props: FormattedMessageProps<T>,
    ctx: SetupContext<{}, SlotsType<Partial<FormattedMessageSlots<T>>>>,
  ) {
    const descriptor = computed(() => ({
      id: props.id,
      defaultMessage: props.defaultMessage,
      description: props.description,
    }))

    const values = computed<ValuesRecord<T>>(() => {
      const combinedValues = createRecord() as ValuesRecord<T>
      Object.assign(combinedValues, props.values)

      const slotValues = createRecord() as ValuesRecord<
        T | SlotOutput | ((children: (T | string)[]) => SlotOutput)
      >

      const { slots } = ctx

      for (const slotKey in slots) {
        if (slots[slotKey] == null) continue

        if (isValueSlotName(slotKey)) {
          slotValues[slotKey.slice(1)] = new SlotOutput(
            slots[slotKey]!({
              values: combinedValues,
            }),
          )
        } else {
          slotValues[slotKey] = (children: (T | string)[]) =>
            new SlotOutput(
              slots[slotKey]!({
                values: combinedValues,
                children,
              }),
            )
        }
      }

      Object.assign(combinedValues, slotValues)

      return combinedValues
    })

    const vintl = useVIntl()

    return () => {
      const output = vintl.intl.formatMessage(
        descriptor.value,
        values.value as any,
      )

      return normalizeOutput(output)
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
) as <Values = MessageValueType>(props: FormattedMessageProps<Values>) => any
