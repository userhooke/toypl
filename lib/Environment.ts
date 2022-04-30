export interface EnvironmentRecord {
  [key: string]: {
    value: any;
    mutable: boolean;
  };
}

export class Environment {
  public record: EnvironmentRecord;
  public parent: Environment;

  constructor(record = {}, parent: Environment = null) {
    this.record = record;
    this.parent = parent;
  }
  define(name: string, value: any, mutable: boolean) {
    this.record[name] = {
      value,
      mutable,
    };
    return value;
  }
  assign(name: string, value: string | number) {
    const a = this.resolve(name).record[name];
    if (!a.mutable)
      throw new ReferenceError(`Cannot mutate the defined value "${name}".`);
    return (a.value = value);
  }
  lookup(name: string) {
    return this.resolve(name).record[name].value;
  }
  resolve(name: string): Environment {
    if (this.record.hasOwnProperty(name)) {
      return this;
    }

    if (this.parent == null) {
      throw new ReferenceError(`Variable "${name}" is not defined.`);
    }
    return this.parent.resolve(name);
  }
}
