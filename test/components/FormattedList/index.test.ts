import { afterAll, beforeEach, afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/vue'
import {
  createVIntlPlugin,
  withAbnormalSpacesReplaced,
} from '../../utils/index.ts'
import { ListDisplay } from './listDisplay.tsx'

describe('FormattedList', () => {
  afterAll(() => cleanup())

  const vintl = createVIntlPlugin(['en-US', 'uk'])
  const { plugin, controller, resetController } = vintl

  const { getByText, getByTestId } = render(ListDisplay, {
    global: { plugins: [plugin] },
  })

  let list: HTMLElement

  const refreshList = () => (list = getByTestId('list-display'))

  beforeEach(async () => {
    await fireEvent.click(getByText('Reset'))
    refreshList()
  })

  afterEach(resetController)

  it('renders', async () => {
    expect(list.textContent).toMatchInlineSnapshot('"1, 2, or 3"')

    await fireEvent.click(getByText('Add item'))
    expect(list.textContent).toMatchInlineSnapshot('"1, 2, 3, or 4"')
  })

  it('changes locale', async () => {
    await controller.changeLocale('uk')
    const content = withAbnormalSpacesReplaced(list.textContent!)
    expect(content).toMatchInlineSnapshot('"1, 2 або 3"')
  })

  it('renders as a slot', async () => {
    await fireEvent.click(getByText('Slots on'))
    const content = refreshList().textContent
    expect(content).toMatchInlineSnapshot('"List is: 1, 2, or 3"')

    const slot = getByTestId('list-slot')
    expect(slot.textContent!).toMatchInlineSnapshot('"1, 2, or 3"')
  })

  it('renders JSX items', async () => {
    await fireEvent.click(getByText('JSX on'))

    expect(list.querySelector('b')).toBeDefined()

    await fireEvent.click(getByText('Press me'))
  })
})
