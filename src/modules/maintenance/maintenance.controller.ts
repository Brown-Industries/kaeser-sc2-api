import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceQueryAllDTO } from './dto/maintenance.query.all.dto';

@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  getData(@Query() queryDto?: MaintenanceQueryAllDTO) {
    return this.maintenanceService.getData(queryDto);
  }
  @Get('temp')
  temp(@Query() queryDto?: MaintenanceQueryAllDTO) {
    return this.maintenanceService.getMaintenceTimers();
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

  @Get('messages')
  getMessages() {
    return this.maintenanceService.getMessages();
  }

  @Get('quick-status')
  getQuickStatus() {
    return this.maintenanceService.getQuickStatus();
  }
}
