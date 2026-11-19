import { act, fireEvent, render, screen } from '@testing-library/react'
import type { Card } from '../games/blackjack/logic'
import BlackjackPage from './BlackjackPage'

let stacked: Card[] = []
vi.mock('../games/blackjack/logic', async (orig) => ({
  ...(await orig<typeof import('../games/blackjack/logic')>()),
  shuffle: () => [...stacked],
}))

const c = (rank: Card['rank'], suit: Card['suit'] = 'spades'): Card => ({ rank, suit })
// order dealt: player, dealer, player, dealer, then draws
const stack = (...cards: Card[]) => {
  stacked = [...cards, c('2', 'clubs'), c('2', 'clubs'), c('2', 'clubs')]
}
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const tally = () => screen.getByText(/Wins:/).textContent

describe('BlackjackPage', () => {
  afterEach(() => vi.useRealTimers())

  it('deals with the dealer hole card face down', () => {
    stack(c('K'), c('9', 'hearts'), c('7'), c('8'))
    render(<BlackjackPage />)
    click('Deal')
    expect(screen.getByLabelText('King of spades')).toHaveTextContent('K♠')
    expect(screen.getByLabelText('Nine of hearts')).toHaveClass('bj-red')
    expect(screen.getByLabelText('Face-down card')).toBeInTheDocument()
    expect(screen.queryByLabelText('Eight of spades')).toBeNull()
    expect(screen.getByText('17')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
  })

  it('hits and shows soft totals', () => {
    stack(c('A'), c('9', 'hearts'), c('5'), c('8'), c('3'))
    render(<BlackjackPage />)
    click('Deal')
    expect(screen.getByText('Soft 16')).toBeInTheDocument()
    click('Hit')
    expect(screen.getByText('Soft 19')).toBeInTheDocument()
  })

  it('busting is an immediate loss without dealer draw', () => {
    stack(c('10'), c('6', 'hearts'), c('6'), c('5'), c('K'))
    render(<BlackjackPage />)
    click('Deal')
    click('Hit')
    expect(screen.getByText('Bust! You lose.')).toBeInTheDocument()
    expect(screen.getByLabelText('Five of spades')).toBeInTheDocument()
    expect(tally()).toContain('Losses: 1')
    expect(screen.getByRole('button', { name: 'Deal again' })).toBeEnabled()
  })

  it('stand: dealer draws one card per 500 ms and busts', () => {
    vi.useFakeTimers()
    stack(c('10'), c('6', 'hearts'), c('9'), c('4'), c('3'), c('K'))
    render(<BlackjackPage />)
    click('Deal')
    click('Stand')
    expect(screen.getByLabelText('Four of spades')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hit' })).toBeDisabled()
    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByLabelText('Three of spades')).toBeInTheDocument()
    expect(screen.queryByLabelText('King of spades')).toBeNull()
    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByLabelText('King of spades')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByText('Dealer busts. You win!')).toBeInTheDocument()
    expect(tally()).toContain('Wins: 1')
  })

  it('stand: dealer stops at 17 and player wins or loses', () => {
    vi.useFakeTimers()
    stack(c('10'), c('10', 'hearts'), c('8'), c('7'))
    render(<BlackjackPage />)
    click('Deal')
    click('Stand')
    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByText('You win!')).toBeInTheDocument()
  })

  it('settles naturals at once', () => {
    stack(c('A'), c('5', 'hearts'), c('K'), c('6'))
    render(<BlackjackPage />)
    click('Deal')
    expect(screen.getByText('Blackjack! You win!')).toBeInTheDocument()
    expect(screen.getByLabelText('Six of spades')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hit' })).toBeNull()

    stack(c('9'), c('A', 'hearts'), c('8'), c('K'))
    click('Deal again')
    expect(screen.getByText('Dealer has blackjack. You lose.')).toBeInTheDocument()

    stack(c('A'), c('A', 'hearts'), c('K'), c('Q'))
    click('Deal again')
    expect(screen.getByText('Push: it is a tie.')).toBeInTheDocument()
    expect(tally()).toBe('Wins: 1 · Losses: 1 · Pushes: 1')
  })
})
