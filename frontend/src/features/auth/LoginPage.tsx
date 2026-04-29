import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { RouteUri } from '@/constants/RouteUri';
import { api } from '@/api';
import { useUserStore } from '@/store/useUserStore';

export default function LoginPage() {
  const navigate  = useNavigate();
  const login     = useUserStore((s) => s.login);

  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      toast.error('Preenche todos os campos');
      return;
    }

    setIsLoading(true);
    const { error, response } = await api.auth.login({ username: username.trim(), password });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    login(response.body);
    navigate(RouteUri.Claims);
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-white mb-1">Entrar</h1>
      <p className="text-gray-400 text-sm mb-8">
        Não tens conta?{' '}
        <Link to={RouteUri.Auth.Register} className="text-accent hover:underline">
          Registar
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-300" htmlFor="username">
            Nome de utilizador
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ex: gamer123"
            className="bg-card border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-accent"
            autoComplete="username"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-300" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-card border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-accent"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {isLoading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
