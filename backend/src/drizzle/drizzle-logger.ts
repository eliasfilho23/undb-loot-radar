/* eslint-disable no-console */
import { Logger } from 'drizzle-orm/logger';

export class DrizzleLogger implements Logger {
  logQuery(query: string, params: any[]) {
    if (query.toLowerCase() === 'begin') {
      console.log('\x1b[35m%s\x1b[0m', 'BEGIN TRANSACTION ---------------------------------------------->');
      return;
    }
    if (query.toLowerCase() === 'commit') {
      console.log('\x1b[35m%s\x1b[0m', '<--------------------------------------------- COMMIT TRANSACTION');
      return;
    }
    if (query.toLowerCase() === 'rollback') {
      console.log('\x1b[35m%s\x1b[0m', '<------------------------------------------- ROLLBACK TRANSACTION');
      return;
    }
    let queryWithParams = query;
    let i = 1;
    for (const param of params) {
      let queryParam = `'${param}'`;
      if (typeof param === 'number') queryParam = param.toString();
      if (typeof param === 'boolean') queryParam = param.toString();
      queryWithParams = queryWithParams.replace(`$${i}`, queryParam);
      i++;
    }
    console.log('\x1b[35m%s\x1b[0m', `${queryWithParams};`);
  }
}
