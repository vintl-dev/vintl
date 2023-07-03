import { defineComponent, ref } from 'vue'
import {
  FormattedNumberParts,
  type FormattedNumberPartsSlots,
} from '../../../dist/components'

export const Counter = defineComponent(() => {
  const count = ref(0)

  const incrementByOne = () => {
    count.value++
  }

  const incrementByThousand = () => {
    count.value += 1000
  }

  const reset = () => {
    count.value = 0
  }

  return () => {
    const slots: FormattedNumberPartsSlots = {
      default: ({ parts }) =>
        parts.map((part) =>
          part.type === 'integer' ? <b>{part.value}</b> : part.value,
        ),
    }

    return (
      <div>
        <p data-testid="counter">
          <FormattedNumberParts value={count.value} notation="compact">
            {slots}
          </FormattedNumberParts>
        </p>
        <button onClick={incrementByOne}>+1</button>
        <button onClick={incrementByThousand}>+1000</button>
        <button onClick={reset}>Reset</button>
      </div>
    )
  }
})
