export enum JobRelations {
  Attachments = 'attachments',
  Customer = 'customer',
  CustomerUserValues = 'customer.userValues',
  Contact = 'contact',
  JobOperations = 'jobOperations',
  JobOperationsWC = 'jobOperations.workCenter',
  Deliveries = 'deliveries',
  ShipTo = 'shipTo',
  MaterialReqs = 'materialReqs',
  ParentJob = 'parentJob',
  ChildJobs = 'childJobs',
}

export enum JobType {
  Blanket = 'Blanket',
  Regular = 'Regular',
}

export enum JobStatus {
  Active = 'Active',
  Complete = 'Complete',
  Closed = 'Closed',
  Template = 'Template',
  Hold = 'Hold',
  Pending = 'Pending',
}
