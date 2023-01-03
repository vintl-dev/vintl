export type ReverseMap<Map extends Record<keyof Map, PropertyKey>> = {
  [Value in Map[keyof Map]]: {
    [Key in keyof Map]: Map[Key] extends Value ? Key : never
  }[keyof Map]
}
