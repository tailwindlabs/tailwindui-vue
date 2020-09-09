type ArgumentsOf<F extends Function> = F extends (...args: infer A) => any ? A : never

export function disposables() {
  const disposables: Function[] = []

  const api = {
    requestAnimationFrame(...args: ArgumentsOf<typeof requestAnimationFrame>) {
      const raf = requestAnimationFrame(...args)
      api.add(() => cancelAnimationFrame(raf))
    },

    nextFrame(...args: ArgumentsOf<typeof requestAnimationFrame>) {
      api.requestAnimationFrame(() => {
        api.requestAnimationFrame(...args)
      })
    },

    setTimeout(...args: ArgumentsOf<typeof setTimeout>) {
      const timer = setTimeout(...args)
      api.add(() => clearTimeout(timer))
    },

    add(cb: () => void) {
      disposables.push(cb)
    },

    dispose() {
      disposables.splice(0).forEach(dispose => dispose())
    },
  }

  return api
}
