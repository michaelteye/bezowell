
import { RequestContext } from '@medibloc/nestjs-request-context';
import { ExecutionContext } from '@nestjs/common';


// AsyncLocalStorage version
export function getAppContextALS<T>(): T {
  return RequestContext.get<T>();
}

// NestJS context version
export function getAppContext<T>(ex: ExecutionContext): T {
  if (ex.getType) {
    if (ex.getType() === 'http') {
      const httpContext = ex.switchToHttp();
      const req = httpContext.getRequest();
      req._ctx = req._ctx || {};
      return req._ctx;
    }
  }
  // Handle other types
  const anyEx = ex as any;
  if (anyEx.req && anyEx.req._ctx) {
    return anyEx.req._ctx;
  }
  if (anyEx._ctx) {
    return anyEx._ctx;
  }

  return null;
}
