import type { PreferredLocalesSource } from '../index.js'

type AcceptedLanguage = [language: string, quality: number]

/**
 * Parses value for the `Accept-Language` header according to specification.
 *
 * @example
 *   parseHeaderValue('en-GB;q=0.9, *;q=0.7, de;q=0.8, en-US')
 *   // => [['en-US', 1],
 *   //     ['en-GB', 0.9],
 *   //     ['de', 0.8],
 *   //     ['*', 0.7]]
 *
 * @param value Value for the header.
 * @returns An array of {@link AcceptedLanguage} sorted by the quality.
 */
export function parseHeaderValue(value: string): AcceptedLanguage[] {
  const languages: AcceptedLanguage[] = []

  for (let part of value.split(',')) {
    part = part.trim()

    const [tag, ...valueParts] = part.split(';')

    const language: AcceptedLanguage = [tag, 1]

    for (const valuePart of valueParts) {
      const [key, value, invalid] = valuePart.split('=')

      if (invalid != null) {
        throw new Error(`Illegal part "${part}"`)
      }

      if (key === 'q') {
        const quality = Number(value)

        if (isNaN(quality)) {
          throw new TypeError(`Expected a number for key "${key}": ${part}`)
        }

        language[1] = quality
      }
    }

    languages.push(language)
  }

  return languages.sort((a, b) => b[1] - a[1])
}

export function useAcceptLanguageHeader(
  headerValue?: string | null,
): PreferredLocalesSource {
  const preferredLanguages: string[] = []

  if (headerValue != null && headerValue !== '') {
    for (const [language] of parseHeaderValue(headerValue)) {
      if (language === '*') continue
      preferredLanguages.push(language)
    }
  }

  return {
    prefers: preferredLanguages.length > 0 ? preferredLanguages : null,
  }
}
