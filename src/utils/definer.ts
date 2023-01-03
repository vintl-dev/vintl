import { isRef, type UnwrapRef } from 'vue'
import { createHashMap } from './hashmap.js'

function newObject() {
  return Object.create(null)
}

export function defineGetters<PropertiesMap extends Record<PropertyKey, any>>(
  map: PropertiesMap,
): Readonly<PropertiesMap> {
  const result: Readonly<PropertiesMap> = newObject()

  for (const property of [
    ...Object.getOwnPropertyNames(map),
    ...Object.getOwnPropertySymbols(map),
  ]) {
    Object.defineProperty(result, property, {
      configurable: true,
      get() {
        return map[property]
      },
    })
  }

  return result
}

type DollarPrefixedPropertyNames<Key extends PropertyKey> =
  Key extends `$${infer AfterDollarName}` ? AfterDollarName : never

type DollarlessPropertyNames<Key extends PropertyKey> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Key extends `$${infer _}` ? never : Key

type ReferencesGettersMap<ReferencesMap extends Record<PropertyKey, any>> = {
  readonly [Key in DollarPrefixedPropertyNames<keyof ReferencesMap>]: UnwrapRef<
    ReferencesMap[`$${Key}`]
  >
} & {
  readonly [Key in DollarlessPropertyNames<keyof ReferencesMap>]: UnwrapRef<
    ReferencesMap[Key]
  >
}

export function defineRefGetters<
  ReferencesMap extends Record<PropertyKey, any>,
>(referencesMap: ReferencesMap): ReferencesGettersMap<ReferencesMap> {
  const result = createHashMap() as ReferencesGettersMap<ReferencesMap>

  for (const propertyKey of [
    ...Object.getOwnPropertyNames(referencesMap),
    ...Object.getOwnPropertySymbols(referencesMap),
  ]) {
    let normalizedKey = propertyKey
    if (typeof normalizedKey === 'string' && normalizedKey.startsWith('$')) {
      normalizedKey = normalizedKey.slice(1)
    }

    Object.defineProperty(result, normalizedKey, {
      configurable: true,
      get: isRef(referencesMap[propertyKey])
        ? function referenceGetter() {
            return referencesMap[propertyKey].value
          }
        : function getter() {
            return referencesMap[propertyKey]
          },
    })
  }

  return result
}

// imagine typescript had variadic merge haha kidding... unless 😳
export function mergeDescriptors<S1, S2, S3, S4, S5, S6, S7, S8, S9>(
  _source1: S1,
  _source2?: S2,
  _source3?: S3,
  _source4?: S4,
  _source5?: S5,
  _source6?: S6,
  _source7?: S7,
  _source8?: S8,
  _source9?: S9,
): S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 {
  const result = newObject()

  // eslint-disable-next-line prefer-rest-params
  for (const object of arguments) {
    if (object == null) continue

    for (const property of [
      ...Object.getOwnPropertyNames(object),
      ...Object.getOwnPropertySymbols(object),
    ]) {
      Object.defineProperty(
        result,
        property,
        Object.getOwnPropertyDescriptor(object, property)!,
      )
    }
  }

  return result
}
