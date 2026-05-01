import z from 'zod';

export const LoginBody = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type LoginBody = z.infer<typeof LoginBody>;

export const LoginResponse = z.object({
  id  : z.string(),
  username: z.string(),
  email   : z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponse>;

export const MeResponse = z.object({
  userId  : z.string(),
  username: z.string(),
});

export type MeResponse = z.infer<typeof MeResponse>;

export const AuthDocs = {
  login: {
    operation: { summary: 'Login com username e senha' },
    body     : { schema: LoginResponse, status: 200, description: 'Login realizado com sucesso' },
  },
  me: {
    operation: { summary: 'Retorna o usuário autenticado' },
    body     : { schema: MeResponse, status: 200, description: 'Usuário autenticado' },
  },
  refresh: {
    operation: { summary: 'Renova o access token via refresh token cookie' },
    body     : { schema: LoginResponse, status: 200, description: 'Token renovado com sucesso' },
  },
  logout: {
    operation: { summary: 'Encerra a sessão do usuário' },
    body     : { schema: z.object({}), status: 200, description: 'Logout realizado com sucesso' },
  },
};
