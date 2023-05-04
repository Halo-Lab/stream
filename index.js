function operator(finish, minimalArity = finish.length - 1) {
  return (source, ...params) => params.length >= minimalArity
    ? finish(source, ...params)
    : (anotherSource) => finish(anotherSource, source, ...params)
}

export function from(source) {
  return (sink) => {
    const stop = source(sink)

    return () => stop?.()
  }
}

export function of(...values) {
  return from((push) => {
    const iterator = values[Symbol.iterator]();

    Promise.resolve().then(() => {
      for (const value of iterator) push(value)
    })

    return () => {
      iterator.return()
    }
  })
}

export const map = operator(
  (source, callback) =>
    from((push) =>
      source((value) => push(callback(value)))
    )
)

export const filter = operator(
  (source, callback) =>
    from((push) =>
      source(
        (value) => {
          if (callback(value)) push(value)
        }
      )
    )
)

export const forEach = operator(
  (source, callback) => source(callback)
)

export const scan = operator(
  (source, accumulator, reduce) => {
    if (reduce === undefined)
      (reduce = accumulator, accumulator = undefined)

    return from((push) => {
      let created = true
      let intermediate = accumulator

      return source((value) => {
        push(
          intermediate = created && intermediate === undefined
            ? value
            : reduce(intermediate, value)
        )

        if (created) created = false
      })
    })
  },
  1
)

export const take = operator(
  (source, amount) =>
    takeWhile(source, () => amount && amount--)
)

export const takeWhile = operator(
  (source, callback) =>
    from((push) => {
      let stop

      const clear = () => {
        stop?.()
        stop = null
      }

      stop = source((value) =>
        callback(value) ? push(value) : clear()
      )

      return clear
    })
)

export const skip = operator(
  (source, amount) =>
    filter(source, () => !(amount && amount--))
)

export const skipWhile = operator(
  (source, callback) => {
    let skipping = true

    return filter(source, (value) => skipping ? !(skipping = callback(value)) : true)
  }
)

export default {
  of,
  map,
  from,
  scan,
  take,
  skip,
  filter,
  forEach,
  skipWhile,
  takeWhile
}