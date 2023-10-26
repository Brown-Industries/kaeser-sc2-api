import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JobbossConnectService {
  constructor(private readonly httpService: HttpService) {}

  async healthCheck() {
    const response$ = await this.httpService.get('/version');
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getDataCollectionById(id: string) {
    const response$ = await this.httpService.get(
      '/data-collection/' + id + '?relations=JobDetail',
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getOpenDataCollection() {
    const response$ = await this.httpService.get(
      '/data-collection?status=OPEN&type=OPERATION_START&relations=JobDetail',
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getActiveJobs() {
    const response$ = await this.httpService.get('/job?jobStatus=Active');
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getAllJobs() {
    const response$ = await this.httpService.get('/job');
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getAllParts() {
    const response$ = await this.httpService.get('/part');
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async createOrUpdateJobMaterialCost(
    jobId: string,
    toolCost: number,
    notes: string,
  ) {
    const materialReq = {
      jobId: jobId,
      type: 'Miscellaneous',
      materialId: 'MATRIX',
      description: 'TOOLING USED',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Closed',
      quantityPerBasis: 'MaterialPerPart',
      quantityPer: 0,
      estQty: 0,
      estUnitCost: toolCost,
      actQty: 1,
      actUnitCost: toolCost,
      pickBuyIndicator: 'Pick',
      uofM: 'each',
      noteText: notes,
    };

    const response$ = await this.httpService.put(
      '/material-requirement',
      materialReq,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }
}
