export interface Sink<A> {
  (value: A): void
}

export interface Stream<A> {
  (sink: Sink<A>): VoidFunction
  readonly '@@stream': Stream<A>
}

export function from<A>(
  source: (push: Sink<A>) => void | VoidFunction
): Stream<A>

export function isStream<A>(value: Stream<A>): true
export function isStream<A>(value: unknown): value is Stream<A>

export function of<const T extends readonly unknown[]>(
  ...values: T
): Stream<T[number]>

export function map<A, B>(
  callback: (value: A) => B
): (source: Stream<A>) => Stream<B>
export function map<A, B>(
  source: Stream<A>,
  callback: (value: A) => B
): Stream<B>

export function filter(
  callback: BooleanConstructor
): <A>(
  source: Stream<A>
) => Stream<Exclude<A, null | undefined | 0 | '' | false>>
export function filter<A, B extends A>(
  callback: (value: A) => value is B
): (source: Stream<A>) => Stream<B>
export function filter<A>(
  callback: (value: A) => boolean
): (source: Stream<A>) => Stream<A>
export function filter<A>(
  source: Stream<A>,
  callback: BooleanConstructor
): Stream<Exclude<A, null | undefined | 0 | '' | false>>
export function filter<A, B extends A>(
  source: Stream<A>,
  callback: (value: A) => value is B
): Stream<B>
export function filter<A>(
  source: Stream<A>,
  callback: (value: A) => boolean
): Stream<A>

export function forEach<A>(
  callback: Sink<A>
): (source: Stream<A>) => VoidFunction
export function forEach<A>(source: Stream<A>, callback: Sink<A>): VoidFunction

export function scan<A>(
  reduce: (accumulator: A, value: A) => A
): (source: Stream<A>) => Stream<A>
export function scan<A, B>(
  accumulator: B,
  reduce: (accumulator: B, value: A) => B
): (source: Stream<A>) => Stream<B>
export function scan<A>(
  source: Stream<A>,
  reduce: (accumulator: A, value: A) => A
): Stream<A>
export function scan<A, B>(
  source: Stream<A>,
  accumulator: B,
  reduce: (accumulator: B, value: A) => B
): Stream<B>

export function take(amount: number): <A>(source: Stream<A>) => Stream<A>
export function take<A>(source: Stream<A>, amount: number): Stream<A>

export function skip(amount: number): <A>(source: Stream<A>) => Stream<A>
export function skip<A>(source: Stream<A>, amount: number): Stream<A>

export function takeWhile<A>(
  predicate: (value: A) => boolean
): (source: Stream<A>) => Stream<A>
export function takeWhile<A>(
  source: Stream<A>,
  predicate: (value: A) => boolean
): Stream<A>

export function skipWhile<A>(
  predicate: (value: A) => boolean
): (source: Stream<A>) => Stream<A>
export function skipWhile<A>(
  source: Stream<A>,
  predicate: (value: A) => boolean
): Stream<A>

export function unique<A, K = A>(
  selector?: (value: A) => K,
  flushes?: Stream<unknown>
): (source: Stream<A>) => Stream<A>
export function unique<A, K = A>(
  source: Stream<A>,
  selector?: (value: A) => K,
  flushes?: Stream<unknown>
): Stream<A>

export function merge<B>(
  other: Stream<B>
): <A = B>(source: Stream<A>) => Stream<A | B>
export function merge<A, B = A>(
  source: Stream<A>,
  other: Stream<B>
): Stream<A | B>

export function distinct<A>(
  compare?: (previous: A, next: A) => boolean
): (source: Stream<A>) => Stream<A>
export function distinct<A>(
  source: Stream<A>,
  compare?: (previous: A, next: A) => boolean
): Stream<A>

type _Sink<A> = Sink<A>

type _of = typeof of
type _is = typeof isStream
type _map = typeof map
type _from = typeof from
type _scan = typeof scan
type _take = typeof take
type _skip = typeof skip
type _merge = typeof merge
type _filter = typeof filter
type _unique = typeof unique
type _forEach = typeof forEach
type _distinct = typeof distinct
type _skipWhile = typeof skipWhile
type _takeWhile = typeof takeWhile

declare namespace Stream {
  export type Self<A> = Stream<A>
  export type Sink<A> = _Sink<A>

  export const of: _of
  export const is: _is
  export const map: _map
  export const from: _from
  export const scan: _scan
  export const take: _take
  export const skip: _skip
  export const merge: _merge
  export const filter: _filter
  export const unique: _unique
  export const forEach: _forEach
  export const distinct: _distinct
  export const skipWhile: _skipWhile
  export const takeWhile: _takeWhile
}

export default Stream
