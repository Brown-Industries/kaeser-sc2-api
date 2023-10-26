import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
// import { MqttService } from '../../modules/bpm/bpm.service';

@Injectable()
export class TaskService {
  constructor() {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async everyTenSec() {
    // console.log('everyTenSec');
    // if (!this.mqttService.isActive()) return;
    // this.mqttService.publish(MqttTopic.ChangeEvents, JSON.stringify('res'));
  }
}
