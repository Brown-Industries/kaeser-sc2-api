import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';

@Module({
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
