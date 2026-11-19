import { BLACKJACK_ROUTE, CONNECT4_ROUTE, HOME_ROUTE } from '../router'

type SidebarProps = { route: string }

function NavLink({ to, route, children }: { to: string; route: string; children: string }) {
  return (
    <a href={`#${to}`} aria-current={route === to ? 'page' : undefined}>
      {children}
    </a>
  )
}

export default function Sidebar({ route }: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <p className="sidebar-title">DevAILoop Demo</p>
      <ul>
        <li>
          <NavLink to={HOME_ROUTE} route={route}>
            Home
          </NavLink>
        </li>
      </ul>
      <h2 className="sidebar-heading">Games</h2>
      <ul>
        <li>
          <NavLink to={CONNECT4_ROUTE} route={route}>
            Connect 4
          </NavLink>
        </li>
        <li>
          <NavLink to={BLACKJACK_ROUTE} route={route}>
            Blackjack
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
