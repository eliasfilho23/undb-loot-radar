import { lazy } from 'react';
import type { LazyExoticComponent, FC } from 'react';

type Route = {
  key      : string
  path     : string
  component: LazyExoticComponent<FC>
}

export const routes: Route[] = [
  {
    key      : 'home',
    path     : '/',
    component: lazy(() => import('@/features/home/HomePage')),
  },
  {
    key      : 'auth-login',
    path     : '/entrar',
    component: lazy(() => import('@/features/auth/LoginPage')),
  },
  {
    key      : 'auth-register',
    path     : '/registar',
    component: lazy(() => import('@/features/auth/RegisterPage')),
  },
  {
    key      : 'auth-confirm-email',
    path     : '/confirmar-email',
    component: lazy(() => import('@/features/auth/ConfirmEmailPage')),
  },
];

export const privateRoutes: Route[] = [
  {
    key      : 'claims',
    path     : '/meus-resgates',
    component: lazy(() => import('@/features/claims/MyClaimsPage')),
  },
];
