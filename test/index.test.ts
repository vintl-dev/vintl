import { describe, expect, test, vi } from 'vitest'
import Vue from 'vue'
import type {
  FormatAliases,
  PreferredLocalesSource,
  TranslateFunction,
} from '../dist'
import type { IntlController } from '../dist/controller'
import {
  implementCancelation,
  isAsyncEvent,
  markAsAsync,
  isCanceled,
  isCancelable,
  type AsyncEvent,
  type CancelableEvent,
  type ErrorEvent,
  type Event,
  type LocaleChangeEvent,
  type LocaleLoadEvent,
} from '../dist/events'
import { createPlugin, type Plugin } from '../dist/plugin'
import { parseHeaderValue } from '../dist/sources/header'

const autoBoundLocaleLoadListener = vi.fn((_e: LocaleLoadEvent) => {})

const autoBoundLocaleChangeListener = vi.fn((_e: LocaleChangeEvent) => {})

let plugin: Plugin<string>

let translate: TranslateFunction
let formats: FormatAliases<string>
let controller: IntlController<string>

describe('plugin', () => {
  test('can be created', () => {
    plugin = createPlugin({
      controllerOpts: {
        listen: {
          localeload: {
            listener: autoBoundLocaleLoadListener,
          },
          localechange: [autoBoundLocaleChangeListener],
        },
      },
    })

    expect(plugin).toBeDefined()
  })

  test('can be installed', () => {
    Vue.use(plugin)

    const instance = new Vue()
    expect(instance).toHaveProperty('$i18n')
    expect(instance).toHaveProperty('$t')
    expect(instance).toHaveProperty('$fmt')
  })

  test('localechange was called during initialisation', () => {
    expect(autoBoundLocaleLoadListener).toHaveBeenCalledOnce()
    autoBoundLocaleLoadListener.mockClear()
  })

  test('returns properties', () => {
    const props = plugin!.toProperties()
    translate = props.$t
    formats = props.$fmt
    controller = props.$i18n

    expect(translate).toBeDefined()
    expect(formats).toBeDefined()
    expect(controller).toBeDefined()
  })
})

describe('controller', () => {
  const localesMap = {
    'en-US': {
      greeting: 'Hello, {username}!',
      goodbye: 'Goodbye, {username}!',
    },
    uk: {
      greeting: 'Привіт, {username}!',
    },
    de: {
      greeting: 'Hallo, {username}!',
    },
  } as const

  test('locales are added', async () => {
    for (const localeCode of Object.keys(localesMap)) {
      controller.addLocale(localeCode, true)
      await controller.waitUntilReady()
    }

    expect([...controller.$locales.value.keys()].map((it) => it.code)).toEqual(
      expect.arrayContaining(Object.keys(localesMap)),
    )
  })

  test('AB localeload event called after locale creation', () => {
    expect(autoBoundLocaleLoadListener).toHaveBeenCalledOnce()
    autoBoundLocaleLoadListener.mockClear()
  })

  test('throws for duplicate locales', () => {
    expect(() => controller.addLocale('en-US')).toThrow(
      'Locale "en-US" already exists',
    )
  })

  test('messages are added', () => {
    for (const [locale, messages] of Object.entries(localesMap)) {
      controller.addMessages(locale, messages)
    }

    expect(controller.messages).toHaveProperty(
      'greeting',
      localesMap['en-US'].greeting,
    )
  })

  test('added messages are used', () => {
    expect(translate('greeting', { username: 'Brawaru' })).toBe(
      'Hello, Brawaru!',
    )
    expect(translate('goodbye', { username: 'Brawaru' })).toBe(
      'Goodbye, Brawaru!',
    )
  })

  test('formatters work', () => {
    expect(formats.list(['Oleksandr', 'Andriy', 'Inna'])).toBe(
      'Oleksandr, Andriy, and Inna',
    )
    expect(formats.relativeTime(25, 'days')).toBe('in 25 days')
  })

  test('locale changes', async () => {
    const promiseBeforeChange = controller.$loading.promise
    await expect(controller.changeLocale('uk')).resolves.toBeUndefined()
    expect(controller.locale).toBe('uk')
    expect(controller.$loading.promise).not.toBe(promiseBeforeChange)
  })

  test('AB localechange event was called after locale change', () => {
    expect(autoBoundLocaleChangeListener).toHaveBeenCalledOnce()
    autoBoundLocaleChangeListener.mockClear()
  })

  test('AB localeload event was called after locale change', () => {
    expect(autoBoundLocaleLoadListener).toHaveBeenCalledOnce()
    autoBoundLocaleLoadListener.mockClear()
  })

  test('messages match locale', () => {
    expect(controller.messages).toHaveProperty(
      'greeting',
      localesMap.uk.greeting,
    )
  })

  test('translate ƒ works after locale change', () => {
    expect(translate('greeting', { username: 'Brawaru' })).toBe(
      'Привіт, Brawaru!',
    )
  })

  test('translate ƒ adds defaultMessage as fallback', () => {
    expect(translate('goodbye', { username: 'Brawaru' })).toBe(
      'Goodbye, Brawaru!',
    )
  })

  test('formatters update after locale change', () => {
    expect(formats.list(['Олександр', 'Андрій', 'Інна'])).toBe(
      'Олександр, Андрій і Інна',
    )

    expect(formats.relativeTime(25, 'days')).toBe('через 25 днів')
  })
})

