import { nextTick } from 'vue'
import { fireEvent } from '@testing-library/dom'

export const Keys: Record<string, Partial<KeyboardEvent>> = {
  Space: { key: ' ' },
  Enter: { key: 'Enter' },
  Escape: { key: 'Escape' },
  Backspace: { key: 'Backspace' },

  ArrowUp: { key: 'ArrowUp' },
  ArrowDown: { key: 'ArrowDown' },

  Home: { key: 'Home' },
  End: { key: 'End' },

  PageUp: { key: 'PageUp' },
  PageDown: { key: 'PageDown' },

  Tab: { key: 'Tab' },
}

export function shift(event: Partial<KeyboardEvent>) {
  return { ...event, shiftKey: true }
}

export function word(input: string): Partial<KeyboardEvent>[] {
  return input.split('').map(key => ({ key }))
}

export async function type(events: Partial<KeyboardEvent>[]) {
  jest.useFakeTimers()

  try {
    if (document.activeElement === null) return expect(document.activeElement).not.toBe(null)

    const element = document.activeElement

    events.forEach(event => {
      fireEvent.keyDown(element, event)
    })

    // We don't want to actually wait in our tests, so let's advance
    jest.runAllTimers()

    await new Promise<void>(nextTick)
  } catch (err) {
    if (Error.captureStackTrace) Error.captureStackTrace(err, type)
    throw err
  } finally {
    jest.useRealTimers()
  }
}

export async function press(event: Partial<KeyboardEvent>) {
  return type([event])
}

export async function click(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.pointerDown(element)
    fireEvent.mouseDown(element)
    fireEvent.pointerUp(element)
    fireEvent.mouseUp(element)
    fireEvent.click(element)

    await new Promise<void>(nextTick)
  } catch (err) {
    if (Error.captureStackTrace) Error.captureStackTrace(err, click)
    throw err
  }
}

export async function focus(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.focus(element)

    await new Promise<void>(nextTick)
  } catch (err) {
    if (Error.captureStackTrace) Error.captureStackTrace(err, focus)
    throw err
  }
}

export async function mouseMove(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.mouseMove(element)

    await new Promise<void>(nextTick)
  } catch (err) {
    if (Error.captureStackTrace) Error.captureStackTrace(err, mouseMove)
    throw err
  }
}

export async function hover(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.pointerOver(element)
    fireEvent.pointerEnter(element)
    fireEvent.mouseOver(element)

    await new Promise<void>(nextTick)
  } catch (err) {
    if (Error.captureStackTrace) Error.captureStackTrace(err, hover)
    throw err
  }
}

export async function unHover(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.pointerOut(element)
    fireEvent.pointerLeave(element)
    fireEvent.mouseOut(element)
    fireEvent.mouseLeave(element)

    await new Promise<void>(nextTick)
  } catch (err) {
    if (Error.captureStackTrace) Error.captureStackTrace(err, unHover)
    throw err
  }
}
