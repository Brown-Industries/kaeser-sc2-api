import { classes } from '@ttshivers/automapper-classes';
import { AutomapperModule } from '@ttshivers/automapper-nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './core/task/task.module';
import { MqttModule } from './core/mqtt/mqtt.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { WarmupService } from './warmup.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config/kaeser_sc2.env',
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
    ScheduleModule.forRoot(),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    TaskModule,
    MaintenanceModule,
    MqttModule,
  ],
  controllers: [AppController],
  providers: [AppService, WarmupService],
})
export class AppModule {}
