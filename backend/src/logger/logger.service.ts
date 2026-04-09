/* eslint-disable */
import { Injectable, LogLevel } from '@nestjs/common';
import { ConsoleLogger } from '@nestjs/common';
import { ClsService } from '@/cls';

const ALL_LOG_LEVELS: LogLevel[] = [ 'log', 'warn', 'error', 'fatal', 'debug', 'verbose' ];

@Injectable()
export class LoggerService extends ConsoleLogger {
  private json: boolean;
  private resourceName?: string;

  constructor(
    resourceName: string,
    private readonly cls: ClsService,
  ) {
    const json      = process.env.LOG_JSON === 'true';
    const envLevels = process.env.LOG_LEVELS?.split(',').map(l => l.trim()) ?? [];
    const logLevels = (
      envLevels.length > 0
        ? envLevels.filter((l): l is LogLevel => ALL_LOG_LEVELS.includes(l as LogLevel))
        : process.env.NODE_ENV === 'production'
          ? [ 'log', 'warn', 'error', 'fatal' ] as LogLevel[]
          : ALL_LOG_LEVELS
    );

    super(resourceName, { logLevels });
    this.json         = json;
    this.resourceName = resourceName;
  }

  log(message: any, ...optionalParams: any[]) {
    if (this.json) { this.logJson('log', message, ...optionalParams); return; }
    super.log(message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    if (this.json) { this.logJson('fatal', message, ...optionalParams); return; }
    super.fatal(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    if (this.json) { this.logJson('error', message, ...optionalParams); return; }
    const [ first, ...rest ] = optionalParams;
    if (first instanceof Error) {
      super.error(message, this.formatErrorStack(first), ...rest);
    } else {
      super.error(message, ...optionalParams);
    }
  }

  private formatErrorStack(err: Error): string {
    let out = err.stack ?? err.message;
    if (err.cause instanceof Error) {
      out += `\nCaused by: ${this.formatErrorStack(err.cause)}`;

    } else if (err.cause != null) {
      out += `\nCaused by: ${String(err.cause)}`;
    }
    return out;
  }

  warn(message: any, ...optionalParams: any[]) {
    if (this.json) { this.logJson('warn', message, ...optionalParams); return; }
    super.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    if (this.json) { this.logJson('debug', message, ...optionalParams); return; }
    super.debug(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    if (this.json) { this.logJson('verbose', message, ...optionalParams); return; }
    super.verbose(message, ...optionalParams);
  }

  private logJson(level: string, message: any, ...optionalParams: any[]) {
    const { appContext, params } = this.getAppContextAndParams(optionalParams);
    const payload   = this.serialize(params[0]);
    const requestId = this.cls.getRequestId();
    const userId    = this.cls.getUserId();
    const timestamp = Date.now();
    console.log(JSON.stringify({ timestamp, level, message, payload, context: appContext, requestId, userId }));
  }

  private serialize(value: any): any {
    if (value === undefined || value === null) return undefined;
    if (value instanceof Error) {
      return {
        name   : value.name,
        message: value.message,
        stack  : value.stack,
        ...(value.cause != null ? { cause: this.serialize(value.cause) } : {}),
        ...Object.fromEntries(
          Object.entries(value as any).filter(([ k, v ]) => v !== undefined && k !== 'cause'),
        ),
      };
    }
    if (typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([ k, v ]) => [ k, this.serialize(v) ]),
      );
    }
    return value;
  }

  private getAppContextAndParams(optionalParams: any[]) {
    const appContext = this.resourceName || optionalParams[optionalParams.length - 1];
    const params     = this.resourceName
      ? optionalParams
      : optionalParams.slice(0, optionalParams.length - 1);
    return { appContext, params };
  }
}
