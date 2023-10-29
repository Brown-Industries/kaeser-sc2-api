export class MaintenanceTimerDto {
  oilFilterInterval: number; //3274104
  oilFilterCurrent: number; //3274264

  oilSeperatorInterval: number; //3275128
  oilSeperatorCurrent: number; //3275288

  oilChangeInterval: number; //3276152
  oilChangeCurrent: number; //3276312

  airFilterInterval: number; //3277176
  airFilterCurrent: number; //3277336

  valveInspectionInterval: number; //3278200
  valveInspectionCurrent: number; //3278360

  beltCouplingInterval: number; //3279224
  beltCouplingCurrent: number; //3279384

  compMotorBearingLubeInterval: number; //3280480
  compMotorBearingLubeCurrent: number; //3280640

  bearingChangeInterval: number; //3281272
  bearingChangeCurrent: number; //3281432

  fanMotorBearingInterval: number; //3283320
  fanMotorBearingCurrent: number; //3283480

  annualMaintenanceDue: Date; //3285368

  constructor(data: any) {
    this.oilFilterInterval = this.extractHourValue(data, 3274104);
    this.oilFilterCurrent = this.extractHourValue(data, 3274264);

    this.oilSeperatorInterval = this.extractHourValue(data, 3275128);
    this.oilSeperatorCurrent = this.extractHourValue(data, 3275288);

    this.oilChangeInterval = this.extractHourValue(data, 3276152);
    this.oilChangeCurrent = this.extractHourValue(data, 3276312);

    this.airFilterInterval = this.extractHourValue(data, 3277176);
    this.airFilterCurrent = this.extractHourValue(data, 3277336);

    this.valveInspectionInterval = this.extractHourValue(data, 3278200);
    this.valveInspectionCurrent = this.extractHourValue(data, 3278360);

    this.beltCouplingInterval = this.extractHourValue(data, 3279224);
    this.beltCouplingCurrent = this.extractHourValue(data, 3279384);

    this.compMotorBearingLubeInterval = this.extractHourValue(data, 3280480);
    this.compMotorBearingLubeCurrent = this.extractHourValue(data, 3280640);

    this.bearingChangeInterval = this.extractHourValue(data, 3281272);
    this.bearingChangeCurrent = this.extractHourValue(data, 3281432);

    this.fanMotorBearingInterval = this.extractHourValue(data, 3283320);
    this.fanMotorBearingCurrent = this.extractHourValue(data, 3283480);

    this.annualMaintenanceDue = this.extractDate(data, 3285368);
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

  private extractDate(data: any, id: number): Date | null {
    for (const key in data['3']) {
      if (data['3'].hasOwnProperty(key)) {
        const item = data['3'][key];
        if (item['Id'] === id && typeof item['Value'] === 'string') {
          const dateParts = item['Value']
            .split('/')
            .map((part) => parseInt(part));
          if (dateParts.length === 3) {
            const year = dateParts[2] + 2000;
            const month = dateParts[0] - 1;
            const day = dateParts[1];
            return new Date(year, month, day);
          }
          return null; // Return null if the date format is not as expected
        }
      }
    }
    return null; // Return null if not found
  }

  toObj() {
    return {
      oilFilter: {
        current: this.oilFilterCurrent,
        interval: this.oilFilterInterval,
      },
      oilSeperator: {
        current: this.oilSeperatorCurrent,
        interval: this.oilSeperatorInterval,
      },
      oilChange: {
        current: this.oilChangeCurrent,
        interval: this.oilChangeInterval,
      },
      airFilter: {
        current: this.airFilterCurrent,
        interval: this.airFilterInterval,
      },
      valveInspection: {
        current: this.valveInspectionCurrent,
        interval: this.valveInspectionInterval,
      },
      beltCoupling: {
        current: this.beltCouplingCurrent,
        interval: this.beltCouplingInterval,
      },
      compMotorBearingLube: {
        current: this.compMotorBearingLubeCurrent,
        interval: this.compMotorBearingLubeInterval,
      },
      bearingChange: {
        current: this.bearingChangeCurrent,
        interval: this.bearingChangeInterval,
      },
      fanMotorBearing: {
        current: this.fanMotorBearingCurrent,
        interval: this.fanMotorBearingInterval,
      },
      annualMaintenanceDue: this.annualMaintenanceDue,
    };
  }
}
