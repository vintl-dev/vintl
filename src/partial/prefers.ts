import { match as matchLocale } from '@formatjs/intl-localematcher'
import { computed, isRef, shallowRef } from 'vue'
import type { PreferredLocalesSource } from '../types/sources.js'
import { defineRefGetters, mergeDescriptors } from '../utils/definer.js'
import { observe } from '../utils/vue.js'
import type { ControllerConfiguration } from './config.js'

interface SourceEntry {
  /** The source. */
  source: PreferredLocalesSource

  /** Whether the source was installed. */
  installed: boolean
}

export interface AutomationPartial {
  /** BCP 47 code of the locale preferred by one of the automatic sources. */
  get preferredLocale(): string

  /**
   * Adds a preferred locale source.
   *
   * If source is already added, it is removed and added at the new position,
   * that depends on the {@link prepend} argument.
   *
   * @param source Automatic locale source to add.
   * @param prepend Whether to prepend locale source before all other sources.
   *   Default is `false`.
   */
  addSource(source: PreferredLocalesSource, prepend?: boolean): void

  /**
   * Removes a preferred locale source.
   *
   * @param source Locale source to remove.
   */
  removeSource(source: PreferredLocalesSource): void
}

export function usePrefersPartial<ControllerType>(
  $config: ControllerConfiguration<ControllerType>,
): AutomationPartial {
  const $sources = shallowRef<readonly SourceEntry[]>([])

  observe(
    () => $config.preferredLocaleSources,
    (updatedSources) => {
      const entries = $sources.value
      const newEntries: SourceEntry[] = []

      if (updatedSources != null) {
        for (const entry of entries) {
          if (!updatedSources.includes(entry.source)) {
            entry.source.uninstall?.()
            entry.installed = false
          }
        }

        for (const source of updatedSources) {
          const entry = entries.find((it) => it.source === source)

          if (entry == null || !entry.installed) {
            source.install?.()
          }

          newEntries.push({
            installed: true,
            source,
          })
        }
      }

      $sources.value = newEntries
    },
  )

  const $preferredLocale = computed<string>(() => {
    for (const entry of $sources.value) {
      const { source } = entry
      let value

      if (isRef(source.prefers)) {
        value = source.prefers.value
      } else {
        value = source.prefers
      }

      if (value == null) {
        continue
      }

      return matchLocale(
        value,
        $config.locales.map((it) => it.code),
        $config.defaultLocale,
      )
    }

    return $config.defaultLocale
  })

  function addSource(source: PreferredLocalesSource, prepend = false) {
    const filteredSources = [] as PreferredLocalesSource[]

    // unshift is quite costly operation, better use two ifs
    if (prepend) filteredSources.push(source)

    if ($config.preferredLocaleSources != null) {
      for (const existingSource of $config.preferredLocaleSources) {
        if (existingSource === source) continue
        filteredSources.push(existingSource)
      }
    }

    if (!prepend) filteredSources.push(source)

    $config.preferredLocaleSources = filteredSources
  }

  function removeSource(source: PreferredLocalesSource) {
    const filteredSources = [] as PreferredLocalesSource[]

    let shallUpdate = false

    for (const existingSource of $config.preferredLocaleSources) {
      if (existingSource === source) {
        shallUpdate = true
      } else {
        filteredSources.push(existingSource)
      }
    }

    if (shallUpdate) {
      $config.preferredLocaleSources = filteredSources
    }
  }

  const refs = { $preferredLocale }

  return mergeDescriptors(defineRefGetters(refs), {
    addSource,
    removeSource,
  })
}
