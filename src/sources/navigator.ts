import { ref } from 'vue'
import type { PreferredLocalesSource } from '../types/index.js'

export function useNavigatorLanguage(): PreferredLocalesSource {
  const prefers = ref<string[] | null>(null)

  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    // eslint-disable-next-line no-console
    console.warn(
      'No window and/or navigator API has been found in this environment. This source will be ineffective.',
    )

    return { prefers } // no-op source
  }

  function update() {
    if (typeof navigator === 'undefined' || navigator == null) {
      prefers.value = null
      return
    }

    if ('languages' in (navigator as object)) {
      prefers.value = [...navigator.languages]
    } else {
      prefers.value = [navigator.language]
    }
  }

  function install() {
    window.addEventListener('languagechange', update)
    update()
  }

  function uninstall() {
    window.addEventListener('languagechange', update)
  }

  return {
    prefers,
    install,
    uninstall,
  }
}
