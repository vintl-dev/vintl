import { type LocaleLoadEvent } from '../../dist/events'
import { createPlugin } from '../../dist/plugin'

export function withAbnormalSpacesReplaced(value: string): string {
  return value.replace(/[\u202F\u00A0]/g, ' ')
}

export function createVIntlPlugin(
  locales: string[],
  loadLocale?:
    | ((e: LocaleLoadEvent) => void | Promise<void>)
    | Record<string, Record<string, string> | undefined>,
) {
  const plugin = createPlugin({
    controllerOpts: {
      locales: locales.map((tag) => ({ tag })),
      listen: {
        localeload:
          typeof loadLocale === 'function' || loadLocale == null
            ? loadLocale
            : (e) => {
                e.addMessages(loadLocale[e.locale.tag] ?? {})
              },
      },
    },
  })

  const controller = plugin.getOrCreateController()

  const initialState = { ...controller.$config }

  return {
    plugin,
    get controller() {
      return controller
    },
    async resetController() {
      Object.assign(controller.$config, initialState)
      await controller.waitUntilReady()
    },
  }
}
