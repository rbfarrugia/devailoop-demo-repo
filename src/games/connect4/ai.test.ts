import { chooseComputerMove } from './ai'
import { createBoard, dropDisc, getWinner } from './logic'
import type { Board, Player } from './logic'

const first = () => 0

function play(moves: [number, Player][]): Board {
  let b = createBoard()
  for (const [c, p] of moves) b = dropDisc(b, c, p)!.board
  return b
}

describe('chooseComputerMove', () => {
  it('prefers the centre on an empty board', () => {
    expect(chooseComputerMove(createBoard(), 2, 1, first)).toBe(3)
  })

  it('takes a win', () => {
    const b = play([[0, 2], [0, 2], [0, 2], [5, 1], [6, 1]])
    expect(chooseComputerMove(b, 2, 1, first)).toBe(0)
  })

  it('prefers winning over blocking', () => {
    const b = play([[0, 2], [0, 2], [0, 2], [4, 1], [5, 1], [6, 1]])
    expect(chooseComputerMove(b, 2, 1, first)).toBe(0)
  })

  it('blocks an immediate opponent win', () => {
    const b = play([[1, 1], [2, 1], [3, 1]])
    expect(chooseComputerMove(b, 2, 1, first)).toBe(0)
  })

  it('avoids a column that lets the opponent win next move', () => {
    // The opponent holds row 3 in columns 4-6, so a disc in column 3 at row 4
    // would let the opponent win by playing column 3 on top of it.
    const b = play([
      [3, 2],
      [6, 2], [6, 1], [6, 1],
      [5, 1], [5, 2], [5, 1],
      [4, 2], [4, 1], [4, 1],
    ])
    expect(getWinner(b)).toBeNull()
    expect(chooseComputerMove(b, 2, 1, first)).toBe(2)
  })
})
