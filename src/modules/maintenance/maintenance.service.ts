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

  async getMessages() {
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
    return response.data;
  }

  async getLeds() {
    const payload = {
      0: 1,
      1: 4,
    };
    const response$ = await this.httpService.post(this.DATA_PATH, payload);
    const response = await firstValueFrom(response$);
    return response.data;
  }
}
