import Sidebar from './components/Sidebar'
import Connect4Page from './pages/Connect4Page'
import WelcomePage from './pages/WelcomePage'
import { CONNECT4_ROUTE, useHashRoute } from './router'

function App() {
  const route = useHashRoute()

  return (
    <div className="layout">
      <Sidebar route={route} />
      <main>{route === CONNECT4_ROUTE ? <Connect4Page /> : <WelcomePage />}</main>
    </div>
  )
}

export default App
