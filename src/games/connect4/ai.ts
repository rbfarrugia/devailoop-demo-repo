import { COLS, dropDisc, getWinner, playableColumns } from './logic'
import type { Board, Player } from './logic'

function wins(board: Board, col: number, player: Player): boolean {
  const result = dropDisc(board, col, player)
  return result !== null && getWinner(result.board)?.player === player
}

/** Rule-based move: win, block, avoid giving a win, then prefer the centre. */
export function chooseComputerMove(
  board: Board,
  me: Player,
  opponent: Player,
  random: () => number = Math.random,
): number {
  const cols = playableColumns(board)
  if (cols.length === 0) throw new Error('No playable column')

  const pick = (options: number[]) => options[Math.floor(random() * options.length)]

  const win = cols.filter((c) => wins(board, c, me))
  if (win.length > 0) return pick(win)

  const block = cols.filter((c) => wins(board, c, opponent))
  if (block.length > 0) return pick(block)

  const safe = cols.filter((c) => {
    const after = dropDisc(board, c, me)!.board
    return !playableColumns(after).some((o) => wins(after, o, opponent))
  })
  const candidates = safe.length > 0 ? safe : cols

  const centre = (COLS - 1) / 2
  const best = Math.min(...candidates.map((c) => Math.abs(c - centre)))
  return pick(candidates.filter((c) => Math.abs(c - centre) === best))
}
