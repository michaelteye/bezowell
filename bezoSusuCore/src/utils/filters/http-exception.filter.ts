import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    if (exception.name === 'BadRequestException') {
      const message = {};

      (exception.getResponse() as { message: string[] }).message.forEach(
        (item) => {
          const key = item.split(' ')[0];
          message[key] = item;
        },
      );

      return response.status(status).send({
        status: 'error',
        message,
      });
    }

    return response.status(status).send(exception.getResponse());
  }
}
