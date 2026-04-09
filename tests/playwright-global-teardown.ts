import { app } from './app-instance';

export default async function globalTeardown() {
  if (app) await app.close();
}
