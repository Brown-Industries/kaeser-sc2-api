import { Injectable } from '@nestjs/common';
import { MqttService } from 'src/core/mqtt/mqtt.service';
import { JobbossConnectService } from '../jobboss-connect/jobboss-connect.service';
import { MatrixConnectService } from '../matrix-connect/matrix-connect.service';

type Summary = {
  [key: string]: {
    item: string;
    itemDescription: string;
    itemType: string;
    totalIssues: number;
    totalScrap: number;
    totalReturn: number;
    totalTransQty: number;
    itemUnitCost: number;
    condition: string;
    totalTransCost: number;
  };
};

@Injectable()
export class BPMService {
  constructor(
    private readonly mqttService: MqttService,
    private readonly jbService: JobbossConnectService,
    private readonly maService: MatrixConnectService,
  ) {}

  private jobboss_topic_root = '';
  private matrix_topic_root = '';

  onModuleInit() {
    this.jobboss_topic_root = process.env.JOBBOSS_MQTT_TOPIC_ROOT;
    this.matrix_topic_root = process.env.MATRIX_MQTT_TOPIC_ROOT;

    this.mqttService.on('connected', this.handleMqttConnected.bind(this));
  }

  private handleMqttConnected() {
    this.mqttService.subscribeToTopic(
      this.jobboss_topic_root + '/change-events',
      this.evaluateJobbossMqttMessage.bind(this),
    );
    this.mqttService.subscribeToTopic(
      this.matrix_topic_root + '/transaction-events',
      this.evaluateMatrixMqttTransaction.bind(this),
    );
  }

  private async evaluateMatrixMqttTransaction(message: any) {
    const messageObj = JSON.parse(message);
    await this.maService.resetCostCenterTransactionDescriptions();

    for (const message of messageObj) {
      const transSummary = await this.maService.getTransactionSummaryById(
        message.id,
      );
      const jobNumberTransaction = transSummary.find(
        (transaction) => transaction.costCenterType === 'Job Number',
      );
      const jobNumber = jobNumberTransaction
        ? jobNumberTransaction.costCenter
        : null;

      if (!jobNumber) {
        console.log('No job number found for transaction ' + message.id);
        continue;
      }
      const { customerId, partNumber } = jobNumberTransaction
        ? this.maService.extractCustomerPart(
            jobNumberTransaction.costCenterDescription,
          )
        : null;

      this.syncJobCost(jobNumber);

      if (customerId && partNumber) {
        this.updatePartItems(customerId, partNumber);
      }
    }
  }

