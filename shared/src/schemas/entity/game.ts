import z from 'zod';

export const Game = z.object({
  id               : z.number().int(),
  title            : z.string(),
  thumbnail        : z.string(),
  description      : z.string(),
  platform         : z.string(),
  type             : z.string(),
  open_giveaway_url: z.string(),
});

export type Game = z.infer<typeof Game>;

export const GameDocs = {
  list: {
    operation: {
      summary    : 'Listar jogos gratuitos',
      description: 'Retorna giveaways ativos da GamerPower API',
    },
    body: {
      schema     : z.array(Game),
      status     : 200,
      description: 'Lista de jogos gratuitos',
    },
  },
};
