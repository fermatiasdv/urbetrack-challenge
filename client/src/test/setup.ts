import '@testing-library/jest-dom/vitest'

// jsdom does not implement matchMedia; @radix-ui/themes' <Theme> reads it.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    }) as unknown as MediaQueryList
}

// jsdom does not implement ResizeObserver, used by some Radix primitives.
if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  // @ts-expect-error -- test-only stub
  window.ResizeObserver = ResizeObserverStub
}

// jsdom does not implement scrollTo; TanStack Router's scroll restoration calls it on navigation.
if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = () => {}
}
