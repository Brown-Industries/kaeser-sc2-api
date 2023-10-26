import { Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MatrixConnectService } from './matrix-connect.service';

@ApiTags('Matrix-Connect')
@Controller('matrix-connect')
export class MatrixConnectController {
  constructor(private readonly matrixConnectService: MatrixConnectService) {}

  @Get()
  healthCheck() {
    return this.matrixConnectService.healthCheck();
  }

  @Patch('cost-center-transactions/reset')
  resetCostCenterTransactionDescriptions() {
    this.matrixConnectService.resetCostCenterTransactionDescriptions();
  }
}
