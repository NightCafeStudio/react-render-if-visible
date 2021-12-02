import React, { useState, useRef, useEffect } from 'react'

const isServer = typeof window === 'undefined'

type Props = {
  /** An estimate of the element's height */
  defaultHeight?: number
  /** How far outside the viewport in pixels should elements be considered visible?  */
  visibleOffset?: number
  root?: HTMLElement | null
  rootElement?: HTMLElement
  placeholderElement?: HTMLElement
  children: React.ReactNode
}

const RenderIfVisible = ({
  defaultHeight = 300,
  visibleOffset = 1000,
  root = null,
  rootElement = "div",
  placeholderElement = "div",
  children
}: Props) => {
  const [isVisible, setIsVisible] = useState<boolean>(isServer)
  const placeholderHeight = useRef<number>(defaultHeight)
  const intersectionRef = useRef<HTMLDivElement>(null)

  // Set visibility with intersection observer
  useEffect(() => {
    if (intersectionRef.current) {
      const observer = new IntersectionObserver(
        entries => {
          if (typeof window !== undefined && window.requestIdleCallback) {
            window.requestIdleCallback(
              () => setIsVisible(entries[0].isIntersecting),
              {
                timeout: 600
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
    }
  }, [isVisible, intersectionRef])

  return React.createElement(
        rootElement,
        {
            children: isVisible
                ? (<>{children}</>)
                : React.createElement(
                    placeholderElement,
                    { className: "renderIfVisible-placeholder", style: placeholderStyle }
                ),
            ref: intersectionRef,
            className: "renderIfVisible",
        },
    );
}

export default RenderIfVisible
