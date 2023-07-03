import { defineComponent, ref } from 'vue'
import {
  FormattedNumber,
  type FormattedNumberSlots,
} from '../../../dist/components'

export const Counter = defineComponent(() => {
  const count = ref(0)
  const incrementByOne = () => (count.value += 1)
  const incrementByThousand = () => (count.value += 1000)

  const useSlots = ref(false)
  const enableSlots = () => {
    useSlots.value = true
  }

  const reset = () => {
    count.value = 0
    useSlots.value = false
  }

  return () => {
    let display: JSX.Element

    if (useSlots.value) {
      const slots: FormattedNumberSlots = {
        default: ({ formattedValue }) => (
          <>
            {'Count is: '}
            <span data-testid="counter-slot">{formattedValue}</span>
          </>
        ),
      }

      display = (
        <FormattedNumber value={count.value} notation="compact">
          {slots}
        </FormattedNumber>
      )
    } else {
      display = <FormattedNumber value={count.value} notation="compact" />
    }

    return (
      <>
        <p data-testid="counter">{display}</p>
        <button onClick={incrementByOne}>+1</button>
        <button onClick={incrementByThousand}>+1000</button>
        <button onClick={enableSlots}>Slots on</button>
        <button onClick={reset}>Reset</button>
      </>
    )
  }
})
