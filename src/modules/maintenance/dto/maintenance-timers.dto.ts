export class MaintenanceTimerDto {
  oilFilterInterval: number; //3274104
  oilFilterDueIn: number; //3274264

  oilSeperatorInterval: number; //3275128
  oilSeperatorDueIn: number; //3275288

  oilChangeInterval: number; //3276152
  oilChangeDueIn: number; //3276312

  airFilterInterval: number; //3277176
  airFilterDueIn: number; //3277336

  valveInspectionInterval: number; //3278200
  valveInspectionDueIn: number; //3278360

  beltCouplingInterval: number; //3279224
  beltCouplingDueIn: number; //3279384

  compMotorBearingLubeInterval: number; //3280480
  compMotorBearingLubeDueIn: number; //3280640

  bearingChangeInterval: number; //3281272
  bearingChangeDueIn: number; //3281432

  fanMotorBearingInterval: number; //3283320
  fanMotorBearingDueIn: number; //3283480

  annualMaintenanceDue: Date; //3285368

  constructor(data: any) {
    this.oilFilterInterval = this.extractHourValue(data, 3274104);
    this.oilFilterDueIn = this.extractHourValue(data, 3274264);

    this.oilSeperatorInterval = this.extractHourValue(data, 3275128);
    this.oilSeperatorDueIn = this.extractHourValue(data, 3275288);

    this.oilChangeInterval = this.extractHourValue(data, 3276152);
    this.oilChangeDueIn = this.extractHourValue(data, 3276312);

    this.airFilterInterval = this.extractHourValue(data, 3277176);
    this.airFilterDueIn = this.extractHourValue(data, 3277336);

    this.valveInspectionInterval = this.extractHourValue(data, 3278200);
    this.valveInspectionDueIn = this.extractHourValue(data, 3278360);

    this.beltCouplingInterval = this.extractHourValue(data, 3279224);
    this.beltCouplingDueIn = this.extractHourValue(data, 3279384);

    this.compMotorBearingLubeInterval = this.extractHourValue(data, 3280480);
    this.compMotorBearingLubeDueIn = this.extractHourValue(data, 3280640);

    this.bearingChangeInterval = this.extractHourValue(data, 3281272);
    this.bearingChangeDueIn = this.extractHourValue(data, 3281432);

    this.fanMotorBearingInterval = this.extractHourValue(data, 3283320);
    this.fanMotorBearingDueIn = this.extractHourValue(data, 3283480);

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
        dueIn: this.oilFilterDueIn,
        interval: this.oilFilterInterval,
      },
      oilSeperator: {
        dueIn: this.oilSeperatorDueIn,
        interval: this.oilSeperatorInterval,
      },
      oilChange: {
        dueIn: this.oilChangeDueIn,
        interval: this.oilChangeInterval,
      },
      airFilter: {
        dueIn: this.airFilterDueIn,
        interval: this.airFilterInterval,
      },
      valveInspection: {
        dueIn: this.valveInspectionDueIn,
        interval: this.valveInspectionInterval,
      },
      beltCoupling: {
        dueIn: this.beltCouplingDueIn,
        interval: this.beltCouplingInterval,
      },
      compMotorBearingLube: {
        dueIn: this.compMotorBearingLubeDueIn,
        interval: this.compMotorBearingLubeInterval,
      },
      bearingChange: {
        dueIn: this.bearingChangeDueIn,
        interval: this.bearingChangeInterval,
      },
      fanMotorBearing: {
        dueIn: this.fanMotorBearingDueIn,
        interval: this.fanMotorBearingInterval,
      },
      annualMaintenanceDue: this.annualMaintenanceDue,
    };
  }
}
