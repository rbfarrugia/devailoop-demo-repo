export const ROWS = 6
export const COLS = 7

export type Player = 1 | 2
export type Cell = 0 | Player
export type Board = Cell[][]
export type Position = [number, number]

export interface WinResult {
  player: Player
  cells: Position[]
}

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0))
}

/** Drops a disc into the lowest empty cell. Returns null for a full or invalid column. */
export function dropDisc(
  board: Board,
  col: number,
  player: Player,
): { board: Board; row: number } | null {
  if (!Number.isInteger(col) || col < 0 || col >= COLS) return null
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) {
      const next = board.map((r) => r.slice())
      next[row][col] = player
      return { board: next, row }
    }
  }
  return null
}

const DIRECTIONS: Position[] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

export function getWinner(board: Board): WinResult | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r][c]
      if (player === 0) continue
      for (const [dr, dc] of DIRECTIONS) {
        const cells: Position[] = []
        for (let i = 0; i < 4; i++) {
          const rr = r + dr * i
          const cc = c + dc * i
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || board[rr][cc] !== player) break
          cells.push([rr, cc])
        }
        if (cells.length === 4) return { player, cells }
      }
    }
  }
  return null
}

export function playableColumns(board: Board): number[] {
  const cols: number[] = []
  for (let c = 0; c < COLS; c++) if (board[0][c] === 0) cols.push(c)
  return cols
}

export function isDraw(board: Board): boolean {
  return playableColumns(board).length === 0 && getWinner(board) === null
}
