const STREAM = '@@stream'

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

export function map(source, callback) {
  return callback
    ? from((push) => source((value) => push(callback(value))))
    : (anotherSource) => map(anotherSource, source)
}

export function filter(source, callback) {
  return callback
    ? from((push) =>
        source((value) => {
          if (callback(value)) push(value)
        })
      )
    : (anotherSource) => filter(anotherSource, source)
}

export function forEach(source, callback) {
  return callback
    ? source(callback)
    : (anotherSource) => forEach(anotherSource, source)
}

export function scan(source, accumulator, reduce = accumulator) {
  return isStream(source)
    ? from((push) => {
        let created = true
        let intermediate = accumulator

        return source((value) => {
          push(
            (intermediate =
              created && intermediate === reduce
                ? value
                : reduce(intermediate, value))
          )

          if (created) created = false
        })
      })
    : (anotherSource) => scan(anotherSource, source, accumulator)
}

export function take(source, amount) {
  return isStream(source)
    ? takeWhile(source, () => amount && amount--)
    : (anotherSource) => take(anotherSource, source)
}

export function takeWhile(source, callback) {
  return callback
    ? from((push) => {
        let stop

        const clear = () => {
          stop?.()
          stop = null
        }

        stop = source((value) => (callback(value) ? push(value) : clear()))

        return clear
      })
    : (anotherSource) => takeWhile(anotherSource, source)
}

export function skip(source, amount) {
  return isStream(source)
    ? filter(source, () => !(amount && amount--))
    : (anotherSource) => skip(anotherSource, source)
}

export function skipWhile(source, callback) {
  if (callback) {
    let skipping = true

    return filter(source, (value) =>
      skipping ? !(skipping = callback(value)) : true
    )
  } else return (anotherSource) => skipWhile(anotherSource, source)
}

export function unique(source, selector, flushes) {
  if (isStream(source)) {
    const keys = new Set()

    const filteredSource = filter(source, (value) => {
      const key = selector?.(value) ?? value

      if (keys.has(key)) return false
      else {
        keys.add(key)

        return true
      }
    })

    return from((push) => {
      const stopFiltering = filteredSource(push)

      const stopFlushing = flushes?.(() => keys.clear())

      return () => {
        keys.clear()
        stopFiltering()
        stopFlushing?.()
      }
    })
  } else return (anotherSource) => unique(anotherSource, source, selector)
}

export function merge(source, other) {
  return other
    ? from((push) => {
        const stopSource = source(push)
        const stopOther = other(push)

        return () => {
          stopSource()
          stopOther()
        }
      })
    : (actualSource) => merge(actualSource, source)
}

export function distinct(source, compare = Object.is) {
  if (isStream(source)) {
    let firstSent = false
    let previous

    return filter(source, (value) => {
      previous = value

      return firstSent ? !compare(previous, value) : (firstSent = true)
    })
  } else return (anotherSource) => distinct(anotherSource, source ?? compare)
}

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
  takeWhile,
}
