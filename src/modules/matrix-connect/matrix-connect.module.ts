import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthRefreshInterceptor } from 'src/core/axios-interceptor/auth-refresh.axios-interceptor';
import { MatrixConnectController } from './matrix-connect.controller';
import { MatrixConnectService } from './matrix-connect.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config/jobboss_matrix.env',
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      baseURL: process.env.MATRIX_API_URL,
    }),
  ],
  controllers: [MatrixConnectController],
  providers: [
    MatrixConnectService,
    AuthRefreshInterceptor,
    {
      provide: 'CONFIG_VALUES',
      useValue: {
        AUTH0_ISSUER_URL: process.env.MATRIX_AUTH0_ISSUER_URL,
        AUTH0_AUDIENCE: process.env.MATRIX_AUTH0_AUDIENCE,
        AUTH0_CLIENT_ID: process.env.MATRIX_AUTH0_CLIENT_ID,
        AUTH0_CLIENT_SECRET: process.env.MATRIX_AUTH0_CLIENT_SECRET,
      },
    },
  ],
  exports: [MatrixConnectService],
})
export class MatrixConnectModule {}
