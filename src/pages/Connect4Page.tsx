import { useEffect, useState } from 'react'
import { chooseComputerMove } from '../games/connect4/ai'
import {
  COLS,
  createBoard,
  dropDisc,
  getWinner,
  isDraw,
  type Board,
  type Player,
} from '../games/connect4/logic'

const COLOURS = ['red', 'yellow', 'blue', 'green', 'purple', 'orange']
const MAX_NAME = 20
const COMPUTER_DELAY_MS = 500

type Opponent = 'human' | 'computer'

function cleanName(name: string, fallback: string) {
  return name.trim().slice(0, MAX_NAME) || fallback
}

export default function Connect4Page() {
  const [name1, setName1] = useState('')
  const [name2, setName2] = useState('')
  const [colour1, setColour1] = useState('red')
  const [colour2, setColour2] = useState('yellow')
  const [opponent, setOpponent] = useState<Opponent>('human')
  const [started, setStarted] = useState(false)
  const [board, setBoard] = useState<Board>(createBoard)
  const [current, setCurrent] = useState<Player>(1)
  // Names and opponent as they were when Play was pressed.
  const [players, setPlayers] = useState({ 1: 'Player 1', 2: 'Player 2' })

  const win = getWinner(board)
  const draw = !win && isDraw(board)
  const over = win !== null || draw
  const computerTurn = started && !over && opponent === 'computer' && current === 2

  useEffect(() => {
    if (!computerTurn) return
    const id = setTimeout(() => {
      const col = chooseComputerMove(board, 2, 1)
      play(col)
    }, COMPUTER_DELAY_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computerTurn, board])

  function play(col: number) {
    const result = dropDisc(board, col, current)
    if (!result) return
    setBoard(result.board)
    setCurrent(current === 1 ? 2 : 1)
  }

  function start() {
    setPlayers({
      1: cleanName(name1, 'Player 1'),
      2: opponent === 'computer' ? 'Computer' : cleanName(name2, 'Player 2'),
    })
    setBoard(createBoard())
    setCurrent(1)
    setStarted(true)
  }

  function reset() {
    setStarted(false)
    setBoard(createBoard())
    setCurrent(1)
  }

  const colours = { 1: colour1, 2: colour2 }
  const winKeys = new Set(win?.cells.map(([r, c]) => `${r}-${c}`))

  let status = 'Enter your names and press Play'
  if (started) {
    if (win) status = `${players[win.player]} wins!`
    else if (draw) status = "It's a draw!"
    else if (computerTurn) status = 'Computer is thinking…'
    else status = `${players[current]}, it's your turn`
  }
  const statusPlayer = win ? win.player : started && !draw ? current : null

  function colourSelect(label: string, value: string, other: string, set: (v: string) => void) {
    return (
      <label>
        {label}
        <select value={value} disabled={started} onChange={(e) => set(e.target.value)}>
          {COLOURS.map((c) => (
            <option key={c} value={c} disabled={c === other}>
              {c}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <section className="connect4">
      <h1>Connect 4</h1>
      <form className="c4-setup" onSubmit={(e) => e.preventDefault()}>
        <fieldset disabled={started}>
          <legend>Opponent</legend>
          <label>
            <input
              type="radio"
              name="opponent"
              checked={opponent === 'human'}
              onChange={() => setOpponent('human')}
            />
            Another player
          </label>
          <label>
            <input
              type="radio"
              name="opponent"
              checked={opponent === 'computer'}
              onChange={() => setOpponent('computer')}
            />
            Computer
          </label>
        </fieldset>
        <div className="c4-player">
          <label>
            Player 1 name
            <input
              value={name1}
              maxLength={MAX_NAME}
              disabled={started}
              placeholder="Player 1"
              onChange={(e) => setName1(e.target.value)}
            />
          </label>
          {colourSelect('Player 1 colour', colour1, colour2, setColour1)}
        </div>
        <div className="c4-player">
          <label>
            Player 2 name
            <input
              value={opponent === 'computer' ? 'Computer' : name2}
              maxLength={MAX_NAME}
              disabled={started || opponent === 'computer'}
              placeholder="Player 2"
              onChange={(e) => setName2(e.target.value)}
            />
          </label>
          {colourSelect('Player 2 colour', colour2, colour1, setColour2)}
        </div>
        <div className="c4-buttons">
          <button type="button" onClick={start} disabled={started}>
            Play
          </button>
          <button type="button" onClick={reset} disabled={!started}>
            Reset
          </button>
        </div>
      </form>

      <p className="c4-status" aria-live="polite">
        {statusPlayer && (
          <span
            className="c4-disc c4-disc-small"
            style={{ background: colours[statusPlayer] }}
            aria-hidden="true"
          />
        )}
        {status}
      </p>

      <div className="c4-board">
        {Array.from({ length: COLS }, (_, col) => (
          <button
            key={col}
            type="button"
            className="c4-column"
            aria-label={`Drop disc in column ${col + 1}`}
            disabled={!started || over || computerTurn || board[0][col] !== 0}
            onClick={() => play(col)}
          >
            {board.map((row, r) => (
              <span
                key={r}
                className={`c4-disc${winKeys.has(`${r}-${col}`) ? ' c4-win' : ''}`}
                style={row[col] ? { background: colours[row[col] as Player] } : undefined}
              />
            ))}
          </button>
        ))}
      </div>
    </section>
  )
}
