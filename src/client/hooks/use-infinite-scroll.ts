import { useEffect, useRef } from 'react'

export const useInfiniteScroll = (
  hasMore: boolean,
  isLoading: boolean,
  setSize: (size: (prevSize: number) => number) => void,
  distance = 250
) => {
  const loaderRef = useRef<HTMLDivElement | null | undefined>()

  useEffect(() => {
    const loaderNode = loaderRef.current
    if (!loaderNode || !hasMore || isLoading) return undefined

    const scrollContainerNode = getScrollParent(loaderNode)
    if (!scrollContainerNode) {
      // all content is visible and user can't scroll, load new page immediately
      setSize((size) => size + 1)
      return undefined
    }

    const options = {
      root: scrollContainerNode,
      rootMargin: `0px 0px ${distance}px 0px`
    }

    let previousY: number | undefined
    let previousRatio = 0

    const listener: IntersectionObserverCallback = (entries) => {
      entries.forEach(({ isIntersecting, intersectionRatio, boundingClientRect = {} }) => {
        const { y } = boundingClientRect
        if (isIntersecting && intersectionRatio >= previousRatio && (!previousY || (y && y < previousY))) {
          setSize((size) => size + 1)
        }
        previousY = y
        previousRatio = intersectionRatio
      })
    }

    const observer = new IntersectionObserver(listener, options)
    observer.observe(loaderNode)

    return () => observer.disconnect()
  }, [hasMore, isLoading, distance, setSize])

  return [loaderRef]
}

const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
  if (node == null) {
    return null
  }

  if (node.scrollHeight > node.clientHeight) {
    return node
  }
  return getScrollParent(node.parentNode as HTMLElement)
}
