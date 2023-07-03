import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/vue'
import {
  createVIntlPlugin,
  withAbnormalSpacesReplaced,
} from '../../utils/index.ts'
import { Counter } from './counter.tsx'

describe('FormattedNumber', () => {
  afterAll(() => cleanup())

  const vintl = createVIntlPlugin(['en-US', 'uk'])
  const { plugin, controller, resetController } = vintl

  const { getByText, getByTestId } = render(Counter, {
    global: { plugins: [plugin] },
  })

  let counter: HTMLElement
  const refreshCounter = () => (counter = getByTestId('counter'))

  beforeEach(async () => {
    await fireEvent.click(getByText('Reset'))
    refreshCounter()
  })

  afterEach(resetController)

  const content = () => withAbnormalSpacesReplaced(counter.textContent!)

  it('renders', async () => {
    expect(content()).toMatchInlineSnapshot('"0"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"1"')

    await fireEvent.click(getByText('+1000'))
    expect(content()).toMatchInlineSnapshot('"1K"')
  })

  it('changes locale', async () => {
    await controller.changeLocale('uk')

    expect(content()).toMatchInlineSnapshot('"0"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"1"')

    await fireEvent.click(getByText('+1000'))
    expect(content()).toMatchInlineSnapshot('"1 тис."')
  })

  it('renders as a slot', async () => {
    await fireEvent.click(getByText('Slots on'))

    refreshCounter()

    expect(content()).toMatchInlineSnapshot('"Count is: 0"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"Count is: 1"')

    await fireEvent.click(getByText('+1000'))
    expect(content()).toMatchInlineSnapshot('"Count is: 1K"')

    const slot = getByTestId('counter-slot')
    const slotContent = withAbnormalSpacesReplaced(slot.textContent!)
    expect(slotContent).toMatchInlineSnapshot('"1K"')
  })
})
