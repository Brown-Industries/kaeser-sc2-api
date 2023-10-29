import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';

@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

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

  @Get('leds')
  getLeds() {
    return this.maintenanceService.getLeds();
  }
}