describe('controller automation', () => {
  const createTestSource = (language: string): PreferredLocalesSource => {
    return {
      prefers: [language],
    }
  }

  const deSource = createTestSource('de')
  const ukSource = createTestSource('uk')

  test('without source preferred locale is default locale', () => {
    expect(controller.preferredLocale).toBe(controller.defaultLocale)
  })

  test('source can be installed and used immediately', () => {
    controller.addSource(deSource)
    console.log('source added')
    expect(controller.preferredLocale).toBe('de')
    controller.addSource(ukSource, true)
    expect(controller.preferredLocale).toBe('uk')
  })

  test('source can be removed', () => {
    controller.removeSource(ukSource)
    expect(controller.preferredLocale).toBe('de')
    controller.removeSource(deSource)
    expect(controller.preferredLocale).not.toBe('de')
  })

  test('automation can be turned on', async () => {
    controller.addSource(deSource)

    const previousPromise = controller.$loading.promise

    await controller.changeLocale('auto')

    expect(controller.automatic).toBe(true)

    // confirm language switch has indeed happened:
    expect(controller.$loading.promise).not.toBe(previousPromise)

    expect(controller.locale).toBe(controller.preferredLocale)
  })

  test('automation can as well be turned off', async () => {
    const previousPromies = controller.$loading.promise

    await controller.changeLocale('de')

    expect(controller.automatic).toBe(false)

    expect(controller.$loading.promise).not.toBe(previousPromies)

    expect(controller.locale).toBe('de')
  })
})

