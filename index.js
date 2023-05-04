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
  return from((push) => values.forEach((value) => push(value)))
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
    from((push) => {
      let stop

      const clear = () => {
        stop?.()
        stop = null
      }

      stop = source((value) => {
        if (amount > 0) {
          push(value)

          if (--amount <= 0) clear()
        } else clear()
      })

      return clear
    })
)

export default {
  of,
  map,
  from,
  scan,
  take,
  filter,
  forEach
}