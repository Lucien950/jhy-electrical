export type ArrayElement<ArrayType extends readonly unknown[]> = 
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type NonNullable<T> = Exclude<T, null | undefined>


export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }