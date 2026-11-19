import {
  createDeck,
  dealerShouldDraw,
  handValue,
  isBlackjack,
  isBust,
  settle,
  shuffle,
  type Card,
  type Rank,
} from './logic'

const hand = (...ranks: Rank[]): Card[] => ranks.map((rank) => ({ rank, suit: 'spades' }))

describe('deck', () => {
  it('has 52 unique cards', () => {
    const deck = createDeck()
    expect(deck).toHaveLength(52)
    expect(new Set(deck.map((c) => `${c.rank}${c.suit}`)).size).toBe(52)
  })

  it('shuffles into a new array with the same cards, using the given random source', () => {
    const deck = createDeck()
    const shuffled = shuffle(deck, () => 0)
    expect(shuffled).not.toBe(deck)
    expect(shuffled).not.toEqual(deck)
    expect(shuffled).toHaveLength(52)
    expect(new Set(shuffled.map((c) => `${c.rank}${c.suit}`)).size).toBe(52)
    expect(deck).toEqual(createDeck())
    expect(shuffle(deck, () => 0)).toEqual(shuffled)
  })
})

describe('handValue', () => {
  it('counts number cards at face value and face cards as 10', () => {
    expect(handValue(hand('5', '9'))).toEqual({ total: 14, soft: false })
    expect(handValue(hand('K', 'Q', 'J'))).toEqual({ total: 30, soft: false })
  })

  it('counts an ace as 11 when it fits, and marks the hand soft', () => {
    expect(handValue(hand('A', '6'))).toEqual({ total: 17, soft: true })
    expect(handValue(hand('A', 'K'))).toEqual({ total: 21, soft: true })
  })

  it('counts an ace as 1 when 11 would bust', () => {
    expect(handValue(hand('A', '6', '9'))).toEqual({ total: 16, soft: false })
    expect(handValue(hand('A', 'A', '9'))).toEqual({ total: 21, soft: true })
    expect(handValue(hand('A', 'A', 'K'))).toEqual({ total: 12, soft: false })
  })
})

describe('bust and blackjack', () => {
  it('detects busts', () => {
    expect(isBust(hand('K', 'Q', '2'))).toBe(true)
    expect(isBust(hand('K', 'Q', 'A'))).toBe(false)
  })

  it('only counts a two-card 21 as blackjack', () => {
    expect(isBlackjack(hand('A', 'K'))).toBe(true)
    expect(isBlackjack(hand('7', '7', '7'))).toBe(false)
    expect(isBlackjack(hand('K', '9'))).toBe(false)
  })
})

describe('dealerShouldDraw', () => {
  it('draws below 17 and stands on all 17s', () => {
    expect(dealerShouldDraw(hand('10', '6'))).toBe(true)
    expect(dealerShouldDraw(hand('10', '7'))).toBe(false)
    expect(dealerShouldDraw(hand('A', '6'))).toBe(false)
    expect(dealerShouldDraw(hand('K', '9'))).toBe(false)
    expect(dealerShouldDraw(hand('A', '5'))).toBe(true)
  })
})

describe('settle', () => {
  it('compares totals', () => {
    expect(settle(hand('K', '9'), hand('K', '8'))).toBe('win')
    expect(settle(hand('K', '8'), hand('K', '9'))).toBe('lose')
    expect(settle(hand('K', '8'), hand('9', '9'))).toBe('push')
  })

  it('loses when the player busts, even if the dealer also busts', () => {
    expect(settle(hand('K', 'Q', '5'), hand('K', '6', '9'))).toBe('lose')
  })

  it('wins when only the dealer busts', () => {
    expect(settle(hand('K', '2'), hand('K', '6', '9'))).toBe('win')
  })

  it('ranks blackjack above any other 21', () => {
    expect(settle(hand('A', 'K'), hand('7', '7', '7'))).toBe('win')
    expect(settle(hand('7', '7', '7'), hand('A', 'K'))).toBe('lose')
  })

  it('pushes when both have blackjack, and when both have a plain 21', () => {
    expect(settle(hand('A', 'K'), hand('A', 'Q'))).toBe('push')
    expect(settle(hand('7', '7', '7'), hand('5', '6', '10'))).toBe('push')
  })
})
