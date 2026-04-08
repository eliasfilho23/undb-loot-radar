import { Link } from 'react-router';
import { RouteUri } from '@/constants/RouteUri';

export default function ConfirmEmailPage() {
  return (
    <div className="max-w-md mx-auto mt-12 text-center">
      <div className="text-5xl mb-6">📬</div>
      <h1 className="text-2xl font-bold text-white mb-3">Confirma o teu email</h1>
      <p className="text-gray-400 text-sm mb-8">
        Enviámos um link de confirmação para o teu endereço de email. Verifica a caixa de entrada
        (e a pasta de spam).
      </p>
      <Link
        to={RouteUri.Home}
        className="text-sm text-accent hover:underline"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
