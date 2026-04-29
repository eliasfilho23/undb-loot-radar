import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { routes, privateRoutes } from './routes';
import { AppLayout } from '@/layouts/app';
import { SessionGuard } from '@/features/auth/SessionGuard';

function PageLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="text-gray-400 text-sm">Carregando...</span>
    </div>
  );
}

export function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          {routes.map(({ key, path, component: Component }) => (
            <Route key={key} path={path} element={<Component />} />
          ))}

          <Route element={<SessionGuard />}>
            {privateRoutes.map(({ key, path, component: Component }) => (
              <Route key={key} path={path} element={<Component />} />
            ))}
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
