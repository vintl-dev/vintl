import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/vue'
import {
  createVIntlPlugin,
  withAbnormalSpacesReplaced,
} from '../../utils/index.ts'
import { RelativeTimeDisplay } from './relativeTimeDisplay.tsx'

describe('FormattedRelativeTime', () => {
  afterAll(() => cleanup())

  const vintl = createVIntlPlugin(['en-US', 'uk'])
  const { plugin, controller, resetController } = vintl

  const { getByText, getByTestId } = render(RelativeTimeDisplay, {
    global: { plugins: [plugin] },
  })

  let display: HTMLElement
  const refreshDisplay = () => (display = getByTestId('time-display'))

  beforeEach(async () => {
    await fireEvent.click(getByText('Reset'))
    refreshDisplay()
  })

  afterEach(resetController)

  const content = () => withAbnormalSpacesReplaced(display.textContent!)

  it('renders', async () => {
    expect(content()).toMatchInlineSnapshot('"in 0 seconds"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"in 1 second"')

    await fireEvent.click(getByText('Use minutes'))
    expect(content()).toMatchInlineSnapshot('"in 1 minute"')
  })

  it('changes locale', async () => {
    await controller.changeLocale('uk')
    expect(content()).toMatchInlineSnapshot('"через 0 секунд"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"через 1 секунду"')

    await fireEvent.click(getByText('Use minutes'))
    expect(content()).toMatchInlineSnapshot('"через 1 хвилину"')
  })

  it('renders as a slot', async () => {
    await fireEvent.click(getByText('Slots on'))
    refreshDisplay()

    expect(content()).toMatchInlineSnapshot('"Relative time is: in 0 seconds"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"Relative time is: in 1 second"')

    await fireEvent.click(getByText('Use minutes'))
    expect(content()).toMatchInlineSnapshot('"Relative time is: in 1 minute"')

    const slot = getByTestId('time-slot')
    expect(slot.textContent!).toMatchInlineSnapshot('"in 1 minute"')
  })
})
