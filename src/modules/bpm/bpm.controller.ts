// import { Controller, Get, Param } from '@nestjs/common';
// import { ApiOperation, ApiTags } from '@nestjs/swagger';
// import { BPMService } from './bpm.service';

// @ApiTags('Sync Processes')
// @Controller('process')
// export class BPMController {
//   constructor(private readonly bpmService: BPMService) {}

//   @Get('syncActiveJobs')
//   @ApiOperation({
//     summary: 'Creates job cost centers for all active jobs in JobBOSS.',
//   })
//   syncActiveJobs() {
//     return this.bpmService.syncActiveJobs();
//   }

//   @Get('syncClockedInJobs')
//   @ApiOperation({
//     summary:
//       'Syncs the clocked in jobs from JobBOSS to Matrix. Activates jobs that are clocked in.',
//   })
//   syncClockedInJobs() {
//     return this.bpmService.syncClockedInJobs();
//   }

//   @Get('/production-prep')
//   productionPrep() {
//     return this.bpmService.productionPrep();
//   }

//   @Get('/mass-update-part-items')
//   @ApiOperation({
//     summary:
//       'Updates part numbers with tooling that has been used on each part.',
//   })
//   massUpdatePartItems() {
//     return this.bpmService.massUpdatePartItems();
//   }

//   @Get('/mass-job-cost')
//   @ApiOperation({
//     summary:
//       'Calculates tooling costs for all job numbers and writes the data into JobBOSS as a material.',
//   })
//   massUpdateCostsForJobs() {
//     return this.bpmService.syncAllJobCosts();
//   }

//   @Get('/job-cost/:id')
//   @ApiOperation({
//     summary:
//       'Calculates tooling costs for a given job number and writes the data into JobBOSS as a material.',
//   })
//   syncJobCostForJob(@Param('id') id: string) {
//     return this.bpmService.syncJobCost(id);
//   }
// }
