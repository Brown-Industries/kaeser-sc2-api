export class QuickStatusDto {
  powerOn: boolean;
  idle: boolean;
  load: boolean;

  error: boolean;
  errorVoltage: boolean;
  maintenanceDue: boolean;

  remoteEnabled: boolean;
  clockEnabled: boolean;

  constructor(data: any) {
    this.powerOn = data['3']?.led_power_on?.State === 1 ? true : false;
    this.idle = data['3']?.led_idle?.State === 1 ? true : false;
    this.load = data['3']?.led_load?.State === 1 ? true : false;

    this.error = data['3']?.led_error?.State === 1 ? true : false;
    this.errorVoltage = data['3']?.led_voltage?.State === 1 ? true : false;
    this.maintenanceDue =
      data['3']?.led_maintenance?.State === 1 ? true : false;

    this.remoteEnabled = data['3']?.led_remote?.State === 1 ? true : false;
    this.clockEnabled = data['3']?.led_clock?.State === 1 ? true : false;
  }
}
