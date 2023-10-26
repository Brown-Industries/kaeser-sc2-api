export class EnumMethods {
  static getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  static getValueByKey(object, key) {
    return object[key];
  }
}
