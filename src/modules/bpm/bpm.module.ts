import { Module } from '@nestjs/common';
import { BPMService } from './bpm.service';
import { MqttModule } from 'src/core/mqtt/mqtt.module';
import { JobbossConnectModule } from '../jobboss-connect/jobboss-connect.module';
import { MatrixConnectModule } from '../matrix-connect/matrix-connect.module';
import { BPMController } from './bpm.controller';

@Module({
  imports: [MqttModule, JobbossConnectModule, MatrixConnectModule],
  controllers: [BPMController],
  providers: [BPMService],
})
export class BPMModule {}
