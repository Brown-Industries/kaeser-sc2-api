import {
  AxiosFulfilledInterceptor,
  AxiosInterceptor,
} from '@narando/nest-axios-interceptor';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InternalAxiosRequestConfig } from 'axios';

// logging.axios-interceptor.ts
@Injectable()
export class LoggingAxiosInterceptor extends AxiosInterceptor {
  constructor(httpService: HttpService) {
    super(httpService);
  }

  requestFulfilled(): AxiosFulfilledInterceptor<InternalAxiosRequestConfig> {
    return (config) => {
      // Log outgoing request
      console.log(`Request: ${config.method} ${config.url}`);

      return config;
    };
  }

  // requestRejected(): AxiosRejectedInterceptor {}
  // responseFulfilled(): AxiosFulfilledInterceptor<AxiosResponse> {}
  // responseRejected(): AxiosRejectedInterceptor {}
}
