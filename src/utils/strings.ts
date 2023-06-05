const camelRegExp = /-(\w)/g

export function camelize(value: string) {
  return value.replace(camelRegExp, (_, c) => c.toUpperCase())
}
