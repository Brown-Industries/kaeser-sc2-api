export enum JobOperationRelations {
  // Attachments = 'attachments', //FIXME: DISABLED UNLESS THE QUERY IS FIXED DUE TO DATATYPE MISMATCH
  Job = 'job',
  WorkCenter = 'workCenter',
  Vendor = 'vendor',
}

export enum JobOperationStatus {
  Closed = 'C',
  Open = 'O',
  Started = 'S',
  Template = 'T',
}

export enum JobOperationRunRate {
  Parts_Hour = 'Parts/Hr',
  Hrs_Part = 'Hrs/Part',
  Min_Part = 'Min/Part',
  Sec_Part = 'Sec/Part',
  FixedHrs = 'FixedHrs',
}

export enum JobOperationOverlapType {
  Hrs = 'Hrs',
  Pct = 'Pct',
  Qty = 'Qty',
}
