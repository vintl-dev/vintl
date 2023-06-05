import type { FormatDateOptions } from '@formatjs/intl'
import {
  createTextVNode,
  defineComponent,
  type PropType,
  type SetupContext,
  type SlotsType,
} from 'vue'
import { useVIntl } from '../runtime/index.ts'

interface FormattedDateTimeRangeDefinedProps {
  from: Date | number
  to: Date | number
}

export interface FormattedDateTimeRangeProps
  extends FormattedDateTimeRangeDefinedProps,
    FormatDateOptions {}

export interface FormattedDateTimeRangeSlots {
  default(props: { formattedValue: string }): any
}

export const FormattedDateTimeRange = defineComponent(
  (
    props: FormattedDateTimeRangeProps,
    ctx: SetupContext<{}, SlotsType<Partial<FormattedDateTimeRangeSlots>>>,
  ) => {
    const vintl = useVIntl()

    return () => {
      const { from, to, ...options } = props

      const formattedValue = vintl.intl.formatDateTimeRange(from, to, options)

      return (
        ctx.slots.default?.({ formattedValue }) ??
        createTextVNode(formattedValue)
      )
    }
  },
  {
    inheritAttrs: false,
    props: {
      from: {
        required: true,
        type: [Number, Date] as PropType<Date | number>,
        default: undefined,
      },
      to: {
        required: true,
        type: [Number, Date] as PropType<Date | number>,
        default: undefined,
      },
    },
  },
)
