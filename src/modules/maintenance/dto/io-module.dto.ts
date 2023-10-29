export class IOMDto {
  digitalIn: boolean[];
  analogOut: number[];

  constructor(data: any) {
    this.digitalIn = data['3']['iom1']['dis'].map((value: number) => {
      return value === 1 ? true : false;
    });
    this.analogOut = data['3']['iom1']['airs'].map((value: number) => {
      return value;
    });
  }

  toObj() {
    return { digitalIn: this.digitalIn, analogOut: this.analogOut };
  }
}
