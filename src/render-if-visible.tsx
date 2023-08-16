import React, { useMemo, useState, useRef, useEffect } from 'react'

type Props = {
  /**
   * Whether the element should be visible initially or not.
   * Useful e.g. for always setting the first N items to visible.
   * Default: false
   */
  initialVisible?: boolean
  /** An estimate of the element's virtualized axis size (e.g. height for vertical scroll) */
  defaultSize?: number
  /** Default = 'vertical' */
  direction?: 'vertical' | 'horizontal'
  /** How far outside the viewport in pixels should elements be considered visible?  */
  visibleOffset?: number
  /** Should the element stay rendered after it becomes visible? */
  stayRendered?: boolean
  root?: HTMLElement | null
  /** E.g. 'span', 'tbody'. Default = 'div' */
  rootElement?: string
  rootElementClass?: string
  /** E.g. 'span', 'tr'. Default = 'div' */
  placeholderElement?: string
  placeholderElementClass?: string
  children: React.ReactNode
}

const RenderIfVisible = ({
  initialVisible = false,
  defaultSize = 300,
  direction = 'vertical',
  visibleOffset = 1000,
  stayRendered = false,
  root = null,
  rootElement = 'div',
  rootElementClass = '',
  placeholderElement = 'div',
  placeholderElementClass = '',
  children,
}: Props) => {
  const [isVisible, setIsVisible] = useState<boolean>(initialVisible)
  const wasVisible = useRef<boolean>(initialVisible)
  const placeholderSize = useRef<number>(defaultSize)
  const intersectionRef = useRef<HTMLDivElement>(null)

  // Set visibility with intersection observer
  useEffect(() => {
    if (intersectionRef.current) {
      const localRef = intersectionRef.current
      const observer = new IntersectionObserver(
        (entries) => {
          // Before switching off `isVisible`, set the size of the placeholder
          if (!entries[0].isIntersecting) {
            placeholderSize.current =
              direction === 'vertical'
                ? localRef!.offsetHeight
                : localRef!.offsetWidth
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
        {
          root,
          rootMargin:
            direction === 'vertical'
              ? `${visibleOffset}px 0px ${visibleOffset}px 0px`
              : `0px ${visibleOffset}px 0px ${visibleOffset}px`,
        }
      )

      observer.observe(localRef)
      return () => {
        if (localRef) {
          observer.unobserve(localRef)
        }
      }
    }
    return () => {}
  }, [direction])

  useEffect(() => {
    if (isVisible) {
      wasVisible.current = true
    }
  }, [isVisible])

  const placeholderStyle =
    direction === 'vertical'
      ? { height: placeholderSize.current }
      : { width: placeholderSize.current }
  const rootClasses = useMemo(
    () => `renderIfVisible ${rootElementClass}`,
    [rootElementClass]
  )
  const placeholderClasses = useMemo(
    () => `renderIfVisible-placeholder ${placeholderElementClass}`,
    [placeholderElementClass]
  )

  return React.createElement(rootElement, {
    children:
      isVisible || (stayRendered && wasVisible.current) ? (
        <>{children}</>
      ) : (
        React.createElement(placeholderElement, {
          className: placeholderClasses,
          style: placeholderStyle,
        })
      ),
    ref: intersectionRef,
    className: rootClasses,
  })
}

export default RenderIfVisible
