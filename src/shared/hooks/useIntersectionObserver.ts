import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const elementRef = useRef<HTMLDivElement>(null)
  // Default to visible to avoid "blank page" when IntersectionObserver
  // is unavailable or fails to fire (e.g. browser quirks / extensions).
  const [isIntersecting, setIsIntersecting] = useState(true)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    if (typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: options.threshold || 0.1,
        root: options.root || null,
        rootMargin: options.rootMargin || '0px'
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options.threshold, options.root, options.rootMargin])

  return [elementRef, isIntersecting]
}
