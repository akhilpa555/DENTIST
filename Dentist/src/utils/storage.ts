export function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function load<T>(key: string): T | null {
  const v = localStorage.getItem(key)
  return v ? (JSON.parse(v) as T) : null
}
