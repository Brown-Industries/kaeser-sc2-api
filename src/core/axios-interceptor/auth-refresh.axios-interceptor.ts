// auth-refresh.interceptor.ts
import {
  AxiosFulfilledInterceptor,
  AxiosInterceptor,
  AxiosRejectedInterceptor,
} from '@narando/nest-axios-interceptor';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InternalAxiosRequestConfig } from 'axios';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class AuthRefreshInterceptor extends AxiosInterceptor {
  private AUTH0_ISSUER_URL = '';
  private AUTH0_AUDIENCE = '';
  private AUTH0_CLIENT_ID = '';
  private AUTH0_CLIENT_SECRET = '';

  private authTokenFilePath = join(
    __dirname,
    '..',
    '..',
    '..',
    'config',
    'auth.txt',
  );
  private authToken: string;

  constructor(
    httpService: HttpService,
    @Inject('CONFIG_VALUES') private configValues: any,
  ) {
    super(httpService);
    this.loadTokenFromFile();

    this.AUTH0_ISSUER_URL = configValues.AUTH0_ISSUER_URL;
    this.AUTH0_AUDIENCE = configValues.AUTH0_AUDIENCE;
    this.AUTH0_CLIENT_ID = configValues.AUTH0_CLIENT_ID;
    this.AUTH0_CLIENT_SECRET = configValues.AUTH0_CLIENT_SECRET;
  }

  private async loadTokenFromFile(): Promise<void> {
    try {
      this.authToken = await fs.readFile(this.authTokenFilePath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File does not exist
        console.warn('auth.txt does not exist. Creating a new one...');
        await fs.writeFile(this.authTokenFilePath, '', 'utf8');
      } else {
        console.error('Error reading auth token from file:', error);
      }
    }
  }

  private async saveTokenToFile(): Promise<void> {
    try {
      await fs.writeFile(this.authTokenFilePath, this.authToken, 'utf8');
    } catch (error) {
      console.error('Error writing auth token to file:', error);
    }
  }

  private isUnauthorizedError(error: any): boolean {
    return error.response && error.response.status === 401;
  }

  async refreshToken(): Promise<void> {
    const jwtOptions = {
      method: 'POST',
      url: this.AUTH0_ISSUER_URL + '/oauth/token',
      headers: { 'content-type': 'application/json' },
      data: {
        client_id: this.AUTH0_CLIENT_ID,
        client_secret: this.AUTH0_CLIENT_SECRET,
        audience: this.AUTH0_AUDIENCE,
        grant_type: 'client_credentials',
      },
    };

    const tokenRefreshResponse = await this.httpService
      .post(jwtOptions.url, jwtOptions.data, { headers: jwtOptions.headers })
      .toPromise();
    this.authToken = tokenRefreshResponse.data.access_token;
    await this.saveTokenToFile(); // save token to file after refreshing
  }

  requestFulfilled(): AxiosFulfilledInterceptor<InternalAxiosRequestConfig> {
    return (config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    };
  }

  private lastUnauthorizedAttempt = 0;
  private consecutiveUnauthorizedAttempts = 0;
  private unauthorizedRetryLimitDuration = 5000; // 5 seconds, adjust as needed
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  responseRejected(): AxiosRejectedInterceptor {
    return async (error) => {
      if (this.isUnauthorizedError(error)) {
        try {
          const now = Date.now();
          if (this.consecutiveUnauthorizedAttempts >= 5) {
            this.consecutiveUnauthorizedAttempts = 0;
            return;
          }
          if (
            now - this.lastUnauthorizedAttempt <
            this.unauthorizedRetryLimitDuration
          ) {
            this.lastUnauthorizedAttempt = now;
            await this.delay(this.unauthorizedRetryLimitDuration);
            this.consecutiveUnauthorizedAttempts++;
          } else {
            this.consecutiveUnauthorizedAttempts = 0;
          }
          await this.refreshToken();
          return this.httpService.request(error.config).toPromise();
        } catch (err) {
          throw new UnauthorizedException();
        }
      }
      throw error;
    };
  }
}
