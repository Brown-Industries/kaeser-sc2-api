import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Version')
@Controller('version')
export class VersionController {
  @Get()
  findCurrent() {
    return 'this.versionService.findCurrent();';
  }

  @Get('all')
  findAll() {
    return 'this.versionService.findAll();';
  }
}
