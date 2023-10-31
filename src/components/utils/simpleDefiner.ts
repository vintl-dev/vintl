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
import { normalizeAttrs } from './index.ts'
import type { PartsFormattersKeys } from './definersCommon.ts'

export function formatterComponentName(name: string) {
  return name.startsWith('format')
    ? `Formatted${name.split('To').join('')}`
    : `IntlFormatted$${name}`
}

type NonUtilityFormattersKeys<K = keyof IntlFormatters> = K extends `$${string}`
  ? never
  : K

type ComplexFormattersKeys =
  | 'formatMessage'
  | 'formatDateTimeRange'
  | 'formatRelativeTime'
  | 'formatPlural'
  | 'formatList'

type SimpleFormattersKeys<K = NonUtilityFormattersKeys> =
  K extends PartsFormattersKeys
    ? never
    : K extends ComplexFormattersKeys
    ? never
    : K

export interface SimpleFormatterDefinedProps<
  FormatterName extends SimpleFormattersKeys,
> {
  value: Parameters<IntlFormatters<MessageValueType>[FormatterName]>[0]
}

export type SimpleFormatterOptions<FormatterName extends SimpleFormattersKeys> =
  NonNullable<Parameters<IntlFormatters<MessageValueType>[FormatterName]>[1]>

export type SimpleFormatterComponentProps<
  FormatterName extends SimpleFormattersKeys,
> = SimpleFormatterDefinedProps<FormatterName> &
  SimpleFormatterOptions<FormatterName>

export type SimpleFormatterComponentSlots<
  FormatterName extends SimpleFormattersKeys,
> = {
  default?: (props: {
    formattedValue: ReturnType<IntlFormatters[FormatterName]>
  }) => any
}

export function defineSimpleFormatterComponent<
  FormatterName extends SimpleFormattersKeys,
>(name: FormatterName) {
  return defineComponent(
    (
      props: SimpleFormatterComponentProps<FormatterName>,
      ctx: SetupContext<
        {},
        SlotsType<Partial<SimpleFormatterComponentSlots<FormatterName>>>
      >,
    ) => {
      const vintl = useVIntl()

      const $options = computed(
        () =>
          normalizeAttrs(ctx.attrs) as SimpleFormatterOptions<FormatterName>,
      )

      const $formatter = computed(() => vintl.intl[name])

      return () => {
        const formattedValue = $formatter.value(
          props.value as any,
          $options.value as any,
        ) as ReturnType<IntlFormatters[FormatterName]>

        return [
          ctx.slots.default?.({ formattedValue }) ??
            createTextVNode(formattedValue),
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
