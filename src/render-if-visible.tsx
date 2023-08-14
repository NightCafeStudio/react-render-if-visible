import React, { useMemo, useState, useRef, useEffect } from 'react'

type Props = {
  /**
   * Whether the element should be visible initially or not.
   * Useful e.g. for always setting the first N items to visible.
   * Default: false
   */
  initialVisible?: boolean
  /** An estimate of the element's height */
  defaultHeight?: number
  /** How far outside the viewport in pixels should elements be considered visible?  */
  visibleOffset?: number
  /** Should the element stay rendered after it becomes visible? */
  stayRendered?: boolean
  root?: HTMLElement | null
  /** E.g. 'span', 'tbody'. Default = 'div' */
  rootElement?: string
  rootElementClass?: string
  rootElementStyle?: React.CSSProperties;
  /** E.g. 'span', 'tr'. Default = 'div' */
  placeholderElement?: string
  placeholderElementClass?: string
  children: React.ReactNode
}

const RenderIfVisible = ({
  initialVisible = false,
  defaultHeight = 300,
  visibleOffset = 1000,
  stayRendered = false,
  root = null,
  rootElement = 'div',
  rootElementClass = '',
  rootElementStyle = {},
  placeholderElement = 'div',
  placeholderElementClass = '',
  children,
}: Props) => {
  const [isVisible, setIsVisible] = useState<boolean>(initialVisible)
  const wasVisible = useRef<boolean>(initialVisible)
  const placeholderHeight = useRef<number>(defaultHeight)
  const intersectionRef = useRef<HTMLDivElement>(null)

  // Set visibility with intersection observer
  useEffect(() => {
    if (intersectionRef.current) {
      const localRef = intersectionRef.current
      const observer = new IntersectionObserver(
        (entries) => {
          // Before switching off `isVisible`, set the height of the placeholder
          if (!entries[0].isIntersecting) {
            placeholderHeight.current = localRef!.offsetHeight
          }
          if (typeof window !== undefined && window.requestIdleCallback) {
            window.requestIdleCallback(
              () => setIsVisible(entries[0].isIntersecting),
              {
                timeout: 600,
              }
            )
          } else {
            setIsVisible(entries[0].isIntersecting)
          }
        },
        { root, rootMargin: `${visibleOffset}px 0px ${visibleOffset}px 0px` }
      )

      observer.observe(localRef)
      return () => {
        if (localRef) {
          observer.unobserve(localRef)
        }
      }
    }
    return () => {}
  }, [])

  useEffect(() => {
    if (isVisible) {
      wasVisible.current = true
    }
  }, [isVisible])

  const placeholderStyle = { height: placeholderHeight.current }
  const rootClasses = useMemo(
    () => `renderIfVisible ${rootElementClass}`,
    [rootElementClass]
  )
  const placeholderClasses = useMemo(
    () => `renderIfVisible-placeholder ${placeholderElementClass}`,
    [placeholderElementClass]
  )

  return React.createElement(rootElement, {
    children: isVisible || (stayRendered && wasVisible.current) ? (
      <>{children}</>
    ) : (
      React.createElement(placeholderElement, {
        className: placeholderClasses,
        style: placeholderStyle,
      })
    ),
    ref: intersectionRef,
    className: rootClasses,
    style: rootElementStyle,
  })
}

export default RenderIfVisible
