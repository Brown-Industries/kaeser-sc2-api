import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { QuickStatusDto } from './dto/quick-status.core.dto';
import { MaintenanceQueryAllDTO } from './dto/maintenance.query.all.dto';
import { MaintenanceTimerDto } from './dto/maintenance-timers.dto';
import { EnumMethods } from '../shared/enum/EnumMethods';
import { CompressorData } from '../shared/enum/CompressorData';
import { OperatingHoursDto } from './dto/operating-hours.dto';
import { IOMDto } from './dto/io-module.dto';
import { MessagesDto } from './dto/messages.dto';
import { OperationalDto } from './dto/operational.dto';

@Injectable()
export class MaintenanceService {
  constructor(private readonly httpService: HttpService) {}

  private DATA_PATH = '/json.json';

  async getData(queryDto?: MaintenanceQueryAllDTO) {
    const result = {};

    if (queryDto.data) {
      let data = Array.isArray(queryDto.data) ? queryDto.data : [queryDto.data];

      data = data.map((r) => EnumMethods.getValueByKey(CompressorData, r));

      if (data.includes(CompressorData.Operational)) {
        const d = (await this.getOperational()).toObj();
        result['operational'] = d;
      }
      if (data.includes(CompressorData.IO_Module)) {
        const d = (await this.getIO()).toObj();
        result['iom'] = d;
      }
      if (data.includes(CompressorData.Messages)) {
        const d = (await this.getMessages()).toObj();
        result['messages'] = d;
      }
      if (data.includes(CompressorData.Maintenance)) {
        const d = (await this.getMaintenanceTimers()).toObj();
        result['maintence'] = d;
      }
      if (data.includes(CompressorData.OperatingHours)) {
        const d = (await this.getOperatingHours()).toObj();
        result['operatingHours'] = d;
      }
    }

    return result;
  }

  async sessionLogout() {
    const payload = {
      0: 8,
      1: 1,
    };
    const response$ = await this.httpService.post(this.DATA_PATH, payload);
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getVersion() {
    try {
      const payload = {
        0: 1,
        1: 7,
      };
      const response$ = await this.httpService.post(this.DATA_PATH, payload);
      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async getOperational(): Promise<OperationalDto> {
    const payload = {
      '0': 1,
      '1': 2,
      '2': {
        '0': [
          4049696, 3231568, 4082904, 4057536, 3233600, 3236248, 3240368,
          3200672, 3200752,
        ],
      },
    };

    const response$ = await this.httpService.post(this.DATA_PATH, payload);
    const response = await firstValueFrom(response$);

    const dto = new OperationalDto(response.data);
    return dto;
  }

  async getGeneral() {
    const payload = {
      '0': 1,
      '1': 2,
      '2': {
        '0': [
          3163824, 3163904, 3163984, 4082904, 4057536, 4049696, 4032840,
          4020920, 4000568, 3981032, 3972704,
        ],
      },
    };

    const response$ = await this.httpService.post(this.DATA_PATH, payload);
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getMaintenanceTimers(): Promise<MaintenanceTimerDto> {
    const payload = {
      '0': 1,
      '1': 2,
      '2': {
        '0': [
          3273872, 3274104, 3274184, 3274264, 3274896, 3275128, 3275208,
          3275288, 3275920, 3276152, 3276232, 3276312, 3276944, 3277176,
          3277256, 3277336, 3277968, 3278200, 3278280, 3278360, 3278992,
          3279224, 3279304, 3279384, 3279784, 3280016, 3280248, 3280480,
          3280560, 3280640, 3281040, 3281272, 3281352, 3281432, 3282064,
          3283088, 3283320, 3283400, 3283480, 3284112, 3284344, 3284424,
          3284504, 3285136, 3285368,
        ],
      },
    };

    const response$ = await this.httpService.post(this.DATA_PATH, payload);
    const response = await firstValueFrom(response$);

    const dto = new MaintenanceTimerDto(response.data);
    return dto;
  }

  async getIO(): Promise<IOMDto> {
    const payload = {
      '0': 'datarecorder',
      '1': 10,
      '2': {},
    };

    const response$ = await this.httpService.post(this.DATA_PATH, payload);
    const response = await firstValueFrom(response$);

    const dto = new IOMDto(response.data);
    return dto;
  }

  async getOperatingHours(): Promise<OperatingHoursDto> {
    const payload = {
      '0': 1,
      '1': 2,
      '2': {
        '0': [3261336, 3261648, 3261960, 3262272, 3262584],
      },
    };

    const response$ = await this.httpService.post(this.DATA_PATH, payload);
    const response = await firstValueFrom(response$);

    const dto = new OperatingHoursDto(response.data);
    return dto;
  }

  async getMessages(): Promise<MessagesDto> {
    const payload = {
      '0': 3,
      '1': 1,
      '2': {
        '0': 0,
        '1': 0,
        '2': 101,
      },
    };

    const response$ = await this.httpService.post(this.DATA_PATH, payload);
    const response = await firstValueFrom(response$);

    const dto = new MessagesDto(response.data);
    return dto;
  }

  async getLedData() {
    const payload = {
      0: 1,
      1: 4,
    };
    const response$ = await this.httpService.post(this.DATA_PATH, payload);
    const response = await firstValueFrom(response$);
    const dto = new QuickStatusDto(response.data);
    return dto;
  }
}
