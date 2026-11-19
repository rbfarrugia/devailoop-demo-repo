import Sidebar from './components/Sidebar'
import BlackjackPage from './pages/BlackjackPage'
import Connect4Page from './pages/Connect4Page'
import WelcomePage from './pages/WelcomePage'
import { BLACKJACK_ROUTE, CONNECT4_ROUTE, useHashRoute } from './router'

function App() {
  const route = useHashRoute()

  return (
    <div className="layout">
      <Sidebar route={route} />
      <main>
        {route === CONNECT4_ROUTE ? (
          <Connect4Page />
        ) : route === BLACKJACK_ROUTE ? (
          <BlackjackPage />
        ) : (
          <WelcomePage />
        )}
      </main>
    </div>
  )
}

export default App
