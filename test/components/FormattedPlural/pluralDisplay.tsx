import { defineComponent, ref } from 'vue'
import {
  FormattedPlural,
  type FormattedPluralSlots,
} from '../../../dist/components'

export const PluralDisplay = defineComponent(() => {
  const count = ref(0)
  const incrementByOne = () => (count.value += 1)

  const slotsHandling = ref<'full' | 'partial' | 'none'>('full')
  const handleSelectionOfSlots = () => (slotsHandling.value = 'partial')
  const handleNoSlots = () => (slotsHandling.value = 'none')

  const pluralType = ref<Intl.PluralRuleType>('cardinal')
  const switchToOrdinal = () => (pluralType.value = 'ordinal')

  const reset = () => {
    count.value = 0
    slotsHandling.value = 'full'
    pluralType.value = 'cardinal'
  }

  return () => {
    let slots: FormattedPluralSlots

    switch (slotsHandling.value) {
      case 'full':
        slots = {
          zero: ({ value }) => `zero with value ${value}`,
          one: ({ value }) => `one with value ${value}`,
          two: ({ value }) => `two with value ${value}`,
          few: ({ value }) => `few with value ${value}`,
          many: ({ value }) => `many with value ${value}`,
          other: ({ value }) => `other with value ${value}`,
        }
        break
      case 'partial':
        slots = {
          one: ({ value }) => `one with value ${value}`,
          other: ({ value }) => `other with value ${value}`,
        }
        break
      case 'none':
        slots = {}
        break
    }

    return (
      <>
        <p data-testid="plural-display">
          <FormattedPlural value={count.value} type={pluralType.value}>
            {slots}
          </FormattedPlural>
        </p>
        <button onClick={incrementByOne}>+1</button>
        <button onClick={handleSelectionOfSlots}>
          Handle selection of slots
        </button>
        <button onClick={handleNoSlots}>Handle no slots</button>
        <button onClick={switchToOrdinal}>Switch to ordinal</button>
        <button onClick={reset}>Reset</button>
      </>
    )
  }
})
