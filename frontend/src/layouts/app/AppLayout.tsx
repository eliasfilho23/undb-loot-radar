import { Outlet } from 'react-router'
import { Link } from 'react-router'
import { RouteUri } from '@/constants/RouteUri'

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to={RouteUri.Home}
            className="text-xl font-bold text-white hover:text-accent transition-colors"
          >
            LootRadar
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link
              to={RouteUri.Auth.Login}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              to={RouteUri.Auth.Register}
              className="text-sm bg-accent hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Registar
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
