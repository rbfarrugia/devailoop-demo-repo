import { useEffect, useState } from 'react'

export const HOME_ROUTE = '/'
export const CONNECT4_ROUTE = '/games/connect-4'
export const BLACKJACK_ROUTE = '/games/blackjack'

export function parseRoute(hash: string): string {
  const path = hash.replace(/^#/, '')
  if (path === CONNECT4_ROUTE || path === BLACKJACK_ROUTE) return path
  return HOME_ROUTE
}

export function useHashRoute(): string {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
