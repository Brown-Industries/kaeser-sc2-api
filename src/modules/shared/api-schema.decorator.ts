type Constructor<T = object> = new (...args: any[]) => T;
type Wrapper<T = object> = { new (): T & any; prototype: T };
type DecoratorOptions = { name: string };
type ApiSchemaDecorator = <T extends Constructor>(
  options: DecoratorOptions,
) => (constructor: T) => Wrapper<T>;

const ApiSchema: ApiSchemaDecorator = ({ name }) => {
  return (constructor) => {
    const wrapper = class extends constructor {};
    Object.defineProperty(wrapper, 'name', {
      value: name,
      writable: false,
    });
    return wrapper;
  };
};
