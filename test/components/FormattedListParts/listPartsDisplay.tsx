import { computed, defineComponent, ref } from 'vue'
import {
  FormattedListParts,
  type FormattedListPartsSlots,
} from '../../../dist/components'

export const ListPartsDisplay = defineComponent(() => {
  const list = ref(['1', '2', '3'])

  let increment = 3

  const addListItem = () => list.value.push(String(++increment))

  const useSlots = ref(false)
  const enableSlots = () => (useSlots.value = true)

  const useJSXNodes = ref(false)
  const enableJSXNodes = () => (useJSXNodes.value = true)

  const listToRender = computed(() => {
    return useJSXNodes.value
      ? [...list.value, <b>Bold</b>, <button type="button">Press me</button>]
      : list.value
  })

  const reset = () => {
    list.value = ['1', '2', '3']
    increment = 3
    useSlots.value = false
    useJSXNodes.value = false
  }

  return () => {
    let display: JSX.Element

    if (useSlots.value) {
      const slots: FormattedListPartsSlots<string> = {
        default: ({ parts }) => (
          <>
            {'List is: '}
            <ul data-testid="list-slot">
              {parts.map((part) => (
                <li data-kind={part.type}>{part.value}</li>
              ))}
            </ul>
          </>
        ),
      }

      display = (
        <FormattedListParts
          items={listToRender.value}
          type="disjunction"
          key="slotted-list"
        >
          {slots}
        </FormattedListParts>
      )
    } else {
      display = (
        <FormattedListParts
          items={listToRender.value}
          type="disjunction"
          key="normal-list"
        />
      )
    }

    return (
      <>
        <p data-testid="list-display">{display}</p>
        <button onClick={addListItem}>Add item</button>
        <button onClick={enableSlots}>Slots on</button>
        <button onClick={enableJSXNodes}>JSX on</button>
        <button onClick={reset}>Reset</button>
      </>
    )
  }
})
