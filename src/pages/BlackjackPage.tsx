import { useEffect, useState } from 'react'
import {
  type Card,
  type Outcome,
  createDeck,
  dealerShouldDraw,
  handValue,
  isBlackjack,
  isBust,
  settle,
  shuffle,
} from '../games/blackjack/logic'

const DEALER_DELAY_MS = 500

type Phase = 'idle' | 'player' | 'dealer' | 'done'
type Tally = { wins: number; losses: number; pushes: number }

const SYMBOLS = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' } as const
const RANK_NAMES: Record<string, string> = {
  A: 'Ace',
  J: 'Jack',
  Q: 'Queen',
  K: 'King',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Nine',
  '10': 'Ten',
}

function CardView({ card }: { card: Card | null }) {
  if (!card) {
    return <span className="bj-card bj-card-back" role="img" aria-label="Face-down card" />
  }
  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  return (
    <span
      className={`bj-card${red ? ' bj-red' : ''}`}
      role="img"
      aria-label={`${RANK_NAMES[card.rank]} of ${card.suit}`}
    >
      {card.rank}
      {SYMBOLS[card.suit]}
    </span>
  )
}

function totalText(cards: Card[]) {
  if (cards.length === 0) return ''
  const { total, soft } = handValue(cards)
  return soft ? `Soft ${total}` : `${total}`
}

const MESSAGES: Record<Outcome, string> = {
  win: 'You win!',
  lose: 'You lose.',
  push: 'Push: it is a tie.',
}

function resultMessage(player: Card[], dealer: Card[], outcome: Outcome) {
  if (isBust(player)) return 'Bust! You lose.'
  if (isBlackjack(player) && outcome === 'win') return 'Blackjack! You win!'
  if (isBlackjack(dealer) && outcome === 'lose') return 'Dealer has blackjack. You lose.'
  if (isBust(dealer)) return 'Dealer busts. You win!'
  return MESSAGES[outcome]
}

export default function BlackjackPage() {
  const [deck, setDeck] = useState<Card[]>([])
  const [player, setPlayer] = useState<Card[]>([])
  const [dealer, setDealer] = useState<Card[]>([])
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState('')
  const [tally, setTally] = useState<Tally>({ wins: 0, losses: 0, pushes: 0 })

  const finish = (p: Card[], d: Card[]) => {
    const outcome = settle(p, d)
    setMessage(resultMessage(p, d, outcome))
    setTally((t) => ({
      wins: t.wins + (outcome === 'win' ? 1 : 0),
      losses: t.losses + (outcome === 'lose' ? 1 : 0),
      pushes: t.pushes + (outcome === 'push' ? 1 : 0),
    }))
    setPhase('done')
  }

  useEffect(() => {
    if (phase !== 'dealer') return
    const timer = setTimeout(() => {
      if (dealerShouldDraw(dealer)) {
        setDealer([...dealer, deck[0]])
        setDeck(deck.slice(1))
      } else {
        finish(player, dealer)
      }
    }, DEALER_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, dealer])

  const deal = () => {
    const [p1, d1, p2, d2, ...rest] = shuffle(createDeck())
    const p = [p1, p2]
    const d = [d1, d2]
    setDeck(rest)
    setPlayer(p)
    setDealer(d)
    if (isBlackjack(p) || isBlackjack(d)) {
      finish(p, d)
    } else {
      setMessage('')
      setPhase('player')
    }
  }

  const hit = () => {
    const p = [...player, deck[0]]
    setPlayer(p)
    setDeck(deck.slice(1))
    if (isBust(p)) finish(p, dealer)
  }

  const hideHole = phase === 'player'
  const shownDealer = hideHole ? dealer.slice(0, 1) : dealer

  return (
    <section className="blackjack">
      <h1>Blackjack</h1>
      <p className="bj-tally">
        Wins: {tally.wins} · Losses: {tally.losses} · Pushes: {tally.pushes}
      </p>
      {phase === 'idle' ? (
        <p>Press Deal to start a round against the dealer.</p>
      ) : (
        <>
          <div className="bj-hand" aria-label="Dealer's hand">
            <h2>Dealer</h2>
            <div className="bj-cards">
              {shownDealer.map((c, i) => (
                <CardView key={i} card={c} />
              ))}
              {hideHole && <CardView card={null} />}
            </div>
            <p className="bj-total">{totalText(shownDealer)}</p>
          </div>
          <div className="bj-hand" aria-label="Your hand">
            <h2>You</h2>
            <div className="bj-cards">
              {player.map((c, i) => (
                <CardView key={i} card={c} />
              ))}
            </div>
            <p className="bj-total">{totalText(player)}</p>
          </div>
        </>
      )}
      <p className="bj-status" aria-live="polite">
        {message}
      </p>
      <div className="bj-actions">
        {phase === 'idle' || phase === 'done' ? (
          <button type="button" onClick={deal}>
            {phase === 'idle' ? 'Deal' : 'Deal again'}
          </button>
        ) : (
          <>
            <button type="button" onClick={hit} disabled={phase !== 'player'}>
              Hit
            </button>
            <button
              type="button"
              onClick={() => setPhase('dealer')}
              disabled={phase !== 'player'}
            >
              Stand
            </button>
          </>
        )}
      </div>
    </section>
  )
}
