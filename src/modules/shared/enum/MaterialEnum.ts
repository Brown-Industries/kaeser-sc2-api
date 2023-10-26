export enum MaterialStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum MaterialType {
  Finished_Goods = 'F',
  Raw_Materials = 'R',
  Shop_Supplies = 'S',
  Miscellaneous = 'M',
}

export enum MaterialReqStatus {
  Closed = 'C',
  Open = 'O',
  Started = 'S',
  Template = 'T',
}

export enum MaterialReqBasis {
  PartsPerMaterial = 'P',
  MaterialPerPart = 'I',
  SheetStock = 'S',
  BarStock = 'B',
}

export enum MaterialPickBuyIndicator {
  Pick = 'P',
  Buy = 'B',
}
