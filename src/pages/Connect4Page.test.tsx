import { act, fireEvent, render, screen } from '@testing-library/react'
import Connect4Page from './Connect4Page'

const col = (n: number) => screen.getByRole('button', { name: `Drop disc in column ${n}` })
const drop = (...cols: number[]) => cols.forEach((n) => fireEvent.click(col(n)))
const play = () => fireEvent.click(screen.getByRole('button', { name: 'Play' }))
const name = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

describe('Connect4Page', () => {
  afterEach(() => vi.useRealTimers())

  it('has columns disabled before Play', () => {
    render(<Connect4Page />)
    expect(col(1)).toBeDisabled()
    expect(screen.getByText('Enter your names and press Play')).toBeInTheDocument()
  })

  it('prompts players by name and alternates turns', () => {
    render(<Connect4Page />)
    name('Player 1 name', '  Alice ')
    name('Player 2 name', 'Bob')
    play()
    expect(screen.getByText("Alice, it's your turn")).toBeInTheDocument()
    expect(screen.getByLabelText('Player 1 name')).toBeDisabled()
    drop(1)
    expect(screen.getByText("Bob, it's your turn")).toBeInTheDocument()
    drop(2)
    expect(screen.getByText("Alice, it's your turn")).toBeInTheDocument()
  })

  it('uses default names for blank names', () => {
    render(<Connect4Page />)
    play()
    expect(screen.getByText("Player 1, it's your turn")).toBeInTheDocument()
  })

  it('announces a win and disables columns', () => {
    render(<Connect4Page />)
    name('Player 1 name', 'Alice')
    play()
    drop(1, 2, 1, 2, 1, 2, 1)
    expect(screen.getByText('Alice wins!')).toBeInTheDocument()
    expect(col(5)).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled()
  })

  it('resets during a game keeping the setup', () => {
    render(<Connect4Page />)
    name('Player 1 name', 'Alice')
    play()
    drop(1)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByText('Enter your names and press Play')).toBeInTheDocument()
    expect(screen.getByLabelText('Player 1 name')).toHaveValue('Alice')
    expect(screen.getByLabelText('Player 1 name')).toBeEnabled()
    expect(col(1)).toBeDisabled()
    play()
    expect(screen.getByText("Alice, it's your turn")).toBeInTheDocument()
  })

  it('makes colours exclusive', () => {
    render(<Connect4Page />)
    const opt = (sel: string, c: string) =>
      (screen.getByLabelText(sel) as HTMLSelectElement).querySelector(`option[value="${c}"]`)
    expect(opt('Player 2 colour', 'red')).toBeDisabled()
    expect(opt('Player 1 colour', 'yellow')).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Player 1 colour'), { target: { value: 'blue' } })
    expect(opt('Player 2 colour', 'blue')).toBeDisabled()
    expect(opt('Player 2 colour', 'red')).not.toBeDisabled()
  })

  it('plays against the computer with a delay', () => {
    vi.useFakeTimers()
    render(<Connect4Page />)
    fireEvent.click(screen.getByLabelText('Computer'))
    expect(screen.getByLabelText('Player 2 name')).toBeDisabled()
    play()
    drop(1)
    expect(screen.getByText('Computer is thinking…')).toBeInTheDocument()
    expect(col(2)).toBeDisabled()
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(screen.getByText("Player 1, it's your turn")).toBeInTheDocument()
    expect(col(2)).toBeEnabled()
  })

  it('cancels a pending computer move on Reset', () => {
    vi.useFakeTimers()
    render(<Connect4Page />)
    fireEvent.click(screen.getByLabelText('Computer'))
    play()
    drop(1)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    play()
    expect(screen.getByText("Player 1, it's your turn")).toBeInTheDocument()
  })
})