  private async updatePartItems(customerId: string, partNumber: string) {
    const partTransactions =
      await this.maService.getTransactionSummaryByJobPart(
        customerId,
        partNumber,
      );
    if (partTransactions === undefined || partTransactions.length == 0) return;

    const transactionSummary = this.summarizeTransactions(partTransactions);
    const usedItemsForPart = transactionSummary.map((transaction) => ({
      costCenterType: 'Part Number',
      costCenter: this.maService.setJobDescription(customerId, partNumber),
      itemCode: transaction.item,
    }));

    let existingPartItems = await this.maService.findCostCenterItemsForPart(
      customerId,
      partNumber,
    );
    if (existingPartItems === undefined) {
      existingPartItems = [];
    }
    const filteredItems = existingPartItems.filter(
      (t) => t.userLastModified === this.maService.getApiUserId(),
    );
    const existingItemsForPart = filteredItems.map((item) => ({
      costCenterType: 'Part Number',
      costCenter: this.maService.setJobDescription(customerId, partNumber),
      itemCode: item.itemCode,
    }));
    //Logic to compare current part items and transactions. Add and remove items as needed.
    // If an item is in the usedItemsForPart but not in the existingItemsForPart, add it.
    // If an item is in the existingItemsForPart but not in the usedItemsForPart, remove it.

    // Items to be added
    const itemsToAdd = usedItemsForPart.filter(
      (usedItem) =>
        !existingItemsForPart.some(
          (existingItem) => usedItem.itemCode === existingItem.itemCode,
        ),
    );

    // Items to be removed
    const itemsToRemove = existingItemsForPart.filter(
      (existingItem) =>
        !usedItemsForPart.some(
          (usedItem) => usedItem.itemCode === existingItem.itemCode,
        ),
    );

    try {
      if (itemsToAdd.length !== 0) {
        await this.maService.createCostCenterItems(itemsToAdd);
      }
      if (itemsToRemove.length !== 0) {
        await this.maService.removeCostCenterItems(itemsToRemove);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private summarizeTransactions(transactions) {
    // Filter only 'Issue' and 'Scrap' transactions
    const filteredTransactions = transactions.filter((t) =>
      ['Issue', 'Scrap', 'Return'].includes(t.transType),
    );

    // Use reduce to create a summary
    const summary: Summary = filteredTransactions.reduce(
      (acc: Summary, curr) => {
        // If the item does not exist in the accumulator, initialize it
        if (!acc[curr.item]) {
          acc[curr.item] = {
            item: curr.item,
            itemDescription: curr.itemDescription,
            itemType: curr.itemType,
            totalIssues: 0,
            totalScrap: 0,
            totalReturn: 0,
            totalTransQty: 0,
            itemUnitCost: curr.itemUnitCost,
            condition: curr.condition,
            totalTransCost: 0,
          };
        }

        // Determine if it's an 'Issue' or 'Scrap' and accumulate accordingly
        if (curr.transType === 'Issue') {
          acc[curr.item].totalIssues += curr.transQty;

          // Calculate the totalTransCost only for Expendable items
          if (
            curr.itemType === 'Expendable' ||
            curr.itemType === 'Reworkable'
          ) {
            acc[curr.item].totalTransCost += curr.transQty * curr.itemUnitCost;
          }
        } else if (curr.transType === 'Scrap') {
          acc[curr.item].totalScrap += curr.transQty;

          if (curr.itemType === 'Durable') {
            acc[curr.item].totalTransCost += curr.transQty * curr.itemUnitCost;
          }
        } else if (curr.transType === 'Return') {
          acc[curr.item].totalReturn += -curr.transQty;

          if (curr.itemType === 'Reworkable') {
            acc[curr.item].totalTransCost += curr.transQty * curr.itemUnitCost;
          }
        }
        acc[curr.item].totalTransQty =
          acc[curr.item].totalIssues + acc[curr.item].totalScrap;

        return acc;
      },
      {},
    );

    // Convert the object back into an array
    return Object.values(summary).filter((entry) => entry.totalTransQty !== 0);
  }

  private async evaluateJobbossMqttMessage(message: any) {
    const messageObj = JSON.parse(message);

    for (const message of messageObj) {
      if (
        message.tableName === 'Transaction_Data' &&
        (message.changeType === 'Created' || message.changeType === 'Updated')
      ) {
        const event = await this.jbService.getDataCollectionById(
          message.reference,
        );
        if (event.type == 'OPERATION_START') {
          // console.log('OPERATION_START');
          this.clockIn(event);
        } else if (event.type == 'JOB_OPERATION_STOP') {
          // console.log('JOB_OPERATION_STOP');
          this.clockOut(event);
        }
      }
    }
  }

  async clockIn(event: any) {
    const jobId = event.detail.jobOperation.job.id;
    const customer = event.detail.jobOperation.job.customerId;
    const part = event.detail.jobOperation.job.partNumber;
    const partDesc = event.detail.jobOperation.job.description.substring(0, 50);
    const employee = event.employee;
    const workCenter = event.detail.jobOperation.workCenterId;

    let partCC = undefined;
    const partCCs = await this.maService.findCostCenterForPart(customer, part);
    if (partCCs.length == 0) {
      await this.maService.createPart(customer, part, '! ' + partDesc);
    } else {
      partCC = partCCs[0];
      partCC.isActive = true;
      partCC.description = '! ' + partDesc;
      partCC.description = partCC.description.substring(0, 50);
    }

    const jobCCs = await this.maService.findCostCenterForJob(jobId);
    if (jobCCs.length == 0) {
      this.maService.createJob(
        jobId,
        this.maService.setJobDescription(customer, part, employee, workCenter),
        true,
      );
      return;
    }
    const jobCC = jobCCs[0];
    delete jobCC.id;
    jobCC.isActive = true;

    const [newDescription] = this.maService.modifyJobDescription(
      jobCC.description,
      employee,
      workCenter,
    );

    jobCC.description = newDescription;

    this.maService.updateCostCenters([
      jobCC,
      ...(partCC !== undefined ? [partCC] : []),
    ]);
  }

  async clockOut(event: any) {
    const jobId = event.detail.jobOperation.job.id;
    const customer = event.detail.jobOperation.job.customerId;
    const part = event.detail.jobOperation.job.partNumber;
    const partDesc = event.detail.jobOperation.job.description.substring(0, 50);

    const partCCs = await this.maService.findCostCenterForPart(customer, part);
    const partCC = partCCs[0];
    delete partCC.id;

    const jobCCs = await this.maService.findCostCenterForJob(jobId);
    const jobCC = jobCCs[0];
    delete jobCC.id;

    let hasPairs = false;
    let newDescription = this.maService.setJobDescription(customer, part);

    const openDCs = await this.jbService.getOpenDataCollection();

    for (const dc of openDCs) {
      if (dc.detail.jobOperation.job.id == jobId) {
        [newDescription, hasPairs] = this.maService.modifyJobDescription(
          newDescription,
          dc.employee,
          dc.detail.jobOperation.workCenterId,
        );
      }
    }

    jobCC.description = newDescription;
    jobCC.isActive = hasPairs;
    if (!hasPairs) {
      partCC.description = partDesc;
    }

    this.maService.updateCostCenters([jobCC, partCC]);
  }

  async syncActiveJobs() {
    const jobs = await this.jbService.getActiveJobs();

    const jobCostCenters = [];

    for (const job of jobs) {
      jobCostCenters.push({
        type: 'Job Number',
        costCenter: job.id,
        description: this.maService.setJobDescription(
          job.customerId,
          job.partNumber,
        ),
        isActive: false,
      });
    }

    return jobCostCenters;
  }

  async syncClockedInJobs() {
    const inProcess = await this.jbService.getOpenDataCollection();
    for (const line of inProcess) {
      this.clockIn(line);
    }
  }

  /* TEMP FOR PRODUCTION PREP */

  async productionPrep() {
    console.log('Starting production prep');
    const costCenterTransactions =
      await this.maService.getCostCenterTransactions('2020-01-01');

    const allJobs = await this.jbService.getAllJobs();

    // Create a Set to store unique costCenters and an array to hold updates.
    const uniqueCostCenters = new Set();

    for (const costCenterTransaction of costCenterTransactions) {
      const costCenter = costCenterTransaction.costCenter;

      // If the costCenter is not in the set, create an update object for it.
      if (!uniqueCostCenters.has(costCenter)) {
        uniqueCostCenters.add(costCenter); // Add the costCenter to the set.

        const job = allJobs.find((job) => job.id === costCenter);

        if (job === undefined) {
          // console.log('Job not found for cost center ' + costCenter);
          uniqueCostCenters.delete(costCenter);
          continue;
        }

        const cusPart = this.maService.setJobDescription(
          job.customerId,
          job.partNumber,
        );
        console.log('----------');
        console.log('Job:' + costCenter);
        console.log('Part: ' + cusPart);
        console.log('');

        console.log('Creating job.');
        await this.maService.createJob(costCenter, cusPart, false);

        console.log('Create part.');
        await this.maService.createPart(
          job.customerId,
          job.partNumber,
          job.description,
        );

        const updateObject = {
          type: 'Job Number',
          costCenter: costCenter,
          description: cusPart,
        };
        // updateObjects.push(updateObject); // Add the update object to the array.
        console.log('Update transactions.');
        await this.maService.updateCostCenterTransaction(updateObject);
        console.log('');
        console.log('----------');

        // Optionally, perform an update action here if needed, e.g.:
        // await this.updateDescription(updateObject);
      }
    }
    console.log('DONE');

    // await this.maService.updateCostCenterTransactions(updateObjects);

    // console.log(updateObjects); // Logging the update objects.

    // Optionally, if batch update is needed, you can pass the entire array to a function, e.g.:
    // await this.batchUpdateDescriptions(updateObjects);
  }

  async massUpdatePartItems() {
    console.log('Starting part items mass update');
    const costCenters = await this.maService.getAllJobCostCenters();

    const allParts = await this.jbService.getAllParts();

    // Create a Set to store unique costCenters
    const uniqueCostCenters = new Set();

    for (const costCenter of costCenters) {
      let custPart = costCenter.description;

      const { customerId, partNumber } =
        this.maService.extractCustomerPart(custPart);

      custPart = this.maService.setJobDescription(customerId, partNumber);

      // If the costCenter is not in the set, create an update object for it.
      if (!uniqueCostCenters.has(custPart)) {
        uniqueCostCenters.add(custPart); // Add the costCenter to the set.

        const part = allParts.find(
          (part) =>
            this.maService.setJobDescription(part.customer, part.partNumber) ===
            custPart,
        );

        if (part === undefined) {
          console.log('Not Found: ' + costCenter.description);
          continue;
        }
        console.log('Updating: ' + custPart);
        await this.updatePartItems(part.customer, part.partNumber);
      }
    }
    console.log('DONE');
  }

  async syncAllJobCosts() {
    console.log('Syncing all job costs');
    const costCenters = (await this.maService.getAllJobCostCenters()).filter(
      (cc) => cc.description !== 'MISC',
    );

    for (const costCenter of costCenters) {
      await this.syncJobCost(costCenter.costCenter);
    }
  }

  async syncJobCost(id: string) {
    const jobTransactions = await this.maService.getTransactionSummaryByJob(id);

    if (jobTransactions.length == 0) {
      return `No transactions found for job ${id}`;
    }

    const summary = this.summarizeTransactions(jobTransactions);
    const summaryText = this.generateSummaryText(summary);
    const totalCost = parseFloat(
      summary.reduce((sum, item) => sum + item.totalTransCost, 0).toFixed(2),
    );

    const res = await this.jbService.createOrUpdateJobMaterialCost(
      id,
      totalCost,
      summaryText,
    );

    return res;
  }

  private generateSummaryText(data) {
    let output = '';
    const sortedData = data.sort((a, b) => b.totalTransCost - a.totalTransCost);

    sortedData.forEach((entry) => {
      output += `${entry.item} | ${entry.itemDescription}\n`;
      output += `Job Cost: $${entry.totalTransCost.toFixed(2)}\n`;
      output += `Type: ${entry.itemType}\n`;
      // Only display Scrap and Return if itemType is 'Durable' or 'Reworkable'
      if (['Durable', 'Reworkable', 'Gauge'].includes(entry.itemType)) {
        output += `Issues: ${entry.totalIssues} | Return: ${entry.totalReturn} | Scrap: ${entry.totalScrap}\n`;
      } else {
        output += `Issues: ${entry.totalIssues}\n`;
      }
      output += `Unit Cost: $${entry.itemUnitCost.toFixed(2)}\n\n`;
    });
    return output;
  }
}
