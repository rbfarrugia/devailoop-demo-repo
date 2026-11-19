import { act, fireEvent, render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('lands on the Welcome page', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  })

  it('shows a Games section with a Connect 4 link in the navigation', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toHaveTextContent('Games')
    expect(screen.getByRole('link', { name: 'Connect 4' })).toHaveAttribute(
      'href',
      '#/games/connect-4',
    )
  })

  it('navigates to Connect 4 and back home', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'Connect 4' }))
    expect(await screen.findByRole('heading', { name: 'Connect 4' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Connect 4' })).toHaveAttribute('aria-current', 'page')

    fireEvent.click(screen.getByRole('link', { name: 'Home' }))
    expect(await screen.findByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
  })

  it('opens on the route in the URL and falls back to Welcome for unknown routes', () => {
    window.location.hash = '#/games/connect-4'
    const { unmount } = render(<App />)
    expect(screen.getByRole('heading', { name: 'Connect 4' })).toBeInTheDocument()
    unmount()

    window.location.hash = '#/nope'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
  })

  it('reacts to hash changes', () => {
    render(<App />)
    act(() => {
      window.location.hash = '#/games/connect-4'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(screen.getByRole('heading', { name: 'Connect 4' })).toBeInTheDocument()
  })

  it('navigates to Blackjack and back home', async () => {
    render(<App />)
    const link = screen.getByRole('link', { name: 'Blackjack' })
    expect(link).toHaveAttribute('href', '#/games/blackjack')
    fireEvent.click(link)
    expect(await screen.findByRole('heading', { name: 'Blackjack' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blackjack' })).toHaveAttribute('aria-current', 'page')
    fireEvent.click(screen.getByRole('link', { name: 'Home' }))
    expect(await screen.findByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Play Blackjack' })).toHaveAttribute(
      'href',
      '#/games/blackjack',
    )
  })
})
