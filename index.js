const STREAM = '@@stream'

function operator(finish) {
  return (source, ...params) => isStream(source)
    ? finish(source, ...params)
    : (anotherSource) => finish(anotherSource, source, ...params)
}

export function from(source) {
  const stream = (sink) => {
    const stop = source(sink)

    return () => stop?.()
  }

  stream[STREAM] = stream

  return stream
}

export function isStream(value) {
  return typeof value === 'function' && value === value[STREAM]
}

export function of(...values) {
  return from((push) => {
    const iterator = values[Symbol.iterator]()

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
  }
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

export const unique = operator(
  (source, selector = (value) => value, flushes) => {
    const keys = new Set()

    const filteredSource = filter(source, (value) => {
      const key = selector(value)

      if (keys.has(key)) return false
      else {
        keys.add(key)

        return true
      }
    })

    return from((push) => {
      const stopFiltering = filteredSource(push)

      const stopFlushing = flushes && flushes(() => keys.clear())

      return () => {
        stopFiltering()
        stopFlushing?.()
      }
    })
  }
)

export const merge = operator(
  (source, other) => from((push) => {
    const stopSource = source(push)
    const stopOther = other(push)

    return () => {
      stopSource()
      stopOther()
    }
  })
)

export const distinct = operator(
  (source, compare = Object.is) => {
    let firstSent = false
    let previous

    return filter(source, (value) => {
      previous = value

      return firstSent ? !compare(previous, value) : firstSent = true
    })
  }
)

export default {
  of,
  is: isStream,
  map,
  from,
  scan,
  take,
  skip,
  merge,
  filter,
  unique,
  forEach,
  distinct,
  skipWhile,
  takeWhile
}