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

// jsdom does not implement pointer capture / scrollIntoView, used by Radix `Select`/`Popover`
// (docs/feature/04-vehicles-filtertable.md, `VehiclesFilterBar`).
if (typeof window !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
}
