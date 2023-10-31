import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceQueryAllDTO } from './dto/maintenance.query.all.dto';

@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  async getData(@Query() queryDto?: MaintenanceQueryAllDTO) {
    const res = await this.maintenanceService.getData(queryDto);
    return res;
  }

  @Get('logout')
  sessionLogout() {
    return this.maintenanceService.sessionLogout();
  }

  @Get('version')
  getVersion() {
    return this.maintenanceService.getVersion();
  }

  @Get('general')
  getGeneral() {
    return this.maintenanceService.getGeneral();
  }

  @Get('maintenance-timers')
  async getMaintenanceTimers() {
    return (await this.maintenanceService.getMaintenanceTimers()).toObj();
  }

  @Get('messages')
  async getMessages() {
    return (await this.maintenanceService.getMessages()).toObj();
  }

  @Get('led-data')
  getQuickStatus() {
    return this.maintenanceService.getLedData();
  }
}
