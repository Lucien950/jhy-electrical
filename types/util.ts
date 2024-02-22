export type ArrayElement<ArrayType extends readonly unknown[]> = 
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type NonNullable<T> = Exclude<T, null | undefined>


export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

type Primatives = string | number | bigint | boolean | null | undefined | symbol | Date

export type DeepPartial<T> = T extends Primatives
  ? T | undefined
  // Arrays, Sets and Maps and their readonly counterparts have their items made
  // deeply partial, but their own instances are left untouched
  : T extends Array<infer ArrayType>
  ? Array<ArrayType extends Primatives ? ArrayType : DeepPartial<ArrayType>>
  : T extends ReadonlyArray<infer ArrayType>
  ? ReadonlyArray<ArrayType>
  : T extends Set<infer SetType>
  ? Set<DeepPartial<SetType>>
  : T extends ReadonlySet<infer SetType>
  ? ReadonlySet<SetType>
  : T extends Map<infer KeyType, infer ValueType>
  ? Map<DeepPartial<KeyType>, DeepPartial<ValueType>>
  : T extends ReadonlyMap<infer KeyType, infer ValueType>
  ? ReadonlyMap<DeepPartial<KeyType>, DeepPartial<ValueType>>
  // ...and finally, all other objects.
  : {
      [K in keyof T]?: DeepPartial<T[K]>;
    };
