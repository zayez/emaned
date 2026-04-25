import { useLayoutEffect, useRef, useState, type DependencyList } from "react"

export function useAutoFit<T extends HTMLElement = HTMLElement>(
  deps: DependencyList,
  avail: number,
  target: number,
  min = 36,
): [React.RefObject<T>, number] {
  const ref = useRef<T>(null)
  const [size, setSize] = useState<number>(target)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) {
      setSize(target)
      return
    }
    const run = () => {
      // Measure the natural single-line width so multi-word text (which would
      // otherwise wrap and report scrollWidth ≈ container width) and breakless
      // forms like camelCase get the same treatment.
      const prevWhiteSpace = el.style.whiteSpace
      el.style.whiteSpace = "nowrap"
      el.style.fontSize = target + "px"
      let w = el.scrollWidth
      let next = target
      if (w > avail) {
        // Iterate: linear estimation under-shrinks at large font sizes because
        // letter-spacing and font-stretch don't scale perfectly. Two passes
        // converge for any realistic codename length.
        for (let i = 0; i < 3; i++) {
          next = Math.max(min, Math.floor(next * (avail / w) * 0.98))
          el.style.fontSize = next + "px"
          w = el.scrollWidth
          if (w <= avail || next === min) break
        }
      }
      el.style.whiteSpace = prevWhiteSpace
      setSize(next)
    }
    run()
    if (document.fonts?.ready) {
      document.fonts.ready.then(run).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return [ref, size]
}
