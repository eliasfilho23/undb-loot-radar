import type { INestApplication } from '@nestjs/common';

// Module singleton — shared between globalSetup and globalTeardown (same process)
export let app: INestApplication | undefined;

export function setApp(a: INestApplication): void {
  app = a;
}
