import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MqttService } from '../mqtt/mqtt.service';
import { MqttTopic } from 'src/modules/shared/enum/Mqtt';
import { MaintenanceService } from 'src/modules/maintenance/maintenance.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly mqttService: MqttService,
    private readonly maintenanceService: MaintenanceService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async everySec() {
    if (!this.mqttService.isActive()) return;

    const res = (await this.maintenanceService.getOperational()).toObj();
    this.mqttService.publish(MqttTopic.Operational, JSON.stringify(res));
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async everyMin() {
    if (!this.mqttService.isActive()) return;

    const m = (await this.maintenanceService.getMaintenanceTimers()).toObj();
    this.mqttService.publish(MqttTopic.Maintenance, JSON.stringify(m));

    const mes = (await this.maintenanceService.getMessages()).toObj();
    this.mqttService.publish(MqttTopic.Messages, JSON.stringify(mes));

    const oh = (await this.maintenanceService.getOperatingHours()).toObj();
    this.mqttService.publish(MqttTopic.OperatingHours, JSON.stringify(oh));

    const ld = await this.maintenanceService.getLedData();
    this.mqttService.publish(MqttTopic.LedData, JSON.stringify(ld));
  }
}
