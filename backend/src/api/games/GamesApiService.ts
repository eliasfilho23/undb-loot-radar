import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Game } from '@/schemas';

const GAMERPOWER_API  = 'https://www.gamerpower.com/api/giveaways';
const CACHE_TTL_MS    = 5 * 60 * 1000;
const REQUEST_TIMEOUT = 60_000;

interface GamerPowerRawItem {
  id: number;
  title?: string;
  thumbnail?: string;
  description?: string;
  platforms?: string;
  type?: string;
  open_giveaway_url?: string;
  [key: string]: unknown;
}

@Injectable()
export class GamesApiService {
  private cache: { data: Game[]; key: string; expiresAt: number } | null = null;

  async list(platform?: string, type?: string): Promise<Game[]> {
    const cacheKey = `${platform ?? ''}|${type ?? ''}`;

    if (this.cache && this.cache.key === cacheKey && Date.now() < this.cache.expiresAt) {
      return this.cache.data;
    }

    const url    = new URL(GAMERPOWER_API);
    if (platform) url.searchParams.set('platform', platform);
    if (type)     url.searchParams.set('type', type);

    let data: GamerPowerRawItem[];
    try {
      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });
      if (!res.ok) throw new Error(`GamerPower respondeu ${res.status}`);
      data = await res.json() as GamerPowerRawItem[];
    } catch (err) {
      throw new ServiceUnavailableException(
        err instanceof Error ? err.message : 'Erro ao contactar GamerPower API',
      );
    }

    if (!Array.isArray(data)) {
      throw new ServiceUnavailableException('Resposta inválida da GamerPower API');
    }

    const result: Game[] = data.map((item) => ({
      id               : item.id,
      title            : item.title ?? '',
      thumbnail        : item.thumbnail ?? '',
      description      : item.description ?? '',
      platform         : item.platforms ?? '',
      type             : item.type ?? 'Game',
      open_giveaway_url: item.open_giveaway_url ?? '',
    }));

    this.cache = { data: result, key: cacheKey, expiresAt: Date.now() + CACHE_TTL_MS };
    return result;
  }
}
