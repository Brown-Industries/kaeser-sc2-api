import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthRefreshInterceptor } from 'src/core/axios-interceptor/auth-refresh.axios-interceptor';
import { JobbossConnectController } from './jobboss-connect.controller';
import { JobbossConnectService } from './jobboss-connect.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config/jobboss_matrix.env',
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      baseURL: process.env.JOBBOSS_API_URL,
    }),
    //   ClientsModule.register([
    //     {
    //       name: 'MQTT_SERVICE',
    //       transport: Transport.MQTT,
    //       options: {
    // host: '10.10.30.17',
    // port: 1883,
    // username: 'jobboss',
    // password: 'uMJT@XR0Z8@XUCgnYJo^VU4*',
    //       },
    //     },
    //   ]),
  ],
  controllers: [JobbossConnectController],
  providers: [
    JobbossConnectService,
    AuthRefreshInterceptor,
    {
      provide: 'CONFIG_VALUES',
      useValue: {
        AUTH0_ISSUER_URL: process.env.JOBBOSS_AUTH0_ISSUER_URL,
        AUTH0_AUDIENCE: process.env.JOBBOSS_AUTH0_AUDIENCE,
        AUTH0_CLIENT_ID: process.env.JOBBOSS_AUTH0_CLIENT_ID,
        AUTH0_CLIENT_SECRET: process.env.JOBBOSS_AUTH0_CLIENT_SECRET,
      },
    },
  ],
  exports: [JobbossConnectService],
})
export class JobbossConnectModule {}
