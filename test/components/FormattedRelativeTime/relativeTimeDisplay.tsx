import { defineComponent, ref } from 'vue'
import {
  FormattedRelativeTime,
  type FormattedRelativeTimeSlots,
} from '../../../dist/components'

export const RelativeTimeDisplay = defineComponent(() => {
  const amount = ref(0)
  const incrementByOne = () => (amount.value += 1)

  const unit = ref<Intl.RelativeTimeFormatUnit>('seconds')
  const switchToMinutes = () => (unit.value = 'minutes')

  const useSlots = ref(false)
  const enableSlots = () => (useSlots.value = true)

  const reset = () => {
    amount.value = 0
    unit.value = 'seconds'
    useSlots.value = false
  }

  return () => {
    let display: JSX.Element

    if (useSlots.value) {
      display = (
        <FormattedRelativeTime value={amount.value} unit={unit.value}>
          {
            {
              default: ({ formattedValue }) => (
                <>
                  {'Relative time is: '}
                  <span data-testid="time-slot">{formattedValue}</span>
                </>
              ),
            } satisfies FormattedRelativeTimeSlots
          }
        </FormattedRelativeTime>
      )
    } else {
      display = <FormattedRelativeTime value={amount.value} unit={unit.value} />
    }

    return (
      <>
        <p data-testid="time-display">{display}</p>
        <button onClick={incrementByOne}>+1</button>
        <button onClick={switchToMinutes}>Use minutes</button>
        <button onClick={enableSlots}>Slots on</button>
        <button onClick={reset}>Reset</button>
      </>
    )
  }
})
