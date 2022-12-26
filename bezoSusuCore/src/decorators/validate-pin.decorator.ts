import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// export const ValidatePin = (ctx?: ExecutionContext): MethodDecorator => {
//   //   const request = ctx.switchToHttp().getRequest();
//   //   console.log('decorator', request);
//   //   if (!request.verificationId) throw new Error('Pin Verification Id not found');
//   //   return request;
// };

export const ValidatePin = createParamDecorator(
  (data?: unknown, ctx?: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log('decorator', request);
    return request;
  },
);
