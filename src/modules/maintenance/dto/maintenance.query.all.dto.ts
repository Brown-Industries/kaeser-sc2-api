import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsEnumKey } from 'src/modules/shared/CustomValidators';
import {
  CompressorData,
  MaintenceTimerData,
} from 'src/modules/shared/enum/CompressorData';

export class MaintenanceQueryAllDTO {
  // @ApiPropertyOptional({
  //   enum: Object.keys(MaintenceTimerData).filter(
  //     (key) => typeof key === 'string',
  //   ),
  // })
  // @IsOptional()
  // @IsEnumKey(MaintenceTimerData)
  // maintenceTimer: MaintenceTimerData[];

  @ApiPropertyOptional({
    enum: Object.keys(CompressorData).filter((key) => typeof key === 'string'),
  })
  @IsOptional()
  @IsEnumKey(CompressorData)
  data: CompressorData[];
}
