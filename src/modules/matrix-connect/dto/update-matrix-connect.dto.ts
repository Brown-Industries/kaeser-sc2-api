import { PartialType } from '@nestjs/swagger';
import { CreateMatrixConnectDto } from './create-matrix-connect.dto';

export class UpdateMatrixConnectDto extends PartialType(CreateMatrixConnectDto) {}
