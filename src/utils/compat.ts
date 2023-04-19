declare const reportError: ((err: any) => void) | undefined

declare const console:
  | {
      error(...args: any[]): void
    }
  | undefined

export function cReportError(err: any) {
  if (typeof reportError === 'function') {
    reportError(err)
    return
  }

  if (typeof console === 'object' && typeof console.error === 'function') {
    console.error('Uncaught', err)
    return
  }

  setTimeout(() => {
    throw err
  }, 0)
}
