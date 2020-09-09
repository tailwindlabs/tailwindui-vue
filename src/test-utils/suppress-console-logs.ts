type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T] &
  string

export function suppressConsoleLogs(
  cb: () => void,
  type: FunctionPropertyNames<typeof global.console> = 'warn'
) {
  return () => {
    const spy = jest.spyOn(global.console, type).mockImplementation(jest.fn())

    return new Promise((resolve, reject) => {
      Promise.resolve(cb()).then(resolve, reject)
    }).finally(() => spy.mockRestore())
  }
}
