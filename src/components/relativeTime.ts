import type { FormatRelativeTimeOptions } from '@formatjs/intl'
import {
  createTextVNode,
  defineComponent,
  type SetupContext,
  type SlotsType,
  type PropType,
  computed,
} from 'vue'
import { useVIntl } from '../runtime/index.ts'
import { normalizeAttrs } from './utils/index.ts'

interface RealProps {
  value: number
  unit: Intl.RelativeTimeFormatUnit
}

export interface FormattedRelativeTimeProps
  extends RealProps,
    FormatRelativeTimeOptions {}

export interface FormattedRelativeTimeSlots {
  default(props: { formattedValue: string }): any
}

export const FormattedRelativeTime = defineComponent(
  (
    props: FormattedRelativeTimeProps,
    ctx: SetupContext<{}, SlotsType<Partial<FormattedRelativeTimeSlots>>>,
  ) => {
    const vintl = useVIntl()

    const $options = computed(
      () => normalizeAttrs(ctx.attrs) as FormatRelativeTimeOptions,
    )

    return () => {
      const { value, unit } = props as RealProps

      const formattedValue = vintl.intl.formatRelativeTime(
        value ?? 0,
        unit,
        $options.value,
      )

      return (
        ctx.slots.default?.({ formattedValue }) ??
        createTextVNode(formattedValue)
      )
    }
  },
  {
    inheritAttrs: false,
    props: {
      unit: {
        type: String as PropType<Intl.RelativeTimeFormatUnit>,
        required: false,
        default: 'seconds',
      },
      value: {
        type: Number,
        required: false,
        default: 0,
      },
    },
  },
)
