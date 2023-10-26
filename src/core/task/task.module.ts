import { Module } from '@nestjs/common';
import { JobbossConnectModule } from 'src/modules/jobboss-connect/jobboss-connect.module';
import { MatrixConnectModule } from 'src/modules/matrix-connect/matrix-connect.module';
import { TaskService } from './task.service';

@Module({
  imports: [JobbossConnectModule, MatrixConnectModule],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
