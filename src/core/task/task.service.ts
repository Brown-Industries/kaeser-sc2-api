import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobbossConnectService } from 'src/modules/jobboss-connect/jobboss-connect.service';
import { MatrixConnectService } from 'src/modules/matrix-connect/matrix-connect.service';
// import { MqttService } from '../../modules/bpm/bpm.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly jbService: JobbossConnectService,
    private readonly maService: MatrixConnectService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async everyTenSec() {
    // console.log('everyTenSec');
    // if (!this.mqttService.isActive()) return;
    // this.mqttService.publish(MqttTopic.ChangeEvents, JSON.stringify('res'));
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async everyTwoHours() {
    this.maService.resetCostCenterTransactionDescriptions();
  }
}
