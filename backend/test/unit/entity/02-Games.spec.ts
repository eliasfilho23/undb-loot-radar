import { ServiceUnavailableException } from '@nestjs/common';
import { GamesApiService } from '@/api/games/GamesApiService';

const RAW_GAMES = [
  {
    id              : 1,
    title           : 'Jogo Gratuito A',
    thumbnail       : 'https://img.com/a.jpg',
    description     : 'Descrição A',
    platforms       : 'PC',
    type            : 'Game',
    open_giveaway_url: 'https://giveaway.com/1',
  },
  {
    id              : 2,
    title           : 'Jogo Gratuito B',
    thumbnail       : 'https://img.com/b.jpg',
    description     : 'Descrição B',
    platforms       : 'Steam',
    type            : 'DLC',
    open_giveaway_url: 'https://giveaway.com/2',
  },
];

function mockFetchOk(body: unknown) {
  return jest.fn().mockResolvedValue({
    ok  : true,
    json: jest.fn().mockResolvedValue(body),
  });
}

function mockFetchNotOk(status: number) {
  return jest.fn().mockResolvedValue({ ok: false, status });
}

function mockFetchNetworkError() {
  return jest.fn().mockRejectedValue(new Error('Network error'));
}

describe('GamesApiService', () => {
  let service: GamesApiService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    service  = new GamesApiService();
    fetchSpy = jest.spyOn(global, 'fetch' as any);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  // ─── list() ────────────────────────────────────────────────────────────────

  describe('list()', () => {
    it('retorna jogos mapeados da GamerPower API', async () => {
      fetchSpy.mockImplementation(mockFetchOk(RAW_GAMES));

      const result = await service.list();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id               : 1,
        title            : 'Jogo Gratuito A',
        thumbnail        : 'https://img.com/a.jpg',
        description      : 'Descrição A',
        platform         : 'PC',
        type             : 'Game',
        open_giveaway_url: 'https://giveaway.com/1',
      });
    });

    it('usa string vazia como fallback para campos ausentes na resposta', async () => {
      fetchSpy.mockImplementation(mockFetchOk([ { id: 99 } ]));

      const result = await service.list();

      expect(result[0]).toMatchObject({
        id         : 99,
        title      : '',
        thumbnail  : '',
        description: '',
        platform   : '',
        type       : 'Game',
      });
    });

    it('passa os query params platform e type para a URL da API', async () => {
      fetchSpy.mockImplementation(mockFetchOk([]));

      await service.list('PC', 'Game');

      const calledUrl = String(fetchSpy.mock.calls[0][0]);
      expect(calledUrl).toContain('platform=PC');
      expect(calledUrl).toContain('type=Game');
    });

    it('lança ServiceUnavailableException quando a API retorna status de erro', async () => {
      fetchSpy.mockImplementation(mockFetchNotOk(503));

      await expect(service.list()).rejects.toThrow(ServiceUnavailableException);
    });

    it('lança ServiceUnavailableException quando ocorre erro de rede', async () => {
      fetchSpy.mockImplementation(mockFetchNetworkError());

      await expect(service.list()).rejects.toThrow(ServiceUnavailableException);
    });

    it('lança ServiceUnavailableException quando a resposta não é um array', async () => {
      fetchSpy.mockImplementation(mockFetchOk({ status: 0, status_message: 'No giveaways' }));

      await expect(service.list()).rejects.toThrow(ServiceUnavailableException);
    });

    it('retorna do cache em chamadas consecutivas com os mesmos parâmetros', async () => {
      fetchSpy.mockImplementation(mockFetchOk(RAW_GAMES));

      await service.list('PC');
      await service.list('PC');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('ignora o cache e chama a API quando os parâmetros mudam', async () => {
      fetchSpy.mockImplementation(mockFetchOk(RAW_GAMES));

      await service.list('PC');
      await service.list('Steam');

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('ignora o cache e chama a API quando os parâmetros mudam (type)', async () => {
      fetchSpy.mockImplementation(mockFetchOk(RAW_GAMES));

      await service.list(undefined, 'Game');
      await service.list(undefined, 'DLC');

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
