import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import * as http from 'http';
import { Logger } from 'nestjs-pino';

@Injectable()
export class WarmupService implements OnModuleInit {
  constructor(private readonly logger: Logger) {}

  async onModuleInit() {
    await this.waitForDownstreamServer();
    this.logger.log('Compressor is available. Continuing application startup.');
    // Other startup logic goes here
  }

  private async waitForDownstreamServer(): Promise<void> {
    let isServerAvailable = false;

    while (!isServerAvailable) {
      try {
        await this.pingDownstreamServer();
        isServerAvailable = true;
      } catch (error) {
        this.logger.error(
          'Compressor is not available. Retrying in 10 seconds.',
        );
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
  }

  private pingDownstreamServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: process.env.KAESER_ADDRESS.split('://')[1],
        port: 80, // or 443 for HTTPS
        path: '/login.html',
        method: 'GET',
      };

      const req = http.request(requestOptions, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error('Downstream server returned non-200 status code'));
        }
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }
}
