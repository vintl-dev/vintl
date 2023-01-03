export type JSONPrimitive = string | number | boolean | null
export type JSONMap = { [key: string]: JSONValue }
export type JSONArray = JSONValue[]
export type JSONValue = JSONPrimitive | JSONArray | JSONMap
