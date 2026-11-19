import { COLS, ROWS, createBoard, dropDisc, getWinner, isDraw, playableColumns } from './logic'
import type { Board, Player } from './logic'

function place(board: Board, cells: [number, number][], p: Player): Board {
  const b = board.map((r) => r.slice())
  cells.forEach(([r, c]) => (b[r][c] = p))
  return b
}

describe('connect4 logic', () => {
  it('creates an empty 7x6 board', () => {
    const b = createBoard()
    expect(b).toHaveLength(ROWS)
    expect(b.every((r) => r.length === COLS && r.every((c) => c === 0))).toBe(true)
  })

  it('drops to the lowest empty cell without mutating', () => {
    const b = createBoard()
    const first = dropDisc(b, 3, 1)!
    expect(first.row).toBe(5)
    const second = dropDisc(first.board, 3, 2)!
    expect(second.row).toBe(4)
    expect(second.board[4][3]).toBe(2)
    expect(b[5][3]).toBe(0)
  })

  it('refuses full and invalid columns', () => {
    let b = createBoard()
    for (let i = 0; i < ROWS; i++) b = dropDisc(b, 0, (i % 2 ? 2 : 1) as Player)!.board
    expect(dropDisc(b, 0, 1)).toBeNull()
    expect(playableColumns(b)).toEqual([1, 2, 3, 4, 5, 6])
    expect(dropDisc(b, -1, 1)).toBeNull()
    expect(dropDisc(b, COLS, 1)).toBeNull()
  })

  it('has no winner on an empty board', () => {
    expect(getWinner(createBoard())).toBeNull()
  })

  it.each([
    ['horizontal', [[5, 1], [5, 2], [5, 3], [5, 4]]],
    ['vertical', [[2, 6], [3, 6], [4, 6], [5, 6]]],
    ['diagonal down-right', [[0, 0], [1, 1], [2, 2], [3, 3]]],
    ['diagonal up-right', [[5, 0], [4, 1], [3, 2], [2, 3]]],
  ] as [string, [number, number][]][])('detects a %s win', (_n, cells) => {
    const w = getWinner(place(createBoard(), cells, 2))
    expect(w?.player).toBe(2)
    expect(w?.cells).toHaveLength(4)
    expect([...w!.cells].sort()).toEqual([...cells].sort())
  })

  it('does not count three in a row', () => {
    expect(getWinner(place(createBoard(), [[5, 0], [5, 1], [5, 2]], 1))).toBeNull()
  })

  it('detects a draw on a full board with no winner', () => {
    // Columns pattern avoiding any four in a row
    const rows = ['1122112', '2211221', '1122112', '2211221', '1122112', '2211221']
    const b = rows.map((r) => [...r].map((ch) => Number(ch))) as Board
    expect(getWinner(b)).toBeNull()
    expect(isDraw(b)).toBe(true)
  })

  it('is not a draw while moves remain or when someone won', () => {
    expect(isDraw(createBoard())).toBe(false)
    const rows = ['1111222', '2211221', '1122112', '2211221', '1122112', '2211221']
    const won = rows.map((r) => [...r].map((ch) => Number(ch))) as Board
    expect(getWinner(won)).not.toBeNull()
    expect(isDraw(won)).toBe(false)
  })
})
