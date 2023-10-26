export enum OwnerType {
  Job = 'Job',
  QuoteReq = 'QuoteReq',
  PartSpec = 'PartSpec',
  MaterialReq = 'MaterialReq',
  POHeader = 'POHeader',
  QuoteOperation = 'QuoteOperation',
  Quote = 'Quote',
  RFQHeader = 'RFQHeader',
  JobOperation = 'JobOperation',
  Customer = 'Customer',
  PODetail = 'PODetail',
  Part = 'Part', //Custom type for part, not in DB
  PartOperation = 'PartOperation', //Custom type for linking files to job operations, not in DB
  CustomerPO = 'CustomerPO', // Custom type for linking files to customer POs, not in DB
  JobOperationsForJob = 'JobOperationsForJob', //Custom type for linking files to job operations of a specific job, not in DB
}

export enum AttachType {
  File = 'File',
  Link = 'Link',
}

export enum ScopeType {
  Job = 'Job',
}

export enum AttachedReport {
  PackList = 'Pack List',
  Quote = 'Quote',
  Traveler = 'Traveler',
  SOAcknowledgment = 'SO Acknowledgment',
  OrderAcknowledgment = 'Order Acknowledgment',
  RequestForQuote = 'Request for Quote',
  Invoice = 'Invoice',
  PurchaseOrder = 'Purchase Order',
}

export enum AttachmentOperation {
  Create,
  Update,
  Delete,
  BulkCreate,
}
