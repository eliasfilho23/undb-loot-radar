import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Router } from './routes/Router';
import { api } from './api';
import { useUserStore } from './store/useUserStore';

export default function App() {
  const login    = useUserStore((s) => s.login);
  const logout   = useUserStore((s) => s.logout);
  const setLoaded = useUserStore((s) => s.setLoaded);

  useEffect(() => {
    api.auth.me().then(({ response }) => {
      if (response) {
        login(response.body);
      } else {
        logout();
      }
      setLoaded();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Router />
      <Toaster theme="dark" />
    </>
  );
}
