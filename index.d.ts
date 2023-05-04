export interface Sink<A> {
  (value: A): void
}

export interface Stream<A> {
  (sink: Sink<A>): VoidFunction
}

export function from<A>(source: (push: Sink<A>) => void | VoidFunction): Stream<A>

export function of<const T extends readonly unknown[]>(...values: T): Stream<T[number]>

export function map<A, B>(callback: (value: A) => B): (source: Stream<A>) => Stream<B>
export function map<A, B>(source: Stream<A>, callback: (value: A) => B): Stream<B>

export function filter(callback: BooleanConstructor): <A>(source: Stream<A>) => Stream<Exclude<A, null | undefined | 0 | '' | false>>
export function filter<A, B extends A>(callback: (value: A) => value is B): (source: Stream<A>) => Stream<B>
export function filter<A>(callback: (value: A) => boolean): (source: Stream<A>) => Stream<A>
export function filter<A>(source: Stream<A>, callback: BooleanConstructor): Stream<Exclude<A, null | undefined | 0 | '' | false>>
export function filter<A, B extends A>(source: Stream<A>, callback: (value: A) => value is B): Stream<B>
export function filter<A>(source: Stream<A>, callback: (value: A) => boolean): Stream<A>

export function forEach<A>(callback: Sink<A>): (source: Stream<A>) => VoidFunction
export function forEach<A>(source: Stream<A>, callback: Sink<A>): VoidFunction

export function scan<A>(reduce: (accumulator: A, value: A) => A): (source: Stream<A>) => Stream<A>
export function scan<A, B>(accumulator: B, reduce: (accumulator: B, value: A) => B): (source: Stream<A>) => Stream<B>
export function scan<A>(source: Stream<A>, reduce: (accumulator: A, value: A) => A): Stream<A>
export function scan<A, B>(source: Stream<A>, accumulator: B, reduce: (accumulator: B, value: A) => B): Stream<B>

type _Sink<A> = Sink<A>

type _of = typeof of
type _map = typeof map
type _from = typeof from
type _scan = typeof scan
type _filter = typeof filter
type _forEach = typeof forEach

declare namespace Stream {
  export type Self<A> = Stream<A>
  export type Sink<A> = _Sink<A>

  export const of: _of
  export const map: _map
  export const from: _from
  export const scan: _scan
  export const filter: _filter
  export const forEach: _forEach
}

export default Stream