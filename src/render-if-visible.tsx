import React, { useMemo, useState, useRef, useEffect } from 'react'

const isServer = typeof window === 'undefined'

type Props = {
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
  /** E.g. 'span', 'tr'. Default = 'div' */
  placeholderElement?: string
  placeholderElementClass?: string
  children: React.ReactNode
}

const RenderIfVisible = ({
  defaultHeight = 300,
  visibleOffset = 1000,
  stayRendered = false,
  root = null,
  rootElement = 'div',
  rootElementClass = '',
  placeholderElement = 'div',
  placeholderElementClass = '',
  children,
}: Props) => {
  const [isVisible, setIsVisible] = useState<boolean>(isServer)
  const [wasVisible, setWasVisible] = useState<boolean>(false)
  const placeholderHeight = useRef<number>(defaultHeight)
  const intersectionRef = useRef<HTMLDivElement>(null)

  const placeholderStyle = { height: placeholderHeight.current }
  const rootClasses = useMemo(
    () => `renderIfVisible ${rootElementClass}`,
    [rootElementClass]
  )
  const placeholderClasses = useMemo(
    () => `renderIfVisible-placeholder ${placeholderElementClass}`,
    [placeholderElementClass]
  )

  // Set visibility with intersection observer
  useEffect(() => {
    if (intersectionRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
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
      observer.observe(intersectionRef.current)
      return () => {
        if (intersectionRef.current) {
          observer.unobserve(intersectionRef.current)
        }
      }
    }
    return () => {}
  }, [intersectionRef])

  // Set true height for placeholder element after render.
  useEffect(() => {
    if (intersectionRef.current && isVisible) {
      placeholderHeight.current = intersectionRef.current.offsetHeight
      setWasVisible(true)
    }
  }, [isVisible, intersectionRef])

  return React.createElement(rootElement, {
    children: isVisible || (stayRendered && wasVisible) ? (
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
