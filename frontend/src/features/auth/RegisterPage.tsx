import { Link } from 'react-router';
import { RouteUri } from '@/constants/RouteUri';

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-white mb-1">Criar conta</h1>
      <p className="text-gray-400 text-sm mb-8">
        Já tens conta?{' '}
        <Link to={RouteUri.Auth.Login} className="text-accent hover:underline">
          Entrar
        </Link>
      </p>

      <form className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-300" htmlFor="username">
            Nome de utilizador
          </label>
          <input
            id="username"
            type="text"
            placeholder="ex: gamer123"
            className="bg-card border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="ex: gamer@email.com"
            className="bg-card border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-accent"
          />
        </div>

        <button
          type="submit"
          className="bg-accent hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          Registar
        </button>
      </form>
    </div>
  );
}
