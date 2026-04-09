/* eslint-disable */
import { ApiError } from '@/core/client';

const apiErrorMessage = (error: ApiError): string => {
  if (error.status === 0) {
    return 'Servidor indisponível. Tente novamente em alguns instantes.';
  }
  if (error.status === 403) {
    return 'Você não tem permissão para acessar este recurso.';
  }
  if (Array.isArray(error.body?.message)) {
    const first = error.body.message[0];
    if (typeof first === 'string') return first;
    if (first?.field && first?.message) return `${first.field}: ${first.message}`;
    console.log(error.body.message);
    return 'Erro inesperado';
  }
  return error.body?.message ?? `Erro ${error.status}`;
};

export const formatApiErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof ApiError) return apiErrorMessage(error);
  if (error instanceof Error) return error.message;
  console.log(error);
  
  return 'Erro inesperado';
};
