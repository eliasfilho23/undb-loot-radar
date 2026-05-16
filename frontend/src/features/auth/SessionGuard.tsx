import { Navigate, Outlet } from 'react-router';
import { useUserStore } from '@/store/useUserStore';

export function SessionGuard() {
  const isLoading = useUserStore((s) => s.isLoading);
  const isLogged  = useUserStore((s) => s.isLogged);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="text-gray-400 text-sm">Carregando...</span>
      </div>
    );
  }

  if (!isLogged) {
    return <Navigate to="/entrar" replace />;
  }

  return <Outlet />;
}
