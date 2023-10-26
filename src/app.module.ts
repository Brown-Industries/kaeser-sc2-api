import { classes } from '@ttshivers/automapper-classes';
import { AutomapperModule } from '@ttshivers/automapper-nestjs';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthzModule } from './core/authz/authz.module';
import { TaskModule } from './core/task/task.module';
import { MatrixConnectModule } from './modules/matrix-connect/matrix-connect.module';
import { JobbossConnectModule } from './modules/jobboss-connect/jobboss-connect.module';
import { BPMModule } from './modules/bpm/bpm.module';
import { MqttModule } from './core/mqtt/mqtt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config/jobboss_matrix.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    AuthzModule,
    TaskModule,
    MatrixConnectModule,
    JobbossConnectModule,
    MqttModule,
    BPMModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
