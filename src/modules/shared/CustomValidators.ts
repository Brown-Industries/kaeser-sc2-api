import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEnumKey', async: false })
class IsEnumKeyConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const enumObject = args.constraints[0];
    const enumKeys = Object.keys(enumObject).filter(
      (key) => !Number.isFinite(parseFloat(key)),
    );
    const valuesArray = Array.isArray(value) ? value : [value];
    return valuesArray.every((val) => enumKeys.includes(val));
  }

  //TODO need this to only use the keys, not the values.
  defaultMessage(args: ValidationArguments) {
    const enumName = args.property;
    const enumObject = args.constraints[0];
    const enumKeys = Object.keys(enumObject).filter(
      (key) => !Number.isFinite(parseFloat(key)),
    );
    const enumKeyList = enumKeys.join(', ');
    return `${enumName} must be one of the following values: ${enumKeyList}`;
  }
}

export function IsEnumKey(
  enumObject: object,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [enumObject],
      validator: IsEnumKeyConstraint,
    });
  };
}

// FIELD EQUALITY
// Used to ensure only one field has a value.
@ValidatorConstraint({ name: 'fieldEquality', async: false })
export class FieldEqualityConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const otherPropertyName = args.constraints[0];
    const otherValue = (args.object as any)[otherPropertyName];

    const isValue = value !== null && value !== undefined; // && value !== '';
    const isOtherValue = otherValue !== null && otherValue !== undefined; // && otherValue !== '';

    if ((isValue || isOtherValue) && !(isValue && isOtherValue)) {
      return true;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const otherPropertyName = args.constraints[0];
    return `Only one of ${args.property} or ${otherPropertyName} should have a value.`;
  }
}

export function FieldEquality(
  otherPropertyName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'fieldEquality',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [otherPropertyName],
      options: validationOptions,
      validator: FieldEqualityConstraint,
    });
  };
}
