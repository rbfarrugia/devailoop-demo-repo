import { CONNECT4_ROUTE } from '../router'

export default function WelcomePage() {
  return (
    <section>
      <h1>Welcome</h1>
      <p>Pick something to do from the menu on the left.</p>
      <p>
        Fancy a game? <a href={`#${CONNECT4_ROUTE}`}>Play Connect 4</a>
      </p>
    </section>
  )
}
