import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MaintenanceService {
  constructor(private readonly httpService: HttpService) {}

  private DATA_PATH = '/json.json';

  async getVersion() {
    const payload = {
      0: 1,
      1: 7,
    };
    const response$ = await this.httpService.post(this.DATA_PATH, payload);
    const response = await firstValueFrom(response$);
    return response.data;
  }
}
