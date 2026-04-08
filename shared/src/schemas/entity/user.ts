import z from "zod";

export const User = z.object({
  username: z.string().min(3).max(50),
  email: z.email(),
});

export type User = z.infer<typeof User>;

export const UserResponse = User.extend({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
});

export type UserResponse = z.infer<typeof UserResponse>;

export const UserDocs = {
  create: {
    operation: {
      summary: 'Criar usuário',
      description: 'Cria um novo usuário no sistema',
    },
    body: {
      schema: User,
      status: 201,
      description: 'Usuário criado com sucesso',
    },
  },
  findOne: {
    operation: {
      summary: 'Buscar usuário por ID',
    },
    body: {
      schema: UserResponse,
      status: 200,
      description: 'Usuário encontrado',
    },
    params: [
      { name: 'id', description: 'UUID do usuário' },
    ],
    responses: [
      { status: 404, description: 'Usuário não encontrado' },
    ],
  },
  findAll: {
    operation: {
      summary: 'Listar todos os usuários',
    },
    body: {
      schema: UserResponse,
      status: 200,
      description: 'Lista de usuários retornada com sucesso',
    },
  },
};
