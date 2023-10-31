import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/vue'
import { createVIntlPlugin } from '../../utils/index.ts'
import { PluralDisplay } from './pluralDisplay.tsx'

describe('FormattedPlural', () => {
  afterAll(() => cleanup())

  const vintl = createVIntlPlugin(['en-US', 'uk'])
  const { plugin, controller, resetController } = vintl

  const { getByText, getByTestId } = render(PluralDisplay, {
    global: { plugins: [plugin] },
  })

  let display: HTMLElement
  const refreshDisplay = () => (display = getByTestId('plural-display'))

  afterEach(resetController)

  beforeEach(async () => {
    await fireEvent.click(getByText('Reset'))
    refreshDisplay()
  })

  const content = () => display.textContent!

  it('renders', async () => {
    // 0 => other
    // 1 => one
    // 2 => other

    expect(content()).toMatchInlineSnapshot('"other with value 0"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"one with value 1"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"other with value 2"')
  })

  it('respects type', async () => {
    // 0 => other
    // 1 => one
    // 2 => two
    // 3 => few

    await fireEvent.click(getByText('Switch to ordinal'))
    expect(content()).toMatchInlineSnapshot('"other with value 0"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"one with value 1"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"two with value 2"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"few with value 3"')
  })

  it('changes locale', async () => {
    // 0 => many
    // 1 => one
    // 2 => few

    await controller.changeLocale('uk')
    expect(content()).toMatchInlineSnapshot('"many with value 0"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"one with value 1"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"few with value 2"')
  })

  it('fallbacks correctly', async () => {
    // 0 => many => other
    // 1 => one => one
    // 2 => few => other

    await controller.changeLocale('uk')
    await fireEvent.click(getByText('Handle selection of slots'))
    expect(content()).toMatchInlineSnapshot('"other with value 0"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"one with value 1"')

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot('"other with value 2"')
  })

  it('renders nothing if no slots handled', async () => {
    // * => [nothing]
    await fireEvent.click(getByText('Handle no slots'))
    expect(content()).toMatchInlineSnapshot('""')
  })
})
