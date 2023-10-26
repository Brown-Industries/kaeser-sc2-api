import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JobbossConnectService } from './jobboss-connect.service';

@ApiTags('JobBOSS-Connect')
@Controller('jobboss-connect')
export class JobbossConnectController {
  constructor(private readonly jobbossConnectService: JobbossConnectService) {}

  @Get()
  healthCheck() {
    return this.jobbossConnectService.healthCheck();
  }
}
