// Reference:
//   https://qiita.com/kgtkr/items/2a8290d1b1314063a524

type TypeEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? [] | [true]
  : [false]

type TypeNotEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? [false]
  : [] | [true]

type TypeMatch<A, B> = A[] extends B[] ? [] | [true] : [false]
type TypeNotMatch<A, B> = A[] extends B[] ? [false] : [] | [true]

export const assertType = {
  /**
   * ```ts
   * function equal<A, B>(valid?: true | false): void
   * ```
   * `A` is equal to `B`.
   */
  equal: <A, B>(..._args: TypeEqual<A, B>) => {},
  /**
   * ```ts
   * function notEqual<A, B>(valid?: true | false): void
   * ```
   * `A` isn't equal to `B`.
   */

  notEqual: <A, B>(..._args: TypeNotEqual<A, B>) => {},
  /**
   * ```ts
   * function assignable<A, B>(valid?: true | false): void
   * ```
   * `A` is assignable to `B`.
   */
  assignable: <A, B>(..._args: TypeMatch<A, B>) => {},
  /**
   * ```ts
   * function notAssignable<A, B>(valid?: true | false): void
   * ```
   * `A` isn't assignable to `B`.
   */
  notAssignable: <A, B>(..._args: TypeNotMatch<A, B>) => {},
}

/**
 * ```ts
 * function expectType<T>(value: T): void
 * ```
 * The type of `value` is identical to type `T`.
 * @param value
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function expectType<T>(value: T) {}
