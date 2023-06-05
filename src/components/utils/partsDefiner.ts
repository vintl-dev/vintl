import type { IntlFormatters } from '@formatjs/intl'
import {
  computed,
  createTextVNode,
  defineComponent,
  type SetupContext,
  type SlotsType,
} from 'vue'
import { useVIntl } from '../../runtime/index.ts'
import type { MessageValueType } from '../../types/index.ts'
import type { PartsFormattersKeys } from './definersCommon.ts'
import { normalizeAttrs } from './index.ts'
import { formatterComponentName } from './simpleDefiner.ts'

export interface PartsFormatterDefinedProps<
  FormatterName extends PartsFormattersKeys,
> {
  value: Parameters<IntlFormatters<MessageValueType>[FormatterName]>[0]
}

export type PartsFormatterOptions<FormatterName extends PartsFormattersKeys> =
  NonNullable<Parameters<IntlFormatters<MessageValueType>[FormatterName]>[1]>

export type PartsFormatterComponentProps<
  FormatterName extends PartsFormattersKeys,
> = PartsFormatterDefinedProps<FormatterName> &
  PartsFormatterOptions<FormatterName>

export type PartsFormatterComponentSlots<
  FormatterName extends PartsFormattersKeys,
> = {
  default?: (props: { parts: ReturnType<IntlFormatters[FormatterName]> }) => any
}

export function definePartsFormatterComponent<
  FormatterName extends PartsFormattersKeys,
>(name: FormatterName) {
  return defineComponent(
    (
      props: PartsFormatterComponentProps<FormatterName>,
      ctx: SetupContext<
        {},
        SlotsType<Partial<PartsFormatterComponentSlots<FormatterName>>>
      >,
    ) => {
      const vintl = useVIntl()

      const $options = computed(
        () => normalizeAttrs(ctx.attrs) as PartsFormatterOptions<FormatterName>,
      )

      const $formatter = computed(() => vintl.intl[name])

      return () => {
        const parts = $formatter.value(
          props.value as any,
          $options.value as any,
        ) as any

        return [
          ctx.slots.default?.({ parts }) ??
            createTextVNode(
              (parts as { value: string }[]).map((part) => part.value).join(''),
            ),
        ]
      }
    },
    {
      name: formatterComponentName(name),
      inheritAttrs: false,
      // eslint-disable-next-line vue/require-prop-types
      props: ['value'],
    },
  )
}
