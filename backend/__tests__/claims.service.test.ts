jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    claim: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma';
import { createClaim, getClaimsByUserId } from '../src/services/claims.service';

const mockedPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockedPrismaClaim = prisma.claim as jest.Mocked<typeof prisma.claim>;

const fakeUser = { id: 'user-1', username: 'gamer', email: 'gamer@email.com', createdAt: new Date() };

const claimInput = {
  userId: 'user-1',
  gamerPowerItemId: 101,
  title: 'Jogo Grátis da Semana',
  openGiveawayUrl: 'https://www.gamerpower.com/open/101',
};

const fakeClaim = {
  id: 'claim-1',
  userId: 'user-1',
  gamerPowerItemId: 101,
  title: 'Jogo Grátis da Semana',
  openGiveawayUrl: 'https://www.gamerpower.com/open/101',
  claimedAt: new Date(),
};

// ──────────────────────────────────────────────
// createClaim
// ──────────────────────────────────────────────
describe('claims.service — createClaim', () => {
  it('deve lançar erro 404 se o utilizador não existir', async () => {
    mockedPrismaUser.findUnique.mockResolvedValueOnce(null);

    await expect(createClaim(claimInput)).rejects.toMatchObject({
      message: 'Utilizador não encontrado',
      statusCode: 404,
    });
  });

  it('deve lançar erro 409 se o utilizador já resgatou esse jogo', async () => {
    mockedPrismaUser.findUnique.mockResolvedValueOnce(fakeUser as never);
    mockedPrismaClaim.findFirst.mockResolvedValueOnce(fakeClaim as never);

    await expect(createClaim(claimInput)).rejects.toMatchObject({
      message: 'Este jogo já foi resgatado por este utilizador',
      statusCode: 409,
    });
  });

  it('deve criar e retornar o claim quando tudo está correto', async () => {
    mockedPrismaUser.findUnique.mockResolvedValueOnce(fakeUser as never);
    mockedPrismaClaim.findFirst.mockResolvedValueOnce(null);
    mockedPrismaClaim.create.mockResolvedValueOnce(fakeClaim as never);

    const result = await createClaim(claimInput);

    expect(result).toEqual(fakeClaim);
    expect(mockedPrismaClaim.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          gamerPowerItemId: 101,
          title: 'Jogo Grátis da Semana',
          openGiveawayUrl: 'https://www.gamerpower.com/open/101',
        }),
      }),
    );
  });

  it('deve fazer trim no título antes de guardar', async () => {
    mockedPrismaUser.findUnique.mockResolvedValueOnce(fakeUser as never);
    mockedPrismaClaim.findFirst.mockResolvedValueOnce(null);
    mockedPrismaClaim.create.mockResolvedValueOnce(fakeClaim as never);

    await createClaim({ ...claimInput, title: '  Título com espaços  ' });

    expect(mockedPrismaClaim.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: 'Título com espaços' }),
      }),
    );
  });

  it('não deve incluir openGiveawayUrl quando for string vazia', async () => {
    mockedPrismaUser.findUnique.mockResolvedValueOnce(fakeUser as never);
    mockedPrismaClaim.findFirst.mockResolvedValueOnce(null);
    mockedPrismaClaim.create.mockResolvedValueOnce({ ...fakeClaim, openGiveawayUrl: null } as never);

    await createClaim({ ...claimInput, openGiveawayUrl: '' });

    expect(mockedPrismaClaim.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ openGiveawayUrl: expect.anything() }),
      }),
    );
  });
});

// ──────────────────────────────────────────────
// getClaimsByUserId
// ──────────────────────────────────────────────
describe('claims.service — getClaimsByUserId', () => {
  it('deve retornar null se o utilizador não existir', async () => {
    mockedPrismaUser.findUnique.mockResolvedValueOnce(null);

    const result = await getClaimsByUserId('id_invalido');

    expect(result).toBeNull();
  });

  it('deve retornar a lista de claims do utilizador ordenada pela data', async () => {
    mockedPrismaUser.findUnique.mockResolvedValueOnce(fakeUser as never);
    mockedPrismaClaim.findMany.mockResolvedValueOnce([fakeClaim] as never);

    const result = await getClaimsByUserId('user-1');

    expect(result).toEqual([fakeClaim]);
    expect(mockedPrismaClaim.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        orderBy: { claimedAt: 'desc' },
      }),
    );
  });

  it('deve retornar lista vazia se o utilizador não tiver claims', async () => {
    mockedPrismaUser.findUnique.mockResolvedValueOnce(fakeUser as never);
    mockedPrismaClaim.findMany.mockResolvedValueOnce([] as never);

    const result = await getClaimsByUserId('user-1');

    expect(result).toEqual([]);
  });
});
