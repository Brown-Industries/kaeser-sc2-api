import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthRefreshInterceptor } from 'src/core/axios-interceptor/auth-refresh.axios-interceptor';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config/kaeser_sc2.env',
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      baseURL: process.env.KAESER_ADDRESS,
    }),
  ],
  controllers: [MaintenanceController],
  providers: [
    MaintenanceService,
    AuthRefreshInterceptor,
    {
      provide: 'CONFIG_VALUES',
      useValue: {
        COMP_ADDRESS: process.env.KAESER_ADDRESS,
        COMP_USERNAME: process.env.KAESER_USERNAME,
        COMP_PASSWORD: process.env.KAESER_PASSWORD,
      },
    },
  ],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
