import { Inject, Injectable, Logger } from '@nestjs/common';
import { GlobalConfig, globalConfig } from 'src/config';
import * as referralCodes from 'referral-codes';
import {
  AxiosRequestHeaders,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosError,
} from 'axios';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class HttpRequestService {
  logger = new Logger(HttpRequestService.name);
  @Inject(globalConfig.KEY) cfg: GlobalConfig;
  @Inject() http: HttpService;
  private _response: any;
  private _error: any;
  protected length: number;

  constructor() {
    this.length = 10;
  }

  get config(): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      headers: this.headers as AxiosRequestHeaders,
    };
    return config;
  }

  get headers(): AxiosRequestHeaders {
    const headers: AxiosRequestHeaders = {
      'x-api-key': this.cfg.payment.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    return headers;
  }

  get url(): string {
    return this.cfg.payment.url;
  }

  get response() {
    return this._response;
  }

  get error() {
    return this._error;
  }

  async post(url: string, data: any) {
    this.logger.debug(`POST ${url} ${JSON.stringify(data)}`);
    this.logger.debug(`Config Data ${JSON.stringify(this.config)}`);
    const response$ = this.http.post(url, data, this.config).pipe(
      map((response: AxiosResponse) => {
        return (this._response = response.data);
      }),
    );

    this._response = await firstValueFrom(response$).catch(
      (error: AxiosError) => {
        if (error) {
          return {
            ResponseCode: error.response?.status,
            Message: error.response?.statusText,
            Errors: error.response?.data,
          };
        }
      },
    );
  }

  async get(url: string, allowConfig = true) {
    const response$ = this.http.get(url, allowConfig ? this.config : null).pipe(
      map((response: AxiosResponse) => {
        // console.log('response', response);
        return (this._response = response.data);
      }),
    );

    this._response = await firstValueFrom(response$).catch(
      (error: AxiosError) => error.response?.data,
    );
  }

  get reference(): string {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < this.length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result.trim();
  }

  generateCode(length: number): string {
    return referralCodes.generate({
      length,
      count: 1,
      charset: '0123456789',
    })[0];
  }
}
