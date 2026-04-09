import { Injectable } from '@nestjs/common';
import { ClsService as ClsServiceNest } from 'nestjs-cls';

const REQUEST_ID_KEY = 'cls.requestId';
const USER_ID_KEY    = 'cls.userId';

@Injectable()
export class ClsService {
  constructor(private readonly clsNest: ClsServiceNest) {}

  setRequestId(requestId: string) {
    this.clsNest.set(REQUEST_ID_KEY, requestId);
  }

  getRequestId(): string | undefined {
    return this.clsNest.get(REQUEST_ID_KEY);
  }

  setUserId(userId: string) {
    this.clsNest.set(USER_ID_KEY, userId);
  }

  getUserId(): string | undefined {
    return this.clsNest.get(USER_ID_KEY);
  }
}