describe('controller events', () => {
  const localeChangeCallback = vi.fn((_e: LocaleChangeEvent) => {})

  const localeLoadCallback = vi.fn((_e: LocaleLoadEvent) => {})

  class CustomEvent implements Event {
    static type = 'customEvent'
    readonly type = CustomEvent.type

    constructor() {
      implementCancelation(this)
    }
  }

  interface CustomEvent extends CancelableEvent {}

  test('cancellation is properly implemented', () => {
    const event = new CustomEvent()

    expect(isCancelable(event)).toBe(true)

    expect(isCanceled(event)).toBe(false)
    expect(event.canceled).toBe(false)

    event.cancel()

    expect(isCanceled(event)).toBe(true)
    expect(event.canceled).toBe(true)
  })

  test('async in events is properly implemented', () => {
    class CustomAsyncEvent {
      readonly type = 'customAsyncEvent'
      constructor() {
        markAsAsync(this)
      }
    }

    interface CustomAsyncEvent extends AsyncEvent {}

    const event = new CustomAsyncEvent()

    expect(isAsyncEvent(event)).toBeTruthy()
  })

  test('can add callbacks', () => {
    controller.addEventListener('localechange', localeChangeCallback)
    controller.addEventListener('localeload', localeLoadCallback)
  })

  test('can remove callbacks', () => {
    controller.removeEventListener('localechange', localeChangeCallback)
    controller.removeEventListener('localeload', localeLoadCallback)
  })

  test('AB callbacks can be changed', () => {
    autoBoundLocaleChangeListener.mockClear()

    controller.$config.listen = {
      localechange: [
        {
          listener: autoBoundLocaleChangeListener,
          options: {
            once: true,
          },
        },
      ],
    }
  })

  test('re-bound AB localechange callback is called once', async () => {
    await controller.changeLocale('uk')
    await controller.changeLocale('en-US')

    expect(autoBoundLocaleChangeListener).toHaveBeenCalledOnce()
  })

  test('localechange callbacks are called properly', async () => {
    await controller.changeLocale('uk')

    controller.addEventListener('localechange', localeChangeCallback)

    await controller.changeLocale('en-US')

    expect(localeChangeCallback).toHaveBeenCalledOnce()

    const lastLocaleChangeCall = localeChangeCallback.mock.lastCall

    expect(lastLocaleChangeCall).toBeDefined()

    if (lastLocaleChangeCall) {
      const event = lastLocaleChangeCall[0]
      expect(event.locale).toBe('en-US')
      expect(event.previousLocale).toBe('uk')
    }

    controller.removeEventListener('localechange', localeChangeCallback)
  })

  test('localeload callbacks are called properly', async () => {
    const extendingLocaleLoadCallback = vi.fn(async (e: LocaleLoadEvent) => {
      await Promise.resolve()

      let languageName: string

      switch (e.locale.code) {
        case 'de':
          languageName = 'Deutsch'
          break
        case 'uk':
          languageName = 'Українська'
          break
        case 'en-US':
          languageName = 'American English'
          break
        default:
          languageName = 'Unknown language'
          break
      }

      e.addMessages({ languageName })

      e.addResources({
        isUkrainian: e.locale.code === 'uk',
      })
    })

    controller.addEventListener('localeload', extendingLocaleLoadCallback)

    await controller.changeLocale('uk')

    expect(extendingLocaleLoadCallback).toHaveBeenCalledOnce()

    const lastLocaleLoadCall = extendingLocaleLoadCallback.mock.lastCall

    expect(lastLocaleLoadCall).toBeDefined()

    if (lastLocaleLoadCall) {
      const event = lastLocaleLoadCall[0]

      expect(event.collected).toBe(true)
      expect(event.locale.code).toBe('uk')
      expect(event.messages).toHaveProperty('languageName', 'Українська')
      expect(event.resources).toHaveProperty('isUkrainian', true)
    }

    expect(controller.messages).toHaveProperty('languageName', 'Українська')
    expect(controller.resources).toHaveProperty('isUkrainian', true)

    expect(controller.intl.messages).toHaveProperty(
      'languageName',
      'Українська',
    )

    controller.removeEventListener('localeload', extendingLocaleLoadCallback)
  })

  test('once callbacks are called only once', () => {
    const cb = vi.fn(() => {})

    controller.addEventListener(CustomEvent.type, cb, { once: true })

    controller.dispatchEvent(new CustomEvent())
    controller.dispatchEvent(new CustomEvent())

    expect(cb).toHaveBeenCalledOnce()
  })

  test('always callbacks are called after cancellation', () => {
    const listener = vi.fn((e: Event) => {
      ;(e as CustomEvent).cancel()
    })

    const otherListener = vi.fn(() => {})
    const alwaysListener = vi.fn(() => {})

    controller.addEventListener(CustomEvent.type, alwaysListener, {
      once: true,
      always: true,
      priority: -100,
    })
    controller.addEventListener(CustomEvent.type, listener, { once: true })
    controller.addEventListener(CustomEvent.type, otherListener, { once: true })

    controller.dispatchEvent(new CustomEvent())

    expect(listener).toHaveBeenCalledOnce()
    expect(alwaysListener).toHaveBeenCalledOnce()
    expect(otherListener).toHaveBeenCalledTimes(0)
  })

  test('listeners are called in proper order', () => {
    const callOrder: string[] = []

    const frontListener = vi.fn(() => {
      callOrder.push('front')
    })

    const regularListener = vi.fn(() => {
      callOrder.push('regular')
    })

    const secondRegularListener = vi.fn(() => {
      callOrder.push('regular-2')
    })

    const bgListener = vi.fn(() => {
      callOrder.push('background')
    })

    controller.addEventListener(CustomEvent.type, regularListener, {
      once: true,
    })

    controller.addEventListener(CustomEvent.type, frontListener, {
      once: true,
      priority: 100,
    })

    controller.addEventListener(CustomEvent.type, bgListener, {
      once: true,
      priority: -100,
    })

    controller.addEventListener(CustomEvent.type, secondRegularListener, {
      once: true,
    })

    controller.dispatchEvent(new CustomEvent())

    expect(callOrder).toMatchObject([
      'front',
      'regular',
      'regular-2',
      'background',
    ])
  })

  test('dispatch is resistant against tampering', () => {
    const event = new CustomEvent()
    Object.defineProperty(event, 'cancelled', { value: false })
    expect(controller.dispatchEvent(event)).toBe(true)
  })

  test('dispatches error event properly', () => {
    const faultyListener = vi.fn(() => {
      throw new Error('Unlucky!')
    })

    const otherListener = vi.fn(() => {})

    const errorListener = vi.fn((_e: ErrorEvent) => {})

    controller.addEventListener(CustomEvent.type, faultyListener, {
      once: true,
    })

    controller.addEventListener(CustomEvent.type, otherListener, {
      once: true,
      priority: -100,
    })

    controller.addEventListener('error', errorListener, { once: true })

    controller.dispatchEvent(new CustomEvent())

    expect(faultyListener).toHaveBeenCalledOnce()
    expect(otherListener).toHaveBeenCalledOnce()
    expect(errorListener).toHaveBeenCalledOnce()

    expect(faultyListener.mock.results.at(-1)?.type).toBe('throw')

    expect(errorListener.mock.lastCall?.[0].error).toHaveProperty(
      'cause',
      faultyListener.mock.results.at(-1)?.value,
    )
  })
})

describe('header source', () => {
  test('parses correctly', () => {
    expect(parseHeaderValue('en-GB;q=0.9, *;q=0.7, en-US, de;q=0.8')).toEqual([
      ['en-US', 1],
      ['en-GB', 0.9],
      ['de', 0.8],
      ['*', 0.7],
    ])
  })
})
