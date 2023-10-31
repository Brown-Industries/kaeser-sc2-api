import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MaintenanceService } from 'src/modules/maintenance/maintenance.service';
import { MqttTopic } from 'src/modules/shared/enum/Mqtt';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly mqttService: MqttService,
    private readonly maintenanceService: MaintenanceService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async everySec() {
    try {
      if (!this.mqttService.isActive()) return;

      const res = (await this.maintenanceService.getOperational()).toObj();
      const temp = { 'operational-data': res };
      this.mqttService.publish(MqttTopic.Operational, JSON.stringify(temp));
    } catch (e) {
      this.mqttService.setStatus(false);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async every10Sec() {
    try {
      await this.maintenanceService.bumpSession();
      this.mqttService.setStatus(true);
    } catch (e) {
      this.mqttService.setStatus(false);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async everyMin() {
    if (!this.mqttService.isActive()) return;

    const m = (await this.maintenanceService.getMaintenanceTimers()).toObj();
    const tM = { 'maintenance-timers': m };
    this.mqttService.publish(MqttTopic.Maintenance, JSON.stringify(tM));

    const mes = (await this.maintenanceService.getMessages()).toObj();
    const tMes = { messages: mes };
    this.mqttService.publish(MqttTopic.Messages, JSON.stringify(tMes));

    const oh = (await this.maintenanceService.getOperatingHours()).toObj();
    const tOh = { 'operating-hours': oh };
    this.mqttService.publish(MqttTopic.OperatingHours, JSON.stringify(tOh));

    const ld = await this.maintenanceService.getLedData();
    const tLd = { 'led-data': ld };
    this.mqttService.publish(MqttTopic.LedData, JSON.stringify(tLd));
  }
}
