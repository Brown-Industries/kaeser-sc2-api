import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { MqttModule } from '../mqtt/mqtt.module';
import { MaintenanceModule } from 'src/modules/maintenance/maintenance.module';

@Module({
  imports: [MqttModule, MaintenanceModule],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
