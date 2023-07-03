import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/vue'
import {
  createVIntlPlugin,
  withAbnormalSpacesReplaced,
} from '../../utils/index.ts'
import { Counter } from './counter.tsx'

describe('FormattedNumberParts', () => {
  afterAll(() => cleanup())

  const vintl = createVIntlPlugin(['en-US', 'uk'])
  const { plugin, controller, resetController } = vintl

  const { getByText, getByTestId } = render(Counter, {
    global: { plugins: [plugin] },
  })

  let counter: HTMLElement
  const refreshCounter = () => (counter = getByTestId('counter'))

  const content = () => withAbnormalSpacesReplaced(counter.textContent!)

  beforeEach(async () => {
    await fireEvent.click(getByText('Reset'))
    refreshCounter()
  })

  afterEach(resetController)

  it('renders', async () => {
    expect(content()).toBe('0')

    await fireEvent.click(getByText('+1'))
    expect(content()).toBe('1')

    await fireEvent.click(getByText('+1000'))
    expect(content()).toBe('1K')

    const integerParts = counter.querySelectorAll('b')
    expect(integerParts).toHaveLength(1)
    expect(integerParts[0].textContent).toBe('1')
  })

  it('changes locale', async () => {
    await controller.changeLocale('uk')

    await fireEvent.click(getByText('+1'))
    expect(content()).toBe('1')

    await fireEvent.click(getByText('+1000'))
    expect(content()).toBe('1 тис.')

    const integerParts = counter.querySelectorAll('b')
    expect(integerParts).toHaveLength(1)
    expect(integerParts[0].textContent).toBe('1')
  })
})
