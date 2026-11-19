export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const

export type Suit = (typeof SUITS)[number]
export type Rank = (typeof RANKS)[number]
export type Card = { rank: Rank; suit: Suit }
export type Outcome = 'win' | 'lose' | 'push'

export const DEALER_STANDS_ON = 17

export function createDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })))
}

/** Fisher-Yates shuffle; returns a new array. `random` returns a number in [0, 1). */
export function shuffle(deck: Card[], random: () => number = Math.random): Card[] {
  const cards = [...deck]
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

function cardPoints(rank: Rank): number {
  if (rank === 'A') return 1
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10
  return Number(rank)
}

/** Best total of a hand: aces count 11 when that does not bust. `soft` means an ace counts as 11. */
export function handValue(cards: Card[]): { total: number; soft: boolean } {
  const total = cards.reduce((sum, card) => sum + cardPoints(card.rank), 0)
  const hasAce = cards.some((card) => card.rank === 'A')
  if (hasAce && total + 10 <= 21) return { total: total + 10, soft: true }
  return { total, soft: false }
}

export function isBust(cards: Card[]): boolean {
  return handValue(cards).total > 21
}

/** A natural: 21 with exactly two cards. */
export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards).total === 21
}

/** The dealer draws below 17 and stands on every 17, soft ones included. */
export function dealerShouldDraw(cards: Card[]): boolean {
  return handValue(cards).total < DEALER_STANDS_ON
}

/** Result of a finished round from the player's point of view. */
export function settle(player: Card[], dealer: Card[]): Outcome {
  if (isBust(player)) return 'lose'
  const playerBlackjack = isBlackjack(player)
  const dealerBlackjack = isBlackjack(dealer)
  if (playerBlackjack || dealerBlackjack) {
    if (playerBlackjack && dealerBlackjack) return 'push'
    return playerBlackjack ? 'win' : 'lose'
  }
  if (isBust(dealer)) return 'win'
  const p = handValue(player).total
  const d = handValue(dealer).total
  if (p > d) return 'win'
  if (p < d) return 'lose'
  return 'push'
}
