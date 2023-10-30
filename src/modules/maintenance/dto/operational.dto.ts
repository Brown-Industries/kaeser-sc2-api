export class OperationalDto {
  pressure: number; //3163824
  pressureUnit: string; //3163824
  compressorState: string; //4082904
  startMode: string; //4057536

  constructor(data: any) {
    this.pressure = this.extractNumericValue(data, 3163824);
    this.pressureUnit = this.extractUnit(data, 3163824);
    this.compressorState = this.extractStringValue(data, 4082904);
    this.startMode = this.extractStringValue(data, 4057536);
  }

  private extractStringValue(data: any, id: number): string {
    for (const key in data['3']) {
      if (data['3'].hasOwnProperty(key)) {
        const item = data['3'][key];
        if (item['Id'] === id && typeof item['Value'] === 'string') {
          return item['Value'].trim();
        }
      }
    }
    return '';
  }

  private extractNumericValue(data: any, id: number): number {
    for (const key in data['3']) {
      if (data['3'].hasOwnProperty(key)) {
        const item = data['3'][key];
        if (item['Id'] === id && typeof item['Value'] === 'string') {
          return parseInt(item['Value'].trim());
        }
      }
    }
    return 0;
  }

  private extractUnit(data: any, id: number): string {
    for (const key in data['3']) {
      if (data['3'].hasOwnProperty(key)) {
        const item = data['3'][key];
        if (item['Id'] === id && typeof item['Unit'] === 'string') {
          return item['Unit'].trim();
        }
      }
    }
    return '';
  }

  toObj() {
    return {
      compressorState: this.compressorState,
      startMode: this.startMode,
      pressure: {
        value: this.pressure,
        unit: this.pressureUnit,
      },
    };
  }
}
