import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MatrixConnectService {
  constructor(private readonly httpService: HttpService) {}

  private API_USER_ID;

  onModuleInit() {
    this.API_USER_ID = parseInt(process.env.MATRIX_API_USERID);
  }

  public getApiUserId() {
    return this.API_USER_ID;
  }

  async healthCheck() {
    const response$ = await this.httpService.get('');
    const response = await firstValueFrom(response$);
    return response.data;
  }

  private toLocalISOString(date) {
    const off = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - off * 60 * 1000);
    return (
      adjustedDate.toISOString().slice(0, -1) +
      (off > 0 ? '-' : '+') +
      Math.abs(off / 60)
        .toString()
        .padStart(2, '0') +
      ':' +
      (off % 60).toString().padStart(2, '0')
    );
  }

  async getTransactionSummaryById(id: number) {
    const response$ = await this.httpService.get(`/transaction-summary/${id}`);
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getTransactionSummaryByJobId(id: number) {
    const response$ = await this.httpService.get(
      `/transaction-summary?costCenterType=Job Number&costCenter=${id}`,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getTransactionSummaryByJobPart(customerId: string, partNumber: string) {
    const custPart = this.setJobDescription(customerId, partNumber);
    const encodedStr = encodeURIComponent(custPart);
    const response$ = await this.httpService.get(
      `/transaction-summary?costCenterType=Job Number&costCenterDescription=${encodedStr}`,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getTransactionSummaryByJob(jobId: string) {
    const encodedStr = encodeURIComponent(jobId);
    const response$ = await this.httpService.get(
      `/transaction-summary?costCenterType=Job Number&costCenter=${encodedStr}`,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getCostCenterTransactionsForJob(startDate: Date) {
    const startDateStr = this.toLocalISOString(startDate);
    const response$ = await this.httpService.get(
      `/transaction-cost-center?costCenterType=Job Number&fromDate=${startDateStr}`,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getCostCenterTransactionsForPart(startDate: Date) {
    const startDateStr = this.toLocalISOString(startDate);
    const response$ = await this.httpService.get(
      `/transaction-cost-center?costCenterType=Part Number&fromDate=${startDateStr}`,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async updateCostCenterTransaction(costCenterTransaction: any) {
    try {
      const response$ = await this.httpService.patch(
        '/transaction-cost-center',
        costCenterTransaction,
      );
      const response = await firstValueFrom(response$);
      return response.data;
    } catch (e) {
      // console.log(e)
    }
  }

  async updateCostCenterTransactions(costCenterTransactions: any[]) {
    const response$ = await this.httpService.patch(
      '/transaction-cost-center/bulk',
      costCenterTransactions,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getAllJobCostCenters() {
    const response$ = await this.httpService.get(
      '/cost-center?costCenterType=Job Number',
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async findCostCenterForJob(jobId: string) {
    const encodedStr = encodeURIComponent(jobId);
    const response$ = await this.httpService.get(
      `/cost-center?costCenterType=Job Number&costCenter=${encodedStr}`,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async findCostCenterForPart(customerId: string, part: string) {
    const jobDesc = this.setJobDescription(customerId, part);
    const encodedStr = encodeURIComponent(jobDesc);
    const response$ = await this.httpService.get(
      `/cost-center?costCenterType=Part Number&costCenter=${encodedStr}`,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async findCostCenterItemsForPart(customerId: string, part: string) {
    const jobDesc = this.setJobDescription(customerId, part);
    const encodedStr = encodeURIComponent(jobDesc);
    const response$ = await this.httpService.get(
      `/item-cost-center?costCenterType=Part Number&costCenter=${encodedStr}`,
    );
    try {
      const response = await firstValueFrom(response$);
      return response.data;
    } catch (e) {
      console.log(e);
    }
  }

  async createCostCenterItems(costCenterItems: any[]) {
    const response$ = await this.httpService.post(
      '/item-cost-center/bulk',
      costCenterItems,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async removeCostCenterItems(costCenterItems: any[]) {
    const response$ = await this.httpService.delete('/item-cost-center/bulk', {
      data: costCenterItems,
    });
    const response = await firstValueFrom(response$);
    return response.data;
  }

  async createCostCenter(costCenter: any) {
    try {
      const response$ = await this.httpService.post('/cost-center', costCenter);
      const response = await firstValueFrom(response$);
      return response.data;
    } catch (e) {
      // console.log(e)
    }
  }

  async updateCostCenters(costCenters: any[]) {
    const response$ = await this.httpService.patch(
      '/cost-center/bulk',
      costCenters,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }

  public async createJob(
    jobId: string,
    description: string,
    isActive: boolean = false,
  ) {
    const job = {
      type: 'Job Number',
      costCenter: jobId,
      description: description,
      isActive: isActive,
      isItemLimit: false,
    };
    await this.createCostCenter(job);
  }

  public async createPart(
    customerId: string,
    partNumber: string,
    description: string,
    isActive: boolean = true,
  ) {
    const part = {
      type: 'Part Number',
      costCenter: this.setJobDescription(customerId, partNumber),
      description: description,
      isActive: isActive,
      isItemLimit: true,
    };
    await this.createCostCenter(part);
  }

  async resetCostCenterTransactionDescriptions(date: Date = null) {
    // Subtract 4 hours from the current time to get startDate.
    // const startDate = new Date();
    // startDate.setHours(startDate.getHours() - 4);
    let startDate = date;
    if (!startDate) {
      startDate = new Date();
      startDate.setHours(startDate.getHours() - 4);
    }

    // Fetch JOB transactions
    const jobTransactions =
      await this.getCostCenterTransactionsForJob(startDate);
    // Modify the transactions
    const modifiedJobTransactions = jobTransactions.map((transaction) => {
      // Remove the transactionId and dateCreated fields
      delete transaction.transactionId;
      delete transaction.dateCreated;

      transaction.description = this.cleanJobDescription(
        transaction.description,
      );
      return transaction;
    });

    // Fetch PART transactions
    const partTransactions =
      await this.getCostCenterTransactionsForPart(startDate);
    // Modify the transactions
    const modifiedPartTransactions = partTransactions.map((transaction) => {
      // Remove the transactionId and dateCreated fields
      delete transaction.transactionId;
      delete transaction.dateCreated;

      transaction.description = this.cleanPartDescription(
        transaction.description,
      );
      return transaction;
    });

    const combinedTransactions = [
      ...modifiedJobTransactions,
      ...modifiedPartTransactions,
    ];
    this.updateCostCenterTransactions(combinedTransactions);

    return 'done';
  }

  public cleanPartDescription(description: string) {
    // Modify the description to remove the leading !
    // (and trim whitespace before/after the remaining text).

    // Remove the leading !
    if (description.startsWith('!')) {
      description = description.substring(1);
    }

    // Trim whitespace before and after the remaining text
    description = description.trim();

    return description;
  }

  public cleanJobDescription(description: string) {
    // Modify the description to remove the [] segment
    // (and trim whitespace after the remaining text).
    const match = description.match(/\[.*?\]/);
    if (match) {
      description = description.replace(match[0], '').trim();
    }
    return description;
  }

  public extractCustomerPart(description: string) {
    description = this.cleanJobDescription(description);
    // Find the left-most ':' in the string
    const breakpoint = description.indexOf(':');
    if (breakpoint === -1) return { customerId: null, partNumber: null };

    // Extract the customerId and partNumber based on the breakpoint
    const customerId = description.substring(0, breakpoint);
    const partNumber = description.substring(breakpoint + 1);

    return { customerId, partNumber };
  }

  public setJobDescription(
    customerId: string,
    partNumber: string,
    employeeId: string = '',
    workCenterId: string = '',
  ): string {
    const baseDescription = `${customerId}:${partNumber}`;

    const [description] =
      employeeId != '' && workCenterId != ''
        ? this.modifyJobDescription(baseDescription, employeeId, workCenterId)
        : [baseDescription];

    return description;
  }

  public modifyJobDescription(
    desc: string,
    employee: string,
    workCenter: string,
    remove: boolean = false,
  ): [string, boolean] {
    // Maximum allowed length for the description
    const MAX_LENGTH = 50;

    if (desc.includes(',...')) {
      if (!remove) {
        return [desc, true];
      } else {
        desc = desc.replace(',...', '');
      }
    }

    const match = desc.match(/(\w+):(.*)\[([^\]]*)\]/);
    let customerId, partNumber, listStr;

    if (match) {
      customerId = match[1];
      partNumber = match[2];
      listStr = match[3];
    } else {
      const noPairMatch = desc.match(/(\w+):(.*)/);
      if (!noPairMatch) return [desc, false];

      customerId = noPairMatch[1];
      partNumber = noPairMatch[2];
      listStr = '';
    }

    const pairs = Array.from(listStr.matchAll(/\((.+),(.+)\)/g)).map(
      (match) => {
        return { employee: match[1], workCenter: match[2] };
      },
    );

    if (remove) {
      for (let i = 0; i < pairs.length; i++) {
        if (
          pairs[i].employee === employee &&
          pairs[i].workCenter === workCenter
        ) {
          pairs.splice(i, 1);
          break;
        }
      }
    } else {
      if (
        !pairs.some(
          (pair) =>
            pair.employee === employee && pair.workCenter === workCenter,
        )
      ) {
        pairs.push({ employee, workCenter });
      }
    }

    let ellipsis = false;
    while (true) {
      const pairsStr = pairs
        .map((pair) => `(${pair.employee},${pair.workCenter})`)
        .join(',');

      const resultStr = `${customerId}:${partNumber} ${
        pairsStr.length > 0 ? `[${pairsStr}${ellipsis ? ',...' : ''}]` : ''
      }`;

      if (resultStr.length <= MAX_LENGTH) {
        break;
      } else {
        pairs.pop();
        ellipsis = true;
      }
    }

    const finalPairsStr = pairs
      .map((pair) => `(${pair.employee},${pair.workCenter})`)
      .join(',');
    const finalResultStr = `${customerId}:${partNumber} ${
      finalPairsStr.length > 0
        ? `[${finalPairsStr}${ellipsis ? ',...' : ''}]`
        : ''
    }`;
    return [finalResultStr, finalPairsStr.length > 0];
  }

  /* TEMP FOR PRODUCTION PREP */

  async getCostCenterTransactions(startDate: string) {
    const response$ = await this.httpService.get(
      `/transaction-cost-center?costCenterType=Job Number&fromDate=${startDate}`,
    );
    const response = await firstValueFrom(response$);
    return response.data;
  }
}
