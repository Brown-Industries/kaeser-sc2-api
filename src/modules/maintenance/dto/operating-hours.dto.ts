export class OperatingHoursDto {
  compressorHours: number; //3261336
  onLoadHours: number; //3261648
  motorHours: number; //3261960
  compressorBlockHours: number; //3262272
  sigmaControlHours: number; //3262584

  constructor(data: any) {
    this.compressorHours = this.extractHourValue(data, 3261336);
    this.onLoadHours = this.extractHourValue(data, 3261648);
    this.motorHours = this.extractHourValue(data, 3261960);
    this.compressorBlockHours = this.extractHourValue(data, 3262272);
    this.sigmaControlHours = this.extractHourValue(data, 3262584);
  }

  private extractHourValue(data: any, id: number): number {
    for (const key in data['3']) {
      if (data['3'].hasOwnProperty(key)) {
        const item = data['3'][key];
        if (item['Id'] === id && typeof item['Value'] === 'string') {
          return parseInt(item['Value'].replace('h', '').trim());
        }
      }
    }
    return 0;
  }

  toObj() {
    return {
      compressorHours: this.compressorHours,
      onLoadHours: this.onLoadHours,
      motorHours: this.motorHours,
      compressorBlockHours: this.compressorBlockHours,
      sigmaControlHours: this.sigmaControlHours,
    };
  }
}
