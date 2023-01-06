/**
 * Performs equality by iterating through keys on an object.
 *
 * @license MIT Copyright (c) Meta Platforms, Inc. and affiliates.
 *   https://github.com/facebook/react/blob/ff9f943741671b6d83d732b2131d3f7e7d3c54c8/LICENSE
 * @returns `false` when any key has values which are not strictly equal between
 *   the arguments, or `true` when the values of all keys are strictly equal.
 */
export function shallowEqual<
  T1 extends Record<string | number, any> | undefined | null,
  T2 extends Record<string | number, any> | undefined | null,
>(objA: T1, objB: T2): boolean {
  if (Object.is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false
    }
  }

  return true
}
