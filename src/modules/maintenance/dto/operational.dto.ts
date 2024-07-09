export class OperationalDto {
  powerState: string; //4446144
  compressorState: string; //4422008
  startMode: string; //4462736

  pressure: number; //3498296
  pressureUnit: string; //3498296

  inletTemp: number; //3236248
  inletTempUnit: string; //3236248

  outletTemp: number; //3233600
  outletTempUnit: string; //3233600

  motorTemp: number; //3240368
  motorTempUnit: string; //3240368

  lastPowerChange: Date; //3200672,3200752

  constructor(data: any) {
    this.powerState = this.extractStringValue(data, 4446144)
      .trim()
      .toLowerCase();
    const csRaw = this.extractStringValue(data, 4422008).trim().toLowerCase();

    if (csRaw.includes('on load')) {
      this.compressorState = 'load';
    } else if (csRaw.includes('back pressure')) {
      this.compressorState = 'back pressure';
    } else {
      this.compressorState = csRaw;
    }

    const smRaw = this.extractStringValue(data, 4462736).trim().toLowerCase();
    if (smRaw === 'rc') {
      this.startMode = 'remote';
    } else {
      this.startMode = smRaw;
    }
    this.pressure = this.extractNumericValue(data, 3498296);
    this.pressureUnit = this.extractUnit(data, 3498296);
    this.inletTemp = this.extractNumericValue(data, 3236248);
    this.inletTempUnit = this.extractUnit(data, 3236248);
    this.outletTemp = this.extractNumericValue(data, 3233600);
    this.outletTempUnit = this.extractUnit(data, 3233600);
    this.motorTemp = this.extractNumericValue(data, 3240368);
    this.motorTempUnit = this.extractUnit(data, 3240368);

    const date = this.extractStringValue(data, 3200672);
    const time = this.extractStringValue(data, 3200752)
      .replace('AM', '')
      .replace('PM', '')
      .trim();
    this.lastPowerChange = new Date(`${date} ${time}`);
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
          return parseFloat(item['Value'].trim());
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
      powerState: this.powerState,
      compressorState: this.compressorState,
      startMode: this.startMode,
      pressure: {
        value: this.pressure,
        unit: this.pressureUnit,
      },
      inletTemp: {
        value: this.inletTemp,
        unit: this.inletTempUnit,
      },
      outletTemp: {
        value: this.outletTemp,
        unit: this.outletTempUnit,
      },
      motorTemp: {
        value: this.motorTemp,
        unit: this.motorTempUnit,
      },
      lastPowerChange: this.lastPowerChange,
    };
  }
}
